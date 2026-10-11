<template>
  <div>
    <!-- MODAL PRATINJAU DI LAYAR (SCREEN PREVIEW) -->
    <teleport to="body">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-zinc-950/70 backdrop-blur-xs animate-fade-in print:hidden"
        @click.self="closeModal"
      >
        <div class="bg-white rounded-2xl border border-zinc-200 shadow-2xl w-full max-w-4xl max-h-[94vh] flex flex-col overflow-hidden">
          
          <!-- Modal Toolbar -->
          <div class="px-5 py-3.5 bg-zinc-50 border-b border-zinc-200 flex items-center justify-between shrink-0">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center font-black text-xs">
                FPB
              </div>
              <div>
                <h3 class="text-xs font-black text-zinc-900 uppercase">Pratinjau Cetak FPB Resmi</h3>
                <p class="text-[10.5px] text-zinc-500 font-mono">
                  <span v-if="documentsToPrint.length === 1">
                    1 Dokumen FPB • {{ documentsToPrint[0]?.nomorFpb || '-' }}
                  </span>
                  <span v-else>
                    Batch Cetak: {{ documentsToPrint.length }} Dokumen FPB Terpilih
                  </span>
                </p>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <button
                type="button"
                @click="handlePrint"
                class="px-4 py-1.5 rounded-lg text-xs font-black bg-zinc-900 hover:bg-black text-white shadow-xs cursor-pointer flex items-center gap-1.5 transition-colors"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
                <span>Cetak / Print (Ctrl+P)</span>
              </button>
              <button
                type="button"
                @click="closeModal"
                class="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-800 hover:bg-zinc-200 transition-colors cursor-pointer"
                title="Tutup"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
          </div>

          <!-- Preview Area Layar -->
          <div class="flex-1 overflow-y-auto p-4 sm:p-6 bg-zinc-100/70">
            <div class="space-y-8">
              <div
                v-for="(sheet, sheetIdx) in printSheets"
                :key="'sheet-' + sheetIdx"
                class="bg-white p-5 sm:p-6 border border-zinc-300 shadow-md rounded-xl mx-auto max-w-[210mm] text-black font-sans space-y-4"
              >
                <div class="text-[10px] font-mono text-zinc-400 font-bold uppercase tracking-wider pb-1 border-b border-zinc-100 flex justify-between items-center">
                  <span>Lembar Fisik A4 #{{ sheetIdx + 1 }}</span>
                  <span>{{ sheet.length === 2 ? '2 FPB (Atas & Bawah)' : '1 FPB' }}</span>
                </div>

                <!-- Form 1 (Atas) -->
                <div class="fpb-preview-item">
                  <FpbFormContent :doc="sheet[0]" :print-time="printTimestamp" />
                </div>

                <!-- Garis Potong jika ada 2 form di 1 lembar -->
                <div v-if="sheet.length > 1" class="fpb-cut-separator">
                  <span class="fpb-cut-icon">✂</span>
                  <span class="fpb-cut-text">Gunting / Potong di Sini</span>
                  <span class="fpb-cut-line"></span>
                </div>

                <!-- Form 2 (Bawah jika ada) -->
                <div v-if="sheet.length > 1" class="fpb-preview-item">
                  <FpbFormContent :doc="sheet[1]" :print-time="printTimestamp" />
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </teleport>

    <!-- DEDICATED TELEPORTED PRINT CONTAINER (HANYA AKTIF SAAT BROWSER PRINT) -->
    <teleport to="body">
      <div v-if="modelValue" id="fpbPrintOnlyArea">
        <div
          v-for="(sheet, sIdx) in printSheets"
          :key="'print-sheet-' + sIdx"
          class="fpb-print-sheet"
        >
          <!-- Form 1 (Bagian Atas) -->
          <div class="fpb-form-wrapper">
            <FpbFormContent :doc="sheet[0]" :print-time="printTimestamp" />
          </div>

          <!-- Garis Potong Pemisah Form 1 & Form 2 (Hanya jika ada 2 FPB dalam 1 lembar) -->
          <div v-if="sheet.length > 1" class="fpb-print-cut-line">
            <span class="fpb-cut-scissors">✂</span>
            <span class="fpb-cut-label">Potong di sini</span>
            <div class="fpb-dashed-line"></div>
          </div>

          <!-- Form 2 (Bagian Bawah jika ada) -->
          <div v-if="sheet.length > 1" class="fpb-form-wrapper">
            <FpbFormContent :doc="sheet[1]" :print-time="printTimestamp" />
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup>
import { ref, computed, defineComponent, h } from 'vue';
import SwcLogoPrint from './SwcLogoPrint.vue';

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  fpbData: { 
    type: [Object, Array], 
    default: () => null 
  }
});

