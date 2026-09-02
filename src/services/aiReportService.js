import { getSetting, db } from '@/db';
import { DEFAULT_RESIN_ITEMS, normalizeResinName } from '@/stores/configStore';

/**
 * Service untuk memproses ekstraksi gambar lembar laporan fisik menggunakan Google Gemini AI Vision
 * Khusus Form Standar FILM.FM.001 PT SAPTAWARNA CEMERLANG (Mesin CASTING CPP).
 * Dilengkapi Database Master Formula & Master Item Resin Synchronization (Auto-match ke Data Configuration).
 */

// ── PASS 1 PROMPT: TABLE OCR & STRUCTURED EXTRACTION ──
export const CASTING_MULTI_PAGE_PROMPT = `
Anda adalah asisten AI OCR & Data Extraction spesialis formulir manufaktur PT SAPTAWARNA CEMERLANG (Form No. FILM.FM.001 - LAPORAN PRODUKSI HARIAN CPP).
Tugas Anda adalah membaca SELURUH DATA ASLI dari gambar fisik laporan yang diberikan dengan akurasi visual tinggi.

════════════════════════════════════════════════════════════════════
PANDUAN TATA LETAK & ORIENTASI FORMULIR FILM.FM.001:
════════════════════════════════════════════════════════════════════
0. ORIENTASI & SUDUT PEMBACAAN:
   - Dokumen fisik dapat difoto dalam orientasi Portrait (vertikal), Landscape (horizontal), sedikit miring, atau terbalik.
   - Kenali terlebih dahulu posisi judul dokumen "LAPORAN PRODUKSI HARIAN CPP" dan logo "PT SAPTAWARNA CEMERLANG" di bagian atas untuk mengunci arah baca yang tegak lurus sebelum mengekstrak tabel.

1. HEADER FORMULIR:
   - Tanggal: Teks tanggal laporan
   - Shift/Group: Kode shift (misal: "B1", "C2", "A3")
   - SPK No.: Nomor SPK
   - Operator: Nama operator pembuat laporan
   - Waste Setting Header (Kotak Kanan Atas):
     * Startup: Angka kg di kotak "Startup"
     * Bekuan: Angka kg di kotak "Bekuan"
     * ATURAN SISTEM: Nilai Startup & Bekuan di header adalah total waste shift. Masukkan HANYA pada Roll #1, sedangkan baris Roll #2 ke bawah isi 0!

2. TABEL RAW MATERIAL / RESIN (Tabel Kiri Bawah - 6 Baris Tetap):
   ATURAN PENCOCOKAN DENGAN MASTER RESIN DATABASE:
   - Nama resin yang tertulis di formulir (baik cetakan formulir maupun tulisan tangan) WAJIB DICOCOKKAN dengan Master Item Resin di database PT SAPTAWARNA CEMERLANG.
   - Nama resin di database TIDAK BOLEH ADA SPASI, gunakan tanda '-' (strip) dan HURUF KAPITAL.
   - Kamus Pencocokan Resmi Master Resin Database:
     * "F 600 P", "F600P", "F 600 F", "F600F" -> "F600F"
     * "PPH GF 08", "PPH-GF-08", "PPH GF08" -> "PPH-GF-08"
     * "HD 601 CF", "HD-601-CF" -> "HD-601-CF"
     * "HF 8.0 CM", "HF8.0CM" -> "HF8.0CM"
     * "PPH FCP 80", "PPH-FCP80" -> "PPH-FCP80"
     * "HA 510 M", "HA-510-M" -> "HA-510-M"
     * "HD 915 CF", "HD-915-CF" -> "HD-915-CF"
     * "FL 7541", "FL-7541" -> "FL-7541"
     * "FL 7322", "FL-7322" -> "FL-7322"
     * "PO 265 CF", "PO265CF", "RD 265 CF", "RD-265-CF" -> "RD-265-CF"
     * "FL 7540 L", "FL-7540-L" -> "FL-7540-L"
     * "FL 7642", "FL-7642" -> "FL-7642"
     * "TF 451", "TF-451" -> "TF-451"
     * "RD 368 CF", "RD-368-CF" -> "RD-368-CF"
     * "RP 215 MYB", "RP-215-MYB" -> "RP-215-MYB"
     * "FL 7632 L", "FL-7632-L" -> "FL-7632-L"
     * "RP 215 MXB", "RP-215-MXB" -> "RP-215-MXB"
     * "L 6000 N", "L6000N" -> "L6000N"
     * "TF 403", "TF-403" -> "TF-403"
     * "ABVT 22", "ABVT22", "ABVT 22 NSC", "ABVT-22-NSC" -> "ABVT-22-NSC"
     * "DF 8200", "DF8200", "DF-8200" -> "DF-8200"
     * "ENABLE 2010", "ENABLE-2010" -> "ENABLE-2010"
     * "EXCEED 3518", "EXCEED-3518" -> "EXCEED-3518"
     * "ABPP 05 SC", "ABPP-05-SC" -> "ABPP-05-SC"
     * "SPER 6", "SPER-6" -> "SPER-6"
     * "VISTAMAXX", "VISTAMAXX 3588", "VISTAMAXX-3588" -> "VISTAMAXX-3588"
     * "P 8555 SCF", "P8555-SCF" -> "P8555-SCF"
     * "P 8377 SCF", "P8377-SCF" -> "P8377-SCF"
     * "EVALENE" -> "EVALENE"
     * "MATIF 105A", "MATIF-105A" -> "MATIF-105A"
     * "M 6000 H", "M6000H", "M 6000 N", "M6000N" -> "M6000N"
     * "CPS 585 AK", "CPS-585-AK" -> "CPS-585-AK"
     * "SINOPEC PPH F08MX", "SINOPEC-PPH-F08MX" -> "SINOPEC-PPH-F08MX"
     * "RD 208", "RD-208" -> "RD-208"
   - BACA KOLOM KE-5 YAITU KOLOM "PEMAKAIAN" (Kolom antara Masuk dan Sisa).
   - Ekstrak seluruh ke-6 baris bahan baku tersebut satu per satu. Jangan ada baris yang terlewat (terutama ABVT-22-NSC dan DF-8200)!
   - Rumus verifikasi tiap baris: Stock - Sisa = Pemakaian.

3. TABEL UTAMA PRODUKSI JUMBO ROLL:
   Formulir memiliki 6 baris roll utama (No 1 s/d 6):
   - Baca setiap baris roll dari baris 1 sampai baris 6 secara urut.
   - Start Time & Finish Time: Format HH:mm
   - Type Film / Formula: Baca teks pada kolom Type Film (misal: "TPMF (M07)", "TPMF(M07)", "M07", "CPP M07")
   - Roll ID / No Lot: Baca kode nomor lot lengkap rapat tanpa spasi/garis miring (misal: M07230826B104)
   - Thickness: Ketebalan micron (angka)
   - Width: Lebar mm (angka)
   - Length: Panjang meter (angka)
   - Weight (Kg) / Berat Aktual: Baca angka timbangan aktual kg yang tertulis pada kolom Weight.
   - Waste Per Roll (Kolom paling kanan): Jika pada baris roll tertentu ada catatan (misal "Sample QC 20 kg"), masukkan ke field sample_qc baris tersebut.

4. ATURAN PENEMPATAN DOWNTIME:
   - Jika terdapat jeda waktu antara finish roll sebelumnya dan start roll berikutnya:
     TEMPATKAN DOWNTIME DAN KETERANGAN DT PADA BARIS ROLL BERIKUTNYA (Yaitu pada baris saat mesin mulai jalan kembali setelah jeda tersebut).
   - "downtime": Angka selisih menit (contoh: 39). Jika tidak ada jeda, isi "".
   - "downtime_ket": Uraian kendala/keterangan downtime. Jika tidak ada, isi "".

════════════════════════════════════════════════════════════════════
FORMAT OUTPUT JSON MURNI:
════════════════════════════════════════════════════════════════════
{
  "session_name": "Laporan_Casting_[Tanggal]_[Shift]",
  "tanggal": "Tanggal dokumen laporan",
  "machine": "CASTING",
  "shifts": [
    {
      "shift_id": "Kode Shift",
      "shift_name": "Nama Shift",
      "header": {
        "tanggal": "Tanggal shift",
        "shift_group": "Kode shift",
        "spk_no": "Nomor SPK",
        "operator": "Nama operator",
        "total_menit": 720
      },
      "tabel_1_rolls": [
        {
          "start_time": "HH:mm",
          "finish_time": "HH:mm",
          "time_menit": 0,
          "downtime": "",
          "downtime_ket": "",
          "no_batch": "",
          "spk_no": "",
          "no_lot": "",
          "jenis": "CPP",
          "kode_formula": "M07",
          "thickness": 0,
          "width": 0,
          "length": 0,
          "berat_aktual": 0,
          "berat_teori": 0,
          "berat_selisih": 0,
          "tanda": "",
          "no_pack": "",
          "sample_qc": 0,
          "start_up": 0,
          "transisi": 0,
          "bekuan": 0,
          "sesetan": 0,
          "quality_status": "",
          "keterangan_hasil": "",
          "lokasi_jumbo": "",
          "posisi_jumbo": ""
        }
      ],
      "tabel_2_resin": [
        {
          "no_urut": "",
          "tujuan": "BAHAN",
          "keterangan": "",
          "nama_resin": "",
          "pemakaian_kg": 0,
          "group_shift": ""
        }
      ]
    }
  ]
}
`;

