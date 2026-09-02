<template>
  <div class="bg-white rounded-2xl border border-zinc-200 shadow-xs overflow-hidden">
    <div class="overflow-x-auto">
      <table class="w-full text-left text-xs border-collapse">
        <thead @contextmenu.prevent="$emit('open-column-modal')" title="Klik kanan untuk atur kolom tabel">
          <tr class="bg-zinc-100/90 text-zinc-800 border-b border-zinc-200 font-bold uppercase tracking-wider text-[11px] whitespace-nowrap select-none">
            <th class="py-3 px-3 w-10 text-center">
              <button
                type="button"
                @click="$emit('toggle-all')"
                class="w-4 h-4 mx-auto rounded-full border-2 transition-all flex items-center justify-center cursor-pointer select-none"
                :class="isAllSelected ? 'bg-red-600 border-red-600 text-white shadow-2xs' : 'border-zinc-400 bg-white hover:border-red-500'"
                :title="isAllSelected ? 'Batalkan pilihan semua' : 'Pilih semua di halaman ini'"
              >
                <svg v-if="isAllSelected" class="w-2.5 h-2.5 stroke-[3.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </button>
            </th>
            
            <!-- NO / ID -->
            <th v-if="visibleColumns.id" class="py-3 px-3 text-center cursor-pointer hover:bg-zinc-200/70 transition-colors" @click="$emit('sort-by-column', 'id')">
              <div class="flex items-center justify-center gap-1">
                <span>No</span>
                <span v-if="sortBy === 'id'" class="text-red-600 font-black">{{ sortOrder === 'asc' ? '▲' : '▼' }}</span>
              </div>
            </th>

            <!-- UNIQ ID -->
            <th v-if="visibleColumns.uniqId" class="py-3 px-3 cursor-pointer hover:bg-zinc-200/70 transition-colors" @click="$emit('sort-by-column', 'uniqId')">
              <div class="flex items-center gap-1">
                <span>UNIQ ID</span>
                <span v-if="sortBy === 'uniqId'" class="text-red-600 font-black">{{ sortOrder === 'asc' ? '▲' : '▼' }}</span>
              </div>
            </th>

            <!-- TANGGAL -->
            <th v-if="visibleColumns.tanggal" class="py-3 px-3 cursor-pointer hover:bg-zinc-200/70 transition-colors" @click="$emit('sort-by-column', 'tanggal')">
              <div class="flex items-center gap-1">
                <span>Tanggal</span>
                <span v-if="sortBy === 'tanggal'" class="text-red-600 font-black">{{ sortOrder === 'asc' ? '▲' : '▼' }}</span>
              </div>
            </th>

            <!-- MESIN -->
            <th v-if="visibleColumns.mesin" class="py-3 px-3 cursor-pointer hover:bg-zinc-200/70 transition-colors" @click="$emit('sort-by-column', 'mesin')">
              <div class="flex items-center gap-1">
                <span>Mesin</span>
                <span v-if="sortBy === 'mesin'" class="text-red-600 font-black">{{ sortOrder === 'asc' ? '▲' : '▼' }}</span>
              </div>
            </th>

            <!-- OPERATOR -->
            <th v-if="visibleColumns.operator" class="py-3 px-3 cursor-pointer hover:bg-zinc-200/70 transition-colors" @click="$emit('sort-by-column', 'operator')">
              <div class="flex items-center gap-1">
                <span>Operator</span>
                <span v-if="sortBy === 'operator'" class="text-red-600 font-black">{{ sortOrder === 'asc' ? '▲' : '▼' }}</span>
              </div>
            </th>

            <!-- SUPPLIER -->
            <th v-if="visibleColumns.supplier" class="py-3 px-3 cursor-pointer hover:bg-zinc-200/70 transition-colors" @click="$emit('sort-by-column', 'supplier')">
              <div class="flex items-center gap-1">
                <span>Supplier</span>
                <span v-if="sortBy === 'supplier'" class="text-red-600 font-black">{{ sortOrder === 'asc' ? '▲' : '▼' }}</span>
              </div>
            </th>

            <!-- SPK -->
            <th v-if="visibleColumns.spk" class="py-3 px-3 cursor-pointer hover:bg-zinc-200/70 transition-colors" @click="$emit('sort-by-column', 'spk')">
              <div class="flex items-center gap-1">
                <span>SPK</span>
                <span v-if="sortBy === 'spk'" class="text-red-600 font-black">{{ sortOrder === 'asc' ? '▲' : '▼' }}</span>
              </div>
            </th>

            <!-- NO LOT AKHIR -->
            <th v-if="visibleColumns.lot" class="py-3 px-3 cursor-pointer hover:bg-zinc-200/70 transition-colors" @click="$emit('sort-by-column', 'lot')">
              <div class="flex items-center gap-1">
                <span>No Lot Akhir</span>
                <span v-if="sortBy === 'lot'" class="text-red-600 font-black">{{ sortOrder === 'asc' ? '▲' : '▼' }}</span>
              </div>
            </th>

            <!-- DIMENSI -->
            <th v-if="visibleColumns.dimensi" class="py-3 px-4 cursor-pointer hover:bg-zinc-200/70 transition-colors" @click="$emit('sort-by-column', 'netto')">
              <div class="flex items-center gap-1">
                <span>Dimensi & Berat</span>
                <span v-if="sortBy === 'netto'" class="text-red-600 font-black">{{ sortOrder === 'asc' ? '▲' : '▼' }}</span>
              </div>
            </th>

            <!-- KODE PACK -->
            <th v-if="visibleColumns.kodePack" class="py-3 px-3 cursor-pointer hover:bg-zinc-200/70 transition-colors" @click="$emit('sort-by-column', 'kodePack')">
              <div class="flex items-center gap-1">
                <span>Kode Pack</span>
                <span v-if="sortBy === 'kodePack'" class="text-red-600 font-black">{{ sortOrder === 'asc' ? '▲' : '▼' }}</span>
              </div>
            </th>

            <!-- STATUS -->
            <th v-if="visibleColumns.status" class="py-3 px-3 text-center cursor-pointer hover:bg-zinc-200/70 transition-colors" @click="$emit('sort-by-column', 'status')">
              <div class="flex items-center justify-center gap-1">
                <span>Status</span>
                <span v-if="sortBy === 'status'" class="text-red-600 font-black">{{ sortOrder === 'asc' ? '▲' : '▼' }}</span>
              </div>
            </th>

            <!-- BULAN -->
            <th v-if="visibleColumns.bulan" class="py-3 px-3">Bulan</th>

            <!-- AKSI -->
            <th v-if="visibleColumns.aksi" class="py-3 px-3 text-center">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-zinc-100 text-zinc-700">
          <tr
            v-for="(item) in items"
            :key="item.id"
            @contextmenu.prevent="$emit('open-row-action-modal', item)"
            :class="[
              'hover:bg-red-50/30 transition-colors cursor-pointer select-none',
              selectedIds.includes(item.id) ? 'bg-red-50/50' : ''
            ]"
            title="Klik kanan pada baris ini untuk membuka Menu Aksi"
          >
            <!-- Checkbox Row -->
            <td class="py-2.5 px-3 text-center whitespace-nowrap" @click.stop>
              <button
                type="button"
                @click="$emit('toggle-select-item', item.id)"
                class="w-4 h-4 mx-auto rounded-full border-2 transition-all flex items-center justify-center cursor-pointer select-none"
                :class="selectedIds.includes(item.id) ? 'bg-red-600 border-red-600 text-white shadow-2xs' : 'border-zinc-300 bg-white hover:border-red-500'"
                :title="selectedIds.includes(item.id) ? 'Batalkan pilihan' : 'Pilih data ini untuk cetak'"
              >
                <svg v-if="selectedIds.includes(item.id)" class="w-2.5 h-2.5 stroke-[3.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </button>
            </td>

            <!-- No / ID Record -->
            <td v-if="visibleColumns.id" class="py-2.5 px-3 font-mono text-zinc-600 font-bold text-center whitespace-nowrap">
              #{{ item.id }}
            </td>

            <!-- UNIQ ID -->
            <td v-if="visibleColumns.uniqId" class="py-2.5 px-3 font-mono text-[11px] text-zinc-500 font-bold whitespace-nowrap">
              {{ item.uniqId || '-' }}
            </td>

            <!-- Tanggal -->
            <td v-if="visibleColumns.tanggal" class="py-2.5 px-3 whitespace-nowrap font-medium text-zinc-900">
              {{ formatTanggalIndonesia(item.tanggal) }}
            </td>

            <!-- Mesin -->
            <td v-if="visibleColumns.mesin" class="py-2.5 px-3 whitespace-nowrap">
              <span :class="[
                'px-2 py-0.5 rounded text-[10px] font-bold border',
                item.mesin === 'REWIND' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                item.mesin === 'SML' ? 'bg-cyan-50 text-cyan-700 border-cyan-200' :
                'bg-red-50 text-red-700 border-red-200'
              ]">
                {{ item.mesin }}
              </span>
            </td>

            <!-- Operator (Database Resolved) -->
            <td v-if="visibleColumns.operator" class="py-2.5 px-3 whitespace-nowrap">
              <div class="flex items-center gap-2">
                <span class="w-6 h-6 rounded-full bg-zinc-900 text-white flex items-center justify-center text-[10px] font-black shrink-0 shadow-2xs border border-zinc-700">
                  {{ getOperatorInitial(item) }}
                </span>
                <div class="flex flex-col text-left leading-tight">
                  <div class="flex items-center gap-1.5">
                    <span class="font-bold text-zinc-900 text-xs">{{ getOperatorDisplayName(item) }}</span>
                    <span v-if="getOperatorCode(item)" class="px-1 py-0.2 rounded bg-zinc-100 text-zinc-700 font-mono text-[9px] font-black border border-zinc-300">
                      {{ getOperatorCode(item) }}
                    </span>
                  </div>
                  <span v-if="getOperatorGroup(item)" class="text-[9.5px] text-zinc-400 font-medium">
                    Grup {{ getOperatorGroup(item) }} • {{ item.mesin || 'SLITTING' }}
                  </span>
                </div>
              </div>
            </td>

            <!-- Supplier -->
            <td v-if="visibleColumns.supplier" class="py-2.5 px-3 font-semibold text-zinc-600 whitespace-nowrap">
              {{ item.supplier || '-' }}
            </td>

            <!-- SPK -->
            <td v-if="visibleColumns.spk" class="py-2.5 px-3 font-bold text-zinc-800 whitespace-nowrap font-mono">
              {{ item.spk }}
            </td>

            <!-- No Lot Akhir (Visual Spaced Lot / Turunan) -->
            <td v-if="visibleColumns.lot" class="py-2.5 px-3 whitespace-nowrap font-mono font-bold">
              <span class="text-zinc-900 uppercase">{{ formatLotVisual(item.lot, item.supplier) }}</span>
              <span v-if="item.turunan" class="text-zinc-400 font-bold mx-1">/</span>
              <span v-if="item.turunan" class="text-red-600 uppercase">{{ item.turunan }}</span>
            </td>

            <!-- Dimensi (NO WRAP) -->
            <td v-if="visibleColumns.dimensi" class="py-2.5 px-4 whitespace-nowrap font-medium text-zinc-700">
              {{ item.jenis }} <span class="text-red-600 font-bold">{{ item.kode }}</span> {{ item.thickness }} MC × {{ item.width }} MM = {{ item.length }}
            </td>

            <!-- Kode Pack (Red highlight if DUPLICATE) -->
            <td v-if="visibleColumns.kodePack" class="py-2.5 px-3 whitespace-nowrap">
              <div v-if="isDuplicateKodePack(item)" class="inline-flex items-center px-2 py-0.5 rounded bg-red-600 text-yellow-300 font-bold font-mono text-[11px] shadow-xs" title="Duplikasi Kode Pack Terdeteksi!">
                {{ item.kodePack }}{{ item.subKode }}
              </div>
              <div v-else class="font-mono">
                <span>{{ item.kodePack }}</span>
                <span class="text-red-600 font-bold">{{ item.subKode }}</span>
              </div>
            </td>

            <!-- Status Badge -->
            <td v-if="visibleColumns.status" class="py-2.5 px-3 text-center whitespace-nowrap">
              <span :class="[
                'px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border inline-block tracking-wider',
                item.status === 'PASS' || item.status === 'OK'
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                item.status === 'HOLD'
                  ? 'bg-amber-100 text-amber-800 border-amber-300' :
                  'bg-red-100 text-red-800 border-red-300'
              ]">
                {{ item.status }}
              </span>
            </td>

            <!-- Bulan -->
            <td v-if="visibleColumns.bulan" class="py-2.5 px-3 text-zinc-500 whitespace-nowrap">
              {{ getMonthName(item.tanggal) }}
            </td>

            <!-- Aksi Buttons -->
            <td v-if="visibleColumns.aksi" class="py-2.5 px-3 text-center whitespace-nowrap" @click.stop>
              <div class="flex items-center justify-center gap-1">
                <!-- Single Preview Icon Button -->
                <button
                  @click="$emit('preview-single', item)"
                  class="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 hover:text-indigo-800 transition-colors cursor-pointer"
                  title="Pratinjau Label"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>

                <!-- Edit Icon Button -->
                <button
                  v-if="!isLockedForUser(item)"
                  @click="$emit('open-modal', item)"
                  class="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 hover:text-blue-800 transition-colors cursor-pointer"
                  title="Edit Data"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <span
                  v-else
                  class="p-1.5 inline-flex items-center text-amber-500 cursor-not-allowed"
                  title="🔒 Terkunci: Label telah diapprove oleh Admin di DE Report. Hanya level Admin yang dapat mengedit."
                >
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </span>

                <!-- Duplikat Icon Button -->
                <button
                  @click="$emit('duplicate-data', item)"
                  class="p-1.5 rounded-lg text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 transition-colors cursor-pointer"
                  title="Duplikat Data"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>

                <!-- Hapus Icon Button -->
                <button
                  v-if="!isLockedForUser(item)"
                  @click="$emit('delete-data', item)"
                  class="p-1.5 rounded-lg text-red-600 hover:bg-red-50 hover:text-red-800 transition-colors cursor-pointer"
                  title="Hapus Data"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
                <span
                  v-else
                  class="p-1.5 inline-flex items-center text-zinc-300 cursor-not-allowed"
                  title="🔒 Terkunci: Label telah diapprove oleh Admin di DE Report."
                >
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </span>
              </div>
            </td>
          </tr>

          <tr v-if="items.length === 0">
            <td :colspan="activeColumnCount + 1" class="py-12 text-center text-zinc-400">
              <div class="text-3xl mb-2">🏷️</div>
              <p class="font-bold text-sm text-zinc-800">Tidak ada data label yang ditemukan.</p>
              <p class="text-xs text-zinc-400 mt-1 mb-4">Database label saat ini kosong atau filter aktif tidak menemukan kecocokan.</p>
              <div class="flex items-center justify-center gap-2">
                <button
                  @click="$emit('reset-filter')"
                  class="px-3 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold text-xs transition-all cursor-pointer"
                >
                  Reset Filter (Tampilkan Semua Mesin)
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { formatLotVisual } from '@/services/aiAutomationService';
import { useConfigStore } from '@/stores/configStore';

