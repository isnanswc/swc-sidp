<template>
  <Teleport to="body">
    <!-- 1. INTERACTIVE PREVIEW MODAL (ON-SCREEN ONLY - HIDDEN IN PRINT) -->
    <div
      v-if="isOpen"
      id="slitting-modal-preview"
      class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto no-print"
      @click.self="closeModal"
    >
      <div class="bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-700 w-full max-w-[1280px] max-h-[96vh] flex flex-col overflow-hidden text-zinc-100">
        
        <!-- TOP TOOLBAR -->
        <div class="px-5 py-3.5 bg-zinc-950 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-red-600/20 text-red-400 border border-red-500/30 flex items-center justify-center shrink-0">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="6 9 6 2 18 2 18 9" />
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                <rect x="6" y="14" width="12" height="8" />
              </svg>
            </div>
            <div>
              <div class="flex items-center gap-2 flex-wrap">
                <h2 class="text-sm font-black text-white">
                  Preview Cetak: Laporan Produksi Harian Slitting
                </h2>
                <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-800 text-zinc-300 border border-zinc-700 font-mono">
                  FILM.FM.003
                </span>
                <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  A4 Landscape • {{ paginatedPages.length }} Lembar (Optimal)
                </span>
              </div>
              <p class="text-xs text-zinc-400 font-mono mt-0.5">
                {{ currentMachine }} • {{ formattedDate }} • Shift: <strong class="text-white">{{ activeShiftLabel }}</strong> ({{ shiftFilteredItems.length }} Roll / {{ displayRows.length }} Baris)
              </p>
            </div>
          </div>

          <!-- Controls -->
          <div class="flex items-center gap-2 flex-wrap">
            <!-- 1. PILIH SHIFT / OPERATOR -->
            <div class="flex items-center gap-1.5 text-xs bg-zinc-800 px-2.5 py-1 rounded-xl border border-zinc-700">
              <span class="text-zinc-400 font-medium">Shift / Op:</span>
              <select
                v-model="selectedShiftKey"
                class="bg-zinc-900 text-white font-bold text-xs rounded px-2 py-0.5 border border-zinc-700 outline-none cursor-pointer"
              >
                <option
                  v-for="opt in availableShiftOptions"
                  :key="opt.key"
                  :value="opt.key"
                >
                  {{ opt.label }} ({{ opt.count }} Roll)
                </option>
                <option v-if="availableShiftOptions.length > 1" value="ALL">
                  Semua Shift (Gabungan {{ rawItems.length }} Roll)
                </option>
              </select>
            </div>

            <!-- 2. MODE TAMPILAN: PER ROLL VS GABUNG SET -->
            <div class="flex items-center gap-1 text-xs bg-zinc-800 p-0.5 rounded-xl border border-zinc-700">
              <button
                @click="rowDisplayMode = 'per-roll'"
                :class="[
                  'px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer',
                  rowDisplayMode === 'per-roll' ? 'bg-zinc-950 text-white shadow-xs' : 'text-zinc-400 hover:text-white'
                ]"
                title="Tampilkan 1 baris per roll dengan kode turunan asli (IA01, GC03, dll)"
              >
                Per Roll (IA01, GC03)
              </button>
              <button
                @click="rowDisplayMode = 'group-set'"
                :class="[
                  'px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer',
                  rowDisplayMode === 'group-set' ? 'bg-zinc-950 text-white shadow-xs' : 'text-zinc-400 hover:text-white'
                ]"
                title="Gabungkan roll set potong yang sama ke dalam kolom A, B, C, D"
              >
                Gabung Set (A-D)
              </button>
            </div>

            <!-- 3. PILIHAN SPK -->
            <div v-if="availableSpks.length > 1" class="flex items-center gap-1.5 text-xs bg-zinc-800 px-2 py-1 rounded-xl border border-zinc-700">
              <span class="text-zinc-400 font-medium">SPK:</span>
              <select
                v-model="customSpk"
                class="bg-zinc-900 text-white font-mono font-bold text-xs rounded px-1.5 py-0.5 border border-zinc-700 outline-none cursor-pointer"
              >
                <option value="">Semua SPK</option>
                <option v-for="spk in availableSpks" :key="spk" :value="spk">{{ spk }}</option>
              </select>
            </div>

            <!-- 4. EDIT NAMA FOREMAN -->
            <div class="flex items-center gap-1.5 text-xs bg-zinc-800 px-2.5 py-1 rounded-xl border border-zinc-700">
              <span class="text-zinc-400 font-medium">Foreman:</span>
              <input
                v-model="customForeman"
                type="text"
                placeholder="Nama Foreman"
                class="bg-zinc-900 text-white text-xs rounded px-2 py-0.5 border border-zinc-700 w-24 sm:w-28 outline-none font-bold"
              />
            </div>

            <!-- 5. ZOOM TOGGLE -->
            <div class="flex items-center bg-zinc-800 rounded-xl border border-zinc-700 p-0.5 text-xs">
              <button
                @click="zoomScale = Math.max(0.5, zoomScale - 0.1)"
                class="px-2 py-1 hover:bg-zinc-700 rounded-lg text-zinc-300 font-bold"
                title="Perkecil Preview"
              >-</button>
              <span class="px-1.5 font-mono text-[11px] text-zinc-300">{{ Math.round(zoomScale * 100) }}%</span>
              <button
                @click="zoomScale = Math.min(1.3, zoomScale + 0.1)"
                class="px-2 py-1 hover:bg-zinc-700 rounded-lg text-zinc-300 font-bold"
                title="Perbesar Preview"
              >+</button>
            </div>

            <!-- 6. TOMBOL CETAK -->
            <button
              @click="triggerPrint"
              class="px-4 py-2 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-2 cursor-pointer"
            >
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" /></svg>
              <span>Cetak Sekarang (A4)</span>
            </button>

            <!-- 7. TOMBOL TUTUP -->
            <button
              @click="closeModal"
              class="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Tutup Preview"
            >
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
            </button>
          </div>
        </div>

        <!-- PREVIEW CANVAS SCREEN -->
        <div class="flex-1 overflow-auto p-4 sm:p-6 bg-zinc-800/80 flex flex-col items-center gap-8">
          <div
            v-for="page in paginatedPages"
            :key="page.pageIndex"
            :style="{ transform: `scale(${zoomScale})`, transformOrigin: 'top center' }"
            class="transition-transform duration-150 flex flex-col items-center shrink-0 w-full"
          >
            <!-- Badge Lembar Preview -->
            <div class="mb-2 text-xs font-bold text-zinc-400 flex items-center gap-2">
              <span class="px-2.5 py-0.5 rounded-full bg-zinc-900 border border-zinc-700 text-zinc-300 font-mono">
                Lembar {{ page.pageIndex }} dari {{ page.totalPages }}
              </span>
              <span v-if="!page.isLastPage" class="text-blue-400 text-[11px]">
                (Memuat {{ page.rows.filter(r => r.no).length }} baris • Bersambung ke Lembar {{ page.pageIndex + 1 }})
              </span>
              <span v-else class="text-emerald-400 text-[11px]">
                (Lembar Terakhir • Memuat {{ page.rows.filter(r => r.no).length }} baris + Ringkasan & Tanda Tangan)
              </span>
            </div>

            <!-- SHEET KERTAS PREVIEW -->
            <div
              class="bg-white text-black p-6 shadow-2xl font-sans"
              style="width: 297mm; min-height: 210mm; box-sizing: border-box; color: #000; font-family: 'Segoe UI', Arial, sans-serif;"
            >
              <!-- RENDER ISI LEMBAR -->
              <component :is="'div'">
                <!-- Kop -->
                <div class="flex items-start justify-between text-[11px] leading-tight pb-1 mb-1 font-semibold text-black">
                  <div class="w-1/3">
                    <div class="text-[13px] font-black tracking-wide pb-0.5">PT SAPTA WARNA CEMERLANG</div>
                    <div class="flex gap-2"><span class="w-24 font-bold">No. Dokumen</span><span>: <strong>FILM.FM.003</strong></span></div>
                    <div class="flex gap-2"><span class="w-24 font-bold">Revisi</span><span>: 00</span></div>
                  </div>
                  <div class="w-1/3 text-left pl-6">
                    <div class="flex gap-2"><span class="w-28 font-bold">Berlaku Efektif</span><span>: 2 Juni 2024</span></div>
                    <div class="flex gap-2"><span class="w-28 font-bold">Departmen</span><span>: Produksi Film</span></div>
                  </div>
                  <div class="w-1/3 text-right">
                    <span class="font-bold">Hal : {{ page.pageIndex }}/{{ page.totalPages }}</span>
                  </div>
                </div>

                <!-- Judul -->
                <div class="border border-black py-1 px-3 text-center mb-1 bg-white">
                  <h1 class="text-[14px] font-black tracking-wider uppercase m-0 p-0 text-black">
                    LAPORAN PRODUKSI HARIAN SLITTING
                  </h1>
                </div>

                <!-- Info Box -->
                <div class="border border-black p-1.5 mb-2 text-[11.5px] leading-relaxed">
                  <div class="grid grid-cols-2 gap-4">
                    <div class="space-y-0.5">
                      <div class="flex"><span class="w-28 font-semibold">Tanggal</span><span class="w-3">:</span><strong class="font-bold">{{ formattedDate }}</strong></div>
                      <div class="flex"><span class="w-28 font-semibold">Shift/Group</span><span class="w-3">:</span><span class="font-bold">{{ currentShift }} / {{ currentGroupCode }} <span class="font-normal font-mono text-[11px] text-zinc-700">({{ currentMachine }})</span></span></div>
                    </div>
                    <div class="space-y-0.5">
                      <div class="flex"><span class="w-28 font-semibold">SPK No.</span><span class="w-3">:</span><strong class="font-bold font-mono">{{ displaySpk }}</strong></div>
                      <div class="flex"><span class="w-28 font-semibold">Type Product</span><span class="w-3">:</span><strong class="font-bold">{{ displayProductType }}</strong></div>
                    </div>
                  </div>
                </div>

                <!-- Tabel -->
                <div class="mb-2">
                  <div class="flex items-center justify-between text-[11px] font-bold pb-0.5">
                    <span>Produksi</span>
                    <span v-if="!page.isLastPage" class="text-[10px] font-normal italic text-zinc-600">*Data bersambung ke Lembar {{ page.pageIndex + 1 }}</span>
                  </div>
                  <table class="w-full border-collapse border border-black text-[10px] leading-tight text-center" style="table-layout: fixed;">
                    <thead>
                      <tr class="bg-white">
                        <th rowspan="2" class="border border-black font-bold p-1 w-[24px]">No.</th>
                        <th colspan="2" class="border border-black font-bold p-1 w-[72px]">Jam</th>
                        <th colspan="5" class="border border-black font-bold p-1 w-[339px]">Bahan Produksi</th>
                        <th colspan="7" class="border border-black font-bold p-1">Hasil Produksi</th>
                        <th rowspan="2" class="border border-black font-bold p-1 w-[48px] text-[9px]">Sisa Jumbo<br/><span class="font-normal text-[8px]">(meter)</span></th>
                        <th colspan="2" class="border border-black font-bold p-1 w-[76px]">Waste (Kg)</th>
                        <th rowspan="2" class="border border-black font-bold p-1 w-[155px]">Note</th>
                      </tr>
                      <tr class="bg-white">
                        <th class="border border-black font-bold py-1 px-0.5 w-[36px] text-[9.5px]">Start</th>
                        <th class="border border-black font-bold py-1 px-0.5 w-[36px] text-[9.5px]">Finish</th>
                        <th class="border border-black font-bold py-1 px-0.5 w-[175px] text-[9.5px]">Lot No.</th>
                        <th class="border border-black font-bold py-1 px-0.5 w-[32px] text-[9.5px]">Thick</th>
                        <th class="border border-black font-bold py-1 px-0.5 w-[40px] text-[9.5px]">Width</th>
                        <th class="border border-black font-bold py-1 px-0.5 w-[46px] text-[9.5px]">Length</th>
                        <th class="border border-black font-bold py-1 px-0.5 w-[46px] text-[9.5px]">Weight</th>
                        <th class="border border-black font-bold py-1 px-0.5 w-[42px] text-[9.5px]">Width<br/><span class="text-[8.5px]">(mm)</span></th>
                        <th class="border border-black font-bold py-1 px-0.5 w-[46px] text-[9.5px]">Length<br/><span class="text-[8.5px]">(meter)</span></th>
                        <th class="border border-black font-bold py-1 px-0.5 w-[56px] text-[9.5px]">Turunan</th>
                        <th class="border border-black font-bold py-1 px-0.5 w-[44px] text-[9.5px]">A (Kg)</th>
                        <th class="border border-black font-bold py-1 px-0.5 w-[44px] text-[9.5px]">B (Kg)</th>
                        <th class="border border-black font-bold py-1 px-0.5 w-[44px] text-[9.5px]">C (Kg)</th>
                        <th class="border border-black font-bold py-1 px-0.5 w-[44px] text-[9.5px]">D (Kg)</th>
                        <th class="border border-black font-bold py-1 px-0.5 w-[38px] text-[9.5px]">Polos</th>
                        <th class="border border-black font-bold py-1 px-0.5 w-[38px] text-[9.5px]">Metal</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(row, rIdx) in page.rows" :key="rIdx" class="h-[21px] max-h-[26px]">
                        <td class="border border-black py-0.5 px-0.5 text-center font-mono text-[9px]">{{ row.no || '' }}</td>
                        <td class="border border-black py-0.5 px-0.5 text-center font-mono text-[9px]">{{ row.jamStart || '' }}</td>
                        <td class="border border-black py-0.5 px-0.5 text-center font-mono text-[9px]">{{ row.jamFinish || '' }}</td>
                        <td class="border border-black py-0.5 px-1 text-center font-mono font-bold text-[9px] leading-[1.15] break-words break-all">{{ row.lot || '' }}</td>
                        <td class="border border-black py-0.5 px-0.5 text-right font-mono text-[9px]">{{ row.thick || '' }}</td>
                        <td class="border border-black py-0.5 px-0.5 text-right font-mono text-[9px]">{{ row.parentWidth || '' }}</td>
                        <td class="border border-black py-0.5 px-0.5 text-right font-mono text-[9px]">{{ row.parentMeter || '' }}</td>
                        <td class="border border-black py-0.5 px-0.5 text-right font-mono text-[9px]">{{ row.parentWeight || '' }}</td>
                        <td class="border border-black py-0.5 px-0.5 text-right font-mono text-[9px]">{{ row.width || '' }}</td>
                        <td class="border border-black py-0.5 px-0.5 text-right font-mono text-[9px]">{{ row.length || '' }}</td>
                        <td class="border border-black py-0.5 px-0.5 text-center font-mono font-bold text-[9.5px] whitespace-nowrap">{{ row.turunan || '' }}</td>
                        <td :class="['border border-black py-0.5 px-0.5 text-right font-mono text-[9px]', row.upA ? 'font-bold' : '']">{{ row.upA !== undefined && row.upA !== '' ? row.upA : '' }}</td>
                        <td :class="['border border-black py-0.5 px-0.5 text-right font-mono text-[9px]', row.upB ? 'font-bold' : '']">{{ row.upB !== undefined && row.upB !== '' ? row.upB : '' }}</td>
                        <td :class="['border border-black py-0.5 px-0.5 text-right font-mono text-[9px]', row.upC ? 'font-bold' : '']">{{ row.upC !== undefined && row.upC !== '' ? row.upC : '' }}</td>
                        <td :class="['border border-black py-0.5 px-0.5 text-right font-mono text-[9px]', row.upD ? 'font-bold' : '']">{{ row.upD !== undefined && row.upD !== '' ? row.upD : '' }}</td>
                        <td class="border border-black py-0.5 px-0.5 text-right font-mono text-[9px]">{{ row.sisaJumbo || '' }}</td>
                        <td class="border border-black py-0.5 px-0.5 text-right font-mono text-[9px]">{{ row.wastePolos || '' }}</td>
                        <td class="border border-black py-0.5 px-0.5 text-right font-mono text-[9px]">{{ row.wasteMetal || '' }}</td>
                        <td class="border border-black py-0.5 px-1 text-left text-[9px] leading-tight break-words">{{ row.note || '' }}</td>
                      </tr>
                      <!-- Summary (Last Page) -->
                      <template v-if="page.showSummaryAndSignatures">
                        <tr class="h-[20px] font-bold bg-white">
                          <td colspan="8" rowspan="3" class="border border-black text-center font-black text-[11px] uppercase tracking-wider align-middle">Jumlah</td>
                          <td colspan="3" class="border border-black text-left px-2 font-bold text-[9px]">Finished Goods</td>
                          <td class="border border-black py-0.5 px-0.5 text-right font-mono font-bold text-[9px]">{{ sumFg.A ? sumFg.A.toFixed(1) : '' }}</td>
                          <td class="border border-black py-0.5 px-0.5 text-right font-mono font-bold text-[9px]">{{ sumFg.B ? sumFg.B.toFixed(1) : '' }}</td>
                          <td class="border border-black py-0.5 px-0.5 text-right font-mono font-bold text-[9px]">{{ sumFg.C ? sumFg.C.toFixed(1) : '' }}</td>
                          <td class="border border-black py-0.5 px-0.5 text-right font-mono font-bold text-[9px]">{{ sumFg.D ? sumFg.D.toFixed(1) : '' }}</td>
                          <td class="border border-black"></td><td class="border border-black"></td><td class="border border-black"></td><td class="border border-black"></td>
                        </tr>
                        <tr class="h-[20px] font-bold bg-white">
                          <td colspan="3" class="border border-black text-left px-2 font-bold text-[9px]">Hold</td>
                          <td class="border border-black py-0.5 px-0.5 text-right font-mono font-bold text-[9px]">{{ sumHold.A ? sumHold.A.toFixed(1) : '' }}</td>
                          <td class="border border-black py-0.5 px-0.5 text-right font-mono font-bold text-[9px]">{{ sumHold.B ? sumHold.B.toFixed(1) : '' }}</td>
                          <td class="border border-black py-0.5 px-0.5 text-right font-mono font-bold text-[9px]">{{ sumHold.C ? sumHold.C.toFixed(1) : '' }}</td>
                          <td class="border border-black py-0.5 px-0.5 text-right font-mono font-bold text-[9px]">{{ sumHold.D ? sumHold.D.toFixed(1) : '' }}</td>
                          <td class="border border-black"></td><td class="border border-black"></td><td class="border border-black"></td><td class="border border-black"></td>
                        </tr>
                        <tr class="h-[20px] font-bold bg-white">
                          <td colspan="3" class="border border-black text-left px-2 font-bold text-[9px]">Reject</td>
                          <td class="border border-black py-0.5 px-0.5 text-right font-mono font-bold text-[9px]">{{ sumReject.A ? sumReject.A.toFixed(1) : '' }}</td>
                          <td class="border border-black py-0.5 px-0.5 text-right font-mono font-bold text-[9px]">{{ sumReject.B ? sumReject.B.toFixed(1) : '' }}</td>
                          <td class="border border-black py-0.5 px-0.5 text-right font-mono font-bold text-[9px]">{{ sumReject.C ? sumReject.C.toFixed(1) : '' }}</td>
                          <td class="border border-black py-0.5 px-0.5 text-right font-mono font-bold text-[9px]">{{ sumReject.D ? sumReject.D.toFixed(1) : '' }}</td>
                          <td class="border border-black py-0.5 px-0.5 text-right font-mono font-bold text-[9px]">{{ totalSisaJumbo ? totalSisaJumbo : '' }}</td>
                          <td class="border border-black py-0.5 px-0.5 text-right font-mono font-bold text-[9px]">{{ totalWastePolos ? totalWastePolos.toFixed(1) : '' }}</td>
                          <td class="border border-black py-0.5 px-0.5 text-right font-mono font-bold text-[9px]">{{ totalWasteMetal ? totalWasteMetal.toFixed(1) : '' }}</td>
                          <td class="border border-black"></td>
                        </tr>
                      </template>
                    </tbody>
                  </table>
                </div>

                <!-- Footer Signatures (Last Page) -->
                <div v-if="page.showSummaryAndSignatures" class="grid grid-cols-12 border border-black text-[11px] min-h-[90px]">
                  <div class="col-span-6 p-2 border-r border-black flex flex-col justify-between">
                    <div>
                      <strong class="font-bold underline">Catatan :</strong>
                      <div class="pt-1 text-[10px] leading-relaxed text-zinc-800 whitespace-pre-line font-medium">{{ displayNotes || '-' }}</div>
                    </div>
                    <div class="text-[9px] text-zinc-500 font-mono pt-2">
                      Total Output Shift: {{ grandTotalKg.toFixed(1) }} Kg ({{ totalPassRolls }} Roll PASS, {{ totalHoldRolls }} HOLD, {{ totalRejectRolls }} REJ)
                    </div>
                  </div>
                  <div class="col-span-6 grid grid-cols-2 text-center">
                    <div class="p-2 border-r border-black flex flex-col justify-between">
                      <div class="font-semibold text-left pb-1">Dibuat oleh :</div>
                      <div class="h-10"></div>
                      <div class="text-left text-[10px] space-y-0.5">
                        <div class="flex"><span class="w-14">Nama</span><span class="w-2">:</span><strong class="font-bold truncate">{{ resolvedOperatorName || '-' }}</strong></div>
                        <div class="flex"><span class="w-14">Jabatan</span><span class="w-2">:</span><span>Operator</span></div>
                        <div class="flex"><span class="w-14">Tgl.</span><span class="w-2">:</span><span>{{ formattedDateShort }}</span></div>
                      </div>
                    </div>
                    <div class="p-2 flex flex-col justify-between">
                      <div class="font-semibold text-left pb-1">Disetujui oleh :</div>
                      <div class="h-10"></div>
                      <div class="text-left text-[10px] space-y-0.5">
                        <div class="flex"><span class="w-14">Nama</span><span class="w-2">:</span><strong class="font-bold truncate">{{ customForeman || '-' }}</strong></div>
                        <div class="flex"><span class="w-14">Jabatan</span><span class="w-2">:</span><span>Foreman/Spv</span></div>
                        <div class="flex"><span class="w-14">Tgl.</span><span class="w-2">:</span><span>{{ formattedDateShort }}</span></div>
                      </div>
                    </div>
                  </div>
                </div>
              </component>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- 2. DEDICATED STATIC PRINT CONTAINER (PRINT ENGINE ONLY - ZERO BLANK, MARGIN 0 SUPPRESSES BROWSER HEADER/FOOTER) -->
    <div
      v-if="isOpen"
      id="slittingPrintOnlyArea"
    >
      <div
        v-for="page in paginatedPages"
        :key="'print-page-' + page.pageIndex"
        class="print-sheet"
      >
        <!-- Kop -->
        <div class="flex items-start justify-between text-[11px] leading-tight pb-1 mb-1 font-semibold text-black">
          <div class="w-1/3">
            <div class="text-[13px] font-black tracking-wide pb-0.5">PT SAPTA WARNA CEMERLANG</div>
            <div class="flex gap-2"><span class="w-24 font-bold">No. Dokumen</span><span>: <strong>FILM.FM.003</strong></span></div>
            <div class="flex gap-2"><span class="w-24 font-bold">Revisi</span><span>: 00</span></div>
          </div>
          <div class="w-1/3 text-left pl-6">
            <div class="flex gap-2"><span class="w-28 font-bold">Berlaku Efektif</span><span>: 2 Juni 2024</span></div>
            <div class="flex gap-2"><span class="w-28 font-bold">Departmen</span><span>: Produksi Film</span></div>
          </div>
          <div class="w-1/3 text-right">
            <span class="font-bold">Hal : {{ page.pageIndex }}/{{ page.totalPages }}</span>
          </div>
        </div>

        <!-- Judul -->
        <div class="border border-black py-1 px-3 text-center mb-1 bg-white">
          <h1 class="text-[14px] font-black tracking-wider uppercase m-0 p-0 text-black">
            LAPORAN PRODUKSI HARIAN SLITTING
          </h1>
        </div>

        <!-- Info Box -->
        <div class="border border-black p-1.5 mb-2 text-[11.5px] leading-relaxed">
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-0.5">
              <div class="flex"><span class="w-28 font-semibold">Tanggal</span><span class="w-3">:</span><strong class="font-bold">{{ formattedDate }}</strong></div>
              <div class="flex"><span class="w-28 font-semibold">Shift/Group</span><span class="w-3">:</span><span class="font-bold">{{ currentShift }} / {{ currentGroupCode }} <span class="font-normal font-mono text-[11px] text-zinc-700">({{ currentMachine }})</span></span></div>
            </div>
            <div class="space-y-0.5">
              <div class="flex"><span class="w-28 font-semibold">SPK No.</span><span class="w-3">:</span><strong class="font-bold font-mono">{{ displaySpk }}</strong></div>
              <div class="flex"><span class="w-28 font-semibold">Type Product</span><span class="w-3">:</span><strong class="font-bold">{{ displayProductType }}</strong></div>
            </div>
          </div>
        </div>

        <!-- Tabel -->
        <div class="mb-2">
          <div class="flex items-center justify-between text-[11px] font-bold pb-0.5">
            <span>Produksi</span>
            <span v-if="!page.isLastPage" class="text-[10px] font-normal italic text-zinc-600">*Data bersambung ke Lembar {{ page.pageIndex + 1 }}</span>
          </div>
          <table class="w-full border-collapse border border-black text-[10px] leading-tight text-center" style="table-layout: fixed;">
            <thead>
              <tr class="bg-white">
                <th rowspan="2" class="border border-black font-bold p-1 w-[24px]">No.</th>
                <th colspan="2" class="border border-black font-bold p-1 w-[72px]">Jam</th>
                <th colspan="5" class="border border-black font-bold p-1 w-[339px]">Bahan Produksi</th>
                <th colspan="7" class="border border-black font-bold p-1">Hasil Produksi</th>
                <th rowspan="2" class="border border-black font-bold p-1 w-[48px] text-[9px]">Sisa Jumbo<br/><span class="font-normal text-[8px]">(meter)</span></th>
                <th colspan="2" class="border border-black font-bold p-1 w-[76px]">Waste (Kg)</th>
                <th rowspan="2" class="border border-black font-bold p-1 w-[155px]">Note</th>
              </tr>
              <tr class="bg-white">
                <th class="border border-black font-bold py-1 px-0.5 w-[36px] text-[9.5px]">Start</th>
                <th class="border border-black font-bold py-1 px-0.5 w-[36px] text-[9.5px]">Finish</th>
                <th class="border border-black font-bold py-1 px-0.5 w-[175px] text-[9.5px]">Lot No.</th>
                <th class="border border-black font-bold py-1 px-0.5 w-[32px] text-[9.5px]">Thick</th>
                <th class="border border-black font-bold py-1 px-0.5 w-[40px] text-[9.5px]">Width</th>
                <th class="border border-black font-bold py-1 px-0.5 w-[46px] text-[9.5px]">Length</th>
                <th class="border border-black font-bold py-1 px-0.5 w-[46px] text-[9.5px]">Weight</th>
                <th class="border border-black font-bold py-1 px-0.5 w-[42px] text-[9.5px]">Width<br/><span class="text-[8.5px]">(mm)</span></th>
                <th class="border border-black font-bold py-1 px-0.5 w-[46px] text-[9.5px]">Length<br/><span class="text-[8.5px]">(meter)</span></th>
                <th class="border border-black font-bold py-1 px-0.5 w-[56px] text-[9.5px]">Turunan</th>
                <th class="border border-black font-bold py-1 px-0.5 w-[44px] text-[9.5px]">A (Kg)</th>
                <th class="border border-black font-bold py-1 px-0.5 w-[44px] text-[9.5px]">B (Kg)</th>
                <th class="border border-black font-bold py-1 px-0.5 w-[44px] text-[9.5px]">C (Kg)</th>
                <th class="border border-black font-bold py-1 px-0.5 w-[44px] text-[9.5px]">D (Kg)</th>
                <th class="border border-black font-bold py-1 px-0.5 w-[38px] text-[9.5px]">Polos</th>
                <th class="border border-black font-bold py-1 px-0.5 w-[38px] text-[9.5px]">Metal</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, rIdx) in page.rows" :key="rIdx" class="h-[21px] max-h-[26px]">
                <td class="border border-black py-0.5 px-0.5 text-center font-mono text-[9px]">{{ row.no || '' }}</td>
                <td class="border border-black py-0.5 px-0.5 text-center font-mono text-[9px]">{{ row.jamStart || '' }}</td>
                <td class="border border-black py-0.5 px-0.5 text-center font-mono text-[9px]">{{ row.jamFinish || '' }}</td>
                <td class="border border-black py-0.5 px-1 text-center font-mono font-bold text-[9px] leading-[1.15] break-words break-all">{{ row.lot || '' }}</td>
                <td class="border border-black py-0.5 px-0.5 text-right font-mono text-[9px]">{{ row.thick || '' }}</td>
                <td class="border border-black py-0.5 px-0.5 text-right font-mono text-[9px]">{{ row.parentWidth || '' }}</td>
                <td class="border border-black py-0.5 px-0.5 text-right font-mono text-[9px]">{{ row.parentMeter || '' }}</td>
                <td class="border border-black py-0.5 px-0.5 text-right font-mono text-[9px]">{{ row.parentWeight || '' }}</td>
                <td class="border border-black py-0.5 px-0.5 text-right font-mono text-[9px]">{{ row.width || '' }}</td>
                <td class="border border-black py-0.5 px-0.5 text-right font-mono text-[9px]">{{ row.length || '' }}</td>
                <td class="border border-black py-0.5 px-0.5 text-center font-mono font-bold text-[9.5px] whitespace-nowrap">{{ row.turunan || '' }}</td>
                <td :class="['border border-black py-0.5 px-0.5 text-right font-mono text-[9px]', row.upA ? 'font-bold' : '']">{{ row.upA !== undefined && row.upA !== '' ? row.upA : '' }}</td>
                <td :class="['border border-black py-0.5 px-0.5 text-right font-mono text-[9px]', row.upB ? 'font-bold' : '']">{{ row.upB !== undefined && row.upB !== '' ? row.upB : '' }}</td>
                <td :class="['border border-black py-0.5 px-0.5 text-right font-mono text-[9px]', row.upC ? 'font-bold' : '']">{{ row.upC !== undefined && row.upC !== '' ? row.upC : '' }}</td>
                <td :class="['border border-black py-0.5 px-0.5 text-right font-mono text-[9px]', row.upD ? 'font-bold' : '']">{{ row.upD !== undefined && row.upD !== '' ? row.upD : '' }}</td>
                <td class="border border-black py-0.5 px-0.5 text-right font-mono text-[9px]">{{ row.sisaJumbo || '' }}</td>
                <td class="border border-black py-0.5 px-0.5 text-right font-mono text-[9px]">{{ row.wastePolos || '' }}</td>
                <td class="border border-black py-0.5 px-0.5 text-right font-mono text-[9px]">{{ row.wasteMetal || '' }}</td>
                <td class="border border-black py-0.5 px-1 text-left text-[9px] leading-tight break-words">{{ row.note || '' }}</td>
              </tr>
              <!-- Summary (Last Page) -->
              <template v-if="page.showSummaryAndSignatures">
                <tr class="h-[20px] font-bold bg-white">
                  <td colspan="8" rowspan="3" class="border border-black text-center font-black text-[11px] uppercase tracking-wider align-middle">Jumlah</td>
                  <td colspan="3" class="border border-black text-left px-2 font-bold text-[9px]">Finished Goods</td>
                  <td class="border border-black py-0.5 px-0.5 text-right font-mono font-bold text-[9px]">{{ sumFg.A ? sumFg.A.toFixed(1) : '' }}</td>
                  <td class="border border-black py-0.5 px-0.5 text-right font-mono font-bold text-[9px]">{{ sumFg.B ? sumFg.B.toFixed(1) : '' }}</td>
                  <td class="border border-black py-0.5 px-0.5 text-right font-mono font-bold text-[9px]">{{ sumFg.C ? sumFg.C.toFixed(1) : '' }}</td>
                  <td class="border border-black py-0.5 px-0.5 text-right font-mono font-bold text-[9px]">{{ sumFg.D ? sumFg.D.toFixed(1) : '' }}</td>
                  <td class="border border-black"></td><td class="border border-black"></td><td class="border border-black"></td><td class="border border-black"></td>
                </tr>
                <tr class="h-[20px] font-bold bg-white">
                  <td colspan="3" class="border border-black text-left px-2 font-bold text-[9px]">Hold</td>
                  <td class="border border-black py-0.5 px-0.5 text-right font-mono font-bold text-[9px]">{{ sumHold.A ? sumHold.A.toFixed(1) : '' }}</td>
                  <td class="border border-black py-0.5 px-0.5 text-right font-mono font-bold text-[9px]">{{ sumHold.B ? sumHold.B.toFixed(1) : '' }}</td>
                  <td class="border border-black py-0.5 px-0.5 text-right font-mono font-bold text-[9px]">{{ sumHold.C ? sumHold.C.toFixed(1) : '' }}</td>
                  <td class="border border-black py-0.5 px-0.5 text-right font-mono font-bold text-[9px]">{{ sumHold.D ? sumHold.D.toFixed(1) : '' }}</td>
                  <td class="border border-black"></td><td class="border border-black"></td><td class="border border-black"></td><td class="border border-black"></td>
                </tr>
                <tr class="h-[20px] font-bold bg-white">
                  <td colspan="3" class="border border-black text-left px-2 font-bold text-[9px]">Reject</td>
                  <td class="border border-black py-0.5 px-0.5 text-right font-mono font-bold text-[9px]">{{ sumReject.A ? sumReject.A.toFixed(1) : '' }}</td>
                  <td class="border border-black py-0.5 px-0.5 text-right font-mono font-bold text-[9px]">{{ sumReject.B ? sumReject.B.toFixed(1) : '' }}</td>
                  <td class="border border-black py-0.5 px-0.5 text-right font-mono font-bold text-[9px]">{{ sumReject.C ? sumReject.C.toFixed(1) : '' }}</td>
                  <td class="border border-black py-0.5 px-0.5 text-right font-mono font-bold text-[9px]">{{ sumReject.D ? sumReject.D.toFixed(1) : '' }}</td>
                  <td class="border border-black py-0.5 px-0.5 text-right font-mono font-bold text-[9px]">{{ totalSisaJumbo ? totalSisaJumbo : '' }}</td>
                  <td class="border border-black py-0.5 px-0.5 text-right font-mono font-bold text-[9px]">{{ totalWastePolos ? totalWastePolos.toFixed(1) : '' }}</td>
                  <td class="border border-black py-0.5 px-0.5 text-right font-mono font-bold text-[9px]">{{ totalWasteMetal ? totalWasteMetal.toFixed(1) : '' }}</td>
                  <td class="border border-black"></td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>

        <!-- Footer Signatures (Last Page) -->
        <div v-if="page.showSummaryAndSignatures" class="grid grid-cols-12 border border-black text-[11px] min-h-[90px]">
          <div class="col-span-6 p-2 border-r border-black flex flex-col justify-between">
            <div>
              <strong class="font-bold underline">Catatan :</strong>
              <div class="pt-1 text-[10px] leading-relaxed text-zinc-800 whitespace-pre-line font-medium">{{ displayNotes || '-' }}</div>
            </div>
            <div class="text-[9px] text-zinc-500 font-mono pt-2">
              Total Output Shift: {{ grandTotalKg.toFixed(1) }} Kg ({{ totalPassRolls }} Roll PASS, {{ totalHoldRolls }} HOLD, {{ totalRejectRolls }} REJ)
            </div>
          </div>
          <div class="col-span-6 grid grid-cols-2 text-center">
            <div class="p-2 border-r border-black flex flex-col justify-between">
              <div class="font-semibold text-left pb-1">Dibuat oleh :</div>
              <div class="h-10"></div>
              <div class="text-left text-[10px] space-y-0.5">
                <div class="flex"><span class="w-14">Nama</span><span class="w-2">:</span><strong class="font-bold truncate">{{ resolvedOperatorName || '-' }}</strong></div>
                <div class="flex"><span class="w-14">Jabatan</span><span class="w-2">:</span><span>Operator</span></div>
                <div class="flex"><span class="w-14">Tgl.</span><span class="w-2">:</span><span>{{ formattedDateShort }}</span></div>
              </div>
            </div>
            <div class="p-2 flex flex-col justify-between">
              <div class="font-semibold text-left pb-1">Disetujui oleh :</div>
              <div class="h-10"></div>
              <div class="text-left text-[10px] space-y-0.5">
                <div class="flex"><span class="w-14">Nama</span><span class="w-2">:</span><strong class="font-bold truncate">{{ customForeman || '-' }}</strong></div>
                <div class="flex"><span class="w-14">Jabatan</span><span class="w-2">:</span><span>Foreman/Spv</span></div>
                <div class="flex"><span class="w-14">Tgl.</span><span class="w-2">:</span><span>{{ formattedDateShort }}</span></div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue';