const emit = defineEmits(['update:modelValue']);

const closeModal = () => {
  emit('update:modelValue', false);
};

const formatIndoDateTime = (d) => {
  if (!d) return '-';
  try {
    const pad = (n) => String(n).padStart(2, '0');
    const day = pad(d.getDate());
    const month = pad(d.getMonth() + 1);
    const year = d.getFullYear();
    const hours = pad(d.getHours());
    const minutes = pad(d.getMinutes());
    const seconds = pad(d.getSeconds());
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  } catch {
    return '';
  }
};

const printTimestamp = ref(formatIndoDateTime(new Date()));

const handlePrint = () => {
  printTimestamp.value = formatIndoDateTime(new Date());
  window.print();
};

const documentsToPrint = computed(() => {
  if (!props.fpbData) return [];
  if (Array.isArray(props.fpbData)) {
    return props.fpbData.filter(Boolean);
  }
  return [props.fpbData];
});

// Mengelompokkan dokumen ke dalam lembar cetak (Maksimal 2 form per 1 lembar A4 fisik)
const printSheets = computed(() => {
  const docs = documentsToPrint.value;
  const sheets = [];
  for (let i = 0; i < docs.length; i += 2) {
    sheets.push(docs.slice(i, i + 2));
  }
  return sheets;
});

const formatDateIndo = (dStr) => {
  if (!dStr) return '-';
  try {
    const d = new Date(dStr);
    if (isNaN(d.getTime())) return dStr;
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
  } catch {
    return dStr;
  }
};

const getDisplayRows = (doc) => {
  const items = Array.isArray(doc?.items) ? [...doc.items] : [];
  const totalRows = Math.max(8, items.length);
  const rows = [];
  for (let i = 0; i < totalRows; i++) {
    rows.push(items[i] || { namaBarang: '', qty: '', satuan: '', keterangan: '' });
  }
  return rows;
};

