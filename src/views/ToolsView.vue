<template>
  <div class="space-y-6 animate-fade-in pb-12">
    <!-- Header: Industrial Minimalist Brand -->
    <div class="bg-zinc-900 text-white rounded-3xl p-5 sm:p-7 border border-zinc-800 shadow-xl relative overflow-hidden">
      <!-- Background subtle grid pattern -->
      <div class="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
      
      <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="space-y-1.5">
          <div class="flex items-center gap-2.5">
            <span class="px-2.5 py-0.5 rounded-md text-[10px] font-black tracking-wider uppercase bg-amber-500 text-zinc-950 font-mono shadow-xs">
              ENGINEERING TOOLBOX
            </span>
            <span class="text-xs text-zinc-400 font-mono">• Versi 2.0 Presisi Lapangan</span>
          </div>
          <h1 class="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
            <svg class="w-6 h-6 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
            </svg>
            <span>Kalkulator & Alat Administrasi Lapangan</span>
          </h1>
          <p class="text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed">
            Perhitungan instan geometri gulungan roll film, toleransi timbangan QC, optimasi pisau slitting, serta konversi satuan teknis industri kemasan fleksibel.
          </p>
        </div>

        <!-- Quick Material Badge Selector -->
        <div class="bg-zinc-950/80 border border-zinc-800 rounded-2xl p-3 flex flex-col gap-2 shrink-0">
          <div class="text-[10.5px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Density Bahan Aktif:</span>
          </div>
          <div class="flex items-center gap-1.5">
            <button
              v-for="m in materials"
              :key="m.name"
              @click="selectMaterial(m)"
              :class="[
                'px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer font-mono',
                selectedMaterial.name === m.name
                  ? 'bg-amber-500 text-zinc-950 shadow-xs font-black'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              ]"
            >
              {{ m.name }} ({{ m.density }})
            </button>
          </div>
        </div>
      </div>

      <!-- Navigation Tabs (Industrial Segmented Controls) -->
      <div class="flex items-center gap-2 mt-6 pt-5 border-t border-zinc-800/80 overflow-x-auto pb-1 scrollbar-none">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="[
            'px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap',
            activeTab === tab.id
              ? 'bg-zinc-100 text-zinc-900 shadow-md font-black scale-[1.02]'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
          ]"
        >
          <span v-html="tab.icon"></span>
          <span>{{ tab.label }}</span>
        </button>
      </div>
    </div>

    <!-- ========================================================================= -->
    <!-- TAB 1: KALKULATOR GEOMETRI ROLL (HANDYMATH PRO) -->
    <!-- ========================================================================= -->
    <div v-if="activeTab === 'roll_calc'" class="space-y-6">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <!-- Input Form Card -->
        <div class="lg:col-span-6 xl:col-span-5 bg-white rounded-3xl p-5 sm:p-6 border border-zinc-200 shadow-xs space-y-5">
          <div class="flex items-center justify-between border-b border-zinc-100 pb-3">
            <h2 class="text-sm font-black text-zinc-900 flex items-center gap-2">
              <span class="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-sm font-black font-mono">1</span>
              <span>Parameter Gulungan Roll</span>
            </h2>
            
            <!-- Calculation Mode Toggle -->
            <div class="flex items-center bg-zinc-100 p-0.5 rounded-xl border border-zinc-200 text-xs font-bold">
              <button
                @click="rollCalcMode = 'FIND_LENGTH'"
                :class="[
                  'px-2.5 py-1 rounded-lg transition-all cursor-pointer text-[11px]',
                  rollCalcMode === 'FIND_LENGTH' ? 'bg-white text-zinc-900 shadow-2xs font-black' : 'text-zinc-500 hover:text-zinc-900'
                ]"
              >
                Cari Panjang (L)
              </button>
              <button
                @click="rollCalcMode = 'FIND_OD'"
                :class="[
                  'px-2.5 py-1 rounded-lg transition-all cursor-pointer text-[11px]',
                  rollCalcMode === 'FIND_OD' ? 'bg-white text-zinc-900 shadow-2xs font-black' : 'text-zinc-500 hover:text-zinc-900'
                ]"
              >
                Cari Diameter (OD)
              </button>
            </div>
          </div>

          <!-- Form Fields -->
          <div class="space-y-4 text-xs">
            <!-- Mode 1: Input Outer Diameter (OD) -->
            <div v-if="rollCalcMode === 'FIND_LENGTH'" class="space-y-1.5">
              <div class="flex justify-between items-center">
                <label class="font-bold text-zinc-700 flex items-center gap-1.5">
                  <span>Diameter Luar Roll (Outer Diameter / OD)</span>
                  <span class="text-red-500">*</span>
                </label>
                <div class="flex items-center gap-1 text-[11px] font-bold text-zinc-500">
                  <button
                    @click="setOdUnit('cm')"
                    :class="['px-2 py-0.5 rounded cursor-pointer transition-colors font-mono', odUnit === 'cm' ? 'bg-zinc-900 text-white font-black' : 'hover:bg-zinc-200 text-zinc-600']"
                  >cm</button>
                  <button
                    @click="setOdUnit('mm')"
                    :class="['px-2 py-0.5 rounded cursor-pointer transition-colors font-mono', odUnit === 'mm' ? 'bg-zinc-900 text-white font-black' : 'hover:bg-zinc-200 text-zinc-600']"
                  >mm</button>
                  <button
                    @click="setOdUnit('inch')"
                    :class="['px-2 py-0.5 rounded cursor-pointer transition-colors font-mono', odUnit === 'inch' ? 'bg-zinc-900 text-white font-black' : 'hover:bg-zinc-200 text-zinc-600']"
                  >in</button>
                </div>
              </div>
              <div class="relative">
                <input
                  v-model.number="inputOD"
                  @focus="$event.target.select()"
                  type="number"
                  step="0.1"
                  min="1"
                  class="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 font-mono text-base font-black text-zinc-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  placeholder="Masukkan OD"
                />
                <span class="absolute right-3.5 top-3 text-xs font-mono font-bold text-zinc-400 uppercase">{{ odUnit }}</span>
              </div>
              
              <!-- Validation Warning if OD <= Core ID -->
              <div v-if="!isOdValid" class="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] flex items-center gap-2">
                <span>⚠️</span>
                <span>Nilai OD ({{ activeOdMm.toFixed(1) }} mm) harus lebih besar dari Core ID ({{ coreMmValue.toFixed(1) }} mm).</span>
              </div>
              <p v-else class="text-[11px] text-zinc-400">
                Ukur diameter luar gulungan dengan meteran atau jangka sorong. (Ekuivalen: <strong class="text-zinc-700 font-mono">{{ activeOdMm.toFixed(1) }} mm</strong> / <strong class="text-zinc-700 font-mono">{{ (activeOdMm/10).toFixed(2) }} cm</strong>)
              </p>
            </div>

            <!-- Mode 2: Input Target Panjang (Length) -->
            <div v-else class="space-y-1.5">
              <div class="flex justify-between items-center">
                <label class="font-bold text-zinc-700 flex items-center gap-1.5">
                  <span>Target Panjang Gulungan (Length)</span>
                  <span class="text-red-500">*</span>
                </label>
                <div class="flex items-center gap-1 text-[11px] font-bold text-zinc-500">
                  <button
                    @click="setLengthUnit('m')"
                    :class="['px-2 py-0.5 rounded cursor-pointer transition-colors font-mono', lengthUnit === 'm' ? 'bg-zinc-900 text-white font-black' : 'hover:bg-zinc-200 text-zinc-600']"
                  >Meter</button>
                  <button
                    @click="setLengthUnit('km')"
                    :class="['px-2 py-0.5 rounded cursor-pointer transition-colors font-mono', lengthUnit === 'km' ? 'bg-zinc-900 text-white font-black' : 'hover:bg-zinc-200 text-zinc-600']"
                  >Km</button>
                </div>
              </div>
              <div class="relative">
                <input
                  v-model.number="inputLength"
                  @focus="$event.target.select()"
                  type="number"
                  step="10"
                  min="1"
                  class="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 font-mono text-base font-black text-zinc-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  placeholder="Contoh: 6000"
                />
                <span class="absolute right-3.5 top-3 text-xs font-mono font-bold text-zinc-400 uppercase">{{ lengthUnit }}</span>
              </div>
              <p class="text-[11px] text-zinc-400">Masukkan target panjang film yang ingin digulung.</p>
            </div>

            <!-- Core Diameter (ID) Preset Buttons -->
            <div class="space-y-1.5">
              <div class="flex justify-between items-center">
                <label class="font-bold text-zinc-700">Diameter Core / As Gulungan (ID)</label>
                <span class="text-[11px] text-zinc-400 font-mono">{{ coreMmValue.toFixed(1) }} mm</span>
              </div>
              <div class="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  @click="coreType = '3inch'"
                  :class="[
                    'py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center',
                    coreType === '3inch' ? 'bg-zinc-900 text-white border-zinc-900 shadow-xs font-black' : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                  ]"
                >
                  Core 3" (76.2 mm)
                </button>
                <button
                  type="button"
                  @click="coreType = '6inch'"
                  :class="[
                    'py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center',
                    coreType === '6inch' ? 'bg-zinc-900 text-white border-zinc-900 shadow-xs font-black' : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                  ]"
                >
                  Core 6" (152.4 mm)
                </button>
                <button
                  type="button"
                  @click="coreType = 'custom'"
                  :class="[
                    'py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center',
                    coreType === 'custom' ? 'bg-zinc-900 text-white border-zinc-900 shadow-xs font-black' : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                  ]"
                >
                  Custom ID
                </button>
              </div>
              <!-- Custom ID Input if active -->
              <div v-if="coreType === 'custom'" class="mt-2 relative animate-fade-in">
                <input
                  v-model.number="customCoreMm"
                  @focus="$event.target.select()"
                  type="number"
                  step="0.1"
                  min="10"
                  class="w-full px-3 py-2 rounded-xl border border-zinc-300 font-mono text-sm font-bold text-zinc-900 outline-none"
                  placeholder="Masukkan diameter dalam (mm)"
                />
                <span class="absolute right-3 top-2.5 text-xs text-zinc-400 font-bold">mm</span>
              </div>
            </div>

            <!-- Ketebalan Film (Thickness / Micron) -->
            <div class="space-y-1.5">
              <div class="flex justify-between items-center">
                <label class="font-bold text-zinc-700">Ketebalan Film (Thickness)</label>
                <span class="text-[11px] text-zinc-400 font-mono">{{ inputMicron }} µm ({{ (inputMicron * 0.03937).toFixed(1) }} mil)</span>
              </div>
              <div class="relative">
                <input
                  v-model.number="inputMicron"
                  @focus="$event.target.select()"
                  type="number"
                  step="0.5"
                  min="1"
                  class="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 font-mono text-base font-black text-zinc-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  placeholder="Contoh: 20"
                />
                <span class="absolute right-3.5 top-3 text-xs font-mono font-bold text-zinc-400">MICRON (µm)</span>
              </div>
              <!-- Quick Preset Microns -->
              <div class="flex flex-wrap items-center gap-1.5 pt-1">
                <span class="text-[10px] text-zinc-400 font-bold">Preset:</span>
                <button
                  v-for="mc in [12, 15, 18, 20, 25, 30, 40, 50]"
                  :key="mc"
                  type="button"
                  @click="inputMicron = mc"
                  :class="[
                    'px-2 py-0.5 rounded-md text-[10.5px] font-mono font-bold border transition-colors cursor-pointer',
                    inputMicron === mc ? 'bg-indigo-50 text-indigo-700 border-indigo-300 font-black' : 'bg-zinc-50 text-zinc-600 border-zinc-200 hover:bg-zinc-100'
                  ]"
                >
                  {{ mc }}µ
                </button>
              </div>
            </div>

            <!-- Lebar Roll (Width mm) untuk Menghitung Netto Kg -->
            <div class="space-y-1.5">
              <div class="flex justify-between items-center">
                <label class="font-bold text-zinc-700">Lebar Roll (Width mm) — Opsional</label>
                <span class="text-[11px] text-zinc-400 font-mono">Untuk Estimasi Berat</span>
              </div>
              <div class="relative">
                <input
                  v-model.number="inputWidthMm"
                  @focus="$event.target.select()"
                  type="number"
                  step="5"
                  min="10"
                  class="w-full px-3.5 py-2 rounded-xl border border-zinc-300 font-mono text-sm font-bold text-zinc-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  placeholder="Contoh: 1060"
                />
                <span class="absolute right-3.5 top-2.5 text-xs font-mono font-bold text-zinc-400">MM</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Result & Interactive Visual Diagram Card -->
        <div class="lg:col-span-6 xl:col-span-7 space-y-5">
          
          <!-- Key Metrics Grid -->
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
            
            <!-- Result 1: Calculated Dimension (Length or OD) -->
            <div class="col-span-2 sm:col-span-1 bg-gradient-to-br from-indigo-900 to-zinc-900 text-white rounded-3xl p-4 sm:p-5 shadow-md flex flex-col justify-between relative overflow-hidden border border-indigo-800">
              <div class="flex justify-between items-start">
                <span class="text-[11px] font-bold text-indigo-300 uppercase tracking-wider font-mono">
                  {{ rollCalcMode === 'FIND_LENGTH' ? 'HASIL PANJANG' : 'HASIL DIAMETER (OD)' }}
                </span>
                <span :class="['w-2 h-2 rounded-full', isOdValid ? 'bg-indigo-400 animate-ping' : 'bg-red-400']"></span>
              </div>
              <div class="my-2">
                <div v-if="!isOdValid && rollCalcMode === 'FIND_LENGTH'" class="text-lg font-bold text-amber-300 font-mono">
                  OD ≤ Core ID
                </div>
                <div v-else class="text-2xl sm:text-3xl font-black font-mono tracking-tight text-white">
                  {{ rollCalcMode === 'FIND_LENGTH' ? calculatedLengthMeter.toLocaleString('id-ID') : calculatedODmm.toFixed(1) }}
                </div>
                
                <div class="text-xs text-indigo-200 font-mono font-bold mt-0.5">
                  <template v-if="rollCalcMode === 'FIND_LENGTH'">
                    {{ isOdValid ? 'Meter (m)' : 'Periksa Nilai OD' }}
                  </template>
                  <template v-else>
                    Milimeter (mm) <span class="text-zinc-400 font-normal">/ {{ (calculatedODmm / 10).toFixed(2) }} cm</span>
                  </template>
                </div>
              </div>
              <div class="text-[10.5px] text-indigo-300/80 border-t border-indigo-700/50 pt-2 flex items-center justify-between">
                <span>{{ rollCalcMode === 'FIND_LENGTH' ? (isOdValid ? `≈ ${(calculatedLengthMeter / 1000).toFixed(3)} Km` : '-') : `≈ ${(calculatedODmm / 25.4).toFixed(2)} inch` }}</span>
                <button
                  v-if="isOdValid || rollCalcMode === 'FIND_OD'"
                  @click="copyValue(rollCalcMode === 'FIND_LENGTH' ? calculatedLengthMeter : calculatedODmm.toFixed(1))"
                  class="text-[10px] px-1.5 py-0.5 rounded bg-indigo-800 hover:bg-indigo-700 text-white transition-colors cursor-pointer"
                  title="Salin Angka"
                >
                  {{ isCopied ? '✓ Tersalin' : '📋 Salin' }}
                </button>
              </div>
            </div>

            <!-- Result 2: Estimasi Berat Netto (Kg) -->
            <div class="bg-white rounded-3xl p-4 sm:p-5 border border-zinc-200 shadow-xs flex flex-col justify-between">
              <span class="text-[11px] font-bold text-zinc-500 uppercase tracking-wider font-mono">ESTIMASI NETTO</span>
              <div class="my-2">
                <div class="text-2xl sm:text-3xl font-black font-mono text-zinc-900 tracking-tight">
                  {{ calculatedWeightKg.toFixed(2) }}
                </div>
                <div class="text-xs text-zinc-500 font-mono font-bold mt-0.5">Kilogram (kg)</div>
              </div>
              <div class="text-[10.5px] text-zinc-400 border-t border-zinc-100 pt-2 truncate">
                Material: <strong class="text-zinc-700 font-mono">{{ selectedMaterial.name }}</strong> ({{ selectedMaterial.density }})
              </div>
            </div>

            <!-- Result 3: Total Putaran Roll (Laps / Turns) -->
            <div class="bg-white rounded-3xl p-4 sm:p-5 border border-zinc-200 shadow-xs flex flex-col justify-between">
              <span class="text-[11px] font-bold text-zinc-500 uppercase tracking-wider font-mono">TOTAL PUTARAN</span>
              <div class="my-2">
                <div class="text-2xl sm:text-3xl font-black font-mono text-zinc-900 tracking-tight">
                  {{ calculatedLaps.toLocaleString('id-ID') }}
                </div>
                <div class="text-xs text-zinc-500 font-mono font-bold mt-0.5">Lapisan / Putaran</div>
              </div>
              <div class="text-[10.5px] text-zinc-400 border-t border-zinc-100 pt-2">
                Tebal Gulungan: <strong class="text-zinc-700 font-mono">{{ calculatedWallThicknessMm.toFixed(1) }} mm</strong>
              </div>
            </div>
          </div>

          <!-- Interactive Industrial Visual Cross-Section Diagram -->
          <div class="bg-white rounded-3xl p-5 sm:p-6 border border-zinc-200 shadow-xs space-y-3">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="text-sm">📐</span>
                <h3 class="text-xs font-black uppercase tracking-wider text-zinc-800">Visual Geometri Penampang Roll (Cross Section)</h3>
              </div>
              <span class="text-[11px] font-mono text-zinc-500">Skala Dinamis Real-Time</span>
            </div>

            <!-- SVG Roll Visualizer -->
            <div class="w-full bg-zinc-950 rounded-2xl p-4 flex flex-col items-center justify-center relative overflow-hidden min-h-[220px]">
              <svg class="w-48 h-48 sm:w-56 sm:h-56" viewBox="0 0 200 200">
                <!-- Outer Ring (Outer Diameter) -->
                <circle
                  cx="100"
                  cy="100"
                  :r="visualOdRadius"
                  fill="#3b82f6"
                  fill-opacity="0.15"
                  stroke="#3b82f6"
                  stroke-width="2.5"
                  stroke-dasharray="4 2"
                  class="transition-all duration-300"
                />

                <!-- Film Winding Layer (Wall) -->
                <circle
                  v-if="isOdValid"
                  cx="100"
                  cy="100"
                  :r="(visualOdRadius + visualCoreRadius) / 2"
                  fill="none"
                  stroke="#6366f1"
                  stroke-opacity="0.3"
                  :stroke-width="Math.max(2, visualOdRadius - visualCoreRadius)"
                  class="transition-all duration-300"
                />

                <!-- Inner Core (Paper Core / ID) -->
                <circle
                  cx="100"
                  cy="100"
                  :r="visualCoreRadius"
                  fill="#27272a"
                  stroke="#e4e4e7"
                  stroke-width="2"
                  class="transition-all duration-300"
                />

                <!-- Core Hole Center -->
                <circle
                  cx="100"
                  cy="100"
                  r="6"
                  fill="#71717a"
                />

                <!-- Radius / OD Indicator Lines -->
                <line x1="100" y1="100" :x2="100 + visualOdRadius" y2="100" stroke="#f59e0b" stroke-width="1.5" stroke-linecap="round" />
                <circle :cx="100 + visualOdRadius" cy="100" r="3" fill="#f59e0b" />
                <text :x="100 + visualOdRadius / 2" y="94" fill="#f59e0b" font-size="8" font-weight="bold" font-family="monospace" text-anchor="middle">
                  OD/2: {{ (activeOdMm / 2).toFixed(1) }}mm
                </text>
              </svg>

              <!-- Dimensional Tags Overlay -->
              <div class="flex items-center justify-center gap-4 text-[11px] font-mono font-bold mt-2 flex-wrap">
                <span class="text-blue-400 flex items-center gap-1">
                  <span class="w-2 h-2 rounded-full bg-blue-500"></span>
                  OD: {{ activeOdMm.toFixed(1) }} mm ({{ (activeOdMm / 10).toFixed(1) }} cm)
                </span>
                <span class="text-zinc-400 flex items-center gap-1">
                  <span class="w-2 h-2 rounded-full bg-zinc-400"></span>
                  Core (ID): {{ coreMmValue.toFixed(1) }} mm
                </span>
                <span class="text-amber-400 flex items-center gap-1">
                  <span class="w-2 h-2 rounded-full bg-amber-400"></span>
                  Tebal Gulungan: {{ calculatedWallThicknessMm.toFixed(1) }} mm
                </span>
              </div>
            </div>

            <div class="bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-[11px] text-zinc-600 space-y-1">
              <div class="font-bold text-zinc-800 flex items-center gap-1.5">
                <span>💡 Formula Fisika Gulungan:</span>
              </div>
              <p class="font-mono text-[10.5px] text-zinc-500">
                Panjang (L) = π × (OD² - ID²) ÷ (4 × Ketebalan)
              </p>
              <p class="text-[10.5px]">
                Kalkulasi ini mengasumsikan kerapatan gulungan 100% (faktor winding normal tanpa celah udara berlebih). Untuk film bertekstur atau metallize dengan air entrapment, deviasi aktual berkisar antara 1% - 3%.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>

    <!-- ========================================================================= -->
    <!-- TAB 2: KALKULATOR BERAT TEORI & QC YIELD TOLERANSI -->
    <!-- ========================================================================= -->
    <div v-else-if="activeTab === 'qc_weight'" class="space-y-6">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <!-- Input Parameters Card -->
        <div class="lg:col-span-6 bg-white rounded-3xl p-5 sm:p-6 border border-zinc-200 shadow-xs space-y-4">
          <div class="flex items-center justify-between border-b border-zinc-100 pb-3">
            <h2 class="text-sm font-black text-zinc-900 flex items-center gap-2">
              <span class="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm font-black font-mono">2</span>
              <span>Data Spesifikasi Roll & Timbangan Aktual</span>
            </h2>
            <span class="px-2 py-0.5 rounded text-[10.5px] font-bold bg-zinc-100 text-zinc-700 font-mono">QC Formula</span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <!-- Thickness -->
            <div class="space-y-1.5">
              <label class="font-bold text-zinc-700">Ketebalan Film (Micron / µm)</label>
              <input
                v-model.number="qcTebal"
                @focus="$event.target.select()"
                type="number"
                step="0.5"
                min="1"
                class="w-full px-3 py-2.5 rounded-xl border border-zinc-300 font-mono text-sm font-bold text-zinc-900 outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="20"
              />
            </div>

            <!-- Width -->
            <div class="space-y-1.5">
              <label class="font-bold text-zinc-700">Lebar Roll (Width / mm)</label>
              <input
                v-model.number="qcLebar"
                @focus="$event.target.select()"
                type="number"
                step="5"
                min="10"
                class="w-full px-3 py-2.5 rounded-xl border border-zinc-300 font-mono text-sm font-bold text-zinc-900 outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="1060"
              />
            </div>

            <!-- Length -->
            <div class="space-y-1.5">
              <label class="font-bold text-zinc-700">Panjang Roll (Meter / m)</label>
              <input
                v-model.number="qcPanjang"
                @focus="$event.target.select()"
                type="number"
                step="10"
                min="1"
                class="w-full px-3 py-2.5 rounded-xl border border-zinc-300 font-mono text-sm font-bold text-zinc-900 outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="6000"
              />
            </div>

            <!-- Density Selection -->
            <div class="space-y-1.5">
              <label class="font-bold text-zinc-700">Berat Jenis / Density (g/cm³)</label>
              <input
                v-model.number="selectedMaterial.density"
                @focus="$event.target.select()"
                type="number"
                step="0.01"
                min="0.5"
                class="w-full px-3 py-2.5 rounded-xl border border-zinc-300 font-mono text-sm font-bold text-zinc-900 outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="0.91"
              />
            </div>

            <!-- Berat Aktual Timbangan -->
            <div class="sm:col-span-2 space-y-1.5 pt-2 border-t border-zinc-100">
              <div class="flex justify-between items-center">
                <label class="font-bold text-zinc-900 text-xs flex items-center gap-1.5">
                  <span>⚖️ Berat Netto Aktual Timbangan Lapangan</span>
                  <span class="text-red-500">*</span>
                </label>
                <span class="text-[11px] text-zinc-400 font-mono">Hasil Timbangan Nyata</span>
              </div>
              <div class="relative">
                <input
                  v-model.number="qcAktual"
                  @focus="$event.target.select()"
                  type="number"
                  step="0.1"
                  min="0"
                  class="w-full px-4 py-3 rounded-xl border-2 border-emerald-500/50 bg-emerald-50/20 font-mono text-lg font-black text-zinc-900 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  placeholder="Masukkan berat netto timbangan (kg)"
                />
                <span class="absolute right-4 top-3.5 text-xs font-mono font-black text-emerald-700">KG</span>
              </div>
            </div>
          </div>
        </div>

        <!-- QC Diagnosis & Yield Card -->
        <div class="lg:col-span-6 space-y-4">
          
          <!-- Diagnosis Result Header -->
          <div
            :class="[
              'rounded-3xl p-6 border shadow-xs transition-all space-y-3',
              qcStatusClass
            ]"
          >
            <div class="flex items-center justify-between">
              <span class="text-xs font-black uppercase tracking-wider font-mono flex items-center gap-1.5">
                <span>{{ qcStatusIcon }}</span>
                <span>STATUS KELAYAKAN TEBAL & NETTO</span>
              </span>
              <span class="text-xs font-black font-mono px-2.5 py-0.5 rounded-full border bg-white/80">
                Deviasi: {{ qcDeviasiPct > 0 ? '+' : '' }}{{ qcDeviasiPct.toFixed(2) }}%
              </span>
            </div>

            <div class="flex items-baseline gap-3 my-2">
              <div class="text-3xl sm:text-4xl font-black font-mono">
                {{ qcStatusTitle }}
              </div>
            </div>

            <p class="text-xs leading-relaxed opacity-90">
              {{ qcStatusDescription }}
            </p>
          </div>

          <!-- Theoretical Calculation Comparison Details -->
          <div class="bg-white rounded-3xl p-5 sm:p-6 border border-zinc-200 shadow-xs space-y-4">
            <h3 class="text-xs font-black text-zinc-800 uppercase tracking-wider">Perbandingan Data Standar vs Aktual</h3>

            <div class="grid grid-cols-2 gap-3 text-xs">
              <div class="bg-zinc-50 p-3.5 rounded-2xl border border-zinc-200">
                <div class="text-[11px] font-bold text-zinc-500">Berat Teori Standar</div>
                <div class="text-xl font-black font-mono text-zinc-900 mt-1">
                  {{ qcBeratTeori.toFixed(2) }} <span class="text-xs font-bold text-zinc-500">kg</span>
                </div>
                <div class="text-[10px] text-zinc-400 mt-0.5 font-mono">Rumus: (T × L × P × D) / 10⁶</div>
              </div>

              <div class="bg-zinc-50 p-3.5 rounded-2xl border border-zinc-200">
                <div class="text-[11px] font-bold text-zinc-500">Selisih Berat (Δ Netto)</div>
                <div
                  :class="[
                    'text-xl font-black font-mono mt-1',
                    qcSelisihKg > 0 ? 'text-amber-700' : (qcSelisihKg < 0 ? 'text-blue-700' : 'text-emerald-700')
                  ]"
                >
                  {{ qcSelisihKg > 0 ? '+' : '' }}{{ qcSelisihKg.toFixed(2) }} <span class="text-xs font-bold text-zinc-500">kg</span>
                </div>
                <div class="text-[10px] text-zinc-400 mt-0.5 font-mono">Aktual - Teori</div>
              </div>

              <div class="bg-zinc-50 p-3.5 rounded-2xl border border-zinc-200">
                <div class="text-[11px] font-bold text-zinc-500">Yield Area per Kg</div>
                <div class="text-xl font-black font-mono text-zinc-900 mt-1">
                  {{ qcYieldPerKg.toFixed(2) }} <span class="text-xs font-bold text-zinc-500">m²/kg</span>
                </div>
                <div class="text-[10px] text-zinc-400 mt-0.5 font-mono">1000 / (Tebal × Density)</div>
              </div>

              <div class="bg-zinc-50 p-3.5 rounded-2xl border border-zinc-200">
                <div class="text-[11px] font-bold text-zinc-500">Gramature (GSM)</div>
                <div class="text-xl font-black font-mono text-zinc-900 mt-1">
                  {{ (qcTebal * (selectedMaterial.density || 0.90)).toFixed(2) }} <span class="text-xs font-bold text-zinc-500">g/m²</span>
                </div>
                <div class="text-[10px] text-zinc-400 mt-0.5 font-mono">Gram per meter persegi</div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>

    <!-- ========================================================================= -->
    <!-- TAB 3: OPTIMASI POTONG SLITTING & TRIM WASTE -->
    <!-- ========================================================================= -->
    <div v-else-if="activeTab === 'slitting_trim'" class="space-y-6">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <!-- Parent Roll & Slit List Input -->
        <div class="lg:col-span-6 bg-white rounded-3xl p-5 sm:p-6 border border-zinc-200 shadow-xs space-y-4">
          <div class="flex items-center justify-between border-b border-zinc-100 pb-3">
            <h2 class="text-sm font-black text-zinc-900 flex items-center gap-2">
              <span class="w-7 h-7 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center text-sm font-black font-mono">3</span>
              <span>Susunan Pisau & Lebar Roll Induk</span>
            </h2>
            <span class="px-2 py-0.5 rounded text-[10.5px] font-bold bg-zinc-100 text-zinc-700 font-mono">Slitting Layout</span>
          </div>

          <!-- Lebar Master Roll Induk -->
          <div class="space-y-1.5 text-xs">
            <div class="flex justify-between items-center">
              <label class="font-bold text-zinc-900">Lebar Roll Induk / Jumbo Parent (mm)</label>
              <span class="text-zinc-400 font-mono">Ukuran bahan masuk</span>
            </div>
            <div class="relative">
              <input
                v-model.number="parentWidthMm"
                @focus="$event.target.select()"
                type="number"
                step="5"
                min="100"
                class="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 font-mono text-base font-black text-zinc-900 focus:ring-2 focus:ring-orange-500 outline-none"
                placeholder="2165"
              />
              <span class="absolute right-3.5 top-3 text-xs font-mono font-bold text-zinc-400">MM</span>
            </div>
          </div>

          <!-- Slit Cuts List -->
          <div class="space-y-2 pt-2 border-t border-zinc-100 text-xs">
            <div class="flex justify-between items-center">
              <label class="font-bold text-zinc-800">Daftar Potongan Anak (Slit Cuts)</label>
              <button
                @click="addSlitCut"
                class="px-2.5 py-1 rounded-lg text-xs font-bold bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200 transition-colors cursor-pointer flex items-center gap-1"
              >
                <span>+ Tambah Ukuran</span>
              </button>
            </div>

            <div class="space-y-2 max-h-[260px] overflow-y-auto pr-1">
              <div
                v-for="(slit, idx) in slitCuts"
                :key="slit.id"
                class="flex items-center gap-2 bg-zinc-50 p-2.5 rounded-xl border border-zinc-200"
              >
                <span class="w-6 text-center font-mono font-bold text-zinc-400 text-[11px]">#{{ idx + 1 }}</span>
                <div class="flex-1 relative">
                  <input
                    v-model.number="slit.width"
                    @focus="$event.target.select()"
                    type="number"
                    step="5"
                    min="10"
                    placeholder="Lebar (mm)"
                    class="w-full px-2.5 py-1.5 rounded-lg border border-zinc-300 text-xs font-mono font-bold text-zinc-900 bg-white"
                  />
                  <span class="absolute right-2.5 top-2 text-[10px] text-zinc-400 font-bold">mm</span>
                </div>
                <div class="w-24 relative">
                  <input
                    v-model.number="slit.qty"
                    @focus="$event.target.select()"
                    type="number"
                    min="1"
                    placeholder="Qty"
                    class="w-full px-2 py-1.5 rounded-lg border border-zinc-300 text-xs font-mono font-bold text-zinc-900 bg-white"
                  />
                  <span class="absolute right-2 top-2 text-[10px] text-zinc-400 font-bold">roll</span>
                </div>
                <div class="w-20 text-right font-mono font-black text-xs text-zinc-800">
                  {{ (slit.width * slit.qty) || 0 }} mm
                </div>
                <button
                  v-if="slitCuts.length > 1"
                  @click="removeSlitCut(idx)"
                  class="p-1 text-zinc-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors cursor-pointer"
                  title="Hapus baris potongan"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Slitting Layout Visualization & Trim Report -->
        <div class="lg:col-span-6 space-y-4">
          
          <!-- Trim Metrics Card -->
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div class="bg-white p-4 rounded-3xl border border-zinc-200 shadow-xs flex flex-col justify-between">
              <span class="text-[11px] font-bold text-zinc-500 font-mono">LEBAR DIGUNAKAN</span>
              <div class="my-1.5">
                <div class="text-2xl font-black font-mono text-zinc-900">{{ totalSlitUsedWidth }}</div>
                <div class="text-[11px] text-zinc-400 font-mono">dari {{ parentWidthMm }} mm</div>
              </div>
              <div class="text-[10.5px] text-zinc-500 border-t border-zinc-100 pt-1.5">
                Total: <strong>{{ totalRollsSlit }} Roll Anak</strong>
              </div>
            </div>

            <div class="bg-white p-4 rounded-3xl border border-zinc-200 shadow-xs flex flex-col justify-between">
              <span class="text-[11px] font-bold text-zinc-500 font-mono">TOTAL SISA TRIM</span>
              <div class="my-1.5">
                <div
                  :class="[
                    'text-2xl font-black font-mono',
                    totalTrimMm < 0 ? 'text-red-600' : 'text-orange-600'
                  ]"
                >
                  {{ totalTrimMm }} <span class="text-xs font-bold text-zinc-500">mm</span>
                </div>
                <div class="text-[11px] text-zinc-400 font-mono">≈ {{ (totalTrimMm / 2).toFixed(1) }} mm / sisi</div>
              </div>
              <div class="text-[10.5px] text-zinc-500 border-t border-zinc-100 pt-1.5">
                Trim Samping Kiri & Kanan
              </div>
            </div>

            <div class="col-span-2 sm:col-span-1 bg-white p-4 rounded-3xl border border-zinc-200 shadow-xs flex flex-col justify-between">
              <span class="text-[11px] font-bold text-zinc-500 font-mono">PERSENTASE TRIM</span>
              <div class="my-1.5">
                <div class="text-2xl font-black font-mono text-zinc-900">
                  {{ trimPercentage.toFixed(2) }}%
                </div>
                <div class="text-[11px] text-zinc-400 font-mono">Waste Pinggiran</div>
              </div>
              <div class="text-[10.5px] text-zinc-500 border-t border-zinc-100 pt-1.5">
                Efisiensi: <strong>{{ (100 - trimPercentage).toFixed(1) }}%</strong>
              </div>
            </div>
          </div>

          <!-- Visual Bar Layout -->
          <div class="bg-white rounded-3xl p-5 sm:p-6 border border-zinc-200 shadow-xs space-y-3">
            <div class="flex items-center justify-between text-xs">
              <span class="font-black text-zinc-800 uppercase tracking-wider">Visualisasi Bentangan Potong Pisau</span>
              <span class="font-mono text-zinc-500 font-bold">100% = {{ parentWidthMm }} mm</span>
            </div>

            <!-- Visual Segmented Bar -->
            <div class="w-full bg-zinc-200 rounded-xl h-10 p-1 flex items-center overflow-hidden border border-zinc-300">
              <!-- Left Trim -->
              <div
                v-if="totalTrimMm > 0 && parentWidthMm > 0"
                :style="{ width: `${Math.min(50, (totalTrimMm / 2 / parentWidthMm) * 100)}%` }"
                class="h-full bg-orange-400/80 border-r border-orange-500 flex items-center justify-center text-[9px] font-black text-white font-mono truncate"
                title="Trim Kiri"
              >
                T
              </div>

              <!-- Slit Child Rolls -->
              <template v-for="(slit, sIdx) in expandedSlitSegments" :key="sIdx">
                <div
                  v-if="parentWidthMm > 0"
                  :style="{ width: `${Math.min(100, (slit.width / parentWidthMm) * 100)}%` }"
                  class="h-full bg-indigo-600 border-r border-indigo-700 flex items-center justify-center text-[10px] font-bold text-white font-mono truncate px-1"
                  :title="`Roll #${sIdx + 1}: ${slit.width}mm`"
                >
                  {{ slit.width }}
                </div>
              </template>

              <!-- Right Trim -->
              <div
                v-if="totalTrimMm > 0 && parentWidthMm > 0"
                :style="{ width: `${Math.min(50, (totalTrimMm / 2 / parentWidthMm) * 100)}%` }"
                class="h-full bg-orange-400/80 flex items-center justify-center text-[9px] font-black text-white font-mono truncate"
                title="Trim Kanan"
              >
                T
              </div>
            </div>

            <!-- Alert Notice if trim is too small or negative -->
            <div v-if="totalTrimMm < 0" class="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-center gap-2">
              <span class="text-base">⚠️</span>
              <div>
                <strong>Over Capacity!</strong> Total potongan melebihi lebar roll induk sebesar {{ Math.abs(totalTrimMm) }} mm. Mohon kurangi ukuran atau jumlah potongan.
              </div>
            </div>
            <div v-else-if="totalTrimMm / 2 < 10" class="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2">
              <span class="text-base">⚠️</span>
              <div>
                <strong>Peringatan Trim Terlalu Tipis!</strong> Sisa trim tepi per sisi kurang dari 10 mm ({{ (totalTrimMm / 2).toFixed(1) }} mm), berisiko selip atau web-break di mesin slitting.
              </div>
            </div>
            <div v-else class="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
              <span class="text-base">✅</span>
              <div>
                <strong>Kombinasi Pisau Ideal.</strong> Sisa trim tepi {{ (totalTrimMm / 2).toFixed(1) }} mm per sisi sangat stabil untuk penarikan trim blower mesin.
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>

    <!-- ========================================================================= -->
    <!-- TAB 4: ESTIMASI WAKTU PRODUKSI & RUNTIME MESIN -->
    <!-- ========================================================================= -->
    <div v-else-if="activeTab === 'runtime_calc'" class="space-y-6">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <!-- Input Speed & Length -->
        <div class="lg:col-span-6 bg-white rounded-3xl p-5 sm:p-6 border border-zinc-200 shadow-xs space-y-4">
          <div class="flex items-center justify-between border-b border-zinc-100 pb-3">
            <h2 class="text-sm font-black text-zinc-900 flex items-center gap-2">
              <span class="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-sm font-black font-mono">4</span>
              <span>Parameter Kecepatan & Durasi Mesin</span>
            </h2>
            <span class="px-2 py-0.5 rounded text-[10.5px] font-bold bg-zinc-100 text-zinc-700 font-mono">Time Study</span>
          </div>

          <div class="space-y-4 text-xs">
            <div class="space-y-1.5">
              <label class="font-bold text-zinc-700">Panjang Roll yang Dikerjakan (Meter)</label>
              <input
                v-model.number="runLength"
                @focus="$event.target.select()"
                type="number"
                step="50"
                min="1"
                class="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 font-mono text-base font-black text-zinc-900 outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="6000"
              />
            </div>

            <div class="space-y-1.5">
              <div class="flex justify-between items-center">
                <label class="font-bold text-zinc-700">Line Speed Mesin Aktual (m/menit)</label>
                <span class="text-zinc-400 font-mono">{{ runSpeed }} m/min</span>
              </div>
              <input
                v-model.number="runSpeed"
                @focus="$event.target.select()"
                type="number"
                step="10"
                min="10"
                class="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 font-mono text-base font-black text-zinc-900 outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="350"
              />
              <!-- Preset Speed -->
              <div class="flex items-center gap-1.5 pt-1 flex-wrap">
                <span class="text-[10px] text-zinc-400 font-bold">Preset:</span>
                <button
                  v-for="spd in [200, 250, 300, 350, 400, 450, 500]"
                  :key="spd"
                  @click="runSpeed = spd"
                  :class="[
                    'px-2 py-0.5 rounded-md text-[10.5px] font-mono font-bold border transition-colors cursor-pointer',
                    runSpeed === spd ? 'bg-blue-50 text-blue-700 border-blue-300 font-black' : 'bg-zinc-50 text-zinc-600 border-zinc-200 hover:bg-zinc-100'
                  ]"
                >
                  {{ spd }}m/m
                </button>
              </div>
            </div>

            <div class="space-y-1.5">
              <label class="font-bold text-zinc-700">Waktu Ganti Roll & Setup Pisau (Menit)</label>
              <input
                v-model.number="runSetupMinutes"
                @focus="$event.target.select()"
                type="number"
                step="1"
                min="0"
                class="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 font-mono text-sm font-bold text-zinc-900 outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="10"
              />
              <p class="text-[11px] text-zinc-400">Termasuk unloading, pasang paper core baru, dan threading webbing.</p>
            </div>
          </div>
        </div>

        <!-- Output Runtime & ETA -->
        <div class="lg:col-span-6 space-y-4">
          <div class="bg-gradient-to-br from-zinc-900 to-zinc-800 text-white rounded-3xl p-6 border border-zinc-700 shadow-md space-y-4">
            <div class="flex items-center justify-between">
              <span class="text-xs font-black uppercase tracking-wider text-blue-400 font-mono">ESTIMASI SELESAI RUNNING</span>
              <span class="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-800">
                ETA Selesai: {{ etaFinishTime }}
              </span>
            </div>

            <div class="flex items-baseline gap-3 my-2">
              <div class="text-4xl sm:text-5xl font-black font-mono tracking-tight text-white">
                {{ formatDurationHoursMinutes(pureRunningMinutes) }}
              </div>
              <div class="text-sm font-bold text-zinc-400 font-mono">Waktu Putar</div>
            </div>

            <div class="grid grid-cols-2 gap-3 text-xs border-t border-zinc-700/80 pt-4 font-mono">
              <div>
                <span class="text-zinc-400 text-[11px]">Total Waktu + Setup:</span>
                <div class="text-base font-bold text-white mt-0.5">
                  {{ formatDurationHoursMinutes(pureRunningMinutes + runSetupMinutes) }}
                </div>
              </div>
              <div>
                <span class="text-zinc-400 text-[11px]">Kapasitas Shift (8 Jam):</span>
                <div class="text-base font-bold text-emerald-400 mt-0.5">
                  ≈ {{ maxRollsPerShift }} Roll / Shift
                </div>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-3xl p-5 border border-zinc-200 shadow-xs space-y-2 text-xs">
            <h3 class="font-black text-zinc-800 uppercase tracking-wider">Kapasitas Produksi per Shift (8 Jam Kerja)</h3>
            <p class="text-zinc-500">
              Berdasarkan kecepatan <strong class="text-zinc-800 font-mono">{{ runSpeed }} m/menit</strong> dan cycle time roll, mesin dapat menyelesaikan total sekitar <strong class="text-zinc-900 font-mono">{{ (maxRollsPerShift * runLength).toLocaleString('id-ID') }} meter</strong> film per shift operasional.
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- ========================================================================= -->
    <!-- TAB 5: UNIT CONVERTER KHUSUS INDUSTRI FILM -->
    <!-- ========================================================================= -->
    <div v-else-if="activeTab === 'unit_conv'" class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        <!-- 1. Converter Ketebalan (Micron / Gauge / Mil / mm) -->
        <div class="bg-white rounded-3xl p-5 sm:p-6 border border-zinc-200 shadow-xs space-y-4">
          <div class="flex items-center gap-2 border-b border-zinc-100 pb-3">
            <span class="text-lg">📏</span>
            <h3 class="text-xs font-black uppercase tracking-wider text-zinc-800">Ketebalan Film (Thickness)</h3>
          </div>

          <div class="space-y-3 text-xs">
            <div class="space-y-1">
              <label class="text-[11px] font-bold text-zinc-500 font-mono">Micron (µm):</label>
              <input
                v-model.number="convMicron"
                @focus="$event.target.select()"
                @input="updateFromMicron"
                type="number"
                class="w-full px-3 py-2 rounded-xl border border-zinc-300 font-mono text-sm font-black text-zinc-900"
              />
            </div>
            <div class="space-y-1">
              <label class="text-[11px] font-bold text-zinc-500 font-mono">Gauge (ga):</label>
              <input
                v-model.number="convGauge"
                @focus="$event.target.select()"
                @input="updateFromGauge"
                type="number"
                class="w-full px-3 py-2 rounded-xl border border-zinc-300 font-mono text-sm font-bold text-zinc-900"
              />
            </div>
            <div class="space-y-1">
              <label class="text-[11px] font-bold text-zinc-500 font-mono">Mil (thou / 0.001 in):</label>
              <input
                v-model.number="convMil"
                @focus="$event.target.select()"
                @input="updateFromMil"
                type="number"
                class="w-full px-3 py-2 rounded-xl border border-zinc-300 font-mono text-sm font-bold text-zinc-900"
              />
            </div>
            <div class="space-y-1">
              <label class="text-[11px] font-bold text-zinc-500 font-mono">Milimeter (mm):</label>
              <input
                v-model.number="convMm"
                @focus="$event.target.select()"
                @input="updateFromMm"
                type="number"
                class="w-full px-3 py-2 rounded-xl border border-zinc-300 font-mono text-sm font-bold text-zinc-900"
              />
            </div>
          </div>
        </div>

        <!-- 2. Converter Dimensi Panjang & Lebar -->
        <div class="bg-white rounded-3xl p-5 sm:p-6 border border-zinc-200 shadow-xs space-y-4">
          <div class="flex items-center gap-2 border-b border-zinc-100 pb-3">
            <span class="text-lg">📐</span>
            <h3 class="text-xs font-black uppercase tracking-wider text-zinc-800">Panjang & Lebar (Length)</h3>
          </div>

          <div class="space-y-3 text-xs">
            <div class="space-y-1">
              <label class="text-[11px] font-bold text-zinc-500 font-mono">Milimeter (mm):</label>
              <input
                v-model.number="convDimMm"
                @focus="$event.target.select()"
                @input="updateFromDimMm"
                type="number"
                class="w-full px-3 py-2 rounded-xl border border-zinc-300 font-mono text-sm font-black text-zinc-900"
              />
            </div>
            <div class="space-y-1">
              <label class="text-[11px] font-bold text-zinc-500 font-mono">Centimeter (cm):</label>
              <input
                v-model.number="convDimCm"
                @focus="$event.target.select()"
                @input="updateFromDimCm"
                type="number"
                class="w-full px-3 py-2 rounded-xl border border-zinc-300 font-mono text-sm font-bold text-zinc-900"
              />
            </div>
            <div class="space-y-1">
              <label class="text-[11px] font-bold text-zinc-500 font-mono">Meter (m):</label>
              <input
                v-model.number="convDimM"
                @focus="$event.target.select()"
                @input="updateFromDimM"
                type="number"
                class="w-full px-3 py-2 rounded-xl border border-zinc-300 font-mono text-sm font-bold text-zinc-900"
              />
            </div>
            <div class="space-y-1">
              <label class="text-[11px] font-bold text-zinc-500 font-mono">Inches (in):</label>
              <input
                v-model.number="convDimInch"
                @focus="$event.target.select()"
                @input="updateFromDimInch"
                type="number"
                class="w-full px-3 py-2 rounded-xl border border-zinc-300 font-mono text-sm font-bold text-zinc-900"
              />
            </div>
          </div>
        </div>

        <!-- 3. Converter Berat & Dyne -->
        <div class="bg-white rounded-3xl p-5 sm:p-6 border border-zinc-200 shadow-xs space-y-4">
          <div class="flex items-center gap-2 border-b border-zinc-100 pb-3">
            <span class="text-lg">⚡</span>
            <h3 class="text-xs font-black uppercase tracking-wider text-zinc-800">Berat & Tegangan Permukaan</h3>
          </div>

          <div class="space-y-3 text-xs">
            <div class="space-y-1">
              <label class="text-[11px] font-bold text-zinc-500 font-mono">Kilogram (kg):</label>
              <input
                v-model.number="convKg"
                @focus="$event.target.select()"
                @input="updateFromKg"
                type="number"
                class="w-full px-3 py-2 rounded-xl border border-zinc-300 font-mono text-sm font-black text-zinc-900"
              />
            </div>
            <div class="space-y-1">
              <label class="text-[11px] font-bold text-zinc-500 font-mono">Pounds (lbs):</label>
              <input
                v-model.number="convLbs"
                @focus="$event.target.select()"
                @input="updateFromLbs"
                type="number"
                class="w-full px-3 py-2 rounded-xl border border-zinc-300 font-mono text-sm font-bold text-zinc-900"
              />
            </div>
            <div class="space-y-1 pt-2 border-t border-zinc-100">
              <label class="text-[11px] font-bold text-indigo-700 font-mono">Dyne / Corona Test (dyne/cm):</label>
              <input
                v-model.number="convDyne"
                @focus="$event.target.select()"
                type="number"
                class="w-full px-3 py-2 rounded-xl border border-indigo-300 font-mono text-sm font-black text-indigo-900 bg-indigo-50/30"
              />
              <p class="text-[10.5px] text-zinc-400 mt-1">1 dyne/cm = 1 mN/m (Standar treat corona/plasma film metallizing: 38 - 42 dyne).</p>
            </div>
          </div>
        </div>

      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue';