import { useConfigStore } from '@/stores/configStore';

const configStore = useConfigStore();

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  date: {
    type: String,
    default: ''
  },
  machine: {
    type: String,
    default: 'SLITTING'
  },
  shift: {
    type: [String, Number],
    default: '1'
  },
  items: {
    type: Array,
    default: () => []
  },
  operatorName: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['close']);

const zoomScale = ref(0.9);
const customForeman = ref('');
const customSpk = ref('');
const rowDisplayMode = ref('per-roll'); // 'per-roll' (default IA01, GC03) | 'group-set'
const selectedShiftKey = ref('ALL');

const closeModal = () => {
  emit('close');
};

const rawItems = computed(() => props.items || []);

// ═══════════════════════════════════════════════════════════════════════════
// HELPER OPERATOR & SHIFT RESOLUTION
// ═══════════════════════════════════════════════════════════════════════════
const getShiftNumber = (item) => {
  if (!item) return '1';
  const rawShift = String(item.shift || '').replace(/\D/g, '');
  if (rawShift) return rawShift;
  if (item.shiftCombined) {
    const numMatch = String(item.shiftCombined).match(/\d+/);
    if (numMatch) return numMatch[0];
  }
  return '1';
};

const getOperatorCode = (item) => {
  if (!item) return 'G';
  if (item.kodeOperator && typeof item.kodeOperator === 'string' && item.kodeOperator.trim()) {
    return item.kodeOperator.trim().toUpperCase();
  }

  const opRaw = String(item.operator || item.operatorName || '').trim();
  if (opRaw) {
    const opUpper = opRaw.toUpperCase();
    const matched = configStore?.operatorList?.find(o =>
      (o.nama && o.nama.toUpperCase() === opUpper) ||
      (o.kodeOperator && o.kodeOperator.toUpperCase() === opUpper)
    );
    if (matched && matched.kodeOperator) {
      return matched.kodeOperator.toUpperCase();
    }
    if (opUpper.length === 1 && /[A-Z]/.test(opUpper)) {
      return opUpper;
    }
    const matchAlpha = opUpper.match(/[A-Z]/);
    if (matchAlpha) return matchAlpha[0];
  }

  if (item.turunan) {
    const tStr = String(item.turunan).trim().toUpperCase();
    const matchT = tStr.match(/^([A-Za-z])/);
    if (matchT) {
      const matchOp = configStore?.operatorList?.find(o => o.kodeOperator && o.kodeOperator.toUpperCase() === matchT[1]);
      if (matchOp) return matchOp.kodeOperator.toUpperCase();
    }
  }

  if (item.shiftCombined) {
    const matchPrefix = String(item.shiftCombined).trim().toUpperCase().match(/^([A-Z]+)/);
    if (matchPrefix) return matchPrefix[1];
  }

  return 'G';
};

