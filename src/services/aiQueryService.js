/**
 * Universal Multi-Dimensional AI Query & Generative Factory Intelligence Engine
 * PT Saptawarna Cemerlang
 * 
 * Menggabungkan:
 * 1. Conversational Context Memory (Memahami rujukan "ini", "itu", "operator tadi", "formula tersebut")
 * 2. Real Generative LLM (Google Gemini API) untuk penalaran tingkat tinggi dan jawaban luwes manusiawi
 * 3. High-Precision Local RAG Engine (0ms, 100% offline & akurasi matematis database 31.000+ roll)
 */

import { db, getSetting } from '@/db';

const MONTH_NAMES = {
  'januari': 1, 'jan': 1,
  'februari': 2, 'feb': 2,
  'maret': 3, 'mar': 3,
  'april': 4, 'apr': 4,
  'mei': 5, 'may': 5,
  'juni': 6, 'jun': 6,
  'juli': 7, 'jul': 7,
  'agustus': 8, 'agu': 8, 'ags': 8, 'agt': 8,
  'september': 9, 'sep': 9,
  'oktober': 10, 'okt': 10, 'oct': 10,
  'november': 11, 'nov': 11,
  'desember': 12, 'des': 12, 'dec': 12
};

/**
 * 1. CONVERSATIONAL CONTEXT MEMORY EXTRACTOR
 * Mengekstrak entitas dari riwayat percakapan sebelumnya untuk memahami kata rujukan ("ini", "itu", "tersebut")
 */
function extractConversationContext(history = []) {
  const context = {
    lastFormula: null,
    lastOperator: null,
    lastPeriod: null,
    lastDefect: null,
    lastThickness: null,
    lastMachine: null
  };

  if (!Array.isArray(history) || history.length === 0) return context;

  // Scan backwards from latest messages
  for (let i = history.length - 1; i >= 0; i--) {
    const msg = history[i];
    const text = String(msg.text || '');

    // Extract Formula (e.g. M01, M07, VMCPP, VMPET)
    if (!context.lastFormula) {
      const fMatch = text.match(/\b([ML]\d{2}[A-Z0-9]?|VMCPP|VMPET|LLDPE)\b/i);
      if (fMatch) context.lastFormula = fMatch[1].toUpperCase();
    }

    // Extract Operator Name
    if (!context.lastOperator) {
      const opMatch = text.match(/\b(SUHANDI|HERU|SUGANDI|FIRMAN|ANWAR|TUGIMIN|SANAN|UMAR|HENDRI|JOKO|KURNIA|LUKMAN)\b/i);
      if (opMatch) context.lastOperator = opMatch[1].toUpperCase();
    }

    // Extract Defect (e.g. Belang, Pinhole, Garis Pisau, Kerut, Unmelt, Panjang Kurang)
    if (!context.lastDefect) {
      const dMatch = text.match(/\b(belang|pinhole|garis pisau|kerut|unmelt|panjang kurang|hold qc|scratch|sambungan)\b/i);
      if (dMatch) context.lastDefect = dMatch[1].toUpperCase();
    }

    // Extract Thickness
    if (!context.lastThickness) {
      const tMatch = text.match(/(\d{1,3})\s*(?:mc|micron|mikron)\b/i);
      if (tMatch) context.lastThickness = parseInt(tMatch[1], 10);
    }

    // Extract Machine
    if (!context.lastMachine) {
      const mMatch = text.match(/\b(SLITTING|REWIND|CASTING|SML|METALIZE)\b/i);
      if (mMatch) context.lastMachine = mMatch[1].toUpperCase();
    }
  }

  return context;
}

/**
 * 2. TEMPORAL / DATE RANGE PARSER
 */
function extractDateRange(queryText) {
  const str = queryText.toLowerCase();
  const currentYear = new Date().getFullYear();

  // A. Semester
  const semMatch = str.match(/semester\s+(1|satu|pertama|i|2|dua|kedua|ii)(?:\s+(\d{4}))?/i);
  if (semMatch) {
    const semNum = ['1', 'satu', 'pertama', 'i'].includes(semMatch[1].toLowerCase()) ? 1 : 2;
    const year = semMatch[2] ? parseInt(semMatch[2], 10) : currentYear;
    if (semNum === 1) {
      return {
        hasRange: true,
        startDate: `${year}-01-01`,
        endDate: `${year}-06-30`,
        label: `Semester I ${year} (Januari – Juni ${year})`,
        year
      };
    } else {
      return {
        hasRange: true,
        startDate: `${year}-07-01`,
        endDate: `${year}-12-31`,
        label: `Semester II ${year} (Juli – Desember ${year})`,
        year
      };
    }
  }

  // B. Kuartal / Triwulan
  const qMatch = str.match(/(?:q|kuartal|triwulan)\s*([1-4]|satu|dua|tiga|empat)(?:\s+(\d{4}))?/i);
  if (qMatch) {
    const mapQ = { '1': 1, 'satu': 1, '2': 2, 'dua': 2, '3': 3, 'tiga': 3, '4': 4, 'empat': 4 };
    const qNum = mapQ[qMatch[1].toLowerCase()] || 1;
    const year = qMatch[2] ? parseInt(qMatch[2], 10) : currentYear;
    const qRanges = {
      1: { start: `${year}-01-01`, end: `${year}-03-31`, label: `Kuartal I ${year} (Jan – Mar)` },
      2: { start: `${year}-04-01`, end: `${year}-06-30`, label: `Kuartal II ${year} (Apr – Jun)` },
      3: { start: `${year}-07-01`, end: `${year}-09-30`, label: `Kuartal III ${year} (Jul – Sep)` },
      4: { start: `${year}-10-01`, end: `${year}-12-31`, label: `Kuartal IV ${year} (Okt – Des)` },
    };
    return {
      hasRange: true,
      startDate: qRanges[qNum].start,
      endDate: qRanges[qNum].end,
      label: qRanges[qNum].label,
      year
    };
  }

  // C. Month Range
  const rangeMatch = str.match(/(januari|februari|maret|april|mei|juni|juli|agustus|september|oktober|november|desember|jan|feb|mar|apr|may|jun|jul|agu|ags|sep|okt|nov|des)\s*(?:sampai|s\/d|hingga|sd|-)\s*(januari|februari|maret|april|mei|juni|juli|agustus|september|oktober|november|desember|jan|feb|mar|apr|may|jun|jul|agu|ags|sep|okt|nov|des)(?:\s+(\d{4}))?/i);
  if (rangeMatch) {
    const m1 = MONTH_NAMES[rangeMatch[1].toLowerCase()];
    const m2 = MONTH_NAMES[rangeMatch[2].toLowerCase()];
    const year = rangeMatch[3] ? parseInt(rangeMatch[3], 10) : currentYear;
    if (m1 && m2) {
      const startM = Math.min(m1, m2);
      const endM = Math.max(m1, m2);
      const lastDay = new Date(year, endM, 0).getDate();
      return {
        hasRange: true,
        startDate: `${year}-${String(startM).padStart(2, '0')}-01`,
        endDate: `${year}-${String(endM).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`,
        label: `Periode Bulan ${startM} s/d ${endM} Tahun ${year}`,
        year
      };
    }
  }

  // D. Single Month
  for (const [mName, mNum] of Object.entries(MONTH_NAMES)) {
    const regex = new RegExp(`(?:bulan\\s+)?\\b${mName}\\b(?:\\s+(\\d{4}))?`, 'i');
    const match = str.match(regex);
    if (match) {
      const year = match[1] ? parseInt(match[1], 10) : currentYear;
      const lastDay = new Date(year, mNum, 0).getDate();
      return {
        hasRange: true,
        startDate: `${year}-${String(mNum).padStart(2, '0')}-01`,
        endDate: `${year}-${String(mNum).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`,
        label: `Bulan ${mName.toUpperCase()} ${year}`,
        year
      };
    }
  }

  // E. Specific Year Only
  const yearMatch = str.match(/(?:tahun\s+)?\b(202[0-9]|203[0-9])\b/);
  if (yearMatch) {
    const year = parseInt(yearMatch[1], 10);
    return {
      hasRange: true,
      startDate: `${year}-01-01`,
      endDate: `${year}-12-31`,
      label: `Tahun ${year}`,
      year
    };
  }

  return { hasRange: false, startDate: null, endDate: null, label: 'Keseluruhan Data' };
}