// ----------------------------------------------------
// TABS & MATERIALS MASTER DATA
// ----------------------------------------------------
const activeTab = ref('roll_calc');

const tabs = [
  {
    id: 'roll_calc',
    label: 'Geometri Roll (OD ↔ Length)',
    icon: `<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/><line x1="12" y1="3" x2="12" y2="9"/></svg>`
  },
  {
    id: 'qc_weight',
    label: 'Berat Teori & QC Netto',
    icon: `<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 3v18M3 9l9-6 9 6M6 12l-3 6h6l-3-6zm12 0l-3 6h6l-3-6z"/></svg>`
  },
  {
    id: 'slitting_trim',
    label: 'Optimasi Potong & Trim Slitting',
    icon: `<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></svg>`
  },
  {
    id: 'runtime_calc',
    label: 'Runtime Mesin & Shift',
    icon: `<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`
  },
  {
    id: 'unit_conv',
    label: 'Unit Converter Film',
    icon: `<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>`
  }
];

const materials = [
  { name: 'BOPP', density: 0.91 },
  { name: 'CPP / VMCPP', density: 0.90 },
  { name: 'PET / VMPET', density: 1.40 },
  { name: 'PE / LLDPE', density: 0.92 }
];

const selectedMaterial = reactive({ name: 'CPP / VMCPP', density: 0.90 });

