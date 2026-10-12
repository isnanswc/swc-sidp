<template>
  <div class="space-y-5 animate-fade-in pb-12">
    <!-- Page Header (100% Light Warm Modern Theme) -->
    <div class="bg-white rounded-2xl border border-zinc-200/90 p-4 sm:p-5 shadow-xs flex items-center justify-between flex-wrap gap-4">
      <div class="flex items-center gap-3">
        <div class="w-11 h-11 rounded-xl bg-gradient-to-br from-red-600 to-red-700 text-white flex items-center justify-center shadow-md shadow-red-600/20">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-base sm:text-lg font-black text-zinc-900 tracking-tight uppercase">
              Permintaan Pengebonan Barang (FPB)
            </h1>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 border border-red-200">
              Gudang RM
            </span>
          </div>
          <p class="text-xs text-zinc-500 mt-0.5">
            Pencatatan resmi barang pendukung operasional, auto-dropdown histori barang, follow-up status, dan cetak dokumen resmi.
          </p>
        </div>
      </div>

      <!-- Action Button: Tambah FPB Baru -->
      <div class="flex items-center gap-2">
        <button
          type="button"
          @click="openAddModal"
          class="px-4 py-2.5 rounded-xl text-xs font-black bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-600/20 cursor-pointer flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/>
          </svg>
          <span>+ Buat FPB Baru</span>
        </button>
      </div>
    </div>

    <!-- Stats Quick Cards -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div class="bg-white p-3.5 rounded-xl border border-zinc-200/90 shadow-2xs flex flex-col justify-between">
        <span class="text-[10.5px] font-bold text-zinc-500 uppercase tracking-wider">Total Dokumen FPB</span>
        <div class="text-xl font-black text-zinc-900 mt-1 font-mono">
          {{ fpbStore.fpbList.length }} <span class="text-xs text-zinc-400 font-sans font-normal">Form</span>
        </div>
      </div>

      <div class="bg-amber-50/70 p-3.5 rounded-xl border border-amber-200/90 shadow-2xs flex flex-col justify-between">
        <span class="text-[10.5px] font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full bg-amber-500"></span>
          <span>Menunggu / Pending</span>
        </span>
        <div class="text-xl font-black text-amber-950 mt-1 font-mono">
          {{ pendingCount }} <span class="text-xs text-amber-700 font-sans font-normal">Form</span>
        </div>
      </div>

      <div class="bg-blue-50/70 p-3.5 rounded-xl border border-blue-200/90 shadow-2xs flex flex-col justify-between">
        <span class="text-[10.5px] font-bold text-blue-800 uppercase tracking-wider flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full bg-blue-500"></span>
          <span>Sedang Diproses</span>
        </span>
        <div class="text-xl font-black text-blue-950 mt-1 font-mono">
          {{ inProgressCount }} <span class="text-xs text-blue-700 font-sans font-normal">Form</span>
        </div>
      </div>

      <div class="bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-200/90 shadow-2xs flex flex-col justify-between">
        <span class="text-[10.5px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>Selesai Diterima</span>
        </span>
        <div class="text-xl font-black text-emerald-950 mt-1 font-mono">
          {{ doneCount }} <span class="text-xs text-emerald-700 font-sans font-normal">Form</span>
        </div>
      </div>
    </div>

    <!-- Tabs Navigasi: Riwayat Dokumen FPB vs Sheet Analitik Permintaan Item -->
    <div class="flex items-center justify-between border-b border-zinc-200/90 pb-2 flex-wrap gap-2">
      <div class="flex items-center gap-1.5 p-1 bg-zinc-200/60 rounded-xl">
        <button
          type="button"
          @click="activeMainTab = 'DOCUMENTS'"
          :class="[
            'px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2',
            activeMainTab === 'DOCUMENTS'
              ? 'bg-white text-zinc-900 shadow-xs font-black'
              : 'text-zinc-600 hover:text-zinc-900'
          ]"
        >
          <svg class="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
          <span>Daftar Dokumen FPB</span>
          <span class="px-1.5 py-0.2 rounded-md bg-zinc-100 text-[10px] font-mono font-bold text-zinc-700">
            {{ fpbStore.fpbList.length }}
          </span>
        </button>

        <button
          type="button"
          @click="activeMainTab = 'ANALYTICS'"
          :class="[
            'px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2',
            activeMainTab === 'ANALYTICS'
              ? 'bg-white text-red-600 shadow-xs font-black'
              : 'text-zinc-600 hover:text-zinc-900'
          ]"
        >
          <svg class="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
          <span>Sheet Analitik Permintaan Item</span>
          <span class="px-1.5 py-0.2 rounded-md bg-red-100 text-[10px] font-mono font-bold text-red-700">
            Grafik & Tren
          </span>
        </button>
      </div>

      <div class="text-[11px] font-mono text-zinc-500">
        {{ activeMainTab === 'DOCUMENTS' ? 'Tampilan Arsip & Cetak Formulir' : 'Analisis Konsumsi & Frekuensi Bon Barang' }}
      </div>
    </div>

    <!-- ══════ KONTEN TAB 1: DAFTAR DOKUMEN FPB ══════ -->
    <div v-show="activeMainTab === 'DOCUMENTS'" class="space-y-4">
      <!-- Filter & Search Toolbar -->
      <div class="bg-white p-3.5 rounded-xl border border-zinc-200/90 shadow-2xs flex items-center justify-between gap-3 flex-wrap">
        <div class="flex items-center gap-2 flex-1 min-w-[260px]">
          <div class="relative flex-1">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Cari Nomor FPB, Bagian/Dept, Pemohon, atau Nama Barang..."
              class="w-full pl-9 pr-3 py-1.5 rounded-lg border border-zinc-300 text-xs focus:ring-1 focus:ring-red-600 focus:border-red-600 outline-none bg-zinc-50/50"
            />
            <svg class="w-4 h-4 text-zinc-400 absolute left-2.5 top-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          </div>
        </div>

        <div class="flex items-center gap-2 flex-wrap">
          <!-- Filter Status -->
          <select
            v-model="selectedStatusFilter"
            class="px-2.5 py-1.5 rounded-lg border border-zinc-300 text-xs font-bold text-zinc-700 bg-white outline-none cursor-pointer"
          >
            <option value="ALL">Semua Status</option>
            <option value="PENDING">Menunggu (Pending)</option>
            <option value="PROCESS">Sedang Diproses</option>
            <option value="DONE">Selesai Diterima</option>
          </select>

          <!-- Filter Bagian / Dept -->
          <select
            v-model="selectedDeptFilter"
            class="px-2.5 py-1.5 rounded-lg border border-zinc-300 text-xs font-bold text-zinc-700 bg-white outline-none cursor-pointer"
          >
            <option value="ALL">Semua Bagian / Dept</option>
            <option v-for="d in deptOptions" :key="d" :value="d">{{ d }}</option>
          </select>

          <!-- Tombol Cetak Masal / Batch Print yang Terchecklist -->
          <button
            v-if="selectedFpbIds.length > 0"
            type="button"
            @click="openBatchPrintPreview"
            class="px-3.5 py-1.5 rounded-lg text-xs font-black bg-zinc-900 hover:bg-black text-white shadow-xs cursor-pointer flex items-center gap-1.5 transition-all animate-fade-in"
          >
            <svg class="w-3.5 h-3.5 text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
            <span>Cetak Terpilih ({{ selectedFpbIds.length }})</span>
          </button>
        </div>
      </div>

      <!-- Tabel Riwayat FPB -->
      <div class="bg-white rounded-2xl border border-zinc-200/90 shadow-xs overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead class="bg-zinc-50 border-b border-zinc-200 text-zinc-700 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th class="px-3 py-3 text-center w-10">
                  <input
                    type="checkbox"
                    :checked="isAllSelected"
                    :indeterminate.prop="isIndeterminate"
                    @change="toggleSelectAll"
                    class="w-4 h-4 rounded text-red-600 focus:ring-red-500 border-zinc-300 cursor-pointer"
                    title="Pilih Semua / Batal Pilih"
                  />
                </th>
                <th class="px-3 py-3 text-center w-10">No</th>
              <th class="px-4 py-3">Nomor FPB</th>
              <th class="px-4 py-3">Tanggal</th>
              <th class="px-4 py-3">Bagian / Dept</th>
              <th class="px-4 py-3">Pemohon</th>
              <th class="px-4 py-3">Rincian Barang</th>
              <th class="px-4 py-3 text-center w-32">Status Follow Up</th>
              <th class="px-4 py-3 text-center w-36">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-zinc-100 font-mono text-[11px]">
            <tr
              v-for="(row, idx) in filteredFpbList"
              :key="row.id || row.uuid"
              class="hover:bg-zinc-50/80 transition-colors"
              :class="{ 'bg-red-50/30': isRowSelected(row.id) }"
            >
              <td class="px-3 py-3 text-center">
                <input
                  type="checkbox"
                  :checked="isRowSelected(row.id)"
                  @change="toggleRowSelection(row.id)"
                  class="w-4 h-4 rounded text-red-600 focus:ring-red-500 border-zinc-300 cursor-pointer"
                />
              </td>
              <td class="px-3 py-3 text-center font-bold text-zinc-400">
                {{ idx + 1 }}
              </td>
              <td class="px-4 py-3 font-bold text-red-600">
                {{ row.nomorFpb }}
              </td>
              <td class="px-4 py-3 font-sans text-zinc-600">
                {{ row.tanggal }}
              </td>
              <td class="px-4 py-3 font-sans font-bold text-zinc-800">
                <span class="px-2 py-0.5 rounded bg-zinc-100 border border-zinc-200 text-[10.5px]">
                  {{ row.bagianDept }}
                </span>
              </td>
              <td class="px-4 py-3 font-sans text-zinc-700">
                {{ row.pemohon || '-' }}
              </td>
              <td class="px-4 py-3 font-sans">
                <div class="space-y-0.5 max-w-xs">
                  <div v-for="(it, iIdx) in (row.items || []).slice(0, 3)" :key="iIdx" class="text-[11px] truncate text-zinc-800">
                    • <strong>{{ it.qty }} {{ it.satuan }}</strong> {{ it.namaBarang }}
                  </div>
                  <div v-if="(row.items || []).length > 3" class="text-[10px] text-zinc-400 font-italic">
                    +{{ (row.items || []).length - 3 }} barang lainnya...
                  </div>
                </div>
              </td>
              <td class="px-4 py-3 text-center">
                <!-- Dropdown Ganti Status Cepat -->
                <select
                  :value="row.status"
                  @change="onStatusChange(row.id, $event.target.value)"
                  class="px-2 py-1 rounded-md text-[10px] font-bold border outline-none cursor-pointer"
                  :class="[
                    row.status === 'DONE' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' :
                    row.status === 'PROCESS' ? 'bg-blue-50 text-blue-800 border-blue-300' :
                    'bg-amber-50 text-amber-800 border-amber-300'
                  ]"
                >
                  <option value="PENDING">⏳ Menunggu Gudang</option>
                  <option value="PROCESS">🔄 Sedang Disiapkan</option>
                  <option value="DONE">✅ Selesai Diterima</option>
                </select>
              </td>
              <td class="px-4 py-3 text-center">
                <div class="flex items-center justify-center gap-1.5">
                  <!-- Cetak / Print -->
                  <button
                    type="button"
                    @click="openPrintPreview(row)"
                    class="p-1.5 rounded-lg text-zinc-600 hover:text-red-600 hover:bg-red-50 border border-zinc-200 transition-colors cursor-pointer"
                    title="Cetak FPB Resmi"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
                  </button>

                  <!-- Edit -->
                  <button
                    type="button"
                    @click="openEditModal(row)"
                    class="p-1.5 rounded-lg text-zinc-600 hover:text-blue-600 hover:bg-blue-50 border border-zinc-200 transition-colors cursor-pointer"
                    title="Edit Dokumen FPB"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                  </button>

                  <!-- Hapus -->
                  <button
                    type="button"
                    @click="handleDelete(row.id, row.nomorFpb)"
                    class="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 border border-zinc-200 transition-colors cursor-pointer"
                    title="Hapus FPB"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                  </button>
                </div>
              </td>
            </tr>

            <tr v-if="filteredFpbList.length === 0">
              <td colspan="9" class="px-4 py-12 text-center text-zinc-400 font-sans italic">
                <div class="flex flex-col items-center justify-center gap-2">
                  <span class="text-3xl">📦</span>
                  <span>Belum ada data permintaan barang (FPB). Klik tombol <strong>+ Buat FPB Baru</strong> untuk memulai.</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    </div>

    <!-- ══════ KONTEN TAB 2: SHEET ANALITIK PERMINTAAN ITEM ══════ -->
    <div v-show="activeMainTab === 'ANALYTICS'">
      <FpbAnalyticsSheet />
    </div>

    <!-- ══════ MODAL FORM TAMBAH / EDIT FPB ══════ -->
    <teleport to="body">
      <div
        v-if="showFormModal"
        class="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-zinc-950/70 backdrop-blur-xs animate-fade-in"
        @click.self="showFormModal = false"
      >
        <div class="bg-white rounded-2xl border border-zinc-200 shadow-2xl w-full max-w-4xl max-h-[94vh] flex flex-col overflow-hidden">
          <!-- Modal Header -->
          <div class="px-6 py-4 bg-gradient-to-r from-red-50 via-zinc-50 to-white border-b border-zinc-200 flex items-center justify-between shrink-0">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center font-black text-xs shadow-sm">
                FPB
              </div>
              <div>
                <h3 class="text-sm font-black text-zinc-900 uppercase">
                  {{ isEditing ? 'Edit Form Permintaan Barang' : 'Form Permintaan Pengebonan Barang (FPB)' }}
                </h3>
                <p class="text-[11px] text-zinc-500 font-mono">
                  PT. Sapta Warna Cemerlang • Gudang Bahan Pendukung / RM
                </p>
              </div>
            </div>

            <button
              type="button"
              @click="showFormModal = false"
              class="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 cursor-pointer"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>

          <!-- Modal Body Form -->
          <form @submit.prevent="handleSaveForm" class="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 text-xs">
            <!-- Header Inputs: Nomor FPB, Tanggal, Bagian/Dept, Pemohon -->
            <div class="p-4 bg-zinc-50/80 border border-zinc-200 rounded-xl grid grid-cols-1 sm:grid-cols-4 gap-3.5">
              <div>
                <label class="block font-bold text-zinc-700 mb-1">Nomor FPB</label>
                <input
                  v-model="formData.nomorFpb"
                  type="text"
                  required
                  class="w-full px-3 py-2 border border-zinc-300 rounded-lg font-mono font-bold text-red-600 bg-white outline-none uppercase"
                  placeholder="FPB/..."
                />
              </div>

              <div>
                <label class="block font-bold text-zinc-700 mb-1">
                  Tanggal <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="formData.tanggal"
                  type="date"
                  required
                  class="w-full px-3 py-2 border border-zinc-300 rounded-lg font-mono font-bold text-zinc-900 bg-white outline-none"
                />
              </div>

              <div>
                <label class="block font-bold text-zinc-700 mb-1">
                  Bagian / Dept <span class="text-red-500">*</span>
                </label>
                <select
                  v-model="formData.bagianDept"
                  required
                  class="w-full px-3 py-2 border border-zinc-300 rounded-lg font-bold text-zinc-900 bg-white outline-none cursor-pointer"
                >
                  <option v-for="d in deptOptions" :key="d" :value="d">{{ d }}</option>
                </select>
              </div>

              <div>
                <label class="block font-bold text-zinc-700 mb-1">Nama Pemohon (Adm/Staff)</label>
                <input
                  v-model="formData.pemohon"
                  type="text"
                  class="w-full px-3 py-2 border border-zinc-300 rounded-lg font-bold text-zinc-900 bg-white outline-none"
                  placeholder="Nama pemohon..."
                />
              </div>
            </div>

            <!-- Tabel Dinamis Rincian Barang Diminta -->
            <div class="space-y-2">
              <div class="flex items-center justify-between pb-1">
                <span class="font-black text-zinc-800 uppercase tracking-wide text-[11px] flex items-center gap-1.5">
                  <svg class="w-3.5 h-3.5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"/></svg>
                  <span>Daftar Barang yang Diminta ke Gudang</span>
                </span>
                <span class="text-[10.5px] text-zinc-500">
                  Total <strong>{{ formData.items.length }}</strong> Item Baris
                </span>
              </div>

              <div class="border border-zinc-200 rounded-xl overflow-hidden bg-white shadow-2xs">
                <table class="w-full text-left text-xs border-collapse">
                  <thead class="bg-zinc-100 text-zinc-700 font-bold uppercase text-[10px] tracking-wider border-b border-zinc-200">
                    <tr>
                      <th class="px-3 py-2.5 text-center w-10">No</th>
                      <th class="px-3 py-2.5">Nama Barang (Auto Suggestion)</th>
                      <th class="px-3 py-2.5 w-24">Jumlah</th>
                      <th class="px-3 py-2.5 w-28">Satuan</th>
                      <th class="px-3 py-2.5">Keterangan / Alokasi</th>
                      <th class="px-2 py-2.5 text-center w-10">Aksi</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-zinc-100">
                    <tr v-for="(it, idx) in formData.items" :key="idx" class="hover:bg-zinc-50/50">
                      <td class="px-3 py-2 text-center font-bold text-zinc-400 font-mono">
                        {{ idx + 1 }}
                      </td>
                      <td class="px-3 py-2">
                        <!-- Input Nama Barang dengan HTML5 Datalist Autocomplete dari Riwayat -->
                        <div class="relative">
                          <input
                            v-model="it.namaBarang"
                            type="text"
                            required
                            list="fpb-item-suggestions"
                            @change="onItemNameSelected(it)"
                            class="w-full px-2.5 py-1.5 border border-zinc-300 rounded-lg text-xs font-bold text-zinc-900 bg-white focus:ring-1 focus:ring-red-600 outline-none"
                            placeholder="Ketik atau pilih nama barang..."
                          />
                        </div>
                      </td>
                      <td class="px-3 py-2">
                        <input
                          v-model="it.qty"
                          type="number"
                          step="any"
                          required
                          min="0.01"
                          class="w-full px-2 py-1.5 border border-zinc-300 rounded-lg text-xs font-mono font-black text-center text-zinc-900 bg-white outline-none focus:ring-1 focus:ring-red-600"
                          placeholder="1"
                        />
                      </td>
                      <td class="px-3 py-2">
                        <!-- Satuan Dropdown / Input -->
                        <input
                          v-model="it.satuan"
                          type="text"
                          required
                          list="fpb-satuan-list"
                          class="w-full px-2 py-1.5 border border-zinc-300 rounded-lg text-xs font-bold text-center text-zinc-900 bg-white outline-none focus:ring-1 focus:ring-red-600"
                          placeholder="Roll"
                        />
                      </td>
                      <td class="px-3 py-2">
                        <input
                          v-model="it.keterangan"
                          type="text"
                          class="w-full px-2.5 py-1.5 border border-zinc-300 rounded-lg text-xs text-zinc-800 bg-white outline-none focus:ring-1 focus:ring-red-600"
                          placeholder="Contoh: Mesin Slitting 02 / Packing..."
                        />
                      </td>
                      <td class="px-2 py-2 text-center">
                        <button
                          type="button"
                          @click="removeItemRow(idx)"
                          :disabled="formData.items.length <= 1"
                          class="p-1 text-zinc-400 hover:text-red-600 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                          title="Hapus Baris"
                        >
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Tombol Tambah Baris -->
              <div class="pt-1 flex items-center justify-between">
                <button
                  type="button"
                  @click="addItemRow"
                  class="px-3 py-1.5 rounded-lg text-xs font-bold bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border border-zinc-300 flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <svg class="w-3.5 h-3.5 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/></svg>
                  <span>+ Tambah Baris Barang</span>
                </button>
              </div>
            </div>

            <!-- Footer Actions -->
            <div class="pt-4 border-t border-zinc-200 flex items-center justify-end gap-2.5">
              <button
                type="button"
                @click="showFormModal = false"
                class="px-4 py-2 rounded-xl text-xs font-bold text-zinc-600 bg-zinc-100 hover:bg-zinc-200 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                @click="handleSaveAndPrint"
                class="px-4 py-2 rounded-xl text-xs font-black text-red-700 bg-red-50 hover:bg-red-100 border border-red-300 flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
                <span>Simpan & Langsung Cetak</span>
              </button>
              <button
                type="submit"
                class="px-6 py-2 rounded-xl text-xs font-black text-white bg-red-600 hover:bg-red-700 shadow-md shadow-red-600/20 flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
                <span>Simpan Dokumen FPB</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </teleport>

    <!-- Datalist Autocomplete Suggestions -->
    <datalist id="fpb-item-suggestions">
      <option
        v-for="(sug, sIdx) in fpbStore.itemSuggestions"
        :key="sIdx"
        :value="sug.namaBarang"
      >
        {{ sug.satuanDefault ? `(Satuan: ${sug.satuanDefault})` : '' }}
      </option>
    </datalist>

    <datalist id="fpb-satuan-list">
      <option value="Roll" />
      <option value="Pcs" />
      <option value="Kg" />
      <option value="Box" />
      <option value="Pack" />
      <option value="Lembar" />
      <option value="Meter" />
      <option value="Tube" />
      <option value="Kaleng" />
      <option value="Liter" />
      <option value="Pasang" />
    </datalist>

    <!-- Modal Pratinjau Cetak FPB -->
    <FpbPrintModal
      v-model="showPrintModal"
      :fpb-data="currentPrintFpb"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useFpbStore } from '@/stores/fpbStore';
