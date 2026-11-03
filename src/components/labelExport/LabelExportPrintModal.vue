<template>
  <div>
    <!-- SCREEN PREVIEW MODAL -->
    <div
      v-if="store.isPrintModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto animate-fade-in"
      @click="store.closePrintModal"
    >
      <div
        class="bg-white rounded-2xl shadow-2xl max-w-5xl w-full p-4 sm:p-5 flex flex-col max-h-[96vh] overflow-hidden border border-slate-200"
        @click.stop
      >
        <!-- Modal Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-slate-100 shrink-0">
          <div class="flex items-center gap-2">
            <span class="text-xl">🖨️</span>
            <div>
              <h3 class="text-base font-black text-slate-900">
                Pratinjau Cetak Label Export ({{ printRolls.length }} Data Roll / {{ printPages.length }} Lembar Halaman)
              </h3>
              <p class="text-[11px] text-slate-500">
                1 Roll = 3 Stiker | 1 Lembar = 6 Petak Potong (2 Kolom × 3 Baris). Format simetris & presisi.
              </p>
            </div>
          </div>

          <!-- Paper Size Selector & Close -->
          <div class="flex items-center gap-2 self-end sm:self-auto">
            <!-- Paper Option Selector (F4 Priority) -->
            <div class="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
              <span class="text-[10px] text-slate-500 font-bold uppercase px-1">Kertas:</span>
              <button
                type="button"
                @click="selectedPaper = 'F4'"
                :class="[
                  'px-2.5 py-1 rounded-lg transition-all cursor-pointer font-bold',
                  selectedPaper === 'F4' ? 'bg-blue-600 text-white shadow-xs font-black' : 'text-slate-600 hover:text-slate-900'
                ]"
                title="Maksimalkan lebar stiker untuk ukuran kertas F4 / Folio (208mm)"
              >
                F4 / Folio (Maksimal)
              </button>
              <button
                type="button"
                @click="selectedPaper = 'A4'"
                :class="[
                  'px-2.5 py-1 rounded-lg transition-all cursor-pointer font-bold',
                  selectedPaper === 'A4' ? 'bg-blue-600 text-white shadow-xs font-black' : 'text-slate-600 hover:text-slate-900'
                ]"
                title="Sesuaikan lebar stiker untuk ukuran kertas A4 (202mm)"
              >
                A4
              </button>
            </div>

            <button
              @click="store.closePrintModal"
              class="text-slate-400 hover:text-slate-600 font-bold text-lg p-1 cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        <!-- Clean Print Guide Banner -->
        <div class="my-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between text-[11px] text-blue-900">
          <div class="flex items-center gap-1.5">
            <span>💡</span>
            <span>
              <strong>Petunjuk Cetak Maksimal & Bersih:</strong> Di dialog cetak browser, <u>HILANGKAN CENTANG "Header dan footer"</u> (agar tidak ada teks tanggal/URL di sudut) dan pilih <u>Margin: Minimum / Tidak Ada</u>.
            </span>
          </div>
          <span class="font-mono font-bold text-blue-700 uppercase shrink-0 ml-2">
            Mode {{ selectedPaper }}
          </span>
        </div>

        <!-- Preview Body (Scrollable Screen Mockup of Printed Sheets) -->
        <div class="my-1 space-y-6 overflow-y-auto flex-1 pr-1 bg-slate-100 p-3 sm:p-4 rounded-xl border border-slate-200">
          <div
            v-for="(page, pIdx) in printPages"
            :key="pIdx"
            class="bg-white p-4 sm:p-5 rounded-xl shadow-md border border-slate-300 max-w-4xl mx-auto space-y-2"
          >
            <div class="flex items-center justify-between text-[11px] font-bold text-blue-900 pb-1.5 border-b border-slate-200">
              <span class="flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-blue-600"></span>
                <span>Lembar Ke-{{ pIdx + 1 }} dari {{ printPages.length }} (Ukuran: {{ selectedPaper }})</span>
              </span>
              <span class="font-mono text-slate-600">
                {{ page.cells.filter(c => c.item).length }} Stiker Terisi
              </span>
            </div>

            <!-- 2 Columns x 3 Rows Sticker Sheet Grid with Centered Cut Guidelines -->
            <div class="sheet-grid-preview">
              <div
                v-for="(cell, cIdx) in page.cells"
                :key="cIdx"
                class="sticker-outer-preview"
              >
                <!-- Physical Sticker Design (Only if cell has item) -->
                <div v-if="cell.item" class="sticker-card">
                  <!-- Header: Logo Trivesta (Kiri, margin 0), Judul Jenis di TENGAH ATAS (Satu Baris) -->
                  <div class="sticker-header-centered">
                    <div class="header-logo-box">
                      <img :src="trivestaLogoUrl" alt="Trivesta Logo" class="header-logo-img" />
                    </div>
                    <div class="header-center-title">
                      {{ cell.item.jenisDisplay || 'MET CPP FILM' }}
                    </div>
                    <!-- Right spacer for perfect center symmetry -->
                    <div class="header-spacer-box"></div>
                  </div>

                  <!-- Spec Table 2 Columns with Perfectly Centered Symmetrical Colons (:) -->
                  <div class="sticker-table-container">
                    <table class="sticker-spec-table">
                      <tbody>
                        <tr>
                          <td class="cell-lbl">Type</td>
                          <td class="cell-colon">:</td>
                          <td class="cell-val font-bold font-mono">{{ cell.item.type || '-' }}</td>
                          
                          <td class="cell-lbl border-left-sep">Treatment</td>
                          <td class="cell-colon">:</td>
                          <td class="cell-val font-bold text-red-600">{{ cell.item.treatment || '-' }}</td>
                        </tr>
                        <tr>
                          <td class="cell-lbl">Thickness</td>
                          <td class="cell-colon">:</td>
                          <td class="cell-val font-mono">{{ cell.item.thickness !== '' && cell.item.thickness !== null ? cell.item.thickness : '-' }}</td>
                          
                          <td class="cell-lbl border-left-sep">Netto</td>
                          <td class="cell-colon">:</td>
                          <td class="cell-val font-mono">{{ cell.item.netto || '-' }}</td>
                        </tr>
                        <tr>
                          <td class="cell-lbl">Width</td>
                          <td class="cell-colon">:</td>
                          <td class="cell-val font-mono">{{ cell.item.width !== '' && cell.item.width !== null ? cell.item.width : '-' }}</td>
                          
                          <td class="cell-lbl border-left-sep">Core</td>
                          <td class="cell-colon">:</td>
                          <td class="cell-val font-mono">{{ cell.item.core || '-' }}</td>
                        </tr>
                        <tr>
                          <td class="cell-lbl">Length</td>
                          <td class="cell-colon">:</td>
                          <td class="cell-val font-mono">{{ cell.item.length ? formatCommas(cell.item.length) : '-' }}</td>
                          
                          <td class="cell-lbl border-left-sep">Join</td>
                          <td class="cell-colon">:</td>
                          <td class="cell-val font-bold font-mono">{{ cell.item.join !== undefined && cell.item.join !== '' ? cell.item.join : '0' }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <!-- Roll ID Band -->
                  <div class="sticker-roll-id-band">
                    Roll ID
                  </div>

                  <!-- Barcode 1: Code Pack -->
                  <div class="barcode-box-1">
                    <LabelExportBarcode
                      :value="cell.item.codePack"
                      :height="22"
                      width="68%"
                      textSize="9px"
                    />
                  </div>

                  <!-- Barcode 2: Nomor OK -->
                  <div class="barcode-box-2">
                    <LabelExportBarcode
                      :value="cell.item.nomorOk"
                      :height="30"
                      width="94%"
                      textSize="10px"
                    />
                  </div>
                </div>

                <!-- Empty Slot (Shows subtle placeholder for cutting template) -->
                <div v-else class="empty-sticker-slot">
                  <span class="text-[9.5px] font-mono text-slate-300 select-none">
                    [ Slot Kosong ]
                  </span>
                </div>
              </div>
            </div>

            <!-- Bottom Margin Note -->
            <div class="text-[9.5px] text-slate-400 italic text-center pt-1 select-none">
              (Area bawah kosong alami sesuai rasio asli landscape)
            </div>
          </div>
        </div>

        <!-- Action Footer -->
        <div class="flex items-center justify-between pt-2.5 border-t border-slate-100 shrink-0">
          <div class="text-[11px] text-slate-500">
            Total cetak: <strong class="text-slate-900">{{ printRolls.length * 3 }} Stiker</strong> ({{ printPages.length }} Lembar {{ selectedPaper }}).
          </div>
          <div class="flex items-center gap-2">
            <button
              @click="store.closePrintModal"
              class="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
            >
              Tutup
            </button>
            <button
              @click="triggerBrowserPrint"
              class="px-6 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/25 flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <span>🖨️ Cetak ke Printer</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- DEDICATED TELEPORTED PRINT CONTAINER (STRICT MEDIA PRINT ISOLATION) -->
    <teleport to="body">
      <div v-if="store.isPrintModalOpen" id="labelExportPrintArea">
        <div
          v-for="(page, pIdx) in printPages"
          :key="pIdx"
          class="export-print-page"
        >
          <!-- 6-Cell Sheet Grid: Scaled to Full Width for F4 or A4 -->
          <div :class="['export-sheet-grid', selectedPaper === 'F4' ? 'grid-f4' : 'grid-a4']">
            <div
              v-for="(cell, cIdx) in page.cells"
              :key="cIdx"
              :class="['export-sticker-cell', selectedPaper === 'F4' ? 'cell-f4' : 'cell-a4']"
            >
              <!-- Physical Sticker in Print Engine -->
              <div v-if="cell.item" :class="['print-sticker-card', selectedPaper === 'F4' ? 'card-f4' : 'card-a4']">
                <!-- Header: Logo Trivesta (Kiri, margin 0), Judul Jenis di TENGAH ATAS (Satu Baris Penuh) -->
                <div class="print-sticker-header-centered">
                  <div class="print-header-logo-box">
                    <img :src="trivestaLogoUrl" alt="Trivesta Logo" class="print-header-logo-img" />
                  </div>
                  <div class="print-header-center-title">
                    {{ cell.item.jenisDisplay || 'MET CPP FILM' }}
                  </div>
                  <!-- Right spacer for center symmetry -->
                  <div class="print-header-spacer-box"></div>
                </div>

                <!-- Spec Table 2 Columns with Symmetrical Colons (:) -->
                <div class="print-sticker-table-container">
                  <table class="print-sticker-spec-table">
                    <tbody>
                      <tr>
                        <td class="p-cell-lbl">Type</td>
                        <td class="p-cell-colon">:</td>
                        <td class="p-cell-val font-bold font-mono">{{ cell.item.type || '-' }}</td>
                        
                        <td class="p-cell-lbl p-border-left">Treatment</td>
                        <td class="p-cell-colon">:</td>
                        <td class="p-cell-val font-bold print-red">{{ cell.item.treatment || '-' }}</td>
                      </tr>
                      <tr>
                        <td class="p-cell-lbl">Thickness</td>
                        <td class="p-cell-colon">:</td>
                        <td class="p-cell-val font-mono">{{ cell.item.thickness !== '' && cell.item.thickness !== null ? cell.item.thickness : '-' }}</td>
                        
                        <td class="p-cell-lbl p-border-left">Netto</td>
                        <td class="p-cell-colon">:</td>
                        <td class="p-cell-val font-mono">{{ cell.item.netto || '-' }}</td>
                      </tr>
                      <tr>
                        <td class="p-cell-lbl">Width</td>
                        <td class="p-cell-colon">:</td>
                        <td class="p-cell-val font-mono">{{ cell.item.width !== '' && cell.item.width !== null ? cell.item.width : '-' }}</td>
                        
                        <td class="p-cell-lbl p-border-left">Core</td>
                        <td class="p-cell-colon">:</td>
                        <td class="p-cell-val font-mono">{{ cell.item.core || '-' }}</td>
                      </tr>
                      <tr>
                        <td class="p-cell-lbl">Length</td>
                        <td class="p-cell-colon">:</td>
                        <td class="p-cell-val font-mono">{{ cell.item.length ? formatCommas(cell.item.length) : '-' }}</td>
                        
                        <td class="p-cell-lbl p-border-left">Join</td>
                        <td class="p-cell-colon">:</td>
                        <td class="p-cell-val font-bold font-mono">{{ cell.item.join !== undefined && cell.item.join !== '' ? cell.item.join : '0' }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <!-- Roll ID Header Band -->
                <div class="print-sticker-roll-id-band">
                  Roll ID
                </div>

                <!-- Barcode 1: Code Pack -->
                <div class="print-barcode-box-1">
                  <LabelExportBarcode
                    :value="cell.item.codePack"
                    :height="21"
                    width="66%"
                    textSize="8.5pt"
                  />
                </div>

                <!-- Barcode 2: Nomor OK -->
                <div class="print-barcode-box-2">
                  <LabelExportBarcode
                    :value="cell.item.nomorOk"
                    :height="29"
                    width="92%"
                    textSize="9.5pt"
                  />
                </div>
              </div>

              <!-- Empty Cell in Print (Keeps dashed cut lines intact, no sticker printed) -->
              <div v-else class="print-empty-slot"></div>
            </div>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue';
import { useLabelExportStore } from '@/stores/labelExportStore';
import LabelExportBarcode from './LabelExportBarcode.vue';
import trivestaLogoUrl from '@/assets/trivesta-logo.png';

const store = useLabelExportStore();
const selectedPaper = ref('F4'); // Default F4 sesuai permintaan pengguna

const printRolls = computed(() => store.printItems || []);

const formatCommas = (val) => {
  if (!val && val !== 0) return '0';
  return Number(val).toLocaleString('en-US');
};

/**
 * Aturan Lembar Cetak Presisi:
 * 1 lembar memuat template 6 sel (2 kolom x 3 baris).
 * Sesuai urutan runtut:
 * - Label 1 (3 stiker): r1c1, r1c2, r2c1
 * - Label 2 (3 stiker): r2c2, r3c1, r3c2
 * (r = row, c = coloumn)
 */
const printPages = computed(() => {
  const rolls = printRolls.value;
  const pages = [];

  for (let i = 0; i < rolls.length; i += 2) {
    const roll1 = rolls[i];
    const roll2 = rolls[i + 1] || null;

    // Selalu siapkan array 6 slot untuk menjaga bentuk grid template potong 2x3
    const cells = Array.from({ length: 6 }, () => ({ item: null }));

    // Label 1 mengisi slot r1c1, r1c2, r2c1 (indeks 0, 1, 2)
    if (roll1) {
      cells[0] = { item: roll1, stickerIndex: 1 };
      cells[1] = { item: roll1, stickerIndex: 2 };
      cells[2] = { item: roll1, stickerIndex: 3 };
    }

    // Label 2 mengisi slot r2c2, r3c1, r3c2 (indeks 3, 4, 5)
    if (roll2) {
      cells[3] = { item: roll2, stickerIndex: 1 };
      cells[4] = { item: roll2, stickerIndex: 2 };
      cells[5] = { item: roll2, stickerIndex: 3 };
    }

    pages.push({
      pageIndex: Math.floor(i / 2) + 1,
      rolls: [roll1, roll2].filter(Boolean),
      cells
    });
  }

  return pages;
});

const triggerBrowserPrint = () => {
  const originalTitle = document.title;
  // Kosongkan judul halaman sementara agar Chromium tidak mencetak teks di sudut kertas
  document.title = '';
  nextTick(() => {
    window.print();
    setTimeout(() => {
      document.title = originalTitle;
    }, 1200);
  });
};
</script>

<style scoped>
/* ── SCREEN PREVIEW STYLES ── */
.sheet-grid-preview {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  border: 1.5px dashed #4b5563; /* Garis batas luar lembar potong */
  background-color: #ffffff;
  box-sizing: border-box;
}

/* Garis bantu potong di antara dua stiker (tidak mepet outline) */
.sticker-outer-preview {
  padding: 10px 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #ffffff;
  box-sizing: border-box;
  min-height: 250px;
}

/* Garis putus vertikal tunggal di antara kolom kiri dan kolom kanan */
.sticker-outer-preview:nth-child(odd) {
  border-right: 1.5px dashed #4b5563;
}

/* Garis putus horizontal tunggal di antara baris 1, 2, dan 3 */
.sticker-outer-preview:nth-child(1),
.sticker-outer-preview:nth-child(2),
.sticker-outer-preview:nth-child(3),
.sticker-outer-preview:nth-child(4) {
  border-bottom: 1.5px dashed #4b5563;
}

.sticker-card {
  width: 100%;
  max-width: 395px;
  border: 1.5px solid #000000;
  background-color: #ffffff;
  color: #000000;
  padding: 6px 8px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  user-select: none;
}

.empty-sticker-slot {
  width: 100%;
  height: 240px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fafafa;
}

/* Header: Logo di kiri (margin 0), judul di tengah satu baris penuh */
.sticker-header-centered {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 2px;
  border-bottom: 1.5px solid #000000;
  margin: 0;
}

.header-logo-box,
.header-spacer-box {
  width: 78px;
  flex-shrink: 0;
  margin: 0;
  padding: 0;
}

.header-logo-img {
  height: 48px;
  max-width: 78px;
  object-fit: contain;
  object-position: left center;
  display: block;
  margin: 0;
  padding: 0;
}

.header-center-title {
  flex: 1;
  text-align: center;
  font-family: 'Arial Black', Impact, Arial, sans-serif;
  font-size: 14.5px;
  font-weight: 900;
  text-transform: uppercase;
  white-space: nowrap !important;
  line-height: 1.1;
  padding: 0 4px;
}

.sticker-table-container {
  border-bottom: 1.5px solid #000000;
}

.sticker-spec-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 10px;
}

.sticker-spec-table td {
  padding: 1.5px 3px;
  border-top: 1px solid #000000;
}

.sticker-spec-table tr:first-child td {
  border-top: none;
}

/* Kolom Simetris Sempurna */
.cell-lbl {
  width: 22%;
  font-weight: 700;
  text-align: left;
  white-space: nowrap;
}

.cell-colon {
  width: 6%;
  font-weight: 700;
  text-align: center;
  white-space: nowrap;
}

.cell-val {
  width: 22%;
  text-align: center;
  white-space: nowrap;
}

.border-left-sep {
  border-left: 1.5px solid #000000;
}

.sticker-roll-id-band {
  text-align: center;
  font-weight: 800;
  font-size: 10.5px;
  border-bottom: 1.5px solid #000000;
  padding: 1.5px 0;
  letter-spacing: 0.5px;
}

.barcode-box-1 {
  padding: 2.5px 0;
  border-bottom: 1.5px solid #000000;
  display: flex;
  justify-content: center;
}

.barcode-box-2 {
  padding: 3px 0 1.5px 0;
  display: flex;
  justify-content: center;
}
</style>

<style>
/* ── STRICT PRINT ISOLATION & FULL WIDTH FOR F4 / A4 ── */
@media print {
  @page {
    /* size: auto memungkinkan printer memilih F4 atau A4 tanpa paksaan */
    size: auto;
    /* margin: 0mm menghilangkan header/footer otomatis browser (URL, tanggal, title) */
    margin: 0mm !important;
  }

  html, body {
    margin: 0 !important;
    padding: 0 !important;
    background: #ffffff !important;
    width: 100% !important;
    height: auto !important;
  }

  #app,
  body > *:not(#labelExportPrintArea) {
    display: none !important;
  }

  #labelExportPrintArea {
    display: block !important;
    position: static !important;
    width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
    background: transparent !important;
  }

  .export-print-page {
    margin: 3mm auto 0 auto !important;
    padding: 0 !important;
    page-break-after: always !important;
    break-after: page !important;
    page-break-inside: avoid !important;
    break-inside: avoid !important;
    box-sizing: border-box !important;
    display: flex !important;
    justify-content: center !important;
    align-items: flex-start !important;
  }

  .export-print-page:last-child {
    page-break-after: avoid !important;
    break-after: avoid !important;
  }

  /* ── MODE 1: KERTAS F4 / FOLIO (215mm x 330mm) - MAKSIMAL LEBAR (208mm) ── */
  .grid-f4 {
    display: grid !important;
    grid-template-columns: 104mm 104mm !important;
    grid-template-rows: 73mm 73mm 73mm !important;
    width: 208mm !important;
    height: 219mm !important;
    margin: 0 auto !important;
    border: 1.5px dashed #4b5563 !important;
    box-sizing: border-box !important;
  }

  .cell-f4 {
    width: 104mm !important;
    height: 73mm !important;
    padding: 2mm !important;
    box-sizing: border-box !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    background: transparent !important;
  }

  .cell-f4:nth-child(odd) {
    border-right: 1.5px dashed #4b5563 !important;
  }

  .cell-f4:nth-child(1),
  .cell-f4:nth-child(2),
  .cell-f4:nth-child(3),
  .cell-f4:nth-child(4) {
    border-bottom: 1.5px dashed #4b5563 !important;
  }

  .card-f4 {
    width: 100mm !important;
    height: 69mm !important;
    border: 1.5px solid #000000 !important;
    box-sizing: border-box !important;
    padding: 1.5mm 2.2mm !important;
    display: flex !important;
    flex-direction: column !important;
    justify-content: space-between !important;
    background: #ffffff !important;
    color: #000000 !important;
  }

  .cell-f4 .print-empty-slot {
    width: 100mm !important;
    height: 69mm !important;
    background: transparent !important;
  }

  /* ── MODE 2: KERTAS A4 (210mm x 297mm) - FIT LEBAR (202mm) ── */
  .grid-a4 {
    display: grid !important;
    grid-template-columns: 101mm 101mm !important;
    grid-template-rows: 71mm 71mm 71mm !important;
    width: 202mm !important;
    height: 213mm !important;
    margin: 0 auto !important;
    border: 1.5px dashed #4b5563 !important;
    box-sizing: border-box !important;
  }

  .cell-a4 {
    width: 101mm !important;
    height: 71mm !important;
    padding: 2mm !important;
    box-sizing: border-box !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    background: transparent !important;
  }

  .cell-a4:nth-child(odd) {
    border-right: 1.5px dashed #4b5563 !important;
  }

  .cell-a4:nth-child(1),
  .cell-a4:nth-child(2),
  .cell-a4:nth-child(3),
  .cell-a4:nth-child(4) {
    border-bottom: 1.5px dashed #4b5563 !important;
  }

  .card-a4 {
    width: 97mm !important;
    height: 67mm !important;
    border: 1.5px solid #000000 !important;
    box-sizing: border-box !important;
    padding: 1.5mm 2mm !important;
    display: flex !important;
    flex-direction: column !important;
    justify-content: space-between !important;
    background: #ffffff !important;
    color: #000000 !important;
  }

  .cell-a4 .print-empty-slot {
    width: 97mm !important;
    height: 67mm !important;
    background: transparent !important;
  }

  /* ── INTERNAL STICKER ELEMENTS ── */
  .print-sticker-header-centered {
    display: flex !important;
    align-items: center !important;
    justify-content: space-between !important;
    padding-bottom: 0.8mm !important;
    border-bottom: 1.2px solid #000000 !important;
    margin: 0 !important;
    height: 14mm !important;
  }

  .print-header-logo-box,
  .print-header-spacer-box {
    width: 25mm !important;
    flex-shrink: 0 !important;
    margin: 0 !important;
    padding: 0 !important;
  }

  .print-header-logo-img {
    height: 14mm !important;
    max-width: 25mm !important;
    object-fit: contain !important;
    object-position: left center !important;
    display: block !important;
    margin: 0 !important;
    padding: 0 !important;
  }

  .print-header-center-title {
    flex: 1 !important;
    text-align: center !important;
    font-family: 'Arial Black', Impact, Arial, sans-serif !important;
    font-size: 14pt !important;
    font-weight: 900 !important;
    text-transform: uppercase !important;
    white-space: nowrap !important;
    line-height: 1 !important;
    padding: 0 1mm !important;
    color: #000000 !important;
  }

  .print-sticker-table-container {
    border-bottom: 1.2px solid #000000 !important;
  }

  .print-sticker-spec-table {
    width: 100% !important;
    border-collapse: collapse !important;
    font-size: 8.8pt !important;
  }

  .print-sticker-spec-table td {
    padding: 0.7mm 1.2mm !important;
    border-top: 1px solid #000000 !important;
    line-height: 1.15 !important;
  }

  .print-sticker-spec-table tr:first-child td {
    border-top: none !important;
  }

  .p-cell-lbl {
    width: 22% !important;
    font-weight: 700 !important;
    text-align: left !important;
    white-space: nowrap !important;
  }

  .p-cell-colon {
    width: 5% !important;
    font-weight: 700 !important;
    text-align: center !important;
    white-space: nowrap !important;
  }

  .p-cell-val {
    width: 23% !important;
    text-align: center !important;
    white-space: nowrap !important;
  }

  .p-border-left {
    border-left: 1.2px solid #000000 !important;
  }

  .print-red {
    color: #dc2626 !important;
    font-weight: 800 !important;
  }

  .print-sticker-roll-id-band {
    text-align: center !important;
    font-weight: 900 !important;
    font-size: 8.8pt !important;
    border-bottom: 1.2px solid #000000 !important;
    padding: 0.6mm 0 !important;
    letter-spacing: 0.5px !important;
    line-height: 1 !important;
  }

  .print-barcode-box-1 {
    padding: 0.8mm 0 !important;
    border-bottom: 1.2px solid #000000 !important;
    display: flex !important;
    justify-content: center !important;
    align-items: center !important;
  }

  .print-barcode-box-2 {
    padding: 0.8mm 0 0.4mm 0 !important;
    display: flex !important;
    justify-content: center !important;
    align-items: center !important;
  }
}
</style>