const selectMaterial = (m) => {
  selectedMaterial.name = m.name;
  selectedMaterial.density = m.density;
};

// ----------------------------------------------------
// TAB 1: ROLL GEOMETRY (HANDYMATH SUITE)
// ----------------------------------------------------
const rollCalcMode = ref('FIND_LENGTH'); // 'FIND_LENGTH' | 'FIND_OD'

const inputOD = ref(68.2); // cm default
const odUnit = ref('cm'); // 'cm' | 'mm' | 'inch'

// Auto-convert number when changing unit to prevent mismatch / error
const setOdUnit = (newUnit) => {
  if (odUnit.value === newUnit) return;
  let mmVal = Number(inputOD.value) || 0;
  if (odUnit.value === 'cm') mmVal *= 10;
  else if (odUnit.value === 'inch') mmVal *= 25.4;

  if (newUnit === 'cm') {
    inputOD.value = parseFloat((mmVal / 10).toFixed(2));
  } else if (newUnit === 'mm') {
    inputOD.value = parseFloat(mmVal.toFixed(1));
  } else if (newUnit === 'inch') {
    inputOD.value = parseFloat((mmVal / 25.4).toFixed(2));
  }
  odUnit.value = newUnit;
};

const inputLength = ref(6000); // meter default
const lengthUnit = ref('m'); // 'm' | 'km'

