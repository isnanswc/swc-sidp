<template>
  <div class="space-y-4 animate-fade-in">
    <!-- Empty State -->
    <div v-if="hierarchyTree.length === 0" class="bg-white p-10 rounded-2xl border border-zinc-200 text-center text-zinc-400">
      <div class="text-3xl mb-2">📦</div>
      <p class="font-bold text-sm text-zinc-800">Tidak ada data label yang sesuai filter</p>
      <p class="text-xs text-zinc-400 mt-1 mb-4">Database label saat ini kosong atau filter aktif tidak menemukan kecocokan.</p>
      <div class="flex items-center justify-center gap-2">
        <button
          @click="$emit('reset-filter')"
          class="px-3 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold text-xs transition-all cursor-pointer"
        >
          Reset Filter (Tampilkan Semua Mesin)
        </button>
      </div>
    </div>

    <!-- LEVEL 1: TANGGAL NODES -->
    <div
      v-for="dateNode in hierarchyTree"
      :key="dateNode.date"
      class="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden"
    >
      <!-- Tanggal Header -->
      <div
        @click="toggleDateExpand(dateNode.date)"
        class="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 cursor-pointer flex items-center justify-between text-white select-none transition-colors border-b border-zinc-800 shadow-xs"
        title="Klik untuk buka/tutup seluruh shift pada tanggal ini"
      >
        <div class="flex items-center gap-2.5 min-w-0">
          <!-- Checkbox Level 1 -->
          <button
            type="button"
            @click.stop="$emit('toggle-select-date', dateNode)"
            class="w-4 h-4 rounded-full border-2 transition-all flex items-center justify-center shrink-0 cursor-pointer select-none"
            :class="[
              isDateAllSelected(dateNode) ? 'bg-red-600 border-red-600 text-white shadow-2xs' :
              isDateSomeSelected(dateNode) ? 'bg-red-500 border-red-400 text-white' :
              'border-zinc-500 bg-zinc-800 hover:border-red-400'
            ]"
            :title="isDateAllSelected(dateNode) ? 'Batalkan pilihan tanggal ini' : 'Pilih seluruh label tanggal ini'"
          >
            <svg v-if="isDateAllSelected(dateNode)" class="w-2.5 h-2.5 stroke-[3.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <span v-else-if="isDateSomeSelected(dateNode)" class="w-1.5 h-1.5 rounded-full bg-white"></span>
          </button>

          <span class="w-5 h-5 rounded bg-zinc-950 text-white flex items-center justify-center text-[10px] font-black shrink-0 border border-zinc-700">
            {{ isDateExpanded(dateNode.date) ? '▾' : '▸' }}
          </span>
          <span class="text-xs font-black tracking-tight text-white flex items-center gap-1.5">
            <span>📅</span> {{ dateNode.displayDate }}
          </span>
          <span class="text-[11px] font-mono text-zinc-400">({{ dateNode.date }})</span>
        </div>

        <!-- Badges Summary per Tanggal -->
        <div class="flex items-center gap-1.5 text-xs whitespace-nowrap">
          <span class="px-2 py-0.5 rounded text-[11px] font-bold bg-zinc-800 text-zinc-200 border border-zinc-700" title="Jumlah Shift">
            {{ dateNode.totalShifts }} Shift
          </span>
          <span class="px-2 py-0.5 rounded text-[11px] font-bold bg-zinc-800 text-zinc-300 border border-zinc-700" title="Jumlah Lot Induk">
            {{ dateNode.totalLots }} Lot
          </span>
          <span class="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-900/80 text-blue-200 border border-blue-700" title="Total Roll">
            {{ dateNode.totalRolls }} Roll
          </span>
          <span class="px-2 py-0.5 rounded text-[11px] font-black bg-red-600 text-white font-mono" title="Total Netto">
            {{ dateNode.totalNetto }} kg
          </span>
          <span v-if="dateNode.totalWaste > 0" class="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-900/80 text-rose-200 border border-rose-700 font-mono" title="Total Waste">
            Waste: {{ dateNode.totalWaste }} kg
          </span>
          <div class="hidden md:flex items-center gap-1 text-[10px] font-bold ml-1">
            <span v-if="dateNode.passCount" class="px-1.5 py-0.5 rounded bg-emerald-900/80 text-emerald-200 border border-emerald-700">PASS: {{ dateNode.passCount }}</span>
            <span v-if="dateNode.holdCount" class="px-1.5 py-0.5 rounded bg-amber-900/80 text-amber-200 border border-amber-700">HOLD: {{ dateNode.holdCount }}</span>
            <span v-if="dateNode.rejectCount" class="px-1.5 py-0.5 rounded bg-red-900/80 text-red-200 border border-red-700">REJECT: {{ dateNode.rejectCount }}</span>
          </div>
        </div>
      </div>

      <!-- Tanggal Content (LEVEL 2: OPERATOR / SHIFT LIST) -->
      <div v-if="isDateExpanded(dateNode.date)" class="divide-y divide-zinc-200 bg-white">
        <div
          v-for="shiftNode in dateNode.shifts"
          :key="shiftNode.uniqueKey"
          class="divide-y divide-zinc-200/60"
        >
          <!-- Shift Header -->
          <div
            @click="toggleShiftExpand(shiftNode.uniqueKey)"
            @contextmenu.prevent="$emit('open-shift-modal', shiftNode)"
            class="pl-6 sm:pl-8 pr-4 py-2 bg-slate-100/90 hover:bg-slate-200/80 cursor-pointer flex items-center justify-between select-none transition-colors border-b border-slate-200"
            title="Klik untuk buka/tutup lot di shift ini"
          >
            <div class="flex items-center gap-2 min-w-0">
              <span class="text-slate-400 font-mono text-xs select-none">├──</span>

              <!-- Checkbox Level 2 -->
              <button
                type="button"
                @click.stop="$emit('toggle-select-shift', shiftNode)"
                class="w-4 h-4 rounded-full border-2 transition-all flex items-center justify-center shrink-0 cursor-pointer select-none"
                :class="[
                  isShiftAllSelected(shiftNode) ? 'bg-red-600 border-red-600 text-white shadow-2xs' :
                  isShiftSomeSelected(shiftNode) ? 'bg-red-50 border-red-500 text-red-600' :
                  'border-zinc-300 bg-white hover:border-red-500'
                ]"
                :title="isShiftAllSelected(shiftNode) ? 'Batalkan pilihan shift ini' : 'Pilih seluruh roll di shift ini'"
              >
                <svg v-if="isShiftAllSelected(shiftNode)" class="w-2.5 h-2.5 stroke-[3.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span v-else-if="isShiftSomeSelected(shiftNode)" class="w-1.5 h-1.5 rounded-full bg-red-600"></span>
              </button>

              <span class="w-4 h-4 rounded bg-slate-700 text-white flex items-center justify-center text-[9px] font-black shrink-0">
                {{ isShiftExpanded(shiftNode.uniqueKey) ? '▾' : '▸' }}
              </span>

              <span class="px-2 py-0.5 rounded text-[10.5px] font-black bg-blue-600 text-white tracking-wide uppercase shadow-2xs">
                Shift {{ shiftNode.shiftNum }}
              </span>
              <span class="text-xs font-black text-zinc-900 tracking-tight flex items-center gap-1">
                <span>👤</span> {{ shiftNode.operator }}
              </span>
            </div>

            <!-- Shift Right Badges -->
            <div class="flex items-center gap-1.5 text-[11px] whitespace-nowrap">
              <span class="px-2 py-0.5 rounded bg-white text-zinc-700 font-bold border border-zinc-200">
                {{ shiftNode.totalLots }} Lot
              </span>
              <span class="px-2 py-0.5 rounded bg-white text-zinc-700 font-bold border border-zinc-200">
                {{ shiftNode.totalRolls }} Roll
              </span>
              <span class="px-2 py-0.5 rounded bg-zinc-900 text-white font-mono font-bold">
                {{ shiftNode.totalNetto }} kg
              </span>

              <span
                v-if="shiftNode.shiftWaste > 0"
                class="px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 font-mono font-bold"
                :title="`Waste Shift: ${shiftNode.shiftWaste} kg`"
              >
                🗑️ Waste: {{ shiftNode.shiftWaste }} kg
              </span>

              <button
                @click.stop="$emit('open-shift-modal', shiftNode)"
                class="px-2 py-0.5 rounded text-[10.5px] font-bold bg-white hover:bg-blue-600 hover:text-white hover:border-blue-600 border border-zinc-300 text-zinc-700 transition-all flex items-center gap-1 shrink-0 ml-0.5 shadow-2xs cursor-pointer"
                title="Edit Data Shift & Input Waste"
              >
                <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                <span>Edit Shift</span>
              </button>
            </div>
          </div>

          <!-- Shift Content (LEVEL 3: NO LOT INDUK LIST) -->
          <div v-if="isShiftExpanded(shiftNode.uniqueKey)" class="divide-y divide-zinc-200/50 bg-white">
            <div
              v-for="lotNode in shiftNode.lots"
              :key="lotNode.uniqueKey"
              class="divide-y divide-zinc-100"
            >
              <!-- Lot Header -->
              <div
                @click="toggleLotExpand(lotNode.uniqueKey)"
                @contextmenu.prevent="$emit('open-parent-lot-modal', lotNode)"
                class="pl-10 sm:pl-14 pr-4 py-2 bg-zinc-50 hover:bg-zinc-100/90 cursor-pointer flex items-center justify-between border-b border-zinc-200/80 select-none transition-colors"
                title="Klik untuk buka/tutup roll"
              >
                <div class="flex items-center gap-2 min-w-0">
                  <span class="text-zinc-400 font-mono text-xs select-none">│ ├──</span>

                  <!-- Checkbox Level 3 -->
                  <button
                    type="button"
                    @click.stop="$emit('toggle-select-lot', lotNode)"
                    class="w-4 h-4 rounded-full border-2 transition-all flex items-center justify-center shrink-0 cursor-pointer select-none"
                    :class="[
                      isLotAllSelected(lotNode) ? 'bg-red-600 border-red-600 text-white shadow-2xs' :
                      isLotSomeSelected(lotNode) ? 'bg-red-50 border-red-500 text-red-600' :
                      'border-zinc-300 bg-white hover:border-red-500'
                    ]"
                    :title="isLotAllSelected(lotNode) ? 'Batalkan pilihan lot ini' : 'Pilih seluruh roll di lot ini'"
                  >
                    <svg v-if="isLotAllSelected(lotNode)" class="w-2.5 h-2.5 stroke-[3.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span v-else-if="isLotSomeSelected(lotNode)" class="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                  </button>

                  <span class="w-4 h-4 rounded bg-red-600 text-white flex items-center justify-center text-[9px] font-black shrink-0">
                    {{ isLotExpanded(lotNode.uniqueKey) ? '▾' : '▸' }}
                  </span>
                  <span class="text-xs font-black text-zinc-900 font-mono tracking-wide uppercase">
                    {{ lotNode.lot }}
                  </span>
                  <span class="px-1.5 py-0.2 rounded text-[9.5px] font-black border uppercase" :class="[
                    lotNode.mesin === 'REWIND' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                    lotNode.mesin === 'CASTING' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                    lotNode.mesin === 'METALIZE' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                    'bg-red-50 text-red-700 border-red-200'
                  ]">
                    {{ lotNode.mesin }}
                  </span>

                  <span class="text-[11px] font-bold text-zinc-600 truncate hidden md:inline font-mono">
                    {{ [lotNode.jenis, lotNode.kode, `${lotNode.thickness} MC X ${lotNode.parentWidth || lotNode.width} MM`].filter(Boolean).join(' ') }}
                  </span>
                </div>

                <!-- Lot Right Badges -->
                <div class="flex items-center gap-1.5 text-[11px] whitespace-nowrap">
                  <span class="text-zinc-400 font-mono hidden sm:inline">SPK: <strong class="text-zinc-700">{{ lotNode.spk }}</strong></span>
                  
                  <span v-if="lotNode.parentBeratTeori" class="px-1.5 py-0.5 rounded bg-white border border-zinc-200 text-zinc-700 font-mono font-bold text-[10.5px]">
                    Teori: {{ lotNode.parentBeratTeori }} kg
                  </span>

                  <span class="px-1.5 py-0.5 rounded bg-zinc-800 text-white font-mono font-bold text-[10.5px]">
                    Child: {{ lotNode.totalNetto }} kg
                  </span>

                  <span
                    v-if="lotNode.parentSisaKg > 0"
                    class="px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-300 font-mono font-bold text-[10.5px]"
                  >
                    Sisa: {{ lotNode.parentSisaMeter }}M ({{ lotNode.parentSisaKg }} kg)
                  </span>

                  <span
                    v-if="lotNode.diffNetto !== null"
                    :class="[
                      'px-1.5 py-0.5 rounded text-[10px] font-mono font-black border',
                      lotNode.diffStatus === 'OK' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      lotNode.diffStatus === 'WARNING' ? 'bg-amber-50 text-amber-700 border-amber-300' :
                      'bg-red-50 text-red-700 border-red-300 animate-pulse'
                    ]"
                  >
                    Selisih: {{ lotNode.diffNetto >= 0 ? '+' : '' }}{{ lotNode.diffNetto }} kg
                    <span class="opacity-75">({{ lotNode.diffPercent }}%)</span>
                  </span>

                  <span class="px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600 font-bold text-[10.5px]">
                    {{ lotNode.totalItems }} Roll
                  </span>

                  <button
                    @click.stop="$emit('open-parent-lot-modal', lotNode)"
                    class="px-2 py-0.5 rounded text-[10.5px] font-bold bg-white hover:bg-red-600 hover:text-white hover:border-red-600 border border-zinc-300 text-zinc-700 transition-all flex items-center gap-1 shrink-0 ml-0.5 shadow-2xs cursor-pointer"
                    title="Edit Data Parent Lot"
                  >
                    <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    <span>Edit Lot</span>
                  </button>
                </div>
              </div>

              <!-- LEVEL 4: DAFTAR TURUNAN (MICRO-TABLE) -->
              <div v-if="isLotExpanded(lotNode.uniqueKey)" class="overflow-x-auto bg-zinc-50/20 border-b border-zinc-100">
                <table class="w-full text-left text-xs border-collapse">
                  <thead class="bg-zinc-50/90 text-zinc-500 text-[10px] font-bold uppercase tracking-wider border-b border-zinc-200 select-none">
                    <tr>
                      <th class="py-1.5 px-2.5 w-12 text-center pl-10 sm:pl-14">
                        <button
                          type="button"
                          @click.stop="$emit('toggle-select-lot', lotNode)"
                          class="w-3.5 h-3.5 mx-auto rounded-full border-2 transition-all flex items-center justify-center cursor-pointer select-none"
                          :class="[
                            isLotAllSelected(lotNode) ? 'bg-red-600 border-red-600 text-white shadow-2xs' :
                            isLotSomeSelected(lotNode) ? 'bg-red-50 border-red-500 text-red-600' :
                            'border-zinc-300 bg-white hover:border-red-500'
                          ]"
                          :title="isLotAllSelected(lotNode) ? 'Batalkan pilihan semua' : 'Pilih semua roll di tabel ini'"
                        >
                          <svg v-if="isLotAllSelected(lotNode)" class="w-2 h-2 stroke-[3.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                          <span v-else-if="isLotSomeSelected(lotNode)" class="w-1 h-1 rounded-full bg-red-600"></span>
                        </button>
                      </th>
                      <th class="py-1.5 px-2.5 font-mono">Turunan</th>
                      <th class="py-1.5 px-2.5 font-mono">Kode Pack</th>
                      <th class="py-1.5 px-2.5">Dimensi & Meter</th>
                      <th class="py-1.5 px-2.5 text-right">Netto</th>
                      <th class="py-1.5 px-2.5 text-center">Status</th>
                      <th class="py-1.5 px-2.5">Operator</th>
                      <th class="py-1.5 px-2.5 text-center w-24">Aksi</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-zinc-100 text-zinc-700 font-medium text-xs">
                    <tr
                      v-for="(item) in lotNode.items"
                      :key="item.id"
                      @contextmenu.prevent="$emit('open-row-action-modal', item)"
                      :class="[
                        'transition-colors cursor-pointer',
                        selectedIds.includes(item.id) ? 'bg-red-50/60' : 'hover:bg-red-50/20'
                      ]"
                    >
                      <!-- Checkbox Cell -->
                      <td class="py-1.5 px-2.5 text-center whitespace-nowrap pl-10 sm:pl-14" @click.stop>
                        <button
                          type="button"
                          @click="$emit('toggle-select-item', item.id)"
                          class="w-4 h-4 mx-auto rounded-full border-2 transition-all flex items-center justify-center cursor-pointer select-none"
                          :class="selectedIds.includes(item.id) ? 'bg-red-600 border-red-600 text-white shadow-2xs' : 'border-zinc-300 bg-white hover:border-red-500'"
                          :title="selectedIds.includes(item.id) ? 'Batalkan pilihan' : 'Pilih roll ini untuk cetak'"
                        >
                          <svg v-if="selectedIds.includes(item.id)" class="w-2.5 h-2.5 stroke-[3.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        </button>
                      </td>

                      <td class="py-1.5 px-2.5 font-mono font-bold text-red-600 whitespace-nowrap">
                        {{ item.turunan }}
                      </td>

                      <td class="py-1.5 px-2.5 whitespace-nowrap">
                        <span v-if="isDuplicateKodePack(item)" class="px-1.5 py-0.2 rounded bg-red-600 text-yellow-300 font-bold font-mono text-[10px]">
                          {{ item.kodePack }}{{ item.subKode }}
                        </span>
                        <span v-else class="font-mono text-zinc-700">
                          {{ item.kodePack }}<span class="text-red-600 font-bold">{{ item.subKode }}</span>
                        </span>
                      </td>

                      <td class="py-1.5 px-2.5 whitespace-nowrap text-zinc-600">
                        {{ item.width }}mm × {{ item.length }}m
                      </td>

                      <td class="py-1.5 px-2.5 text-right font-mono font-bold text-zinc-900 whitespace-nowrap">
                        {{ item.netto }} kg
                      </td>

                      <td class="py-1.5 px-2.5 text-center whitespace-nowrap">
                        <span :class="[
                          'px-2 py-0.2 rounded text-[9.5px] font-bold border',
                          item.status === 'PASS' || item.status === 'OK' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          item.status === 'HOLD' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-red-50 text-red-700 border-red-200'
                        ]">
                          {{ item.status }}
                        </span>
                      </td>

                      <!-- Operator (Database Resolved) -->
                      <td class="py-1.5 px-2.5 whitespace-nowrap text-zinc-800 font-bold">
                        <div class="flex items-center gap-1.5">
                          <span class="w-5 h-5 rounded-full bg-zinc-900 text-white flex items-center justify-center text-[9px] font-black shrink-0">
                            {{ getOperatorInitial(item) }}
                          </span>
                          <span class="font-bold text-zinc-900 text-xs">{{ getOperatorDisplayName(item) }}</span>
                          <span v-if="getOperatorCode(item)" class="px-1 py-0.2 rounded bg-zinc-100 text-zinc-700 font-mono text-[9px] font-black border border-zinc-300">
                            {{ getOperatorCode(item) }}
                          </span>
                        </div>
                      </td>

                      <!-- Aksi -->
                      <td class="py-1.5 px-2.5 text-center whitespace-nowrap" @click.stop>
                        <div class="flex items-center justify-center gap-1">
                          <button
                            @click="$emit('preview-single', item)"
                            class="p-1 rounded hover:bg-zinc-200 text-indigo-600 transition-colors cursor-pointer"
                            title="Pratinjau"
                          >
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                          </button>
                          <button
                            @click="$emit('open-modal', item)"
                            class="p-1 rounded hover:bg-zinc-200 text-blue-600 transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                          </button>
                          <button
                            @click="$emit('duplicate-data', item)"
                            class="p-1 rounded hover:bg-zinc-200 text-zinc-600 transition-colors cursor-pointer"
                            title="Duplikat"
                          >
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                          </button>
                          <button
                            @click="$emit('delete-data', item)"
                            class="p-1 rounded hover:bg-red-100 text-red-600 transition-colors cursor-pointer"
                            title="Hapus"
                          >
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
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

defineProps({
  hierarchyTree: { type: Array, required: true },
  selectedIds: { type: Array, default: () => [] },
  isDateExpanded: { type: Function, required: true },
  isShiftExpanded: { type: Function, required: true },
  isLotExpanded: { type: Function, required: true },
  toggleDateExpand: { type: Function, required: true },
  toggleShiftExpand: { type: Function, required: true },
  toggleLotExpand: { type: Function, required: true },
  isDateAllSelected: { type: Function, required: true },
  isDateSomeSelected: { type: Function, required: true },
  isShiftAllSelected: { type: Function, required: true },
  isShiftSomeSelected: { type: Function, required: true },
  isLotAllSelected: { type: Function, required: true },
  isLotSomeSelected: { type: Function, required: true },
  isDuplicateKodePack: { type: Function, required: true }
});

defineEmits([
  'reseed-dummy',
  'reset-filter',
  'toggle-select-date',
  'toggle-select-shift',
  'toggle-select-lot',
  'toggle-select-item',
  'open-shift-modal',
  'open-parent-lot-modal',
  'open-row-action-modal',
  'preview-single',
  'open-modal',
  'duplicate-data',
  'delete-data'
]);
</script>
