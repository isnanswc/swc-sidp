<template>
  <div class="space-y-6 animate-fade-in">
    <!-- Toolbar Kontrol Periode Waktu & Ringkasan Cepat -->
    <div class="bg-white p-4 rounded-2xl border border-zinc-200/90 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <!-- Periode Pills -->
      <div class="flex items-center gap-1.5 flex-wrap">
        <span class="text-xs font-bold text-zinc-500 mr-1 flex items-center gap-1">
          <svg class="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
          Periode:
        </span>
        <button
          v-for="p in periodOptions"
          :key="p.key"
          type="button"
          @click="selectPeriod(p.key)"
          :class="[
            'px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer',
            selectedPeriod === p.key
              ? 'bg-zinc-900 text-white shadow-xs font-black'
              : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900'
          ]"
        >
          {{ p.label }}
        </button>
      </div>

      <!-- Rentang Tanggal Custom jika dipilih -->
      <div v-if="selectedPeriod === 'CUSTOM'" class="flex items-center gap-2 text-xs">
        <input
          v-model="customStart"
          type="date"
          class="px-2.5 py-1.5 rounded-xl border border-zinc-300 text-xs font-mono font-medium outline-none focus:border-red-600 bg-zinc-50"
        />
        <span class="text-zinc-400 font-bold">s/d</span>
        <input
          v-model="customEnd"
          type="date"
          class="px-2.5 py-1.5 rounded-xl border border-zinc-300 text-xs font-mono font-medium outline-none focus:border-red-600 bg-zinc-50"
        />
      </div>

      <!-- Keterangan Rentang Terpilih -->
      <div class="text-[11px] font-mono text-zinc-500 bg-zinc-50 px-3 py-1.5 rounded-xl border border-zinc-200">
        Rentang: <strong class="text-zinc-800">{{ formattedRangeLabel }}</strong>
      </div>
    </div>

    <!-- Stats KPI Cards Permintaan -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div class="bg-white p-4 rounded-2xl border border-zinc-200/90 shadow-2xs">
        <span class="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Total Bon / FPB</span>
        <div class="text-xl sm:text-2xl font-black text-zinc-900 font-mono mt-1">
          {{ filteredFpbs.length }} <span class="text-xs font-sans text-zinc-400 font-normal">Form</span>
        </div>
        <p class="text-[10px] text-zinc-400 mt-1">Dalam rentang terpilih</p>
      </div>

      <div class="bg-white p-4 rounded-2xl border border-zinc-200/90 shadow-2xs">
        <span class="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Variasi Item Diminta</span>
        <div class="text-xl sm:text-2xl font-black text-blue-600 font-mono mt-1">
          {{ rankedItems.length }} <span class="text-xs font-sans text-zinc-400 font-normal">Jenis Item</span>
        </div>
        <p class="text-[10px] text-zinc-400 mt-1">Unik berdasarkan nama</p>
      </div>

      <div class="bg-white p-4 rounded-2xl border border-zinc-200/90 shadow-2xs">
        <span class="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Total Kuantitas Kumulatif</span>
        <div class="text-xl sm:text-2xl font-black text-emerald-600 font-mono mt-1">
          {{ totalQtyAllItems }} <span class="text-xs font-sans text-zinc-400 font-normal">Unit/Qty</span>
        </div>
        <p class="text-[10px] text-zinc-400 mt-1">Gabungan seluruh item</p>
      </div>

      <div class="bg-white p-4 rounded-2xl border border-zinc-200/90 shadow-2xs">
        <span class="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Item Paling Sering Diminta</span>
        <div class="text-sm font-black text-red-600 truncate mt-1.5" :title="topRequestedItem?.namaBarang || '-'">
          {{ topRequestedItem ? topRequestedItem.namaBarang : '-' }}
        </div>
        <p class="text-[10px] text-zinc-500 font-mono mt-1">
          {{ topRequestedItem ? `${topRequestedItem.totalQty} ${topRequestedItem.satuan || ''} (${topRequestedItem.frequency}x di-bon)` : 'Belum ada data' }}
        </p>
      </div>
    </div>

    <!-- Konten Utama: 2 Kolom (Kiri: Ranking List Item, Kanan: Detail & Grafik Interaktif) -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
      <!-- KOLOM KIRI: LIST ITEM TERBANYAK DI-BON (5 Kolom) -->
      <div class="lg:col-span-5 bg-white rounded-2xl border border-zinc-200/90 shadow-2xs p-4 sm:p-5 space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-zinc-100">
          <div>
            <h3 class="text-sm font-black text-zinc-900 uppercase">Ranking Item Terbanyak Di-bon</h3>
            <p class="text-[11px] text-zinc-500">Klik item untuk melihat grafik frekuensi & rincian</p>
          </div>
          <span class="px-2 py-0.5 rounded-lg text-[10px] font-bold font-mono bg-zinc-100 text-zinc-700">
            {{ rankedItems.length }} Item
          </span>
        </div>

        <!-- Search Filter Item List -->
        <div class="relative">
          <input
            v-model="itemSearch"
            type="text"
            placeholder="Cari nama item di ranking..."
            class="w-full pl-8 pr-3 py-1.5 rounded-xl border border-zinc-200 text-xs focus:ring-1 focus:ring-red-600 focus:border-red-600 outline-none bg-zinc-50"
          />
          <svg class="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
        </div>

        <!-- Daftar Item dengan Bar Persentase -->
        <div class="space-y-2 max-h-[580px] overflow-y-auto pr-1">
          <div
            v-for="(item, idx) in filteredRankedItems"
            :key="item.namaBarang"
            @click="selectItem(item)"
            :class="[
              'p-3 rounded-xl border transition-all cursor-pointer relative overflow-hidden',
              selectedItemName === item.namaBarang
                ? 'bg-red-50/60 border-red-500 shadow-xs ring-1 ring-red-500'
                : 'bg-zinc-50/50 hover:bg-zinc-100/70 border-zinc-200/80'
            ]"
          >
            <!-- Progress Bar Background Proporsional -->
            <div
              class="absolute left-0 top-0 bottom-0 opacity-15 pointer-events-none transition-all duration-500"
              :class="selectedItemName === item.namaBarang ? 'bg-red-600' : 'bg-zinc-600'"
              :style="{ width: `${item.percentOfTop}%` }"
            ></div>

            <div class="relative z-10 flex items-start justify-between gap-2">
              <div class="flex items-start gap-2.5 min-w-0">
                <span
                  :class="[
                    'w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5',
                    idx === 0 ? 'bg-amber-400 text-amber-950 font-mono shadow-2xs' :
                    idx === 1 ? 'bg-zinc-300 text-zinc-800 font-mono' :
                    idx === 2 ? 'bg-amber-700/60 text-white font-mono' :
                    'bg-zinc-200 text-zinc-600 font-mono'
                  ]"
                >
                  {{ idx + 1 }}
                </span>
                <div class="min-w-0">
                  <div class="text-xs font-bold text-zinc-900 truncate" :title="item.namaBarang">
                    {{ item.namaBarang }}
                  </div>
                  <div class="text-[10.5px] text-zinc-500 flex items-center gap-2 mt-0.5 flex-wrap">
                    <span>Frekuensi: <strong class="text-zinc-700">{{ item.frequency }}x</strong> bon</span>
                    <span>•</span>
                    <span>Divisi: <strong class="text-zinc-700">{{ item.deptCount }} Dept</strong></span>
                  </div>
                </div>
              </div>

              <div class="text-right shrink-0">
                <div class="text-xs font-black text-zinc-900 font-mono">
                  {{ item.totalQty }} <span class="text-[10px] font-normal text-zinc-500">{{ item.satuan || '' }}</span>
                </div>
                <div class="text-[9.5px] font-mono text-zinc-400 mt-0.5">
                  {{ item.percentOfTotal }}% total
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State Ranking -->
          <div v-if="filteredRankedItems.length === 0" class="p-8 text-center text-xs text-zinc-400 italic">
            Tidak ada item bon dalam rentang waktu ini.
          </div>
        </div>
      </div>

      <!-- KOLOM KANAN: GRAFIK TREN INTERAKTIF & LOG PERMINTAAN DETAIL (7 Kolom) -->
      <div class="lg:col-span-7 space-y-5">
        <!-- Panel Grafik Line Interaktif -->
        <div class="bg-white rounded-2xl border border-zinc-200/90 shadow-2xs p-4 sm:p-5 space-y-4">
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-zinc-100">
            <div>
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full bg-red-600"></span>
                <h3 class="text-sm font-black text-zinc-900 uppercase">
                  Tren Frekuensi & Volume Pengebonan
                </h3>
              </div>
              <p class="text-xs text-zinc-500 mt-0.5">
                Item: <strong class="text-red-600 uppercase">{{ activeSelectedItemDetails?.namaBarang || '-' }}</strong>
              </p>
            </div>

            <!-- Satuan Badge & Info -->
            <div class="flex items-center gap-2 text-xs font-mono">
              <span class="px-2.5 py-1 rounded-lg bg-zinc-100 text-zinc-700 font-bold border border-zinc-200">
                Total: {{ activeSelectedItemDetails?.totalQty || 0 }} {{ activeSelectedItemDetails?.satuan || '' }}
              </span>
              <span class="px-2.5 py-1 rounded-lg bg-red-50 text-red-700 font-bold border border-red-200">
                {{ activeSelectedItemDetails?.frequency || 0 }}x Permintaan
              </span>
            </div>
          </div>

          <!-- Canvas Chart.js Container -->
          <div class="relative w-full h-[280px]">
            <canvas ref="chartCanvasRef"></canvas>
            
            <div
              v-if="!activeSelectedItemDetails || chartTimelineData.labels.length === 0"
              class="absolute inset-0 flex items-center justify-center bg-white/90 text-xs text-zinc-400 italic"
            >
              Belum ada riwayat pengebonan untuk item ini pada rentang waktu terpilih.
            </div>
          </div>

          <div class="text-[10px] text-zinc-400 italic flex items-center justify-between pt-1 border-t border-zinc-100">
            <span>* Titik grafik menunjukkan tanggal pengebonan. Arahkan kursor / klik titik untuk melihat divisi & pemohon.</span>
            <span class="font-mono">Chart.js Responsive Line</span>
          </div>
        </div>

        <!-- Panel Rincian Riwayat Transaksi Bon Item Terpilih (Multi-Divisi & Nama Pemohon) -->
        <div class="bg-white rounded-2xl border border-zinc-200/90 shadow-2xs p-4 sm:p-5 space-y-3">
          <div class="flex items-center justify-between pb-2 border-b border-zinc-100">
            <h4 class="text-xs font-black text-zinc-900 uppercase flex items-center gap-1.5">
              <svg class="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
              Riwayat Pengebonan: {{ activeSelectedItemDetails?.namaBarang || '-' }}
            </h4>
            <span class="text-[10px] font-mono text-zinc-400">
              {{ activeItemHistoryLogs.length }} Transaksi
            </span>
          </div>

          <!-- Tabel Riwayat Bon Item -->
          <div class="overflow-x-auto max-h-[300px] overflow-y-auto">
            <table class="w-full text-left text-xs border-collapse">
              <thead class="bg-zinc-50 border-b border-zinc-200 text-zinc-600 font-bold uppercase text-[10px] sticky top-0 z-10">
                <tr>
                  <th class="px-3 py-2">Tanggal</th>
                  <th class="px-3 py-2">No. FPB</th>
                  <th class="px-3 py-2">Divisi / Dept</th>
                  <th class="px-3 py-2">Pemohon</th>
                  <th class="px-3 py-2 text-right">Jumlah</th>
                  <th class="px-3 py-2">Keterangan</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-zinc-100 font-mono text-[11px]">
                <tr
                  v-for="(log, lIdx) in activeItemHistoryLogs"
                  :key="lIdx"
                  class="hover:bg-zinc-50/80 transition-colors"
                >
                  <td class="px-3 py-2 text-zinc-800 whitespace-nowrap">{{ log.tanggal }}</td>
                  <td class="px-3 py-2 font-bold text-red-600 whitespace-nowrap">{{ log.nomorFpb }}</td>
                  <td class="px-3 py-2 uppercase font-sans font-bold text-zinc-700 whitespace-nowrap">
                    <span class="px-2 py-0.5 rounded-md bg-zinc-100 border border-zinc-200 text-[10px]">
                      {{ log.bagianDept }}
                    </span>
                  </td>
                  <td class="px-3 py-2 font-sans text-zinc-800 whitespace-nowrap">
                    {{ log.pemohon || '-' }}
                  </td>
                  <td class="px-3 py-2 text-right font-black text-zinc-900 whitespace-nowrap">
                    {{ log.qty }} <span class="text-[9.5px] font-normal text-zinc-500">{{ log.satuan || '' }}</span>
                  </td>
                  <td class="px-3 py-2 font-sans text-zinc-500 text-[10.5px] truncate max-w-[160px]" :title="log.keterangan || '-'">
                    {{ log.keterangan || '-' }}
                  </td>
                </tr>

                <tr v-if="activeItemHistoryLogs.length === 0">
                  <td colspan="6" class="px-3 py-6 text-center text-zinc-400 font-sans italic">
                    Belum ada riwayat pengebonan untuk item ini pada rentang waktu yang dipilih.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { useFpbStore } from '@/stores/fpbStore';
