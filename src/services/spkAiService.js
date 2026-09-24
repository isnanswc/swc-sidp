import { getSetting } from '@/db';
import { getAiConfig, getAiModelCandidates, recordModelSuccess, recordModelFailure } from '@/services/geminiService';

/**
 * Service Pemindaian & Ekstraksi AI Dokumen JADWAL SLITTING (3B-PROD)
 * Menganalisis gambar formulir fisik jadwal slitting secara cerdas menggunakan Google Gemini AI Vision.
 */

export function monthToRoman(m) {
  const map = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
  return map[m] || 'IX';
}

/**
 * Standarisasi Nomor SPK ke Format Penuh Baku:
 * - INHOUSE: [URUTAN 2DIGIT]/[ROMAWI]/SPK/[TAHUN] (Contoh: 04/VIII/SPK/2026)
 * - SUPPLIER LUAR: [JENIS AWAL BAHAN (CPP, VMCPP, PET, VMPET)]/[ROMAWI]/[NAMA SUPPLIER]/[TAHUN] (Contoh: CPP/IX/PANVERTA/2026)
 */
export function normalizeSpkToFullStandard(rawSpk, rowIndex = 1, scheduleDate = null, supplierName = '', jenisBahan = 'CPP') {
  let s = String(rawSpk || '').trim();
  const d = scheduleDate ? new Date(scheduleDate) : new Date();
  const defaultYear = d.getFullYear() || 2026;
  const defaultMonth = d.getMonth() + 1;
  const defaultRoman = monthToRoman(defaultMonth);

  // Cek apakah entitas berasal dari supplier luar
  const isExternalSupplier = Boolean(
    (supplierName && supplierName !== 'INHOUSE' && !supplierName.includes('SWC')) ||
    s.toUpperCase().includes('PANVERTA') ||
    s.toUpperCase().includes('BHINEKA')
  );

  if (isExternalSupplier) {
    // FORMAT STANDARD SPK SUPPLIER LUAR:
    // [JENIS AWAL BAHAN (CPP, VMCPP, PET, VMPET)]/[ROMAWI]/[NAMA SUPPLIER]/[TAHUN]
    let cleanJenis = String(jenisBahan || 'CPP').toUpperCase().trim();
    if (!['CPP', 'VMCPP', 'PET', 'VMPET'].includes(cleanJenis)) {
      if (cleanJenis.includes('VM') || cleanJenis.includes('METAL')) {
        cleanJenis = cleanJenis.includes('PET') ? 'VMPET' : 'VMCPP';
      } else if (cleanJenis.includes('PET')) {
        cleanJenis = 'PET';
      } else {
        cleanJenis = 'CPP';
      }
    }

    let cleanSupplier = (supplierName || s).toUpperCase().trim();
    if (cleanSupplier.includes('PANVERTA')) cleanSupplier = 'PANVERTA';
    else if (cleanSupplier.includes('BHINEKA')) cleanSupplier = 'BHINEKA';
    else if (!cleanSupplier || cleanSupplier === 'SUPPLIER LUAR') cleanSupplier = 'EXTERNAL';

    const match = s.match(/\/([IVXLCDM]+)(?:\/.*)?(?:\/(\d{2,4}))?/i);
    const roman = match && match[1] ? match[1].toUpperCase() : defaultRoman;
    let year = defaultYear;
    if (match && match[2]) {
      const yr = parseInt(match[2], 10);
      year = yr < 100 ? (2000 + yr) : yr;
    }

    return `${cleanJenis}/${roman}/${cleanSupplier}/${year}`;
  }

  // FORMAT STANDARD INHOUSE:
  // [URUTAN 2DIGIT]/[ROMAWI]/SPK/[TAHUN]
  if (/\bSPK\b/i.test(s) && /\d{2}\/[IVXLCDM]+\/SPK\/\d{4}/i.test(s)) {
    return s.toUpperCase();
  }

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

  const slashMatch = s.match(/^(\d+)\s*\/$/);
  if (slashMatch) {
    const seq = String(parseInt(slashMatch[1], 10)).padStart(2, '0');
    return `${seq}/I/SPK/${defaultYear}`;
  }

  const seq = String(rowIndex).padStart(2, '0');
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

/**
 * Kompres dan optimasi citra dokumen SPK ke canvas sebelum diunggah ke Google AI Vision
 * Menghindari error HTTP 400/413 Payload Too Large dan timeout pada foto resolusi tinggi
 */
export function compressBase64ForVision(dataUrlOrFile, maxDimension = 2048, quality = 0.85) {
  return new Promise(async (resolve) => {
    try {
      let dataUrl = '';
      if (dataUrlOrFile instanceof File || dataUrlOrFile instanceof Blob) {
        dataUrl = await new Promise((res, rej) => {
          const reader = new FileReader();
          reader.onload = () => res(reader.result);
          reader.onerror = rej;
          reader.readAsDataURL(dataUrlOrFile);
        });
      } else if (typeof dataUrlOrFile === 'string') {
        if (!dataUrlOrFile.startsWith('data:image/')) {
          dataUrl = `data:image/jpeg;base64,${dataUrlOrFile}`;
        } else {
          dataUrl = dataUrlOrFile;
        }
      } else {
        return resolve(dataUrlOrFile);
      }

      if (typeof window === 'undefined' || !window.Image) {
        return resolve(dataUrl);
      }

      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        const compressed = canvas.toDataURL('image/jpeg', quality);
        canvas.width = 0;
        canvas.height = 0;
        img.src = '';
        resolve(compressed);
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    } catch (e) {
      resolve(dataUrlOrFile);
    }
  });
}

export async function parseSpkDocumentImage(fileOrBase64, isCamera = false, filmConfigs = [], scheduleDate = null, onProgress = null) {
  // 1. Kompresi dan optimasi citra dokumen
  if (typeof onProgress === 'function') {
    onProgress('compress', 25, 'Mengompresi citra dokumen SPK untuk transmisi cepat...');
  }
  const compressedDataUrl = await compressBase64ForVision(fileOrBase64, 2048, 0.85);

  let base64Data = '';
  let mimeType = 'image/jpeg';

  if (typeof compressedDataUrl === 'string') {
    if (compressedDataUrl.includes(';base64,')) {
      const parts = compressedDataUrl.split(';base64,');
      mimeType = parts[0].replace('data:', '') || 'image/jpeg';
      base64Data = parts[1];
    } else {
      base64Data = compressedDataUrl;
    }
  }

  // 2. Cek API Key Gemini dari database settings
  const aiCfg = await getAiConfig();
  let geminiApiKey = (aiCfg.apiKey || '').trim();
  if (!geminiApiKey) {
    geminiApiKey = await getResolvedGeminiApiKey();
  }

  if (!geminiApiKey) {
    throw new Error('Google Gemini API Key belum terdeteksi. Silakan buka menu Pengaturan Sistem (Settings) > tab "Google Gemini Engine", masukkan API Key Anda dan klik Simpan.');
  }

  // 3. Eksekusi panggilan Vision ke Gemini dengan Smart Fallback terintegrasi database
  return await callGeminiVisionSpkParser(base64Data, geminiApiKey, mimeType, filmConfigs, scheduleDate, onProgress, aiCfg);
}

/**
 * Panggilan ke Google Gemini API Vision untuk ekstraksi dokumen fisik dengan Smart Fallback
 */
async function callGeminiVisionSpkParser(base64Data, apiKey, mimeType = 'image/jpeg', filmConfigs = [], scheduleDate = null, onProgress = null, aiCfg = {}) {
  let modelCandidates = await getAiModelCandidates();
  if (!modelCandidates || modelCandidates.length === 0) {
    modelCandidates = [
      aiCfg.selectedModel || 'gemini-2.0-flash',
      'gemini-2.0-flash-lite',
      'gemini-2.0-pro-exp-02-05'
    ].filter(m => m && !m.includes('1.') && !m.includes('2.5') && !m.includes('3.5'));
  }

  // Pastikan modelCandidates tidak ada duplikasi
  modelCandidates = modelCandidates.filter((m, i, arr) => arr.indexOf(m) === i);

  const prompt = `
Analisis dokumen formulir fisik PT. Saptawarna Cemerlang "JADWAL SLITTING (Kode: 3B-PROD)".
Dokumen ini memiliki 14 kolom tabel standar slitting:
1. No: Nomor urut pengerjaan
2. SPK: Nomor SPK (contoh: 03/IX, 05/IX, 04/VIII, 07/XII/25, PANVERTA)
3. TYPE: Kode formula/tipe film (contoh: M08, M07, M06, CMGX)
4. TEBAL: Ketebalan film dalam mikron (μ) (contoh: 20, 25, 35)
5. LEBAR: Lebar Jumbo Parent roll dalam mm (contoh: 2160, 2370, 2100, 2095)
6. PANJANG (KOLOM PANJANG PERTAMA): PANJANG JUMBO ROLL INDUK dalam meter (contoh: 29300, 16300, 12300, 36300)
7. UP 1: Lebar belahan roll anak 1 dalam mm (contoh: 1220, 1140, 1000, 920)
8. UP 2: Lebar belahan roll anak 2 dalam mm (contoh: 910, 1140, 1070, 1145)
9. UP 3: Lebar belahan roll anak 3 jika ada (atau null jika kosong)
10. UP 4: Lebar belahan roll anak 4 jika ada (atau null jika kosong)
11. PANJANG (KOLOM PANJANG KEDUA): PANJANG STANDARD ROLL FG JADI dalam meter yang harus diproses (contoh: 12000)
12. JUMLAH JR: Jumlah Jumbo Roll induk yang dialokasikan (contoh: 1, 2, 4, 7)
13. KETERANGAN: Catatan instruksi potong / posisi pisau (contoh: C1 TENGAH, C1 ATAS, REWIND, -)
14. Meter jr: Total meter jumbo roll = Panjang Jumbo × Jumlah JR (contoh: 58600, 116000, 32000, 203000, 72000)

Ekstrak tabel jadwal potong ke dalam array JSON dengan format persis berikut:
[
  {
    "no": 1,
    "spkNo": "Nomor SPK (contoh: 03/IX)",
    "formula": "Kode formula (contoh: M08)",
    "thickness": 25,
    "lebarParent": 2160,
    "panjangParent": 29300,
    "up1": 1220,
    "up2": 910,
    "up3": null,
    "up4": null,
    "panjangChild": 12000,
    "jumlahJumbo": 2,
    "keterangan": "-",
    "totalPlannedMeter": 58600
  }
]

ATURAN WAJIB & MUTLAK PPIC SLITTING:
1. ATURAN 1 BARIS = 1 SPK:
   - DILARANG KERAS MENGGABUNGKAN 2 NOMOR SPK DALAM 1 BARIS (jangan gunakan tanda "&").
   - Jika dokumen fisik menuliskan 2 nomor SPK (misal "07/XII/25 & 02/I"), Anda WAJIB memisahkannya menjadi 2 baris terpisah dalam output JSON!
   - Baris pertama untuk SPK 1 (contoh: "07/XII/25"), dan baris kedua untuk SPK 2 (contoh: "02/I").
2. ATURAN SUB-BARIS JADWAL:
   - Jika di bawah nomor urut yang sama ada sub-baris spesifikasi ukuran lain (misal di baris No 2 ada ukuran 29.300m 4 JR dan di bawahnya 16.300m 2 JR), ekstrak sebagai baris JSON terpisah dengan nomor urut yang sama atau berurutan.
3. ATURAN KOLOM DUA PANJANG:
   - Ingat: kolom PANJANG pertama (sebelum UP) adalah "panjangParent" (Jumbo).
   - Kolom PANJANG kedua (setelah UP 4) adalah "panjangChild" (Roll FG Jadi, umumnya 12000 m).
4. ATURAN REWIND (UKURAN SAMA):
   - Jika kolom UP 1..UP 4 kosong / strip "-" (karena roll induk hanya di-REWIND dengan ukuran yang sama tanpa dibelah), isi up1 = lebarParent, dan up2..up4 = null.
5. PEDOMAN ANTI-HALUSINASI MUTLAK:
   - Dilarang mengarang atau menebak data yang tidak terlihat pada dokumen fisik.
   - Ekstrak HANYA data yang benar-benar tercantum pada dokumen gambar.
   - Jika kolom atau angka tidak ada, gunakan null atau 0 sesuai skema JSON di atas.
6. Keluarkan HANYA array JSON murni tanpa pembuka/penutup markdown.
`;

  let lastError = null;

  for (let i = 0; i < modelCandidates.length; i++) {
    const modelTarget = modelCandidates[i];
    const isLast = i === modelCandidates.length - 1;
    const nextModel = !isLast ? modelCandidates[i + 1] : null;

    if (typeof onProgress === 'function') {
      const pct = Math.min(85, 45 + Math.round((i / modelCandidates.length) * 40));
      onProgress('analyzing', pct, `Menganalisis dokumen dengan ${modelTarget}...`);
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelTarget}:generateContent`;

    const abortCtrl = new AbortController();
    const timeoutId = setTimeout(() => abortCtrl.abort(), 35000); // 35s timeout per candidate

    try {
      const response = await fetch(url, {
        method: 'POST',
        signal: abortCtrl.signal,
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey.trim()
        },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              { inlineData: { mimeType, data: base64Data } }
            ]
          }],
          generationConfig: {
            temperature: 0.1,
            responseMimeType: 'application/json'
          }
        })
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        let errText = '';
        try {
          const errJson = await response.json();
          errText = errJson.error?.message || response.statusText;
        } catch {
          errText = await response.text();
        }
        console.warn(`[SPK Vision] Model ${modelTarget} returned HTTP ${response.status}: ${errText}.`);
        recordModelFailure(modelTarget, errText, response.status).catch(() => {});
        lastError = new Error(`Model ${modelTarget} (${response.status}): ${errText}`);

        if (!isLast && nextModel) {
          if (typeof onProgress === 'function') {
            onProgress('fallback', 55 + Math.round((i / modelCandidates.length) * 30), `Model ${modelTarget} terkendala (${response.status}). Beralih ke model cadangan ${nextModel}...`);
          }
          await new Promise(r => setTimeout(r, 600));
        }
        continue;
      }

      const result = await response.json();
      const text = result?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      if (!text.trim()) {
        console.warn(`[SPK Vision] Model ${modelTarget} mengembalikan output kosong. Mencoba fallback...`);
        recordModelFailure(modelTarget, 'Output respon kosong', 204).catch(() => {});
        if (!isLast && nextModel) {
          if (typeof onProgress === 'function') {
            onProgress('fallback', 55 + Math.round((i / modelCandidates.length) * 30), `Respon ${modelTarget} kosong. Beralih ke ${nextModel}...`);
          }
        }
        continue;
      }

      let cleanJson = text.replace(/```json\s*|```/g, '').trim();
      const firstBracket = cleanJson.indexOf('[');
      const lastBracket = cleanJson.lastIndexOf(']');
      if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
        cleanJson = cleanJson.substring(firstBracket, lastBracket + 1);
      }

      let parsed;
      try {
        parsed = JSON.parse(cleanJson);
      } catch (parseErr) {
        console.warn(`[SPK Vision] JSON Parse error on ${modelTarget}:`, text);
        lastError = parseErr;
        recordModelFailure(modelTarget, 'Format JSON rusak', null).catch(() => {});
        if (!isLast && nextModel) {
          if (typeof onProgress === 'function') {
            onProgress('fallback', 55 + Math.round((i / modelCandidates.length) * 30), `Format JSON ${modelTarget} rusak. Beralih ke ${nextModel}...`);
          }
        }
        continue;
      }

      // Berhasil! Rekam sebagai Sticky Winner di Cloud Database
      recordModelSuccess(modelTarget).catch(() => {});
      if (typeof onProgress === 'function') {
        onProgress('success', 92, `Berhasil diproses oleh ${modelTarget}! Menstandarisasi format SPK...`);
      }
      return postProcessExtractedRows(Array.isArray(parsed) ? parsed : [parsed], filmConfigs, scheduleDate);
    } catch (netErr) {
      clearTimeout(timeoutId);
      const isTimeout = netErr.name === 'AbortError';
      const reason = isTimeout ? 'Timeout (>35s)' : (netErr.message || 'Error');
      console.warn(`[SPK Vision] Network error on model ${modelTarget} (${reason}):`, netErr);
      recordModelFailure(modelTarget, reason, isTimeout ? 408 : null).catch(() => {});
      lastError = netErr;
      if (!isLast && nextModel) {
        if (typeof onProgress === 'function') {
          onProgress('fallback', 55 + Math.round((i / modelCandidates.length) * 30), `Koneksi ke ${modelTarget} terputus (${reason}). Beralih ke ${nextModel}...`);
        }
        await new Promise(r => setTimeout(r, 600));
      }
    }
  }

  throw lastError || new Error('Seluruh model Google Gemini Vision gagal memproses dokumen.');
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
      const rawJenis = matchedFilm?.jenis || String(raw.jenis || 'CPP').toUpperCase().trim();
      const standardSpk = normalizeSpkToFullStandard(token, executionSeq, scheduleDate, isSupplierInhouse ? '' : supplier, rawJenis);

      const lebarParent = parseFloat(raw.lebarParent) || 0;
      const panjangParent = parseFloat(raw.panjangParent) || 0;
      const panjangChild = parseFloat(raw.panjangChild) || 12000;
      const jumlahJumbo = parseInt(raw.jumlahJumbo, 10) || 1;
      const thickness = parseFloat(raw.thickness) || matchedFilm?.thickness || 25;
      const jenisFilm = matchedFilm?.jenis || String(raw.jenis || 'CPP').toUpperCase().trim();

      // Hitung berapa roll FG standar yang dihasilkan per 1 Jumbo Roll per UP
      const rollsPerJumboPerUp = (panjangParent > 0 && panjangChild > 0 && panjangParent >= panjangChild)
        ? Math.floor(panjangParent / panjangChild)
        : 1;
      const targetRollsPerUp = rollsPerJumboPerUp * jumlahJumbo;
      const sisaButtMeter = (panjangParent > 0 && panjangChild > 0)
        ? Math.max(0, panjangParent - (rollsPerJumboPerUp * panjangChild))
        : 0;

      const upList = [];
      if (raw.up1 && parseFloat(raw.up1) > 0) {
        upList.push({
          upNo: 1,
          lebar: parseFloat(raw.up1),
          panjang: panjangChild,
          rollsPerJumbo: rollsPerJumboPerUp,
          targetRolls: targetRollsPerUp
        });
      }
      if (raw.up2 && parseFloat(raw.up2) > 0) {
        upList.push({
          upNo: 2,
          lebar: parseFloat(raw.up2),
          panjang: panjangChild,
          rollsPerJumbo: rollsPerJumboPerUp,
          targetRolls: targetRollsPerUp
        });
      }
      if (raw.up3 && parseFloat(raw.up3) > 0) {
        upList.push({
          upNo: 3,
          lebar: parseFloat(raw.up3),
          panjang: panjangChild,
          rollsPerJumbo: rollsPerJumboPerUp,
          targetRolls: targetRollsPerUp
        });
      }
      if (raw.up4 && parseFloat(raw.up4) > 0) {
        upList.push({
          upNo: 4,
          lebar: parseFloat(raw.up4),
          panjang: panjangChild,
          rollsPerJumbo: rollsPerJumboPerUp,
          targetRolls: targetRollsPerUp
        });
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
          upList.push({
            upNo: 1,
            lebar: lebarParent,
            panjang: panjangChild || panjangParent || 12000,
            rollsPerJumbo: rollsPerJumboPerUp,
            targetRolls: targetRollsPerUp
          });
        }
        if (!keterangan || keterangan === '-') {
          keterangan = 'REWIND (UKURAN SAMA)';
        }
      } else {
        const sumUp = upList.reduce((sum, u) => sum + u.lebar, 0);
        trimAuto = Math.max(0, lebarParent - sumUp);
      }

      // TOTAL PLANNED METER:
      // Di form 3B-PROD, "Meter jr" adalah Total Meter Jumbo Induk = panjangParent * jumlahJumbo
      const totalPlannedMeter = (panjangParent > 0)
        ? (panjangParent * jumlahJumbo)
        : (parseFloat(raw.totalPlannedMeter) || (panjangChild * jumlahJumbo));

      const totalPlannedRolls = upList.reduce((sum, u) => sum + (u.targetRolls || jumlahJumbo), 0);

      // UKURAN JUMBO HIERARKI BAKU:
      // Format: [JENIS] [KODE FORMULA] [MICRON] MC X [WIDTH] MM (e.g. VMCPP M08 25 MC X 2160 MM)
      const ukuranJumbo = `${jenisFilm} ${rawFormula} ${thickness} MC X ${lebarParent} MM`.toUpperCase();

      resultRows.push({
        no: executionSeq,
        seq: executionSeq,
        urutanPengerjaan: executionSeq,
        spkNo: standardSpk,
        docNo: '3B-PROD',
        formula: rawFormula,
        jenis: jenisFilm,
        thickness,
        ukuranJumbo,
        lebarParent,
        panjangParent,
        up1: finalUp1,
        up2: finalUp2,
        up3: finalUp3,
        up4: finalUp4,
        panjangChild,
        rollsPerJumboPerUp,
        sisaButtMeter,
        upList,
        trimAuto,
        jumlahJumbo,
        totalPlannedRolls,
        totalPlannedMeter,
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
