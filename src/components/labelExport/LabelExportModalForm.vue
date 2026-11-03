<template>
  <div
    v-if="store.isModalOpen"
    class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto animate-fade-in"
    @click="handleBackdropClick"
  >
    <div
      class="bg-white rounded-2xl shadow-2xl max-w-5xl w-full p-4 sm:p-6 flex flex-col max-h-[94vh] overflow-hidden border border-slate-200"
      @click.stop
    >
      <!-- Modal Header -->
      <div class="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 font-bold text-sm">
            🏷️
          </div>
          <div>
            <h3 class="text-base font-black text-slate-900">
              {{ store.editingItem ? 'Edit Data Label Export' : 'Tambah Label Export (Trivesta)' }}
            </h3>
            <p class="text-[11px] text-slate-500">
              Sistem label ekspor mandiri dengan integrasi penarikan otomatis dari Code Pack.
            </p>
          </div>
        </div>
        <button
          @click="store.closeModal"
          class="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-lg text-sm font-bold transition-colors cursor-pointer"
          title="Tutup"
        >
          ✕
        </button>
      </div>

      <!-- Modal Body (Two-column layout: Form Inputs on Left, Real-time Label Preview on Right) -->
      <div class="mt-3 flex-1 overflow-y-auto pr-1 grid grid-cols-1 lg:grid-cols-12 gap-4 text-xs">
        
        <!-- LEFT: Form Inputs (7 cols) -->
        <form @submit.prevent="handleSubmit" class="lg:col-span-7 space-y-3">
          
          <!-- Section 1: Code Pack & Auto-Lookup -->
          <div class="p-3 bg-gradient-to-r from-blue-50/80 to-indigo-50/60 rounded-xl border border-blue-200/80 space-y-2">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-1.5">
                <span class="w-4 h-4 rounded-full bg-blue-600 text-white font-black text-[9px] flex items-center justify-center">1</span>
                <span class="font-extrabold text-blue-950 uppercase tracking-wide text-[10.5px]">Identitas Roll & Penghubung Code Pack</span>
              </div>
              <span class="text-[9.5px] font-semibold text-blue-600">Jembatan Label Biasa</span>
            </div>

            <!-- Code Pack Input & Lookup -->
            <div class="relative">
              <label class="block font-bold text-blue-950 mb-1 text-[11px]">
                Code Pack / Roll ID <span class="text-red-500">*</span>
              </label>
              <div class="flex gap-1.5">
                <div class="relative flex-1">
                  <input
                    v-model="form.codePack"
                    @input="handleCodePackInput"
                    @focus="showSuggestions = true"
                    required
                    placeholder="Ketik Code Pack (contoh: 3B10261537)"
                    class="w-full px-3 py-1.5 text-xs font-mono font-bold uppercase rounded-lg border border-blue-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white outline-none shadow-2xs"
                  />
                  <!-- Clear button -->
                  <button
                    v-if="form.codePack"
                    type="button"
                    @click="form.codePack = ''; lookupResult = null"
                    class="absolute right-2.5 top-2 text-slate-400 hover:text-slate-700 text-xs font-bold"
                  >
                    ✕
                  </button>
                </div>

                <button
                  type="button"
                  @click="triggerManualLookup"
                  :disabled="isSearching || !form.codePack"
                  class="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-lg text-xs shadow-xs flex items-center gap-1 shrink-0 cursor-pointer transition-all"
                  title="Cari dan tarik data otomatis dari Manajemen Label Biasa"
                >
                  <span v-if="!isSearching">⚡ Tarik Data</span>
                  <span v-else class="animate-spin">⏳</span>
                </button>
              </div>

              <!-- Auto-suggestions Dropdown from Standard Labels -->
              <div
                v-if="showSuggestions && suggestions.length > 0"
                class="absolute left-0 right-0 top-full mt-1 bg-white border border-blue-200 rounded-xl shadow-xl z-20 overflow-hidden divide-y divide-slate-100 max-h-48 overflow-y-auto"
              >
                <div class="px-2.5 py-1 bg-blue-50/70 text-[9.5px] font-bold text-blue-800 flex justify-between">
                  <span>💡 Saran dari Manajemen Label Biasa</span>
                  <button type="button" @click="showSuggestions = false" class="text-slate-400 hover:text-slate-700">Tutup</button>
                </div>
                <div
                  v-for="(sug, sIdx) in suggestions"
                  :key="sIdx"
                  @click="selectSuggestion(sug)"
                  class="p-2 hover:bg-blue-50 cursor-pointer flex items-center justify-between gap-2 transition-colors"
                >
                  <div>
                    <div class="font-mono font-bold text-blue-900 text-[11px]">{{ sug.codePack }}</div>
                    <div class="text-[9.5px] text-slate-500">Lot: {{ sug.lot }} | {{ sug.spec }}</div>
                  </div>
                  <span class="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono">
                    {{ sug.spk || 'SPK -' }}
                  </span>
                </div>
              </div>

              <!-- Lookup Feedback Banner -->
              <div
                v-if="lookupBanner"
                :class="[
                  'mt-2 p-2 rounded-lg text-[10.5px] font-medium flex items-center justify-between gap-2 border animate-fade-in',
                  lookupBanner.type === 'success' ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-amber-50 border-amber-300 text-amber-900'
                ]"
              >
                <div class="flex items-center gap-1.5 truncate">
                  <span>{{ lookupBanner.type === 'success' ? '✅' : 'ℹ️' }}</span>
                  <span class="truncate">{{ lookupBanner.message }}</span>
                </div>
                <button
                  type="button"
                  @click="lookupBanner = null"
                  class="text-slate-400 hover:text-slate-700 font-bold shrink-0"
                >
                  ✕
                </button>
              </div>
            </div>

            <!-- Nomor OK -->
            <div>
              <label class="block font-bold text-blue-950 mb-0.5 text-[11px]">
                Nomor OK (Order Kerja / Lot Ekspor) <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.nomorOk"
                required
                placeholder="Contoh: CF.2610.0069-026"
                class="w-full px-3 py-1.5 text-xs font-mono font-bold uppercase rounded-lg border border-blue-300 focus:border-blue-500 bg-white outline-none shadow-2xs"
              />
              <span class="text-[9.5px] text-slate-500 block mt-0.5">
                Dicetak pada Barcode Bawah (Barcode 2) stiker.
              </span>
            </div>
          </div>

          <!-- Section 2: Spesifikasi Produk & Penamaan Otomatis -->
          <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
            <div class="flex items-center justify-between pb-1 border-b border-slate-200">
              <div class="flex items-center gap-1.5">
                <span class="w-4 h-4 rounded-full bg-slate-800 text-white font-black text-[9px] flex items-center justify-center">2</span>
                <span class="font-extrabold text-slate-900 uppercase tracking-wide text-[10.5px]">Spesifikasi & Format Ekspor</span>
              </div>
              <span class="text-[9.5px] font-semibold text-slate-500">Auto Format Type & Judul</span>
            </div>

            <!-- Row 1: Jenis Film & Kode Formula -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label class="block font-bold text-slate-900 mb-0.5 text-[11px]">
                  Jenis Film <span class="text-red-500">*</span>
                </label>
                <select
                  v-model="form.jenis"
                  @change="handleJenisChange"
                  required
                  class="w-full px-2.5 py-1.5 text-xs font-bold rounded-lg border border-slate-300 bg-white focus:border-blue-500 outline-none"
                >
                  <option value="VMCPP">VMCPP (MET CPP FILM)</option>
                  <option value="CPP">CPP (CLEAR CPP FILM)</option>
                  <option value="VMPET">VMPET (MET PET FILM)</option>
                  <option value="PET">PET (CLEAR PET FILM)</option>
                </select>
                <!-- Displayed Header Name Preview -->
                <div class="mt-1 text-[10px] text-blue-800 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200 flex justify-between">
                  <span>Judul Label:</span>
                  <span class="font-black">{{ form.jenisDisplay }}</span>
                </div>
              </div>

              <div>
                <label class="block font-bold text-slate-900 mb-0.5 text-[11px]">
                  Kode Formula (KF) <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="form.kodeFormula"
                  @input="handleFormulaInput"
                  required
                  placeholder="Contoh: M04"
                  class="w-full px-2.5 py-1.5 text-xs font-mono font-bold uppercase rounded-lg border border-slate-300 bg-white focus:border-blue-500 outline-none"
                />
                <!-- Formatted Type Preview -->
                <div class="mt-1 text-[10px] text-purple-900 font-bold bg-purple-50 px-2 py-0.5 rounded border border-purple-200 flex justify-between">
                  <span>Type di Label:</span>
                  <span class="font-black font-mono">{{ form.type || '-' }}</span>
                </div>
              </div>
            </div>

            <!-- Row 2: Dimensi (Thickness, Width, Length) -->
            <div class="grid grid-cols-3 gap-2">
              <div>
                <label class="block font-bold text-slate-900 mb-0.5 text-[11px]">
                  Thickness (mc) <span class="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="any"
                  v-model.number="form.thickness"
                  @input="recalculateFields"
                  required
                  placeholder="20"
                  class="w-full px-2 py-1.5 text-xs font-bold rounded-lg border border-slate-300 bg-white text-center focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label class="block font-bold text-slate-900 mb-0.5 text-[11px]">
                  Width (mm) <span class="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="any"
                  v-model.number="form.width"
                  @input="recalculateFields"
                  required
                  placeholder="805"
                  class="w-full px-2 py-1.5 text-xs font-bold rounded-lg border border-slate-300 bg-white text-center focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label class="block font-bold text-slate-900 mb-0.5 text-[11px]">
                  Length (m) <span class="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="any"
                  v-model.number="form.length"
                  @input="recalculateFields"
                  required
                  placeholder="8000"
                  class="w-full px-2 py-1.5 text-xs font-bold rounded-lg border border-slate-300 bg-white text-center focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            <!-- Row 3: Treatment & Join Meter -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label class="block font-bold text-slate-900 mb-0.5 text-[11px]">
                  Treatment <span class="text-red-500">*</span>
                </label>
                <select
                  v-model="form.treatment"
                  required
                  class="w-full px-2.5 py-1.5 text-xs font-bold text-red-600 rounded-lg border border-slate-300 bg-white focus:border-blue-500 outline-none"
                >
                  <option value="INSIDE">INSIDE (Warna Merah)</option>
                  <option value="OUTSIDE">OUTSIDE (Warna Merah)</option>
                  <option value="CORONA">CORONA (Warna Merah)</option>
                  <option value="NONE">NONE</option>
                </select>
              </div>

              <div>
                <label class="block font-bold text-slate-900 mb-0.5 text-[11px]" title="Posisi meteran join sambungan. Jika tidak ada diisi 0">
                  Join Meter (Posisi Sambungan) <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="form.join"
                  required
                  placeholder="0 atau meteran (misal: 6100)"
                  class="w-full px-2.5 py-1.5 text-xs font-mono font-bold rounded-lg border border-slate-300 bg-white text-center focus:border-blue-500 outline-none"
                />
                <span class="text-[9.5px] text-slate-500 block mt-0.5">
                  Isi 0 jika tidak ada sambungan, atau meteran (misal: 6100).
                </span>
              </div>
            </div>

            <!-- Row 4: Netto & Core (Auto-Calculated with manual override) -->
            <div class="grid grid-cols-2 gap-2.5 pt-1">
              <div class="p-2 bg-white rounded-lg border border-slate-200 shadow-2xs">
                <div class="flex items-center justify-between mb-0.5">
                  <label class="font-bold text-slate-800 text-[11px]">Netto (KG)</label>
                  <span class="text-[9px] text-emerald-600 font-bold">Auto Calc</span>
                </div>
                <input
                  v-model="form.netto"
                  step="any"
                  placeholder="0.00"
                  class="w-full px-2 py-1 text-xs font-mono font-bold text-slate-900 rounded border border-slate-200 text-center bg-slate-50 focus:bg-white outline-none"
                />
              </div>

              <div class="p-2 bg-white rounded-lg border border-slate-200 shadow-2xs">
                <div class="flex items-center justify-between mb-0.5">
                  <label class="font-bold text-slate-800 text-[11px]">Core (KG)</label>
                  <span class="text-[9px] text-emerald-600 font-bold">Diameter 3"</span>
                </div>
                <input
                  v-model="form.core"
                  step="any"
                  placeholder="0.00"
                  class="w-full px-2 py-1 text-xs font-mono font-bold text-slate-900 rounded border border-slate-200 text-center bg-slate-50 focus:bg-white outline-none"
                />
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              @click="store.closeModal"
              class="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              :disabled="isSubmitting"
              class="px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/25 flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <span>💾 Simpan Label Export</span>
            </button>
          </div>
        </form>

        <!-- RIGHT: Live Physical Sticker Preview (5 cols) -->
        <div class="lg:col-span-5 flex flex-col items-center">
          <div class="w-full text-center pb-1 text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
            <span>👁️ Pratinjau 1 Stiker Label</span>
            <span class="text-[9px] text-blue-600 font-mono bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
              1 Row = 3 Stiker Fisik
            </span>
          </div>

          <!-- Physical Sticker Mockup Box -->
          <div class="w-full bg-white border-2 border-black p-2.5 shadow-md flex flex-col font-sans select-none text-black">
            <!-- Header: Logo Trivesta (Kiri), Judul Jenis di TENGAH ATAS -->
            <div class="flex items-center justify-between pb-1 border-b border-black m-0 p-0">
              <div class="w-[85px] shrink-0 m-0 p-0 flex items-center justify-start">
                <img :src="trivestaLogoUrl" alt="Trivesta Logo" class="h-[52px] max-w-[85px] object-contain object-left block m-0 p-0" />
              </div>
              <div class="flex-1 text-center font-black text-sm sm:text-base uppercase tracking-tight font-sans px-1 leading-tight">
                {{ form.jenisDisplay || 'MET CPP FILM' }}
              </div>
              <div class="w-[85px] shrink-0 m-0 p-0"></div>
            </div>

            <!-- Two-Column Specification Table with Symmetrical Colons (:) -->
            <div class="border-b border-black text-[10px]">
              <table class="w-full border-collapse">
                <tbody>
                  <tr>
                    <td class="w-[22%] font-bold text-left py-0.5 px-1 whitespace-nowrap">Type</td>
                    <td class="w-[6%] font-bold text-center py-0.5 whitespace-nowrap">:</td>
                    <td class="w-[22%] font-bold font-mono text-center py-0.5 px-1 whitespace-nowrap">{{ form.type || '-' }}</td>
                    
                    <td class="w-[22%] font-bold text-left py-0.5 px-1 border-l border-black whitespace-nowrap">Treatment</td>
                    <td class="w-[6%] font-bold text-center py-0.5 whitespace-nowrap">:</td>
                    <td class="w-[22%] font-bold text-red-600 text-center py-0.5 px-1 whitespace-nowrap">{{ form.treatment || '-' }}</td>
                  </tr>
                  <tr class="border-t border-black">
                    <td class="font-bold text-left py-0.5 px-1 whitespace-nowrap">Thickness</td>
                    <td class="font-bold text-center py-0.5 whitespace-nowrap">:</td>
                    <td class="font-mono text-center py-0.5 px-1 whitespace-nowrap">{{ form.thickness !== '' && form.thickness !== null ? form.thickness : '-' }}</td>
                    
                    <td class="font-bold text-left py-0.5 px-1 border-l border-black whitespace-nowrap">Netto</td>
                    <td class="font-bold text-center py-0.5 whitespace-nowrap">:</td>
                    <td class="font-mono text-center py-0.5 px-1 whitespace-nowrap">{{ form.netto || '-' }}</td>
                  </tr>
                  <tr class="border-t border-black">
                    <td class="font-bold text-left py-0.5 px-1 whitespace-nowrap">Width</td>
                    <td class="font-bold text-center py-0.5 whitespace-nowrap">:</td>
                    <td class="font-mono text-center py-0.5 px-1 whitespace-nowrap">{{ form.width !== '' && form.width !== null ? form.width : '-' }}</td>
                    
                    <td class="font-bold text-left py-0.5 px-1 border-l border-black whitespace-nowrap">Core</td>
                    <td class="font-bold text-center py-0.5 whitespace-nowrap">:</td>
                    <td class="font-mono text-center py-0.5 px-1 whitespace-nowrap">{{ form.core || '-' }}</td>
                  </tr>
                  <tr class="border-t border-black">
                    <td class="font-bold text-left py-0.5 px-1 whitespace-nowrap">Length</td>
                    <td class="font-bold text-center py-0.5 whitespace-nowrap">:</td>
                    <td class="font-mono text-center py-0.5 px-1 whitespace-nowrap">{{ form.length ? formatNumberCommas(form.length) : '-' }}</td>
                    
                    <td class="font-bold text-left py-0.5 px-1 border-l border-black whitespace-nowrap">Join</td>
                    <td class="font-bold text-center py-0.5 whitespace-nowrap">:</td>
                    <td class="font-bold font-mono text-center py-0.5 px-1 whitespace-nowrap">{{ form.join !== undefined && form.join !== '' ? form.join : '0' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Section Roll ID Header -->
            <div class="text-center font-bold text-[10.5px] border-b border-black py-0.5 tracking-wide">
              Roll ID
            </div>

            <!-- Barcode 1: Code Pack / Roll ID (Smaller Height) -->
            <div class="py-1 flex flex-col items-center justify-center border-b border-black">
              <LabelExportBarcode
                v-if="form.codePack"
                :value="form.codePack"
                :height="26"
                width="70%"
                textSize="9.5px"
              />
              <div v-else class="text-[9.5px] text-slate-400 font-mono italic py-1">
                (Isi Code Pack untuk menampilkan barcode)
              </div>
            </div>

            <!-- Barcode 2: Nomor OK (Full Width & Height) -->
            <div class="pt-1 pb-0.5 flex flex-col items-center justify-center">
              <LabelExportBarcode
                v-if="form.nomorOk"
                :value="form.nomorOk"
                :height="36"
                width="95%"
                textSize="10.5px"
              />
              <div v-else class="text-[9.5px] text-slate-400 font-mono italic py-1">
                (Isi Nomor OK untuk menampilkan barcode)
              </div>
            </div>
          </div>

          <p class="text-[10px] text-slate-400 mt-2 text-center">
            Pratinjau proporsional stiker ekspor. Dicetak 3 kali per data roll pada lembar kertas.
          </p>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue';
import {
  useLabelExportStore,
  formatJenisDisplay,
  formatExportType,
  calculateExportNetto,
  calculateExportCore
} from '@/stores/labelExportStore';
import LabelExportBarcode from './LabelExportBarcode.vue';
import trivestaLogoUrl from '@/assets/trivesta-logo.png';

const store = useLabelExportStore();

const isSearching = ref(false);
const isSubmitting = ref(false);
const lookupBanner = ref(null);
const lookupResult = ref(null);
const showSuggestions = ref(false);
const suggestions = ref([]);

const getInitialCleanForm = () => ({
  id: null,
  codePack: '',
  nomorOk: '',
  jenis: 'VMCPP',
  jenisDisplay: 'MET CPP FILM',
  kodeFormula: '',
  type: '',
  thickness: '',
  width: '',
  length: '',
  treatment: 'INSIDE',
  netto: '',
  core: '',
  diameterCore: 3,
  join: '0'
});

const form = reactive(getInitialCleanForm());

const formatNumberCommas = (num) => {
  if (!num && num !== 0) return '0';
  return Number(num).toLocaleString('en-US');
};

const handleBackdropClick = () => {
  store.closeModal();
};

const handleJenisChange = () => {
  form.jenisDisplay = formatJenisDisplay(form.jenis);
  recalculateFields();
};

const handleFormulaInput = () => {
  form.type = formatExportType(form.kodeFormula, form.thickness);
};

const recalculateFields = () => {
  form.type = formatExportType(form.kodeFormula, form.thickness);
  if (form.thickness && form.width && form.length) {
    form.netto = calculateExportNetto(form.thickness, form.width, form.length, form.jenis);
  }
  if (form.width) {
    form.core = calculateExportCore(form.width, form.diameterCore || 3);
  }
};

// Saat mengetik Code Pack, auto-search suggestion dengan debounce hemat performa
let debounceTimer = null;
const handleCodePackInput = () => {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(async () => {
    if (form.codePack && form.codePack.length >= 3) {
      suggestions.value = await store.getStandardLabelSuggestions(form.codePack);
      showSuggestions.value = suggestions.value.length > 0;
    } else {
      suggestions.value = [];
      showSuggestions.value = false;
    }
  }, 200);
};

const selectSuggestion = async (sug) => {
  form.codePack = sug.codePack;
  showSuggestions.value = false;
  await triggerManualLookup();
};

// Tarik data dari label biasa
const triggerManualLookup = async () => {
  if (!form.codePack) return;
  isSearching.value = true;
  lookupBanner.value = null;

  try {
    const res = await store.lookupStandardLabel(form.codePack);
    if (res) {
      lookupResult.value = res;
      // Copy data ke form tapi jangan kunci (tetap bisa diedit bebas)
      form.jenis = res.jenis || 'VMCPP';
      form.jenisDisplay = res.jenisDisplay || formatJenisDisplay(res.jenis);
      form.kodeFormula = res.kodeFormula || '';
      form.thickness = res.thickness || '';
      form.width = res.width || '';
      form.length = res.length || '';
      form.treatment = res.treatment || 'INSIDE';
      form.type = res.type || formatExportType(res.kodeFormula, res.thickness);
      form.netto = res.netto || calculateExportNetto(res.thickness, res.width, res.length, res.jenis);
      form.core = res.core || calculateExportCore(res.width, 3);
      form.join = res.join !== undefined ? String(res.join) : '0';
      // Nomor OK sengaja dikosongkan saat tarik data agar diisi manual oleh user
      form.nomorOk = '';
      lookupBanner.value = {
        type: 'success',
        message: `Data ditemukan dari Label Biasa (Lot: ${res.sourceLot || '-'}, SPK: ${res.spk || '-'}). Format berhasil disesuaikan!`
      };
    } else {
      lookupBanner.value = {
        type: 'warning',
        message: `Code Pack "${form.codePack}" tidak ditemukan di Label Biasa. Anda dapat mengisinya secara manual.`
      };
    }
  } catch (err) {
    lookupBanner.value = {
      type: 'warning',
      message: 'Gagal mencari data label: ' + err.message
    };
  } finally {
    isSearching.value = false;
  }
};

// Inisialisasi saat modal dibuka (mode Edit vs Create)
watch(
  () => store.isModalOpen,
  (open) => {
    if (open) {
      lookupBanner.value = null;
      lookupResult.value = null;
      showSuggestions.value = false;

      if (store.editingItem) {
        // Edit mode
        Object.assign(form, {
          id: store.editingItem.id,
          codePack: store.editingItem.codePack || '',
          nomorOk: store.editingItem.nomorOk || '',
          jenis: store.editingItem.jenis || 'VMCPP',
          jenisDisplay: store.editingItem.jenisDisplay || formatJenisDisplay(store.editingItem.jenis),
          kodeFormula: store.editingItem.kodeFormula || '',
          type: store.editingItem.type || '',
          thickness: store.editingItem.thickness !== undefined ? store.editingItem.thickness : '',
          width: store.editingItem.width !== undefined ? store.editingItem.width : '',
          length: store.editingItem.length !== undefined ? store.editingItem.length : '',
          treatment: store.editingItem.treatment || 'INSIDE',
          netto: store.editingItem.netto || '',
          core: store.editingItem.core || '',
          diameterCore: store.editingItem.diameterCore || 3,
          join: store.editingItem.join !== undefined ? store.editingItem.join : '0'
        });
      } else {
        // Create mode (Form bersih kosong, siap diinput atau ditarik dari Code Pack)
        Object.assign(form, getInitialCleanForm());
      }
    }
  }
);

const handleSubmit = async () => {
  isSubmitting.value = true;
  try {
    await store.saveExportLabel(form);
    store.closeModal();
  } catch (err) {
    alert('Gagal menyimpan label: ' + err.message);
  } finally {
    isSubmitting.value = false;
  }
};
</script>
