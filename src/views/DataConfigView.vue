<template>
  <div class="min-h-screen bg-zinc-100 pb-16">
    <!-- PAGE HEADER -->
    <div class="bg-white border-b border-zinc-200 shadow-xs sticky top-0 z-20">
      <div class="max-w-screen-xl mx-auto px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center shrink-0 shadow-xs">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 2v2M12 20v2M2 12h2M20 12h2"/>
            </svg>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h1 class="font-black text-zinc-900 text-base leading-tight">Data Configuration</h1>
              <span class="text-[10px] font-black px-2 py-0.5 rounded-full bg-zinc-900 text-white tracking-wide">4 MODUL</span>
            </div>
            <p class="text-xs text-zinc-500 font-medium mt-0.5">Master data terpusat: Formula & BOM film, master resin, mesin, operator, lokasi gudang, & panjang standard</p>
          </div>
        </div>

        <!-- TOOLBAR ACTIONS -->
        <div class="flex items-center gap-2 flex-wrap">
          <!-- 1. Download Template Dropdown -->
          <div class="relative">
            <button
              @click="showTemplateMenu = !showTemplateMenu; showExportMenu = false"
              class="px-3 py-1.5 rounded-xl bg-white border border-zinc-300 hover:bg-zinc-50 text-zinc-700 text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
            >
              <svg class="w-3.5 h-3.5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
              </svg>
              <span>Download Template</span>
              <span class="text-[10px] text-zinc-400">▼</span>
            </button>

            <!-- Dropdown Menu Download Template -->
            <div
              v-if="showTemplateMenu"
              @click="showTemplateMenu = false"
              class="absolute right-0 top-full mt-1.5 w-64 bg-white rounded-2xl shadow-xl border border-zinc-200 py-1.5 z-50 text-xs animate-fade-in"
            >
              <button
                @click="handleDownloadAllTemplates"
                class="w-full px-3.5 py-2.5 text-left hover:bg-zinc-50 text-zinc-800 font-bold flex items-center gap-2.5 transition-colors cursor-pointer"
              >
                <span class="text-base">📥</span>
                <div>
                  <div class="text-zinc-950 font-black">Template Full Master (Semua Sheet)</div>
                  <div class="text-[10px] text-zinc-400 font-normal">1 File .xlsx berisi seluruh sheet template siap isi</div>
                </div>
              </button>

              <button
                @click="handleDownloadCurrentTemplate"
                class="w-full px-3.5 py-2.5 text-left hover:bg-zinc-50 text-zinc-800 font-bold flex items-center gap-2.5 transition-colors cursor-pointer border-t border-zinc-100"
              >
                <span class="text-base">📄</span>
                <div>
                  <div class="text-zinc-950 font-black">Template Modul Ini Saja</div>
                  <div class="text-[10px] text-zinc-400 font-normal">Template untuk sheet modul yang sedang aktif</div>
                </div>
              </button>
            </div>
          </div>

          <!-- 2. Export Dropdown -->
          <div class="relative">
            <button
              @click="showExportMenu = !showExportMenu; showTemplateMenu = false"
              class="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              <span>Export Excel</span>
              <span class="text-[10px]">▼</span>
            </button>

            <!-- Dropdown Menu Export -->
            <div
              v-if="showExportMenu"
              @click="showExportMenu = false"
              class="absolute right-0 top-full mt-1.5 w-64 bg-white rounded-2xl shadow-xl border border-zinc-200 py-1.5 z-50 text-xs animate-fade-in"
            >
              <button
                @click="handleExportAll"
                class="w-full px-3.5 py-2.5 text-left hover:bg-emerald-50 text-zinc-800 font-bold flex items-center gap-2.5 transition-colors cursor-pointer"
              >
                <span class="text-base">📊</span>
                <div>
                  <div class="text-zinc-950 font-black">Export Semua Sheet (Full Master)</div>
                  <div class="text-[10px] text-zinc-400 font-normal">Seluruh sheet master diekspor dalam 1 file Excel</div>
                </div>
              </button>

              <button
                @click="handleExportCurrentTab"
                class="w-full px-3.5 py-2.5 text-left hover:bg-emerald-50 text-zinc-800 font-bold flex items-center gap-2.5 transition-colors cursor-pointer border-t border-zinc-100"
              >
                <span class="text-base">📑</span>
                <div>
                  <div class="text-zinc-950 font-black">Export Modul Ini Saja</div>
                  <div class="text-[10px] text-zinc-400 font-normal">Hanya sheet modul yang sedang aktif</div>
                </div>
              </button>
            </div>
          </div>

          <!-- 3. Import Button -->
          <button
            @click="triggerImportFileInput"
            class="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
            </svg>
            <span>Import Excel</span>
          </button>

          <!-- Hidden Input for Excel File -->
          <input
            ref="excelFileInput"
            type="file"
            accept=".xlsx, .xls, .csv"
            class="hidden"
            @change="handleFileSelected"
          />
        </div>
      </div>

      <!-- 4 MAIN MODULES TAB BAR -->
      <div class="max-w-screen-xl mx-auto px-4 flex gap-2 border-t border-zinc-100 overflow-x-auto pt-1">
        <button
          v-for="mod in modules"
          :key="mod.id"
          @click="activeModule = mod.id"
          :class="[
            'px-4 py-2.5 text-xs font-bold whitespace-nowrap border-b-2 transition-all flex items-center gap-2 cursor-pointer',
            activeModule === mod.id
              ? 'border-red-600 text-red-600 bg-red-50/50 rounded-t-xl'
              : 'border-transparent text-zinc-600 hover:text-zinc-900 hover:border-zinc-300'
          ]"
        >
          <span class="text-base">{{ mod.icon }}</span>
          <span>{{ mod.label }}</span>
          <span
            :class="[
              'px-2 py-0.5 rounded-full text-[10px] font-black',
              activeModule === mod.id ? 'bg-red-600 text-white' : 'bg-zinc-200/80 text-zinc-600'
            ]"
          >
            {{ getModuleCount(mod.id) }}
          </span>
        </button>
      </div>
    </div>

    <!-- MAIN CONTENT AREA -->
    <div class="max-w-screen-xl mx-auto px-4 py-6">

      <!-- LOADING STATE -->
      <div v-if="configStore.loading" class="flex items-center justify-center py-24 text-zinc-400 gap-3">
        <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
        <span class="font-medium text-sm">Memuat konfigurasi...</span>
      </div>

      <template v-else>

        <!-- ════════════════════════════════════════════════════════════════════════ -->
        <!-- 🎞️ MODUL 1: FORMULA & BOM FILM (FORMULA HUB TERPADU) -->
        <!-- ════════════════════════════════════════════════════════════════════════ -->
        <div v-if="activeModule === 'formula_hub'" class="space-y-4">
          
          <!-- TOP TOOLBAR FORMULA HUB -->
          <div class="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 class="font-black text-zinc-900 text-base flex items-center gap-2">
                <span>Formula Film & Resep BOM Terpadu</span>
                <span class="text-xs font-normal text-zinc-500">({{ (configStore.filmConfigs || []).length }} Formula Terdaftar)</span>
              </h2>
              <p class="text-xs text-zinc-400 mt-0.5">Kelola identitas formula film, alias cetak, density, beserta takaran resep bahan baku resin (BOM) di satu tempat</p>
            </div>

            <div class="flex items-center gap-2 flex-wrap">
              <!-- Filter Jenis Dropdown -->
              <select
                v-model="filmFilterJenis"
                class="px-2.5 py-1.5 text-xs border border-zinc-300 rounded-xl bg-white outline-none font-bold text-zinc-700"
              >
                <option value="">Semua Jenis Film</option>
                <option v-for="j in configStore.jenisList" :key="j.id" :value="j.nama">{{ j.nama }}</option>
              </select>

              <!-- Search Bar -->
              <div class="relative">
                <input
                  v-model="filmSearch"
                  type="text"
                  placeholder="Cari kode formula / jenis / alias..."
                  class="pl-7 pr-3 py-1.5 text-xs border border-zinc-300 rounded-xl focus:ring-1 focus:ring-red-500 outline-none w-56 bg-white font-mono"
                />
                <svg class="w-3.5 h-3.5 text-zinc-400 absolute left-2 top-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              </div>

              <!-- Tag Manager Button -->
              <button
                @click="showTagManagerModal = true"
                class="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <span>🏷️ Kelola Tag Master</span>
              </button>

              <!-- Analisis 3 Bak Cepat -->
              <button
                @click="openBakWizardModal(null)"
                class="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <span>⚡ Analisis 3 Bak (A, B, C)</span>
              </button>

              <!-- Tambah Formula Button -->
              <button
                @click="openFilmModal(null)"
                class="px-3.5 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-black rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                <span>Tambah Formula</span>
              </button>
            </div>
          </div>

          <!-- TABLE FORMULA & INLINE BOM ACCORDION -->
          <div class="bg-white rounded-2xl border border-zinc-200 shadow-xs overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full text-xs">
                <thead class="bg-zinc-100/80 border-b border-zinc-200 text-zinc-600">
                  <tr>
                    <th class="px-3 py-3 text-left font-bold w-10">#</th>
                    <th class="px-3 py-3 text-left font-bold">Jenis Film</th>
                    <th class="px-3 py-3 text-left font-bold">Kode Formula</th>
                    <th class="px-3 py-3 text-left font-bold">Alias Cetak</th>
                    <th class="px-3 py-3 text-left font-bold">Tipe & Bahan</th>
                    <th class="px-3 py-3 text-left font-bold">Kategori</th>
                    <th class="px-3 py-3 text-left font-bold w-24">Supplier</th>
                    <th class="px-3 py-3 text-center font-bold w-16">Density</th>
                    <th class="px-3 py-3 text-center font-bold w-28">Speed Slitting</th>
                    <th class="px-3 py-3 text-left font-bold w-48">Status Resep BOM</th>
                    <th class="px-3 py-3 text-center font-bold w-20">Status</th>
                    <th class="px-3 py-3 text-center font-bold w-36">Aksi</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-zinc-100">
                  <tr v-if="filteredFilmConfigs.length === 0">
                    <td colspan="12" class="py-12 text-center text-zinc-400 text-xs">
                      Tidak ada data Formula Film ditemukan
                    </td>
                  </tr>

                  <template v-for="(row, idx) in filteredFilmConfigs" :key="row.id">
                    <!-- MAIN ROW -->
                    <tr
                      :class="[
                        'hover:bg-zinc-50 transition-colors',
                        expandedFormulaId === row.id ? 'bg-amber-50/20' : (idx % 2 === 0 ? '' : 'bg-zinc-50/30')
                      ]"
                    >
                      <td class="px-3 py-2.5 text-zinc-400 font-mono">{{ idx + 1 }}</td>
                      <td class="px-3 py-2.5">
                        <span :class="jenisTagClass(row.jenis)" class="px-2 py-0.5 rounded-md font-bold text-[11px]">{{ row.jenis }}</span>
                      </td>
                      <td class="px-3 py-2.5 font-mono font-black text-zinc-900 text-sm">
                        {{ row.kodeFormula }}
                      </td>
                      <td class="px-3 py-2.5">
                        <span v-if="row.alias" class="px-2 py-0.5 rounded bg-purple-50 text-purple-700 font-mono font-black text-[11px] border border-purple-200">
                          {{ row.alias }}
                        </span>
                        <span v-else class="text-zinc-300 font-mono">—</span>
                      </td>
                      <td class="px-3 py-2.5 text-zinc-700">
                        <div class="font-medium">{{ row.tipeBahan || '—' }}</div>
                        <div class="text-[10px] text-zinc-400">{{ row.jenisBahan || '—' }}</div>
                      </td>
                      <td class="px-3 py-2.5">
                        <span :class="row.kategoriFilm === 'METAL' ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-700'" class="px-2 py-0.5 rounded-md font-bold text-[10px]">
                          {{ row.kategoriFilm }}
                        </span>
                      </td>
                      <td class="px-3 py-2.5 font-mono text-[11px]">
                        <span :class="row.supplier === 'INTERNAL' || !row.supplier ? 'bg-zinc-100 text-zinc-700' : 'bg-blue-50 text-blue-800 border border-blue-200'" class="px-2 py-0.5 rounded font-bold">
                          {{ row.supplier || 'INTERNAL' }}
                        </span>
                      </td>
                      <td class="px-3 py-2.5 text-center font-mono font-bold text-zinc-700">
                        {{ row.density }}
                      </td>

                      <!-- SPEED MESIN SLITTING -->
                      <td class="px-3 py-2.5 text-center font-mono">
                        <span
                          :class="[
                            'px-2 py-0.5 rounded font-black text-xs border inline-flex items-center gap-1',
                            (row.kategoriFilm === 'METAL' || String(row.jenisBahan).toLowerCase().includes('metal') || row.jenis === 'VMCPP' || row.speed === 400)
                              ? 'bg-amber-100 text-amber-900 border-amber-300'
                              : 'bg-blue-50 text-blue-800 border-blue-200'
                          ]"
                        >
                          <span>{{ row.speed || ((row.kategoriFilm === 'METAL' || String(row.jenisBahan).toLowerCase().includes('metal') || row.jenis === 'VMCPP') ? 400 : 600) }}</span>
                          <span class="text-[9px] font-normal text-zinc-500">m/min</span>
                        </span>
                      </td>
                      
                      <!-- STATUS RESEP BOM BADGE -->
                      <td class="px-3 py-2.5">
                        <button
                          type="button"
                          @click="toggleExpandFormula(row.id)"
                          :class="[
                            'px-2.5 py-1 rounded-xl text-xs font-mono font-bold border flex items-center justify-between gap-2 transition-all cursor-pointer w-full',
                            getFormulaBomSummary(row.kodeFormula).totalPersen > 0
                              ? (Math.abs(getFormulaBomSummary(row.kodeFormula).totalPersen - 100) < 0.05
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                                  : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100')
                              : 'bg-zinc-100 text-zinc-500 border-zinc-200 hover:bg-zinc-200'
                          ]"
                        >
                          <span class="flex items-center gap-1.5">
                            <span>{{ getFormulaBomSummary(row.kodeFormula).totalPersen > 0 ? '🧪' : '⚠️' }}</span>
                            <span class="font-black">{{ getFormulaBomSummary(row.kodeFormula).totalPersen.toFixed(2) }}%</span>
                          </span>
                          <span class="text-[10px] font-medium text-zinc-500">
                            ({{ getFormulaBomSummary(row.kodeFormula).items.length }} RM) {{ expandedFormulaId === row.id ? '▲' : '▼' }}
                          </span>
                        </button>
                      </td>

                      <td class="px-3 py-2.5 text-center">
                        <button
                          @click="toggleFilmActive(row)"
                          :class="[
                            'px-2 py-0.5 rounded-full text-[10px] font-bold border transition-colors cursor-pointer',
                            row.active !== false
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-zinc-100 text-zinc-500 border-zinc-200 hover:bg-zinc-200'
                          ]"
                        >
                          {{ row.active !== false ? 'Aktif' : 'Non-aktif' }}
                        </button>
                      </td>

                      <td class="px-3 py-2.5 text-center">
                        <div class="flex items-center justify-center gap-1">
                          <!-- Kelola BOM / 3 Bak -->
                          <button
                            @click="openBakWizardModal(row.kodeFormula)"
                            class="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 transition-colors cursor-pointer shadow-2xs"
                            title="Hitung / Analisis Resep 3 Bak"
                          >
                            ⚡
                          </button>
                          <!-- Edit Formula -->
                          <button
                            @click="openFilmModal(row)"
                            class="p-1.5 rounded-lg hover:bg-blue-50 text-zinc-400 hover:text-blue-600 transition-colors cursor-pointer"
                            title="Edit Data Formula"
                          >
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                          </button>
                          <!-- Hapus Formula -->
                          <button
                            @click="deleteFilm(row.id, row.kodeFormula)"
                            class="p-1.5 rounded-lg hover:bg-red-50 text-zinc-400 hover:text-red-600 transition-colors cursor-pointer"
                            title="Hapus Formula"
                          >
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2"/></svg>
                          </button>
                        </div>
                      </td>
                    </tr>

                    <!-- EXPANDED ACCORDION: RINCIAN BOM RESEP FORMULA INI -->
                    <tr v-if="expandedFormulaId === row.id" class="bg-zinc-50/80 border-y border-zinc-200">
                      <td colspan="11" class="p-4">
                        <div class="bg-white rounded-2xl p-4 border border-zinc-200 shadow-xs space-y-3">
                          
                          <div class="flex items-center justify-between flex-wrap gap-2">
                            <div class="flex items-center gap-2">
                              <span class="text-xs font-black text-zinc-900">🧪 Rincian Komposisi Bahan Baku (BOM) Formula {{ row.kodeFormula }}</span>
                              <span
                                :class="[
                                  'text-[10px] px-2 py-0.5 rounded-full font-mono font-black',
                                  Math.abs(getFormulaBomSummary(row.kodeFormula).totalPersen - 100) < 0.05
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-amber-100 text-amber-800'
                                ]"
                              >
                                Total: {{ getFormulaBomSummary(row.kodeFormula).totalPersen.toFixed(2) }}%
                              </span>
                            </div>

                            <div class="flex items-center gap-2">
                              <button
                                @click="openBakWizardModal(row.kodeFormula)"
                                class="px-2.5 py-1 text-[11px] font-black rounded-lg bg-amber-50 border border-amber-200 text-amber-800 hover:bg-amber-100 transition-colors cursor-pointer flex items-center gap-1"
                              >
                                <span>⚡ Kalkulator 3 Bak</span>
                              </button>
                              <button
                                @click="openBomItemModal(null, row.kodeFormula)"
                                class="px-2.5 py-1 text-[11px] font-black rounded-lg bg-red-600 text-white hover:bg-red-500 transition-colors cursor-pointer flex items-center gap-1"
                              >
                                <span>+ Tambah RM</span>
                              </button>
                            </div>
                          </div>

                          <!-- TABEL RESEP RM -->
                          <div class="border border-zinc-200 rounded-xl overflow-hidden">
                            <table class="w-full text-xs font-mono">
                              <thead class="bg-zinc-100 text-zinc-600 text-[10.5px]">
                                <tr>
                                  <th class="px-3 py-2 text-left w-10">#</th>
                                  <th class="px-3 py-2 text-left">Bahan Baku Resin (RM)</th>
                                  <th class="px-3 py-2 text-right w-36">Persentase (%)</th>
                                  <th class="px-3 py-2 text-center w-24">Status</th>
                                  <th class="px-3 py-2 text-center w-20">Aksi</th>
                                </tr>
                              </thead>
                              <tbody class="divide-y divide-zinc-100">
                                <tr v-if="getFormulaBomSummary(row.kodeFormula).items.length === 0">
                                  <td colspan="5" class="py-4 text-center text-zinc-400 font-sans">
                                    Belum ada resep bahan baku resin untuk formula ini. Klik <strong>+ Tambah RM</strong> atau <strong>⚡ Kalkulator 3 Bak</strong>.
                                  </td>
                                </tr>
                                <tr
                                  v-for="(b, bIdx) in getFormulaBomSummary(row.kodeFormula).items"
                                  :key="b.id"
                                  class="hover:bg-zinc-50"
                                >
                                  <td class="px-3 py-2 text-zinc-400">{{ bIdx + 1 }}</td>
                                  <td class="px-3 py-2 font-bold text-zinc-900">
                                    <span class="px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200">
                                      {{ b.rm }}
                                    </span>
                                  </td>
                                  <td class="px-3 py-2 text-right font-black text-emerald-700 text-sm">
                                    {{ Number(b.persen).toFixed(2).replace('.', ',') }}%
                                  </td>
                                  <td class="px-3 py-2 text-center">
                                    <button
                                      @click="toggleBomItemActive(b)"
                                      :class="[
                                        'px-2 py-0.2 rounded-full text-[9.5px] font-bold border transition-colors cursor-pointer',
                                        b.active !== false ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-zinc-100 text-zinc-500 border-zinc-200'
                                      ]"
                                    >
                                      {{ b.active !== false ? 'Aktif' : 'Non-aktif' }}
                                    </button>
                                  </td>
                                  <td class="px-3 py-2 text-center">
                                    <div class="flex items-center justify-center gap-1 font-sans">
                                      <button @click="openBomItemModal(b, row.kodeFormula)" class="p-1 text-zinc-400 hover:text-blue-600 transition-colors cursor-pointer" title="Edit">
                                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                                      </button>
                                      <button @click="deleteBomItem(b.id)" class="p-1 text-zinc-400 hover:text-red-600 transition-colors cursor-pointer" title="Hapus">
                                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2"/></svg>
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>

                        </div>
                      </td>
                    </tr>
                  </template>

                </tbody>
              </table>
            </div>
          </div>

        </div>

        <!-- ════════════════════════════════════════════════════════════════════════ -->
        <!-- 🧪 MODUL 2: MASTER ITEM RESIN -->
        <!-- ════════════════════════════════════════════════════════════════════════ -->
        <div v-else-if="activeModule === 'resin'" class="space-y-4">
          <div class="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 class="font-black text-zinc-900 text-base">Master Item Resin & Bahan Baku</h2>
              <p class="text-xs text-zinc-400 mt-0.5">Database master bahan baku resin polimer, kode formula resin, dan nomor item SAP / Navision</p>
            </div>
            <div class="flex items-center gap-2 flex-wrap">
              <div class="relative">
                <input v-model="resinSearch" type="text" placeholder="Cari nama resin / kode..." class="pl-7 pr-3 py-1.5 text-xs border border-zinc-300 rounded-xl focus:ring-1 focus:ring-red-500 outline-none w-56 bg-white font-mono" />
                <svg class="w-3.5 h-3.5 text-zinc-400 absolute left-2 top-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              </div>
              <button @click="openResinModal(null)" class="px-3.5 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-black rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Tambah Item Resin
              </button>
            </div>
          </div>

          <div class="bg-white rounded-2xl border border-zinc-200 shadow-xs overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full text-xs">
                <thead class="bg-zinc-100 border-b border-zinc-200 text-zinc-600">
                  <tr>
                    <th class="px-4 py-3 text-left font-bold w-12">#</th>
                    <th class="px-4 py-3 text-left font-bold">Nama Resin (Standar Tanpa Spasi)</th>
                    <th class="px-4 py-3 text-left font-bold w-36">Kode Formula</th>
                    <th class="px-4 py-3 text-left font-bold">Nomor Item SAP / Navision</th>
                    <th class="px-4 py-3 text-center font-bold w-28">Status</th>
                    <th class="px-4 py-3 text-center font-bold w-24">Aksi</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-zinc-100">
                  <tr v-if="filteredResinItems.length === 0">
                    <td colspan="6" class="py-12 text-center text-zinc-400 text-xs">Tidak ada data master item resin</td>
                  </tr>
                  <tr
                    v-for="(row, idx) in filteredResinItems"
                    :key="row.id"
                    :class="['hover:bg-zinc-50 transition-colors', idx % 2 === 0 ? '' : 'bg-zinc-50/30']"
                  >
                    <td class="px-4 py-3 text-zinc-400 font-mono">{{ idx + 1 }}</td>
                    <td class="px-4 py-3 font-mono font-bold text-zinc-900">
                      <span class="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-900 border border-amber-200">
                        {{ row.resin }}
                      </span>
                    </td>
                    <td class="px-4 py-3">
                      <span class="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-mono font-bold text-xs border border-blue-200">
                        {{ row.kode || 'N/A' }}
                      </span>
                    </td>
                    <td class="px-4 py-3 font-mono text-zinc-600">{{ row.nomorItem || '—' }}</td>
                    <td class="px-4 py-3 text-center">
                      <button
                        @click="toggleResinActive(row)"
                        :class="[
                          'px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition-colors cursor-pointer',
                          row.active !== false ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-zinc-100 text-zinc-500 border-zinc-200'
                        ]"
                      >
                        {{ row.active !== false ? 'Aktif' : 'Non-aktif' }}
                      </button>
                    </td>
                    <td class="px-4 py-3 text-center">
                      <div class="flex items-center justify-center gap-1">
                        <button @click="openResinModal(row)" class="p-1.5 rounded-lg hover:bg-blue-50 text-zinc-400 hover:text-blue-600 transition-colors cursor-pointer" title="Edit">
                          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                        </button>
                        <button @click="deleteResin(row.id)" class="p-1.5 rounded-lg hover:bg-red-50 text-zinc-400 hover:text-red-600 transition-colors cursor-pointer" title="Hapus">
                          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- ════════════════════════════════════════════════════════════════════════ -->
        <!-- 🏭 MODUL 3: MESIN & OPERATOR PRODUKSI -->
        <!-- ════════════════════════════════════════════════════════════════════════ -->
        <div v-else-if="activeModule === 'mesin_operator'" class="space-y-4">
          <!-- SUB-TAB SWITCHER -->
          <div class="flex items-center justify-between border-b border-zinc-200 pb-3 flex-wrap gap-2">
            <div class="flex items-center gap-2">
              <button
                @click="subTabMesinOperator = 'mesin'"
                :class="[
                  'px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5',
                  subTabMesinOperator === 'mesin'
                    ? 'bg-zinc-900 text-white shadow-xs'
                    : 'bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50'
                ]"
              >
                <span>⚙️ Mesin & Pra-CodePack</span>
                <span class="text-[10px] px-1.5 py-0.2 rounded-full" :class="subTabMesinOperator === 'mesin' ? 'bg-white/20 text-white' : 'bg-zinc-100 text-zinc-600'">
                  {{ (configStore.mesinList || []).length }}
                </span>
              </button>

              <button
                @click="subTabMesinOperator = 'operator'"
                :class="[
                  'px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5',
                  subTabMesinOperator === 'operator'
                    ? 'bg-zinc-900 text-white shadow-xs'
                    : 'bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50'
                ]"
              >
                <span>👷 Daftar Operator</span>
                <span class="text-[10px] px-1.5 py-0.2 rounded-full" :class="subTabMesinOperator === 'operator' ? 'bg-white/20 text-white' : 'bg-zinc-100 text-zinc-600'">
                  {{ (configStore.operatorList || []).length }}
                </span>
              </button>
            </div>

            <!-- ACTION BUTTONS -->
            <div>
              <button
                v-if="subTabMesinOperator === 'mesin'"
                @click="openMesinModal(null)"
                class="px-3.5 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-black rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Tambah Mesin
              </button>
              <button
                v-else
                @click="openOperatorModal(null)"
                class="px-3.5 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-black rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Tambah Operator
              </button>
            </div>
          </div>

          <!-- SUB-VIEW MESIN -->
          <div v-if="subTabMesinOperator === 'mesin'" class="bg-white rounded-2xl border border-zinc-200 shadow-xs overflow-hidden">
            <table class="w-full text-xs">
              <thead class="bg-zinc-100 border-b border-zinc-200 text-zinc-600">
                <tr>
                  <th class="px-4 py-3 text-left font-bold w-12">#</th>
                  <th class="px-4 py-3 text-left font-bold">Nama Mesin</th>
                  <th class="px-4 py-3 text-left font-bold">Pra-CodePack (Prefix Otomatis)</th>
                  <th class="px-4 py-3 text-left font-bold">Speed Standar Slitting</th>
                  <th class="px-4 py-3 text-center font-bold w-28">Status</th>
                  <th class="px-4 py-3 text-center font-bold w-24">Aksi</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-zinc-100">
                <tr v-if="configStore.mesinList.length === 0">
                  <td colspan="6" class="py-12 text-center text-zinc-400 text-xs">Tidak ada data mesin</td>
                </tr>
                <tr v-for="(row, idx) in configStore.mesinList" :key="row.id" class="hover:bg-zinc-50">
                  <td class="px-4 py-3 text-zinc-400 font-mono">{{ idx + 1 }}</td>
                  <td class="px-4 py-3 font-bold text-zinc-900">{{ row.nama }}</td>
                  <td class="px-4 py-3 font-mono font-black text-red-600">{{ row.praKodePack || '—' }}</td>
                  <td class="px-4 py-3 font-mono">
                    <template v-if="row.nama && row.nama.toUpperCase().includes('SLITTING')">
                      <div class="flex items-center gap-1.5 flex-wrap">
                        <span class="px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 font-bold text-[10px]">
                          Metalized: {{ row.speedMetalized || 400 }} m/min
                        </span>
                        <span class="px-2 py-0.5 rounded bg-blue-100 text-blue-900 border border-blue-300 font-bold text-[10px]">
                          Polos: {{ row.speedPolos || 600 }} m/min
                        </span>
                      </div>
                    </template>
                    <template v-else>
                      <span class="text-zinc-400 text-xs">—</span>
                    </template>
                  </td>
                  <td class="px-4 py-3 text-center">
                    <button @click="toggleMesinActive(row)" :class="['px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition-colors cursor-pointer', row.active !== false ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-zinc-100 text-zinc-500 border-zinc-200']">
                      {{ row.active !== false ? 'Aktif' : 'Non-aktif' }}
                    </button>
                  </td>
                  <td class="px-4 py-3 text-center">
                    <div class="flex items-center justify-center gap-1">
                      <button @click="openMesinModal(row)" class="p-1.5 rounded-lg hover:bg-blue-50 text-zinc-400 hover:text-blue-600 transition-colors cursor-pointer" title="Edit">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                      </button>
                      <button @click="deleteMesin(row.id)" class="p-1.5 rounded-lg hover:bg-red-50 text-zinc-400 hover:text-red-600 transition-colors cursor-pointer" title="Hapus">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- SUB-VIEW OPERATOR -->
          <div v-else class="bg-white rounded-2xl border border-zinc-200 shadow-xs overflow-hidden">
            <table class="w-full text-xs">
              <thead class="bg-zinc-100 border-b border-zinc-200 text-zinc-600">
                <tr>
                  <th class="px-4 py-3 text-left font-bold w-12">#</th>
                  <th class="px-4 py-3 text-left font-bold">Nama Operator</th>
                  <th class="px-4 py-3 text-left font-bold">Kode Operator</th>
                  <th class="px-4 py-3 text-left font-bold">Mesin Penugasan</th>
                  <th class="px-4 py-3 text-left font-bold">Kode Grup</th>
                  <th class="px-4 py-3 text-center font-bold w-28">Status</th>
                  <th class="px-4 py-3 text-center font-bold w-24">Aksi</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-zinc-100">
                <tr v-if="configStore.operatorList.length === 0">
                  <td colspan="7" class="py-12 text-center text-zinc-400 text-xs">Tidak ada data operator</td>
                </tr>
                <tr v-for="(row, idx) in configStore.operatorList" :key="row.id" class="hover:bg-zinc-50">
                  <td class="px-4 py-3 text-zinc-400 font-mono">{{ idx + 1 }}</td>
                  <td class="px-4 py-3 font-bold text-zinc-900">{{ row.nama }}</td>
                  <td class="px-4 py-3 font-mono font-bold text-blue-700">{{ row.kodeOperator }}</td>
                  <td class="px-4 py-3 text-zinc-600">{{ row.mesin || '—' }}</td>
                  <td class="px-4 py-3 font-mono text-zinc-600">{{ row.kodeGrup || '—' }}</td>
                  <td class="px-4 py-3 text-center">
                    <button @click="toggleOperatorActive(row)" :class="['px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition-colors cursor-pointer', row.active !== false ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-zinc-100 text-zinc-500 border-zinc-200']">
                      {{ row.active !== false ? 'Aktif' : 'Non-aktif' }}
                    </button>
                  </td>
                  <td class="px-4 py-3 text-center">
                    <div class="flex items-center justify-center gap-1">
                      <button @click="openOperatorModal(row)" class="p-1.5 rounded-lg hover:bg-blue-50 text-zinc-400 hover:text-blue-600 transition-colors cursor-pointer" title="Edit">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                      </button>
                      <button @click="deleteOperator(row.id)" class="p-1.5 rounded-lg hover:bg-red-50 text-zinc-400 hover:text-red-600 transition-colors cursor-pointer" title="Hapus">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- ════════════════════════════════════════════════════════════════════════ -->
        <!-- 📍 MODUL 4: GUDANG & STANDAR ROLL -->
        <!-- ════════════════════════════════════════════════════════════════════════ -->
        <div v-else-if="activeModule === 'gudang_standar'" class="space-y-4">
          <!-- SUB-TAB SWITCHER -->
          <div class="flex items-center justify-between border-b border-zinc-200 pb-3 flex-wrap gap-2">
            <div class="flex items-center gap-2">
              <button
                @click="subTabGudangStandar = 'lokasi'"
                :class="[
                  'px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5',
                  subTabGudangStandar === 'lokasi'
                    ? 'bg-zinc-900 text-white shadow-xs'
                    : 'bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50'
                ]"
              >
                <span>📦 Denah & Posisi Rak</span>
                <span class="text-[10px] px-1.5 py-0.2 rounded-full" :class="subTabGudangStandar === 'lokasi' ? 'bg-white/20 text-white' : 'bg-zinc-100 text-zinc-600'">
                  {{ (configStore.locationList || []).length }}
                </span>
              </button>

              <button
                @click="subTabGudangStandar = 'standar'"
                :class="[
                  'px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5',
                  subTabGudangStandar === 'standar'
                    ? 'bg-zinc-900 text-white shadow-xs'
                    : 'bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50'
                ]"
              >
                <span>📏 Panjang Standard Roll</span>
                <span class="text-[10px] px-1.5 py-0.2 rounded-full" :class="subTabGudangStandar === 'standar' ? 'bg-white/20 text-white' : 'bg-zinc-100 text-zinc-600'">
                  {{ (configStore.standardLengthList || []).length }}
                </span>
              </button>
            </div>

            <!-- ACTION BUTTONS -->
            <div>
              <button
                v-if="subTabGudangStandar === 'lokasi'"
                @click="openLocationModal(null)"
                class="px-3.5 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-black rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Tambah Lokasi Rak
              </button>
              <button
                v-else
                @click="openStandardLengthModal(null)"
                class="px-3.5 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-black rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Tambah Batas Panjang
              </button>
            </div>
          </div>

          <!-- SUB-VIEW LOKASI RAK -->
          <div v-if="subTabGudangStandar === 'lokasi'" class="bg-white rounded-2xl border border-zinc-200 shadow-xs overflow-hidden">
            <table class="w-full text-xs">
              <thead class="bg-zinc-100 border-b border-zinc-200 text-zinc-600">
                <tr>
                  <th class="px-4 py-3 text-left font-bold w-12">#</th>
                  <th class="px-4 py-3 text-left font-bold">Nama Lokasi / Rak</th>
                  <th class="px-4 py-3 text-left font-bold">Peruntukan</th>
                  <th class="px-4 py-3 text-left font-bold">Alias / Shorthand</th>
                  <th class="px-4 py-3 text-center font-bold w-28">Kapasitas (Roll)</th>
                  <th class="px-4 py-3 text-center font-bold w-24">Status</th>
                  <th class="px-4 py-3 text-center font-bold w-24">Aksi</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-zinc-100">
                <tr v-if="configStore.locationList.length === 0">
                  <td colspan="7" class="py-12 text-center text-zinc-400 text-xs">Tidak ada data lokasi rak</td>
                </tr>
                <tr v-for="(row, idx) in configStore.locationList" :key="row.id" class="hover:bg-zinc-50">
                  <td class="px-4 py-3 text-zinc-400 font-mono">{{ idx + 1 }}</td>
                  <td class="px-4 py-3 font-mono font-bold text-zinc-900">{{ row.nama }}</td>
                  <td class="px-4 py-3">
                    <span :class="row.jenis === 'WIP Jumbo Roll' ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-emerald-50 text-emerald-800 border-emerald-200'" class="px-2 py-0.5 rounded font-bold border text-[11px]">
                      {{ row.jenis }}
                    </span>
                  </td>
                  <td class="px-4 py-3 font-mono text-zinc-500">{{ row.alias || '—' }}</td>
                  <td class="px-4 py-3 text-center font-mono font-bold text-zinc-800">{{ row.kapasitas || '—' }}</td>
                  <td class="px-4 py-3 text-center">
                    <button @click="toggleLocationActive(row)" :class="['px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition-colors cursor-pointer', row.active !== false ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-zinc-100 text-zinc-500 border-zinc-200']">
                      {{ row.active !== false ? 'Aktif' : 'Non-aktif' }}
                    </button>
                  </td>
                  <td class="px-4 py-3 text-center">
                    <div class="flex items-center justify-center gap-1">
                      <button @click="openLocationModal(row)" class="p-1.5 rounded-lg hover:bg-blue-50 text-zinc-400 hover:text-blue-600 transition-colors cursor-pointer" title="Edit">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                      </button>
                      <button @click="deleteLocation(row.id)" class="p-1.5 rounded-lg hover:bg-red-50 text-zinc-400 hover:text-red-600 transition-colors cursor-pointer" title="Hapus">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- SUB-VIEW PANJANG STANDARD -->
          <div v-else class="bg-white rounded-2xl border border-zinc-200 shadow-xs overflow-hidden">
            <table class="w-full text-xs">
              <thead class="bg-zinc-100 border-b border-zinc-200 text-zinc-600">
                <tr>
                  <th class="px-4 py-3 text-left font-bold w-12">#</th>
                  <th class="px-4 py-3 text-left font-bold">Ketebalan Film (Micron)</th>
                  <th class="px-4 py-3 text-right font-bold">Max Panjang Roll FG (m)</th>
                  <th class="px-4 py-3 text-right font-bold">Max Panjang Roll Jumbo (m)</th>
                  <th class="px-4 py-3 text-center font-bold w-28">Status</th>
                  <th class="px-4 py-3 text-center font-bold w-24">Aksi</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-zinc-100">
                <tr v-if="configStore.standardLengthList.length === 0">
                  <td colspan="6" class="py-12 text-center text-zinc-400 text-xs">Tidak ada data batas panjang standard</td>
                </tr>
                <tr v-for="(row, idx) in configStore.standardLengthList" :key="row.id" class="hover:bg-zinc-50">
                  <td class="px-4 py-3 text-zinc-400 font-mono">{{ idx + 1 }}</td>
                  <td class="px-4 py-3 font-mono font-black text-zinc-900 text-sm">
                    <span class="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 border border-blue-200">
                      {{ row.thickness }} µm
                    </span>
                  </td>
                  <td class="px-4 py-3 text-right font-mono font-bold text-zinc-800">{{ Number(row.maxPanjangFg).toLocaleString() }} m</td>
                  <td class="px-4 py-3 text-right font-mono font-bold text-purple-700">{{ Number(row.maxPanjangJumbo).toLocaleString() }} m</td>
                  <td class="px-4 py-3 text-center">
                    <button @click="toggleStandardLengthActive(row)" :class="['px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition-colors cursor-pointer', row.active !== false ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-zinc-100 text-zinc-500 border-zinc-200']">
                      {{ row.active !== false ? 'Aktif' : 'Non-aktif' }}
                    </button>
                  </td>
                  <td class="px-4 py-3 text-center">
                    <div class="flex items-center justify-center gap-1">
                      <button @click="openStandardLengthModal(row)" class="p-1.5 rounded-lg hover:bg-blue-50 text-zinc-400 hover:text-blue-600 transition-colors cursor-pointer" title="Edit">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                      </button>
                      <button @click="deleteStandardLength(row.id)" class="p-1.5 rounded-lg hover:bg-red-50 text-zinc-400 hover:text-red-600 transition-colors cursor-pointer" title="Hapus">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </template>

    </div>

    <!-- ════════════════════════════════════════════════════════════════════════ -->
    <!-- MODALS & DIALOGS -->
    <!-- ════════════════════════════════════════════════════════════════════════ -->

    <!-- GLOBAL RESIN MASTER DATALIST AUTOCOMPLETE -->
    <datalist id="resin-master-datalist">
      <option
        v-for="r in configStore.resinItemList"
        :key="r.id"
        :value="r.resin"
      >
        {{ r.resin }} ({{ r.kode || '—' }}{{ r.nomorItem ? ' | ' + r.nomorItem : '' }})
      </option>
    </datalist>

    <!-- 1. MODAL FORMULA FILM -->
    <div v-if="showFilmModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
      <div class="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-zinc-200">
        <div class="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-lg">🎞️</span>
            <h3 class="font-black text-zinc-900 text-sm">{{ editingFilm ? 'Edit' : 'Tambah' }} Formula Film</h3>
          </div>
          <button @click="closeFilmModal" class="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400 cursor-pointer">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div class="px-6 py-4 space-y-3.5 max-h-[75vh] overflow-y-auto">
          
          <!-- BARIS 1: JENIS FILM & KODE FORMULA -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <div class="flex items-center justify-between mb-1">
                <label class="text-[11px] font-bold text-zinc-700">Jenis Film *</label>
                <button type="button" @click="openTagManagerTab('jenis')" class="text-[10px] text-blue-600 font-bold hover:underline cursor-pointer">+ Kelola Tag</button>
              </div>
              <select
                v-model="filmForm.jenis"
                class="w-full px-2.5 py-2 text-xs border border-zinc-300 rounded-xl focus:ring-1 focus:ring-red-500 outline-none uppercase font-bold bg-white"
              >
                <option value="">Pilih Jenis...</option>
                <option v-for="j in configStore.jenisList" :key="j.id" :value="j.nama">{{ j.nama }}</option>
              </select>
            </div>
            <div>
              <label class="block text-[11px] font-bold text-zinc-700 mb-1">Kode Formula *</label>
              <input v-model="filmForm.kodeFormula" placeholder="Mis: L01, M07..." class="w-full px-2.5 py-2 text-xs border border-zinc-300 rounded-xl focus:ring-1 focus:ring-red-500 outline-none uppercase font-mono font-bold" />
            </div>
          </div>

          <!-- BARIS 2: ALIAS CETAK, DENSITY & SPEED SLITTING -->
          <div class="grid grid-cols-3 gap-3">
            <div>
              <label class="block text-[11px] font-bold text-zinc-700 mb-1">Alias Cetak <span class="text-zinc-400 font-normal">(Opsional)</span></label>
              <input v-model="filmForm.alias" placeholder="Mis: TPTGS, TPMF..." class="w-full px-2.5 py-2 text-xs border border-zinc-300 rounded-xl focus:ring-1 focus:ring-red-500 outline-none uppercase font-mono font-bold text-purple-700" />
            </div>
            <div>
              <label class="block text-[11px] font-bold text-zinc-700 mb-1">Density *</label>
              <input v-model.number="filmForm.density" type="number" step="0.01" class="w-full px-2.5 py-2 text-xs border border-zinc-300 rounded-xl focus:ring-1 focus:ring-red-500 outline-none font-mono font-bold" />
            </div>
            <div>
              <label class="block text-[11px] font-bold text-zinc-700 mb-1">Speed Slitting (m/min) *</label>
              <div class="flex items-center gap-1">
                <input v-model.number="filmForm.speed" type="number" step="10" placeholder="400 / 600" class="w-full px-2.5 py-2 text-xs border border-zinc-300 rounded-xl focus:ring-1 focus:ring-red-500 outline-none font-mono font-bold text-zinc-900" />
                <button type="button" @click="filmForm.speed = 400" class="px-1.5 py-2 text-[9.5px] font-bold bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg border border-amber-300 shrink-0 cursor-pointer" title="Metalized: 400 m/menit">400</button>
                <button type="button" @click="filmForm.speed = 600" class="px-1.5 py-2 text-[9.5px] font-bold bg-blue-100 hover:bg-blue-200 text-blue-900 rounded-lg border border-blue-300 shrink-0 cursor-pointer" title="Polos: 600 m/menit">600</button>
              </div>
            </div>
          </div>

          <!-- BARIS 3: PARAMETER TAG MASTER (TIPE, JENIS BAHAN, KATEGORI) -->
          <div class="grid grid-cols-3 gap-3">
            <div>
              <div class="flex items-center justify-between mb-1">
                <label class="text-[11px] font-bold text-zinc-700">Tipe Bahan</label>
                <button type="button" @click="openTagManagerTab('tipeBahan')" class="text-[10px] text-blue-600 font-bold hover:underline cursor-pointer">+</button>
              </div>
              <select
                v-model="filmForm.tipeBahan"
                class="w-full px-2.5 py-2 text-xs border border-zinc-300 rounded-xl focus:ring-1 focus:ring-red-500 outline-none uppercase bg-white"
              >
                <option value="">Pilih...</option>
                <option v-for="t in configStore.tipeBahanList" :key="t.id" :value="t.nama">{{ t.nama }}</option>
              </select>
            </div>
            <div>
              <div class="flex items-center justify-between mb-1">
                <label class="text-[11px] font-bold text-zinc-700">Jenis Bahan</label>
                <button type="button" @click="openTagManagerTab('jenisBahan')" class="text-[10px] text-blue-600 font-bold hover:underline cursor-pointer">+</button>
              </div>
              <select
                v-model="filmForm.jenisBahan"
                class="w-full px-2.5 py-2 text-xs border border-zinc-300 rounded-xl focus:ring-1 focus:ring-red-500 outline-none bg-white"
              >
                <option value="">Pilih...</option>
                <option v-for="b in configStore.jenisBahanList" :key="b.id" :value="b.nama">{{ b.nama }}</option>
              </select>
            </div>
            <div>
              <div class="flex items-center justify-between mb-1">
                <label class="text-[11px] font-bold text-zinc-700">Kategori</label>
                <button type="button" @click="openTagManagerTab('kategori')" class="text-[10px] text-blue-600 font-bold hover:underline cursor-pointer">+</button>
              </div>
              <select
                v-model="filmForm.kategoriFilm"
                class="w-full px-2.5 py-2 text-xs border border-zinc-300 rounded-xl focus:ring-1 focus:ring-red-500 outline-none uppercase bg-white"
              >
                <option value="">Pilih...</option>
                <option v-for="k in configStore.kategoriFilmList" :key="k.id" :value="k.nama">{{ k.nama }}</option>
              </select>
            </div>
          </div>

          <!-- BARIS 4: SUPPLIER & KETERANGAN -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-[11px] font-bold text-zinc-700 mb-1">Supplier / Asal Film</label>
              <input v-model="filmForm.supplier" placeholder="INTERNAL / Nama Vendor..." class="w-full px-2.5 py-2 text-xs border border-zinc-300 rounded-xl focus:ring-1 focus:ring-red-500 outline-none uppercase font-mono" />
            </div>
            <div>
              <label class="block text-[11px] font-bold text-zinc-700 mb-1">Keterangan Spesifikasi</label>
              <input v-model="filmForm.keterangan" placeholder="Keterangan spesifikasi formula film..." class="w-full px-2.5 py-2 text-xs border border-zinc-300 rounded-xl focus:ring-1 focus:ring-red-500 outline-none" />
            </div>
          </div>

        </div>

        <div class="px-6 py-4 border-t border-zinc-100 flex justify-end gap-2 bg-zinc-50/50">
          <button @click="closeFilmModal" class="px-4 py-2 text-xs font-bold text-zinc-600 hover:bg-zinc-100 rounded-xl transition-colors cursor-pointer">Batal</button>
          <button @click="saveFilm" class="px-5 py-2 text-xs font-black bg-red-600 hover:bg-red-500 text-white rounded-xl transition-colors cursor-pointer">
            {{ editingFilm ? 'Simpan Perubahan' : 'Tambahkan' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 2. MODAL SINGLE BOM ITEM -->
    <div v-if="showBomItemModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div class="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
          <h3 class="font-black text-zinc-900 text-sm">{{ editingBomItem ? 'Edit' : 'Tambah' }} Komponen BOM ({{ bomItemForm.formula }})</h3>
          <button @click="closeBomItemModal" class="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400 cursor-pointer">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="px-6 py-4 space-y-3.5">
          <div>
            <label class="block text-[11px] font-bold text-zinc-600 mb-1">Kode Formula *</label>
            <input v-model="bomItemForm.formula" type="text" class="w-full px-2.5 py-2 text-xs border border-zinc-300 rounded-xl bg-zinc-50 font-mono font-bold uppercase" readonly />
          </div>
          <div>
            <label class="block text-[11px] font-bold text-zinc-600 mb-1">Raw Material (Resin) *</label>
            <input
              v-model="bomItemForm.rm"
              list="resin-master-datalist"
              @input="bomItemForm.rm = bomItemForm.rm.replace(/\s+/g, '-').toUpperCase()"
              placeholder="Pilih atau ketik RM (Mis: F600F, FL-7632-L...)"
              class="w-full px-2.5 py-2 text-xs border border-zinc-300 rounded-xl focus:ring-1 focus:ring-red-500 outline-none font-mono font-bold uppercase"
            />
          </div>
          <div>
            <label class="block text-[11px] font-bold text-zinc-600 mb-1">Persentase (%) *</label>
            <div class="relative">
              <input
                v-model.number="bomItemForm.persen"
                type="number"
                step="0.01"
                min="0"
                max="100"
                placeholder="Mis: 76.70..."
                class="w-full px-2.5 py-2 text-xs border border-zinc-300 rounded-xl focus:ring-1 focus:ring-red-500 outline-none font-mono font-bold text-emerald-700 pr-8"
              />
              <span class="absolute right-3 top-2 text-xs font-black text-zinc-400">%</span>
            </div>
          </div>
        </div>
        <div class="px-6 py-4 border-t border-zinc-100 flex justify-end gap-2 bg-zinc-50/50">
          <button @click="closeBomItemModal" class="px-4 py-2 text-xs font-bold text-zinc-600 hover:bg-zinc-100 rounded-xl transition-colors cursor-pointer">Batal</button>
          <button @click="saveBomItem" class="px-5 py-2 text-xs font-black bg-red-600 hover:bg-red-500 text-white rounded-xl transition-colors cursor-pointer">
            {{ editingBomItem ? 'Simpan Perubahan' : 'Tambahkan' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 3. MODAL BAK WIZARD (ANALISIS 3 BAK A, B, C) -->
    <div v-if="showBakWizardModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in overflow-y-auto">
      <div class="bg-white rounded-3xl shadow-2xl w-full max-w-4xl my-6 overflow-hidden border border-zinc-200">
        
        <div class="px-6 py-4 bg-gradient-to-r from-amber-600 to-amber-700 text-white flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-xl font-bold">⚡</div>
            <div>
              <h3 class="font-black text-sm text-white">Kalkulator & Analisis BOM per Bak Resin (A, B, C)</h3>
              <p class="text-[11px] text-amber-100 mt-0.5">Hitung otomatis kontribusi & total persentase BOM film dari komposisi 3 bak extruder</p>
            </div>
          </div>
          <button @click="closeBakWizardModal" class="p-2 rounded-xl hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div class="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          <!-- STEP 1: FORMULA & RASIO BAK -->
          <div class="bg-zinc-50 rounded-2xl p-4 border border-zinc-200 space-y-4">
            <div class="flex items-center justify-between flex-wrap gap-2">
              <span class="text-xs font-black text-zinc-900 uppercase tracking-wide flex items-center gap-1.5">
                <span class="w-5 h-5 rounded-full bg-amber-600 text-white inline-flex items-center justify-center text-[10px]">1</span>
                <span>Formula & Proporsi Kapasitas Bak Extruder</span>
              </span>
              <div class="flex items-center gap-1.5">
                <span class="text-[10px] font-bold text-zinc-400 uppercase mr-1">Rasio Cepat:</span>
                <button type="button" @click="applyBakPreset('L')" class="px-2.5 py-1 text-[10px] font-black rounded-lg bg-white border border-zinc-300 hover:bg-amber-50 hover:border-amber-400 text-zinc-700 cursor-pointer">Seri L (62/23/15)</button>
                <button type="button" @click="applyBakPreset('M_STD')" class="px-2.5 py-1 text-[10px] font-black rounded-lg bg-white border border-zinc-300 hover:bg-amber-50 hover:border-amber-400 text-zinc-700 cursor-pointer">Seri M Standar (70/20/10)</button>
                <button type="button" @click="applyBakPreset('M_SPEC')" class="px-2.5 py-1 text-[10px] font-black rounded-lg bg-white border border-zinc-300 hover:bg-amber-50 hover:border-amber-400 text-zinc-700 cursor-pointer">Seri M Khusus (71/23/6)</button>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label class="block text-[11px] font-bold text-zinc-700 mb-1">Pilih Formula Film *</label>
                <select
                  v-model="bakWizardForm.formula"
                  @change="onBakWizardFormulaChange"
                  class="w-full px-3 py-2 text-xs border border-zinc-300 rounded-xl focus:ring-1 focus:ring-amber-500 outline-none font-mono font-black uppercase bg-white text-zinc-900 shadow-2xs cursor-pointer"
                >
                  <option value="" disabled>-- Pilih Formula Tersedia --</option>
                  <option v-for="fc in configStore.filmConfigs" :key="fc.id" :value="fc.kodeFormula">
                    {{ fc.kodeFormula }} — {{ fc.jenis }} ({{ fc.alias || fc.tipeBahan || 'Polos' }})
                  </option>
                </select>
              </div>
              <div>
                <label class="block text-[11px] font-bold text-blue-700 mb-1">Bak A (Core / Tengah) *</label>
                <div class="relative">
                  <input v-model.number="bakWizardForm.persenBakA" type="number" step="1" min="0" max="100" class="w-full pl-2.5 pr-7 py-1.5 text-xs border border-blue-300 rounded-xl focus:ring-1 focus:ring-blue-500 outline-none font-mono font-black text-blue-900 bg-white" />
                  <span class="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-black text-blue-400 pointer-events-none">%</span>
                </div>
              </div>
              <div>
                <label class="block text-[11px] font-bold text-emerald-700 mb-1">Bak B (Skin / Seal) *</label>
                <div class="relative">
                  <input v-model.number="bakWizardForm.persenBakB" type="number" step="1" min="0" max="100" class="w-full pl-2.5 pr-7 py-1.5 text-xs border border-emerald-300 rounded-xl focus:ring-1 focus:ring-emerald-500 outline-none font-mono font-black text-emerald-900 bg-white" />
                  <span class="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-black text-emerald-400 pointer-events-none">%</span>
                </div>
              </div>
              <div>
                <label class="block text-[11px] font-bold text-purple-700 mb-1">Bak C (Corona) *</label>
                <div class="relative">
                  <input v-model.number="bakWizardForm.persenBakC" type="number" step="1" min="0" max="100" class="w-full pl-2.5 pr-7 py-1.5 text-xs border border-purple-300 rounded-xl focus:ring-1 focus:ring-purple-500 outline-none font-mono font-black text-purple-900 bg-white" />
                  <span class="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-black text-purple-400 pointer-events-none">%</span>
                </div>
              </div>
            </div>

            <div class="flex items-center justify-between text-xs pt-1 border-t border-zinc-200">
              <span class="text-zinc-500 text-[11px]">Total Rasio Bak (A + B + C):</span>
              <span :class="['px-2.5 py-0.5 rounded-full font-mono font-black text-xs', Math.abs(totalPersenBakRatio - 100) < 0.05 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800']">
                {{ totalPersenBakRatio.toFixed(2) }}% {{ Math.abs(totalPersenBakRatio - 100) < 0.05 ? '✓ (Valid)' : '⚠️ (Harus 100%)' }}
              </span>
            </div>
          </div>

          <!-- STEP 2: RESEP KOMPOSISI RESIN PER BAK -->
          <div class="space-y-2">
            <span class="text-xs font-black text-zinc-900 uppercase tracking-wide flex items-center gap-1.5">
              <span class="w-5 h-5 rounded-full bg-amber-600 text-white inline-flex items-center justify-center text-[10px]">2</span>
              <span>Resep Takaran Resin di Setiap Bak</span>
            </span>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <!-- BAK A -->
              <div class="bg-blue-50/50 rounded-2xl p-3.5 border border-blue-200 flex flex-col justify-between space-y-3">
                <div>
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-xs font-black text-blue-900 flex items-center gap-1.5">
                      <span class="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block"></span>
                      Bak A (Core - {{ bakWizardForm.persenBakA }}%)
                    </span>
                    <button type="button" @click="addBakItem('bakAItems')" class="text-[10px] font-bold text-blue-700 bg-white px-2 py-0.5 rounded-md border border-blue-200 cursor-pointer">+ Tambah RM</button>
                  </div>
                  <div class="space-y-2">
                    <div v-for="(item, idx) in bakWizardForm.bakAItems" :key="'a_' + idx" class="flex items-center gap-1.5 bg-white p-1.5 rounded-xl border border-blue-100 shadow-2xs">
                      <input v-model="item.rm" list="resin-master-datalist" @input="item.rm = item.rm.replace(/\s+/g, '-').toUpperCase()" placeholder="Nama RM..." class="flex-1 min-w-0 px-2 py-1 text-xs border border-zinc-200 rounded-lg outline-none font-mono font-bold uppercase" />
                      <div class="relative w-24 flex-shrink-0">
                        <input v-model.number="item.persen" type="number" step="0.01" min="0" max="100" placeholder="0.00" class="w-full pl-2 pr-6 py-1 text-xs border border-zinc-200 rounded-lg outline-none font-mono font-black text-right text-zinc-900 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                        <span class="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-black text-zinc-400 pointer-events-none">%</span>
                      </div>
                      <button v-if="bakWizardForm.bakAItems.length > 1" type="button" @click="removeBakItem('bakAItems', idx)" class="p-1 text-zinc-400 hover:text-red-600 cursor-pointer">✕</button>
                    </div>
                  </div>
                </div>
                <div class="pt-2 border-t border-blue-200 flex items-center justify-between text-xs">
                  <span class="text-[11px] font-bold text-blue-800">Total Bak A:</span>
                  <span :class="['px-2 py-0.2 rounded font-mono font-black text-[11px]', Math.abs(totalPersenBakA - 100) < 0.05 ? 'text-emerald-700 bg-emerald-50' : 'text-amber-700 bg-amber-50']">{{ totalPersenBakA.toFixed(2) }}%</span>
                </div>
              </div>

              <!-- BAK B -->
              <div class="bg-emerald-50/50 rounded-2xl p-3.5 border border-emerald-200 flex flex-col justify-between space-y-3">
                <div>
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-xs font-black text-emerald-900 flex items-center gap-1.5">
                      <span class="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block"></span>
                      Bak B (Skin - {{ bakWizardForm.persenBakB }}%)
                    </span>
                    <button type="button" @click="addBakItem('bakBItems')" class="text-[10px] font-bold text-emerald-700 bg-white px-2 py-0.5 rounded-md border border-emerald-200 cursor-pointer">+ Tambah RM</button>
                  </div>
                  <div class="space-y-2">
                    <div v-for="(item, idx) in bakWizardForm.bakBItems" :key="'b_' + idx" class="flex items-center gap-1.5 bg-white p-1.5 rounded-xl border border-emerald-100 shadow-2xs">
                      <input v-model="item.rm" list="resin-master-datalist" @input="item.rm = item.rm.replace(/\s+/g, '-').toUpperCase()" placeholder="Nama RM..." class="flex-1 min-w-0 px-2 py-1 text-xs border border-zinc-200 rounded-lg outline-none font-mono font-bold uppercase" />
                      <div class="relative w-24 flex-shrink-0">
                        <input v-model.number="item.persen" type="number" step="0.01" min="0" max="100" placeholder="0.00" class="w-full pl-2 pr-6 py-1 text-xs border border-zinc-200 rounded-lg outline-none font-mono font-black text-right text-zinc-900 bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
                        <span class="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-black text-zinc-400 pointer-events-none">%</span>
                      </div>
                      <button v-if="bakWizardForm.bakBItems.length > 1" type="button" @click="removeBakItem('bakBItems', idx)" class="p-1 text-zinc-400 hover:text-red-600 cursor-pointer">✕</button>
                    </div>
                  </div>
                </div>
                <div class="pt-2 border-t border-emerald-200 flex items-center justify-between text-xs">
                  <span class="text-[11px] font-bold text-emerald-800">Total Bak B:</span>
                  <span :class="['px-2 py-0.2 rounded font-mono font-black text-[11px]', Math.abs(totalPersenBakB - 100) < 0.05 ? 'text-emerald-700 bg-emerald-50' : 'text-amber-700 bg-amber-50']">{{ totalPersenBakB.toFixed(2) }}%</span>
                </div>
              </div>

              <!-- BAK C -->
              <div class="bg-purple-50/50 rounded-2xl p-3.5 border border-purple-200 flex flex-col justify-between space-y-3">
                <div>
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-xs font-black text-purple-900 flex items-center gap-1.5">
                      <span class="w-2.5 h-2.5 rounded-full bg-purple-600 inline-block"></span>
                      Bak C (Corona - {{ bakWizardForm.persenBakC }}%)
                    </span>
                    <button type="button" @click="addBakItem('bakCItems')" class="text-[10px] font-bold text-purple-700 bg-white px-2 py-0.5 rounded-md border border-purple-200 cursor-pointer">+ Tambah RM</button>
                  </div>
                  <div class="space-y-2">
                    <div v-for="(item, idx) in bakWizardForm.bakCItems" :key="'c_' + idx" class="flex items-center gap-1.5 bg-white p-1.5 rounded-xl border border-purple-100 shadow-2xs">
                      <input v-model="item.rm" list="resin-master-datalist" @input="item.rm = item.rm.replace(/\s+/g, '-').toUpperCase()" placeholder="Nama RM..." class="flex-1 min-w-0 px-2 py-1 text-xs border border-zinc-200 rounded-lg outline-none font-mono font-bold uppercase" />
                      <div class="relative w-24 flex-shrink-0">
                        <input v-model.number="item.persen" type="number" step="0.01" min="0" max="100" placeholder="0.00" class="w-full pl-2 pr-6 py-1 text-xs border border-zinc-200 rounded-lg outline-none font-mono font-black text-right text-zinc-900 bg-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500" />
                        <span class="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-black text-zinc-400 pointer-events-none">%</span>
                      </div>
                      <button v-if="bakWizardForm.bakCItems.length > 1" type="button" @click="removeBakItem('bakCItems', idx)" class="p-1 text-zinc-400 hover:text-red-600 cursor-pointer">✕</button>
                    </div>
                  </div>
                </div>
                <div class="pt-2 border-t border-purple-200 flex items-center justify-between text-xs">
                  <span class="text-[11px] font-bold text-purple-800">Total Bak C:</span>
                  <span :class="['px-2 py-0.2 rounded font-mono font-black text-[11px]', Math.abs(totalPersenBakC - 100) < 0.05 ? 'text-emerald-700 bg-emerald-50' : 'text-amber-700 bg-amber-50']">{{ totalPersenBakC.toFixed(2) }}%</span>
                </div>
              </div>
            </div>
          </div>

          <!-- STEP 3: HASIL KALKULASI & AKUMULASI BOM GLOBAL -->
          <div class="bg-zinc-900 rounded-2xl p-4 text-white space-y-3">
            <div class="flex items-center justify-between flex-wrap gap-2">
              <span class="text-xs font-black uppercase tracking-wide flex items-center gap-1.5">
                <span class="w-5 h-5 rounded-full bg-emerald-500 text-zinc-950 inline-flex items-center justify-center text-[10px]">3</span>
                <span>Hasil Kalkulasi Akumulasi BOM Global ({{ bakWizardForm.formula || 'FORMULA' }})</span>
              </span>
              <span :class="['px-3 py-1 rounded-full text-xs font-mono font-black', Math.abs(totalCalculatedBomPersen - 100) < 0.05 ? 'bg-emerald-500 text-zinc-950' : 'bg-amber-500 text-zinc-950']">
                Total BOM: {{ totalCalculatedBomPersen.toFixed(2) }}% {{ Math.abs(totalCalculatedBomPersen - 100) < 0.05 ? '✓ (Presisi 100%)' : '⚠️' }}
              </span>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full text-xs font-mono">
                <thead class="bg-zinc-800 text-zinc-400 text-[10.5px]">
                  <tr>
                    <th class="p-2 text-left">Raw Material (Resin)</th>
                    <th class="p-2 text-right text-blue-300">Kontribusi Bak A</th>
                    <th class="p-2 text-right text-emerald-300">Kontribusi Bak B</th>
                    <th class="p-2 text-right text-purple-300">Kontribusi Bak C</th>
                    <th class="p-2 text-right font-black text-emerald-400">Total Persen Global</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-zinc-800">
                  <tr v-if="calculatedBomGlobalList.length === 0">
                    <td colspan="5" class="py-6 text-center text-zinc-500 font-sans">Belum ada data takaran resin yang dimasukkan</td>
                  </tr>
                  <tr v-for="c in calculatedBomGlobalList" :key="c.rm" class="hover:bg-zinc-800/50">
                    <td class="p-2 font-bold text-white flex items-center gap-1.5">
                      <span class="w-2 h-2 rounded-full bg-amber-400"></span>
                      {{ c.rm }}
                    </td>
                    <td class="p-2 text-right text-blue-300">{{ c.kontribusiA > 0 ? c.kontribusiA.toFixed(4).replace('.', ',') + '%' : '—' }}</td>
                    <td class="p-2 text-right text-emerald-300">{{ c.kontribusiB > 0 ? c.kontribusiB.toFixed(4).replace('.', ',') + '%' : '—' }}</td>
                    <td class="p-2 text-right text-purple-300">{{ c.kontribusiC > 0 ? c.kontribusiC.toFixed(4).replace('.', ',') + '%' : '—' }}</td>
                    <td class="p-2 text-right font-black text-emerald-400 text-sm">{{ c.totalPersenRounded.toFixed(2).replace('.', ',') }}%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>

        <div class="px-6 py-4 bg-zinc-50 border-t border-zinc-200 flex items-center justify-between flex-wrap gap-2">
          <div class="text-[11px] text-zinc-500">Hasil kalkulasi otomatis disimpan ke tabel BOM Formula.</div>
          <div class="flex items-center gap-2">
            <button type="button" @click="closeBakWizardModal" class="px-4 py-2 text-xs font-bold text-zinc-600 hover:bg-zinc-200 rounded-xl transition-colors cursor-pointer">Batal</button>
            <button type="button" @click="saveBakWizardToBom" class="px-6 py-2 text-xs font-black bg-amber-600 hover:bg-amber-500 text-white rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-1.5">
              <span>💾 Simpan & Terapkan ke BOM Formula</span>
            </button>
          </div>
        </div>

      </div>
    </div>

    <!-- 4. MODAL TAG MASTER MANAGER (JENIS, BAHAN, TIPE, KATEGORI) -->
    <div v-if="showTagManagerModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
      <div class="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-zinc-200">
        <div class="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
          <div>
            <h3 class="font-black text-zinc-900 text-sm">🏷️ Kelola Tag Master Parameter Film</h3>
            <p class="text-[11px] text-zinc-400 mt-0.5">Tambah / kelola pilihan dropdown jenis, jenis bahan, tipe bahan, dan kategori film</p>
          </div>
          <button @click="showTagManagerModal = false" class="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400 cursor-pointer">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div class="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <!-- Tag Selector -->
          <div class="flex gap-1.5 border-b border-zinc-100 pb-3 overflow-x-auto">
            <button
              v-for="t in tagTabs"
              :key="t.id"
              @click="activeTagTab = t.id"
              :class="[
                'px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer',
                activeTagTab === t.id ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              ]"
            >
              {{ t.label }} ({{ configStore[t.stateKey]?.length || 0 }})
            </button>
          </div>

          <!-- Add Tag Input -->
          <div class="flex gap-2">
            <input
              v-model="newTagInput"
              @keyup.enter="handleAddNewTag"
              type="text"
              :placeholder="`Tambah nama ${currentTagTabDef.labelSingular} baru...`"
              class="flex-1 px-3 py-2 text-xs border border-zinc-300 rounded-xl focus:ring-1 focus:ring-zinc-900 outline-none uppercase font-bold"
            />
            <button
              @click="handleAddNewTag"
              class="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-black rounded-xl cursor-pointer"
            >
              + Tambah
            </button>
          </div>

          <!-- List of Tags -->
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2">
            <div
              v-for="item in configStore[currentTagTabDef.stateKey]"
              :key="item.id"
              class="bg-zinc-50 border border-zinc-200 p-2.5 rounded-xl flex items-center justify-between gap-2"
            >
              <span class="font-bold text-zinc-800 text-xs truncate">{{ item.nama }}</span>
              <button
                @click="deleteTagItem(item.id)"
                class="p-1 text-zinc-400 hover:text-red-600 transition-colors cursor-pointer"
                title="Hapus tag"
              >
                ✕
              </button>
            </div>
          </div>
        </div>

        <div class="px-6 py-3 bg-zinc-50 border-t border-zinc-100 flex justify-end">
          <button @click="showTagManagerModal = false" class="px-4 py-1.5 text-xs font-bold bg-zinc-200 text-zinc-700 rounded-xl cursor-pointer">Tutup</button>
        </div>
      </div>
    </div>

    <!-- 5. MODAL MASTER ITEM RESIN -->
    <div v-if="showResinModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div class="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
          <h3 class="font-black text-zinc-900 text-sm">{{ editingResin ? 'Edit' : 'Tambah' }} Item Resin</h3>
          <button @click="closeResinModal" class="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400 cursor-pointer">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="px-6 py-4 space-y-3.5">
          <div>
            <label class="block text-[11px] font-bold text-zinc-600 mb-1">Nama Resin * <span class="text-amber-600 font-normal">(Tanpa spasi, gunakan "-")</span></label>
            <input v-model="resinForm.resin" @input="resinForm.resin = resinForm.resin.replace(/\s+/g, '-').toUpperCase()" placeholder="Mis: F600F, FL-7632-L..." class="w-full px-2.5 py-2 text-xs border border-zinc-300 rounded-xl focus:ring-1 focus:ring-red-500 outline-none font-mono font-bold uppercase" />
          </div>
          <div>
            <label class="block text-[11px] font-bold text-zinc-600 mb-1">Kode Formula Resin *</label>
            <input v-model="resinForm.kode" placeholder="Mis: HM01, CC01, CM02..." class="w-full px-2.5 py-2 text-xs border border-zinc-300 rounded-xl focus:ring-1 focus:ring-red-500 outline-none font-mono font-bold uppercase" />
          </div>
          <div>
            <label class="block text-[11px] font-bold text-zinc-600 mb-1">Nomor Item SAP / Navision <span class="text-zinc-400 font-normal">(Opsional)</span></label>
            <input v-model="resinForm.nomorItem" placeholder="Mis: 1140102000001..." class="w-full px-2.5 py-2 text-xs border border-zinc-300 rounded-xl focus:ring-1 focus:ring-red-500 outline-none font-mono text-zinc-700" />
          </div>
        </div>
        <div class="px-6 py-4 border-t border-zinc-100 flex justify-end gap-2 bg-zinc-50/50">
          <button @click="closeResinModal" class="px-4 py-2 text-xs font-bold text-zinc-600 hover:bg-zinc-100 rounded-xl transition-colors cursor-pointer">Batal</button>
          <button @click="saveResin" class="px-5 py-2 text-xs font-black bg-red-600 hover:bg-red-500 text-white rounded-xl transition-colors cursor-pointer">{{ editingResin ? 'Simpan' : 'Tambahkan' }}</button>
        </div>
      </div>
    </div>

    <!-- 6. MODAL MESIN -->
    <div v-if="showMesinModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
          <h3 class="font-black text-zinc-900 text-sm">{{ editingMesin ? 'Edit' : 'Tambah' }} Mesin</h3>
          <button @click="showMesinModal = false" class="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400 cursor-pointer">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="px-6 py-4 space-y-3.5">
          <div>
            <label class="block text-[11px] font-bold text-zinc-600 mb-1">Nama Mesin *</label>
            <input v-model="mesinForm.nama" placeholder="Mis: CASTING 1..." class="w-full px-2.5 py-2 text-xs border border-zinc-300 rounded-xl focus:ring-1 focus:ring-red-500 outline-none uppercase font-bold" />
          </div>
          <div>
            <label class="block text-[11px] font-bold text-zinc-600 mb-1">Pra-CodePack (Prefix) *</label>
            <input v-model="mesinForm.praKodePack" placeholder="Mis: C1, R1..." class="w-full px-2.5 py-2 text-xs border border-zinc-300 rounded-xl focus:ring-1 focus:ring-red-500 outline-none uppercase font-mono font-bold text-red-600" />
          </div>
          <div v-if="mesinForm.nama && mesinForm.nama.toUpperCase().includes('SLITTING')" class="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-100">
            <div>
              <label class="block text-[10.5px] font-bold text-amber-800 mb-1">Speed Metalized (m/min)</label>
              <input v-model.number="mesinForm.speedMetalized" type="number" class="w-full px-2.5 py-2 text-xs border border-zinc-300 rounded-xl font-mono font-bold text-amber-900 bg-amber-50/50" />
            </div>
            <div>
              <label class="block text-[10.5px] font-bold text-blue-800 mb-1">Speed Polos (m/min)</label>
              <input v-model.number="mesinForm.speedPolos" type="number" class="w-full px-2.5 py-2 text-xs border border-zinc-300 rounded-xl font-mono font-bold text-blue-900 bg-blue-50/50" />
            </div>
          </div>
        </div>
        <div class="px-6 py-4 border-t border-zinc-100 flex justify-end gap-2 bg-zinc-50/50">
          <button @click="showMesinModal = false" class="px-4 py-2 text-xs font-bold text-zinc-600 hover:bg-zinc-100 rounded-xl cursor-pointer">Batal</button>
          <button @click="saveMesin" class="px-5 py-2 text-xs font-black bg-red-600 hover:bg-red-500 text-white rounded-xl cursor-pointer">Simpan</button>
        </div>
      </div>
    </div>

    <!-- 7. MODAL OPERATOR -->
    <div v-if="showOperatorModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
          <h3 class="font-black text-zinc-900 text-sm">{{ editingOperator ? 'Edit' : 'Tambah' }} Operator</h3>
          <button @click="showOperatorModal = false" class="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400 cursor-pointer">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="px-6 py-4 space-y-3.5">
          <div>
            <label class="block text-[11px] font-bold text-zinc-600 mb-1">Nama Operator *</label>
            <input v-model="operatorForm.nama" placeholder="Mis: UMAR..." class="w-full px-2.5 py-2 text-xs border border-zinc-300 rounded-xl focus:ring-1 focus:ring-red-500 outline-none uppercase font-bold" />
          </div>
          <div>
            <label class="block text-[11px] font-bold text-zinc-600 mb-1">Kode Operator *</label>
            <input v-model="operatorForm.kodeOperator" placeholder="Mis: UMR..." class="w-full px-2.5 py-2 text-xs border border-zinc-300 rounded-xl focus:ring-1 focus:ring-red-500 outline-none uppercase font-mono font-bold text-blue-700" />
          </div>
          <div>
            <label class="block text-[11px] font-bold text-zinc-600 mb-1">Mesin Penugasan</label>
            <select v-model="operatorForm.mesin" class="w-full px-2.5 py-2 text-xs border border-zinc-300 rounded-xl bg-white outline-none">
              <option value="">Pilih Mesin...</option>
              <option v-for="m in configStore.mesinList" :key="m.id" :value="m.nama">{{ m.nama }}</option>
            </select>
          </div>
          <div>
            <label class="block text-[11px] font-bold text-zinc-600 mb-1">Grup Shift Kerja</label>
            <select v-model="operatorForm.kodeGrup" class="w-full px-2.5 py-2 text-xs border border-zinc-300 rounded-xl bg-white font-bold outline-none focus:ring-1 focus:ring-red-500">
              <option value="">Pilih Grup...</option>
              <option value="A">GRUP A</option>
              <option value="B">GRUP B</option>
              <option value="C">GRUP C</option>
              <option value="NON-GRUP">NON-GRUP (Non-Shift)</option>
            </select>
          </div>
        </div>
        <div class="px-6 py-4 border-t border-zinc-100 flex justify-end gap-2 bg-zinc-50/50">
          <button @click="showOperatorModal = false" class="px-4 py-2 text-xs font-bold text-zinc-600 hover:bg-zinc-100 rounded-xl cursor-pointer">Batal</button>
          <button @click="saveOperator" class="px-5 py-2 text-xs font-black bg-red-600 hover:bg-red-500 text-white rounded-xl cursor-pointer">Simpan</button>
        </div>
      </div>
    </div>

    <!-- 8. MODAL LOKASI RAK -->
    <div v-if="showLocationModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
          <h3 class="font-black text-zinc-900 text-sm">{{ editingLocation ? 'Edit' : 'Tambah' }} Lokasi Rak</h3>
          <button @click="showLocationModal = false" class="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400 cursor-pointer">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="px-6 py-4 space-y-3.5">
          <div>
            <label class="block text-[11px] font-bold text-zinc-600 mb-1">Nama Lokasi Rak *</label>
            <input v-model="locationForm.nama" placeholder="Mis: RAK A1A2, STAGING..." class="w-full px-2.5 py-2 text-xs border border-zinc-300 rounded-xl focus:ring-1 focus:ring-red-500 outline-none uppercase font-bold" />
          </div>
          <div>
            <label class="block text-[11px] font-bold text-zinc-600 mb-1">Jenis Peruntukan *</label>
            <select v-model="locationForm.jenis" class="w-full px-2.5 py-2 text-xs border border-zinc-300 rounded-xl bg-white font-bold outline-none">
              <option value="WIP Jumbo Roll">WIP Jumbo Roll</option>
              <option value="Roll Finish Goods (FG)">Roll Finish Goods (FG)</option>
              <option value="Staging Area">Staging Area</option>
            </select>
          </div>
          <div>
            <label class="block text-[11px] font-bold text-zinc-600 mb-1">Alias / Shorthand</label>
            <input v-model="locationForm.alias" placeholder="Mis: A1, A2..." class="w-full px-2.5 py-2 text-xs border border-zinc-300 rounded-xl focus:ring-1 focus:ring-red-500 outline-none" />
          </div>
          <div>
            <label class="block text-[11px] font-bold text-zinc-600 mb-1">Kapasitas (Roll)</label>
            <input v-model.number="locationForm.kapasitas" type="number" placeholder="12" class="w-full px-2.5 py-2 text-xs border border-zinc-300 rounded-xl focus:ring-1 focus:ring-red-500 outline-none font-mono" />
          </div>
        </div>
        <div class="px-6 py-4 border-t border-zinc-100 flex justify-end gap-2 bg-zinc-50/50">
          <button @click="showLocationModal = false" class="px-4 py-2 text-xs font-bold text-zinc-600 hover:bg-zinc-100 rounded-xl cursor-pointer">Batal</button>
          <button @click="saveLocation" class="px-5 py-2 text-xs font-black bg-red-600 hover:bg-red-500 text-white rounded-xl cursor-pointer">Simpan</button>
        </div>
      </div>
    </div>

    <!-- 9. MODAL PANJANG STANDARD -->
    <div v-if="showStandardLengthModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
          <h3 class="font-black text-zinc-900 text-sm">{{ editingStandardLength ? 'Edit' : 'Tambah' }} Batas Panjang Standard</h3>
          <button @click="showStandardLengthModal = false" class="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400 cursor-pointer">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="px-6 py-4 space-y-3.5">
          <div>
            <label class="block text-[11px] font-bold text-zinc-600 mb-1">Ketebalan Film (Micron) *</label>
            <input v-model.number="standardLengthForm.thickness" type="number" placeholder="20" class="w-full px-2.5 py-2 text-xs border border-zinc-300 rounded-xl focus:ring-1 focus:ring-red-500 outline-none font-mono font-bold" />
          </div>
          <div>
            <label class="block text-[11px] font-bold text-zinc-600 mb-1">Max Panjang Roll FG (m) *</label>
            <input v-model.number="standardLengthForm.maxPanjangFg" type="number" placeholder="12000" class="w-full px-2.5 py-2 text-xs border border-zinc-300 rounded-xl focus:ring-1 focus:ring-red-500 outline-none font-mono font-bold" />
          </div>
          <div>
            <label class="block text-[11px] font-bold text-zinc-600 mb-1">Max Panjang Roll Jumbo (m) *</label>
            <input v-model.number="standardLengthForm.maxPanjangJumbo" type="number" placeholder="36300" class="w-full px-2.5 py-2 text-xs border border-zinc-300 rounded-xl focus:ring-1 focus:ring-red-500 outline-none font-mono font-bold text-purple-700" />
          </div>
        </div>
        <div class="px-6 py-4 border-t border-zinc-100 flex justify-end gap-2 bg-zinc-50/50">
          <button @click="showStandardLengthModal = false" class="px-4 py-2 text-xs font-bold text-zinc-600 hover:bg-zinc-100 rounded-xl cursor-pointer">Batal</button>
          <button @click="saveStandardLength" class="px-5 py-2 text-xs font-black bg-red-600 hover:bg-red-500 text-white rounded-xl cursor-pointer">Simpan</button>
        </div>
      </div>
    </div>

    <!-- 10. MODAL IMPORT EXCEL -->
    <div v-if="showImportModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
      <div class="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-zinc-200">
        <div class="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-xl">📥</span>
            <h3 class="font-black text-zinc-900 text-sm">Import Data Configuration</h3>
          </div>
          <button @click="showImportModal = false" class="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400 cursor-pointer">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="p-6 space-y-4 text-xs">
          <div class="bg-blue-50 p-3 rounded-2xl border border-blue-100 text-blue-900">
            <div class="font-bold">File: {{ parsedImportData?.fileName }}</div>
            <div class="text-[11px] text-blue-700 mt-0.5">Ditemukan {{ parsedImportData?.sheets?.length || 0 }} sheet yang cocok dengan Master Data.</div>
          </div>
          <div class="space-y-2 max-h-56 overflow-y-auto pr-1">
            <div
              v-for="s in (parsedImportData?.sheets || []).filter(item => item.def || item.matchedDef)"
              :key="(s.def || s.matchedDef)?.id"
              class="flex items-center justify-between p-2.5 rounded-xl border border-zinc-200 hover:bg-zinc-50"
            >
              <label class="flex items-center gap-2.5 cursor-pointer flex-1">
                <input type="checkbox" :value="(s.def || s.matchedDef)?.id" v-model="selectedSheetsToImport" class="rounded border-zinc-300 text-red-600 focus:ring-red-500" />
                <div>
                  <div class="font-bold text-zinc-900">{{ (s.def || s.matchedDef)?.title }}</div>
                  <div class="text-[10px] text-zinc-400 font-mono">Sheet: {{ s.sheetName }} ({{ (s.rows || []).length }} baris)</div>
                </div>
              </label>
            </div>
          </div>
        </div>
        <div class="px-6 py-4 border-t border-zinc-100 flex items-center justify-between bg-zinc-50/50">
          <button @click="showImportModal = false" class="px-4 py-2 text-xs font-bold text-zinc-600 hover:bg-zinc-200 rounded-xl cursor-pointer">Batal</button>
          <button
            @click="executeImport"
            :disabled="selectedSheetsToImport.length === 0 || isImporting"
            class="px-5 py-2 text-xs font-black bg-blue-600 hover:bg-blue-500 text-white rounded-xl cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
          >
            <span>{{ isImporting ? 'Mengimpor...' : 'Mulai Import' }}</span>
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue';
import { useConfigStore, normalizeResinName } from '@/stores/configStore';
import {
  exportAllConfigsToExcel,
  exportSingleConfigToExcel,
  downloadConfigExcelTemplate,
  parseImportConfigFile,
  applyImportConfigToDb,
  CONFIG_SHEET_DEFS
} from '@/services/configExcelService';

const configStore = useConfigStore();

// ── 4 MAIN MODULES CONFIG ────────────────────────────────────────────────────
const modules = [
  { id: 'formula_hub', label: 'Formula & BOM Film', icon: '🎞️' },
  { id: 'resin', label: 'Master Item Resin', icon: '🧪' },
  { id: 'mesin_operator', label: 'Mesin & Operator', icon: '🏭' },
  { id: 'gudang_standar', label: 'Gudang & Standar Roll', icon: '📍' },
];

const activeModule = ref('formula_hub');
const currentModuleDef = computed(() => modules.find(m => m.id === activeModule.value) || modules[0]);

const subTabMesinOperator = ref('mesin'); // 'mesin' | 'operator'
const subTabGudangStandar = ref('lokasi'); // 'lokasi' | 'standar'

const getModuleCount = (moduleId) => {
  if (moduleId === 'formula_hub') return configStore.filmConfigs?.length || 0;
  if (moduleId === 'resin') return configStore.resinItemList?.length || 0;
  if (moduleId === 'mesin_operator') return (configStore.mesinList?.length || 0) + (configStore.operatorList?.length || 0);
  if (moduleId === 'gudang_standar') return (configStore.locationList?.length || 0) + (configStore.standardLengthList?.length || 0);
  return 0;
};

// ── EXCEL ACTIONS (EXPORT, IMPORT, TEMPLATE) ──────────────────────────────────
const showTemplateMenu = ref(false);
const showExportMenu = ref(false);
const excelFileInput = ref(null);
const showImportModal = ref(false);
const parsedImportData = ref(null);
const selectedSheetsToImport = ref([]);
const isImporting = ref(false);

const handleDownloadAllTemplates = () => {
  showTemplateMenu.value = false;
  downloadConfigExcelTemplate(null);
};

const handleDownloadCurrentTemplate = () => {
  showTemplateMenu.value = false;
  if (activeModule.value === 'formula_hub') {
    downloadConfigExcelTemplate('film');
  } else if (activeModule.value === 'resin') {
    downloadConfigExcelTemplate('resinItems');
  } else if (activeModule.value === 'mesin_operator') {
    downloadConfigExcelTemplate(subTabMesinOperator.value === 'mesin' ? 'mesin' : 'operator');
  } else if (activeModule.value === 'gudang_standar') {
    downloadConfigExcelTemplate(subTabGudangStandar.value === 'lokasi' ? 'location' : 'panjangStandard');
  }
};

const handleExportAll = () => {
  showExportMenu.value = false;
  exportAllConfigsToExcel(configStore);
};

const handleExportCurrentTab = () => {
  showExportMenu.value = false;
  if (activeModule.value === 'formula_hub') {
    exportSingleConfigToExcel(configStore, 'film');
  } else if (activeModule.value === 'resin') {
    exportSingleConfigToExcel(configStore, 'resinItems');
  } else if (activeModule.value === 'mesin_operator') {
    exportSingleConfigToExcel(configStore, subTabMesinOperator.value === 'mesin' ? 'mesin' : 'operator');
  } else if (activeModule.value === 'gudang_standar') {
    exportSingleConfigToExcel(configStore, subTabGudangStandar.value === 'lokasi' ? 'location' : 'panjangStandard');
  }
};

const triggerImportFileInput = () => {
  if (excelFileInput.value) {
    excelFileInput.value.value = '';
    excelFileInput.value.click();
  }
};

const handleFileSelected = async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  try {
    const parsed = await parseImportConfigFile(file);
    parsedImportData.value = parsed;
    selectedSheetsToImport.value = (parsed.sheets || [])
      .filter(s => s.def || s.matchedDef)
      .map(s => (s.def || s.matchedDef).id);
    showImportModal.value = true;
  } catch (err) {
    alert('Gagal membaca file Excel: ' + err.message);
  }
};

const executeImport = async () => {
  if (!parsedImportData.value) return;
  isImporting.value = true;
  try {
    const sheetsToRun = (parsedImportData.value.sheets || [])
      .filter(s => (s.def || s.matchedDef) && selectedSheetsToImport.value.includes((s.def || s.matchedDef).id));
    let totalAdded = 0;
    let totalUpdated = 0;
    for (const item of sheetsToRun) {
      const targetDef = item.def || item.matchedDef;
      const res = await applyImportConfigToDb(targetDef, item.rows, 'upsert', configStore);
      totalAdded += res.addedCount;
      totalUpdated += res.updatedCount;
    }
    alert(`✓ Sukses import data!\nDitambahkan: ${totalAdded}\nDiperbarui: ${totalUpdated}`);
    showImportModal.value = false;
    await configStore.loadAll();
  } catch (err) {
    alert('Gagal mengimpor data: ' + err.message);
  } finally {
    isImporting.value = false;
  }
};

// ── 🎞️ FORMULA HUB & INLINE BOM LOGIC ─────────────────────────────────────────
const filmSearch = ref('');
const filmFilterJenis = ref('');
const expandedFormulaId = ref(null);

const filteredFilmConfigs = computed(() => {
  let list = configStore.filmConfigs || [];
  if (filmFilterJenis.value) {
    list = list.filter(f => (f.jenis || '').toUpperCase() === filmFilterJenis.value.toUpperCase());
  }
  const term = filmSearch.value.trim().toLowerCase();
  if (term) {
    list = list.filter(f =>
      (f.kodeFormula || '').toLowerCase().includes(term) ||
      (f.jenis || '').toLowerCase().includes(term) ||
      (f.alias || '').toLowerCase().includes(term) ||
      (f.keterangan || '').toLowerCase().includes(term) ||
      (f.tipeBahan || '').toLowerCase().includes(term)
    );
  }
  return list;
});

const getFormulaBomSummary = (formulaCode) => {
  const code = (formulaCode || '').toUpperCase();
  const items = (configStore.bomFormulaList || []).filter(b => (b.formula || '').toUpperCase() === code);
  const totalPersen = items.reduce((sum, item) => item.active !== false ? sum + (parseFloat(item.persen) || 0) : sum, 0);
  return { items, totalPersen };
};

const toggleExpandFormula = (id) => {
  expandedFormulaId.value = expandedFormulaId.value === id ? null : id;
};

// Formula Film Modal
const showFilmModal = ref(false);
const editingFilm = ref(null);
const filmForm = reactive({
  jenis: '',
  kodeFormula: '',
  alias: '',
  density: 0.91,
  tipeBahan: '',
  jenisBahan: '',
  kategoriFilm: '',
  keterangan: '',
  supplier: 'INTERNAL'
});

const openFilmModal = (row = null) => {
  editingFilm.value = row;
  if (row) {
    Object.assign(filmForm, { ...row });
  } else {
    Object.assign(filmForm, {
      jenis: 'CPP',
      kodeFormula: '',
      alias: '',
      density: 0.91,
      speed: 600,
      tipeBahan: '',
      jenisBahan: 'Transparent',
      kategoriFilm: 'POLOS',
      keterangan: '',
      supplier: 'INTERNAL'
    });
  }
  showFilmModal.value = true;
};

const closeFilmModal = () => {
  showFilmModal.value = false;
  editingFilm.value = null;
};

const saveFilm = async () => {
  if (!filmForm.jenis.trim() || !filmForm.kodeFormula.trim()) {
    return alert('Jenis film dan Kode Formula wajib diisi!');
  }
  const payload = {
    jenis: filmForm.jenis.trim().toUpperCase(),
    kodeFormula: filmForm.kodeFormula.trim().toUpperCase(),
    alias: filmForm.alias ? filmForm.alias.trim().toUpperCase() : '',
    density: parseFloat(filmForm.density) || 0.91,
    speed: parseInt(filmForm.speed, 10) || ((filmForm.kategoriFilm === 'METAL' || String(filmForm.jenisBahan).toLowerCase().includes('metal') || filmForm.jenis === 'VMCPP') ? 400 : 600),
    tipeBahan: filmForm.tipeBahan.trim(),
    jenisBahan: filmForm.jenisBahan.trim(),
    kategoriFilm: filmForm.kategoriFilm.trim().toUpperCase(),
    keterangan: filmForm.keterangan.trim(),
    supplier: filmForm.supplier ? filmForm.supplier.trim() : 'INTERNAL'
  };

  if (editingFilm.value) {
    await configStore.updateFilmConfig(editingFilm.value.id, payload);
  } else {
    await configStore.addFilmConfig(payload);
  }
  closeFilmModal();
};

const toggleFilmActive = async (row) => {
  await configStore.updateFilmConfig(row.id, { active: row.active === false ? true : false });
};

const deleteFilm = async (id, formulaCode) => {
  if (!confirm(`Hapus Formula Film ${formulaCode}? Resep BOM yang terikat juga akan dihapus.`)) return;
  await configStore.deleteFilmConfig(id);
  // Hapus juga entri BOM yang terkait
  const boms = (configStore.bomFormulaList || []).filter(b => (b.formula || '').toUpperCase() === (formulaCode || '').toUpperCase());
  for (const b of boms) {
    await configStore.deleteBomFormula(b.id);
  }
};

// Single BOM Item Modal
const showBomItemModal = ref(false);
const editingBomItem = ref(null);
const bomItemForm = reactive({
  formula: '',
  rm: '',
  persen: ''
});

const openBomItemModal = (row = null, defaultFormula = '') => {
  editingBomItem.value = row;
  if (row) {
    Object.assign(bomItemForm, {
      formula: row.formula || defaultFormula,
      rm: row.rm || '',
      persen: row.persen !== undefined ? row.persen : ''
    });
  } else {
    Object.assign(bomItemForm, {
      formula: defaultFormula,
      rm: '',
      persen: ''
    });
  }
  showBomItemModal.value = true;
};

const closeBomItemModal = () => {
  showBomItemModal.value = false;
  editingBomItem.value = null;
};

const saveBomItem = async () => {
  if (!bomItemForm.formula.trim() || !bomItemForm.rm.trim()) {
    return alert('Formula dan Raw Material (Resin) wajib diisi!');
  }
  if (bomItemForm.persen === '' || isNaN(parseFloat(bomItemForm.persen))) {
    return alert('Persentase wajib berupa angka valid!');
  }
  const payload = {
    formula: bomItemForm.formula.trim().toUpperCase(),
    rm: normalizeResinName(bomItemForm.rm),
    persen: parseFloat(bomItemForm.persen) || 0
  };

  if (editingBomItem.value) {
    await configStore.updateBomFormula(editingBomItem.value.id, payload);
  } else {
    await configStore.addBomFormula(payload);
  }
  closeBomItemModal();
};

const toggleBomItemActive = async (b) => {
  await configStore.updateBomFormula(b.id, { active: b.active === false ? true : false });
};

const deleteBomItem = async (id) => {
  if (!confirm('Hapus item BOM ini?')) return;
  await configStore.deleteBomFormula(id);
};

// ── ⚡ 3-BAK RECIPE DATA MAP & WIZARD LOGIC ──────────────────────────────────
const STANDARD_BAK_RECIPES = {
  L01: {
    persenBakA: 62, persenBakB: 23, persenBakC: 15,
    bakAItems: [{ rm: 'F600F', persen: 100 }],
    bakBItems: [{ rm: 'FL-7632-L', persen: 95.75 }, { rm: 'ABPP-05-SC', persen: 3 }, { rm: 'SPER-6', persen: 1.25 }],
    bakCItems: [{ rm: 'F600F', persen: 98 }, { rm: 'ABPP-05-SC', persen: 2 }]
  },
  L02: {
    persenBakA: 62, persenBakB: 23, persenBakC: 15,
    bakAItems: [{ rm: 'SINOPEC-PPH-F08MX', persen: 99 }, { rm: 'SPER-6', persen: 1 }],
    bakBItems: [{ rm: 'FL-7632-L', persen: 99 }, { rm: 'ABPP-05-SC', persen: 1 }],
    bakCItems: [{ rm: 'SINOPEC-PPH-F08MX', persen: 99 }, { rm: 'ABPP-05-SC', persen: 1 }]
  },
  L03: {
    persenBakA: 62, persenBakB: 23, persenBakC: 15,
    bakAItems: [{ rm: 'F600F', persen: 99 }, { rm: 'SPER-6', persen: 1 }],
    bakBItems: [{ rm: 'TF-403', persen: 79 }, { rm: 'VISTAMAXX-3588', persen: 20 }, { rm: 'ABPP-05-SC', persen: 1 }],
    bakCItems: [{ rm: 'F600F', persen: 99 }, { rm: 'ABPP-05-SC', persen: 1 }]
  },
  L04: {
    persenBakA: 62, persenBakB: 23, persenBakC: 15,
    bakAItems: [{ rm: 'F600F', persen: 98 }, { rm: 'SPER-6', persen: 2 }],
    bakBItems: [{ rm: 'VISTAMAXX-3588', persen: 95 }, { rm: 'ABPP-05-SC', persen: 3 }, { rm: 'SPER-6', persen: 2 }],
    bakCItems: [{ rm: 'F600F', persen: 98 }, { rm: 'ABPP-05-SC', persen: 2 }]
  },
  L05: {
    persenBakA: 62, persenBakB: 23, persenBakC: 15,
    bakAItems: [{ rm: 'F600F', persen: 98 }, { rm: 'SPER-6', persen: 2 }],
    bakBItems: [{ rm: 'TF-403', persen: 99 }, { rm: 'ABPP-05-SC', persen: 1 }],
    bakCItems: [{ rm: 'TF-403', persen: 99 }, { rm: 'ABPP-05-SC', persen: 1 }]
  },
  M01: {
    persenBakA: 70, persenBakB: 20, persenBakC: 10,
    bakAItems: [{ rm: 'F600F', persen: 100 }],
    bakBItems: [{ rm: 'FL-7642', persen: 97 }, { rm: 'ABVT-22-NSC', persen: 3 }],
    bakCItems: [{ rm: 'FL-7541', persen: 98 }, { rm: 'ABVT-22-NSC', persen: 2 }]
  },
  M02: {
    persenBakA: 71, persenBakB: 23, persenBakC: 6,
    bakAItems: [{ rm: 'F600F', persen: 98 }, { rm: 'ENABLE-2010', persen: 2 }],
    bakBItems: [{ rm: 'FL-7642', persen: 95 }, { rm: 'ABVT-22-NSC', persen: 5 }],
    bakCItems: [{ rm: 'EXCEED-3518', persen: 97 }, { rm: 'ABVT-22-NSC', persen: 3 }]
  },
  M03: {
    persenBakA: 71, persenBakB: 23, persenBakC: 6,
    bakAItems: [{ rm: 'F600F', persen: 97 }, { rm: 'ENABLE-2010', persen: 3 }],
    bakBItems: [{ rm: 'FL-7642', persen: 74 }, { rm: 'VISTAMAXX-3588', persen: 20 }, { rm: 'ABVT-22-NSC', persen: 6 }],
    bakCItems: [{ rm: 'EXCEED-3518', persen: 95 }, { rm: 'ABVT-22-NSC', persen: 5 }]
  },
  M04: {
    persenBakA: 71, persenBakB: 23, persenBakC: 6,
    bakAItems: [{ rm: 'F600F', persen: 98 }, { rm: 'ENABLE-2010', persen: 2 }],
    bakBItems: [{ rm: 'VISTAMAXX-3588', persen: 73 }, { rm: 'FL-7642', persen: 20 }, { rm: 'ABVT-22-NSC', persen: 7 }],
    bakCItems: [{ rm: 'EXCEED-3518', persen: 95 }, { rm: 'ABVT-22-NSC', persen: 5 }]
  },
  M05: {
    persenBakA: 70, persenBakB: 20, persenBakC: 10,
    bakAItems: [{ rm: 'F600F', persen: 100 }],
    bakBItems: [{ rm: 'FL-7642', persen: 99 }, { rm: 'ABVT-22-NSC', persen: 1 }],
    bakCItems: [{ rm: 'FL-7541', persen: 78 }, { rm: 'DF-8200', persen: 20 }, { rm: 'ABVT-22-NSC', persen: 2 }]
  },
  M06: {
    persenBakA: 70, persenBakB: 20, persenBakC: 10,
    bakAItems: [{ rm: 'F600F', persen: 100 }],
    bakBItems: [{ rm: 'FL-7642', persen: 75 }, { rm: 'VISTAMAXX-3588', persen: 20 }, { rm: 'ABVT-22-NSC', persen: 5 }],
    bakCItems: [{ rm: 'RD-265-CF', persen: 97 }, { rm: 'ABVT-22-NSC', persen: 3 }]
  },
  M07: {
    persenBakA: 70, persenBakB: 20, persenBakC: 10,
    bakAItems: [{ rm: 'F600F', persen: 100 }],
    bakBItems: [{ rm: 'FL-7642', persen: 75 }, { rm: 'VISTAMAXX-3588', persen: 20 }, { rm: 'ABVT-22-NSC', persen: 5 }],
    bakCItems: [{ rm: 'RD-265-CF', persen: 87 }, { rm: 'DF-8200', persen: 10 }, { rm: 'ABVT-22-NSC', persen: 3 }]
  },
  M08: {
    persenBakA: 70, persenBakB: 20, persenBakC: 10,
    bakAItems: [{ rm: 'RD-265-CF', persen: 100 }],
    bakBItems: [{ rm: 'FL-7642', persen: 75 }, { rm: 'VISTAMAXX-3588', persen: 20 }, { rm: 'ABVT-22-NSC', persen: 5 }],
    bakCItems: [{ rm: 'RD-265-CF', persen: 87 }, { rm: 'DF-8200', persen: 10 }, { rm: 'ABVT-22-NSC', persen: 3 }]
  }
};

const showBakWizardModal = ref(false);
const bakWizardForm = reactive({
  formula: '',
  persenBakA: 70,
  persenBakB: 20,
  persenBakC: 10,
  bakAItems: [{ rm: '', persen: '' }],
  bakBItems: [{ rm: '', persen: '' }],
  bakCItems: [{ rm: '', persen: '' }]
});

const onBakWizardFormulaChange = () => {
  const code = (bakWizardForm.formula || '').toUpperCase().trim();
  if (!code) return;

  if (STANDARD_BAK_RECIPES[code]) {
    const std = STANDARD_BAK_RECIPES[code];
    bakWizardForm.persenBakA = std.persenBakA;
    bakWizardForm.persenBakB = std.persenBakB;
    bakWizardForm.persenBakC = std.persenBakC;
    bakWizardForm.bakAItems = std.bakAItems.map(i => ({ ...i }));
    bakWizardForm.bakBItems = std.bakBItems.map(i => ({ ...i }));
    bakWizardForm.bakCItems = std.bakCItems.map(i => ({ ...i }));
  } else {
    // Custom formula: periksa apakah ada BOM items terdaftar di database
    const boms = (configStore.bomFormulaList || []).filter(b => (b.formula || '').toUpperCase() === code);
    if (boms.length > 0) {
      const isL = code.startsWith('L');
      bakWizardForm.persenBakA = isL ? 62 : 70;
      bakWizardForm.persenBakB = isL ? 23 : 20;
      bakWizardForm.persenBakC = isL ? 15 : 10;
      bakWizardForm.bakAItems = [{ rm: boms[0].rm, persen: 100 }];
      bakWizardForm.bakBItems = boms.slice(1).map(b => ({ rm: b.rm, persen: b.persen }));
      if (bakWizardForm.bakBItems.length === 0) bakWizardForm.bakBItems = [{ rm: '', persen: '' }];
      bakWizardForm.bakCItems = [{ rm: '', persen: '' }];
    } else {
      const isL = code.startsWith('L');
      bakWizardForm.persenBakA = isL ? 62 : 70;
      bakWizardForm.persenBakB = isL ? 23 : 20;
      bakWizardForm.persenBakC = isL ? 15 : 10;
      bakWizardForm.bakAItems = [{ rm: '', persen: '' }];
      bakWizardForm.bakBItems = [{ rm: '', persen: '' }];
      bakWizardForm.bakCItems = [{ rm: '', persen: '' }];
    }
  }
};

const openBakWizardModal = (formulaCode = null) => {
  let code = formulaCode ? String(formulaCode).toUpperCase().trim() : '';
  if (!code && (configStore.filmConfigs || []).length > 0) {
    code = configStore.filmConfigs[0].kodeFormula;
  }
  bakWizardForm.formula = code || 'L01';
  onBakWizardFormulaChange();
  showBakWizardModal.value = true;
};

const closeBakWizardModal = () => {
  showBakWizardModal.value = false;
};

const applyBakPreset = (preset) => {
  if (preset === 'L') {
    bakWizardForm.persenBakA = 62;
    bakWizardForm.persenBakB = 23;
    bakWizardForm.persenBakC = 15;
  } else if (preset === 'M_STD') {
    bakWizardForm.persenBakA = 70;
    bakWizardForm.persenBakB = 20;
    bakWizardForm.persenBakC = 10;
  } else if (preset === 'M_SPEC') {
    bakWizardForm.persenBakA = 71;
    bakWizardForm.persenBakB = 23;
    bakWizardForm.persenBakC = 6;
  }
};

const addBakItem = (bakKey) => {
  bakWizardForm[bakKey].push({ rm: '', persen: '' });
};

const removeBakItem = (bakKey, idx) => {
  bakWizardForm[bakKey].splice(idx, 1);
};

const totalPersenBakRatio = computed(() => {
  return Number(((parseFloat(bakWizardForm.persenBakA) || 0) + (parseFloat(bakWizardForm.persenBakB) || 0) + (parseFloat(bakWizardForm.persenBakC) || 0)).toFixed(2));
});

const totalPersenBakA = computed(() => {
  return (bakWizardForm.bakAItems || []).reduce((sum, item) => sum + (parseFloat(item.persen) || 0), 0);
});

const totalPersenBakB = computed(() => {
  return (bakWizardForm.bakBItems || []).reduce((sum, item) => sum + (parseFloat(item.persen) || 0), 0);
});

const totalPersenBakC = computed(() => {
  return (bakWizardForm.bakCItems || []).reduce((sum, item) => sum + (parseFloat(item.persen) || 0), 0);
});

const calculatedBomGlobalList = computed(() => {
  const map = {};
  const bakA = parseFloat(bakWizardForm.persenBakA) || 0;
  const bakB = parseFloat(bakWizardForm.persenBakB) || 0;
  const bakC = parseFloat(bakWizardForm.persenBakC) || 0;

  // Process Bak A
  (bakWizardForm.bakAItems || []).forEach(item => {
    const rm = normalizeResinName(item.rm);
    const p = parseFloat(item.persen) || 0;
    if (!rm || p <= 0) return;
    if (!map[rm]) map[rm] = { rm, kontribusiA: 0, kontribusiB: 0, kontribusiC: 0, totalPersen: 0 };
    const contrib = (bakA * p) / 100;
    map[rm].kontribusiA += contrib;
    map[rm].totalPersen += contrib;
  });

  // Process Bak B
  (bakWizardForm.bakBItems || []).forEach(item => {
    const rm = normalizeResinName(item.rm);
    const p = parseFloat(item.persen) || 0;
    if (!rm || p <= 0) return;
    if (!map[rm]) map[rm] = { rm, kontribusiA: 0, kontribusiB: 0, kontribusiC: 0, totalPersen: 0 };
    const contrib = (bakB * p) / 100;
    map[rm].kontribusiB += contrib;
    map[rm].totalPersen += contrib;
  });

  // Process Bak C
  (bakWizardForm.bakCItems || []).forEach(item => {
    const rm = normalizeResinName(item.rm);
    const p = parseFloat(item.persen) || 0;
    if (!rm || p <= 0) return;
    if (!map[rm]) map[rm] = { rm, kontribusiA: 0, kontribusiB: 0, kontribusiC: 0, totalPersen: 0 };
    const contrib = (bakC * p) / 100;
    map[rm].kontribusiC += contrib;
    map[rm].totalPersen += contrib;
  });

  const list = Object.values(map).map(r => ({
    ...r,
    kontribusiA: Number(r.kontribusiA.toFixed(4)),
    kontribusiB: Number(r.kontribusiB.toFixed(4)),
    kontribusiC: Number(r.kontribusiC.toFixed(4)),
    totalPersen: Number(r.totalPersen.toFixed(4)),
    totalPersenRounded: Number(r.totalPersen.toFixed(2))
  }));

  return list.sort((a, b) => b.totalPersen - a.totalPersen);
});

const totalCalculatedBomPersen = computed(() => {
  return Number(calculatedBomGlobalList.value.reduce((sum, item) => sum + item.totalPersen, 0).toFixed(2));
});

const saveBakWizardToBom = async () => {
  const code = (bakWizardForm.formula || '').trim().toUpperCase();
  if (!code) return alert('Kode Formula wajib diisi!');

  if (Math.abs(totalPersenBakRatio.value - 100) > 0.1) {
    return alert(`Total Rasio Bak A+B+C harus 100% (Saat ini: ${totalPersenBakRatio.value}%)`);
  }

  const items = calculatedBomGlobalList.value;
  if (items.length === 0) {
    return alert('Harap isi bahan baku (RM) di minimal satu bak!');
  }

  // Cek apakah formula sudah ada di database
  const existing = (configStore.bomFormulaList || []).filter(b => (b.formula || '').toUpperCase() === code);
  if (existing.length > 0) {
    if (!confirm(`Formula ${code} sudah memiliki ${existing.length} baris BOM di database. Timpa / ganti dengan hasil kalkulasi 3 bak ini?`)) {
      return;
    }
    for (const row of existing) {
      await configStore.deleteBomFormula(row.id);
    }
  }

  // Tambahkan baris-baris BOM baru
  for (const item of items) {
    await configStore.addBomFormula({
      formula: code,
      rm: item.rm,
      persen: item.totalPersenRounded
    });
  }

  alert(`✓ Sukses: Formula ${code} berhasil disimpan dengan ${items.length} komponen BOM (Total: ${totalCalculatedBomPersen.value}%)`);
  showBakWizardModal.value = false;
};

// ── TAG MASTER MANAGER (JENIS, BAHAN, TIPE, KATEGORI) ─────────────────────────
const showTagManagerModal = ref(false);
const activeTagTab = ref('jenis');
const newTagInput = ref('');

const openTagManagerTab = (tabId) => {
  activeTagTab.value = tabId;
  showTagManagerModal.value = true;
};

const tagTabs = [
  { id: 'jenis', label: 'Jenis Film', labelSingular: 'Jenis', stateKey: 'jenisList', tableName: 'jenis_list' },
  { id: 'jenisBahan', label: 'Jenis Bahan', labelSingular: 'Jenis Bahan', stateKey: 'jenisBahanList', tableName: 'jenis_bahan_list' },
  { id: 'tipeBahan', label: 'Tipe Bahan', labelSingular: 'Tipe Bahan', stateKey: 'tipeBahanList', tableName: 'tipe_bahan_list' },
  { id: 'kategori', label: 'Kategori Film', labelSingular: 'Kategori', stateKey: 'kategoriFilmList', tableName: 'kategori_film_list' },
];

const currentTagTabDef = computed(() => tagTabs.find(t => t.id === activeTagTab.value) || tagTabs[0]);

const handleAddNewTag = async () => {
  const val = newTagInput.value.trim().toUpperCase();
  if (!val) return;
  const def = currentTagTabDef.value;
  await configStore.addListItem(def.tableName, def.stateKey, val);
  newTagInput.value = '';
};

const deleteTagItem = async (id) => {
  if (!confirm('Hapus tag parameter ini?')) return;
  const def = currentTagTabDef.value;
  await configStore.deleteListItem(def.tableName, def.stateKey, id);
};

// ── 🧪 MASTER ITEM RESIN LOGIC ────────────────────────────────────────────────
const resinSearch = ref('');
const showResinModal = ref(false);
const editingResin = ref(null);
const resinForm = reactive({ resin: '', kode: '', nomorItem: '' });

const filteredResinItems = computed(() => {
  let list = configStore.resinItemList || [];
  const term = resinSearch.value.trim().toLowerCase();
  if (term) {
    list = list.filter(r =>
      (r.resin || '').toLowerCase().includes(term) ||
      (r.kode || '').toLowerCase().includes(term) ||
      (r.nomorItem || '').toLowerCase().includes(term)
    );
  }
  return list;
});

const openResinModal = (row = null) => {
  editingResin.value = row;
  if (row) {
    Object.assign(resinForm, { resin: row.resin, kode: row.kode, nomorItem: row.nomorItem || '' });
  } else {
    Object.assign(resinForm, { resin: '', kode: '', nomorItem: '' });
  }
  showResinModal.value = true;
};

const closeResinModal = () => {
  showResinModal.value = false;
  editingResin.value = null;
};

const saveResin = async () => {
  if (!resinForm.resin.trim() || !resinForm.kode.trim()) {
    return alert('Nama Resin dan Kode Formula Resin wajib diisi!');
  }
  const payload = {
    resin: normalizeResinName(resinForm.resin),
    kode: resinForm.kode.trim().toUpperCase(),
    nomorItem: resinForm.nomorItem.trim()
  };
  if (editingResin.value) {
    await configStore.updateResinItem(editingResin.value.id, payload);
  } else {
    await configStore.addResinItem(payload);
  }
  closeResinModal();
};

const toggleResinActive = async (row) => {
  await configStore.updateResinItem(row.id, { active: row.active === false ? true : false });
};

const deleteResin = async (id) => {
  if (!confirm('Hapus item resin ini?')) return;
  await configStore.deleteResinItem(id);
};

// ── ⚙️ MESIN & OPERATOR LOGIC ─────────────────────────────────────────────────
const showMesinModal = ref(false);
const editingMesin = ref(null);
const mesinForm = reactive({ nama: '', praKodePack: '', speedMetalized: 400, speedPolos: 600 });

const openMesinModal = (row = null) => {
  editingMesin.value = row;
  if (row) {
    Object.assign(mesinForm, { nama: row.nama, praKodePack: row.praKodePack || '', speedMetalized: row.speedMetalized || 400, speedPolos: row.speedPolos || 600 });
  } else {
    Object.assign(mesinForm, { nama: '', praKodePack: '', speedMetalized: 400, speedPolos: 600 });
  }
  showMesinModal.value = true;
};

const saveMesin = async () => {
  if (!mesinForm.nama.trim() || !mesinForm.praKodePack.trim()) return alert('Semua field wajib diisi!');
  const payload = {
    nama: mesinForm.nama.trim().toUpperCase(),
    praKodePack: mesinForm.praKodePack.trim().toUpperCase(),
    speedMetalized: parseInt(mesinForm.speedMetalized, 10) || 400,
    speedPolos: parseInt(mesinForm.speedPolos, 10) || 600
  };
  if (editingMesin.value) await configStore.updateMesin(editingMesin.value.id, payload);
  else await configStore.addMesin(payload);
  showMesinModal.value = false;
};

const toggleMesinActive = async (row) => {
  await configStore.updateMesin(row.id, { active: row.active === false ? true : false });
};

const deleteMesin = async (id) => {
  if (!confirm('Hapus mesin ini?')) return;
  await configStore.deleteMesin(id);
};

const showOperatorModal = ref(false);
const editingOperator = ref(null);
const operatorForm = reactive({ nama: '', kodeOperator: '', mesin: '', kodeGrup: '' });

const openOperatorModal = (row = null) => {
  editingOperator.value = row;
  if (row) Object.assign(operatorForm, { ...row });
  else Object.assign(operatorForm, { nama: '', kodeOperator: '', mesin: '', kodeGrup: '' });
  showOperatorModal.value = true;
};

const saveOperator = async () => {
  if (!operatorForm.nama.trim() || !operatorForm.kodeOperator.trim()) return alert('Nama dan Kode Operator wajib diisi!');
  const payload = {
    nama: operatorForm.nama.trim().toUpperCase(),
    kodeOperator: operatorForm.kodeOperator.trim().toUpperCase(),
    mesin: operatorForm.mesin,
    kodeGrup: operatorForm.kodeGrup.trim().toUpperCase()
  };
  if (editingOperator.value) await configStore.updateOperator(editingOperator.value.id, payload);
  else await configStore.addOperator(payload);
  showOperatorModal.value = false;
};

const toggleOperatorActive = async (row) => {
  await configStore.updateOperator(row.id, { active: row.active === false ? true : false });
};

const deleteOperator = async (id) => {
  if (!confirm('Hapus operator ini?')) return;
  await configStore.deleteOperator(id);
};

// ── 📍 LOKASI RAK & PANJANG STANDARD LOGIC ────────────────────────────────────
const showLocationModal = ref(false);
const editingLocation = ref(null);
const locationForm = reactive({ nama: '', jenis: 'WIP Jumbo Roll', alias: '', kapasitas: 12, keterangan: '' });

const openLocationModal = (row = null) => {
  editingLocation.value = row;
  if (row) Object.assign(locationForm, { ...row });
  else Object.assign(locationForm, { nama: '', jenis: 'WIP Jumbo Roll', alias: '', kapasitas: 12, keterangan: '' });
  showLocationModal.value = true;
};

const saveLocation = async () => {
  if (!locationForm.nama.trim()) return alert('Nama Lokasi Rak wajib diisi!');
  const payload = {
    nama: locationForm.nama.trim().toUpperCase(),
    jenis: locationForm.jenis,
    alias: locationForm.alias.trim(),
    kapasitas: parseInt(locationForm.kapasitas) || 12,
    keterangan: locationForm.keterangan.trim()
  };
  if (editingLocation.value) await configStore.updateLocation(editingLocation.value.id, payload);
  else await configStore.addLocation(payload);
  showLocationModal.value = false;
};

const toggleLocationActive = async (row) => {
  await configStore.updateLocation(row.id, { active: row.active === false ? true : false });
};

const deleteLocation = async (id) => {
  if (!confirm('Hapus lokasi rak ini?')) return;
  await configStore.deleteLocation(id);
};

const showStandardLengthModal = ref(false);
const editingStandardLength = ref(null);
const standardLengthForm = reactive({ thickness: '', maxPanjangFg: '', maxPanjangJumbo: '' });

const openStandardLengthModal = (row = null) => {
  editingStandardLength.value = row;
  if (row) Object.assign(standardLengthForm, { ...row });
  else Object.assign(standardLengthForm, { thickness: '', maxPanjangFg: '', maxPanjangJumbo: '' });
  showStandardLengthModal.value = true;
};

const saveStandardLength = async () => {
  if (!standardLengthForm.thickness || !standardLengthForm.maxPanjangFg || !standardLengthForm.maxPanjangJumbo) {
    return alert('Semua field ketebalan dan panjang standard wajib diisi!');
  }
  const payload = {
    thickness: parseFloat(standardLengthForm.thickness),
    maxPanjangFg: parseFloat(standardLengthForm.maxPanjangFg),
    maxPanjangJumbo: parseFloat(standardLengthForm.maxPanjangJumbo)
  };
  if (editingStandardLength.value) await configStore.updateStandardLength(editingStandardLength.value.id, payload);
  else await configStore.addStandardLength(payload);
  showStandardLengthModal.value = false;
};

const toggleStandardLengthActive = async (row) => {
  await configStore.updateStandardLength(row.id, { active: row.active === false ? true : false });
};

const deleteStandardLength = async (id) => {
  if (!confirm('Hapus konfigurasi panjang standard ini?')) return;
  await configStore.deleteStandardLength(id);
};

// ── STYLE HELPERS ─────────────────────────────────────────────────────────────
const jenisTagClass = (jenis) => {
  const map = {
    CPP: 'bg-blue-100 text-blue-800',
    VMCPP: 'bg-violet-100 text-violet-800',
    PET: 'bg-emerald-100 text-emerald-800',
    VMPET: 'bg-teal-100 text-teal-800',
    BOPP: 'bg-orange-100 text-orange-800',
    OPP: 'bg-amber-100 text-amber-800',
    LLDPE: 'bg-pink-100 text-pink-800',
  };
  return map[jenis] || 'bg-zinc-100 text-zinc-700';
};

onMounted(async () => {
  await configStore.loadAll();
});
</script>