const getResolvedOperatorName = (item) => {
  if (!item) return '';
  const list = configStore?.operatorList || [];
  const rawOp = String(item.operator || item.operatorName || '').trim();
  const machine = String(item.mesin || props.machine || 'SLITTING').trim().toUpperCase();
  const targetDate = item.tanggalShift || item.tanggal || props.date || null;

  const opCode = getOperatorCode(item);

  if (opCode && typeof configStore?.getOperatorByDate === 'function') {
    const byDate = configStore.getOperatorByDate(opCode, machine, targetDate);
    if (byDate && byDate.nama) return byDate.nama.toUpperCase();
  }

  if (opCode && list.length) {
    const byCodeMachine = list.find(o => o.kodeOperator && o.kodeOperator.toUpperCase() === opCode.toUpperCase() && o.mesin && o.mesin.toUpperCase() === machine && o.active !== false)
      || list.find(o => o.kodeOperator && o.kodeOperator.toUpperCase() === opCode.toUpperCase() && o.mesin && o.mesin.toUpperCase() === machine);
    if (byCodeMachine && byCodeMachine.nama) return byCodeMachine.nama.toUpperCase();

    const byCode = list.find(o => o.kodeOperator && o.kodeOperator.toUpperCase() === opCode.toUpperCase() && o.active !== false)
      || list.find(o => o.kodeOperator && o.kodeOperator.toUpperCase() === opCode.toUpperCase());
    if (byCode && byCode.nama) return byCode.nama.toUpperCase();
  }

  if (rawOp && list.length) {
    let clean = rawOp;
    if (clean.toUpperCase().startsWith('OPERATOR ')) clean = clean.substring(9).trim();
    const matched = list.find(o => o.nama && o.nama.toUpperCase() === clean.toUpperCase());
    if (matched && matched.nama) return matched.nama.toUpperCase();
  }

  return rawOp ? rawOp.toUpperCase() : '';
};

