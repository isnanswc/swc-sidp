<template>
  <div
    v-if="modelValue"
    class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in"
    @click="closeModal"
  >
    <div
      class="bg-white rounded-2xl shadow-2xl max-w-5xl w-full p-4 sm:p-5 flex flex-col max-h-[96vh]"
      @click.stop
    >
      <!-- Modal Header -->
      <div class="flex items-center justify-between pb-2.5 border-b border-slate-100 shrink-0">
        <div class="flex items-center gap-2">
          <span class="text-lg">🏷️</span>
          <h3 class="text-base font-black text-slate-900">
            {{ isEditing ? 'Edit Data Label' : 'Tambah Data Label' }}
          </h3>
        </div>
        <button
          @click="closeModal"
          class="text-slate-400 hover:text-slate-600 font-bold text-lg p-1 cursor-pointer"
        >
          ✕
        </button>
      </div>

      <!-- Modal Form Body (Ultra-Compact 4-Zone Color Palette, Zero-Scroll on Standard Displays) -->
      <form @submit.prevent="$emit('submit')" class="mt-2 space-y-2 overflow-y-auto pr-0.5 flex-1 text-xs">
        
        <!-- 1. MASTER LOT & SPESIFIKASI BAHAN (SOFT SKY BLUE PALETTE) -->
        <div class="p-2 sm:p-2.5 bg-sky-50/75 rounded-xl border border-sky-200/80 shadow-2xs space-y-1.5">
          <div class="flex items-center justify-between pb-1 border-b border-sky-200/60">
            <div class="flex items-center gap-1.5">
              <span class="w-4 h-4 rounded-full bg-sky-600 text-white font-black text-[9px] flex items-center justify-center">1</span>
              <h4 class="font-extrabold text-sky-950 uppercase tracking-wide text-[11px]">Master Lot & Identitas Bahan</h4>
            </div>
            <span class="text-[9.5px] text-sky-700 font-medium">Acuan Stok WIP Jumbo</span>
          </div>

          <!-- Baris No Lot Utama & Rekomendasi WIP -->
          <div class="grid grid-cols-1 md:grid-cols-12 gap-2 items-start">
            <div class="md:col-span-6 relative">
              <label class="block font-bold text-sky-950 mb-0.5 text-[11px]">
                No Lot WIP <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <input
                  v-model="form.lot"
                  @input="handleLotInput"
                  required
                  placeholder="Contoh: M01240826C101"
                  :class="[
                    'w-full px-2.5 py-1 text-xs border rounded-lg bg-white font-mono font-bold outline-none uppercase shadow-2xs transition-all',
                    lotMismatch ? 'border-red-500 bg-red-50 text-red-700 ring-1 ring-red-500' : 'border-sky-300 focus:border-sky-500 focus:ring-1 focus:ring-sky-500'
                  ]"
                />
                <button
                  v-if="form.lot"
                  type="button"
                  @click="form.lot = ''; selectedWipRoll = null"
                  class="absolute right-2 top-1.5 text-zinc-400 hover:text-zinc-700 text-xs font-bold cursor-pointer"
                  title="Hapus input lot"
                >
                  ✕
                </button>
              </div>

              <!-- Visual Format Preview (Print Preview Formatted Lot) -->
              <div v-if="form.lot" class="mt-1 flex items-center gap-1.5 flex-wrap">
                <span class="text-[9.5px] text-sky-800 font-bold">Visual Label:</span>
                <span class="font-mono font-bold text-[10px] bg-white text-sky-950 px-1.5 py-0.2 rounded border border-sky-300 shadow-2xs">
                  {{ formatLotVisual(form.lot, form.supplier) }}
                </span>
              </div>

              <!-- Tombol Rekomendasi (HANYA MUNCUL JIKA LOT TERDAFTAR / COCOK DI WIP) -->
              <div v-if="hasWipRecommendations" class="mt-1 flex items-center justify-between gap-1 flex-wrap animate-fade-in">
                <button
                  type="button"
                  @click="openWipModal"
                  class="w-full text-[10.5px] font-black text-sky-900 hover:text-white bg-sky-100 hover:bg-sky-600 border border-sky-300 hover:border-sky-700 px-2 py-0.5 rounded-lg flex items-center justify-between transition-all cursor-pointer shadow-xs"
                  title="Klik untuk membuka tabel rekomendasi roll WIP yang cocok"
                >
                  <span class="flex items-center gap-1">
                    <span>💡</span>
                    <span>Rekomendasi WIP (<strong>{{ wipMatchedRolls.length }} Roll</strong>)</span>
                  </span>
                  <span class="text-[9.5px] font-mono bg-sky-200 text-sky-950 px-1 py-0.2 rounded font-bold">Buka Tabel ➔</span>
                </button>
              </div>

              <!-- Warning Kecil Jika No Lot Tidak Terdaftar di WIP -->
              <p
                v-if="isLotUnregisteredInWip"
                class="text-[10px] text-amber-800 font-semibold mt-0.5 bg-amber-50 border border-amber-300 px-1.5 py-0.5 rounded flex items-start gap-1 leading-tight animate-fade-in"
              >
                <span class="text-[11px] shrink-0">⚠️</span>
                <span>No. Lot <strong>{{ form.lot }}</strong> tidak terdaftar di Stok WIP Jumbo Aktif.</span>
              </p>

              <p v-if="lotMismatch" class="text-[9.5px] text-red-600 mt-0.5 leading-tight font-medium">
                3 huruf awal (<strong>{{ form.lot.substring(0, 3) }}</strong>) ≠ formula (Khusus INHOUSE).
              </p>
            </div>

            <div class="md:col-span-3">
              <label class="block font-bold text-sky-950 mb-0.5 text-[11px]">Formula (Kode Film) <span class="text-red-500">*</span></label>
              <input
                v-model="form.kode"
                @input="$emit('handle-formula-input')"
                required
                placeholder="M01"
                :class="[
                  'w-full px-2 py-1 text-xs border rounded-lg bg-white font-mono font-bold outline-none uppercase shadow-2xs',
                  lotMismatch ? 'border-red-500 bg-red-50 text-red-700 ring-1 ring-red-500' : 'border-sky-300 focus:ring-1 focus:ring-sky-500'
                ]"
              />
              <div v-if="selectedKodeInfo" class="mt-0.5 px-1 py-0.2 bg-white border border-sky-200 rounded flex items-center justify-between gap-1">
                <span class="text-[9px] text-sky-800 font-medium truncate">{{ selectedKodeInfo.keterangan || selectedKodeInfo.tipeBahan }}</span>
                <span class="text-[9px] font-black text-sky-950 shrink-0">ρ {{ selectedKodeInfo.density }}</span>
              </div>
            </div>

            <div class="md:col-span-3">
              <label class="block font-bold text-sky-950 mb-0.5 text-[11px]">No. SPK <span class="text-red-500">*</span></label>
              <input
                v-model="form.spk"
                required
                placeholder="No. SPK"
                class="w-full px-2 py-1 text-xs border border-sky-300 rounded-lg outline-none bg-white font-mono font-semibold focus:ring-1 focus:ring-sky-500 shadow-2xs"
              />
            </div>
          </div>

          <!-- Baris Supplier, Jenis, Type -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-2 pt-0.5">
            <div>
              <label class="block font-bold text-sky-950 mb-0.5 text-[11px]">Supplier <span class="text-slate-400 font-normal">(Tanpa Spasi)</span></label>
              <input
                v-model="form.supplier"
                @input="form.supplier = (form.supplier || '').replace(/\s+/g, '').toUpperCase(); syncFormulaConfigs()"
                placeholder="INHOUSE / Vendor..."
                class="w-full px-2 py-1 text-xs border border-sky-300 rounded-lg outline-none bg-white font-medium focus:ring-1 focus:ring-sky-500 font-mono uppercase"
              />
            </div>
            <div>
              <label class="block font-bold text-sky-950 mb-0.5 text-[11px]">Jenis Film <span class="text-red-500">*</span></label>
              <select v-model="form.jenis" @change="$emit('handle-jenis-change')" required class="w-full px-2 py-1 text-xs border border-sky-300 rounded-lg outline-none bg-white font-bold">
                <option value="">— Pilih Jenis —</option>
                <option v-for="j in jenisOptions" :key="j" :value="j">{{ j }}</option>
              </select>
            </div>
            <div>
              <label class="block font-bold text-sky-950 mb-0.5 text-[11px]">Type <span class="text-red-500">*</span></label>
              <select v-model="form.type" @change="$emit('handle-type-change')" required class="w-full px-2 py-1 text-xs border border-sky-300 rounded-lg outline-none bg-white font-medium">
                <option v-for="jb in jenisBahanOptions" :key="jb" :value="jb.toUpperCase()">{{ jb.toUpperCase() }}</option>
              </select>
            </div>
          </div>
        </div>

        <!-- 2. OPERASIONAL MESIN & TURUNAN (SOFT INDIGO PALETTE) -->
        <div class="p-2 sm:p-2.5 bg-indigo-50/75 rounded-xl border border-indigo-200/80 shadow-2xs space-y-1.5">
          <div class="flex items-center justify-between pb-1 border-b border-indigo-200/60">
            <div class="flex items-center gap-1.5">
              <span class="w-4 h-4 rounded-full bg-indigo-600 text-white font-black text-[9px] flex items-center justify-center">2</span>
              <h4 class="font-extrabold text-indigo-950 uppercase tracking-wide text-[11px]">Operasional Mesin & Turunan</h4>
            </div>
            <span class="text-[9.5px] text-indigo-700 font-medium">Pelaksana & Pisau Slitting</span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
            <!-- Mesin -->
            <div>
              <label class="block font-bold text-indigo-950 mb-0.5 text-[11px]">Mesin Produksi <span class="text-red-500">*</span></label>
              <select v-model="form.mesin" @change="$emit('update-auto-fields')" required class="w-full px-2 py-1 text-xs border border-indigo-300 rounded-lg outline-none bg-white font-bold text-indigo-900">
                <option v-for="m in mesinOptions" :key="m" :value="m">{{ m }}</option>
              </select>
            </div>

            <!-- Turunan dengan Chartingan ABCD -->
            <div>
              <div class="flex items-center justify-between mb-0.5">
                <label class="font-bold text-indigo-950 text-[11px]">Turunan <span class="text-red-500">*</span></label>
                <div class="flex items-center gap-0.5 text-[9.5px]">
                  <button
                    v-for="ch in activeChartinganList"
                    :key="ch"
                    type="button"
                    @click="$emit('apply-chartingan', ch)"
                    :class="[
                      'px-1.5 py-0.2 rounded font-mono font-bold text-[9.5px] transition-colors uppercase cursor-pointer shadow-2xs',
                      parseTurunan(form.turunan).chartingan === ch
                        ? 'bg-red-600 text-white shadow-xs'
                        : 'bg-white hover:bg-zinc-200 text-zinc-700 border border-indigo-200'
                    ]"
                    :title="`Ubah chartingan ke ${ch}`"
                  >
                    {{ ch }}
                  </button>
                  <button
                    type="button"
                    @click="$emit('advance-turunan')"
                    class="px-1.5 py-0.2 rounded bg-zinc-900 hover:bg-black text-white text-[9px] font-bold cursor-pointer"
                    title="Auto-complete ke no urut berikutnya"
                  >
                    ➔
                  </button>
                </div>
              </div>

              <input
                v-model="form.turunan"
                @input="form.turunan = (form.turunan || '').toUpperCase()"
                required
                placeholder="HA01"
                class="w-full px-2 py-1 text-xs border border-indigo-300 rounded-lg bg-white font-mono font-bold text-red-600 outline-none uppercase focus:ring-1 focus:ring-red-500"
              />

              <div v-if="previousInfo.turunan" class="text-[9.5px] text-zinc-500 italic mt-0.5 flex items-center justify-between">
                <span>Sebelumnya: <strong class="font-mono text-zinc-800 not-italic">{{ previousInfo.turunan }}</strong></span>
                <span v-if="form.turunan !== previousInfo.initialSuggestedTurunan" class="text-[9px] text-amber-600 font-bold not-italic">✏️ Diubah</span>
              </div>
            </div>

            <!-- Operator -->
            <div>
              <div class="flex items-center justify-between mb-0.5">
                <label class="font-bold text-indigo-950 text-[11px]">Operator</label>
                <span
                  v-if="detectedOperator"
                  class="text-[9px] font-black px-1.5 rounded uppercase"
                  :class="detectedOperator.active !== false ? 'bg-emerald-100 text-emerald-800' : 'bg-zinc-200 text-zinc-600'"
                >
                  {{ detectedOperator.nama }}
                </span>
              </div>

              <select
                :value="selectedOperatorId"
                @change="onOperatorSelectInternal($event.target.value)"
                class="w-full px-2 py-1 text-xs border border-indigo-300 rounded-lg font-bold text-zinc-800 bg-white focus:ring-1 focus:ring-indigo-500 outline-none"
              >
                <option value="" disabled>-- Operator {{ form.mesin }} --</option>
                <option
                  v-for="op in machineOperators"
                  :key="op.id"
                  :value="op.id"
                >
                  [{{ op.kodeOperator }}] {{ op.nama }} {{ op.active === false ? '(Non-aktif)' : '' }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <!-- 3. DIMENSI, PANJANG & KONDISI JOIN (SOFT EMERALD PALETTE) -->
        <div class="p-2 sm:p-2.5 bg-emerald-50/75 rounded-xl border border-emerald-200/80 shadow-2xs space-y-1.5">
          <div class="flex items-center justify-between pb-1 border-b border-emerald-200/60">
            <div class="flex items-center gap-1.5">
              <span class="w-4 h-4 rounded-full bg-emerald-600 text-white font-black text-[9px] flex items-center justify-center">3</span>
              <h4 class="font-extrabold text-emerald-950 uppercase tracking-wide text-[11px]">Dimensi, Panjang & Kondisi Join</h4>
            </div>
            <span class="text-[9.5px] text-emerald-700 font-medium">Panjang & Sambungan (Tab Keyboard)</span>
          </div>

          <!-- Baris 1: Dimensi & Panjang + Join Terpadu -->
          <div class="grid grid-cols-1 md:grid-cols-5 gap-2">
            <div>
              <label class="block font-bold text-emerald-950 mb-0.5 text-[11px]">Thickness (MC) <span class="text-red-500">*</span></label>
              <input v-model="form.thickness" @input="$emit('update-auto-fields')" required placeholder="18" class="w-full px-2 py-1 text-xs border border-emerald-300 rounded-lg outline-none bg-white font-semibold" />
            </div>
            <div>
              <label class="block font-bold text-emerald-950 mb-0.5 text-[11px]">Width (MM) <span class="text-red-500">*</span></label>
              <input ref="widthInputRef" v-model="form.width" @input="$emit('update-auto-fields')" required placeholder="1000" class="w-full px-2 py-1 text-xs border border-emerald-300 rounded-lg outline-none bg-white font-semibold" />
            </div>
            <div>
              <label class="block font-bold text-emerald-950 mb-0.5 text-[11px]" title="Quantity / Panjang Total Roll">
                Length (m) <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.length"
                @input="$emit('update-auto-fields')"
                required
                placeholder="3000"
                class="w-full px-2 py-1 text-xs border border-emerald-400 rounded-lg outline-none bg-white font-bold text-emerald-900 focus:ring-1 focus:ring-emerald-600"
              />
            </div>
            <div>
              <label class="block font-bold text-emerald-950 mb-0.5 text-[11px]" title="Jumlah sambungan join: 0, 1, 2...">
                Joint (Jml) <span class="text-[9px] font-normal text-zinc-400">(Opsional)</span>
              </label>
              <input v-model="form.joint" placeholder="0" class="w-full px-2 py-1 text-xs border border-emerald-300 rounded-lg outline-none bg-white font-semibold text-center" />
            </div>
            <div>
              <label class="block font-bold text-emerald-950 mb-0.5 text-[11px]" title="Posisi meteran join: misal 5000 atau 3000, 8000">
                Meter Join <span class="text-[9px] font-normal text-zinc-400">(Opsional)</span>
              </label>
              <input v-model="form.meter" placeholder="5000 / 3000, 8000" class="w-full px-2 py-1 text-xs border border-emerald-300 rounded-lg outline-none bg-white font-semibold" />
            </div>
          </div>

          <!-- Baris 2: Hasil Auto Netto, Core, PaperCore, Treatment, OD, Jenis Print -->
          <div class="grid grid-cols-2 md:grid-cols-6 gap-1.5 pt-0.5 border-t border-emerald-200/50">
            <div>
              <label class="block font-bold text-emerald-950 mb-0.5 text-[10.5px]">Netto (kg)</label>
              <input :value="form.netto" readonly placeholder="0.00" class="w-full px-1.5 py-0.5 text-xs border border-emerald-200 rounded-lg bg-emerald-100/60 font-bold text-emerald-950" />
            </div>
            <div>
              <label class="block font-bold text-emerald-950 mb-0.5 text-[10.5px]">Core</label>
              <select
                v-model.number="form.diameterCore"
                @change="$emit('update-auto-fields')"
                class="w-full px-1.5 py-0.5 text-xs border border-emerald-300 rounded-lg bg-white font-bold text-slate-800"
              >
                <option :value="6">6" Standar</option>
                <option :value="3">3" Kecil</option>
              </select>
            </div>
            <div>
              <label class="block font-bold text-emerald-950 mb-0.5 text-[10.5px]">Paper Core</label>
              <input :value="form.paperCore" readonly placeholder="0.00" class="w-full px-1.5 py-0.5 text-xs border border-emerald-200 rounded-lg bg-white font-bold text-slate-800" />
            </div>
            <div>
              <label class="block font-bold text-emerald-950 mb-0.5 text-[10.5px]">Treatment</label>
              <select v-model="form.treatment" class="w-full px-1 py-0.5 text-xs border border-emerald-300 rounded-lg bg-white font-semibold text-zinc-900">
                <option value="INSIDE">INSIDE</option>
                <option value="OUTSIDE">OUTSIDE</option>
                <option value="BOTHSIDE">BOTHSIDE</option>
                <option value="NON-TREATMENT">NON-TREATMENT</option>
              </select>
            </div>
            <div>
              <label class="block font-bold text-emerald-950 mb-0.5 text-[10.5px]">OD + Plasma</label>
              <input v-model="form.od" :placeholder="form.type === 'METALIZED' ? 'OD2.4+PLASMA' : '-'" class="w-full px-1.5 py-0.5 text-xs border border-emerald-300 rounded-lg bg-white font-mono text-red-600 font-bold" />
            </div>
            <div>
              <label class="block font-bold text-emerald-950 mb-0.5 text-[10.5px]">Jenis Print</label>
              <select v-model="form.jenisPrint" class="w-full px-1 py-0.5 text-xs border border-emerald-300 rounded-lg bg-white font-semibold">
                <option value="FINISH GOODS">FINISH GOODS</option>
                <option value="B-GRADE">B-GRADE</option>
              </select>
            </div>
          </div>
        </div>

        <!-- 4. IDENTITAS PACK & KETERANGAN / REKOMENDASI AI (SOFT AMBER PALETTE) -->
        <div class="p-2 sm:p-2.5 bg-amber-50/75 rounded-xl border border-amber-200/80 shadow-2xs space-y-1.5">
          <div class="flex items-center justify-between pb-1 border-b border-amber-200/60">
            <div class="flex items-center gap-1.5">
              <span class="w-4 h-4 rounded-full bg-amber-600 text-white font-black text-[9px] flex items-center justify-center">4</span>
              <h4 class="font-extrabold text-amber-950 uppercase tracking-wide text-[11px]">Identitas Pack & Keterangan</h4>
            </div>
            <span class="text-[9.5px] text-amber-800 font-medium">Validasi Unik & Alasan Hold/Reject</span>
          </div>

          <!-- Baris 1: Tgl Shift, Manual, Kode Pack, Sub Kode Pack -->
          <div class="grid grid-cols-1 md:grid-cols-12 gap-2 items-start">
            <div class="md:col-span-2">
              <label class="block font-bold text-amber-950 mb-0.5 text-[10.5px]">Tgl Shift (07:00)</label>
              <input :value="form.tanggalShift" readonly class="w-full px-1.5 py-0.5 text-[11px] border border-amber-200 rounded-lg bg-white font-medium" />
            </div>
            <div class="md:col-span-2">
              <label class="block font-bold text-amber-950 mb-0.5 text-[10.5px]">Tgl Manual</label>
              <input v-model="form.tanggalManual" type="date" @change="$emit('update-auto-fields')" class="w-full px-1 py-0.5 text-[11px] border border-amber-300 rounded-lg bg-white" />
            </div>
            <div class="md:col-span-2">
              <label class="block font-bold text-amber-950 mb-0.5 text-[10.5px]">Kode Pack</label>
              <input :value="form.kodePack" readonly class="w-full px-1.5 py-0.5 text-xs border border-amber-200 rounded-lg bg-white font-mono font-bold text-zinc-800" />
            </div>

            <!-- Sub Kode Pack -->
            <div class="md:col-span-6">
              <label class="block font-bold text-amber-950 mb-0.5 text-[10.5px]">Status & Sub Kode Pack</label>
              <div class="flex items-center gap-1.5 pt-0.2 flex-wrap">
                <label class="inline-flex items-center gap-1 cursor-pointer bg-white px-1.5 py-0.5 border border-amber-300 rounded-lg shadow-2xs">
                  <input type="radio" value="numeric" v-model="form.subKodeType" @change="$emit('handle-sub-kode')" />
                  <span class="font-bold text-emerald-700 text-[11px]">PASS:</span>
                  <input
                    v-model="form.subKodeNumeric"
                    @input="$emit('handle-sub-kode')"
                    :required="form.subKodeType === 'numeric'"
                    maxlength="4"
                    placeholder="0001"
                    :class="[
                      'w-14 px-1 py-0.2 border rounded text-xs text-center font-mono font-bold outline-none shadow-inner',
                      subKodeValidation.isDuplicate ? 'border-red-500 bg-red-50 text-red-700 ring-1 ring-red-500' :
                      subKodeValidation.isSkipped ? 'border-amber-400 bg-amber-50 text-amber-900 ring-1 ring-amber-400' :
                      'border-slate-300'
                    ]"
                  />
                </label>
                <label class="inline-flex items-center gap-1 cursor-pointer bg-white px-2 py-1 border border-amber-300 rounded-lg shadow-2xs">
                  <input type="radio" value="hold" v-model="form.subKodeType" @change="$emit('handle-sub-kode')" />
                  <span class="text-amber-700 font-bold text-[11px]">HOLD</span>
                </label>
                <label class="inline-flex items-center gap-1 cursor-pointer bg-white px-2 py-1 border border-amber-300 rounded-lg shadow-2xs">
                  <input type="radio" value="reject" v-model="form.subKodeType" @change="$emit('handle-sub-kode')" />
                  <span class="text-red-600 font-bold text-[11px]">REJECT</span>
                </label>
              </div>

              <!-- Warning Double / Lompat -->
              <p
                v-if="subKodeValidation.isDuplicate"
                class="text-[9.5px] font-bold text-red-600 mt-0.5 bg-red-50 border border-red-200 px-1.5 py-0.2 rounded leading-tight animate-fade-in"
              >
                {{ subKodeValidation.message }}
              </p>
              <p
                v-else-if="subKodeValidation.isSkipped"
                class="text-[9.5px] font-bold text-amber-800 mt-0.5 bg-amber-50 border border-amber-300 px-1.5 py-0.2 rounded leading-tight animate-fade-in"
              >
                {{ subKodeValidation.message }}
              </p>
            </div>
          </div>

          <!-- Baris 2: Keterangan Cerdas / Alasan Hold/Reject + Dynamic AI Quick Tags -->
          <div class="pt-0.5">
            <div class="flex items-center justify-between mb-0.5">
              <label class="font-bold flex items-center gap-1.5 text-[11px] text-amber-950">
                <span>Keterangan / Alasan Defect:</span>
                <span
                  v-if="form.subKodeType === 'hold'"
                  class="px-1.5 py-0.2 rounded-full bg-amber-100 border border-amber-300 text-amber-800 font-black text-[9.5px] animate-pulse"
                >
                  ⚠️ Alasan HOLD Diperlukan
                </span>
                <span
                  v-else-if="form.subKodeType === 'reject'"
                  class="px-1.5 py-0.2 rounded-full bg-red-100 border border-red-300 text-red-800 font-black text-[9.5px] animate-pulse"
                >
                  ⚠️ Alasan REJECT Diperlukan
                </span>
              </label>

              <span class="text-[9.5px] text-amber-800 font-medium hidden md:inline">
                🤖 Rekomendasi Tag Cepat AI (Klik untuk isi otomatis):
              </span>
            </div>

            <input
              v-model="form.keterangan"
              :placeholder="
                form.subKodeType === 'hold' ? 'Masukkan alasan HOLD (contoh: Kerut, Bintik, Tebal Tidak Rata, Test Lab)...' :
                form.subKodeType === 'reject' ? 'Masukkan alasan REJECT (contoh: Putus Terus, Sobek Parah, Garis Pisau)...' :
                'Catatan opsional...'
              "
              :class="[
                'w-full px-2.5 py-1 text-xs border rounded-lg outline-none transition-all shadow-2xs',
                form.subKodeType === 'hold' ? 'border-amber-400 bg-white text-amber-950 focus:ring-1 focus:ring-amber-500 font-medium' :
                form.subKodeType === 'reject' ? 'border-red-400 bg-white text-red-950 focus:ring-1 focus:ring-red-500 font-medium' :
                'border-amber-300 bg-white focus:ring-1 focus:ring-blue-500'
              ]"
            />

            <!-- Dynamic AI Quick Tag Chips -->
            <div class="flex items-center gap-1 mt-1 flex-wrap">
              <span class="text-[9.5px] text-amber-900 font-bold">Tag AI:</span>
              <button
                v-for="tag in quickTags"
                :key="tag"
                type="button"
                @click="addQuickTag(tag)"
                class="px-1.5 py-0.2 rounded text-[9.5px] font-semibold bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 transition-colors cursor-pointer shadow-2xs"
              >
                + {{ tag }}
              </button>
            </div>
          </div>
        </div>

        <!-- Form Buttons (Always Visible at Bottom) -->
        <div class="flex items-center justify-end gap-2 pt-1.5 border-t border-slate-100 shrink-0">
          <button
            type="button"
            @click="closeModal"
            class="px-4 py-1 rounded-xl text-xs font-bold bg-zinc-100 hover:bg-zinc-200 text-zinc-700 transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="submit"
            class="px-6 py-1 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white shadow-md shadow-red-600/20 transition-all cursor-pointer"
          >
            Simpan
          </button>
        </div>
      </form>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <!-- MODAL BESAR: REKOMENDASI DATA WIP JUMBO (BENTUK LIST TABEL)       -->
    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <teleport to="body">
      <div
        v-if="showWipModal"
        class="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-xs animate-fade-in font-sans"
        @click.self="closeWipModal"
      >
        <div
          class="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-5xl w-full flex flex-col max-h-[92vh] overflow-hidden"
          @click.stop
        >
          <!-- Modal Header -->
          <div class="px-6 py-4 border-b border-slate-200 bg-slate-50/90 flex items-start justify-between gap-3 shrink-0">
            <div>
              <div class="flex items-center gap-2">
                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-100 text-blue-900 border border-blue-300">
                  Rekomendasi WIP Jumbo
                </span>
                <span class="text-xs font-bold text-slate-400">•</span>
                <span class="text-xs font-semibold text-slate-600">Sesuai No. Lot: <strong class="font-mono text-blue-700 font-black">{{ form.lot }}</strong></span>
              </div>
              <h3 class="text-base font-black text-slate-900 tracking-tight mt-0.5 flex items-center gap-2">
                <span>🏭</span> Rekomendasi Roll WIP Jumbo yang Cocok
              </h3>
              <p class="text-xs text-slate-500 mt-0.5">
                Pilih salah satu baris di bawah untuk <strong>mengisi SPK, Formula, Dimensi, dan Berat secara otomatis</strong> ke form Label.
              </p>
            </div>

            <button
              type="button"
              @click="closeWipModal"
              class="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-200/60 transition-colors cursor-pointer"
              title="Abaikan & Tutup Rekomendasi"
            >
              <span class="text-base font-black">✕</span>
            </button>
          </div>

          <!-- Table Body -->
          <div class="p-4 overflow-y-auto flex-1 bg-white space-y-3">
            <div class="overflow-x-auto rounded-2xl border border-slate-200 shadow-xs">
              <table class="w-full text-left text-xs border-collapse">
                <thead>
                  <tr class="bg-slate-100/90 text-slate-700 font-black text-[11px] uppercase tracking-wider border-b border-slate-200">
                    <th class="py-2.5 px-3 text-center w-10">#</th>
                    <th class="py-2.5 px-3">No. Lot WIP</th>
                    <th class="py-2.5 px-3">No. SPK</th>
                    <th class="py-2.5 px-3">Deskripsi Excel (Lengkap)</th>
                    <th class="py-2.5 px-3 text-right">Berat Aktual</th>
                    <th class="py-2.5 px-3">Lokasi / Rak</th>
                    <th class="py-2.5 px-3 text-center">Status</th>
                    <th class="py-2.5 px-3 text-center w-28">Aksi</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  <tr
                    v-for="(wip, idx) in wipMatchedRolls"
                    :key="wip.id || wip.uuid || idx"
                    @click="selectWipRoll(wip)"
                    class="hover:bg-blue-50/70 transition-colors cursor-pointer group"
                  >
                    <td class="py-2.5 px-3 text-center font-bold text-slate-400 font-mono text-[11px]">
                      {{ idx + 1 }}
                    </td>
                    <td class="py-2.5 px-3">
                      <div class="flex items-center gap-1.5">
                        <span class="font-mono font-black text-xs text-blue-700 group-hover:text-blue-900">{{ wip.lot }}</span>
                        <span v-if="idx === 0 && form.lot" class="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[9px] font-black uppercase">Paling Mirip</span>
                      </div>
                    </td>
                    <td class="py-2.5 px-3 font-mono font-bold text-slate-700">
                      {{ wip.spk || '-' }}
                    </td>
                    <td class="py-2.5 px-3">
                      <div class="font-mono font-bold text-slate-800 text-[11.5px] leading-tight">
                        {{ getWipExcelDesc(wip) }}
                      </div>
                    </td>
                    <td class="py-2.5 px-3 text-right font-mono font-black text-emerald-800">
                      {{ formatNumber(wip.beratAktual || wip.beratTeori) }} kg
                    </td>
                    <td class="py-2.5 px-3">
                      <span class="px-2 py-0.5 rounded-md bg-blue-50 text-blue-900 font-bold text-[10px] border border-blue-200">
                        📍 {{ wip.lokasiAktif || 'STAGING' }} {{ wip.posisiAktif ? `(${wip.posisiAktif})` : '' }}
                      </span>
                    </td>
                    <td class="py-2.5 px-3 text-center">
                      <div v-if="getWipAgingInfo(wip).isAging" class="flex flex-col items-center gap-0.5">
                        <span class="px-2 py-0.5 rounded-full text-[9.5px] font-black bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
                          ⏳ {{ getWipAgingInfo(wip).remainingFormatted }}
                        </span>
                        <span class="text-[8.5px] text-zinc-400 font-mono">Target: {{ getWipAgingInfo(wip).targetDateFormatted }}</span>
                      </div>
                      <span
                        v-else
                        class="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-900 border border-emerald-300"
                      >
                        ✅ Siap Pakai
                      </span>
                    </td>
                    <td class="py-2.5 px-3 text-center" @click.stop>
                      <button
                        type="button"
                        @click="selectWipRoll(wip)"
                        class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-black text-[11px] shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center gap-1 justify-center mx-auto"
                      >
                        <span>✓ Pilih</span>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Empty State jika tidak ada yang cocok -->
            <div v-if="wipMatchedRolls.length === 0" class="py-12 text-center text-slate-400">
              <div class="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-2 text-xl">📦</div>
              <p class="font-bold text-slate-700 text-sm">Tidak Ada Roll WIP yang Cocok dengan "{{ form.lot }}"</p>
              <p class="text-xs text-slate-400 mt-0.5">Pastikan nomor lot yang Anda ketik sudah sesuai dengan data di WIP.</p>
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2 shrink-0">
            <span class="text-xs text-slate-500 font-medium">
              Menampilkan <strong>{{ wipMatchedRolls.length }}</strong> roll WIP yang cocok dengan kata kunci No Lot.
            </span>

            <button
              type="button"
              @click="closeWipModal"
              class="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-200 border border-slate-300 transition-colors cursor-pointer"
            >
              ✕ Tutup / Abaikan
            </button>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue';
