<template>
  <div class="fixed bottom-5 right-5 z-50 select-none font-sans print:hidden">
    <!-- EXPANDABLE DEBUG POPUP PANEL -->
    <div
      v-if="isOpen"
      class="mb-3 w-[calc(100vw-2.5rem)] max-w-sm sm:w-96 bg-zinc-950 text-white rounded-2xl border border-zinc-700 shadow-2xl overflow-hidden animate-fade-in flex flex-col"
    >
      <!-- Panel Header -->
      <div class="px-4 py-3 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center text-xs font-black">
            🛠️
          </div>
          <div>
            <h3 class="text-xs font-black tracking-tight text-zinc-100 uppercase">Developer Debug Tools</h3>
            <p class="text-[10px] text-zinc-400 font-medium">Pengujian & Simulasi Data Kontekstual</p>
          </div>
        </div>
        <button
          @click="isOpen = false"
          class="w-6 h-6 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center text-xs transition-colors cursor-pointer"
        >
          ✕
        </button>
      </div>

      <!-- Current Active Context Indicator -->
      <div class="p-3.5 space-y-3 bg-zinc-950">
        <div class="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between">
          <div>
            <span class="text-[10px] text-zinc-400 font-bold block uppercase tracking-wider">Halaman / Modul Aktif:</span>
            <span class="text-xs font-black text-amber-400 flex items-center gap-1.5 mt-0.5">
              <span>{{ activeTarget.icon }}</span>
              <span>{{ activeTarget.name }}</span>
            </span>
          </div>
          <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-800 text-zinc-300 border border-zinc-700">
            {{ activeTarget.path }}
          </span>
        </div>

        <!-- CONTEXTUAL PRIMARY ACTION BUTTONS -->
        <div class="space-y-2">
          <!-- 1. ISI DATA DUMMY KONTEKSTUAL -->
          <button
            @click="handleSeedContextual"
            :disabled="isProcessing"
            class="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30 transition-all disabled:opacity-50 cursor-pointer"
          >
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
            <span>+ Masukkan Data Dummy ({{ activeTarget.shortName }})</span>
          </button>

          <!-- 2. HAPUS SEMUA DATA KONTEKSTUAL -->
          <button
            @click="handleClearContextual"
            :disabled="isProcessing"
            class="w-full py-2.5 px-3 rounded-xl bg-red-600/90 hover:bg-red-500 active:scale-[0.98] text-white text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-red-950/40 transition-all disabled:opacity-50 cursor-pointer"
          >
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              <line x1="10" y1="11" x2="10" y2="17" />
              <line x1="14" y1="11" x2="14" y2="17" />
            </svg>
            <span>🗑️ Hapus Semua Data ({{ activeTarget.shortName }})</span>
          </button>
        </div>

        <!-- MANUAL MODULE SELECTOR (Jika ingin memodifikasi modul lain) -->
        <div class="pt-2 border-t border-zinc-800/80">
          <label class="block text-[10px] font-bold text-zinc-400 mb-1">Pilih Modul Target Lainnya:</label>
          <div class="grid grid-cols-3 gap-1.5 text-[10.5px]">
            <button
              v-for="mod in availableModules"
              :key="mod.id"
              @click="selectedManualModule = mod.id"
              :class="[
                'p-1.5 rounded-lg border text-center font-bold transition-all truncate cursor-pointer',
                selectedManualModule === mod.id
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                  : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:bg-zinc-800 hover:text-zinc-200'
              ]"
            >
              {{ mod.icon }} {{ mod.shortName }}
            </button>
          </div>

          <div v-if="selectedManualModule !== currentRouteModuleId" class="mt-2 flex gap-1.5">
            <button
              @click="handleSeedSpecific(selectedManualModule)"
              class="flex-1 py-1.5 px-2 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-[11px] font-bold cursor-pointer"
            >
              + Dummy {{ getModuleName(selectedManualModule) }}
            </button>
            <button
              @click="handleClearSpecific(selectedManualModule)"
              class="flex-1 py-1.5 px-2 rounded-lg bg-red-700 hover:bg-red-600 text-white text-[11px] font-bold cursor-pointer"
            >
              🗑️ Clear {{ getModuleName(selectedManualModule) }}
            </button>
          </div>
        </div>

        <!-- GLOBAL ACTIONS (RESET TOTAL & SEED ALL) -->
        <div class="pt-2.5 border-t border-zinc-800 flex items-center justify-between gap-2 text-[10.5px]">
          <button
            @click="handleClearAllDatabase"
            class="px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-red-950 text-red-400 border border-zinc-800 hover:border-red-800 transition-colors font-bold flex items-center gap-1 cursor-pointer"
          >
            <span>🧹</span> Reset Total DB
          </button>

          <button
            @click="handleSeedAllDatabase"
            class="px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-emerald-950 text-emerald-400 border border-zinc-800 hover:border-emerald-800 transition-colors font-bold flex items-center gap-1 cursor-pointer"
          >
            <span>🚀</span> Dummy Semua Modul
          </button>
        </div>
      </div>
    </div>

    <!-- FLOATING TRIGGER PILL BUTTON -->
    <button
      @click="isOpen = !isOpen"
      :class="[
        'px-3.5 py-2.5 rounded-2xl shadow-xl flex items-center gap-2.5 transition-all transform active:scale-95 border cursor-pointer',
        isOpen
          ? 'bg-amber-500 text-zinc-950 border-amber-400 font-black ring-4 ring-amber-500/20'
          : 'bg-zinc-950/95 hover:bg-black text-white border-zinc-700 hover:border-amber-500/50 backdrop-blur-md shadow-zinc-950/60'
      ]"
      title="Buka Menu Debug: Hapus Data / Masukkan Dummy Data"
    >
      <div class="w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold bg-amber-500 text-zinc-950 shadow-xs">
        🛠️
      </div>
      <div class="text-left leading-tight hidden sm:block">
        <p class="text-xs font-black flex items-center gap-1">
          <span>Debug Data</span>
          <span :class="['px-1.5 py-0.2 rounded text-[9px] font-mono uppercase font-bold', isOpen ? 'bg-zinc-950 text-amber-400' : 'bg-zinc-800 text-zinc-300']">
            {{ activeTarget.shortName }}
          </span>
        </p>
      </div>
      <svg
        :class="['w-3.5 h-3.5 transition-transform duration-200 opacity-70', isOpen ? 'rotate-180 text-zinc-950' : 'text-zinc-400']"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.5"
      >
        <polyline points="18 15 12 9 6 15" />
      </svg>
    </button>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import { db, generateUniqID, generate100StandardDummyLabels } from '@/db';
