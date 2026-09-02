import { getSetting, saveSetting, db } from '@/db';

export const DEFAULT_DEFECT_TAGS = [
  'Kerut',
  'Bintik',
  'Garis Pisau',
  'Tebal Tidak Rata',
  'Sambungan',
  'Kurang Panjang',
  'Afval Pinggir',
  'Sample Lab'
];

/**
 * Format No Lot secara visual dengan spasi di antara bagiannya:
 * 1. Supplier INHOUSE:
 *    Contoh: M07250526C101/F103/GC01/J101 -> M07 250526 C101 / F103 / GC01 / J101
 *    (3 karakter formula, 6 karakter tanggal batch, kode mesin/proses, lalu spasi di sekitar '/')
 * 2. Supplier Luar / Selain INHOUSE yang memiliki karakter '/':
 *    Contoh: LOT123/ABC/456 -> LOT123 / ABC / 456
 * Catatan: Aktual data tersimpan tetap tanpa spasi.
 */
export function formatLotVisual(lotStr, supplier = '') {
  if (!lotStr) return '';
  const raw = String(lotStr).replace(/\s+/g, '').toUpperCase();
  if (!raw) return '';

  const isSupplierInhouse = String(supplier || '').trim().toUpperCase() === 'INHOUSE';
  const parts = raw.split('/');

  if (isSupplierInhouse) {
    const first = parts[0];
    let formattedFirst = first;
    if (first.length >= 10) {
      formattedFirst = `${first.slice(0, 3)} ${first.slice(3, 9)} ${first.slice(9)}`;
    } else if (first.length > 3) {
      formattedFirst = `${first.slice(0, 3)} ${first.slice(3)}`;
    }
    parts[0] = formattedFirst;
    return parts.join(' / ');
  } else {
    // Non-inhouse: jika ada '/', berikan spasi di sekitar '/'
    return parts.join(' / ');
  }
}
/**
 * Auto-formatting input No. Lot khusus Inhouse:
 * - Menangani input yang salah seperti spasi, strip (-), titik, garis bawah
 * - Otomatis memberikan tanda '/' setelah terdeteksi segmen mesin
 * - Mendeteksi kode mesin 4 atau 5 karakter (diakhiri kode varian A, B, atau C)
 * Contoh:
 * - "m01260726c102 d101b ga01" -> "M01260726C102/D101B/GA01"
 * - "M01260726C102D101BGA01"   -> "M01260726C102/D101B/GA01"
 * - "M07250626C102F103"         -> "M07250626C102/F103"
 * - "M07250626C102-F103"        -> "M07250626C102/F103"
 * - "M07250626C102A F103B GC01A"-> "M07250626C102A/F103B/GC01A"
 */