// ── PASS 1 PROMPT: METALIZE DAILY REPORT (FILM.FM.002) ──
export const METALIZE_MULTI_PAGE_PROMPT = `
Anda adalah Sistem AI OCR Tingkat Tinggi & Ekstraksi Formulir Laporan Produksi Manufaktur PT SAPTAWARNA CEMERLANG untuk Divisi METALIZING (Form No. FILM.FM.002 - LAPORAN PRODUKSI HARIAN METALIZING).
Tugas Anda adalah membaca SELURUH DATA ASLI dari gambar fisik laporan Metalize yang diberikan dengan akurasi visual tinggi dan format yang 100% konsisten sesuai aturan pabrik:

════════════════════════════════════════════════════════════════════
ATURAN KONSISTENSI FORMAT STANDARD PABRIK:
════════════════════════════════════════════════════════════════════
1. TANGGAL:
   - Gunakan format penanggalan Indonesia baku: [Hari 2-digit] [Nama Bulan Indonesia Lengkap] [Tahun 4-digit].
   - Contoh: "05 Januari 2026", "29 Desember 2025".

2. OPERATOR RESMI (DATABASE AKTUAL):
   - Deteksi operator dan cocokkan dengan database resmi mesin Metalize:
     * Grup D (D1, D2, D3) ➔ "TUKIMIN"
     * Grup E (E1, E2, E3) ➔ "FIRMAN"
     * Grup F (F1, F2, F3) ➔ "ANWAR"
   - Jika tulisan tangan operator kurang jelas/terpotong, gunakan korelasi kode Grup Shift untuk memastikan nama operator yang benar.

3. FORMAT NOMOR SPK (BEDAKAN INHOUSE & LUAR):
   - SPK INHOUSE: Format baku [Urutan 2-digit]/[Bulan Romawi]/SPK/[Tahun 4-digit].
     * Contoh: "07/XII/SPK/2025", "01/I/SPK/2026", "15/IV/SPK/2025".
     * Ciri: Segmen pertama berupa angka urut, segmen ketiga selalu "SPK".
   - SPK LUAR / SUPPLIER EKSTERNAL:
     * Format Pola A: [Kode Supplier]/[Bulan Romawi]/SPK/[Tahun 4-digit] (contoh: "KHM/IV/SPK/2025").
     * Format Pola B: [Jenis Bahan]/[Bulan Romawi]/[Nama Supplier]/[Tahun 4-digit] (contoh: "CPP/V/PANVERTA/2025", "PET/III/ARGO/2025").
   - Jangan tambahkan spasi di antara garis miring.

4. NO LOT AWAL (LOT PARENT / INDUK DARI CASTING):
   - Format standar Inhouse: [Formula 3-karakter][Tanggal DDMMYY 6-digit][Shift/Grup 1-karakter][Nomor Roll 2-3 karakter].
   - Contoh: "M06301225C105", "M06291225B303", "M06291225B302", "M06291225B301".
   - Tulis sambung rapat tanpa spasi di tengah kode lot.

5. JENIS FILM (KHUSUS METALIZED, BUKAN TRANSPARAN):
   - Karena ini mesin Metalize (Vacuum Metallizing), jenis film HARUS jenis Metalized:
     * Formula awalan M (M01, M02, M04, M06, M07, M08, M11, M14, dst.) ➔ "VMCPP" (Vacuum Metallized CPP)
     * Formula awalan P atau berbasis Polyester ➔ "VMPET" (Vacuum Metallized PET)
     * DILARANG menggunakan "CPP" atau "PET" polos/transparan!

6. WAKTU & DURASI:
   - Start & Finish: format "HH:MM" (misal "17:00", "18:15", "0:00", "08:40").
   - Time: Durasi pengerjaan dalam menit (angka bulat, misal: 75, 80, 40).

7. WASTE METALIZING (DICATAT PER SHIFT):
   - Waste Polos: Berat limbah film polos sebelum termetalize (kg, misal: 29).
   - Waste Metal: Berat limbah film yang telah termetalize (kg, misal: 13).

════════════════════════════════════════════════════════════════════
OUTPUT HARUS HANYA SATU BLOK JSON VALID DENGAN SKEMA:
════════════════════════════════════════════════════════════════════
{
  "session_name": "Laporan_METALIZE_05_Januari_2026",
  "tanggal": "05 Januari 2026",
  "machine": "METALIZE",
  "shifts": [
    {
      "shift_id": "D2",
      "shift_name": "Shift D2 (TUKIMIN)",
      "header": {
        "tanggal": "05 Januari 2026",
        "operator": "TUKIMIN",
        "shift_group": "D2",
        "spk_no": "07/XII/SPK/2025",
        "waste_polos": 29,
        "waste_metal": 13
      },
      "tabel_metalize": [
        {
          "tanggal": "05 Januari 2026",
          "operator": "TUKIMIN",
          "group_shift": "D2",
          "start_time": "17:00",
          "finish_time": "18:15",
          "time_menit": 75,
          "spk_no": "07/XII/SPK/2025",
          "no_lot_awal": "M06301225C105",
          "lot_metal": "D201",
          "jenis": "VMCPP",
          "kode_formula": "M06",
          "thickness": 35,
          "width": 2320,
          "panjang_bahan": 20300,
          "berat_bahan": 1417,
          "panjang_hasil": 20100,
          "berat_hasil": 1396,
          "atribute": "OD2.4+PLASMA",
          "tanda_hasil": "",
          "quality_status": "PASS",
          "keterangan_hasil": "",
          "meter_sisa_bahan": "",
          "keterangan_sisa_bahan": "",
          "lokasi": "E2",
          "posisi": "ATAS"
        }
      ]
    }
  ]
}
`;