import { useLabelStore } from '@/stores/labelStore';
import { useInventoryStore } from '@/stores/inventoryStore';
import { useConfigStore } from '@/stores/configStore';
import { useTaskStore } from '@/stores/taskStore';
import { useOpnameStore } from '@/stores/opnameStore';

const route = useRoute();
const labelStore = useLabelStore();
const inventoryStore = useInventoryStore();
const configStore = useConfigStore();
const taskStore = useTaskStore();
const opnameStore = useOpnameStore();

const isOpen = ref(false);
const isProcessing = ref(false);

// Available Debug Target Modules
const availableModules = [
  { id: 'label', name: 'Manajemen Label & QR', shortName: 'Label', icon: '🏷️', path: '/label' },
  { id: 'dereport', name: 'DE Report & Verifikasi Slitting', shortName: 'DE Report', icon: '📑', path: '/de-report' },
  { id: 'inventory', name: 'Inventory Management System', shortName: 'IMS', icon: '📦', path: '/inventory' },
  { id: 'wip', name: 'WIP Management (Jumbo Roll)', shortName: 'WIP', icon: '🛞', path: '/wip' },
  { id: 'dataconfig', name: 'Data Configuration Mesin', shortName: 'Config', icon: '⚙️', path: '/data-config' },
  { id: 'tasks', name: 'Tugas & QR Scan', shortName: 'Tugas', icon: '📋', path: '/tasks' },
  { id: 'opname', name: 'Stok Opname Gudang', shortName: 'Opname', icon: '📊', path: '/opname' },
  { id: 'dashboard', name: 'Dashboard Global', shortName: 'Global', icon: '🏠', path: '/' }
];