const setLengthUnit = (newUnit) => {
  if (lengthUnit.value === newUnit) return;
  const currVal = Number(inputLength.value) || 0;
  if (newUnit === 'km') {
    inputLength.value = parseFloat((currVal / 1000).toFixed(3));
  } else if (newUnit === 'm') {
    inputLength.value = Math.round(currVal * 1000);
  }
  lengthUnit.value = newUnit;
};

const coreType = ref('6inch'); // '3inch' | '6inch' | 'custom'
const customCoreMm = ref(152.4);

const inputMicron = ref(20); // 20 um
const inputWidthMm = ref(1060); // 1060 mm

// Core ID in mm
const coreMmValue = computed(() => {
  if (coreType.value === '3inch') return 76.2;
  if (coreType.value === '6inch') return 152.4;
  return Number(customCoreMm.value) || 152.4;
});

// Normalized OD in mm
const activeOdMm = computed(() => {
  if (rollCalcMode.value === 'FIND_LENGTH') {
    const raw = Number(inputOD.value) || 0;
    if (odUnit.value === 'cm') return raw * 10;
    if (odUnit.value === 'inch') return raw * 25.4;
    return raw; // mm
  } else {
    return calculatedODmm.value;
  }
});

// Validates whether OD is strictly greater than Core ID
const isOdValid = computed(() => {
  if (rollCalcMode.value === 'FIND_LENGTH') {
    return activeOdMm.value > coreMmValue.value;
  }
  return true;
});