// ═══════════════════════════════════════════════════════════════════════════
// DAFTAR SHIFT / OPERATOR YANG TERSEDIA DI DATA
// ═══════════════════════════════════════════════════════════════════════════
const availableShiftOptions = computed(() => {
  const map = new Map();
  rawItems.value.forEach(item => {
    const shiftNum = getShiftNumber(item);
    const opCode = getOperatorCode(item);
    const shiftCombined = `${opCode}${shiftNum}`;
    const opName = getResolvedOperatorName(item) || item.operator || 'Operator';
    const key = `${shiftNum}_${opCode}`;

    if (!map.has(key)) {
      map.set(key, {
        key,
        shift: shiftNum,
        group: opCode,
        shiftCombined,
        operatorName: opName,
        label: `Shift ${shiftNum} - ${opName} (${shiftCombined})`,
        count: 0
      });
    }
    map.get(key).count++;
  });

  return Array.from(map.values()).sort((a, b) => a.shift.localeCompare(b.shift));
});

// Auto-select shift when modal opens or items change
watch(
  () => [props.isOpen, availableShiftOptions.value],
  ([isOpen]) => {
    if (isOpen && availableShiftOptions.value.length > 0) {
      const targetShiftNum = String(props.shift || '1').replace(/\D/g, '');
      const matched = availableShiftOptions.value.find(o => o.shift === targetShiftNum);
      if (matched) {
        selectedShiftKey.value = matched.key;
      } else {
        selectedShiftKey.value = availableShiftOptions.value[0].key;
      }
    }
  },
  { immediate: true }
);