// Current module detected from active route
const currentRouteModuleId = computed(() => {
  const p = route.path || '/';
  if (p.startsWith('/label')) return 'label';
  if (p.startsWith('/de-report')) return 'dereport';
  if (p.startsWith('/inventory')) return 'inventory';
  if (p.startsWith('/wip')) return 'wip';
  if (p.startsWith('/data-config')) return 'dataconfig';
  if (p.startsWith('/tasks')) return 'tasks';
  if (p.startsWith('/opname')) return 'opname';
  return 'dashboard';
});

const selectedManualModule = ref(currentRouteModuleId.value);

watch(currentRouteModuleId, (newId) => {
  selectedManualModule.value = newId;
});

const activeTarget = computed(() => {
  return availableModules.find(m => m.id === currentRouteModuleId.value) || availableModules[0];
});

const getModuleName = (id) => {
  return availableModules.find(m => m.id === id)?.shortName || id;
};

// ----------------------------------------------------
// DUMMY GENERATORS
// ----------------------------------------------------

// 1. Generate Label Dummy (Realistis dengan Parent, Turunan, Jumbo Sisa, & Status)
const generateDummyLabels = () => {
  const items = [];
  const today = new Date().toISOString().slice(0, 10);
  const operators = ['Ahmad Syahrul', 'Budi Santoso', 'Hendra Gunawan', 'Joko Widodo'];
  const types = [
    { jenis: 'VMCPP', kode: 'M06', type: '106', thick: 20, w: 1060, l: 6500 },
    { jenis: 'VMCPP', kode: 'M06', type: '100', thick: 20, w: 1000, l: 6000 },
    { jenis: 'CPP', kode: 'G01', type: '125', thick: 25, w: 1250, l: 4000 },
    { jenis: 'VMPET', kode: 'M04', type: '102', thick: 12, w: 1020, l: 8000 }
  ];

  // Batch 1: Slitting Parent Lot 1 (3 Turunan + 1 Jumbo Sisa)
  const lot1 = '260825-01';
  const spk1 = 'SPK-2026-0881';
  const t1 = types[0];

  ['A', 'B', 'C'].forEach((turunan, i) => {
    items.push({
      uniqId: `LBL-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 4)}`,
      tanggal: today,
      mesin: 'SLT01',
      operator: operators[0],
      kodeOperator: 'G1',
      shift: '1',
      supplier: 'INHOUSE',
      spk: spk1,
      lot: lot1,
      turunan: turunan,
      jenis: t1.jenis,
      type: t1.type,
      kode: t1.kode,
      thickness: t1.thick,
      width: t1.w,
      length: t1.l,
      meter: t1.l,
      joint: 0,
      netto: '48.50',
      gross: '54.59',
      paperCore: '6.09',
      diameterCore: '6',
      kodePack: '3B0826',
      subKode: `00${20 + i}`,
      status: 'PASS',
      keterangan: 'Hasil potong rapi standar',
      keteranganBahan: 'Bahan jumbo prima',
      verified: 0,
      verifiedAt: null,
      bulan: '8'
    });
  });

  // Jumbo Sisa Lot 1
  items.push({
    uniqId: `LBL-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 4)}`,
    tanggal: today,
    mesin: 'SLT01',
    operator: operators[0],
    kodeOperator: 'G1',
    shift: '1',
    supplier: 'INHOUSE',
    spk: spk1,
    lot: lot1,
    turunan: 'SISA',
    jenis: t1.jenis,
    type: t1.type,
    kode: t1.kode,
    thickness: t1.thick,
    width: t1.w,
    length: '1200',
    meter: '1200',
    joint: 0,
    netto: '15.20',
    gross: '21.29',
    paperCore: '6.09',
    diameterCore: '6',
    kodePack: '3B0826',
    subKode: '0023',
    status: 'B-GRADE',
    keterangan: 'Sisa Jumbo akhir proses',
    verified: 0,
    bulan: '8'
  });

  // Batch 2: Slitting Parent Lot 2 (Verified by Admin)
  const lot2 = '260825-02';
  const spk2 = 'SPK-2026-0882';
  const t2 = types[1];

  ['A', 'B'].forEach((turunan, i) => {
    items.push({
      uniqId: `LBL-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 4)}`,
      tanggal: today,
      mesin: 'SLT02',
      operator: operators[1],
      kodeOperator: 'H3',
      shift: '3',
      supplier: 'INHOUSE',
      spk: spk2,
      lot: lot2,
      turunan: turunan,
      jenis: t2.jenis,
      type: t2.type,
      kode: t2.kode,
      thickness: t2.thick,
      width: t2.w,
      length: t2.l,
      meter: t2.l,
      joint: 0,
      netto: '45.10',
      gross: '51.19',
      paperCore: '6.09',
      diameterCore: '6',
      kodePack: '3B0826',
      subKode: `00${30 + i}`,
      status: 'PASS',
      keterangan: 'Sudah approved Admin',
      keteranganBahan: 'Bahan standard prima',
      verified: 1,
      verifiedAt: new Date().toISOString(),
      bulan: '8'
    });
  });

  // Batch 3: Rewind Roll dengan Custom Pre-Codepack 'R'
  items.push({
    uniqId: `LBL-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 4)}`,
    tanggal: today,
    mesin: 'REW01',
    operator: operators[2],
    kodeOperator: 'I2',
    shift: '2',
    supplier: 'INHOUSE',
    spk: 'SPK-REW-0991',
    lot: '260825-RW1',
    turunan: 'A',
    jenis: 'CPP',
    type: '125',
    kode: 'G01',
    thickness: 25,
    width: 1250,
    length: 4000,
    meter: 4000,
    joint: 1,
    netto: '42.80',
    gross: '45.80',
    paperCore: '3.00',
    diameterCore: '3',
    kodePack: 'R3B0826',
    subKode: '0010',
    status: 'PASS',
    keterangan: 'Hasil gulung ulang join film',
    verified: 0,
    bulan: '8'
  });

  // Batch 4: Hold Roll with defect reason
  items.push({
    uniqId: `LBL-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 4)}`,
    tanggal: today,
    mesin: 'SLT01',
    operator: operators[0],
    kodeOperator: 'G1',
    shift: '1',
    supplier: 'INHOUSE',
    spk: spk1,
    lot: lot1,
    turunan: 'D',
    jenis: t1.jenis,
    type: t1.type,
    kode: t1.kode,
    thickness: t1.thick,
    width: t1.w,
    length: t1.l,
    meter: t1.l,
    joint: 0,
    netto: '48.50',
    gross: '54.59',
    paperCore: '6.09',
    diameterCore: '6',
    kodePack: '3B0826',
    subKode: '0024',
    status: 'HOLD',
    keterangan: 'Goresan memanjang pada sisi kiri',
    verified: 0,
    bulan: '8'
  });

  // Also append standard multi-day label dataset
  try {
    const std100 = generate100StandardDummyLabels();
    std100.forEach(lbl => {
      const copy = { ...lbl };
      delete copy.id;
      items.push(copy);
    });
  } catch (e) {
    console.warn('Standard labels generation fallback:', e);
  }

  return items;
};