import { useAuthStore } from '@/stores/authStore';
import FpbPrintModal from '@/components/fpb/FpbPrintModal.vue';
import FpbAnalyticsSheet from '@/components/fpb/FpbAnalyticsSheet.vue';

const fpbStore = useFpbStore();
const authStore = useAuthStore();

// State Tab Utama: DOCUMENTS (Daftar Form FPB) vs ANALYTICS (Sheet Analitik Permintaan Item)
const activeMainTab = ref('DOCUMENTS');

// Options Departemen Resmi FPB
const deptOptions = [
  'casting',
  'metalize',
  'slitting',
  'rewind',
  'data entry',
  'warehouse film',
  'qc',
  'maintenance'
];

// State Filter & Search
const searchQuery = ref('');
const selectedStatusFilter = ref('ALL');
const selectedDeptFilter = ref('ALL');

// State Modal Form
const showFormModal = ref(false);
const isEditing = ref(false);
const formData = reactive({
  id: null,
  uuid: '',
  nomorFpb: '',
  tanggal: '',
  bagianDept: 'slitting',
  pemohon: '',
  status: 'PENDING',
  items: []
});

// State Checklist / Seleksi Batch Print FPB
const selectedFpbIds = ref([]);

const isRowSelected = (id) => selectedFpbIds.value.includes(id);