// Active Shift Label
const activeShiftLabel = computed(() => {
  if (selectedShiftKey.value === 'ALL') return 'Seluruh Shift (Gabungan)';
  const opt = availableShiftOptions.value.find(o => o.key === selectedShiftKey.value);
  return opt ? opt.label : 'Shift 1';
});

// Shift Filtered Items
const shiftFilteredItems = computed(() => {
  if (selectedShiftKey.value === 'ALL') {
    return rawItems.value;
  }
  const opt = availableShiftOptions.value.find(o => o.key === selectedShiftKey.value);
  if (!opt) return rawItems.value;

  return rawItems.value.filter(item => {
    const sNum = getShiftNumber(item);
    const oCode = getOperatorCode(item);
    return sNum === opt.shift && oCode === opt.group;
  });
});

const currentMachine = computed(() => {
  const m = String(props.machine || '').trim().toUpperCase();
  return m ? (m.startsWith('SLITTING') ? m : `SLITTING ${m}`) : 'SLITTING';
});

const currentShift = computed(() => {
  if (selectedShiftKey.value !== 'ALL') {
    const opt = availableShiftOptions.value.find(o => o.key === selectedShiftKey.value);
    if (opt) return opt.shift;
  }
  const s = String(props.shift || '1').replace(/\D/g, '');
  return s || '1';
});

const currentGroupCode = computed(() => {
  if (selectedShiftKey.value !== 'ALL') {
    const opt = availableShiftOptions.value.find(o => o.key === selectedShiftKey.value);
    if (opt) return opt.group;
  }
  const first = shiftFilteredItems.value[0];
  if (first) {
    return getOperatorCode(first);
  }
  return 'G';
});

const resolvedOperatorName = computed(() => {
  if (selectedShiftKey.value !== 'ALL') {
    const opt = availableShiftOptions.value.find(o => o.key === selectedShiftKey.value);
    if (opt && opt.operatorName) return opt.operatorName;
  }
  if (props.operatorName) return props.operatorName.toUpperCase();
  const first = shiftFilteredItems.value[0];
  if (first) return getResolvedOperatorName(first) || String(first.operator || '').toUpperCase();
  return '';
});