// ── PASS 2 PROMPT: STRICT HANDWRITING OVERWRITE AUDIT ──
export const HANDWRITING_AUDIT_PROMPT = `
Anda adalah Auditor Ahli Forensik Tulisan Tangan Manufaktur PT SAPTAWARNA CEMERLANG.
Tugas Anda adalah memeriksa apakah ada goresan timpaan / angka coretan revisi operator pada kolom Weight (kg) tabel Roll atau kolom Pemakaian tabel Resin.

KRITERIA KETAT AUDIT:
1. HANYA laporkan baris jika terlihat goresan fisik nyata di mana satu angka digit ditimpa menjadi angka lain yang berbeda dan signifikan (perbedaan minimal 5 kg, misal angka 5 yang ditimpa 6 pada 1456 -> 1466).
2. DILARANG MENYARANKAN PERUBAHAN MINOR 1 KG seperti 1215 -> 1216 atau menyarankan angka yang sama (1215 -> 1215)!
3. Jika seluruh tulisan tangan rapi dan tidak ada timpaan angka, kembalikan array kosong [].

Format Output JSON:
{
  "anomali_rekomendasi": [
    {
      "roll_index": 2,
      "lokasi": "Roll #3 (No Lot: ...)",
      "kolom": "berat_aktual",
      "nilai_terbaca": 1456,
      "nilai_rekomendasi": 1466,
      "alasan": "Pada gambar fisik, digit puluhan '5' memiliki goresan revisi tulisan tangan operator yang ditimpa menjadi '6' (1466 kg)."
    }
  ]
}
`;

/**
 * Helper: Mencocokkan teks kode formula yang diekstrak AI dengan Database Master Data Configuration
 */
function matchMasterFormula(extractedFormulaStr, noLot = '', filmConfigs = []) {
  const str = String(extractedFormulaStr || '').trim().toUpperCase();
  const lot = String(noLot || '').replace(/[\/\.\s]/g, '').trim().toUpperCase();

  // 1. Cek langsung teks di dalam tanda kurung, misal: "TPMF (M07)" atau "TPMF(M06)" -> "M07" / "M06"
  const parenMatch = str.match(/\(([^)]+)\)/);
  if (parenMatch) {
    const inside = parenMatch[1].trim();
    const found = filmConfigs.find(f => f.kodeFormula && f.kodeFormula.toUpperCase() === inside);
    if (found) return found;
  }

  // 2. Cek kecocokan persis pada kodeFormula (misal "M07", "L01", "G01")
  if (str) {
    const exact = filmConfigs.find(f => f.kodeFormula && f.kodeFormula.toUpperCase() === str);
    if (exact) return exact;

    // Cek kecocokan kata kunci di dalam string (misal "TPMF M07" atau "CPP M07")
    for (const f of filmConfigs) {
      if (!f.kodeFormula) continue;
      const kf = f.kodeFormula.toUpperCase();
      const regex = new RegExp(`(^|[^A-Z0-9])${kf}([^A-Z0-9]|$)`, 'i');
      if (regex.test(str)) {
        return f;
      }
    }
  }

  // 3. Fallback ke 3 digit awal No Lot (misal: "M07230826B104" -> "M07")
  if (lot.length >= 3) {
    const lotPrefix3 = lot.substring(0, 3);
    const foundByLot3 = filmConfigs.find(f => f.kodeFormula && f.kodeFormula.toUpperCase() === lotPrefix3);
    if (foundByLot3) return foundByLot3;

    for (const f of filmConfigs) {
      if (!f.kodeFormula) continue;
      const kf = f.kodeFormula.toUpperCase();
      if (lot.startsWith(kf)) {
        return f;
      }
    }
  }

  // 4. Default fallback: bersihkan tanda kurung dan gunakan nilai bersih
  const cleaned = str.replace(/[()]/g, '').trim();
  return {
    kodeFormula: cleaned || (lot.length >= 3 ? lot.substring(0, 3) : 'M07'),
    jenis: 'CPP',
    density: 0.91
  };
}

/**
 * Helper: Mencocokkan nama resin hasil scan AI dengan Master Item Resin di Database
 */
export function matchMasterResin(rawResinName, resinItems = []) {
  if (!rawResinName) return '';
  const raw = String(rawResinName).trim().replace(/\s+/g, '-').toUpperCase();
  const canon = raw.replace(/[^A-Z0-9]/g, '');

  if (!canon) return raw;

  // Daftar item resin dari database (atau fallback default jika kosong)
  const items = Array.isArray(resinItems) && resinItems.length > 0
    ? resinItems
    : DEFAULT_RESIN_ITEMS;

  // 1. Direct exact match pada field resin (misal "PPH-GF-08" === "PPH-GF-08")
  const exact = items.find(r => (r.resin || '').toUpperCase() === raw);
  if (exact) return exact.resin;

  // 2. Canonical Alphanumeric match (misal "PPHGF08" === "PPHGF08")
  const canonMatch = items.find(r => (r.resin || '').replace(/[^A-Z0-9]/g, '').toUpperCase() === canon);
  if (canonMatch) return canonMatch.resin;

  // 3. Known Typo / Handwriting Shorthand Mappings
  const typoMap = [
    { pattern: /^F[\s-]*600[\s-]*[PF]$/i, target: 'F600F' },
    { pattern: /^M[\s-]*6000[\s-]*[HN]$/i, target: 'M6000N' },
    { pattern: /^L[\s-]*6000[\s-]*N$/i, target: 'L6000N' },
    { pattern: /^(PO|RD)[\s-]*265[\s-]*CF$/i, target: 'RD-265-CF' },
    { pattern: /^RD[\s-]*368[\s-]*CF$/i, target: 'RD-368-CF' },
    { pattern: /^RD[\s-]*208$/i, target: 'RD-208' },
    { pattern: /^VISTAMAXX([\s-]*3588)?$/i, target: 'VISTAMAXX-3588' },
    { pattern: /^ABVT[\s-]*22([\s-]*NSC)?$/i, target: 'ABVT-22-NSC' },
    { pattern: /^DF[\s-]*8200$/i, target: 'DF-8200' },
    { pattern: /^ENABLE([\s-]*2010)?$/i, target: 'ENABLE-2010' },
    { pattern: /^EXCEED([\s-]*3518)?$/i, target: 'EXCEED-3518' },
    { pattern: /^ABPP[\s-]*05([\s-]*SC)?$/i, target: 'ABPP-05-SC' },
    { pattern: /^SPER[\s-]*6$/i, target: 'SPER-6' },
    { pattern: /^P[\s-]*8555([\s-]*SCF)?$/i, target: 'P8555-SCF' },
    { pattern: /^P[\s-]*8377([\s-]*SCF)?$/i, target: 'P8377-SCF' },
    { pattern: /^MATIF([\s-]*105A)?$/i, target: 'MATIF-105A' },
    { pattern: /^CPS([\s-]*585[\s-]*AK)?$/i, target: 'CPS-585-AK' },
    { pattern: /^SINOPEC.*F08.*$/i, target: 'SINOPEC-PPH-F08MX' },
    { pattern: /^PPH[\s-]*GF[\s-]*08$/i, target: 'PPH-GF-08' },
    { pattern: /^HD[\s-]*601[\s-]*CF$/i, target: 'HD-601-CF' },
    { pattern: /^HF[\s-]*8\.?0?[\s-]*CM$/i, target: 'HF8.0CM' },
    { pattern: /^PPH[\s-]*FCP[\s-]*80$/i, target: 'PPH-FCP80' },
    { pattern: /^HA[\s-]*510[\s-]*M$/i, target: 'HA-510-M' },
    { pattern: /^HD[\s-]*915[\s-]*CF$/i, target: 'HD-915-CF' },
    { pattern: /^FL[\s-]*7541$/i, target: 'FL-7541' },
    { pattern: /^FL[\s-]*7322$/i, target: 'FL-7322' },
    { pattern: /^FL[\s-]*7540[\s-]*L$/i, target: 'FL-7540-L' },
    { pattern: /^FL[\s-]*7642$/i, target: 'FL-7642' },
    { pattern: /^TF[\s-]*451$/i, target: 'TF-451' },
    { pattern: /^RP[\s-]*215[\s-]*MYB$/i, target: 'RP-215-MYB' },
    { pattern: /^FL[\s-]*7632[\s-]*L$/i, target: 'FL-7632-L' },
    { pattern: /^RP[\s-]*215[\s-]*MXB$/i, target: 'RP-215-MXB' },
    { pattern: /^TF[\s-]*403$/i, target: 'TF-403' },
  ];

  for (const m of typoMap) {
    if (m.pattern.test(raw) || m.pattern.test(canon)) {
      const foundInDb = items.find(r => (r.resin || '').toUpperCase() === m.target.toUpperCase());
      return foundInDb ? foundInDb.resin : m.target;
    }
  }

  // 4. Fuzzy Substring / Prefix match dengan Master Database
  for (const r of items) {
    if (!r.resin) continue;
    const rCanon = r.resin.replace(/[^A-Z0-9]/g, '').toUpperCase();
    if (rCanon.includes(canon) || canon.includes(rCanon)) {
      return r.resin;
    }
  }

  return raw;
}