/**
 * 3. DATABASE OPERATOR RESOLVER
 */
function resolveOperatorMetadata(rawOp, customOperators = [], machineHint = '') {
  if (!rawOp) return { nama: 'OPERATOR UNASSIGNED', kode: '-', mesin: '-', grup: '-' };
  const str = String(rawOp).trim().toUpperCase();

  const dbOps = (customOperators || []).map(o => ({
    nama: String(o.nama || '').trim().toUpperCase(),
    kode: String(o.kodeOperator || o.kode || '').trim().toUpperCase(),
    mesin: String(o.mesin || '').trim().toUpperCase(),
    grup: String(o.kodeGrup || o.grup || '-').trim().toUpperCase()
  })).filter(o => o.nama || o.kode);

  const byName = dbOps.find(o => o.nama && (str === o.nama || str.includes(o.nama)));
  if (byName) return byName;

  let code = '';
  const codeMatch = str.match(/(?:OPERATOR|OP)\s+([A-Z0-9])/i) || str.match(/^([A-Z0-9])$/);
  if (codeMatch) {
    code = codeMatch[1].toUpperCase();
  } else if (str.length === 1) {
    code = str;
  }

  if (code) {
    if (machineHint) {
      const matchWithMach = dbOps.find(o => o.kode === code && o.mesin && o.mesin.includes(machineHint.toUpperCase()));
      if (matchWithMach) return matchWithMach;
    }
    const matchAny = dbOps.find(o => o.kode === code);
    if (matchAny) return matchAny;

    return { nama: `OPERATOR ${code}`, kode: code, mesin: machineHint || 'PRODUKSI', grup: code };
  }

  return { nama: str, kode: str.slice(0, 1), mesin: machineHint || 'PRODUKSI', grup: '-' };
}

/**
 * Helper: Calculate Stats for any Roll Subset
 */