// Format Full Date (e.g. 05 Januari 2026)
const formattedDate = computed(() => {
  const d = props.date;
  if (!d) return new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
  const parts = d.split('-');
  if (parts.length === 3) {
    const year = parts[0];
    const monthIdx = parseInt(parts[1], 10) - 1;
    const day = parts[2];
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return `${day} ${months[monthIdx] || ''} ${year}`;
  }
  return d;
});

// Format Short Date (e.g. 05/01/2026)
const formattedDateShort = computed(() => {
  const d = props.date;
  if (!d) return '';
  const parts = d.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return d;
});

// Distinct Available SPKs within current filtered shift
const availableSpks = computed(() => {
  const set = new Set();
  shiftFilteredItems.value.forEach(item => {
    const s = String(item.spk || item.noSpk || '').trim();
    if (s) set.add(s);
  });
  return Array.from(set);
});

// Display SPK
const displaySpk = computed(() => {
  if (customSpk.value) return customSpk.value;
  if (availableSpks.value.length === 1) return availableSpks.value[0];
  if (availableSpks.value.length > 1) return availableSpks.value.join(', ');
  return '-';
});

// Display Product Type (e.g. VMCPP M06 20µm)
const displayProductType = computed(() => {
  const first = shiftFilteredItems.value[0];
  if (!first) return 'VMCPP';
  const jenis = first.jenis || 'VMCPP';
  const kode = first.kode || first.kodeFormula || '';
  const thick = first.thickness || first.tebal || '';
  const parts = [jenis];
  if (kode) parts.push(kode);
  if (thick) parts.push(`${thick}µm`);
  return parts.join(' ');
});

// Helper: Determine Up Stream (A, B, C, D) from Turunan
const getUpStreamLetter = (turunanStr) => {
  if (!turunanStr) return 'A';
  const s = String(turunanStr).trim().toUpperCase();
  const matchOpStream = s.match(/^[A-Z]([A-D])\d+$/);
  if (matchOpStream) return matchOpStream[1];
  const matchSimple = s.match(/^([A-D])\d+$/);
  if (matchSimple) return matchSimple[1];
  const matchAny = s.match(/([A-D])/);
  if (matchAny) return matchAny[1];
  return 'A';
};

// Helper: Format Keterangan Note per Roll (Kodepack suffix jika PASS, [H]/[R] + Reason jika Non-PASS)
const formatRollNote = (item) => {
  if (!item) return '';
  let packSuffix = '';
  const rawPack = item.packing ?? item.subKode ?? item.kodePack;
  if (rawPack !== undefined && rawPack !== null && rawPack !== '') {
    const num = parseInt(String(rawPack).replace(/\D/g, ''), 10);
    packSuffix = !isNaN(num) ? String(num) : String(rawPack).trim();
  }

  const st = String(item.status || '').toUpperCase();
  const reason = String(item.reasonDefect || item.keterangan || '').trim();

  if (st.includes('REJECT')) {
    const rLabel = reason ? `[R] ${reason}` : '[R] REJECT';
    return packSuffix ? `${packSuffix} ${rLabel}` : rLabel;
  }
  if (st.includes('HOLD')) {
    const hLabel = reason ? `[H] ${reason}` : '[H] HOLD';
    return packSuffix ? `${packSuffix} ${hLabel}` : hLabel;
  }

  // Jika PASS: Hanya tampilkan kode pack suffix
  return packSuffix || '-';
};

// ═══════════════════════════════════════════════════════════════════════════
// ALGORITMA BARIS DATA SEBELUM DIBAGI PER HALAMAN
// ═══════════════════════════════════════════════════════════════════════════

// Helper: Ambil angka set/tarikan dari kode turunan (misal: GA07 -> 07, GC07 -> 07, IA01 -> 01)
const extractSetNumber = (turunanStr) => {
  if (!turunanStr) return '';
  const match = String(turunanStr).match(/\d+/);
  return match ? match[0] : '';
};

// Helper: Ambil lot dasar tanpa slash child
const getLotBase = (item) => {
  const lot = String(item.lot || item.noLot || '').trim();
  if (lot.includes('/')) return lot.split('/')[0].trim();
  return lot;
};