// Sub-komponen Konten Form FPB (Reused untuk Screen & Print)
const FpbFormContent = defineComponent({
  name: 'FpbFormContent',
  props: {
    doc: { type: Object, required: true },
    printTime: { type: String, default: '' }
  },
  setup(compProps) {
    return () => {
      const doc = compProps.doc || {};
      const rows = getDisplayRows(doc);
      const currentTimeStr = compProps.printTime || printTimestamp.value || formatIndoDateTime(new Date());

      return h('div', { class: 'fpb-paper-box text-black font-sans leading-tight' }, [
        // 1. KOP HEADER
        h('div', { class: 'header-table' }, [
          h('div', { class: 'header-logo-box' }, [
            h(SwcLogoPrint)
          ]),
          h('div', { class: 'header-title-box' }, [
            h('div', { class: 'header-company-name' }, 'PT. SAPTAWARNA CEMERLANG'),
            h('div', { class: 'header-doc-title' }, 'PERMINTAAN PENGEBONAN BARANG (FPB)')
          ])
        ]),

        // 2. METADATA
        h('div', { class: 'metadata-section' }, [
          h('div', { class: 'meta-row' }, [
            h('span', { class: 'meta-label' }, 'Tanggal'),
            h('span', { class: 'meta-colon' }, ':'),
            h('span', { class: 'meta-value' }, formatDateIndo(doc.tanggal))
          ]),
          h('div', { class: 'meta-row' }, [
            h('span', { class: 'meta-label' }, 'Bagian/Dept'),
            h('span', { class: 'meta-colon' }, ':'),
            h('span', { class: 'meta-value uppercase' }, doc.bagianDept || '-')
          ]),
          h('div', { class: 'meta-instruction' }, 'Kepada bagian gudang harap diberikan barang dibawah ini :')
        ]),

        // 3. TABEL BARANG
        h('table', { class: 'fpb-items-table' }, [
          h('thead', [
            h('tr', [
              h('th', { class: 'col-no' }, 'NO'),
              h('th', { class: 'col-nama' }, 'NAMA BARANG'),
              h('th', { class: 'col-jumlah' }, 'JUMLAH'),
              h('th', { class: 'col-satuan' }, 'SATUAN'),
              h('th', { class: 'col-keterangan' }, 'KETERANGAN')
            ])
          ]),
          h('tbody', 
            rows.map((row, idx) => {
              return h('tr', { key: idx, class: 'fpb-item-row' }, [
                h('td', { class: 'col-no' }, row.namaBarang ? String(idx + 1) : ''),
                h('td', { class: 'col-nama' }, row.namaBarang || ''),
                h('td', { class: 'col-jumlah' }, (row.qty !== null && row.qty !== undefined && row.qty !== '') ? String(row.qty) : ''),
                h('td', { class: 'col-satuan' }, row.satuan || ''),
                h('td', { class: 'col-keterangan' }, row.keterangan || '')
              ]);
            })
          )
        ]),

        // 4. TANDA TANGAN (3 KOLOM TANPA NAMA PEMOHON)
        h('div', { class: 'signature-section' }, [
          // Dibuat
          h('div', { class: 'sig-column' }, [
            h('div', { class: 'sig-title' }, 'Dibuat'),
            h('div', { class: 'sig-bottom' }, [
              h('div', { class: 'sig-dots' }, '....................................'),
              h('div', { class: 'sig-role' }, 'Adm/staff')
            ])
          ]),
          // Diketahui
          h('div', { class: 'sig-column' }, [
            h('div', { class: 'sig-title' }, 'Diketahui'),
            h('div', { class: 'sig-bottom' }, [
              h('div', { class: 'sig-dots' }, '....................................'),
              h('div', { class: 'sig-role' }, 'Spv/Ka Dept')
            ])
          ]),
          // Diterima
          h('div', { class: 'sig-column' }, [
            h('div', { class: 'sig-title' }, 'Diterima'),
            h('div', { class: 'sig-bottom' }, [
              h('div', { class: 'sig-dots' }, '....................................'),
              h('div', { class: 'sig-role' }, 'Pihak Gudang')
            ])
          ])
        ]),

        // 5. FOOTER: NOMOR FPB DI POJOK KIRI BAWAH, TANGGAL & JAM PRINT DI POJOK KANAN BAWAH
        h('div', { class: 'footer-fpb-meta' }, [
          h('span', { class: 'footer-meta-left' }, `No. Dokumen: ${doc.nomorFpb || '-'}`),
          h('span', { class: 'footer-meta-right' }, `Dicetak: ${currentTimeStr}`)
        ])
      ]);
    };
  }
});
</script>

<style>
/* Frame pembungkus form persis seperti fisik */
.fpb-paper-box {
  border: 1.5px solid #000000;
  padding: 12px 14px 8px 14px;
  background-color: #ffffff;
  color: #000000;
  font-family: Arial, sans-serif;
  box-sizing: border-box;
}

/* Header Dua Kotak */
.header-table {
  display: flex;
  border: 1px solid #000000;
  box-sizing: border-box;
}