const toggleRowSelection = (id) => {
  const idx = selectedFpbIds.value.indexOf(id);
  if (idx > -1) {
    selectedFpbIds.value.splice(idx, 1);
  } else {
    selectedFpbIds.value.push(id);
  }
};

const isAllSelected = computed(() => {
  if (filteredFpbList.value.length === 0) return false;
  return filteredFpbList.value.every(r => selectedFpbIds.value.includes(r.id));
});

const isIndeterminate = computed(() => {
  const selectedCountInFiltered = filteredFpbList.value.filter(r => selectedFpbIds.value.includes(r.id)).length;
  return selectedCountInFiltered > 0 && selectedCountInFiltered < filteredFpbList.value.length;
});

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    // Uncheck semua yang ada di filtered
    const filteredIds = new Set(filteredFpbList.value.map(r => r.id));
    selectedFpbIds.value = selectedFpbIds.value.filter(id => !filteredIds.has(id));
  } else {
    // Check semua yang ada di filtered
    const currentSet = new Set(selectedFpbIds.value);
    filteredFpbList.value.forEach(r => currentSet.add(r.id));
    selectedFpbIds.value = Array.from(currentSet);
  }
};

// State Modal Cetak
const showPrintModal = ref(false);
const currentPrintFpb = ref(null); // Bisa berupa single object atau array of objects