export function formatInhouseLotInput(input) {
  if (!input) return '';
  let str = String(input).toUpperCase().trim();
  
  // Replace multiple slashes, dashes, spaces, commas, underscores, and dots with '/'
  str = str.replace(/[\s\-_,\.]+/g, '/');

  // Strip all non-alphanumeric except '/'
  str = str.replace(/[^A-Z0-9\/]/g, '');

  // If user pasted/typed with spaces/dashes that turned into '/', e.g. "M01/260726/C102/D101B/GA01"
  // Re-join formula + date if they were split by '/'
  const splitSlashes = str.split('/').filter(Boolean);
  if (splitSlashes.length >= 2 && splitSlashes[0].length === 3 && /^\d{6}$/.test(splitSlashes[1])) {
    str = splitSlashes[0] + splitSlashes[1] + (splitSlashes.slice(2).length > 0 ? '/' + splitSlashes.slice(2).join('/') : '');
  }

  // Check if string matches inhouse pattern (e.g. starts with 3-char formula + 6 digit date)
  const inhouseHeaderMatch = str.match(/^([A-Z][0-9A-Z]{2})(\d{6})(.*)$/);
  if (!inhouseHeaderMatch) {
    return str.replace(/\/+/g, '/');
  }

  const formula = inhouseHeaderMatch[1];
  const dateStr = inhouseHeaderMatch[2];
  let remainder = inhouseHeaderMatch[3];

  // Clean initial slashes
  remainder = remainder.replace(/^\/+/, '');

  if (!remainder) {
    return `${formula}${dateStr}`;
  }

  // Suffix is strictly [A-C] (hanya A, B, C saja)
  // Machine codes: 1-2 letters + 2-3 digits + optional single letter [A-C] (e.g. C102, C102A, D101B, F103B, GA01, GC01A)
  const segments = remainder.split('/').filter(Boolean);
  const parsedCodes = [];

  for (const seg of segments) {
    // Match machine codes in continuous string like "C102D101BGA01" or "C102AF103B"
    const matches = seg.match(/([A-Z]{1,2}\d{2,3}[A-C]?(?=[A-Z]|$)|[A-Z]{1,2}\d{1,3}|[A-Z0-9]+)/g);
    if (matches && matches.length > 0) {
      parsedCodes.push(...matches);
    } else {
      parsedCodes.push(seg);
    }
  }

  if (parsedCodes.length === 0) {
    return `${formula}${dateStr}`;
  }

  // First machine code belongs to the base casting lot (e.g. M01260726C102 or M01260726C102A)
  const baseMachine = parsedCodes[0];
  const subProcesses = parsedCodes.slice(1);

  let result = `${formula}${dateStr}${baseMachine}`;
  if (subProcesses.length > 0) {
    result += '/' + subProcesses.join('/');
  }

  return result;
}

const DEFAULT_AUTOMATION_CONFIG = {
  id: 'defect_quick_tags',
  name: 'Ekstraksi Rekomendasi Tag Cepat Defect (Hold & Reject)',
  description: 'AI membaca riwayat keterangan roll berstatus HOLD dan REJECT untuk memperbarui daftar rekomendasi tag cepat pada form label.',
  enabled: true,
  frequencyDays: 3,
  lastRun: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  nextRun: new Date().toISOString(),
  targetStatus: ['HOLD', 'REJECT'],
  tags: [...DEFAULT_DEFECT_TAGS],
  history: [
    {
      id: 'init-01',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'SUCCESS',
      scannedCount: 8,
      tagsCount: 8,
      tagsExtracted: [...DEFAULT_DEFECT_TAGS],
      method: 'Inisialisasi Sistem Standar',
      message: 'Inisialisasi awal 8 tag cepat standar manufaktur film.'
    }
  ]
};

/**
 * Mendapatkan konfigurasi otomatisasi AI saat ini
 */
export async function getAutomationConfig() {
  try {
    const config = await getSetting('ai_automation_defect_tags', null);
    if (!config) {
      await saveSetting('ai_automation_defect_tags', DEFAULT_AUTOMATION_CONFIG);
      await saveSetting('ai_quick_tags', DEFAULT_DEFECT_TAGS);
      return JSON.parse(JSON.stringify(DEFAULT_AUTOMATION_CONFIG));
    }
    return config;
  } catch (e) {
    console.error('Error reading AI automation config:', e);
    return JSON.parse(JSON.stringify(DEFAULT_AUTOMATION_CONFIG));
  }
}

/**
 * Menyimpan konfigurasi otomatisasi AI
 */
export async function saveAutomationConfig(config) {
  try {
    await saveSetting('ai_automation_defect_tags', config);
    if (config.tags && Array.isArray(config.tags)) {
      await saveSetting('ai_quick_tags', config.tags);
    }
    return true;
  } catch (e) {
    console.error('Error saving AI automation config:', e);
    return false;
  }
}

/**
 * Mendapatkan daftar tag cepat aktif untuk form
 */
export async function getActiveQuickTags() {
  try {
    const tags = await getSetting('ai_quick_tags', null);
    if (Array.isArray(tags) && tags.length > 0) {
      return tags;
    }
    const config = await getAutomationConfig();
    return config.tags || DEFAULT_DEFECT_TAGS;
  } catch {
    return DEFAULT_DEFECT_TAGS;
  }
}

/**
 * Ekstraktor lokal cerdas jika tanpa koneksi Gemini
 */