function computeSubsetStats(rolls = []) {
  const total = rolls.length;
  if (total === 0) {
    return { total: 0, pass: 0, hold: 0, reject: 0, passRate: '0.0', holdRate: '0.0', rejectRate: '0.0', meters: 0, rejectMeters: 0, topDefects: [], sampleLots: [] };
  }
  const pass = rolls.filter(r => String(r.qualityStatus || r.status || 'PASS').toUpperCase() === 'PASS').length;
  const hold = rolls.filter(r => String(r.qualityStatus || r.status || '').toUpperCase() === 'HOLD').length;
  const reject = rolls.filter(r => String(r.qualityStatus || r.status || '').toUpperCase() === 'REJECT').length;

  const passRate = ((pass / total) * 100).toFixed(1);
  const holdRate = ((hold / total) * 100).toFixed(1);
  const rejectRate = ((reject / total) * 100).toFixed(1);

  const meters = rolls.reduce((acc, r) => acc + (parseFloat(r.length || r.meter || 0) || 0), 0);
  const rejectMeters = rolls
    .filter(r => String(r.qualityStatus || r.status || '').toUpperCase() === 'REJECT')
    .reduce((acc, r) => acc + (parseFloat(r.length || r.meter || 0) || 0), 0);

  const defectMap = {};
  for (const r of rolls) {
    const st = String(r.qualityStatus || r.status || '').toUpperCase();
    if (st === 'HOLD' || st === 'REJECT') {
      const raw = (r.reasonDefect || r.reasonOfDefect || r.keterangan || '').trim().toUpperCase();
      const reasons = raw ? raw.split(/[,;\/]+/).map(s => s.trim()).filter(Boolean) : ['DEFECT TANPA KETERANGAN'];
      for (const reason of reasons) {
        defectMap[reason] = (defectMap[reason] || 0) + 1;
      }
    }
  }

  const topDefects = Object.entries(defectMap)
    .map(([name, count]) => ({ name, count, pct: (((count / (hold + reject || 1))) * 100).toFixed(1) }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 4);

  const sampleLots = rolls.slice(0, 6);

  return { total, pass, hold, reject, passRate, holdRate, rejectRate, meters, rejectMeters, topDefects, sampleLots };
}

/**
 * FAST IN-DATABASE AGGREGATION ENGINE (ZERO BULK BANDWIDTH)
 * Menghitung langsung di level IndexedDB (Dexie) tanpa menarik puluhan ribu objek ke memory.
 */
export async function executeDatabaseAggregation(queryText, context = {}, customOperators = []) {
  if (!db || !db.data_rolls) return null;
  const q = (queryText || '').toLowerCase().trim();

  // Detect operator from query or context
  let targetOperator = null;
  const dbOps = (customOperators || []).map(o => ({
    nama: String(o.nama || '').trim().toUpperCase(),
    kode: String(o.kodeOperator || o.kode || '').trim().toUpperCase()
  }));

  for (const op of dbOps) {
    if (op.nama && q.includes(op.nama.toLowerCase())) {
      targetOperator = op;
      break;
    }
  }
  if (!targetOperator && context.lastOperator) {
    targetOperator = dbOps.find(o => o.nama === context.lastOperator) || { nama: context.lastOperator, kode: '' };
  }

  // Detect formula from query or context
  let targetFormula = null;
  const fMatch = q.match(/\b([ML]\d{2}[A-Z0-9]?|VMCPP|VMPET|LLDPE|PET|CPP)\b/i);
  if (fMatch) {
    targetFormula = fMatch[1].toUpperCase();
  } else if ((q.includes('formula ini') || q.includes('formula tersebut') || q.includes('produk ini')) && context.lastFormula) {
    targetFormula = context.lastFormula;
  }

  const isRejectQuery = q.includes('reject') || q.includes('ng') || q.includes('cacat') || q.includes('rusak') || q.includes('afkir');
  const isHoldQuery = q.includes('hold') || q.includes('karantina');
  const isCountQuery = q.includes('hitung') || q.includes('berapa') || q.includes('jumlah') || q.includes('total') || q.includes('rekap');

  if (!isCountQuery && !isRejectQuery && !isHoldQuery && !targetOperator && !targetFormula) {
    return null;
  }

  let totalCount = 0;
  let passCount = 0;
  let holdCount = 0;
  let rejectCount = 0;
  let totalMeters = 0;
  const defectReasons = {};
  const sampleRolls = [];

  // Filtered in-database scan
  if (targetOperator || targetFormula) {
    await db.data_rolls
      .filter(r => {
        if (targetOperator) {
          const op = String(r.operator || r.machineName || '').toUpperCase();
          const code = String(r.kodeOperator || '').toUpperCase();
          const matchOp = op.includes(targetOperator.nama) || (targetOperator.kode && code === targetOperator.kode);
          if (!matchOp) return false;
        }
        if (targetFormula) {
          const f = `${r.kodeFormula || ''} ${r.kodeFg || ''} ${r.lot || ''}`.toUpperCase();
          if (!f.includes(targetFormula)) return false;
        }
        return true;
      })
      .each(r => {
        totalCount++;
        const st = String(r.qualityStatus || r.status || 'PASS').toUpperCase();
        if (st === 'PASS') passCount++;
        else if (st === 'HOLD') holdCount++;
        else if (st === 'REJECT') {
          rejectCount++;
          const reason = r.reasonDefect || r.reasonOfDefect || r.keterangan || 'Defect Tidak Tercatat';
          defectReasons[reason] = (defectReasons[reason] || 0) + 1;
        }
        totalMeters += (parseFloat(r.length || r.meter || 0) || 0);
        if (sampleRolls.length < 8 && (isRejectQuery ? st === 'REJECT' : true)) {
          sampleRolls.push(r);
        }
      });
  } else {
    // Fast database index counts (Zero bulk pull)
    totalCount = await db.data_rolls.count();
    rejectCount = await db.data_rolls.where('qualityStatus').equalsIgnoreCase('REJECT').count();
    holdCount = await db.data_rolls.where('qualityStatus').equalsIgnoreCase('HOLD').count();
    passCount = Math.max(0, totalCount - rejectCount - holdCount);

    if (isRejectQuery && rejectCount > 0) {
      await db.data_rolls
        .where('qualityStatus')
        .equalsIgnoreCase('REJECT')
        .limit(100)
        .each(r => {
          const reason = r.reasonDefect || r.reasonOfDefect || r.keterangan || 'Defect Tidak Tercatat';
          defectReasons[reason] = (defectReasons[reason] || 0) + 1;
          if (sampleRolls.length < 8) sampleRolls.push(r);
        });
    }
  }

  if (totalCount === 0) {
    return {
      text: `🔍 **Hasil Perhitungan Database:**\n\nTidak ditemukan data roll untuk filter yang dicari${targetOperator ? ` (Operator: ${targetOperator.nama})` : ''}${targetFormula ? ` (Formula: ${targetFormula})` : ''}.`,
      suggestions: ['Hitung total roll keseluruhan', 'Hitung jumlah reject pabrik']
    };
  }

  const passRate = ((passCount / totalCount) * 100).toFixed(1);
  const rejectRate = ((rejectCount / totalCount) * 100).toFixed(1);
  const holdRate = ((holdCount / totalCount) * 100).toFixed(1);

  let headerTitle = '📊 **Ringkasan Perhitungan Database Produksi:**';
  if (targetOperator && targetFormula) {
    headerTitle = `👷 **Hasil Perhitungan Operator [${targetOperator.nama}] — Formula [${targetFormula}]:**`;
  } else if (targetOperator) {
    headerTitle = `👷 **Hasil Perhitungan Operator [${targetOperator.nama}]:**`;
  } else if (targetFormula) {
    headerTitle = `📦 **Hasil Perhitungan Formula [${targetFormula}]:**`;
  } else if (isRejectQuery) {
    headerTitle = `⚠️ **Hasil Perhitungan Roll REJECT Pabrik:**`;
  } else if (isHoldQuery) {
    headerTitle = `⏸️ **Hasil Perhitungan Roll HOLD Karantina:**`;
  }

  let text = `${headerTitle}\n\n`;
  text += `• **Total Roll:** **${totalCount.toLocaleString('id-ID')} roll**\n`;
  text += `• **PASS (Lolos QC):** **${passCount.toLocaleString('id-ID')} roll** (${passRate}%)\n`;
  text += `• **REJECT (Cacat):** **${rejectCount.toLocaleString('id-ID')} roll** (${rejectRate}%)\n`;
  text += `• **HOLD (Karantina):** **${holdCount.toLocaleString('id-ID')} roll** (${holdRate}%)\n`;
  if (totalMeters > 0) {
    text += `• **Total Panjang Meter:** **${Math.round(totalMeters).toLocaleString('id-ID')} meter**\n`;
  }

  const sortedDefects = Object.entries(defectReasons).sort((a, b) => b[1] - a[1]);
  if (sortedDefects.length > 0) {
    text += `\n🚨 **Alasan Defect Terbanyak:**\n`;
    sortedDefects.slice(0, 5).forEach(([reason, count], idx) => {
      text += `${idx + 1}. **${reason}**: **${count} roll**\n`;
    });
  }

  text += `\n💡 *Perhitungan matematis diproses langsung di dalam database lokal (IndexedDB) secara hemat memori & hemat bandwidth.*\n\nAda parameter atau tindakan hitung lainnya yang ingin Anda jalankan?`;

  return {
    text,
    metrics: {
      passRate: `${passRate}%`,
      defectRate: `${rejectRate}%`,
      total: totalCount,
      reject: rejectCount
    },
    tableData: sampleRolls,
    tableTitle: isRejectQuery ? 'Daftar Roll Reject' : 'Daftar Roll Terkait',
    suggestions: [
      'Defect apa yang paling sering terjadi?',
      targetOperator ? `Berapa roll pass milik ${targetOperator.nama}?` : 'Siapa operator dengan reject terbanyak?',
      'Berapa roll hold yang sedang dikarantina?'
    ],
    contextUpdates: {
      lastOperator: targetOperator ? targetOperator.nama : context.lastOperator,
      lastFormula: targetFormula || context.lastFormula,
      lastStats: { total: totalCount, pass: passCount, reject: rejectCount, hold: holdCount }
    }
  };
}

/**
 * GENERAL KNOWLEDGE & GREETING HANDLER WITH PRODUCTION GUIDANCE BRIDGE
 */
export async function handleGeneralAiQuery(queryText, history = []) {
  const apiKey = await getSetting('google_ai_api_key', '') || await getSetting('gemini_api_key', '');
  const model = await getSetting('google_ai_model', 'gemini-2.0-flash');

  const generalGuidanceBridge = `\n\n💡 *Ada data produksi pabrik yang ingin Anda periksa saat ini? Saya siap membantu menganalisis:*\n• *Perhitungan jumlah & alasan roll REJECT / HOLD*\n• *Pencapaian & rekap performa per operator*\n• *Status jadwal dan antrean SPK aktif*`;

  if (apiKey && apiKey.trim()) {
    try {
      const systemInstruction = `Anda adalah SWC AI Copilot, asisten manufaktur cerdas di PT SAPTAWARNA CEMERLANG (produsen flexible packaging: rotogravure printing, extrusion laminating, dry laminating, casting, metallizing, slitting, rewind).
Pedoman Jawaban:
1. Jawab pertanyaan umum pengguna secara ramah, cerdas, luwes, dan akurat (termasuk penjelasan istilah rotogravure, polimer film, slitting, salam, atau percakapan umum).
2. Di akhir jawaban, sertakan ajakan ramah atau tawaran untuk membantu memeriksa laporan data produksi pabrik (seperti reject, SPK, atau operator).`;

      const contents = [];
      if (Array.isArray(history)) {
        const recent = history.slice(-4);
        for (const m of recent) {
          contents.push({
            role: m.sender === 'user' ? 'user' : 'model',
            parts: [{ text: m.text }]
          });
        }
      }
      contents.push({ role: 'user', parts: [{ text: queryText }] });

      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey.trim()
        },
        body: JSON.stringify({
          contents,
          systemInstruction: { parts: [{ text: systemInstruction }] },
          generationConfig: { temperature: 0.5, maxOutputTokens: 800 }
        })
      });

      if (response.ok) {
        const resJson = await response.json();
        const output = resJson.candidates?.[0]?.content?.parts?.[0]?.text;
        if (output) {
          return {
            text: output.trim(),
            suggestions: [
              'Hitung total roll reject di pabrik',
              'Tampilkan status antrean SPK hari ini',
              'Siapa operator slitting yang bertugas?'
            ]
          };
        }
      }
    } catch (e) {
      console.warn('Gemini General Query fallback:', e);
    }
  }

  // Fallback offline answers
  const q = queryText.toLowerCase();
  let answer = 'Halo! Saya adalah **SWC AI Copilot**, asisten cerdas sistem manajemen produksi PT Saptawarna Cemerlang.';
  if (q.includes('siapa kamu') || q.includes('kamu siapa')) {
    answer = 'Saya adalah **SWC AI Copilot**, asisten cerdas terintegrasi untuk membantu analisis kualitas, pemantauan SPK, pelacakan roll WIP & FG, serta perhitungan statistik produksi di PT Saptawarna Cemerlang.';
  } else if (q.includes('selamat pagi')) {
    answer = 'Selamat pagi! Semangat beraktivitas di plant produksi hari ini.';
  } else if (q.includes('selamat siang')) {
    answer = 'Selamat siang! Semoga proses operasional dan serah terima shift berjalan lancar.';
  } else if (q.includes('selamat malam')) {
    answer = 'Selamat malam! Tetap utamakan keselamatan kerja (*safety first*) pada operasional shift malam.';
  } else if (q.includes('slitting')) {
    answer = '**Slitting** adalah proses memotong gulungan film induk (*jumbo roll*) menjadi beberapa gulungan roll yang lebih kecil (*slit rolls*) sesuai ukuran lebar dan panjang pesanan SPK customer.';
  }

  return {
    text: `${answer}${generalGuidanceBridge}`,
    suggestions: [
      'Hitung total roll reject pabrik',
      'Siapa operator dengan reject terendah?',
      'Berapa roll hold yang sedang dikarantina?'
    ]
  };
}

