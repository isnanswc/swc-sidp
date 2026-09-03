import { getSetting } from '@/db';

/**
 * Service Pemindaian & Ekstraksi AI Dokumen JADWAL SLITTING (3B-PROD)
 * Menganalisis gambar formulir fisik jadwal slitting secara cerdas menggunakan Google Gemini AI Vision.
 */

// Helper robust untuk mengambil API Key Google AI / Gemini dari berbagai kemungkinan setting
export async function getResolvedGeminiApiKey() {
  const candidateKeys = [
    'google_ai_api_key',
    'gemini_api_key',
    'google_api_key',
    'apiKey'
  ];

  // 1. Cek dari IndexedDB settings via getSetting
  for (const k of candidateKeys) {
    try {
      const val = await getSetting(k);
      if (val && typeof val === 'string' && val.trim().length > 5) {
        return val.trim();
      }
    } catch (e) {}
  }

  // 2. Cek langsung dari LocalStorage (dengan dan tanpa prefix)
  for (const k of candidateKeys) {
    const rawKeys = [`mlabel_setting_${k}`, k];
    for (const rk of rawKeys) {
      try {
        const raw = localStorage.getItem(rk);
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            if (parsed && typeof parsed === 'string' && parsed.trim().length > 5) {
              return parsed.trim();
            }
          } catch (pe) {
            if (raw.trim().length > 5) return raw.trim();
          }
        }
      } catch (e) {}
    }
  }

  return '';
}

export async function parseSpkDocumentImage(fileOrBase64, isCamera = false) {
  // 1. Dapatkan base64 string
  let base64Data = '';
  let mimeType = 'image/jpeg';

  if (typeof fileOrBase64 === 'string') {
    if (fileOrBase64.includes(';base64,')) {
      const parts = fileOrBase64.split(';base64,');
      mimeType = parts[0].replace('data:', '') || 'image/jpeg';
      base64Data = parts[1];
    } else {
      base64Data = fileOrBase64;
    }
  } else if (fileOrBase64 instanceof File || fileOrBase64 instanceof Blob) {
    mimeType = fileOrBase64.type || 'image/jpeg';
    base64Data = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const res = reader.result;
        resolve(res.includes(',') ? res.split(',')[1] : res);
      };
      reader.onerror = reject;
      reader.readAsDataURL(fileOrBase64);
    });
  }

  // 2. Cek API Key Gemini dari seluruh kemungkinan konfigurasi
  const geminiApiKey = await getResolvedGeminiApiKey();

  if (!geminiApiKey) {
    throw new Error('Google Gemini API Key belum terdeteksi. Silakan buka menu Pengaturan Sistem (Settings) > tab "Google Gemini Engine", masukkan API Key Anda dan klik Simpan.');
  }

  // 3. Eksekusi panggilan Vision ke Gemini
  return await callGeminiVisionSpkParser(base64Data, geminiApiKey, mimeType);
}

/**
 * Panggilan ke Google Gemini API Vision untuk ekstraksi dokumen fisik
 */