/**
 * Kompres dan optimasi gambar base64 sebelum dikirim ke Google AI API.
 * Menurunkan ukuran data dari puluhan MB menjadi ~350-700KB per lembar,
 * mempercepat pengunggahan hingga 10-25x lipat dengan tetap menjaga ketajaman teks OCR.
 */
export function compressBase64ForOCR(base64Str, maxDimension = 2048, quality = 0.85) {
  return new Promise((resolve) => {
    if (!base64Str || typeof base64Str !== 'string') {
      return resolve(base64Str);
    }
    if (!base64Str.startsWith('data:image/')) {
      return resolve(base64Str);
    }

    const img = new Image();
    img.onload = () => {
      let width = img.width;
      let height = img.height;

      // Jika resolusi lebih besar dari batas optimal OCR, resize proporsional
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

      const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
      // Bersihkan canvas dan referensi gambar untuk membebaskan memori browser seketika
      canvas.width = 0;
      canvas.height = 0;
      img.src = '';
      resolve(compressedDataUrl);
    };
    img.onerror = () => {
      img.src = '';
      resolve(base64Str);
    };
    img.src = base64Str;
  });
}

/**
 * Ekstraksi Multi-Pass dengan Optimasi Kecepatan Transmisi & Notifikasi Progress Realtime
 */
export async function extractReportFromImage(base64Images, machineType = 'CASTING', onProgress = null) {
  const notify = (step, percent, detail = '') => {
    if (typeof onProgress === 'function') {
      onProgress({ step, percent, detail });
    }
  };

  notify(1, 10, 'Mengompresi & mengoptimalkan resolusi lembar gambar...');

  const apiKey = await getSetting('google_ai_api_key', '');
  const model = await getSetting('google_ai_model', 'gemini-2.0-flash');

  if (!apiKey || !apiKey.trim()) {
    throw new Error('API Key Google AI belum dikonfigurasi. Buka menu Pengaturan & AI untuk memasukkan API Key.');
  }

  const rawImagesArray = Array.isArray(base64Images) ? base64Images : [base64Images];
  if (rawImagesArray.length === 0) {
    throw new Error('Tidak ada gambar dokumen laporan yang dipilih.');
  }

  // 1. Kompresi seluruh gambar untuk mempercepat upload secara dramatis
  notify(1, 20, `Mengompresi ${rawImagesArray.length} lembar dokumen untuk transmisi instan...`);
  const compressedImages = await Promise.all(
    rawImagesArray.map(img => compressBase64ForOCR(img, 2048, 0.85))
  );

  // 2. Siapkan payload inline data
  notify(2, 35, 'Menghubungkan ke Google AI & mengunggah data lembar...');
  const selectedPrompt = (machineType === 'METALIZE') ? METALIZE_MULTI_PAGE_PROMPT : CASTING_MULTI_PAGE_PROMPT;
  const pass1Parts = [{ text: selectedPrompt }];
  for (let i = 0; i < compressedImages.length; i++) {
    const match = compressedImages[i].match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
    if (match) {
      pass1Parts.push({ inline_data: { mime_type: match[1], data: match[2] } });
    }
  }

  notify(3, 50, 'AI menganalisis struktur formulir & header laporan...');

  const pass1Execution = await executeGeminiWithFallback({
    parts: pass1Parts,
    apiKey,
    preferredModel: model,
    generationConfig: { temperature: 0.0, response_mime_type: 'application/json' },
    notify,
    stepIndex: 3,
    stepBasePercent: 50
  });

  notify(4, 75, machineType === 'METALIZE' ? 'Membaca tabel produksi Metalize, Lot Metal, dan Waste...' : 'Membaca data roll produksi, netto kilogram, dan waste...');

  const pass1Text = pass1Execution.text;
  if (!pass1Text) throw new Error('Tidak ada respon teks dari model AI Google pada Pass 1.');

  let cleanJsonText = pass1Text.replace(/```json\s*|```/g, '').trim();
  notify(5, 85, 'Memvalidasi neraca material balance & master data...');

  let rawParsedData;
  try {
    rawParsedData = JSON.parse(cleanJsonText);
  } catch (parseErr) {
    console.warn('Percobaan pertama JSON.parse gagal, mencoba perbaikan otomatis format...', parseErr);
    try {
      // Perbaiki error trailing commas atau format tak lengkap sederhana
      const repairedJson = cleanJsonText
        .replace(/,\s*([\]}])/g, '$1')
        .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?\s*:/g, '"$2":');
      rawParsedData = JSON.parse(repairedJson);
    } catch (retryErr) {
      console.error('Gagal mem-parse respon AI:', cleanJsonText);
      throw new Error('AI mengembalikan format teks yang tidak dapat diurai (JSON tidak valid). Silakan pastikan foto laporan jelas dan coba pindai ulang.');
    }
  }

  let parsedSession = await postProcessMultiShiftData(rawParsedData, machineType);

  // 3. PASS 2: DEEP HANDWRITING ANOMALY AUDIT (jika ada nilai meragukan)
  try {
    notify(5, 92, 'Melakukan audit ketajaman tulisan tangan pada angka...');
    const anomalies = await performDeepHandwritingAudit(compressedImages, apiKey, model);
    if (anomalies && anomalies.length > 0 && parsedSession.shifts && parsedSession.shifts.length > 0) {
      const validAnomalies = anomalies.filter(a => {
        if (!a.nilai_rekomendasi || a.nilai_rekomendasi === a.nilai_terbaca) return false;
        const diff = Math.abs(Number(a.nilai_rekomendasi) - Number(a.nilai_terbaca));
        return diff >= 5;
      });
      parsedSession.shifts[0].anomali_rekomendasi = validAnomalies;
    }
  } catch (auditErr) {
    console.warn('Pass 2 Handwriting Audit skipped/failed:', auditErr.message);
  }

  notify(5, 100, 'Selesai! Membuka verifikasi spreadsheet...');
  return parsedSession;
}