const displayRows = computed(() => {
  const items = customSpk.value
    ? shiftFilteredItems.value.filter(i => (i.spk || i.noSpk) === customSpk.value)
    : shiftFilteredItems.value;

  if (!items.length) return [];

  // 1. Hitung Jadwal Waktu Jam Start & Finish yang Realistis & Berkesinambungan (Tidak Pernah Sama)
  const orderedSetKeys = [];
  const setItemMap = new Map();

  items.forEach((item, idx) => {
    const lotBase = getLotBase(item);
    const setNum = extractSetNumber(item.turunan);
    const key = setNum ? `${lotBase}_SET_${setNum}` : `${lotBase}_ITEM_${idx}`;
    if (!setItemMap.has(key)) {
      setItemMap.set(key, []);
      orderedSetKeys.push(key);
    }
    setItemMap.get(key).push(item);
  });

  const setTimelineMap = new Map();
  let previousFinishDate = null;
  const shiftNumStr = String(currentShift.value || '1').replace(/\D/g, '') || '1';
  const defaultShiftStartHour = shiftNumStr === '2' ? 15 : (shiftNumStr === '3' ? 23 : 7);

  const padZero = (n) => String(n).padStart(2, '0');
  const formatTimeHM = (d) => `${padZero(d.getHours())}:${padZero(d.getMinutes())}`;

  orderedSetKeys.forEach((key, sIdx) => {
    const setRolls = setItemMap.get(key);

    // Cek field eksplisit jamStart / jamFinish dari data roll jika ada
    const explicitStart = setRolls.find(r => r.jamStart || r.startTime || r.waktuStart);
    const explicitFinish = setRolls.find(r => r.jamFinish || r.finishTime || r.waktuFinish);
    if (explicitStart && explicitFinish) {
      const s = String(explicitStart.jamStart || explicitStart.startTime || explicitStart.waktuStart).slice(0, 5);
      const f = String(explicitFinish.jamFinish || explicitFinish.finishTime || explicitFinish.waktuFinish).slice(0, 5);
      if (s !== f) {
        setTimelineMap.set(key, { jamStart: s, jamFinish: f });
        return;
      }
    }

    // Ambil timestamp dari createdAt atau timestamp roll
    const validDates = setRolls
      .map(r => r.createdAt || r.timestamp)
      .filter(Boolean)
      .map(d => new Date(d))
      .filter(d => !isNaN(d.getTime()));

    let setFinishDate = null;
    if (validDates.length > 0) {
      validDates.sort((a, b) => b.getTime() - a.getTime());
      setFinishDate = new Date(validDates[0].getTime());
    }

    if (!setFinishDate) {
      // Basis perkiraan dari jam awal shift jika tidak ada createdAt
      const base = new Date();
      base.setHours(defaultShiftStartHour, 35 + (sIdx * 40), 0, 0);
      setFinishDate = base;
    }

    let setStartDate = null;
    if (previousFinishDate && (setFinishDate.getTime() - previousFinishDate.getTime() >= 5 * 60 * 1000)) {
      setStartDate = new Date(previousFinishDate.getTime() + (2 * 60 * 1000));
    } else {
      setStartDate = new Date(setFinishDate.getTime() - (30 * 60 * 1000));
    }

    let jamStart = formatTimeHM(setStartDate);
    let jamFinish = formatTimeHM(setFinishDate);

    // Pastikan jamStart dan jamFinish TIDAK PERNAH SAMA!
    if (jamStart === jamFinish) {
      const adjustedStart = new Date(setFinishDate.getTime() - (25 * 60 * 1000));
      jamStart = formatTimeHM(adjustedStart);
    }

    previousFinishDate = setFinishDate;
    setTimelineMap.set(key, { jamStart, jamFinish });
  });

  // MODE 1: PER ROLL (1 Baris per Roll dengan kode turunan asli: IA01, GC03, GA07)
  if (rowDisplayMode.value === 'per-roll') {
    return items.map((item, idx) => {
      const lot = item.lot || item.noLot || '-';
      const turunanStr = String(item.turunan || '').trim().toUpperCase() || `A${String(idx + 1).padStart(2, '0')}`;
      const stream = getUpStreamLetter(turunanStr);
      const weightVal = parseFloat(String(item.netto || item.berat || item.weight || '').replace(',', '.')) || '';

      const lotBase = getLotBase(item);
      const setNum = extractSetNumber(turunanStr);
      const groupKey = setNum ? `${lotBase}_SET_${setNum}` : `${lotBase}_ITEM_${idx}`;
      const timeInfo = setTimelineMap.get(groupKey) || { jamStart: '', jamFinish: '' };

      return {
        no: idx + 1,
        jamStart: timeInfo.jamStart,
        jamFinish: timeInfo.jamFinish,
        lot: lot,
        _rawLot: lot,
        thick: item.thickness || item.tebal || '',
        parentWidth: item.parentWidth || '',
        parentMeter: item.parentMeter || '',
        _rawParentMeter: item.parentMeter || '',
        parentWeight: item.parentBeratTeori || '',
        _rawParentWeight: item.parentBeratTeori || '',
        width: item.width || item.lebar || '',
        length: item.length || item.meter || '',
        turunan: turunanStr, // TAMPIL PERSIS SEPERTI DI MANAJEMEN LABEL (IA01, GC03, GA07)
        upA: stream === 'A' ? weightVal : '',
        upB: stream === 'B' ? weightVal : '',
        upC: stream === 'C' ? weightVal : '',
        upD: stream === 'D' ? weightVal : '',
        rollObjA: stream === 'A' ? item : null,
        rollObjB: stream === 'B' ? item : null,
        rollObjC: stream === 'C' ? item : null,
        rollObjD: stream === 'D' ? item : null,
        sisaJumbo: item.sisaMeter || '',
        wastePolos: item.wastePolos || '',
        wasteMetal: item.wasteMetal || '',
        note: formatRollNote(item),
        groupKey
      };
    });
  }

  // MODE 2: GABUNG SET TARIKAN (Menggabungkan stream A, B, C, D ke dalam 1 baris)
  const setsMap = new Map();
  const rowOrder = [];

  items.forEach((item, idx) => {
    const lot = item.lot || item.noLot || '-';
    const width = item.width || item.lebar || '';
    const length = item.length || item.meter || '';
    const turunan = String(item.turunan || '').trim().toUpperCase();

    let upStream = getUpStreamLetter(turunan);
    let setNumber = String(idx + 1).padStart(2, '0');
    const matchNum = turunan.match(/(\d+)/);
    if (matchNum) setNumber = matchNum[1];

    const setKey = `${lot}_${width}_${length}_${setNumber}`;

    if (!setsMap.has(setKey)) {
      setsMap.set(setKey, {
        lot,
        thick: item.thickness || item.tebal || '',
        parentWidth: item.parentWidth || '',
        parentMeter: item.parentMeter || '',
        parentWeight: item.parentBeratTeori || '',
        width,
        length,
        turunanList: [],
        upA: '',
        upB: '',
        upC: '',
        upD: '',
        rollObjA: null,
        rollObjB: null,
        rollObjC: null,
        rollObjD: null,
        sisaJumbo: item.sisaMeter || '',
        wastePolos: item.wastePolos || '',
        wasteMetal: item.wasteMetal || '',
        notesList: [],
        setKey
      });
      rowOrder.push(setKey);
    }

    const setObj = setsMap.get(setKey);
    const weightVal = parseFloat(String(item.netto || item.berat || item.weight || '').replace(',', '.')) || '';

    if (turunan && !setObj.turunanList.includes(turunan)) {
      setObj.turunanList.push(turunan);
    }

    if (upStream === 'A') {
      setObj.upA = weightVal;
      setObj.rollObjA = item;
    } else if (upStream === 'B') {
      setObj.upB = weightVal;
      setObj.rollObjB = item;
    } else if (upStream === 'C') {
      setObj.upC = weightVal;
      setObj.rollObjC = item;
    } else if (upStream === 'D') {
      setObj.upD = weightVal;
      setObj.rollObjD = item;
    } else {
      if (!setObj.upA) { setObj.upA = weightVal; setObj.rollObjA = item; }
      else if (!setObj.upB) { setObj.upB = weightVal; setObj.rollObjB = item; }
      else if (!setObj.upC) { setObj.upC = weightVal; setObj.rollObjC = item; }
      else if (!setObj.upD) { setObj.upD = weightVal; setObj.rollObjD = item; }
    }

    if (item.sisaMeter && !setObj.sisaJumbo) setObj.sisaJumbo = item.sisaMeter;
    if (item.wastePolos && !setObj.wastePolos) setObj.wastePolos = item.wastePolos;
    if (item.wasteMetal && !setObj.wasteMetal) setObj.wasteMetal = item.wasteMetal;

    const formattedNote = formatRollNote(item);
    if (formattedNote && formattedNote !== '-' && !setObj.notesList.includes(formattedNote)) {
      setObj.notesList.push(formattedNote);
    }
  });

  return rowOrder.map((key, idx) => {
    const s = setsMap.get(key);
    const timeInfo = setTimelineMap.get(key) || { jamStart: '', jamFinish: '' };

    const turunanDisplay = s.turunanList.length > 2
      ? `${s.turunanList[0]}–${s.turunanList[s.turunanList.length - 1]}`
      : s.turunanList.join(', ');

    return {
      no: idx + 1,
      jamStart: timeInfo.jamStart,
      jamFinish: timeInfo.jamFinish,
      lot: s.lot,
      _rawLot: s.lot,
      thick: s.thick,
      parentWidth: s.parentWidth,
      parentMeter: s.parentMeter,
      _rawParentMeter: s.parentMeter,
      parentWeight: s.parentWeight,
      _rawParentWeight: s.parentWeight,
      width: s.width,
      length: s.length,
      turunan: turunanDisplay,
      upA: s.upA,
      upB: s.upB,
      upC: s.upC,
      upD: s.upD,
      rollObjA: s.rollObjA,
      rollObjB: s.rollObjB,
      rollObjC: s.rollObjC,
      rollObjD: s.rollObjD,
      sisaJumbo: s.sisaJumbo,
      wastePolos: s.wastePolos,
      wasteMetal: s.wasteMetal,
      note: s.notesList.join(' • '),
      groupKey: key
    };
  });
});

// Helper: Buat baris kosong untuk padding lembar
const createEmptyRow = () => ({
  no: '',
  jamStart: '',
  jamFinish: '',
  lot: '',
  thick: '',
  parentWidth: '',
  parentMeter: '',
  parentWeight: '',
  width: '',
  length: '',
  turunan: '',
  upA: '',
  upB: '',
  upC: '',
  upD: '',
  sisaJumbo: '',
  wastePolos: '',
  wasteMetal: '',
  note: ''
});

// ═══════════════════════════════════════════════════════════════════════════
// ALGORITMA MULTI-PAGE CHUNKING OPTIMAL (GROUP-SAFE: GA07 & GC07 SELALU SATU LEMBAR)
// ═══════════════════════════════════════════════════════════════════════════
const NON_LAST_PAGE_CAPACITY = 20; // Halaman non-terakhir memuat 20 baris penuh (tidak ada void kosong)
const LAST_PAGE_CAPACITY = 13;     // Halaman terakhir memuat hingga 13 baris + Ringkasan & TTD

const paginatedPages = computed(() => {
  const rows = displayRows.value;
  if (rows.length === 0) {
    return [{
      pageIndex: 1,
      totalPages: 1,
      rows: Array(LAST_PAGE_CAPACITY).fill(null).map(() => createEmptyRow()),
      isLastPage: true,
      showSummaryAndSignatures: true
    }];
  }

  // 1. Jika data total muat di 1 lembar tunggal (<= 13 baris)
  if (rows.length <= LAST_PAGE_CAPACITY) {
    const padded = rows.map((r, i) => {
      const prevLot = i > 0 ? rows[i - 1]._rawLot : null;
      return {
        ...r,
        lot: r._rawLot === prevLot ? '' : r._rawLot,
        parentMeter: r._rawLot === prevLot ? '' : r._rawParentMeter,
        parentWeight: r._rawLot === prevLot ? '' : r._rawParentWeight
      };
    });
    while (padded.length < LAST_PAGE_CAPACITY) {
      padded.push(createEmptyRow());
    }
    return [{
      pageIndex: 1,
      totalPages: 1,
      rows: padded,
      isLastPage: true,
      showSummaryAndSignatures: true
    }];
  }

  // 2. Multi-Page: Kelompokkan baris berdasarkan groupKey (Roll satu set seperti GA07 & GC07 TIDAK BOLEH TERPISAH)
  const groups = [];
  let currentGroup = [];
  let currentGroupKey = null;

  rows.forEach(row => {
    if (row.groupKey !== currentGroupKey) {
      if (currentGroup.length > 0) {
        groups.push(currentGroup);
      }
      currentGroup = [row];
      currentGroupKey = row.groupKey;
    } else {
      currentGroup.push(row);
    }
  });
  if (currentGroup.length > 0) {
    groups.push(currentGroup);
  }

  const pages = [];
  let remainingGroups = [...groups];

  while (remainingGroups.length > 0) {
    const remainingTotalRows = remainingGroups.reduce((acc, g) => acc + g.length, 0);

    // Jika sisa baris muat di lembar terakhir bersama ringkasan & TTD (<= 13 baris):
    if (remainingTotalRows <= LAST_PAGE_CAPACITY) {
      const flatRows = remainingGroups.flat();
      while (flatRows.length < LAST_PAGE_CAPACITY) {
        flatRows.push(createEmptyRow());
      }
      pages.push({
        pageIndex: pages.length + 1,
        rows: flatRows,
        isLastPage: true,
        showSummaryAndSignatures: true
      });
      break;
    }

    // Jika masih perlu lembar non-terakhir:
    // Isi lembar hingga kapasitas penuh (20 baris) TANPA MEMECAH KELOMPOK SET!
    const pageRows = [];

    while (remainingGroups.length > 0) {
      const nextGroup = remainingGroups[0];
      const nextGroupLen = nextGroup.length;
      const currentRowsInPage = pageRows.length;

      // Cek apakah nextGroup muat di lembar non-terakhir ini
      if (currentRowsInPage + nextGroupLen <= NON_LAST_PAGE_CAPACITY) {
        // Cek apakah jika nextGroup diambil, sisa baris setelahnya menjadi 0 padahal belum lembar terakhir
        const rowsAfter = remainingGroups.slice(1).reduce((acc, g) => acc + g.length, 0);
        if (rowsAfter === 0) {
          // Harus menyisakan data untuk lembar terakhir (karena lembar terakhir butuh tempat untuk ringkasan & TTD)
          break;
        }
        pageRows.push(...nextGroup);
        remainingGroups.shift();
      } else {
        // Jika tidak muat dalam 20 baris dan sudah ada baris di lembar ini:
        // JANGAN PECAH KELOMPOK! Pindahkan seluruh kelompok ke lembar berikutnya
        if (pageRows.length > 0) {
          break;
        } else {
          // Fallback ekstrem jika 1 kelompok saja melebihi 20 baris
          pageRows.push(...nextGroup.slice(0, NON_LAST_PAGE_CAPACITY));
          remainingGroups[0] = nextGroup.slice(NON_LAST_PAGE_CAPACITY);
          break;
        }
      }
    }

    // PAD HALAMAN NON-TERAKHIR DENGAN EMPTY ROWS HINGGA 20 BARIS PENUH
    // Menjamin garis tabel memenuhi kertas sampai bawah dan tidak ada area kosong (hemat kertas & rapi)
    while (pageRows.length < NON_LAST_PAGE_CAPACITY) {
      pageRows.push(createEmptyRow());
    }

    pages.push({
      pageIndex: pages.length + 1,
      rows: pageRows,
      isLastPage: false,
      showSummaryAndSignatures: false
    });
  }

  // Terapkan aturan sparse Lot No. yang rapi per halaman:
  // - Baris pertama setiap halaman PASTI menampilkan No. Lot
  // - Baris berikutnya yang memiliki No. Lot sama dikosongkan (sparse visual)
  pages.forEach(p => {
    let lastLotOnPage = null;
    p.rows.forEach(r => {
      if (!r.no) return; // Row kosong padding
      if (r._rawLot !== lastLotOnPage) {
        r.lot = r._rawLot;
        r.parentMeter = r._rawParentMeter;
        r.parentWeight = r._rawParentWeight;
        lastLotOnPage = r._rawLot;
      } else {
        r.lot = '';
        r.parentMeter = '';
        r.parentWeight = '';
      }
    });
  });

  const total = pages.length;
  pages.forEach(p => { p.totalPages = total; });
  return pages;
});