// Mode 1 Calculation: Given OD, find Length (Meter)
// Formula: L = π × (OD² - ID²) / (4 × thickness_in_mm) / 1000
const calculatedLengthMeter = computed(() => {
  const odMm = activeOdMm.value;
  const idMm = coreMmValue.value;
  const thickMm = (Number(inputMicron.value) || 20) / 1000;
  if (odMm <= idMm || thickMm <= 0) return 0;

  const lengthMm = (Math.PI * (odMm * odMm - idMm * idMm)) / (4 * thickMm);
  return Math.round(lengthMm / 1000);
});

// Mode 2 Calculation: Given Length, find OD (mm)
// Formula: OD = sqrt(ID² + (4 × L_mm × thickness_mm / π))
const calculatedODmm = computed(() => {
  if (rollCalcMode.value === 'FIND_LENGTH') return activeOdMm.value;
  const idMm = coreMmValue.value;
  const thickMm = (Number(inputMicron.value) || 20) / 1000;
  const rawL = Number(inputLength.value) || 0;
  const lengthM = lengthUnit.value === 'km' ? rawL * 1000 : rawL;
  const lengthMm = lengthM * 1000;

  if (lengthMm <= 0 || thickMm <= 0) return idMm;
  const odSq = idMm * idMm + (4 * lengthMm * thickMm) / Math.PI;
  return Math.sqrt(odSq);
});