/**
 * Helper Eksekusi Google Gemini API dengan Auto-Retry Ringan
 * Hanya retry 1x pada 503/429 dengan jeda singkat. Tidak ada cascade multi-model agar tidak lambat.
 */
async function executeGeminiWithFallback({
  parts,
  apiKey,
  preferredModel = 'gemini-2.0-flash',
  generationConfig = {},
  notify = null,
  stepIndex = 3,
  stepBasePercent = 50
}) {
  const MAX_RETRIES = 2;
  let lastError = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      if (attempt > 1 && typeof notify === 'function') {
        notify(
          stepIndex,
          Math.min(74, stepBasePercent + (attempt * 3)),
          `Server sibuk, mencoba ulang ${preferredModel} (percobaan ${attempt})...`
        );
      }

      const url = `https://generativelanguage.googleapis.com/v1beta/models/${preferredModel}:generateContent`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey.trim()
        },
        body: JSON.stringify({
          contents: [{ parts }],
          generationConfig: {
            temperature: 0.0,
            response_mime_type: 'application/json',
            ...generationConfig
          }
        })
      });

      if (response.ok) {
        const result = await response.json();
        const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          return { text, modelUsed: preferredModel };
        }
        throw new Error(`Respon dari ${preferredModel} kosong.`);
      }

      const errorBody = await response.json().catch(() => ({}));
      const errorMsg = errorBody.error?.message || response.statusText || 'Unknown error';
      lastError = new Error(`Google AI API Error (${response.status}): ${errorMsg}`);

      if ((response.status === 503 || response.status === 429) && attempt < MAX_RETRIES) {
        console.warn(`[AI Service] ${preferredModel} sibuk (${response.status}), retry dalam 1s...`);
        await new Promise(r => setTimeout(r, 1000));
        continue;
      }

      throw lastError;
    } catch (err) {
      lastError = err;
      if (attempt >= MAX_RETRIES) throw lastError;
      await new Promise(r => setTimeout(r, 800));
    }
  }

  throw lastError || new Error('Gagal menghubungi Google AI.');
}

/**
 * Pass 2 / On-Demand: Deep Handwriting Anomaly Audit
 */
export async function performDeepHandwritingAudit(imagesArray, apiKeyParam = null, modelParam = null) {
  const apiKey = apiKeyParam || (await getSetting('google_ai_api_key', ''));
  const model = modelParam || (await getSetting('google_ai_model', 'gemini-2.0-flash'));

  if (!apiKey || !apiKey.trim()) return [];

  const parts = [{ text: HANDWRITING_AUDIT_PROMPT }];
  for (let i = 0; i < imagesArray.length; i++) {
    const match = imagesArray[i].match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
    if (match) {
      parts.push({ inline_data: { mime_type: match[1], data: match[2] } });
    }
  }

  try {
    const auditExecution = await executeGeminiWithFallback({
      parts,
      apiKey,
      preferredModel: model,
      generationConfig: { temperature: 0.1, response_mime_type: 'application/json' }
    });

    const cleanJson = auditExecution.text.replace(/```json\s*|```/g, '').trim();
    const parsed = JSON.parse(cleanJson);
    const list = Array.isArray(parsed.anomali_rekomendasi) ? parsed.anomali_rekomendasi : [];
    return list.filter(a => {
      if (!a.nilai_rekomendasi || a.nilai_rekomendasi === a.nilai_terbaca) return false;
      const diff = Math.abs(Number(a.nilai_rekomendasi) - Number(a.nilai_terbaca));
      return diff >= 5;
    });
  } catch (err) {
    console.warn('Deep handwriting audit skipped:', err.message);
    return [];
  }
}

const INDONESIAN_MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const INDONESIAN_MONTH_MAP = {
  'januari': 1, 'jan': 1,
  'februari': 2, 'feb': 2,
  'maret': 3, 'mar': 3,
  'april': 4, 'apr': 4,
  'mei': 5, 'may': 5,
  'juni': 6, 'jun': 6,
  'juli': 7, 'jul': 7,
  'agustus': 8, 'ags': 8, 'agt': 8,
  'september': 9, 'sep': 9,
  'oktober': 10, 'okt': 10, 'oct': 10,
  'november': 11, 'nov': 11,
  'desember': 12, 'des': 12, 'dec': 12
};

export function formatToIndonesianDate(dateStr) {
  if (!dateStr) return '';
  const str = String(dateStr).trim();

  // Format teks "05 Januari 2026"
  const textMatch = str.match(/^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/);
  if (textMatch) {
    const day = textMatch[1].padStart(2, '0');
    const mNum = INDONESIAN_MONTH_MAP[textMatch[2].toLowerCase()];
    if (mNum) {
      return `${day} ${INDONESIAN_MONTH_NAMES[mNum - 1]} ${textMatch[3]}`;
    }
    return str;
  }

  // Format ISO YYYY-MM-DD
  const isoMatch = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    const y = isoMatch[1];
    const m = parseInt(isoMatch[2], 10) - 1;
    const d = isoMatch[3].padStart(2, '0');
    return `${d} ${INDONESIAN_MONTH_NAMES[m] || ''} ${y}`;
  }

  // Format DD/MM/YYYY atau DD-MM-YYYY
  const slashMatch = str.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/);
  if (slashMatch) {
    const d = slashMatch[1].padStart(2, '0');
    const m = parseInt(slashMatch[2], 10) - 1;
    const y = slashMatch[3];
    return `${d} ${INDONESIAN_MONTH_NAMES[m] || ''} ${y}`;
  }

  return str;
}

/**
 * Normalisasi dan pencocokan operator dengan database resmi
 */