onMounted(async () => {
  await fpbStore.loadItemSuggestions();
  await fpbStore.loadFpbList();
});

// Computed Stats
const pendingCount = computed(() => fpbStore.fpbList.filter(r => r.status === 'PENDING').length);
const inProgressCount = computed(() => fpbStore.fpbList.filter(r => r.status === 'PROCESS').length);
const doneCount = computed(() => fpbStore.fpbList.filter(r => r.status === 'DONE').length);

// Computed Filtered List
const filteredFpbList = computed(() => {
  let list = fpbStore.fpbList;
  if (selectedStatusFilter.value !== 'ALL') {
    list = list.filter(r => r.status === selectedStatusFilter.value);
  }
  if (selectedDeptFilter.value !== 'ALL') {
    list = list.filter(r => r.bagianDept === selectedDeptFilter.value);
  }
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase();
    list = list.filter(r => {
      const matchNo = (r.nomorFpb || '').toLowerCase().includes(q);
      const matchDept = (r.bagianDept || '').toLowerCase().includes(q);
      const matchPemohon = (r.pemohon || '').toLowerCase().includes(q);
      const matchItem = (r.items || []).some(it => (it.namaBarang || '').toLowerCase().includes(q));
      return matchNo || matchDept || matchPemohon || matchItem;
    });
  }
  return list;
});