// Calculated Wall Thickness (Build) in mm
const calculatedWallThicknessMm = computed(() => {
  const od = activeOdMm.value;
  const id = coreMmValue.value;
  return Math.max(0, (od - id) / 2);
});

// Estimated Laps (Putaran Gulungan)
const calculatedLaps = computed(() => {
  const wallMm = calculatedWallThicknessMm.value;
  const thickMm = (Number(inputMicron.value) || 20) / 1000;
  if (thickMm <= 0 || !isOdValid.value) return 0;
  return Math.round(wallMm / thickMm);
});

// Calculated Weight (Kg)
// Weight (kg) = (Thick_mc × Width_mm × Length_m × Density) / 1,000,000
const calculatedWeightKg = computed(() => {
  const rawLen = rollCalcMode.value === 'FIND_LENGTH' 
    ? (isOdValid.value ? calculatedLengthMeter.value : 0) 
    : (lengthUnit.value === 'km' ? (Number(inputLength.value) || 0) * 1000 : (Number(inputLength.value) || 0));
  const w = Number(inputWidthMm.value) || 0;
  const t = Number(inputMicron.value) || 0;
  const d = Number(selectedMaterial.density) || 0.90;
  return (t * w * rawLen * d) / 1000000;
});

// Dynamic SVG Visualization Radii (Normalized between 15px and 85px)
const visualOdRadius = computed(() => 80);
const visualCoreRadius = computed(() => {
  const od = activeOdMm.value || 1;
  const id = coreMmValue.value || 1;
  if (od <= id) return 40;
  const ratio = Math.min(0.75, Math.max(0.18, id / od));
  return 80 * ratio;
});