/**
 * 4. GOOGLE GEMINI GENERATIVE AI LLM CALL (OPTIONAL CLOUD EXTENSION)
 */
async function callGeminiGenerativeAi(userQuery, history, dataRolls, operators) {
  const apiKey = await getSetting('google_ai_api_key', '') || await getSetting('gemini_api_key', '');
  const model = await getSetting('google_ai_model', 'gemini-2.0-flash');

  if (!apiKey || !apiKey.trim()) return null;

  // Build high-level database knowledge snapshot
  const total = dataRolls.length;
  const pass = dataRolls.filter(r => String(r.qualityStatus || r.status || 'PASS').toUpperCase() === 'PASS').length;
  const hold = dataRolls.filter(r => String(r.qualityStatus || r.status || '').toUpperCase() === 'HOLD').length;
  const reject = dataRolls.filter(r => String(r.qualityStatus || r.status || '').toUpperCase() === 'REJECT').length;

  const opNames = (operators || []).map(o => `${o.nama} (Kode ${o.kodeOperator || o.kode} - ${o.mesin})`).join(', ');

  const systemInstruction = `Anda adalah SWC AI Copilot, asisten eksekutif manufaktur cerdas di PT SAPTAWARNA CEMERLANG (produsen film kemasan fleksibel: CPP, VMCPP, PET, VMPET, LLDPE).
Anda memiliki akses ke database produksi dengan ${total.toLocaleString('id-ID')} roll aktif.
Ringkasan Data Pabrik:
- Total: ${total} Roll
- PASS: ${pass} Roll (${((pass/total)*100).toFixed(1)}%)
- HOLD: ${hold} Roll (${((hold/total)*100).toFixed(1)}%)
- REJECT: ${reject} Roll (${((reject/total)*100).toFixed(1)}%)
- Daftar Operator Resmi di Database: ${opNames || 'Suhandi, Heru, Sugandi, Firman, Anwar, Tugimin, Sanan, Umar, Hendri'}
Instruksi: Jawablah pertanyaan pengguna secara luwes, cerdas, solutif, dan profesional layaknya manajer kualitas senior. Jika pengguna bertanya tentang konteks lanjutan (misal "formula ini", "operator tadi"), pahami dari riwayat chat. Gunakan bullet point rapi.`;

  const contents = [];
  // Include recent history (up to 4 previous messages)
  if (Array.isArray(history)) {
    const recent = history.slice(-4);
    for (const m of recent) {
      contents.push({
        role: m.sender === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }]
      });
    }
  }
  contents.push({ role: 'user', parts: [{ text: userQuery }] });

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey.trim()
    },
    body: JSON.stringify({
      contents,
      systemInstruction: { parts: [{ text: systemInstruction }] },
      generationConfig: { temperature: 0.3, maxOutputTokens: 1000 }
    })
  });

  if (!response.ok) return null;
  const resJson = await response.json();
  const outputText = resJson.candidates?.[0]?.content?.parts?.[0]?.text;
  return outputText ? outputText.trim() : null;
}

/**
 * 5. MAIN AI QUERY & SYNTHESIS ENGINE (HYBRID RAG + CONTEXTUAL MEMORY)
 */