import { useWipStore } from '@/stores/wipStore';
import { useLabelStore } from '@/stores/labelStore';
import { useConfigStore } from '@/stores/configStore';
import { getActiveQuickTags, DEFAULT_DEFECT_TAGS, formatLotVisual, formatInhouseLotInput } from '@/services/aiAutomationService';
import { getAgingCountdownInfo } from '@/services/wipParserService';

const wipStore = useWipStore();
const labelStore = useLabelStore();
const configStore = useConfigStore();
const showWipModal = ref(false);
const selectedWipRoll = ref(null);
const widthInputRef = ref(null);

const getWipAgingInfo = (roll) => {
  if (!roll) return { isAging: false, remainingFormatted: 'Siap Pakai', targetDateFormatted: '—' };
  return getAgingCountdownInfo(roll.estimasiWaktuAgingRaw || roll.estimasiWaktuAging, roll.waktuAgingRaw || roll.waktuAging);
};

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  isEditing: { type: Boolean, default: false },
  form: { type: Object, required: true },
  mesinOptions: { type: Array, default: () => [] },
  jenisOptions: { type: Array, default: () => [] },
  jenisBahanOptions: { type: Array, default: () => [] },
  kodeFormulaOptions: { type: Array, default: () => [] },
  machineOperators: { type: Array, default: () => [] },
  activeChartinganList: { type: Array, default: () => [] },
  lotMismatch: { type: Boolean, default: false },
  previousInfo: { type: Object, default: () => ({}) },
  selectedKodeInfo: { type: Object, default: null },
  selectedOperatorId: { type: [String, Number], default: '' },
  detectedOperator: { type: Object, default: null },
  detectedPrefix: { type: String, default: '' },
});