.header-logo-box {
  width: 28%;
  border-right: 1px solid #000000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  background-color: #ffffff;
  box-sizing: border-box;
}

.header-title-box {
  width: 72%;
  display: flex;
  flex-direction: column;
  justify-content: stretch;
  box-sizing: border-box;
}

.header-company-name {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid #000000;
  padding: 4px 6px;
  text-align: center;
  font-weight: bold;
  font-size: 13px;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  box-sizing: border-box;
}

.header-doc-title {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px 6px;
  text-align: center;
  font-weight: bold;
  font-size: 11px;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  box-sizing: border-box;
}

/* Metadata Tanggal & Bagian */
.metadata-section {
  padding-top: 10px;
  padding-bottom: 6px;
  font-size: 11px;
}

.meta-row {
  display: flex;
  align-items: center;
  margin-bottom: 3px;
}

.meta-label {
  width: 90px;
  font-weight: bold;
  color: #000000;
}

.meta-colon {
  width: 14px;
  font-weight: bold;
  text-align: center;
}

.meta-value {
  font-weight: normal;
  color: #000000;
}

.meta-instruction {
  font-size: 10.5px;
  color: #000000;
  margin-top: 4px;
  margin-bottom: 2px;
}

/* Tabel Utama Rincian Barang */
.fpb-items-table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #000000;
  margin-top: 4px;
  table-layout: fixed;
}

.fpb-items-table th,
.fpb-items-table td {
  border: 1px solid #000000;
  box-sizing: border-box;
  font-size: 10.5px;
  line-height: 1.2;
}

.fpb-items-table th {
  font-weight: bold;
  text-align: center;
  padding: 5px 4px;
  background-color: transparent;
}

.fpb-item-row {
  height: 26px;
  max-height: 26px;
}

.fpb-item-row td {
  padding: 3px 6px;
  vertical-align: middle;
  height: 26px;
}

.col-no {
  width: 36px;
  text-align: center;
  font-weight: bold;
}

.col-nama {
  width: auto;
  text-align: left;
  text-transform: uppercase;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.col-jumlah {
  width: 72px;
  text-align: center;
  font-weight: bold;
}

.col-satuan {
  width: 76px;
  text-align: center;
}

.col-keterangan {
  width: 150px;
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Kolom Tanda Tangan */
.signature-section {
  display: flex;
  justify-content: space-between;
  margin-top: 24px;
  padding: 0 10px;
}

.sig-column {
  width: 28%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  height: 94px;
  text-align: center;
  font-size: 10.5px;
}

.sig-title {
  font-weight: bold;
  color: #000000;
}

.sig-bottom {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.sig-dots {
  color: #888888;
  font-size: 9px;
  letter-spacing: 1px;
  line-height: 1;
  margin-bottom: 3px;
}

.sig-role {
  font-weight: bold;
  font-size: 9.5px;
  color: #000000;
}

.footer-fpb-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 10px;
  padding-top: 4px;
  font-family: monospace;
  font-size: 8.5px;
  color: #444444;
}

.footer-meta-left {
  text-align: left;
}

.footer-meta-right {
  text-align: right;
}

/* Preview Garis Potong (Screen) */
.fpb-cut-separator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  position: relative;
  padding: 8px 0;
  color: #71717a;
  font-size: 11px;
  font-family: monospace;
}

.fpb-cut-separator::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  border-top: 1.5px dashed #a1a1aa;
  z-index: 1;
}

.fpb-cut-icon,
.fpb-cut-text {
  position: relative;
  z-index: 2;
  background: #ffffff;
  padding: 0 8px;
  font-weight: 600;
}

/* ══════ ATURAN CETAK TERDEDIKASI (2 FORM PER 1 LEMBAR A4 FISIK) ══════ */
#fpbPrintOnlyArea {
  display: none;
}

