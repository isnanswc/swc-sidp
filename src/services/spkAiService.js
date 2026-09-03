import { getSetting } from '@/db';

/**
 * Service Pemindaian & Ekstraksi AI Dokumen JADWAL SLITTING (3B-PROD)
 * Menganalisis gambar formulir fisik jadwal slitting secara cerdas menggunakan Google Gemini AI Vision.
 */

export function monthToRoman(m) {
  const map = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
  return map[m] || 'IX';
}

/**
 * Standarisasi Nomor SPK ke Format Penuh Baku: [URUTAN 2DIGIT]/[ROMAWI]/SPK/[TAHUN]
 * Berlaku untuk Inhouse maupun Supplier Luar
 */
export function normalizeSpkToFullStandard(rawSpk, rowIndex = 1, scheduleDate = null, supplierName = '') {
  let s = String(rawSpk || '').trim();
  const d = scheduleDate ? new Date(scheduleDate) : new Date();
  const defaultYear = d.getFullYear() || 2026;
  const defaultMonth = d.getMonth() + 1;
  const defaultRoman = monthToRoman(defaultMonth);

  // Jika sudah memiliki format lengkap /SPK/
  if (/\bSPK\b/i.test(s)) {
    return s.toUpperCase();
  }

  // Pola Inhouse: [Urutan]/[Romawi](/[Tahun])? contoh: 04/VIII, 07/VI, 07/XII/25, 01/IX
  const regex = /^(\d+)\s*\/\s*([IVXLCDM]+)(?:\s*\/\s*(\d{2,4}))?$/i;
  const match = s.match(regex);

  if (match) {
    const seq = String(parseInt(match[1], 10)).padStart(2, '0');
    const roman = match[2].toUpperCase();
    let year = defaultYear;
    if (match[3]) {
      const yr = parseInt(match[3], 10);
      year = yr < 100 ? (2000 + yr) : yr;
    }
    return `${seq}/${roman}/SPK/${year}`;
  }

  // Jika terpotong di akhir dengan slash misal "02/"
  const slashMatch = s.match(/^(\d+)\s*\/$/);
  if (slashMatch) {
    const seq = String(parseInt(slashMatch[1], 10)).padStart(2, '0');
    return `${seq}/I/SPK/${defaultYear}`;
  }

  // Format Supplier Luar / Nama Eksternal (misal: "PANVERTA")
  const seq = String(rowIndex).padStart(2, '0');
  const sup = (supplierName || s).toUpperCase().trim();
  if (sup && sup !== 'INHOUSE' && !sup.includes('SWC')) {
    return `${seq}/${defaultRoman}/SPK/${defaultYear}/${sup}`;
  }

  return `${seq}/${defaultRoman}/SPK/${defaultYear}`;
}

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

export async function parseSpkDocumentImage(fileOrBase64, isCamera = false, filmConfigs = [], scheduleDate = null) {
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
  return await callGeminiVisionSpkParser(base64Data, geminiApiKey, mimeType, filmConfigs, scheduleDate);
}

/**
 * Panggilan ke Google Gemini API Vision untuk ekstraksi dokumen fisik
 */
async function callGeminiVisionSpkParser(base64Data, apiKey, mimeType = 'image/jpeg', filmConfigs = [], scheduleDate = null) {
  let modelTarget = await getSetting('google_ai_model');
  if (!modelTarget) modelTarget = await getSetting('gemini_model');
  if (!modelTarget || modelTarget === '__custom__') modelTarget = 'gemini-2.0-flash';

  const prompt = `
Analisis dokumen formulir fisik PT. Saptawarna Cemerlang "JADWAL SLITTING (Kode: 3B-PROD)".
Ekstrak tabel jadwal potong ke dalam array JSON dengan format persis berikut:
[
  {
    "no": 1,
    "spkNo": "Nomor SPK (contoh: 04/VIII, 07/XII/25, 02/I, 07/VI, 01/IX, PANVERTA)",
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

ATURAN WAJIB & MUTLAK PPIC SLITTING:
1. ATURAN 1 BARIS = 1 SPK:
   - DILARANG KERAS MENGGABUNGKAN 2 NOMOR SPK DALAM 1 BARIS (jangan gunakan tanda "&").
   - Jika dokumen fisik menuliskan 2 nomor SPK (misal "07/XII/25 & 02/I"), Anda WAJIB memisahkannya menjadi 2 baris terpisah dalam output JSON!
   - Baris pertama untuk SPK 1 (contoh: "07/XII/25"), dan baris kedua untuk SPK 2 (contoh: "02/I").
2. ATURAN URUTAN PENGERJAAN:
   - Urutan baris JSON harus persis sesuai urutan pengerjaan pada lembar jadwal, dari baris paling atas ke baris paling bawah.
3. ATURAN REWIND (UKURAN SAMA):
   - Jika kolom UP 1..UP 4 kosong / strip "-" (karena roll induk hanya di-REWIND dengan ukuran yang sama tanpa dibelah), isi up1 = lebarParent, dan up2..up4 = null.
4. Keluarkan HANYA array JSON murni tanpa pembuka/penutup markdown.
`;

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

  return postProcessExtractedRows(Array.isArray(parsed) ? parsed : [parsed], filmConfigs, scheduleDate);
}

/**
 * Normalisasi, Pemecahan Multi-SPK menjadi 1 Baris 1 SPK, dan Format Standar Penuh
 */