async function callGeminiVisionSpkParser(base64Data, apiKey, mimeType = 'image/jpeg') {
  // Ambil model yang dikonfigurasi di Settings (default gemini-2.0-flash yang stabil)
  let modelTarget = await getSetting('google_ai_model');
  if (!modelTarget) modelTarget = await getSetting('gemini_model');
  if (!modelTarget || modelTarget === '__custom__') modelTarget = 'gemini-2.0-flash';

  const prompt = `
Analisis dokumen fisik formulir PT. Saptawarna Cemerlang dengan judul "JADWAL SLITTING (Kode: 3B-PROD)".
Ekstrak tabel jadwal potong ke dalam array JSON dengan format persis berikut:
[
  {
    "no": 1,
    "spkNo": "Nomor SPK (contoh: 04/VIII, 07/XII/25 & 02/I, 01/IX, PANVERTA)",
    "formula": "Kode formula (contoh: M07, M06, CMGX)",
    "thickness": 35,
    "lebarParent": 2320,
    "panjangParent": 19300,
    "up1": 1145,
    "up2": 1145,
    "up3": null,
    "up4": null,
    "panjangChild": 12000,
    "jumlahJumbo": 2,
    "keterangan": "C1 TENGAH / C1 ATAS / -",
    "totalPlannedMeter": 240000
  }
]

Petunjuk Ekstraksi:
1. Kolom SPK bisa memuat lebih dari satu nomor SPK dalam satu baris (misal "07/XII/25 & 02/I"), catat keduanya dengan pemisah "&".
2. Nilai UP 1, UP 2, UP 3, UP 4 adalah lebar potongan child roll dalam mm. Jika kosong atau tanda strip "-", isi dengan null.
3. Nilai TEBAL dalam mikron (angka), LEBAR parent dalam mm (angka), PANJANG parent dalam meter (angka).
4. JUMLAH JR adalah jumlah Jumbo Roll.
5. Keluarkan HANYA format JSON valid tanpa teks pengantar.
`;

  // Gunakan header resmi x-goog-api-key
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelTarget}:generateContent`;
  
  let response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey.trim()
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            { inline_data: { mime_type: mimeType, data: base64Data } }
          ]
        }],
        generationConfig: {
          temperature: 0.1,
          response_mime_type: 'application/json'
        }
      })
    });
  } catch (netErr) {
    throw new Error('Gagal menghubungi server Google Gemini: ' + netErr.message);
  }

  if (!response.ok) {
    let errText = '';
    try {
      const errJson = await response.json();
      errText = errJson.error?.message || response.statusText;
    } catch (e) {
      errText = await response.text();
    }
    throw new Error(`Google Gemini Error (${response.status}): ${errText}`);
  }

  const result = await response.json();
  const text = result?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  if (!text.trim()) {
    throw new Error('Google Gemini merespons dengan hasil kosong.');
  }

  const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
  let parsed;
  try {
    parsed = JSON.parse(cleanJson);
  } catch (parseErr) {
    console.error('JSON Parse error on Gemini output:', text);
    throw new Error('Gagal mengurai output JSON dari Gemini: ' + parseErr.message);
  }

  return postProcessExtractedRows(Array.isArray(parsed) ? parsed : [parsed]);
}

/**
 * Normalisasi dan penghitungan otomatis trim sisa setelah ekstraksi
 */
export function postProcessExtractedRows(rawRows) {
  return (rawRows || []).map((row, idx) => {
    const lebarParent = parseFloat(row.lebarParent) || 0;
    const upList = [];

    if (row.up1 && parseFloat(row.up1) > 0) {
      upList.push({ upNo: 1, lebar: parseFloat(row.up1), panjang: parseFloat(row.panjangChild) || 12000 });
    }
    if (row.up2 && parseFloat(row.up2) > 0) {
      upList.push({ upNo: 2, lebar: parseFloat(row.up2), panjang: parseFloat(row.panjangChild) || 12000 });
    }
    if (row.up3 && parseFloat(row.up3) > 0) {
      upList.push({ upNo: 3, lebar: parseFloat(row.up3), panjang: parseFloat(row.panjangChild) || 12000 });
    }
    if (row.up4 && parseFloat(row.up4) > 0) {
      upList.push({ upNo: 4, lebar: parseFloat(row.up4), panjang: parseFloat(row.panjangChild) || 12000 });
    }

    const sumUp = upList.reduce((sum, u) => sum + u.lebar, 0);
    const trimAuto = Math.max(0, lebarParent - sumUp);
    const jumlahJumbo = parseInt(row.jumlahJumbo, 10) || 1;
    const totalPlannedRolls = upList.length * jumlahJumbo;

    return {
      no: row.no || (idx + 1),
      spkNo: String(row.spkNo || '').trim(),
      docNo: '3B-PROD',
      formula: String(row.formula || 'M07').toUpperCase().trim(),
      jenis: String(row.jenis || 'CPP').toUpperCase().trim(),
      thickness: parseFloat(row.thickness) || 25,
      lebarParent,
      panjangParent: parseFloat(row.panjangParent) || 0,
      up1: row.up1 || null,
      up2: row.up2 || null,
      up3: row.up3 || null,
      up4: row.up4 || null,
      panjangChild: parseFloat(row.panjangChild) || 12000,
      upList,
      trimAuto,
      jumlahJumbo,
      totalPlannedRolls,
      totalPlannedMeter: parseFloat(row.totalPlannedMeter) || ((parseFloat(row.panjangChild) || 12000) * jumlahJumbo),
      keterangan: row.keterangan || '',
      status: 'PLANNED',
      isValidated: true
    };
  });
}

/**
 * Detektor Perbedaan Revisi Antara Data Lama dan Data Baru
 */
export function detectSpkRevisionsDiff(oldItem, newItem) {
  const diffs = [];
  const fieldsToCheck = [
    { key: 'spkNo', label: 'Nomor SPK' },
    { key: 'formula', label: 'Formula' },
    { key: 'thickness', label: 'Ketebalan (μ)' },
    { key: 'lebarParent', label: 'Lebar Parent (mm)' },
    { key: 'panjangParent', label: 'Panjang Parent (m)' },
    { key: 'jumlahJumbo', label: 'Jumlah Jumbo' },
    { key: 'totalPlannedMeter', label: 'Total Meter JR' },
    { key: 'keterangan', label: 'Keterangan' }
  ];

  fieldsToCheck.forEach(f => {
    if (String(oldItem[f.key] || '').trim() !== String(newItem[f.key] || '').trim()) {
      diffs.push({
        field: f.key,
        label: f.label,
        oldValue: oldItem[f.key],
        newValue: newItem[f.key]
      });
    }
  });

  return diffs;
}
