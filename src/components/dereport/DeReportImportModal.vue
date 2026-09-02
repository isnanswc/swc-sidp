<template>
  <div
    v-if="modelValue"
    class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in"
    @click.self="close"
  >
    <div class="bg-white rounded-2xl border border-zinc-300 shadow-2xl max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden">
      <!-- Modal Header -->
      <div class="px-5 py-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          </div>
          <div>
            <h3 class="text-sm font-black text-zinc-900">Import & Paste DE Report Slitting</h3>
            <p class="text-xs text-zinc-500 font-medium">
              Parent Induk (No Lot/Panjang/Berat) 1x per lot • Lebar Parent di setiap roll • Waste Polos/Metal (kg) 1x per shift
            </p>
          </div>
        </div>
        <button
          @click="close"
          class="p-1.5 rounded-xl hover:bg-zinc-200 text-zinc-500 hover:text-zinc-800 transition-colors cursor-pointer"
        >
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <!-- Modal Body -->
      <div class="p-5 space-y-4 overflow-y-auto flex-1">
        <!-- Opsi 1: Upload File Excel -->
        <div class="space-y-1.5">
          <label class="text-xs font-black text-zinc-800">Opsi A: Upload File Excel (.xlsx / .xls / .csv)</label>
          <div
            class="border-2 border-dashed border-zinc-300 hover:border-blue-500 rounded-xl p-4 text-center cursor-pointer transition-colors bg-zinc-50/50"
            @click="triggerFileInput"
          >
            <input
              ref="excelFileInputRef"
              type="file"
              accept=".xlsx, .xls, .csv"
              class="hidden"
              @change="$emit('file-upload', $event)"
            />
            <svg class="w-8 h-8 text-blue-600 mx-auto mb-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="12" y1="18" x2="12" y2="12" />
              <line x1="9" y1="15" x2="12" y2="12" />
              <line x1="15" y1="15" x2="12" y2="12" />
            </svg>
            <p class="text-xs font-bold text-zinc-800">Klik untuk upload file Excel DE Report Slitting</p>
            <p class="text-[11px] text-zinc-400 mt-0.5">Mendukung format kolom standar slitting sheet</p>
          </div>
        </div>

        <!-- Opsi 2: Paste Langsung dari Excel (Ctrl+V) -->
        <div class="space-y-1.5">
          <div class="flex items-center justify-between">
            <label class="text-xs font-black text-zinc-800">Opsi B: Paste Langsung dari Excel / Google Sheets (Ctrl + V)</label>
            <span class="text-[11px] text-blue-600 font-bold">Copy range tabel di Excel lalu Paste ke kotak ini</span>
          </div>
          <textarea
            :value="pasteRawText"
            @input="$emit('update:pasteRawText', $event.target.value); $emit('parse-pasted-text', $event.target.value)"
            rows="5"
            placeholder="Paste baris tabel Excel di sini (tekan Ctrl+V)..."
            class="w-full p-3 text-xs border border-zinc-300 rounded-xl font-mono focus:ring-2 focus:ring-blue-500 outline-none bg-zinc-50/30"
          ></textarea>
        </div>

        <!-- PREVIEW HASIL PARSING & FORWARD-FILL -->
        <div v-if="parsedImportRows.length > 0" class="space-y-2 border-t border-zinc-200 pt-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="text-xs font-black text-zinc-900">Pratinjau Hasil Parsing:</span>
              <span class="px-2 py-0.5 rounded-full text-[11px] font-black bg-blue-100 text-blue-800 font-mono">
                {{ parsedImportRows.length }} Roll
              </span>
              <span class="px-2 py-0.5 rounded-full text-[11px] font-black bg-purple-100 text-purple-800 font-mono">
                {{ parsedParentCount }} Parent Lot
              </span>
              <span class="px-2 py-0.5 rounded-full text-[11px] font-black bg-amber-100 text-amber-800 font-mono">
                Waste: {{ parsedTotalWaste.toFixed(1) }} kg
              </span>
            </div>
            <span class="text-[11px] text-emerald-600 font-bold">✓ Forward-Fill Aktif</span>
          </div>

          <!-- Preview Mini Table -->
          <div class="overflow-x-auto max-h-56 border border-zinc-300 rounded-xl">
            <table class="w-full text-left text-[11px] font-mono border-collapse bg-white">
              <thead class="bg-zinc-100 text-zinc-700 sticky top-0 font-bold border-b border-zinc-300">
                <tr>
                  <th class="p-1.5 text-center">#</th>
                  <th class="p-1.5">Tanggal</th>
                  <th class="p-1.5">Shift</th>
                  <th class="p-1.5">SPK</th>
                  <th class="p-1.5">Parent Lot</th>
                  <th class="p-1.5">Lebar Induk</th>
                  <th class="p-1.5">Turunan</th>
                  <th class="p-1.5">Dim. Hasil</th>
                  <th class="p-1.5 text-right">Netto</th>
                  <th class="p-1.5 text-center">Packing</th>
                  <th class="p-1.5 text-center">Status</th>
                  <th class="p-1.5">Defect / Ket. Hasil</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-zinc-200">
                <tr
                  v-for="(row, idx) in parsedImportRows"
                  :key="idx"
                  :class="[
                    row.status === 'HOLD' ? 'bg-amber-50' : (row.status === 'REJECT' ? 'bg-red-50' : 'hover:bg-zinc-50')
                  ]"
                >
                  <td class="p-1.5 text-center font-bold text-zinc-500">{{ idx + 1 }}</td>
                  <td class="p-1.5">{{ row.tanggal }}</td>
                  <td class="p-1.5 font-bold">{{ row.shiftCombined }}</td>
                  <td class="p-1.5">{{ row.spk }}</td>
                  <td class="p-1.5 font-bold text-zinc-900">{{ row.lot }}</td>
                  <td class="p-1.5 text-zinc-600">{{ row.parentWidth }} MM</td>
                  <td class="p-1.5 font-black text-red-600">{{ row.turunan }}</td>
                  <td class="p-1.5">{{ row.width }} × {{ row.length }}</td>
                  <td class="p-1.5 text-right font-bold text-zinc-900">{{ row.netto }}</td>
                  <td class="p-1.5 text-center font-mono">{{ row.packing }}</td>
                  <td class="p-1.5 text-center">
                    <span
                      :class="[
                        'px-1.5 py-0.2 rounded text-[9px] font-black',
                        row.status === 'HOLD' ? 'bg-amber-500 text-white' : (row.status === 'REJECT' ? 'bg-red-500 text-white' : 'bg-emerald-100 text-emerald-800')
                      ]"
                    >
                      {{ row.status }}
                    </span>
                  </td>
                  <td class="p-1.5 text-zinc-500 truncate max-w-[150px]">{{ row.reasonDefect || row.keterangan || '-' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="px-5 py-3.5 border-t border-zinc-200 bg-zinc-50 flex items-center justify-between">
        <button
          @click="close"
          class="px-4 py-2 rounded-xl text-xs font-bold text-zinc-600 hover:bg-zinc-200 transition-colors cursor-pointer"
        >
          Batal
        </button>

        <div class="flex items-center gap-2">
          <button
            :disabled="parsedImportRows.length === 0"
            @click="$emit('commit-import')"
            class="px-5 py-2 rounded-xl text-xs font-black bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white shadow-md shadow-blue-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>✓ Simpan & Masukkan ke Sheet ({{ parsedImportRows.length }} Roll)</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  pasteRawText: { type: String, default: '' },
  parsedImportRows: { type: Array, default: () => [] },
  parsedParentCount: { type: Number, default: 0 },
  parsedTotalWaste: { type: Number, default: 0 }
});

const emit = defineEmits([
  'update:modelValue',
  'update:pasteRawText',
  'file-upload',
  'parse-pasted-text',
  'commit-import'
]);

const excelFileInputRef = ref(null);

const triggerFileInput = () => {
  if (excelFileInputRef.value) {
    excelFileInputRef.value.click();
  }
};

const close = () => {
  emit('update:modelValue', false);
};
</script>