export function postProcessExtractedRows(rawRows, filmConfigs = [], scheduleDate = null) {
  const resultRows = [];
  let executionSeq = 1;

  for (const raw of (rawRows || [])) {
    const rawSpkText = String(raw.spkNo || '').trim();
    const rawFormula = String(raw.formula || 'M07').toUpperCase().trim();

    // Deteksi Supplier via Data Configuration
    const matchedFilm = (filmConfigs || []).find(f => 
      String(f.kodeFormula || '').toUpperCase().trim() === rawFormula ||
      String(f.alias || '').toUpperCase().trim() === rawFormula
    );

    let supplier = 'INHOUSE (PT. SWC)';
    let isSupplierInhouse = true;

    if (matchedFilm && matchedFilm.supplier) {
      const sUpper = String(matchedFilm.supplier).toUpperCase().trim();
      if (sUpper.includes('INHOUSE') || sUpper.includes('SWC') || sUpper === 'PT. SWC') {
        supplier = 'INHOUSE (PT. SWC)';
        isSupplierInhouse = true;
      } else {
        supplier = sUpper;
        isSupplierInhouse = false;
      }
    } else {
      const uSpk = rawSpkText.toUpperCase();
      if (uSpk.includes('PANVERTA') || rawFormula.includes('CMGX') || rawFormula.startsWith('EXT')) {
        supplier = uSpk.includes('PANVERTA') ? 'PANVERTA' : 'SUPPLIER LUAR';
        isSupplierInhouse = false;
      }
    }

    // ATURAN MUTLAK: 1 BARIS HANYA BOLEH 1 SPK!
    // Jika ada tanda "&" atau multiple SPK dalam 1 baris, PECAH menjadi baris terpisah!
    const spkTokens = rawSpkText.includes('&')
      ? rawSpkText.split('&').map(s => s.trim()).filter(Boolean)
      : [rawSpkText];

    for (let tokenIdx = 0; tokenIdx < spkTokens.length; tokenIdx++) {
      const token = spkTokens[tokenIdx];
      const standardSpk = normalizeSpkToFullStandard(token, executionSeq, scheduleDate, isSupplierInhouse ? '' : supplier);

      const lebarParent = parseFloat(raw.lebarParent) || 0;
      const upList = [];

      if (raw.up1 && parseFloat(raw.up1) > 0) {
        upList.push({ upNo: 1, lebar: parseFloat(raw.up1), panjang: parseFloat(raw.panjangChild) || 12000 });
      }
      if (raw.up2 && parseFloat(raw.up2) > 0) {
        upList.push({ upNo: 2, lebar: parseFloat(raw.up2), panjang: parseFloat(raw.panjangChild) || 12000 });
      }
      if (raw.up3 && parseFloat(raw.up3) > 0) {
        upList.push({ upNo: 3, lebar: parseFloat(raw.up3), panjang: parseFloat(raw.panjangChild) || 12000 });
      }
      if (raw.up4 && parseFloat(raw.up4) > 0) {
        upList.push({ upNo: 4, lebar: parseFloat(raw.up4), panjang: parseFloat(raw.panjangChild) || 12000 });
      }

      // ATURAN REWIND (UKURAN SAMA):
      // Jika parent tidak memiliki UP atau chart pada plan, barang di-rewind dengan ukuran yang sama
      let finalUp1 = raw.up1 ? parseFloat(raw.up1) : null;
      let finalUp2 = raw.up2 ? parseFloat(raw.up2) : null;
      let finalUp3 = raw.up3 ? parseFloat(raw.up3) : null;
      let finalUp4 = raw.up4 ? parseFloat(raw.up4) : null;
      let trimAuto = 0;
      let keterangan = raw.keterangan ? String(raw.keterangan).trim() : '';

      if (upList.length === 0 || (upList.length === 1 && upList[0].lebar === lebarParent)) {
        finalUp1 = lebarParent;
        finalUp2 = null;
        finalUp3 = null;
        finalUp4 = null;
        trimAuto = 0;
        if (upList.length === 0) {
          upList.push({ upNo: 1, lebar: lebarParent, panjang: parseFloat(raw.panjangParent) || parseFloat(raw.panjangChild) || 12000 });
        }
        if (!keterangan || keterangan === '-') {
          keterangan = 'REWIND (UKURAN SAMA)';
        }
      } else {
        const sumUp = upList.reduce((sum, u) => sum + u.lebar, 0);
        trimAuto = Math.max(0, lebarParent - sumUp);
      }

      const jumlahJumbo = parseInt(raw.jumlahJumbo, 10) || 1;
      const totalPlannedRolls = upList.length * jumlahJumbo;

      resultRows.push({
        no: executionSeq,
        seq: executionSeq,
        urutanPengerjaan: executionSeq,
        spkNo: standardSpk,
        docNo: '3B-PROD',
        formula: rawFormula,
        jenis: matchedFilm?.jenis || String(raw.jenis || 'CPP').toUpperCase().trim(),
        thickness: parseFloat(raw.thickness) || matchedFilm?.thickness || 25,
        lebarParent,
        panjangParent: parseFloat(raw.panjangParent) || 0,
        up1: finalUp1,
        up2: finalUp2,
        up3: finalUp3,
        up4: finalUp4,
        panjangChild: parseFloat(raw.panjangChild) || 12000,
        upList,
        trimAuto,
        jumlahJumbo,
        totalPlannedRolls,
        totalPlannedMeter: parseFloat(raw.totalPlannedMeter) || ((parseFloat(raw.panjangChild) || 12000) * jumlahJumbo),
        keterangan,
        supplier,
        isSupplierInhouse,
        formatStandard: isSupplierInhouse ? 'INHOUSE' : 'SUPPLIER_LUAR',
        status: 'PLANNED',
        isValidated: true
      });

      executionSeq++;
    }
  }

  return resultRows;
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