// ═══════════════════════════════════════════════════════════════════════════
// KALKULASI TOTAL FOOTER
// ═══════════════════════════════════════════════════════════════════════════
const getRollStatus = (rollObj) => {
  if (!rollObj) return 'PASS';
  const st = String(rollObj.status || '').toUpperCase();
  if (st.includes('REJECT')) return 'REJECT';
  if (st.includes('HOLD')) return 'HOLD';
  return 'PASS';
};

const sumFg = computed(() => {
  const sum = { A: 0, B: 0, C: 0, D: 0 };
  displayRows.value.forEach(r => {
    if (r.upA && getRollStatus(r.rollObjA) === 'PASS') sum.A += parseFloat(r.upA) || 0;
    if (r.upB && getRollStatus(r.rollObjB) === 'PASS') sum.B += parseFloat(r.upB) || 0;
    if (r.upC && getRollStatus(r.rollObjC) === 'PASS') sum.C += parseFloat(r.upC) || 0;
    if (r.upD && getRollStatus(r.rollObjD) === 'PASS') sum.D += parseFloat(r.upD) || 0;
  });
  return sum;
});

const sumHold = computed(() => {
  const sum = { A: 0, B: 0, C: 0, D: 0 };
  displayRows.value.forEach(r => {
    if (r.upA && getRollStatus(r.rollObjA) === 'HOLD') sum.A += parseFloat(r.upA) || 0;
    if (r.upB && getRollStatus(r.rollObjB) === 'HOLD') sum.B += parseFloat(r.upB) || 0;
    if (r.upC && getRollStatus(r.rollObjC) === 'HOLD') sum.C += parseFloat(r.upC) || 0;
    if (r.upD && getRollStatus(r.rollObjD) === 'HOLD') sum.D += parseFloat(r.upD) || 0;
  });
  return sum;
});

const sumReject = computed(() => {
  const sum = { A: 0, B: 0, C: 0, D: 0 };
  displayRows.value.forEach(r => {
    if (r.upA && getRollStatus(r.rollObjA) === 'REJECT') sum.A += parseFloat(r.upA) || 0;
    if (r.upB && getRollStatus(r.rollObjB) === 'REJECT') sum.B += parseFloat(r.upB) || 0;
    if (r.upC && getRollStatus(r.rollObjC) === 'REJECT') sum.C += parseFloat(r.upC) || 0;
    if (r.upD && getRollStatus(r.rollObjD) === 'REJECT') sum.D += parseFloat(r.upD) || 0;
  });
  return sum;
});

const totalSisaJumbo = computed(() => {
  return displayRows.value.reduce((acc, r) => acc + (parseFloat(r.sisaJumbo) || 0), 0);
});

const totalWastePolos = computed(() => {
  return displayRows.value.reduce((acc, r) => acc + (parseFloat(r.wastePolos) || 0), 0);
});

const totalWasteMetal = computed(() => {
  return displayRows.value.reduce((acc, r) => acc + (parseFloat(r.wasteMetal) || 0), 0);
});

const grandTotalKg = computed(() => {
  const fg = sumFg.value.A + sumFg.value.B + sumFg.value.C + sumFg.value.D;
  const hold = sumHold.value.A + sumHold.value.B + sumHold.value.C + sumHold.value.D;
  const rej = sumReject.value.A + sumReject.value.B + sumReject.value.C + sumReject.value.D;
  return fg + hold + rej;
});

const totalPassRolls = computed(() => {
  return shiftFilteredItems.value.filter(i => !i.status || i.status.toUpperCase() === 'PASS').length;
});

const totalHoldRolls = computed(() => {
  return shiftFilteredItems.value.filter(i => i.status && i.status.toUpperCase() === 'HOLD').length;
});

const totalRejectRolls = computed(() => {
  return shiftFilteredItems.value.filter(i => i.status && i.status.toUpperCase() === 'REJECT').length;
});

// Display Notes Catatan
const displayNotes = computed(() => {
  const notes = [];
  shiftFilteredItems.value.forEach(item => {
    if (item.noteOperator && !notes.includes(item.noteOperator)) notes.push(item.noteOperator);
    if (item.keteranganWaste && !notes.includes(item.keteranganWaste)) notes.push(item.keteranganWaste);
  });
  return notes.length ? notes.join('\n') : '';
});

// Trigger Native Browser Print
const triggerPrint = () => {
  nextTick(() => {
    setTimeout(() => {
      window.print();
    }, 50);
  });
};
</script>

<style>
/* CSS UNTUK TAMPILAN SCREEN (SEMBUNYIKAN DOKUMEN CETAK DARI LAYAR BIASA) */
#slittingPrintOnlyArea {
  display: none;
}

@media screen {
  #slittingPrintOnlyArea {
    display: none !important;
  }
}

/* CSS UNTUK CETAK NATIVE BROWSER (A4 LANDSCAPE PRESISI, ZERO BLANK, MARGIN 0 SUPPRESSES BROWSER HEADERS/FOOTERS) */
@media print {
  @page {
    size: landscape;
    margin: 0 !important; /* Margin 0 di @page otomatis menghilangkan tanggal, URL, dan judul di sudut halaman */
  }

  html, body {
    width: 100% !important;
    height: auto !important;
    margin: 0 !important;
    padding: 0 !important;
    background: #ffffff !important;
    color: #000000 !important;
    overflow: visible !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  /* Sembunyikan SELURUH elemen aplikasi Vue dan modal preview di layar */
  #app,
  body > *:not(#slittingPrintOnlyArea):not(#fpbPrintOnlyArea):not(#printOnlyArea) {
    display: none !important;
  }

  /* Tampilkan HANYA dokumen cetak statis */
  #slittingPrintOnlyArea,
  body > #slittingPrintOnlyArea {
    display: block !important;
    position: static !important;
    width: 100% !important;
    height: auto !important;
    margin: 0 !important;
    padding: 0 !important;
    background: #ffffff !important;
    color: #000000 !important;
    overflow: visible !important;
  }

  /* Setiap lembar halaman kertas cetak (A4 Landscape 297mm x 210mm) */
  .print-sheet {
    display: block !important;
    box-sizing: border-box !important;
    width: 297mm !important;
    min-height: 200mm !important;
    height: auto !important;
    padding: 6mm 8mm !important;
    margin: 0 auto !important;
    border: none !important;
    box-shadow: none !important;
    background: #ffffff !important;
    color: #000000 !important;
    page-break-after: always !important;
    break-after: page !important;
    page-break-inside: avoid !important;
    break-inside: avoid !important;
  }

  .print-sheet:last-child {
    page-break-after: auto !important;
    break-after: auto !important;
  }

  .no-print {
    display: none !important;
  }
}
</style>