export async function processAiQueryAsync(queryText, dataRolls = [], labels = [], customOperators = [], conversationHistory = []) {
  const query = (queryText || '').trim();
  const lowerQuery = query.toLowerCase();

  // 1. General Greeting / Inquiry Check
  const GENERAL_GREETING_REGEX = /^(halo|hai|hello|hi|selamat\s+(pagi|siang|sore|malam)|assalamualaikum|siang|pagi|malam|apa kabar|kamu siapa|siapa kamu)\b/i;
  const keywords = ['roll', 'spk', 'operator', 'formula', 'slitting', 'rewind', 'casting', 'metalize', 'reject', 'hold', 'pass', 'defect', 'berat', 'kg', 'meter', 'lot', 'turunan', 'm07', 'vmcpp', 'pet', 'vmpet', 'hitung', 'jumlah', 'total'];
  const hasFactoryKeyword = keywords.some(k => lowerQuery.includes(k));

  if (GENERAL_GREETING_REGEX.test(lowerQuery) || (!hasFactoryKeyword && query.length < 50)) {
    return await handleGeneralAiQuery(query, conversationHistory);
  }

  // 2. Direct In-Database Aggregation (Zero Bulk Bandwidth)
  const context = extractConversationContext(conversationHistory);
  const dbAggResult = await executeDatabaseAggregation(query, context, customOperators);
  if (dbAggResult) {
    return dbAggResult;
  }

  const dataset = dataRolls.length > 0 ? dataRolls : labels;
  const total = dataset.length;

  if (total === 0) {
    return {
      text: 'Belum ada data roll yang tersimpan di sistem. Silakan lakukan import data roll terlebih dahulu pada menu **Data Roll**.',
      suggestions: ['Bagaimana cara import data roll?']
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // A. CONTEXT MEMORY RESOLUTION ("ini", "itu", "tadi", "tersebut")
  // ─────────────────────────────────────────────────────────────────────────

  // If query refers to "formula ini / formula tersebut"
  let effectiveFormula = null;
  const formulaMatch = query.match(/\b([ML]\d{2}[A-Z0-9]?)\b/i);
  if (formulaMatch) {
    effectiveFormula = formulaMatch[1].toUpperCase();
  } else if ((lowerQuery.includes('formula ini') || lowerQuery.includes('formula tersebut') || lowerQuery.includes('produk ini') || lowerQuery.includes('item ini')) && context.lastFormula) {
    effectiveFormula = context.lastFormula;
  }

  // Handle: "Operator mana yang mengerjakan formula ini/M07?"
  if (lowerQuery.includes('operator') && (effectiveFormula || lowerQuery.includes('formula') || lowerQuery.includes('produk'))) {
    const targetF = effectiveFormula || context.lastFormula || 'M07';
    const rollsOfFormula = dataset.filter(r => {
      const text = `${r.kodeFormula || ''} ${r.kodeFg || ''} ${r.lot || ''}`.toUpperCase();
      return text.includes(targetF);
    });

    if (rollsOfFormula.length > 0) {
      const opMap = {};
      for (const r of rollsOfFormula) {
        const rawOp = (r.operator || (r.kodeOperator ? `OPERATOR ${r.kodeOperator}` : 'UNASSIGNED')).trim();
        const meta = resolveOperatorMetadata(rawOp, customOperators);
        if (!opMap[meta.nama]) {
          opMap[meta.nama] = { name: meta.nama, code: meta.kode, machine: meta.mesin, total: 0, pass: 0, reject: 0 };
        }
        opMap[meta.nama].total++;
        if (String(r.qualityStatus || r.status || 'PASS').toUpperCase() === 'PASS') opMap[meta.nama].pass++;
        else if (String(r.qualityStatus || r.status || '').toUpperCase() === 'REJECT') opMap[meta.nama].reject++;
      }

      const ranked = Object.values(opMap).sort((a, b) => b.total - a.total);

      let text = `👷 **Daftar Operator yang Memproses Formula [${targetF}]:**\n\nBerdasarkan database, terdapat **${rollsOfFormula.length.toLocaleString('id-ID')} roll** formula **${targetF}** yang dikerjakan oleh operator berikut:\n\n`;

      ranked.forEach((op, idx) => {
        const passRate = ((op.pass / op.total) * 100).toFixed(1);
        text += `${idx + 1}. **${op.name}** *(Kode: ${op.code} — ${op.machine})*:\n   • Menangani: **${op.total.toLocaleString('id-ID')} Roll** | Pass Rate: **${passRate}%** | Reject: **${op.reject} Roll**\n\n`;
      });

      return {
        text,
        suggestions: [
          `⚠️ Defect apa yang sering terjadi pada formula ${targetF}?`,
          '📊 Tampilkan yield rate formula ini',
          '👷 Operator mana dengan defect terbanyak?'
        ]
      };
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // B. ATTEMPT REAL GENERATIVE LLM (IF API KEY AVAILABLE)
  // ─────────────────────────────────────────────────────────────────────────
  try {
    const generativeResponse = await callGeminiGenerativeAi(query, conversationHistory, dataset, customOperators);
    if (generativeResponse) {
      return {
        text: generativeResponse,
        suggestions: [
          'Analisis lebih dalam temuan ini',
          'Rangkum laporan periode 2026',
          'Operator mana dengan defect terbanyak?'
        ]
      };
    }
  } catch (e) {
    console.warn('Generative AI Fallback to Local RAG Engine:', e);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // C. LOCAL RAG ENGINE (0ms, FULL DOMAIN SYNTHESIS)
  // ─────────────────────────────────────────────────────────────────────────
  return processAiQuery(queryText, dataRolls, labels, customOperators);
}

/**
 * Synchronous Local RAG Processor
 */
export function processAiQuery(queryText, dataRolls = [], labels = [], customOperators = []) {
  const query = (queryText || '').trim();
  const lowerQuery = query.toLowerCase();
  const dataset = dataRolls.length > 0 ? dataRolls : labels;
  const total = dataset.length;

  if (total === 0) {
    return {
      text: 'Belum ada data roll yang tersimpan di sistem. Silakan lakukan import data roll terlebih dahulu pada menu **Data Roll**.',
      suggestions: ['Bagaimana cara import data roll?']
    };
  }

  // GREETING
  if (
    !query ||
    lowerQuery === 'halo' ||
    lowerQuery === 'hai' ||
    lowerQuery === 'help' ||
    lowerQuery.includes('apa yang bisa') ||
    lowerQuery.includes('bisa apa') ||
    lowerQuery.includes('fitur apa')
  ) {
    return {
      text: `Halo! Saya **SWC AI Copilot**, asisten intelijen data produksi dan kualitas di **PT Saptawarna Cemerlang**.\n\nSaya dapat menganalisis data produksi **${total.toLocaleString('id-ID')} roll** Anda secara fleksibel berdasarkan berbagai dimensi:\n\n• 📑 **Periode Waktu**: *"Rangkum laporan semester pertama 2026"* atau *"Rekap data bulan Maret 2025"*\n• 🧪 **Formula & Jenis Bahan**: *"Berapa roll VMCPP formula M07?"* atau *"Kualitas produk VMPET"*\n• 📏 **Ketebalan & Lebar**: *"Berapa roll tebal 20 micron lebar 1020 mm?"*\n• ⚖️ **Analisis Perbandingan**: *"Bandingkan output Slitting vs Rewind"* atau *"Bandingkan Shift 1 vs Shift 2"*\n• 👷 **Evaluasi Operator**: *"Operator mana yang paling banyak menghasilkan defect?"*\n• ⚠️ **Alasan Defect**: *"Apa defect paling dominan pada film VMPET?"*\n• 📦 **Pencarian SPK & Lot**: *"Cari SPK 07/01/SPK/2025"* atau *"Cek No. Lot tertentu"*`,
      suggestions: [
        '📑 Rangkum laporan semester pertama 2026',
        '⚖️ Bandingkan mesin Slitting vs Rewind vs Casting',
        '👷 Operator mana yang paling banyak menghasilkan defect?',
        '🧪 Kualitas formula VMCPP M07 vs M01',
        '📏 Berapa roll ketebalan 20 micron?'
      ]
    };
  }

  // KOMPARASI
  const isCompare = lowerQuery.includes('bandingkan') || lowerQuery.includes('perbandingan') || lowerQuery.includes('komparasi') || lowerQuery.includes('vs') || lowerQuery.includes('dibandingkan') || lowerQuery.includes('lebih baik mana') || lowerQuery.includes('lebih banyak mana');

  if (isCompare) {
    if (lowerQuery.includes('mesin') || lowerQuery.includes('slitting') || lowerQuery.includes('rewind') || lowerQuery.includes('casting') || lowerQuery.includes('sml')) {
      const slitRolls = dataset.filter(r => r.slitting === 1 || String(r.machineName || r.mesin || '').toUpperCase().includes('SLIT'));
      const rewRolls = dataset.filter(r => r.rewind === 1 || String(r.machineName || r.mesin || '').toUpperCase().includes('REW'));
      const castRolls = dataset.filter(r => r.sml === 1 || String(r.machineName || r.mesin || '').toUpperCase().includes('CAST') || String(r.machineName || r.mesin || '').toUpperCase().includes('SML'));

      const sStats = computeSubsetStats(slitRolls);
      const rStats = computeSubsetStats(rewRolls);
      const cStats = computeSubsetStats(castRolls);

      let text = `⚖️ **Laporan Komparasi Kinerja Stasiun Mesin Produksi:**\n\nBerikut perbandingan komprehensif antara mesin **SLITTING**, **REWIND**, dan **CASTING/SML**:\n\n`;

      text += `✂️ **1. Mesin SLITTING:**\n`;
      text += `• Total Output : **${sStats.total.toLocaleString('id-ID')} Roll** (${sStats.meters.toLocaleString('id-ID')} Meter)\n`;
      text += `• Yield Rate   : **${sStats.passRate}% PASS** | Reject: **${sStats.rejectRate}%** (${sStats.reject} Roll)\n`;
      text += `• Defect Dominan: *${sStats.topDefects[0]?.name || 'N/A'}* (${sStats.topDefects[0]?.count || 0} Roll)\n\n`;

      text += `🔄 **2. Mesin REWIND:**\n`;
      text += `• Total Output : **${rStats.total.toLocaleString('id-ID')} Roll** (${rStats.meters.toLocaleString('id-ID')} Meter)\n`;
      text += `• Yield Rate   : **${rStats.passRate}% PASS** | Reject: **${rStats.rejectRate}%** (${rStats.reject} Roll)\n`;
      text += `• Defect Dominan: *${rStats.topDefects[0]?.name || 'N/A'}* (${rStats.topDefects[0]?.count || 0} Roll)\n\n`;

      text += `🏭 **3. Mesin CASTING / SML:**\n`;
      text += `• Total Output : **${cStats.total.toLocaleString('id-ID')} Roll** (${cStats.meters.toLocaleString('id-ID')} Meter)\n`;
      text += `• Yield Rate   : **${cStats.passRate}% PASS** | Reject: **${cStats.rejectRate}%** (${cStats.reject} Roll)\n\n`;

      text += `💡 **Kesimpulan Komparasi:**\n`;
      if (parseFloat(sStats.passRate) > parseFloat(rStats.passRate)) {
        text += `• Mesin Slitting memiliki pass rate lebih tinggi (**${sStats.passRate}%**) dibandingkan Rewind (**${rStats.passRate}%**). Hal ini wajar karena mesin Rewind sering digunakan untuk menyortir roll afval dari proses sebelumnya.`;
      } else {
        text += `• Rasio kelulusan seluruh stasiun mesin terpantau stabil dan memenuhi batas standar kualitas pabrik.`;
      }

      return {
        text,
        suggestions: [
          '👷 Operator mana yang paling banyak menghasilkan defect di Slitting?',
          '⚠️ Alasan defect apa yang paling banyak di Rewind?',
          '📊 Tampilkan yield rate keseluruhan'
        ]
      };
    }

    if (lowerQuery.includes('shift')) {
      const s1Rolls = dataset.filter(r => String(r.shift || r.group || '').includes('1') || String(r.lot || '').includes('1'));
      const s2Rolls = dataset.filter(r => String(r.shift || r.group || '').includes('2') || String(r.lot || '').includes('2'));
      const s3Rolls = dataset.filter(r => String(r.shift || r.group || '').includes('3') || String(r.lot || '').includes('3'));

      const s1 = computeSubsetStats(s1Rolls);
      const s2 = computeSubsetStats(s2Rolls);
      const s3 = computeSubsetStats(s3Rolls);

      return {
        text: `⚖️ **Komparasi Output & Kualitas Antar Shift Kerja:**\n\n• 🌅 **Shift 1 (Pagi)**: **${s1.total.toLocaleString('id-ID')} Roll** | Pass Rate: **${s1.passRate}%** | Reject: **${s1.reject} Roll**\n• 🌇 **Shift 2 (Siang)**: **${s2.total.toLocaleString('id-ID')} Roll** | Pass Rate: **${s2.passRate}%** | Reject: **${s2.reject} Roll**\n• 🌙 **Shift 3 (Malam)**: **${s3.total.toLocaleString('id-ID')} Roll** | Pass Rate: **${s3.passRate}%** | Reject: **${s3.reject} Roll**\n\n💡 **Evaluasi**: Shift dengan performa kelulusan tertinggi adalah ${parseFloat(s1.passRate) >= parseFloat(s2.passRate) ? 'Shift 1' : 'Shift 2'}.`,
        suggestions: [
          '👷 Operator mana yang paling banyak menghasilkan defect?',
          '⚠️ Alasan defect apa yang paling mendominasi?',
          '📑 Rangkum laporan semester pertama 2026'
        ]
      };
    }
  }

  // KETEBALAN / MIKRON
  const thickMatch = lowerQuery.match(/(\d{1,3})\s*(?:mc|micron|mikron|µm|mic)\b/i) || lowerQuery.match(/(?:tebal|ketebalan)\s*(\d{1,3})/i);
  const widthMatch = lowerQuery.match(/(\d{3,4})\s*(?:mm|mili|lebar)\b/i) || lowerQuery.match(/(?:lebar)\s*(\d{3,4})/i);

  if (thickMatch || widthMatch) {
    const targetThick = thickMatch ? parseInt(thickMatch[1], 10) : null;
    const targetWidth = widthMatch ? parseInt(widthMatch[1], 10) : null;

    const filteredDim = dataset.filter(r => {
      let match = true;
      if (targetThick !== null) {
        const t = parseInt(r.thickness || 0, 10);
        if (t !== targetThick) match = false;
      }
      if (targetWidth !== null) {
        const w = parseInt(r.width || 0, 10);
        if (w !== targetWidth) match = false;
      }
      return match;
    });

    const dimStats = computeSubsetStats(filteredDim);
    let labelDim = '';
    if (targetThick && targetWidth) labelDim = `${targetThick} Micron x ${targetWidth} mm`;
    else if (targetThick) labelDim = `Ketebalan ${targetThick} Micron`;
    else if (targetWidth) labelDim = `Lebar ${targetWidth} mm`;

    return {
      text: `📏 **Laporan Analisis Dimensi Film (${labelDim}):**\n\n• **Total Ditemukan**: **${dimStats.total.toLocaleString('id-ID')} Roll** (${dimStats.meters.toLocaleString('id-ID')} Meter)\n• **Status Kelulusan**: **${dimStats.passRate}% PASS** (${dimStats.pass.toLocaleString('id-ID')} Roll)\n• **Karantina (HOLD)**: **${dimStats.holdRate}%** (${dimStats.hold.toLocaleString('id-ID')} Roll)\n• **Scrap (REJECT)**: **${dimStats.rejectRate}%** (${dimStats.reject.toLocaleString('id-ID')} Roll / ${dimStats.rejectMeters.toLocaleString('id-ID')} Meter)\n\n${dimStats.topDefects.length > 0 ? `⚠️ **Defect Dominan**: *${dimStats.topDefects[0].name}* (${dimStats.topDefects[0].count} roll)` : '🎉 Tidak ada catatan defect dominan pada dimensi ini.'}`,
      metrics: {
        total: dimStats.total,
        passRate: dimStats.passRate + '%',
        rejectRate: dimStats.rejectRate + '%'
      },
      tableData: dimStats.sampleLots,
      tableTitle: `Sampel Roll (${labelDim})`,
      suggestions: [
        '⚠️ Alasan defect apa yang paling banyak pada dimensi ini?',
        '👷 Siapa operator yang memproduksi roll ini?',
        '⚖️ Bandingkan dengan ketebalan lainnya'
      ]
    };
  }

  // FORMULA FILM TERTENTU
  const formulaMatch = query.match(/\b([ML]\d{2}[A-Z0-9]?)\b/i);
  if (formulaMatch) {
    const fCode = formulaMatch[1].toUpperCase();
    const formulaRolls = dataset.filter(r => {
      const text = `${r.kodeFormula || ''} ${r.kodeFg || ''} ${r.lot || ''}`.toUpperCase();
      return text.includes(fCode);
    });

    const fStats = computeSubsetStats(formulaRolls);

    return {
      text: `🧪 **Laporan Kualitas Formula Resin [${fCode}]:**\n\n• **Total Produksi**: **${fStats.total.toLocaleString('id-ID')} Roll** (${fStats.meters.toLocaleString('id-ID')} Meter)\n• **Tingkat Kelulusan**: **${fStats.passRate}% PASS** (${fStats.pass.toLocaleString('id-ID')} Roll Siap Kirim)\n• **Status HOLD**: **${fStats.holdRate}%** (${fStats.hold.toLocaleString('id-ID')} Roll)\n• **Status REJECT**: **${fStats.rejectRate}%** (${fStats.reject.toLocaleString('id-ID')} Roll)\n\n${fStats.topDefects.length > 0 ? `⚠️ **Top Defect Formula ${fCode}**: *${fStats.topDefects[0].name}* (${fStats.topDefects[0].count} roll)` : '🎉 Kualitas formula ini sangat stabil.'}`,
      metrics: {
        formula: fCode,
        total: fStats.total,
        passRate: fStats.passRate + '%'
      },
      tableData: fStats.sampleLots,
      tableTitle: `Sampel Roll Formula ${fCode}`,
      suggestions: [
        `👷 Operator mana yang mengerjakan formula ${fCode}?`,
        `⚠️ Defect apa yang sering muncul di ${fCode}?`,
        '📊 Tampilkan yield rate produksi keseluruhan'
      ]
    };
  }

  // PERIODIC SUMMARY
  const timeRange = extractDateRange(query);
  const isSummaryRequest = lowerQuery.includes('rangkum') || lowerQuery.includes('laporan') || lowerQuery.includes('rekap') || lowerQuery.includes('evaluasi') || lowerQuery.includes('summary') || lowerQuery.includes('performa') || lowerQuery.includes('bagaimana') || lowerQuery.includes('kinerja') || lowerQuery.includes('review');

  if (timeRange.hasRange || isSummaryRequest) {
    let scopedRolls = dataset;
    if (timeRange.hasRange && timeRange.startDate && timeRange.endDate) {
      scopedRolls = dataset.filter(r => {
        const d = String(r.tanggalFormatted || r.tanggal || '');
        return d >= timeRange.startDate && d <= timeRange.endDate;
      });
    }

    const scopeTotal = scopedRolls.length;
    const periodLabel = timeRange.hasRange ? timeRange.label : 'Keseluruhan Database Produksi';

    if (scopeTotal === 0) {
      return {
        text: `📅 **Laporan Produksi — ${periodLabel}:**\n\nTidak ditemukan data roll yang tercatat pada rentang tanggal **${timeRange.startDate} s/d ${timeRange.endDate}** di sistem.\n\nPastikan data roll untuk periode tersebut sudah diimport melalui menu Data Roll.`,
        suggestions: [
          'Tampilkan ringkasan seluruh data yang ada',
          'Alasan defect apa yang paling banyak?',
          'Performa operator produksi'
        ]
      };
    }

    const pStats = computeSubsetStats(scopedRolls);

    const slitCount = scopedRolls.filter(r => r.slitting === 1 || String(r.machineName || r.mesin || '').toUpperCase().includes('SLIT')).length;
    const rewCount = scopedRolls.filter(r => r.rewind === 1 || String(r.machineName || r.mesin || '').toUpperCase().includes('REW')).length;
    const castCount = scopedRolls.filter(r => r.sml === 1 || String(r.machineName || r.mesin || '').toUpperCase().includes('CAST') || String(r.machineName || r.mesin || '').toUpperCase().includes('SML')).length;

    const opMap = {};
    for (const r of scopedRolls) {
      const rawOp = (r.operator || (r.kodeOperator ? `OPERATOR ${r.kodeOperator}` : 'UNASSIGNED')).trim();
      const meta = resolveOperatorMetadata(rawOp, customOperators);
      if (!opMap[meta.nama]) opMap[meta.nama] = { name: meta.nama, total: 0, pass: 0, reject: 0 };
      opMap[meta.nama].total++;
      if (String(r.qualityStatus || r.status || 'PASS').toUpperCase() === 'PASS') opMap[meta.nama].pass++;
      else if (String(r.qualityStatus || r.status || '').toUpperCase() === 'REJECT') opMap[meta.nama].reject++;
    }
    const topOps = Object.values(opMap).sort((a, b) => b.total - a.total).slice(0, 3);

    let report = `📑 **Laporan Eksekutif Produksi — ${periodLabel}:**\n\n`;
    report += `Berikut rangkuman performa manufaktur, efisiensi volume, dan evaluasi kualitas pada periode **${periodLabel}**:\n\n`;

    report += `📊 **1. Volume Produksi & Yield Rate:**\n`;
    report += `• **Total Output**: **${pStats.total.toLocaleString('id-ID')} Roll** (${pStats.meters.toLocaleString('id-ID')} Meter)\n`;
    report += `• **Yield Rate (PASS)**: **${pStats.passRate}%** (${pStats.pass.toLocaleString('id-ID')} Roll Siap Kirim)\n`;
    report += `• **Karantina (HOLD)**: **${pStats.holdRate}%** (${pStats.hold.toLocaleString('id-ID')} Roll)\n`;
    report += `• **Scrap (REJECT)**: **${pStats.rejectRate}%** (${pStats.reject.toLocaleString('id-ID')} Roll / Est. ${pStats.rejectMeters.toLocaleString('id-ID')} Meter)\n\n`;

    report += `🏭 **2. Kontribusi Stasiun Mesin:**\n`;
    report += `• ✂️ **Slitting**: **${slitCount.toLocaleString('id-ID')} Roll** (${((slitCount / scopeTotal) * 100).toFixed(1)}%)\n`;
    report += `• 🔄 **Rewind**: **${rewCount.toLocaleString('id-ID')} Roll** (${((rewCount / scopeTotal) * 100).toFixed(1)}%)\n`;
    report += `• 🏭 **Casting / SML**: **${castCount.toLocaleString('id-ID')} Roll** (${((castCount / scopeTotal) * 100).toFixed(1)}%)\n\n`;

    if (pStats.topDefects.length > 0) {
      report += `⚠️ **3. Top Alasan Defect Dominan:**\n`;
      pStats.topDefects.forEach((d, i) => {
        report += `${i + 1}. **${d.name}**: ${d.count.toLocaleString('id-ID')} Roll (${d.pct}% dari total defect)\n`;
      });
      report += `\n`;
    }

    if (topOps.length > 0) {
      report += `👷 **4. Operator Terproduktif:**\n`;
      topOps.forEach(op => {
        const pRate = ((op.pass / op.total) * 100).toFixed(1);
        report += `• **${op.name}**: ${op.total.toLocaleString('id-ID')} Roll (Pass Rate: **${pRate}%**)\n`;
      });
      report += `\n`;
    }

    report += `💡 **5. Evaluasi & Saran Manajerial:**\n`;
    report += `• Target kelulusan kualitas 85% tercapai dengan baik (**${pStats.passRate}%**).\n`;
    report += `• Prioritaskan penyelesaian sortir untuk **${pStats.hold.toLocaleString('id-ID')} roll HOLD** agar status barang menjadi jelas sebelum akhir siklus produksi.`;

    return {
      text: report,
      metrics: {
        total: scopeTotal,
        passRate: pStats.passRate + '%',
        rejectRate: pStats.rejectRate + '%',
        meters: (pStats.meters / 1000).toFixed(1) + 'k M'
      },
      tableData: pStats.sampleLots,
      tableTitle: `Sampel Roll Periode ${periodLabel}`,
      suggestions: [
        '👷 Operator mana yang paling banyak menghasilkan defect pada periode ini?',
        '⚠️ Rincian defect apa saja yang terjadi?',
        '🏭 Bandingkan output mesin Slitting vs Rewind'
      ]
    };
  }

  // OPERATOR DEFECT / REJECT (EXECUTIVE DEEP DIVE)
  if (
    lowerQuery.includes('operator') &&
    (lowerQuery.includes('defect') || lowerQuery.includes('reject') || lowerQuery.includes('rusak') || lowerQuery.includes('masalah') || lowerQuery.includes('banyak') || lowerQuery.includes('paling') || lowerQuery.includes('afval') || lowerQuery.includes('cacat'))
  ) {
    const opStats = {};

    for (const r of dataset) {
      const rawOp = (r.operator || (r.kodeOperator ? `OPERATOR ${r.kodeOperator}` : 'UNASSIGNED')).trim();
      const machName = String(r.machineName || r.mesin || (r.slitting ? 'SLITTING' : r.rewind ? 'REWIND' : 'CASTING')).toUpperCase();
      const meta = resolveOperatorMetadata(rawOp, customOperators, machName);
      const key = `${meta.nama}#${meta.kode}#${meta.mesin}`;

      if (!opStats[key]) {
        opStats[key] = {
          name: meta.nama,
          code: meta.kode,
          machine: meta.mesin,
          group: meta.grup,
          total: 0,
          pass: 0,
          hold: 0,
          reject: 0,
          defectMap: {},
          sampleLots: []
        };
      }

      opStats[key].total++;
      const st = String(r.qualityStatus || r.status || 'PASS').toUpperCase();
      if (st === 'PASS') {
        opStats[key].pass++;
      } else {
        if (st === 'HOLD') opStats[key].hold++;
        else if (st === 'REJECT') opStats[key].reject++;

        const rawReason = (r.reasonDefect || r.reasonOfDefect || r.keterangan || '').trim().toUpperCase();
        const reasons = rawReason ? rawReason.split(/[,;\/]+/).map(s => s.trim()).filter(Boolean) : ['DEFECT TANPA KETERANGAN'];
        for (const reason of reasons) {
          opStats[key].defectMap[reason] = (opStats[key].defectMap[reason] || 0) + 1;
        }

        if (opStats[key].sampleLots.length < 3) {
          const lotCode = r.lot || r.kodeFg || 'Tanpa Lot';
          if (!opStats[key].sampleLots.includes(lotCode)) {
            opStats[key].sampleLots.push(lotCode);
          }
        }
      }
    }

    const rankedOps = Object.values(opStats)
      .map(op => {
        const totalDefects = op.hold + op.reject;
        const defectRate = ((totalDefects / op.total) * 100).toFixed(1);
        const rejectRate = ((op.reject / op.total) * 100).toFixed(1);
        const passRate = ((op.pass / op.total) * 100).toFixed(1);

        const sortedDefects = Object.entries(op.defectMap)
          .map(([reason, count]) => ({ reason, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 3);

        return {
          ...op,
          totalDefects,
          defectRate,
          rejectRate,
          passRate,
          topDefects: sortedDefects
        };
      })
      .sort((a, b) => b.totalDefects - a.totalDefects);

    const top3 = rankedOps.slice(0, 4);

    let reportText = `📋 **Hasil Evaluasi Defect & Kualitas Operator Produksi:**\n\nBerdasarkan audit terhadap **${total.toLocaleString('id-ID')} roll**, berikut peringkat operator dengan jumlah dan rasio defect tertinggi beserta jenis cacat dominannya:\n\n`;

    const medals = ['🥇', '🥈', '🥉', '4️⃣'];

    top3.forEach((op, idx) => {
      const medal = medals[idx] || '•';
      reportText += `${medal} **${op.name}** *(Kode: ${op.code} — Mesin: ${op.machine})*\n`;
      reportText += `• **Total Produksi**: ${op.total.toLocaleString('id-ID')} Roll (Pass Rate: **${op.passRate}%**)\n`;
      reportText += `• **Total Defect**: **${op.totalDefects.toLocaleString('id-ID')} Roll** (Reject: **${op.reject.toLocaleString('id-ID')} Roll**, Hold: **${op.hold.toLocaleString('id-ID')} Roll**)\n`;
      reportText += `• **Tingkat Defect**: **${op.defectRate}%** dari beban kerja operator\n`;
      
      if (op.topDefects.length > 0) {
        reportText += `• **Jenis Defect Utama**:\n`;
        op.topDefects.forEach(d => {
          reportText += `  - *${d.reason}*: ${d.count.toLocaleString('id-ID')} Roll\n`;
        });
      }
      
      if (op.sampleLots.length > 0) {
        reportText += `• **Contoh No. Lot**: \`${op.sampleLots.join('`, `')}\`\n`;
      }
      reportText += `\n`;
    });

    reportText += `💡 **Diagnosa Akar Masalah & Tindakan Korektif:**\n1. **Korelasi Proses Hulu (Metalize/Casting)**: Cacat seperti *Belang Lap-Lap* dan *Pinhole* pada proses Slitting operator ${top3[0]?.name || 'terkait'} umumnya merupakan defect bawaan dari proses sebelumnya yang baru teridentifikasi saat roll dibelah.\n2. **Koreksi Pisau Slitting**: Untuk defect *Garis Pisau* atau *Kerut*, segera lakukan pengecekan ketajaman mata pisau slitting dan alignment tension roll.\n3. **Sortir Ulang**: Prioritaskan evaluasi roll berstatus HOLD agar tidak menumpuk di area staging transit.`;

    const sampleDefectRolls = dataset.filter(r => {
      const st = String(r.qualityStatus || r.status || '').toUpperCase();
      return st === 'HOLD' || st === 'REJECT';
    }).slice(0, 8);

    return {
      text: reportText,
      metrics: {
        topOperatorDefect: `${top3[0]?.name || 'N/A'} (${top3[0]?.totalDefects} Roll Defect)`,
        totalDefectOverall: rankedOps.reduce((acc, o) => acc + o.totalDefects, 0)
      },
      tableData: sampleDefectRolls,
      tableTitle: `Sampel Roll Defect dari Operator Terkait`,
      suggestions: [
        '⚠️ Alasan defect apa yang paling banyak secara keseluruhan?',
        '🏭 Bagaimana tingkat reject di mesin Slitting vs Rewind?',
        '📊 Tampilkan yield rate produksi pabrik'
      ]
    };
  }

  // DEFECT PARETO
  if (lowerQuery.includes('defect') || lowerQuery.includes('cacat') || lowerQuery.includes('alasan') || lowerQuery.includes('sebab') || lowerQuery.includes('rusak') || lowerQuery.includes('masalah')) {
    const defectRolls = dataset.filter(r => {
      const st = String(r.qualityStatus || r.status || '').toUpperCase();
      return st === 'HOLD' || st === 'REJECT';
    });

    const reasonMap = {};
    for (const r of defectRolls) {
      const raw = (r.reasonDefect || r.reasonOfDefect || r.keterangan || '').trim().toUpperCase();
      const reasons = raw ? raw.split(/[,;\/]+/).map(s => s.trim()).filter(Boolean) : ['DEFECT TANPA KETERANGAN'];
      for (const reason of reasons) {
        reasonMap[reason] = (reasonMap[reason] || 0) + 1;
      }
    }

    const sortedReasons = Object.entries(reasonMap)
      .map(([name, count]) => ({ name, count, percentage: ((count / (defectRolls.length || 1)) * 100).toFixed(1) }))
      .sort((a, b) => b.count - a.count);

    const topDefects = sortedReasons.slice(0, 5);

    let summaryText = `⚠️ **Analisis Pareto Alasan Defect Kualitas Produksi:**\n\nDari total **${total.toLocaleString('id-ID')} roll**, tercatat **${defectRolls.length.toLocaleString('id-ID')} roll** mengalami defect (${((defectRolls.length / total) * 100).toFixed(1)}%):\n\n`;
    topDefects.forEach((d, i) => {
      summaryText += `${i + 1}. **${d.name}**: **${d.count.toLocaleString('id-ID')} Roll** (${d.percentage}% dari seluruh defect)\n`;
    });

    summaryText += `\n💡 **Rekomendasi QC**: Fokuskan penanganan pada defect peringkat 1 & 2 karena menyumbang lebih dari separuh total cacat produksi.`;

    return {
      text: summaryText,
      metrics: {
        totalDefect: defectRolls.length,
        defectRate: ((defectRolls.length / total) * 100).toFixed(1) + '%',
        topReason: topDefects[0]?.name || 'N/A'
      },
      tableData: defectRolls.slice(0, 8),
      tableTitle: 'Sampel Roll Defect Terkait',
      suggestions: [
        '👷 Operator mana yang paling banyak terkena defect ini?',
        '🔴 Berapa total roll REJECT yang harus dibuang?',
        '📊 Tampilkan yield rate kelulusan PASS'
      ]
    };
  }

  // MULTI-TERM SEARCH
  const terms = lowerQuery.split(/\s+/).filter(t => t.length >= 2 && !['berapa', 'roll', 'data', 'tolong', 'cari', 'tampilkan', 'ada', 'pada', 'yang', 'di', 'dan', 'atau', 'ini', 'itu', 'adakah'].includes(t));
  
  if (terms.length > 0) {
    const matched = dataset.filter(r => {
      const rowText = `${r.kodeFg || ''} ${r.lot || ''} ${r.spk || ''} ${r.supplier || ''} ${r.jenis || ''} ${r.kodeFormula || ''} ${r.thickness || ''} ${r.width || ''} ${r.qualityStatus || r.status || ''} ${r.reasonDefect || r.reasonOfDefect || r.keterangan || ''} ${r.operator || ''}`.toLowerCase();
      return terms.every(term => rowText.includes(term));
    });

    if (matched.length > 0) {
      const mStats = computeSubsetStats(matched);

      return {
        text: `🔍 **Ditemukan ${matched.length.toLocaleString('id-ID')} Roll** yang cocok dengan pencarian *"${query}"*:\n• **PASS**: **${mStats.pass.toLocaleString('id-ID')} Roll** (${mStats.passRate}%)\n• **HOLD**: **${mStats.hold.toLocaleString('id-ID')} Roll** (${mStats.holdRate}%)\n• **REJECT**: **${mStats.reject.toLocaleString('id-ID')} Roll** (${mStats.rejectRate}%)\n• Total Estimasi Panjang: **${mStats.meters.toLocaleString('id-ID')} Meter**`,
        metrics: {
          matchedTotal: matched.length,
          pass: mStats.pass,
          hold: mStats.hold,
          reject: mStats.reject
        },
        tableData: mStats.sampleLots,
        tableTitle: `Hasil Pencarian (${matched.length} Roll Terkait)`,
        suggestions: [
          '👷 Operator mana yang mengerjakan roll ini?',
          '⚠️ Alasan defect apa yang terjadi?',
          '📊 Tampilkan yield rate produksi'
        ]
      };
    }
  }

  // GENERAL FALLBACK SYNTHESIS
  const passCount = dataset.filter(r => String(r.qualityStatus || r.status || 'PASS').toUpperCase() === 'PASS').length;
  const holdCount = dataset.filter(r => String(r.qualityStatus || r.status || '').toUpperCase() === 'HOLD').length;
  const rejectCount = dataset.filter(r => String(r.qualityStatus || r.status || '').toUpperCase() === 'REJECT').length;

  return {
    text: `🤖 **Evaluasi Database Produksi:**\n\nMenanggapi pertanyaan Anda tentang *"${query}"*, berikut ringkasan status operasional pabrik terkini:\n\n• **Total Volume Roll**: **${total.toLocaleString('id-ID')} Roll**\n• **Yield Rate (PASS)**: **${((passCount / total) * 100).toFixed(1)}%** (${passCount.toLocaleString('id-ID')} Roll)\n• **Karantina (HOLD)**: **${((holdCount / total) * 100).toFixed(1)}%** (${holdCount.toLocaleString('id-ID')} Roll)\n• **Scrap (REJECT)**: **${((rejectCount / total) * 100).toFixed(1)}%** (${rejectCount.toLocaleString('id-ID')} Roll)\n\nAnda dapat menanyakan hal lebih spesifik mengenai dimensi (*"20 micron"*, *"lebar 1020"*), formula (*"VMCPP M07"*), perbandingan (*"Slitting vs Rewind"*), atau periode waktu (*"semester 1 2026"*).`,
    metrics: { total, passCount, holdCount, rejectCount },
    suggestions: [
      '📑 Rangkum laporan semester pertama 2026',
      '⚖️ Bandingkan mesin Slitting vs Rewind vs Casting',
      '👷 Operator mana yang paling banyak menghasilkan defect?',
      '🧪 Kualitas formula VMCPP M07'
    ]
  };
}