// 2. Generate Master Items Dummy (Exact 8 Columns + Auto Descriptions)
const generateDummyMasterItems = () => {
  return [
    {
      jenis: 'VMCPP',
      kodeFormula: 'M06',
      thickness: '20',
      width: '1060',
      length: '6500',
      core: '6',
      od: 'OD2.4+PLASMA',
      tanda: 'A',
      sourceNo: '',
      descriptionNav: 'VMCPP M06 20 MC X 1060 MM',
      descriptionExcel: 'VMCPP M06 20 MC X 1060 MM = 6500 , 6 INCHI OD2.4+PLASMA A'
    },
    {
      jenis: 'VMCPP',
      kodeFormula: 'M06',
      thickness: '20',
      width: '1000',
      length: '6000',
      core: '6',
      od: 'OD2.4+PLASMA',
      tanda: '',
      sourceNo: '',
      descriptionNav: 'VMCPP M06 20 MC X 1000 MM',
      descriptionExcel: 'VMCPP M06 20 MC X 1000 MM = 6000 , 6 INCHI OD2.4+PLASMA'
    },
    {
      jenis: 'CPP',
      kodeFormula: 'G01',
      thickness: '25',
      width: '1250',
      length: '4000',
      core: '3',
      od: '',
      tanda: '',
      sourceNo: '',
      descriptionNav: 'CPP G01 25 MC X 1250 MM',
      descriptionExcel: 'CPP G01 25 MC X 1250 MM = 4000 , 3 INCHI 0'
    },
    {
      jenis: 'CPP',
      kodeFormula: 'G01',
      thickness: '25',
      width: '1250',
      length: '4000',
      core: '3',
      od: '',
      tanda: 'B',
      sourceNo: '',
      descriptionNav: 'CPP G01 25 MC X 1250 MM',
      descriptionExcel: 'CPP G01 25 MC X 1250 MM = 4000 , 3 INCHI 0 B'
    },
    {
      jenis: 'VMPET',
      kodeFormula: 'M04',
      thickness: '12',
      width: '1020',
      length: '8000',
      core: '3',
      od: 'OD2.2+CORONA',
      tanda: 'A',
      sourceNo: '',
      descriptionNav: 'VMPET M04 12 MC X 1020 MM',
      descriptionExcel: 'VMPET M04 12 MC X 1020 MM = 8000 , 3 INCHI OD2.2+CORONA A'
    },
    {
      jenis: 'PET',
      kodeFormula: 'P01',
      thickness: '12',
      width: '1000',
      length: '6000',
      core: '3',
      od: '0',
      tanda: '',
      sourceNo: '',
      descriptionNav: 'PET P01 12 MC X 1000 MM',
      descriptionExcel: 'PET P01 12 MC X 1000 MM = 6000 , 3 INCHI 0'
    }
  ];
};