const isCopied = ref(false);
const copyValue = (val) => {
  navigator.clipboard.writeText(String(val));
  isCopied.value = true;
  setTimeout(() => { isCopied.value = false; }, 1800);
};

// ----------------------------------------------------
// TAB 2: QC THEORETICAL WEIGHT & TOLERANCE
// ----------------------------------------------------
const qcTebal = ref(20);
const qcLebar = ref(1060);
const qcPanjang = ref(6000);
const qcAktual = ref(114.5);

const qcBeratTeori = computed(() => {
  const t = Number(qcTebal.value) || 0;
  const l = Number(qcLebar.value) || 0;
  const p = Number(qcPanjang.value) || 0;
  const d = Number(selectedMaterial.density) || 0.90;
  return (t * l * p * d) / 1000000;
});

const qcSelisihKg = computed(() => {
  const akt = Number(qcAktual.value) || 0;
  const teo = qcBeratTeori.value || 0;
  return akt - teo;
});

const qcDeviasiPct = computed(() => {
  const teo = qcBeratTeori.value || 0;
  if (teo <= 0) return 0;
  return (qcSelisihKg.value / teo) * 100;
});

const qcYieldPerKg = computed(() => {
  const t = Number(qcTebal.value) || 1;
  const d = Number(selectedMaterial.density) || 0.90;
  return 1000 / (t * d);
});