const emit = defineEmits([
  'update:modelValue',
  'submit',
  'update-auto-fields',
  'handle-type-change',
  'handle-formula-input',
  'handle-jenis-change',
  'handle-sub-kode',
  'handle-operator-select',
  'apply-chartingan',
  'advance-turunan',
]);

const syncFormulaConfigs = () => {
  if (!props.form.jenis && !props.form.kode) return;

  // Cari konfigurasi film dengan acuan kode formula dulu baru jenis
  let matched = null;
  if (props.form.kode && props.form.jenis) {
    matched = configStore.filmConfigs.find(
      r => r.kodeFormula?.toUpperCase() === props.form.kode?.toUpperCase() && r.jenis?.toUpperCase() === props.form.jenis?.toUpperCase()
    );
  }
  if (!matched && props.form.kode) {
    matched = configStore.filmConfigs.find(
      r => r.kodeFormula?.toUpperCase() === props.form.kode?.toUpperCase()
    );
  }
  if (!matched && props.form.jenis) {
    matched = configStore.filmConfigs.find(
      r => r.jenis?.toUpperCase() === props.form.jenis?.toUpperCase()
    );
  }

  if (matched) {
    if (matched.supplier) {
      props.form.supplier = matched.supplier;
    }
    if (matched.jenisBahan) {
      props.form.type = matched.jenisBahan.toUpperCase();
      emit('handle-type-change');
    }
  }
};