// Handler Buka Modal Tambah FPB
const openAddModal = async () => {
  isEditing.value = false;
  const nowStr = new Date().toISOString().slice(0, 10);
  
  // Tentukan nama pemohon default dari sesi login jika ada
  const currentUserName = authStore.currentUser?.name || authStore.currentUser?.username || '';
  
  formData.id = null;
  formData.uuid = '';
  formData.nomorFpb = await fpbStore.generateNomorFpb('SLT');
  formData.tanggal = nowStr;
  formData.bagianDept = 'slitting';
  formData.pemohon = currentUserName;
  formData.status = 'PENDING';
  formData.items = [
    { namaBarang: '', qty: '', satuan: 'Roll', keterangan: '' }
  ];

  showFormModal.value = true;
};

// Handler Buka Modal Edit FPB
const openEditModal = (record) => {
  isEditing.value = true;
  formData.id = record.id;
  formData.uuid = record.uuid;
  formData.nomorFpb = record.nomorFpb;
  formData.tanggal = record.tanggal;
  formData.bagianDept = record.bagianDept || 'Produksi';
  formData.pemohon = record.pemohon || '';
  formData.status = record.status || 'PENDING';
  formData.items = Array.isArray(record.items) && record.items.length > 0
    ? JSON.parse(JSON.stringify(record.items))
    : [{ namaBarang: '', qty: '', satuan: 'Roll', keterangan: '' }];

  showFormModal.value = true;
};