const qcStatusTitle = computed(() => {
  const dev = qcDeviasiPct.value;
  if (Math.abs(dev) <= 2.5) return 'IDEAL / PASS';
  if (dev > 2.5 && dev <= 5.0) return 'CENDERUNG TEBAL (OVERWEIGHT)';
  if (dev > 5.0) return 'OUT OF SPEC (+TEBAL TINGGI)';
  if (dev < -2.5 && dev >= -5.0) return 'CENDERUNG TIPIS (UNDERWEIGHT)';
  return 'OUT OF SPEC (-TIPIS EKSTRIM)';
});

const qcStatusClass = computed(() => {
  const dev = qcDeviasiPct.value;
  if (Math.abs(dev) <= 2.5) return 'bg-emerald-50 text-emerald-950 border-emerald-300';
  if (Math.abs(dev) <= 5.0) return 'bg-amber-50 text-amber-950 border-amber-300';
  return 'bg-red-50 text-red-950 border-red-300';
});

const qcStatusIcon = computed(() => {
  const dev = qcDeviasiPct.value;
  if (Math.abs(dev) <= 2.5) return '✅';
  if (Math.abs(dev) <= 5.0) return '⚠️';
  return '🚨';
});

const qcStatusDescription = computed(() => {
  const dev = qcDeviasiPct.value;
  if (Math.abs(dev) <= 2.5) {
    return 'Berat timbangan berada dalam toleransi ketat QC (±2.5%). Profil ketebalan film merata dan yield produksi optimal.';
  }
  if (dev > 2.5) {
    return 'Roll lebih berat dari teori. Waspadai pemborosan bahan baku (yield loss) atau indikasi film lebih tebal dari target SPK.';
  }
  return 'Roll lebih ringan dari standar teori. Waspadai film mengalami under-gauge / ketebalan di bawah spesifikasi yang berisiko komplain kekuatan tarik.';
});

// ----------------------------------------------------
// TAB 3: SLITTING CUTS & TRIM WASTE
// ----------------------------------------------------
const parentWidthMm = ref(2165);

const slitCuts = ref([
  { id: 1, width: 500, qty: 4 }
]);

const addSlitCut = () => {
  slitCuts.value.push({ id: Date.now(), width: 500, qty: 1 });
};

const removeSlitCut = (idx) => {
  slitCuts.value.splice(idx, 1);
};

const totalSlitUsedWidth = computed(() => {
  return slitCuts.value.reduce((sum, item) => sum + ((Number(item.width) || 0) * (Number(item.qty) || 0)), 0);
});

const totalRollsSlit = computed(() => {
  return slitCuts.value.reduce((sum, item) => sum + (Number(item.qty) || 0), 0);
});

const totalTrimMm = computed(() => {
  return (Number(parentWidthMm.value) || 0) - totalSlitUsedWidth.value;
});

const trimPercentage = computed(() => {
  const parent = Number(parentWidthMm.value) || 0;
  if (parent <= 0) return 0;
  return Math.max(0, (totalTrimMm.value / parent) * 100);
});

const expandedSlitSegments = computed(() => {
  const segs = [];
  slitCuts.value.forEach(slit => {
    const qty = Number(slit.qty) || 0;
    for (let i = 0; i < qty; i++) {
      segs.push({ width: Number(slit.width) || 0 });
    }
  });
  return segs;
});

// ----------------------------------------------------
// TAB 4: MACHINE RUNTIME & PRODUCTION ESTIMATE
// ----------------------------------------------------
const runLength = ref(6000);
const runSpeed = ref(350); // m/min
const runSetupMinutes = ref(10);

const pureRunningMinutes = computed(() => {
  const l = Number(runLength.value) || 0;
  const s = Number(runSpeed.value) || 1;
  return s > 0 ? l / s : 0;
});

const maxRollsPerShift = computed(() => {
  const cycleTime = pureRunningMinutes.value + (Number(runSetupMinutes.value) || 0);
  if (cycleTime <= 0) return 0;
  return Math.floor((8 * 60) / cycleTime);
});

const etaFinishTime = computed(() => {
  const totalMins = pureRunningMinutes.value + (Number(runSetupMinutes.value) || 0);
  const now = new Date();
  now.setMinutes(now.getMinutes() + Math.round(totalMins));
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  return `${hh}:${mm} WIB`;
});

const formatDurationHoursMinutes = (totalMinutes) => {
  if (!totalMinutes || totalMinutes <= 0) return '0 Menit';
  const hrs = Math.floor(totalMinutes / 60);
  const mins = Math.round(totalMinutes % 60);
  if (hrs === 0) return `${mins} Menit`;
  return `${hrs} Jam ${mins} Mnt`;
};

// ----------------------------------------------------
// TAB 5: UNIT CONVERTER (CLEAN NON-CIRCULAR UPDATES)
// ----------------------------------------------------
// Thickness
const convMicron = ref(20);
const convGauge = ref(80);
const convMil = ref(0.787);
const convMm = ref(0.02);

const updateFromMicron = () => {
  const mc = Number(convMicron.value) || 0;
  convGauge.value = parseFloat((mc * 4).toFixed(1));
  convMil.value = parseFloat((mc * 0.03937).toFixed(3));
  convMm.value = parseFloat((mc / 1000).toFixed(4));
};

const updateFromGauge = () => {
  const ga = Number(convGauge.value) || 0;
  const mc = ga / 4;
  convMicron.value = parseFloat(mc.toFixed(2));
  convMil.value = parseFloat((mc * 0.03937).toFixed(3));
  convMm.value = parseFloat((mc / 1000).toFixed(4));
};

const updateFromMil = () => {
  const mil = Number(convMil.value) || 0;
  const mc = mil / 0.03937;
  convMicron.value = parseFloat(mc.toFixed(2));
  convGauge.value = parseFloat((mc * 4).toFixed(1));
  convMm.value = parseFloat((mc / 1000).toFixed(4));
};

const updateFromMm = () => {
  const mm = Number(convMm.value) || 0;
  const mc = mm * 1000;
  convMicron.value = parseFloat(mc.toFixed(1));
  convGauge.value = parseFloat((mc * 4).toFixed(1));
  convMil.value = parseFloat((mc * 0.03937).toFixed(3));
};

// Dimension
const convDimMm = ref(1000);
const convDimCm = ref(100);
const convDimM = ref(1);
const convDimInch = ref(39.37);

const updateFromDimMm = () => {
  const mm = Number(convDimMm.value) || 0;
  convDimCm.value = parseFloat((mm / 10).toFixed(2));
  convDimM.value = parseFloat((mm / 1000).toFixed(4));
  convDimInch.value = parseFloat((mm / 25.4).toFixed(2));
};

const updateFromDimCm = () => {
  const cm = Number(convDimCm.value) || 0;
  const mm = cm * 10;
  convDimMm.value = parseFloat(mm.toFixed(2));
  convDimM.value = parseFloat((mm / 1000).toFixed(4));
  convDimInch.value = parseFloat((mm / 25.4).toFixed(2));
};

const updateFromDimM = () => {
  const m = Number(convDimM.value) || 0;
  const mm = m * 1000;
  convDimMm.value = parseFloat(mm.toFixed(1));
  convDimCm.value = parseFloat((mm / 10).toFixed(2));
  convDimInch.value = parseFloat((mm / 25.4).toFixed(2));
};

const updateFromDimInch = () => {
  const inch = Number(convDimInch.value) || 0;
  const mm = inch * 25.4;
  convDimMm.value = parseFloat(mm.toFixed(2));
  convDimCm.value = parseFloat((mm / 10).toFixed(2));
  convDimM.value = parseFloat((mm / 1000).toFixed(4));
};

// Weight
const convKg = ref(100);
const convLbs = ref(220.46);
const convDyne = ref(38);

const updateFromKg = () => {
  const kg = Number(convKg.value) || 0;
  convLbs.value = parseFloat((kg * 2.20462).toFixed(2));
};

const updateFromLbs = () => {
  const lbs = Number(convLbs.value) || 0;
  convKg.value = parseFloat((lbs / 2.20462).toFixed(2));
};
</script>

<style scoped>
/* Industrial Minimalist subtle transitions */
.scrollbar-none::-webkit-scrollbar {
  display: none;
}
.scrollbar-none {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