const configStore = useConfigStore();

function resolveOperator(item) {
  if (!item) return null;
  const list = configStore.operatorList || [];
  if (!list.length) return null;

  const rawOp = String(item.operator || '').trim();
  const rawCode = String(item.kodeOperator || '').trim();
  const machine = String(item.mesin || '').trim().toUpperCase();

  if (rawCode) {
    const byCodeMachine = list.find(o => o.kodeOperator && o.kodeOperator.toUpperCase() === rawCode.toUpperCase() && o.mesin && o.mesin.toUpperCase() === machine && o.active !== false)
      || list.find(o => o.kodeOperator && o.kodeOperator.toUpperCase() === rawCode.toUpperCase() && o.mesin && o.mesin.toUpperCase() === machine);
    if (byCodeMachine) return byCodeMachine;
    const byCode = list.find(o => o.kodeOperator && o.kodeOperator.toUpperCase() === rawCode.toUpperCase() && o.active !== false)
      || list.find(o => o.kodeOperator && o.kodeOperator.toUpperCase() === rawCode.toUpperCase());
    if (byCode) return byCode;
  }

  if (rawOp) {
    let cleanedOp = rawOp;
    if (cleanedOp.toUpperCase().startsWith('OPERATOR ')) {
      cleanedOp = cleanedOp.substring(9).trim();
    } else if (cleanedOp.toUpperCase() === 'OPERATOR') {
      cleanedOp = '';
    }

    if (cleanedOp) {
      const bracketMatch = cleanedOp.match(/^(.+?)\s*[\(\[]([A-Za-z0-9]+)[\)\]]$/);
      if (bracketMatch) {
        const bName = bracketMatch[1].trim().toUpperCase();
        const bCode = bracketMatch[2].trim().toUpperCase();
        const byBracket = list.find(o => (o.kodeOperator && o.kodeOperator.toUpperCase() === bCode) || (o.nama && o.nama.toUpperCase() === bName));
        if (byBracket) return byBracket;
      }

      const byNameMachine = list.find(o => o.nama && o.nama.toUpperCase() === cleanedOp.toUpperCase() && o.mesin && o.mesin.toUpperCase() === machine);
      if (byNameMachine) return byNameMachine;
      const byName = list.find(o => o.nama && o.nama.toUpperCase() === cleanedOp.toUpperCase());
      if (byName) return byName;
      const byCodeMachine = list.find(o => o.kodeOperator && o.kodeOperator.toUpperCase() === cleanedOp.toUpperCase() && o.mesin && o.mesin.toUpperCase() === machine);
      if (byCodeMachine) return byCodeMachine;
      const byCode = list.find(o => o.kodeOperator && o.kodeOperator.toUpperCase() === cleanedOp.toUpperCase());
      if (byCode) return byCode;
    }
  }

  if (item.turunan) {
    const str = String(item.turunan).trim();
    const match = str.match(/^([A-Za-z]+?)([A-Za-z])(\d+)$/) || str.match(/^([A-Za-z]+)(\d+)$/);
    if (match) {
      const opPrefix = match[1].toUpperCase();
      const byTurunanMachine = list.find(o => o.kodeOperator && o.kodeOperator.toUpperCase() === opPrefix && o.mesin && o.mesin.toUpperCase() === machine && o.active !== false)
        || list.find(o => o.kodeOperator && o.kodeOperator.toUpperCase() === opPrefix && o.mesin && o.mesin.toUpperCase() === machine);
      if (byTurunanMachine) return byTurunanMachine;
      const byTurunan = list.find(o => o.kodeOperator && o.kodeOperator.toUpperCase() === opPrefix && o.active !== false)
        || list.find(o => o.kodeOperator && o.kodeOperator.toUpperCase() === opPrefix);
      if (byTurunan) return byTurunan;
    }
  }

  return null;
}