@media print {
  @page {
    size: A4 portrait;
    margin: 5mm 7mm;
  }
  
  html, body {
    background: #ffffff !important;
    color: #000000 !important;
    margin: 0 !important;
    padding: 0 !important;
    width: 100% !important;
    height: auto !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  /* Sembunyikan seluruh UI SPA, modal preview, overlay */
  #app,
  body > *:not(#fpbPrintOnlyArea):not(#printOnlyArea) {
    display: none !important;
  }

  /* Aktifkan kontainer cetak FPB */
  #fpbPrintOnlyArea {
    display: block !important;
    position: static !important;
    width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
    background: #ffffff !important;
  }

  /* Setiap lembar cetak A4 fisik (berisi maks 2 form) */
  .fpb-print-sheet {
    display: flex !important;
    flex-direction: column !important;
    justify-content: flex-start !important;
    width: 100% !important;
    box-sizing: border-box !important;
    page-break-after: always !important;
    break-after: page !important;
    page-break-inside: avoid !important;
    break-inside: avoid !important;
    padding: 0 !important;
    margin: 0 0 0 0 !important;
  }

  .fpb-print-sheet:last-child {
    page-break-after: avoid !important;
    break-after: avoid !important;
  }

  .fpb-form-wrapper {
    width: 100% !important;
    box-sizing: border-box !important;
    page-break-inside: avoid !important;
    break-inside: avoid !important;
  }

  /* Garis potong pemisah antara Form 1 (atas) dan Form 2 (bawah) */
  .fpb-print-cut-line {
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    position: relative !important;
    height: 18px !important;
    margin: 3px 0 !important;
    box-sizing: border-box !important;
  }

  .fpb-print-cut-line::before {
    content: '' !important;
    position: absolute !important;
    top: 50% !important;
    left: 0 !important;
    right: 0 !important;
    border-top: 1px dashed #666666 !important;
    z-index: 1 !important;
  }

  .fpb-cut-scissors {
    position: relative !important;
    z-index: 2 !important;
    background-color: #ffffff !important;
    padding: 0 6px !important;
    font-size: 11px !important;
    line-height: 1 !important;
  }

  .fpb-cut-label {
    position: relative !important;
    z-index: 2 !important;
    background-color: #ffffff !important;
    padding: 0 6px !important;
    font-size: 8.5px !important;
    font-family: monospace !important;
    color: #555555 !important;
    text-transform: uppercase !important;
    letter-spacing: 0.5px !important;
  }

  .fpb-paper-box {
    box-shadow: none !important;
    width: 100% !important;
    padding: 7px 10px 4px 10px !important;
    border: 1.2px solid #000000 !important;
  }

  .metadata-section {
    padding-top: 5px !important;
    padding-bottom: 3px !important;
    font-size: 10px !important;
  }

  .meta-row {
    margin-bottom: 1.5px !important;
  }

  .meta-instruction {
    font-size: 9.5px !important;
    margin-top: 2px !important;
    margin-bottom: 1px !important;
  }

  .fpb-items-table th,
  .fpb-items-table td {
    font-size: 9.5px !important;
    padding: 1.5px 4px !important;
  }

  .fpb-item-row {
    height: 19px !important;
    max-height: 19px !important;
  }

  .fpb-item-row td {
    height: 19px !important;
    padding: 1px 4px !important;
  }

  .signature-section {
    margin-top: 10px !important;
    padding: 0 8px !important;
  }

  .sig-column {
    height: 64px !important;
    font-size: 9.5px !important;
  }

  .sig-dots {
    font-size: 8px !important;
    margin-bottom: 2px !important;
  }

  .sig-role {
    font-size: 8.5px !important;
  }

  .footer-fpb-meta {
    display: flex !important;
    align-items: center !important;
    justify-content: space-between !important;
    margin-top: 3px !important;
    font-size: 7.5px !important;
  }

  .footer-meta-left {
    text-align: left !important;
  }

  .footer-meta-right {
    text-align: right !important;
  }
}
</style>