// Auto apply satuan default saat nama barang dipilih dari autocomplete
const onItemNameSelected = (itemRow) => {
  if (!itemRow.namaBarang) return;
  const found = fpbStore.itemSuggestions.find(s => s.namaBarang.toLowerCase() === itemRow.namaBarang.trim().toLowerCase());
  if (found && found.satuanDefault && !itemRow.satuan) {
    itemRow.satuan = found.satuanDefault;
  }
};

const addItemRow = () => {
  formData.items.push({
    namaBarang: '',
    qty: '',
    satuan: 'Roll',
    keterangan: ''
  });
};

const removeItemRow = (idx) => {
  if (formData.items.length <= 1) return;
  formData.items.splice(idx, 1);
};

// Simpan Dokumen Form FPB
const handleSaveForm = async () => {
  if (!formData.items || formData.items.length === 0) {
    alert('Harap isi minimal 1 barang pada daftar FPB!');
    return;
  }

  const validItems = formData.items.filter(it => it.namaBarang && it.namaBarang.trim() !== '');
  if (validItems.length === 0) {
    alert('Harap isi nama barang yang diminta!');
    return;
  }

  const res = await fpbStore.saveFpb({
    id: formData.id,
    uuid: formData.uuid,
    nomorFpb: formData.nomorFpb,
    tanggal: formData.tanggal,
    bagianDept: formData.bagianDept,
    pemohon: formData.pemohon,
    status: formData.status,
    items: validItems
  });

  if (res.success) {
    showFormModal.value = false;
  } else {
    alert('Gagal menyimpan FPB: ' + res.error);
  }
};