function extractDefectTagsLocally(defectTexts) {
  const commonDefects = [
    { keyword: 'kerut', tag: 'Kerut' },
    { keyword: 'bintik', tag: 'Bintik' },
    { keyword: 'garis', tag: 'Garis Pisau' },
    { keyword: 'pisau', tag: 'Garis Pisau' },
    { keyword: 'tebal', tag: 'Tebal Tidak Rata' },
    { keyword: 'rata', tag: 'Tebal Tidak Rata' },
    { keyword: 'sambung', tag: 'Sambungan' },
    { keyword: 'joint', tag: 'Sambungan' },
    { keyword: 'panjang', tag: 'Kurang Panjang' },
    { keyword: 'pendek', tag: 'Kurang Panjang' },
    { keyword: 'afval', tag: 'Afval Pinggir' },
    { keyword: 'pinggir', tag: 'Afval Pinggir' },
    { keyword: 'sobek', tag: 'Sobek Pinggir' },
    { keyword: 'putus', tag: 'Putus Gulungan' },
    { keyword: 'lab', tag: 'Sample Lab' },
    { keyword: 'test', tag: 'Test Lab' },
    { keyword: 'corona', tag: 'Corona Drop' },
    { keyword: 'dyne', tag: 'Dyne Low' },
    { keyword: 'buram', tag: 'Haze / Buram' },
    { keyword: 'kasar', tag: 'Permukaan Kasar' },
    { keyword: 'gelombang', tag: 'Gelombang' }
  ];

  const foundCounts = new Map();

  // Inisialisasi default
  for (const def of DEFAULT_DEFECT_TAGS) {
    foundCounts.set(def, 1);
  }

  for (const text of defectTexts) {
    const lower = text.toLowerCase();
    for (const item of commonDefects) {
      if (lower.includes(item.keyword)) {
        foundCounts.set(item.tag, (foundCounts.get(item.tag) || 0) + 2);
      }
    }

    // Jika ada frasa pendek spesifik (1-3 kata)
    const cleaned = text.trim();
    if (cleaned.length >= 3 && cleaned.length <= 25 && !cleaned.includes('http')) {
      const formatted = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
      foundCounts.set(formatted, (foundCounts.get(formatted) || 0) + 1);
    }
  }

  // Urutkan berdasarkan frekuensi tertinggi
  const sorted = Array.from(foundCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(entry => entry[0]);

  return sorted.slice(0, 10);
}

/**
 * Menjalankan Analisis AI untuk merekomendasikan daftar tag cepat defect
 */
export async function runDefectTagAnalysis(force = false) {
  const config = await getAutomationConfig();
  if (!config.enabled && !force) {
    return { success: false, message: 'Otomatisasi AI dinonaktifkan.' };
  }

  try {
    // 1. Ambil data label berstatus HOLD / REJECT
    let labels = [];
    try {
      labels = await db.labels.toArray();
    } catch {
      labels = [];
    }

    const defectLabels = labels.filter(l => {
      const st = String(l.status || '').toUpperCase();
      const sk = String(l.subKode || '').toUpperCase();
      return st === 'HOLD' || st === 'REJECT' || sk === 'REJECT' || sk === '0000' || sk.includes('HOLD');
    });

    const defectTexts = defectLabels
      .map(l => (l.keterangan || '').trim())
      .filter(t => t.length > 1);

    const apiKey = await getSetting('gemini_api_key', '');
    const model = await getSetting('gemini_model', 'gemini-2.0-flash');

    let extractedTags = [];
    let methodUsed = 'Analisis Pola Lokal NLP';

    // 2. Jika API Key tersedia & ada teks keterangan, gunakan Google Gemini AI
    if (apiKey && apiKey.trim().length > 10 && defectTexts.length > 0) {
      try {
        const prompt = `Anda adalah asisten AI Quality Assurance untuk pabrik film plastik (CPP/BOPP).
Berikut adalah catatan/keterangan kerusakan (HOLD & REJECT) asli dari operator produksi di lapangan:
${JSON.stringify(defectTexts.slice(-60), null, 2)}

Tugas:
Analisis dan rangkum menjadi 8-10 kata kunci singkat (Quick Tag Defect) yang paling sering muncul & paling berguna untuk tombol klik cepat operator.
Aturan:
- Tiap tag maksimal 2-3 kata (contoh: "Kerut", "Bintik", "Garis Pisau", "Tebal Tidak Rata", "Sambungan", "Kurang Panjang", "Afval Pinggir", "Sample Lab", "Dyne Low", "Sobek").
- Gunakan bahasa Indonesia baku / istilah pabrik yang umum.
- Kembalikan HANYA format JSON Array murni: ["Tag 1", "Tag 2", ...] tanpa markdown atau penjelasan tambahan.`;

        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': apiKey.trim()
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.2, maxOutputTokens: 500 }
          })
        });

        if (response.ok) {
          const resData = await response.json();
          const rawText = resData.candidates?.[0]?.content?.parts?.[0]?.text || '';
          const cleanedText = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
          try {
            const parsed = JSON.parse(cleanedText);
            if (Array.isArray(parsed) && parsed.length > 0) {
              extractedTags = parsed.map(t => String(t).trim()).filter(Boolean);
              methodUsed = `Google Gemini (${model})`;
            }
          } catch (parseErr) {
            console.warn('Gagal mem-parse tag JSON dari Gemini:', parseErr);
          }
        }
      } catch (geminiErr) {
        console.warn('Gemini AI execution fallback to local NLP:', geminiErr);
      }
    }

    // 3. Fallback jika AI gagal atau tanpa koneksi
    if (!extractedTags || extractedTags.length === 0) {
      extractedTags = extractDefectTagsLocally(defectTexts);
      methodUsed = defectTexts.length > 0 ? 'Analisis Pola Lokal NLP' : 'Preset Standar Manufaktur';
    }

    // Pastikan tidak ada duplikat & maksimal 10 tag
    const uniqueTags = Array.from(new Set([...extractedTags, ...DEFAULT_DEFECT_TAGS])).slice(0, 10);

    const now = new Date();
    const nextRunDate = new Date(now.getTime() + (config.frequencyDays || 3) * 24 * 60 * 60 * 1000);

    const historyRecord = {
      id: `run-${Date.now()}`,
      timestamp: now.toISOString(),
      status: 'SUCCESS',
      scannedCount: defectLabels.length,
      tagsCount: uniqueTags.length,
      tagsExtracted: uniqueTags,
      method: methodUsed,
      message: `Berhasil memindai ${defectLabels.length} data HOLD/REJECT (${defectTexts.length} keterangan). Menghasilkan ${uniqueTags.length} rekomendasi tag aktif.`
    };

    config.tags = uniqueTags;
    config.lastRun = now.toISOString();
    config.nextRun = nextRunDate.toISOString();
    config.history = [historyRecord, ...(config.history || [])].slice(0, 30);

    await saveAutomationConfig(config);

    return {
      success: true,
      message: historyRecord.message,
      tags: uniqueTags,
      history: historyRecord
    };
  } catch (err) {
    console.error('Error running AI defect tag analysis:', err);
    return { success: false, message: `Gagal menjalankan analisis AI: ${err.message}` };
  }
}

/**
 * Pemeriksaan terjadwal otomatis di background (dipanggil saat mount)
 */
export async function checkAndRunScheduledAutomation() {
  try {
    const config = await getAutomationConfig();
    if (!config.enabled) return;

    const now = Date.now();
    const lastRunTime = config.lastRun ? new Date(config.lastRun).getTime() : 0;
    const intervalMs = (config.frequencyDays || 3) * 24 * 60 * 60 * 1000;

    if (now - lastRunTime >= intervalMs) {
      console.log('⚡ [AI Automation] Menjalankan pembaruan terjadwal rekomendasi tag cepat defect...');
      await runDefectTagAnalysis(false);
    }
  } catch (e) {
    console.warn('Scheduled AI automation check skipped:', e);
  }
}