import Chart from 'chart.js/auto';

const fpbStore = useFpbStore();

// Opsi Filter Periode Waktu
const periodOptions = [
  { key: 'TODAY', label: 'Hari Ini' },
  { key: '7DAYS', label: '7 Hari Terakhir' },
  { key: 'MONTH', label: 'Bulan Ini' },
  { key: '3MONTHS', label: '3 Bulan Terakhir' },
  { key: 'CUSTOM', label: 'Rentang Khusus...' }
];

// Default: Bulan Ini (1 bulan terakhir / bulan berjalan)
const selectedPeriod = ref('MONTH');
const customStart = ref('');
const customEnd = ref('');
const itemSearch = ref('');
const selectedItemName = ref('');

// Chart References
const chartCanvasRef = ref(null);
let chartInstance = null;

// Helper: Format tanggal ISO YYYY-MM-DD
const toYmd = (d) => {
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

// Hitung Rentang Tanggal Mulai dan Selesai Berdasarkan Filter Periode
const activeDateRange = computed(() => {
  const now = new Date();
  let startStr = '';
  let endStr = toYmd(now);

  if (selectedPeriod.value === 'TODAY') {
    startStr = endStr;
  } else if (selectedPeriod.value === '7DAYS') {
    const d = new Date();
    d.setDate(d.getDate() - 6);
    startStr = toYmd(d);
  } else if (selectedPeriod.value === 'MONTH') {
    // 1 Bulan Terakhir (30 hari ke belakang)
    const d = new Date();
    d.setDate(d.getDate() - 29);
    startStr = toYmd(d);
  } else if (selectedPeriod.value === '3MONTHS') {
    const d = new Date();
    d.setDate(d.getDate() - 89);
    startStr = toYmd(d);
  } else if (selectedPeriod.value === 'CUSTOM') {
    startStr = customStart.value || '2020-01-01';
    endStr = customEnd.value || toYmd(now);
  }

  return { start: startStr, end: endStr };
});

const formattedRangeLabel = computed(() => {
  const { start, end } = activeDateRange.value;
  return `${start} s/d ${end}`;
});

const selectPeriod = (key) => {
  selectedPeriod.value = key;
  if (key === 'CUSTOM' && (!customStart.value || !customEnd.value)) {
    const now = new Date();
    const dPast = new Date();
    dPast.setDate(dPast.getDate() - 30);
    customStart.value = toYmd(dPast);
    customEnd.value = toYmd(now);
  }
};

// Filter FPB Records Berdasarkan Rentang Waktu
const filteredFpbs = computed(() => {
  const { start, end } = activeDateRange.value;
  return fpbStore.fpbList.filter(f => {
    const t = String(f.tanggal || '').slice(0, 10);
    if (!t) return false;
    return t >= start && t <= end;
  });
});

// Agregasi Seluruh Item Dalam Rentang Terpilih
const rankedItems = computed(() => {
  const map = new Map();

  for (const fpb of filteredFpbs.value) {
    const items = Array.isArray(fpb.items) ? fpb.items : [];
    for (const it of items) {
      const name = String(it.namaBarang || '').trim();
      if (!name) continue;
      const key = name.toLowerCase();

      const numQty = parseFloat(it.qty) || 0;
      const sat = it.satuan || '';
      const dept = fpb.bagianDept || '-';
      const pemohon = fpb.pemohon || '-';
      const tgl = String(fpb.tanggal || '').slice(0, 10);

      if (!map.has(key)) {
        map.set(key, {
          namaBarang: name,
          totalQty: 0,
          frequency: 0,
          satuan: sat,
          depts: new Set(),
          transactions: []
        });
      }

      const rec = map.get(key);
      rec.totalQty += numQty;
      rec.frequency += 1;
      if (!rec.satuan && sat) rec.satuan = sat;
      rec.depts.add(dept);
      rec.transactions.push({
        tanggal: tgl,
        nomorFpb: fpb.nomorFpb,
        bagianDept: dept,
        pemohon: pemohon,
        qty: numQty,
        satuan: sat,
        keterangan: it.keterangan || ''
      });
    }
  }

  // Ubah ke Array dan Urutkan berdasarkan Total Kuantitas (atau frekuensi jika kuantitas sama)
  const list = Array.from(map.values()).map(it => ({
    ...it,
    deptCount: it.depts.size,
    totalQty: Math.round(it.totalQty * 100) / 100
  }));

  list.sort((a, b) => {
    if (b.totalQty !== a.totalQty) return b.totalQty - a.totalQty;
    return b.frequency - a.frequency;
  });

  const maxQty = list.length > 0 ? list[0].totalQty : 1;
  const grandTotalQty = list.reduce((acc, it) => acc + it.totalQty, 0) || 1;

  return list.map(it => ({
    ...it,
    percentOfTop: Math.round((it.totalQty / maxQty) * 100),
    percentOfTotal: ((it.totalQty / grandTotalQty) * 100).toFixed(1)
  }));
});

const filteredRankedItems = computed(() => {
  if (!itemSearch.value.trim()) return rankedItems.value;
  const q = itemSearch.value.trim().toLowerCase();
  return rankedItems.value.filter(it => it.namaBarang.toLowerCase().includes(q));
});

const totalQtyAllItems = computed(() => {
  return rankedItems.value.reduce((acc, it) => acc + it.totalQty, 0);
});

const topRequestedItem = computed(() => {
  return rankedItems.value.length > 0 ? rankedItems.value[0] : null;
});

// Item yang Sedang Aktif Dipilih untuk Ditampilkan Grafiknya
const activeSelectedItemDetails = computed(() => {
  if (!selectedItemName.value && rankedItems.value.length > 0) {
    return rankedItems.value[0];
  }
  return rankedItems.value.find(it => it.namaBarang === selectedItemName.value) || rankedItems.value[0] || null;
});

const selectItem = (item) => {
  selectedItemName.value = item.namaBarang;
};

// Data Riwayat Transaksi Item Aktif (Diurutkan Tanggal Terbaru)
const activeItemHistoryLogs = computed(() => {
  if (!activeSelectedItemDetails.value) return [];
  const trans = [...(activeSelectedItemDetails.value.transactions || [])];
  trans.sort((a, b) => b.tanggal.localeCompare(a.tanggal));
  return trans;
});

// Menyiapkan Data Timeline Sumbu X (Tanggal) & Sumbu Y (Kuantitas) untuk Chart.js
const chartTimelineData = computed(() => {
  if (!activeSelectedItemDetails.value) {
    return { labels: [], datasetQty: [], tooltipDetails: [] };
  }

  const trans = activeSelectedItemDetails.value.transactions || [];
  // Kelompokkan per tanggal
  const dateMap = new Map();

  for (const t of trans) {
    const tgl = t.tanggal;
    if (!dateMap.has(tgl)) {
      dateMap.set(tgl, {
        totalQty: 0,
        count: 0,
        entries: []
      });
    }
    const bucket = dateMap.get(tgl);
    bucket.totalQty += t.qty;
    bucket.count += 1;
    bucket.entries.push(t);
  }

  // Urutkan tanggal secara kronologis (dari masa lalu ke sekarang)
  const sortedDates = Array.from(dateMap.keys()).sort();

  const labels = [];
  const datasetQty = [];
  const tooltipDetails = [];

  for (const dStr of sortedDates) {
    const bucket = dateMap.get(dStr);
    labels.push(dStr);
    datasetQty.push(bucket.totalQty);
    tooltipDetails.push(bucket.entries);
  }

  return { labels, datasetQty, tooltipDetails };
});

// Inisialisasi & Render Grafik Line Interaktif dengan Chart.js
const renderChart = () => {
  if (!chartCanvasRef.value) return;

  const data = chartTimelineData.value;
  const ctx = chartCanvasRef.value.getContext('2d');

  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }

  if (data.labels.length === 0) return;

  const satLabel = activeSelectedItemDetails.value?.satuan || 'Unit';

  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.labels,
      datasets: [
        {
          label: `Kuantitas Bon (${satLabel})`,
          data: data.datasetQty,
          borderColor: '#dc2626', // Red 600
          backgroundColor: 'rgba(220, 38, 38, 0.08)',
          borderWidth: 2.5,
          tension: 0.25,
          fill: true,
          pointBackgroundColor: '#dc2626',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 7
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false
      },
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: {
            boxWidth: 12,
            font: { family: 'Plus Jakarta Sans', size: 11, weight: 'bold' }
          }
        },
        tooltip: {
          backgroundColor: 'rgba(24, 24, 27, 0.95)', // Zinc 900
          titleFont: { family: 'JetBrains Mono', size: 11, weight: 'bold' },
          bodyFont: { family: 'Plus Jakarta Sans', size: 10.5 },
          padding: 10,
          cornerRadius: 8,
          callbacks: {
            label: (context) => {
              const val = context.parsed.y;
              return ` Total Diminta: ${val} ${satLabel}`;
            },
            afterBody: (tooltipItems) => {
              const idx = tooltipItems[0].dataIndex;
              const entries = data.tooltipDetails[idx] || [];
              if (entries.length === 0) return '';
              
              const lines = ['─────────────────────────', 'Rincian Pemohon:'];
              entries.forEach((e, eIdx) => {
                lines.push(`• [${e.bagianDept.toUpperCase()}] ${e.pemohon || 'Staff'}: ${e.qty} ${e.satuan || ''}`);
              });
              return lines;
            }
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            font: { family: 'JetBrains Mono', size: 9.5 },
            maxRotation: 45
          }
        },
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(0, 0, 0, 0.05)' },
          ticks: {
            font: { family: 'JetBrains Mono', size: 9.5 },
            precision: 0
          }
        }
      }
    }
  });
};

// Pantau perubahan item aktif atau data periode untuk update grafik
watch(
  [() => activeSelectedItemDetails.value, () => chartTimelineData.value],
  async () => {
    await nextTick();
    renderChart();
  },
  { deep: true }
);

// Pasang default selected item pertama kali saat data terisi
watch(
  () => rankedItems.value,
  (newList) => {
    if (newList.length > 0 && !selectedItemName.value) {
      selectedItemName.value = newList[0].namaBarang;
    }
  },
  { immediate: true }
);

onMounted(async () => {
  await nextTick();
  renderChart();
});

onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }
});
</script>