function getOperatorDisplayName(item) {
  if (!item) return '—';
  const op = resolveOperator(item);
  if (op && op.nama) return op.nama.toUpperCase();
  const rawOp = (item.operator || '').trim();
  if (rawOp && rawOp.toUpperCase() !== 'OPERATOR' && !rawOp.toUpperCase().startsWith('OPERATOR ')) return rawOp.toUpperCase();
  return rawOp ? rawOp.toUpperCase() : '—';
}

function getOperatorCode(item) {
  if (!item) return '';
  const op = resolveOperator(item);
  if (op && op.kodeOperator) return op.kodeOperator.toUpperCase();
  if (item.kodeOperator) return item.kodeOperator.toUpperCase();
  if (item.turunan) {
    const match = String(item.turunan).match(/^([A-Za-z]+)/);
    if (match) return match[1].toUpperCase();
  }
  return '';
}

function getOperatorInitial(item) {
  const name = getOperatorDisplayName(item);
  if (name && name !== '—' && name !== 'OPERATOR' && !name.startsWith('OPERATOR ')) return name.charAt(0).toUpperCase();
  const code = getOperatorCode(item);
  if (code) return code.charAt(0).toUpperCase();
  return 'O';
}

function getOperatorGroup(item) {
  const op = resolveOperator(item);
  return op && op.kodeGrup ? op.kodeGrup.toUpperCase() : '';
}

defineProps({
  items: { type: Array, required: true },
  visibleColumns: { type: Object, required: true },
  selectedIds: { type: Array, default: () => [] },
  isAllSelected: { type: Boolean, default: false },
  sortBy: { type: String, default: 'id' },
  sortOrder: { type: String, default: 'asc' },
  activeColumnCount: { type: Number, default: 12 },
  isLockedForUser: { type: Function, required: true },
  formatTanggalIndonesia: { type: Function, required: true },
  getMonthName: { type: Function, required: true },
  getOperatorFromTurunan: { type: Function, required: true },
  isDuplicateKodePack: { type: Function, required: true }
});

defineEmits([
  'toggle-all',
  'toggle-select-item',
  'sort-by-column',
  'open-row-action-modal',
  'preview-single',
  'open-modal',
  'duplicate-data',
  'delete-data',
  'reseed-dummy',
  'reset-filter',
  'open-column-modal'
]);
</script>