// 3. Generate Tasks Dummy
const generateDummyTasks = () => {
  const today = new Date().toISOString().slice(0, 10);
  return [
    {
      uuid: generateUniqID('TSK'),
      taskCode: 'TSK-1001',
      title: 'Kalibrasi Sensor Tegangan Slitting 01',
      category: 'Maintenance',
      status: 'In Progress',
      priority: 'High',
      assignee: 'Budi Santoso',
      dueDate: today,
      qrPayload: 'QR-MAINT-SLIT-01',
      description: 'Cek sensor web tension dan presisi pisau roll',
      synced: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      uuid: generateUniqID('TSK'),
      taskCode: 'TSK-1002',
      title: 'Inspeksi Kualitas Film VMCPP Lot M06',
      category: 'QC Inspection',
      status: 'Pending',
      priority: 'Medium',
      assignee: 'Siti Rahma',
      dueDate: today,
      qrPayload: 'QR-QC-VMCPP-M06',
      description: 'Uji Optical Density dan Treatment Plasma',
      synced: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      uuid: generateUniqID('TSK'),
      taskCode: 'TSK-1003',
      title: 'Serah Terima Stock Selesai Slitting ke Gudang',
      category: 'Logistik',
      status: 'Completed',
      priority: 'Low',
      assignee: 'Ahmad Syahrul',
      dueDate: today,
      qrPayload: 'QR-LOG-TRANSFER-01',
      description: 'Transfer 12 roll fisik ke Rak Utama A-01',
      synced: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];
};

// 4. Generate Opname Dummy
const generateDummyOpname = () => {
  return [
    {
      uuid: generateUniqID('OPN'),
      itemCode: 'VMCPP-M06-20-1060',
      itemName: 'Roll VMCPP 20MC 1060mm 6500m',
      category: 'Finished Goods',
      systemStock: 48,
      physicalStock: 48,
      difference: 0,
      unit: 'Roll',
      location: 'Gudang Utama A-01',
      notes: 'Stok cocok dan aman',
      status: 'Verified',
      synced: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      uuid: generateUniqID('OPN'),
      itemCode: 'CPP-G01-25-1250',
      itemName: 'Roll CPP 25MC 1250mm 4000m',
      category: 'Raw Material',
      systemStock: 30,
      physicalStock: 29,
      difference: -1,
      unit: 'Roll',
      location: 'Rak B-04',
      notes: '1 roll dalam status karantina QC',
      status: 'Investigated',
      synced: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];
};

// ----------------------------------------------------
// HANDLERS PER MODULE
// ----------------------------------------------------

// SEED SPECIFIC MODULE
const handleSeedSpecific = async (moduleId) => {
  isProcessing.value = true;
  try {
    if (moduleId === 'label' || moduleId === 'dereport') {
      const dummies = generateDummyLabels();
      await db.labels.bulkAdd(dummies);
      await labelStore.loadLabels();
      alert(`⚡ Sukses: ${dummies.length} data label & slitting dummy berhasil dimasukkan!`);
    } else if (moduleId === 'inventory') {
      const masterDummies = generateDummyMasterItems();
      await inventoryStore.importMasterItems(masterDummies);

      // Also add sample stock upload batch
      await inventoryStore.processStockUpload({
        uploadDate: new Date().toISOString().slice(0, 10),
        fileName: 'Saldo_Stock_Sample_2026.xlsx',
        uploadedBy: 'Developer Debugger',
        items: [
          { descriptionExcel: masterDummies[0].descriptionExcel, totalRoll: 48, uploadDate: new Date().toISOString().slice(0, 10) },
          { descriptionExcel: masterDummies[1].descriptionExcel, totalRoll: 32, uploadDate: new Date().toISOString().slice(0, 10) },
          { descriptionExcel: masterDummies[2].descriptionExcel, totalRoll: 20, uploadDate: new Date().toISOString().slice(0, 10) }
        ]
      });
      await inventoryStore.loadInventory();
      alert(`⚡ Sukses: ${masterDummies.length} Master Items & Stock Gudang dummy berhasil dimasukkan!`);
    } else if (moduleId === 'tasks') {
      const taskDummies = generateDummyTasks();
      await db.tasks.bulkAdd(taskDummies);
      await taskStore.loadTasks();
      alert(`⚡ Sukses: ${taskDummies.length} data tugas operasional berhasil dimasukkan!`);
    } else if (moduleId === 'opname') {
      const opnameDummies = generateDummyOpname();
      await db.opname.bulkAdd(opnameDummies);
      await opnameStore.loadOpname();
      alert(`⚡ Sukses: ${opnameDummies.length} data stok opname gudang berhasil dimasukkan!`);
    } else if (moduleId === 'dataconfig') {
      // Re-seed standard machine configs
      configStore.mesinList = [
        { id: 1, nama: 'SLT01', jenis: 'SLITTING', defaultPaperCore: '6.09', codepackPrefix: '', status: 'ACTIVE' },
        { id: 2, nama: 'SLT02', jenis: 'SLITTING', defaultPaperCore: '6.09', codepackPrefix: '', status: 'ACTIVE' },
        { id: 3, nama: 'REW01', jenis: 'REWIND', defaultPaperCore: '3.00', codepackPrefix: 'R', status: 'ACTIVE' },
        { id: 4, nama: 'CASTING', jenis: 'CASTING', defaultPaperCore: '6.09', codepackPrefix: '', status: 'ACTIVE' }
      ];
      configStore.saveConfigs();
      alert('⚡ Sukses: Data konfigurasi mesin & formula standar berhasil dimuat!');
    } else if (moduleId === 'dashboard') {
      await handleSeedAllDatabase();
    }
  } catch (err) {
    alert('Terjadi kesalahan: ' + err.message);
  } finally {
    isProcessing.value = false;
  }
};

// CLEAR SPECIFIC MODULE
const handleClearSpecific = async (moduleId) => {
  const modName = getModuleName(moduleId);
  if (!confirm(`⚠️ Konfirmasi: Hapus SELURUH data pada modul [${modName}]?\n\nTindakan ini hanya akan menghapus data ${modName} dan tidak mempengaruhi data modul lainnya.`)) {
    return;
  }

  isProcessing.value = true;
  try {
    if (moduleId === 'label' || moduleId === 'dereport') {
      await db.labels.clear();
      await labelStore.loadLabels();
      alert(`🗑️ Berhasil: Seluruh data label (${modName}) telah dikosongkan.`);
    } else if (moduleId === 'inventory') {
      await db.inventory_items.clear();
      await db.inventory_current_stocks.clear();
      await db.inventory_stock_uploads.clear();
      await inventoryStore.loadInventory();
      alert('🗑️ Berhasil: Seluruh Master Item, Stock Tersedia, dan Riwayat Upload IMS telah dikosongkan.');
    } else if (moduleId === 'tasks') {
      await db.tasks.clear();
      await taskStore.loadTasks();
      alert('🗑️ Berhasil: Seluruh data tugas & QR telah dikosongkan.');
    } else if (moduleId === 'opname') {
      await db.opname.clear();
      await opnameStore.loadOpname();
      alert('🗑️ Berhasil: Seluruh data scan stok opname telah dikosongkan.');
    } else if (moduleId === 'dataconfig') {
      configStore.mesinList = [];
      configStore.saveConfigs();
      alert('🗑️ Berhasil: Seluruh konfigurasi mesin custom telah di-reset.');
    } else if (moduleId === 'dashboard') {
      await handleClearAllDatabase();
    }
  } catch (err) {
    alert('Terjadi kesalahan saat menghapus: ' + err.message);
  } finally {
    isProcessing.value = false;
  }
};

// Contextual triggers (Uses active page)
const handleSeedContextual = () => {
  handleSeedSpecific(currentRouteModuleId.value);
};

const handleClearContextual = () => {
  handleClearSpecific(currentRouteModuleId.value);
};

// GLOBAL ACTIONS
const handleClearAllDatabase = async () => {
  if (!confirm('🚨 PERINGATAN GLOBAL: Anda akan MENGHAPUS SEMUA DATA di SELURUH MODUL aplikasi (Labels, IMS, Tasks, Opname)?\n\nLanjutkan?')) {
    return;
  }

  isProcessing.value = true;
  try {
    await Promise.all([
      db.labels.clear(),
      db.inventory_items.clear(),
      db.inventory_current_stocks.clear(),
      db.inventory_stock_uploads.clear(),
      db.tasks.clear(),
      db.opname.clear()
    ]);

    await Promise.all([
      labelStore.loadLabels(),
      inventoryStore.loadInventory(),
      taskStore.loadTasks(),
      opnameStore.loadOpname()
    ]);

    alert('🧹 Sukses: Seluruh database aplikasi telah di-reset dan bersih total.');
  } catch (err) {
    alert('Gagal me-reset database: ' + err.message);
  } finally {
    isProcessing.value = false;
  }
};

const handleSeedAllDatabase = async () => {
  isProcessing.value = true;
  try {
    const labels = generateDummyLabels();
    const masters = generateDummyMasterItems();
    const tasks = generateDummyTasks();
    const opnames = generateDummyOpname();

    await Promise.all([
      db.labels.bulkAdd(labels),
      db.inventory_items.bulkAdd(masters),
      db.tasks.bulkAdd(tasks),
      db.opname.bulkAdd(opnames)
    ]);

    await Promise.all([
      labelStore.loadLabels(),
      inventoryStore.loadInventory(),
      taskStore.loadTasks(),
      opnameStore.loadOpname()
    ]);

    alert('🚀 Sukses: Data dummy simulasi untuk SEMUA MODUL berhasil dimuat!');
  } catch (err) {
    alert('Gagal memuat data dummy global: ' + err.message);
  } finally {
    isProcessing.value = false;
  }
};
</script>