const syncTypeFromFormula = syncFormulaConfigs;

const parseTurunan = (turunanStr) => {
  if (!turunanStr) return { prefix: 'H', chartingan: 'A', noUrut: 1, numDigits: 2 };
  const str = String(turunanStr).trim();
  const match = str.match(/^([A-Za-z]+?)([A-Za-z])(\d+)$/);
  if (match) {
    return {
      prefix: match[1].toUpperCase(),
      chartingan: match[2].toUpperCase(),
      noUrut: parseInt(match[3], 10),
      numDigits: match[3].length
    };
  }
  const matchSimple = str.match(/^([A-Za-z]+)(\d+)$/);
  if (matchSimple) {
    const letters = matchSimple[1].toUpperCase();
    const num = parseInt(matchSimple[2], 10);
    const digits = matchSimple[2].length;
    if (letters.length >= 2) {
      return {
        prefix: letters.substring(0, letters.length - 1),
        chartingan: letters.substring(letters.length - 1),
        noUrut: num,
        numDigits: digits
      };
    }
    return { prefix: letters, chartingan: 'A', noUrut: num, numDigits: digits };
  }
  return { prefix: 'H', chartingan: 'A', noUrut: 1, numDigits: 2 };
};

// Algoritma Kemiripan No Lot (Similarity Ranking)
function computeLotSimilarity(query, target) {
  if (!query || !target) return 0;
  const q = String(query).trim().toUpperCase().replace(/[\/\.\-\s]/g, '');
  const t = String(target).trim().toUpperCase().replace(/[\/\.\-\s]/g, '');
  if (!q || !t) return 0;
  if (q === t) return 1000;
  if (t.startsWith(q)) return 800 + (q.length / t.length) * 100;
  if (t.includes(q)) return 600 + (q.length / t.length) * 100;
  if (q.startsWith(t)) return 500;

  let prefixMatchLen = 0;
  while (prefixMatchLen < q.length && prefixMatchLen < t.length && q[prefixMatchLen] === t[prefixMatchLen]) {
    prefixMatchLen++;
  }

  let maxConsecutive = 0;
  for (let i = 0; i < q.length; i++) {
    for (let j = 0; j < t.length; j++) {
      let k = 0;
      while (i + k < q.length && j + k < t.length && q[i + k] === t[j + k]) {
        k++;
      }
      if (k > maxConsecutive) maxConsecutive = k;
    }
  }

  const matrix = Array.from({ length: q.length + 1 }, () => Array(t.length + 1).fill(0));
  for (let i = 0; i <= q.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= t.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= q.length; i++) {
    for (let j = 1; j <= t.length; j++) {
      const cost = q[i - 1] === t[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  const dist = matrix[q.length][t.length];
  const maxLen = Math.max(q.length, t.length);
  const levScore = Math.max(0, (1 - dist / maxLen) * 300);

  return (prefixMatchLen * 60) + (maxConsecutive * 40) + levScore;
}

const getWipExcelDesc = (wip) => {
  if (!wip) return '-';
  if (wip.descriptionExcel && wip.descriptionExcel.trim()) return wip.descriptionExcel.trim();
  if (wip.descExcel && wip.descExcel.trim()) return wip.descExcel.trim();
  const j = (wip.jenis || '').trim().toUpperCase();
  const f = (wip.kodeFormula || '').trim().toUpperCase();
  const t = (wip.thickness !== undefined && wip.thickness !== null ? String(wip.thickness) : '').trim();
  const w = (wip.width !== undefined && wip.width !== null ? String(wip.width) : '').trim();
  const l = (wip.length !== undefined && wip.length !== null ? String(wip.length) : '').trim();
  const c = (wip.core !== undefined && wip.core !== null && String(wip.core).trim() ? String(wip.core).trim() : '6');
  const rawOd = (wip.od || '').trim();
  const odVal = rawOd ? rawOd : '0';
  const tandaVal = (wip.tanda || '').trim();
  let desc = `${j} ${f} ${t} MC X ${w} MM = ${l} , ${c} INCHI ${odVal}`;
  if (tandaVal) desc += ` ${tandaVal}`;
  return desc.trim();
};

const wipMatchedRolls = computed(() => {
  if (!props.form.lot || props.form.lot.trim().length < 1) return [];
  const q = props.form.lot.trim().toUpperCase().replace(/[\/\.\-\s]/g, '');
  const allRolls = (wipStore.activeWipRolls && wipStore.activeWipRolls.length > 0)
    ? wipStore.activeWipRolls
    : (wipStore.wipRolls || []);
  
  const scored = [];
  for (const r of allRolls) {
    const lotClean = (r.lot || '').trim().toUpperCase().replace(/[\/\.\-\s]/g, '');
    const score = computeLotSimilarity(q, r.lot);
    const isMatch = lotClean.includes(q) ||
                    (q.length >= 2 && lotClean.startsWith(q.substring(0, 2))) ||
                    score >= 120;
    if (isMatch) {
      scored.push({ roll: r, score });
    }
  }

  // Urutkan kemiripan tertinggi di atas
  scored.sort((a, b) => b.score - a.score);
  return scored.map(item => item.roll);
});

const matchedWipRoll = computed(() => {
  if (!props.form.lot || props.form.lot.trim().length < 3) return null;
  const q = props.form.lot.trim().toUpperCase().replace(/[\/\.\s]/g, '');
  const list = (wipStore.activeWipRolls && wipStore.activeWipRolls.length > 0)
    ? wipStore.activeWipRolls
    : (wipStore.wipRolls || []);
  return list.find(r => (r.lot || '').trim().toUpperCase().replace(/[\/\.\s]/g, '') === q);
});

const hasWipRecommendations = computed(() => {
  return props.form.lot && props.form.lot.trim().length >= 2 && wipMatchedRolls.value.length > 0;
});

const isLotUnregisteredInWip = computed(() => {
  if (!props.form.lot || props.form.lot.trim().length < 2) return false;
  return wipMatchedRolls.value.length === 0;
});

const openWipModal = async () => {
  if (!wipStore.wipRolls || wipStore.wipRolls.length === 0) {
    try {
      await wipStore.loadWipRolls();
    } catch (e) {
      console.error(e);
    }
  }
  showWipModal.value = true;
};

const closeWipModal = () => {
  showWipModal.value = false;
};

const onOperatorSelectInternal = (opId) => {
  const op = configStore.operatorList.find(o => String(o.id) === String(opId));
  if (op) {
    props.form.operator = op.nama;
    props.form.kodeOperator = op.kodeOperator;
    if (props.form.turunan) {
      const match = String(props.form.turunan).match(/^([A-Z]+)(\D*)(\d+)$/);
      if (match) {
        props.form.turunan = `${op.kodeOperator}${match[2] || 'A'}${match[3]}`;
      } else {
        props.form.turunan = `${op.kodeOperator}A01`;
      }
    } else {
      props.form.turunan = `${op.kodeOperator}A01`;
    }
  }
  emit('handle-operator-select', opId);
  emit('update-auto-fields');
};

const handleLotInput = () => {
  props.form.lot = formatInhouseLotInput(props.form.lot);
  if (selectedWipRoll.value && selectedWipRoll.value.lot !== props.form.lot) {
    selectedWipRoll.value = null;
  }
};

const selectWipRoll = (roll) => {
  if (!roll) return;
  props.form.lot = (roll.lot || props.form.lot || '').replace(/\s+/g, '').toUpperCase();
  if (roll.spk) props.form.spk = roll.spk;
  if (roll.kodeFormula) props.form.kode = roll.kodeFormula;
  if (roll.jenis) props.form.jenis = roll.jenis;
  if (roll.thickness) props.form.thickness = String(roll.thickness);
  // Width dan Length diisi manual oleh operator (tidak terpengaruh rekomendasi WIP)
  props.form.supplier = (roll.supplier || '').replace(/\s+/g, '').toUpperCase();
  
  syncFormulaConfigs();
  selectedWipRoll.value = roll;
  showWipModal.value = false;
  emit('update-auto-fields');

  // Otomatis lompat ke field Width dengan animasi fokus aktif
  nextTick(() => {
    if (widthInputRef.value) {
      widthInputRef.value.focus?.();
      widthInputRef.value.select?.();
    }
  });
};

const formatNumber = (val) => {
  const num = parseFloat(val);
  return isNaN(num) ? '0' : num.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 2 });
};

const subKodeValidation = computed(() => {
  if (props.form.subKodeType !== 'numeric' || !props.form.subKodeNumeric) {
    return { isDuplicate: false, isSkipped: false, message: '' };
  }

  const rawNum = parseInt(props.form.subKodeNumeric, 10);
  if (isNaN(rawNum) || rawNum <= 0) {
    return { isDuplicate: false, isSkipped: false, message: '' };
  }

  // Toleransi kode khusus kepala 5*** sampai 9*** (5000 s/d 9999)
  if (rawNum >= 5000 && rawNum <= 9999) {
    return { isDuplicate: false, isSkipped: false, message: '' };
  }

  const targetKodePack = (props.form.kodePack || '').trim().toUpperCase();
  const targetMesin = (props.form.mesin || '').trim().toUpperCase();
  const currentId = props.form.id;

  // Filter label lain di database untuk mesin / kode pack yang sama
  const otherLabels = labelStore.labels.filter(l => {
    if (currentId && l.id === currentId) return false;
    const lKodePack = (l.kodePack || '').trim().toUpperCase();
    const lMesin = (l.mesin || '').trim().toUpperCase();
    if (targetKodePack && lKodePack) return lKodePack === targetKodePack;
    if (targetMesin && lMesin) return lMesin === targetMesin;
    return true;
  });

  // 1. Cek DUPLIKAT (Double)
  const isDuplicate = otherLabels.some(l => {
    if (l.status === 'HOLD' || l.status === 'REJECT') return false;
    const lNum = parseInt(l.subKodeNumeric || l.subKode, 10);
    return !isNaN(lNum) && lNum === rawNum;
  });

  if (isDuplicate) {
    return {
      isDuplicate: true,
      isSkipped: false,
      message: `⚠️ No. Pack ${props.form.kodePack}${String(rawNum).padStart(4, '0')} sudah terdaftar di mesin ini (Double)!`
    };
  }

  // 2. Cek LOMPAT (Skip Sequence) di bawah kepala 5 (< 5000)
  let maxRegular = 0;
  for (const l of otherLabels) {
    if (l.status === 'HOLD' || l.status === 'REJECT') continue;
    const lNum = parseInt(l.subKodeNumeric || l.subKode, 10);
    if (!isNaN(lNum) && lNum > 0 && lNum < 5000) {
      if (lNum > maxRegular) maxRegular = lNum;
    }
  }

  const expectedNext = maxRegular > 0 ? maxRegular + 1 : 1;
  if (maxRegular > 0 && rawNum > expectedNext) {
    return {
      isDuplicate: false,
      isSkipped: true,
      message: `⚠️ No. Pack lompat! (Kode Pack terbesar saat ini: ${String(maxRegular).padStart(4, '0')}, Urutan berikutnya yang seharusnya: ${String(expectedNext).padStart(4, '0')})`
    };
  }

  return { isDuplicate: false, isSkipped: false, message: '' };
});

const quickTags = ref([...DEFAULT_DEFECT_TAGS]);

const refreshQuickTags = async () => {
  try {
    const tags = await getActiveQuickTags();
    if (Array.isArray(tags) && tags.length > 0) {
      quickTags.value = tags;
    }
  } catch (e) {
    console.warn('Gagal memuat quickTags di LabelModalForm:', e);
  }
};

onMounted(() => {
  refreshQuickTags();
});

const addQuickTag = (tag) => {
  if (!props.form.keterangan || props.form.keterangan.trim() === '') {
    props.form.keterangan = tag;
  } else if (!props.form.keterangan.includes(tag)) {
    props.form.keterangan = `${props.form.keterangan}, ${tag}`;
  }
};

const closeModal = () => {
  selectedWipRoll.value = null;
  showWipModal.value = false;
  emit('update:modelValue', false);
};
</script>