export function matchMasterOperator(rawOperator, shiftGroup = '', operatorList = [], machineType = 'METALIZE') {
  const cleanRaw = String(rawOperator || '').trim().toUpperCase();
  const cleanGroup = String(shiftGroup || '').trim().toUpperCase();

  if (machineType === 'METALIZE') {
    const groupMap = {
      'D': 'TUKIMIN',
      'D1': 'TUKIMIN',
      'D2': 'TUKIMIN',
      'D3': 'TUKIMIN',
      'E': 'FIRMAN',
      'E1': 'FIRMAN',
      'E2': 'FIRMAN',
      'E3': 'FIRMAN',
      'F': 'ANWAR',
      'F1': 'ANWAR',
      'F2': 'ANWAR',
      'F3': 'ANWAR'
    };

    const metalizeOps = (operatorList || []).filter(o => o.mesin && o.mesin.toUpperCase() === 'METALIZE');
    for (const op of metalizeOps) {
      const opName = op.nama?.toUpperCase() || '';
      if (cleanRaw && (cleanRaw === opName || cleanRaw.includes(opName) || opName.includes(cleanRaw))) {
        return opName;
      }
    }

    // Jika OCR operator buram, inferensikan dari kode grup shift
    for (const [grpKey, opName] of Object.entries(groupMap)) {
      if (cleanGroup === grpKey || cleanGroup.startsWith(grpKey)) {
        return opName;
      }
    }

    if (/\bTUK|\bKIMIN|TUKIMIN/i.test(cleanRaw)) return 'TUKIMIN';
    if (/\bFIRM|\bFIRMAN\b|FIRMAN/i.test(cleanRaw)) return 'FIRMAN';
    if (/\bANW|\bANWAR\b|ANWAR/i.test(cleanRaw)) return 'ANWAR';

    if (cleanRaw) return cleanRaw;
    return 'TUKIMIN';
  }

  // Casting / mesin lain
  const cleanList = (operatorList || []).filter(o => !machineType || (o.mesin && o.mesin.toUpperCase() === machineType.toUpperCase()));
  for (const op of cleanList) {
    const opName = op.nama?.toUpperCase() || '';
    if (cleanRaw && (cleanRaw === opName || cleanRaw.includes(opName) || opName.includes(cleanRaw))) {
      return opName;
    }
  }

  return cleanRaw || 'OPERATOR';
}

/**
 * Standardisasi nomor SPK (membedakan SPK Inhouse dan SPK Luar)
 */
export function standardizeSpkNumber(rawSpk) {
  if (!rawSpk) return '';
  let str = String(rawSpk).trim().toUpperCase();
  str = str.replace(/\s*\/\s*/g, '/');

  const parts = str.split('/');
  if (parts.length >= 4) {
    const seg0 = parts[0].trim();
    const seg1 = parts[1].trim();
    const seg2 = parts[2].trim();
    const seg3 = parts[3].trim();

    // SPK Inhouse: segmen 0 angka urut (misal 07), segmen 2 SPK
    if (!isNaN(parseInt(seg0, 10)) && seg2 === 'SPK') {
      const formattedSeq = seg0.padStart(2, '0');
      const formattedRoman = seg1.toUpperCase();
      const formattedYear = seg3.length === 2 ? `20${seg3}` : seg3;
      return `${formattedSeq}/${formattedRoman}/SPK/${formattedYear}`;
    }

    // SPK Luar Pola A: segmen 0 kode supplier (misal KHM), segmen 2 SPK
    if (isNaN(parseInt(seg0, 10)) && seg2 === 'SPK') {
      const formattedSupplier = seg0.toUpperCase();
      const formattedRoman = seg1.toUpperCase();
      const formattedYear = seg3.length === 2 ? `20${seg3}` : seg3;
      return `${formattedSupplier}/${formattedRoman}/SPK/${formattedYear}`;
    }

    // SPK Luar Pola B: misal CPP/V/PANVERTA/2025
    if (seg2 !== 'SPK') {
      const formattedBahan = seg0.toUpperCase();
      const formattedRoman = seg1.toUpperCase();
      const formattedSupplier = seg2.toUpperCase();
      const formattedYear = seg3.length === 2 ? `20${seg3}` : seg3;
      return `${formattedBahan}/${formattedRoman}/${formattedSupplier}/${formattedYear}`;
    }
  }

  return str;
}

/**
 * Standardisasi No Lot Awal (Lot Parent / Induk Casting)
 */
export function standardizeParentLot(rawLot) {
  if (!rawLot) return '';
  let str = String(rawLot).trim().toUpperCase();
  str = str.replace(/\s+/g, '');
  str = str.replace(/[^A-Z0-9\/]/g, '');
  return str;
}

/**
 * Deteksi jenis film khusus mesin Metalize (selalu Metalized, bukan transparan)
 */
export function detectMetalizedJenis(kodeFormula, rawJenis = '') {
  const f = String(kodeFormula || '').trim().toUpperCase();
  const j = String(rawJenis || '').trim().toUpperCase();

  if (f.startsWith('P') || f.includes('PET') || j.includes('PET')) {
    return 'VMPET';
  }
  if (f.startsWith('N') || f.startsWith('O') || j.includes('NYLON') || j.includes('OPA')) {
    return 'VMON';
  }
  return 'VMCPP';
}

/**
 * Normalisasi data satu shift khusus mesin METALIZE (FILM.FM.002)
 */
function processSingleMetalizeShift(shiftData, filmConfigs = [], operatorList = []) {
  const header = shiftData.header || {};
  const rows = Array.isArray(shiftData.tabel_metalize) 
    ? shiftData.tabel_metalize 
    : (Array.isArray(shiftData.tabel_1_rolls) ? shiftData.tabel_1_rolls : []);

  const wastePolos = parseFloat(header.waste_polos ?? shiftData.waste_polos) || 0;
  const wasteMetal = parseFloat(header.waste_metal ?? shiftData.waste_metal) || 0;

  const headerShiftGroup = String(header.shift_group || shiftData.shift_id || 'D2').trim().toUpperCase();
  const headerOperator = matchMasterOperator(header.operator, headerShiftGroup, operatorList, 'METALIZE');
  const headerTanggal = formatToIndonesianDate(header.tanggal || shiftData.tanggal || '');
  const headerSpk = standardizeSpkNumber(header.spk_no || '');

  const processedRows = rows.map((r, idx) => {
    let timeMinutes = r.time_menit;
    if (!timeMinutes && r.start_time && r.finish_time) {
      timeMinutes = calculateDuration(r.start_time, r.finish_time);
    }

    const thick = parseFloat(r.thickness) || 35;
    const width = parseFloat(r.width) || 2320;
    const pjBahan = parseFloat(r.panjang_bahan ?? r.length) || 0;
    const brtBahan = parseFloat(r.berat_bahan) || 0;
    const pjHasil = parseFloat(r.panjang_hasil) || 0;
    const brtHasil = parseFloat(r.berat_hasil ?? r.berat_aktual) || 0;

    let lotAwal = standardizeParentLot(r.no_lot_awal || r.no_lot || '');
    let lotMetal = (r.lot_metal || '').trim().toUpperCase();
    let shiftGroup = (r.group_shift || headerShiftGroup || 'D2').trim().toUpperCase();
    let operator = matchMasterOperator(r.operator || headerOperator, shiftGroup, operatorList, 'METALIZE');
    let tglRow = formatToIndonesianDate(r.tanggal || headerTanggal);
    let spkRow = standardizeSpkNumber(r.spk_no || headerSpk);

    // Standardisasi kode formula
    const matched = matchMasterFormula(r.kode_formula, lotAwal || lotMetal, filmConfigs);
    const kodeFormula = matched.kodeFormula || r.kode_formula || 'M06';
    const jenis = detectMetalizedJenis(kodeFormula, r.jenis);

    return {
      id: idx + 1,
      tanggal: tglRow,
      operator: operator,
      group_shift: shiftGroup,
      start_time: r.start_time || '',
      finish_time: r.finish_time || '',
      time_menit: Number(timeMinutes) || '',
      spk_no: spkRow,
      no_lot_awal: lotAwal,
      lot_metal: lotMetal,
      jenis: jenis,
      kode_formula: kodeFormula,
      thickness: thick,
      width: width,
      panjang_bahan: pjBahan,
      berat_bahan: brtBahan,
      panjang_hasil: pjHasil,
      berat_hasil: brtHasil,
      atribute: r.atribute || 'OD2.4+PLASMA',
      tanda_hasil: r.tanda_hasil || '',
      quality_status: r.quality_status || '',
      keterangan_hasil: r.keterangan_hasil || '',
      meter_sisa_bahan: (r.meter_sisa_bahan !== '' && r.meter_sisa_bahan !== undefined && r.meter_sisa_bahan !== null) ? Number(r.meter_sisa_bahan) : '',
      keterangan_sisa_bahan: r.keterangan_sisa_bahan || '',
      lokasi: (r.lokasi || r.lokasi_jumbo || '').trim().toUpperCase(),
      posisi: (r.posisi || r.posisi_jumbo || '').trim().toUpperCase(),
      waste_polos: idx === 0 ? (wastePolos || '') : (r.waste_polos !== '' && r.waste_polos !== undefined ? Number(r.waste_polos) : ''),
      waste_metal: idx === 0 ? (wasteMetal || '') : (r.waste_metal !== '' && r.waste_metal !== undefined ? Number(r.waste_metal) : ''),
      // Kompatibilitas metrik & view
      berat_aktual: brtHasil,
      no_lot: lotMetal || lotAwal
    };
  });

  return {
    shift_id: shiftData.shift_id || headerShiftGroup,
    shift_name: `Shift ${headerShiftGroup} (${headerOperator})`,
    header: {
      tanggal: headerTanggal,
      operator: headerOperator,
      shift_group: headerShiftGroup,
      spk_no: headerSpk,
      waste_polos: wastePolos,
      waste_metal: wasteMetal
    },
    tabel_metalize: processedRows,
    tabel_1_rolls: processedRows,
    tabel_2_resin: [],
    anomali_rekomendasi: shiftData.anomali_rekomendasi || []
  };
}