// Simpan & Langsung Buka Cetak
const handleSaveAndPrint = async () => {
  const validItems = formData.items.filter(it => it.namaBarang && it.namaBarang.trim() !== '');
  if (validItems.length === 0) {
    alert('Harap isi nama barang yang diminta!');
    return;
  }

  const res = await fpbStore.saveFpb({
    id: formData.id,
    uuid: formData.uuid,
    nomorFpb: formData.nomorFpb,
    tanggal: formData.tanggal,
    bagianDept: formData.bagianDept,
    pemohon: formData.pemohon,
    status: formData.status,
    items: validItems
  });

  if (res.success) {
    showFormModal.value = false;
    currentPrintFpb.value = {
      ...res.record,
      items: validItems
    };
    showPrintModal.value = true;
  }
};

// Buka Pratinjau Cetak Satuan (1 FPB = Hanya 1 yang dicetak)
const openPrintPreview = (row) => {
  currentPrintFpb.value = row;
  showPrintModal.value = true;
};

// Buka Pratinjau Cetak Terpilih (Batch Print untuk dokumen yang dichecklist)
const openBatchPrintPreview = () => {
  if (selectedFpbIds.value.length === 0) return;
  const selectedDocs = fpbStore.fpbList.filter(r => selectedFpbIds.value.includes(r.id));
  if (selectedDocs.length === 0) return;
  currentPrintFpb.value = selectedDocs;
  showPrintModal.value = true;
};

// Update Cepat Status Follow-Up
const onStatusChange = async (id, newStatus) => {
  await fpbStore.updateFpbStatus(id, newStatus);
};

// Hapus Dokumen FPB
const handleDelete = async (id, nomor) => {
  if (!confirm(`Yakin ingin menghapus dokumen FPB "${nomor}"?`)) return;
  await fpbStore.deleteFpb(id);
  selectedFpbIds.value = selectedFpbIds.value.filter(selId => selId !== id);
};
</script>