/**
 * Normalisasi data multi-shift & multi-page setelah ekstraksi AI
 */
async function postProcessMultiShiftData(data, machineType = 'CASTING') {
  if (!data) return null;

  // Ambil data konfigurasi film, item resin, dan daftar operator resmi dari IndexedDB
  let filmConfigs = [];
  let resinItems = [];
  let operatorList = [];
  try {
    [filmConfigs, resinItems, operatorList] = await Promise.all([
      db.film_configs.toArray(),
      db.resin_items.toArray(),
      db.operator_list.toArray()
    ]);
  } catch (dbErr) {
    console.warn('Gagal membaca database master, menggunakan default:', dbErr);
  }

  let rawTanggal = data.tanggal || new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  let tanggal = formatToIndonesianDate(rawTanggal);
  let sessionName = data.session_name || `Laporan_${machineType}_${tanggal.replace(/[\s\/]/g, '_')}`;
  let shifts = [];

  // KHUSUS MESIN METALIZE
  if (machineType === 'METALIZE') {
    let rawShifts = Array.isArray(data.shifts) ? data.shifts : (data.tabel_metalize || data.header ? [data] : []);
    if (rawShifts.length === 0) {
      rawShifts = [{
        header: { tanggal, operator: 'TUKIMIN', shift_group: 'D2' },
        tabel_metalize: []
      }];
    }

    shifts = rawShifts.map((s) => processSingleMetalizeShift(s, filmConfigs, operatorList));

    let totalRolls = 0;
    let totalBahanMasukKg = 0;
    let totalHasilKg = 0;
    let totalWasteKg = 0;

    shifts.forEach(s => {
      totalRolls += s.tabel_metalize.length;
      totalBahanMasukKg += s.tabel_metalize.reduce((acc, r) => acc + (parseFloat(r.berat_bahan) || 0), 0);
      totalHasilKg += s.tabel_metalize.reduce((acc, r) => acc + (parseFloat(r.berat_hasil) || 0), 0);
      totalWasteKg += (parseFloat(s.header?.waste_polos) || 0) + (parseFloat(s.header?.waste_metal) || 0);
    });

    const balanceDiffKg = Number((totalHasilKg + totalWasteKg - totalBahanMasukKg).toFixed(2));

    return {
      name: sessionName,
      tanggal: tanggal,
      machine: 'METALIZE',
      totalShifts: shifts.length,
      totalRolls,
      totalResinKg: Number(totalBahanMasukKg.toFixed(2)), // Timbangan Kiri (Input Bahan Masuk)
      totalRollsKg: Number(totalHasilKg.toFixed(2)), // Timbangan Kanan (Output Hasil Jadi)
      totalWasteKg: Number(totalWasteKg.toFixed(2)), // Waste (Polos + Metal)
      balanceDiffKg,
      shifts
    };
  }

  // KHUSUS MESIN CASTING (DEFAULT)
  if (Array.isArray(data.shifts)) {
    shifts = data.shifts.map((s, idx) => {
      return processSingleShift({
        shift_id: s.shift_id || s.header?.shift_group || `S${idx + 1}`,
        shift_name: s.shift_name || `Shift ${idx + 1} (${s.header?.shift_group || '1'})`,
        header: s.header || {},
        tabel_1_rolls: s.tabel_1_rolls || [],
        tabel_2_resin: s.tabel_2_resin || [],
        anomali_rekomendasi: s.anomali_rekomendasi || []
      }, filmConfigs, resinItems, operatorList);
    });
  } else if (data.header || data.tabel_1_rolls) {
    shifts = [
      processSingleShift({
        shift_id: data.header?.shift_group || 'Shift 1',
        shift_name: `Shift 1 (${data.header?.shift_group || '1'})`,
        header: data.header || {},
        tabel_1_rolls: data.tabel_1_rolls || [],
        tabel_2_resin: data.tabel_2_resin || [],
        anomali_rekomendasi: data.anomali_rekomendasi || []
      }, filmConfigs, resinItems, operatorList)
    ];
  }

  if (shifts.length === 0) {
    shifts = [
      processSingleShift({
        shift_id: 'Shift 1',
        shift_name: 'Shift 1',
        header: { tanggal, shift_group: '1' },
        tabel_1_rolls: [],
        tabel_2_resin: [],
        anomali_rekomendasi: []
      }, filmConfigs, resinItems, operatorList)
    ];
  }

  // Hitung metrik akumulasi global
  let totalRolls = 0;
  let totalResinKg = 0;
  let totalRollsKg = 0;
  let totalWasteKg = 0;

  shifts.forEach(s => {
    totalRolls += s.tabel_1_rolls.length;
    totalRollsKg += s.tabel_1_rolls.reduce((acc, r) => acc + (parseFloat(r.berat_aktual) || 0), 0);
    totalWasteKg += s.tabel_1_rolls.reduce((acc, r) => {
      return acc + (parseFloat(r.sample_qc) || 0) + (parseFloat(r.start_up) || 0) + (parseFloat(r.transisi) || 0) + (parseFloat(r.bekuan) || 0) + (parseFloat(r.sesetan) || 0);
    }, 0);
    totalResinKg += s.tabel_2_resin.reduce((acc, res) => acc + (parseFloat(res.pemakaian_kg) || 0), 0);
  });

  const balanceDiffKg = Number((totalRollsKg + totalWasteKg - totalResinKg).toFixed(2));

  return {
    name: sessionName,
    tanggal: tanggal,
    machine: machineType,
    totalShifts: shifts.length,
    totalRolls,
    totalResinKg: Number(totalResinKg.toFixed(2)),
    totalRollsKg: Number(totalRollsKg.toFixed(2)),
    totalWasteKg: Number(totalWasteKg.toFixed(2)),
    balanceDiffKg,
    shifts
  };
}

/**
 * Normalisasi data satu shift
 */
function processSingleShift(shiftData, filmConfigs = [], resinItems = [], operatorList = []) {
  const header = shiftData.header || {};
  const rolls = Array.isArray(shiftData.tabel_1_rolls) ? shiftData.tabel_1_rolls : [];
  const resin = Array.isArray(shiftData.tabel_2_resin) ? shiftData.tabel_2_resin : [];
  const anomali = Array.isArray(shiftData.anomali_rekomendasi) ? shiftData.anomali_rekomendasi : [];

  const headerOperator = matchMasterOperator(header.operator, header.shift_group, operatorList, 'CASTING');
  const headerTanggal = formatToIndonesianDate(header.tanggal || '');
  const headerSpk = standardizeSpkNumber(header.spk_no || '');

  const processedRolls = rolls.map((r, idx) => {
    const thick = parseFloat(r.thickness) || 0;
    const width = parseFloat(r.width) || 0;
    const length = parseFloat(r.length) || 0;
    const beratAktual = parseFloat(r.berat_aktual) || 0;
    let noLot = (r.no_lot || '').replace(/[\/\.\s]/g, '').toUpperCase();

    // Auto-match formula dengan Master Database Data Configuration
    const matched = matchMasterFormula(r.kode_formula || r.type_film || r.jenis, noLot, filmConfigs);
    const kodeFormula = matched.kodeFormula || (noLot.length >= 3 ? noLot.substring(0, 3) : 'M07');
    const jenis = matched.jenis || r.jenis || 'CPP';
    const density = parseFloat(matched.density) || 0.91;

    const beratTeori = Number(((thick * width * length * density) / 1000000).toFixed(2));
    const beratSelisih = Number((beratTeori - beratAktual).toFixed(2));

    let qStatus = (r.quality_status || '').toUpperCase().trim();
    if (qStatus === 'PASS' || qStatus === 'OK') qStatus = '';

    // Sanitasi downtime murni angka
    let dtVal = '';
    if (r.downtime !== undefined && r.downtime !== null && r.downtime !== '') {
      const numMatch = String(r.downtime).match(/\d+/);
      dtVal = numMatch ? Number(numMatch[0]) : '';
    }

    let timeMinutes = r.time_menit;
    if (!timeMinutes && r.start_time && r.finish_time) {
      timeMinutes = calculateDuration(r.start_time, r.finish_time);
    }

    return {
      ...r,
      id: idx + 1,
      tanggal: formatToIndonesianDate(r.tanggal || headerTanggal),
      operator: matchMasterOperator(r.operator || headerOperator, r.group_shift || header.shift_group, operatorList, 'CASTING'),
      group_shift: r.group_shift || header.shift_group || '',
      start_time: r.start_time || '',
      finish_time: r.finish_time || '',
      time_menit: timeMinutes || '',
      spk_no: standardizeSpkNumber(r.spk_no || headerSpk),
      no_lot: noLot,
      jenis: jenis,
      kode_formula: kodeFormula,
      thickness: thick,
      width: width,
      length: length,
      berat_aktual: beratAktual,
      berat_teori: beratTeori,
      berat_selisih: beratSelisih,
      downtime: dtVal,
      downtime_ket: r.downtime_ket || '',
      no_batch: '',
      tanda: '',
      no_pack: '',
      quality_status: qStatus,
      keterangan_hasil: r.keterangan_hasil || '',
      lokasi_jumbo: '',
      posisi_jumbo: '',
      sample_qc: parseFloat(r.sample_qc) || 0,
      start_up: parseFloat(r.start_up) || 0,
      transisi: parseFloat(r.transisi) || 0,
      bekuan: parseFloat(r.bekuan) || 0,
      sesetan: parseFloat(r.sesetan) || 0
    };
  });

  // Safety De-duplication: Jangan biarkan AI menduplikasi Waste Startup / Bekuan shift ke setiap baris roll!
  if (processedRolls.length > 1) {
    const firstStartup = processedRolls[0].start_up;
    if (firstStartup > 0 && processedRolls.slice(1).every(r => r.start_up === firstStartup)) {
      for (let i = 1; i < processedRolls.length; i++) processedRolls[i].start_up = 0;
    }

    const firstBekuan = processedRolls[0].bekuan;
    if (firstBekuan > 0 && processedRolls.slice(1).every(r => r.bekuan === firstBekuan)) {
      for (let i = 1; i < processedRolls.length; i++) processedRolls[i].bekuan = 0;
    }
  }

  const processedResin = resin.map((res, idx) => ({
    id: idx + 1,
    tanggal: res.tanggal || header.tanggal || '',
    no_urut: '',
    tujuan: 'BAHAN',
    keterangan: res.keterangan || '',
    nama_resin: matchMasterResin(res.nama_resin, resinItems),
    pemakaian_kg: parseFloat(res.pemakaian_kg) || 0,
    group_shift: res.group_shift || header.shift_group || ''
  }));

  // Filter anomali yang valid (hanya yang nilai perubahannya >= 5 kg)
  const validAnomali = (anomali || []).filter(a => {
    if (!a.nilai_rekomendasi || a.nilai_rekomendasi === a.nilai_terbaca) return false;
    const diff = Math.abs(Number(a.nilai_rekomendasi) - Number(a.nilai_terbaca));
    return diff >= 5;
  });

  return {
    shift_id: shiftData.shift_id || header.shift_group || 'Shift 1',
    shift_name: shiftData.shift_name || `Shift (${header.shift_group || '1'})`,
    header,
    tabel_1_rolls: processedRolls,
    tabel_2_resin: processedResin,
    anomali_rekomendasi: validAnomali
  };
}

function calculateDuration(startTimeStr, finishTimeStr) {
  if (!startTimeStr || !finishTimeStr) return 0;
  const p1 = String(startTimeStr).trim().split(':').map(Number);
  const p2 = String(finishTimeStr).trim().split(':').map(Number);
  if (p1.length < 2 || p2.length < 2) return 0;
  const [h1, m1] = p1;
  const [h2, m2] = p2;
  if (isNaN(h1) || isNaN(m1) || isNaN(h2) || isNaN(m2)) return 0;
  if (h1 < 0 || h1 > 23 || m1 < 0 || m1 > 59 || h2 < 0 || h2 > 23 || m2 < 0 || m2 > 59) return 0;

  let min1 = h1 * 60 + m1;
  let min2 = h2 * 60 + m2;
  if (min2 < min1) {
    min2 += 24 * 60;
  }
  const diff = min2 - min1;
  return (diff >= 0 && diff <= 24 * 60) ? diff : 0;
}
