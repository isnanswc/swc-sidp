<template>
  <div class="space-y-6 font-sans select-none max-w-5xl mx-auto pb-10">
    <!-- Header Banner -->
    <div class="bg-white p-4 sm:p-5 rounded-2xl border border-zinc-200 shadow-xs flex items-center justify-between gap-4">
      <div class="flex items-center gap-3.5">
        <div class="w-11 h-11 rounded-2xl bg-zinc-950 text-white flex items-center justify-center shadow-sm border border-zinc-800">
          <svg class="w-6 h-6 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </div>
        <div>
          <h1 class="text-base sm:text-lg font-black text-zinc-900 tracking-tight">PENGATURAN SISTEM & AI</h1>
          <p class="text-xs text-zinc-500 font-medium">
            Konfigurasi Google AI API Key, daftar model real-time, dan lembar otomatisasi AI terjadwal.
          </p>
        </div>
      </div>
    </div>

    <!-- Tab Switcher (Sheet Navigasi) -->
    <div class="flex items-center gap-2 border-b border-zinc-200 pb-2">
      <button
        type="button"
        @click="activeTab = 'gemini'"
        :class="[
          'px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-2xs',
          activeTab === 'gemini'
            ? 'bg-zinc-900 text-white shadow-xs'
            : 'bg-white text-zinc-600 hover:bg-zinc-100 border border-zinc-200'
        ]"
      >
        <span>✨ Google Gemini Engine</span>
        <span
          :class="[
            'px-1.5 py-0.2 text-[9.5px] rounded-full font-black',
            isKeyConfigured ? 'bg-emerald-500/20 text-emerald-300' : 'bg-zinc-600 text-zinc-300'
          ]"
        >
          {{ isKeyConfigured ? 'Aktif' : 'Off' }}
        </span>
      </button>

      <button
        type="button"
        @click="activeTab = 'automation'"
        :class="[
          'px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-2xs',
          activeTab === 'automation'
            ? 'bg-zinc-900 text-white shadow-xs'
            : 'bg-white text-zinc-600 hover:bg-zinc-100 border border-zinc-200'
        ]"
      >
        <span>🤖 Automation AI (Sheet)</span>
        <span class="px-1.5 py-0.2 text-[9.5px] rounded-full font-black bg-blue-100 text-blue-800">
          1 Otomasi
        </span>
      </button>

      <button
        type="button"
        @click="activeTab = 'sign'"
        :class="[
          'px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-2xs',
          activeTab === 'sign'
            ? 'bg-zinc-900 text-white shadow-xs'
            : 'bg-white text-zinc-600 hover:bg-zinc-100 border border-zinc-200'
        ]"
      >
        <span>🏷️ Sign Ribbon Label</span>
        <span class="px-1.5 py-0.2 text-[9.5px] rounded-full font-black bg-purple-100 text-purple-800">
          {{ configStore.labelSignList.length }} Aturan
        </span>
      </button>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════════════ -->
    <!-- TAB 1: GOOGLE GEMINI AI CONFIGURATION                                  -->
    <!-- ═══════════════════════════════════════════════════════════════════════ -->
    <div v-if="activeTab === 'gemini'" class="space-y-6 animate-fade-in">
      <div class="bg-white rounded-2xl border border-zinc-200 shadow-xs overflow-hidden">
        <div class="px-5 py-4 border-b border-zinc-100 bg-zinc-50/70 flex items-center justify-between flex-wrap gap-2">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
              ✨
            </div>
            <div>
              <h2 class="text-sm font-black text-zinc-900">Google Gemini AI Engine</h2>
              <p class="text-[11px] text-zinc-500">Ekstraksi cerdas teks tabel, laporan fisik & analisis defect</p>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <span
              :class="[
                'px-2.5 py-0.5 rounded-full text-[10px] font-black border',
                isKeyConfigured
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  : 'bg-zinc-100 text-zinc-500 border-zinc-300'
              ]"
            >
              {{ isKeyConfigured ? '● API Key Aktif' : '○ Belum Dikonfigurasi' }}
            </span>
          </div>
        </div>

        <div class="p-5 space-y-4">
          <!-- API Key Input Field -->
          <div>
            <div class="flex items-center justify-between mb-1">
              <label class="block text-xs font-bold text-zinc-800">
                Google AI Studio API Key <span class="text-red-500">*</span>
              </label>
              <span class="text-[10px] text-zinc-400 font-mono">Tersimpan di Browser (IndexedDB)</span>
            </div>

            <div class="relative">
              <input
                v-model="apiKey"
                :type="showApiKey ? 'text' : 'password'"
                placeholder="Masukkan API Key (AIzaSy...)"
                @change="onApiKeyChanged"
                class="w-full px-3.5 py-2 text-xs border border-zinc-300 rounded-xl font-mono focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none pr-20 bg-white"
              />
              <button
                type="button"
                @click="showApiKey = !showApiKey"
                class="absolute right-2 top-2 px-2 py-0.5 rounded text-[10px] font-bold text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 transition-colors cursor-pointer"
              >
                {{ showApiKey ? 'Sembunyikan' : 'Tampilkan' }}
              </button>
            </div>
          </div>

          <!-- Real-Time Model Selection & Live Sync -->
          <div class="p-4 bg-zinc-50/80 rounded-2xl border border-zinc-200 space-y-3">
            <div class="flex items-center justify-between flex-wrap gap-2">
              <div>
                <label class="block text-xs font-black text-zinc-900 flex items-center gap-1.5">
                  <span>Pilihan Model AI Vision & Text (Daftar Real-Time)</span>
                  <span v-if="isFetchingModels" class="animate-spin text-blue-600 text-xs">⏳</span>
                </label>
                <p class="text-[10.5px] text-zinc-500 mt-0.5">
                  Model diambil langsung secara *real-time* dari server Google AI sesuai API Key Anda.
                </p>
              </div>

              <button
                type="button"
                @click="fetchModelsRealtime"
                :disabled="!apiKey || isFetchingModels"
                class="px-3 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-zinc-100 border border-zinc-300 text-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
                title="Hubungi server Google AI untuk memperbarui daftar model terbaru"
              >
                <svg class="w-3.5 h-3.5 text-blue-600" :class="isFetchingModels ? 'animate-spin' : ''" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                </svg>
                <span>{{ isFetchingModels ? 'Memuat Model...' : '🔄 Perbarui Daftar Model' }}</span>
              </button>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-12 gap-2">
              <div class="sm:col-span-8">
                <select
                  v-model="selectedModel"
                  class="w-full px-3 py-2 text-xs border border-zinc-300 rounded-xl font-bold bg-white outline-none focus:ring-2 focus:ring-red-500 cursor-pointer"
                >
                  <optgroup label="Model Google AI yang Terdeteksi Aktif">
                    <option
                      v-for="m in availableModels"
                      :key="m.id"
                      :value="m.id"
                    >
                      {{ m.displayName || m.id }} ({{ m.id }})
                    </option>
                  </optgroup>
                  <optgroup label="Kustom / Input Manual">
                    <option value="__custom__">✏️ Tulis Nama Model Kustom Manual...</option>
                  </optgroup>
                </select>
              </div>

              <div v-if="selectedModel === '__custom__' || isCustomModel" class="sm:col-span-4">
                <input
                  v-model="customModelName"
                  type="text"
                  placeholder="Contoh: gemini-2.0-flash-exp"
                  class="w-full px-3 py-2 text-xs border border-zinc-300 rounded-xl font-mono font-bold text-red-600 bg-white outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>

            <div v-if="activeModelInfo" class="p-2.5 bg-white rounded-xl border border-zinc-200 text-xs flex items-center justify-between">
              <div class="min-w-0 pr-2">
                <span class="font-bold text-zinc-900 block truncate">{{ activeModelInfo.displayName }}</span>
                <span class="text-[10px] text-zinc-500 block truncate">{{ activeModelInfo.description || 'Model siap digunakan untuk ekstraksi gambar dan tabel.' }}</span>
              </div>
              <span class="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-mono font-bold text-[10px] border border-blue-200 shrink-0">
                {{ activeModelId }}
              </span>
            </div>
          </div>

          <!-- Connection Test Status Box -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label class="block text-xs font-bold text-zinc-800 mb-1">Status Verifikasi Koneksi</label>
              <div class="h-9 px-3 rounded-xl border border-zinc-200 bg-zinc-50 flex items-center justify-between text-xs">
                <span class="text-zinc-600 font-medium truncate">{{ testStatusText }}</span>
                <span v-if="isTesting" class="animate-spin text-zinc-500 shrink-0">⏳</span>
                <span v-else-if="testSuccess === true" class="text-emerald-600 font-bold shrink-0">✓ Terhubung</span>
                <span v-else-if="testSuccess === false" class="text-red-600 font-bold shrink-0">✕ Gagal</span>
              </div>
            </div>

            <div class="flex items-end">
              <button
                type="button"
                @click="testApiConnection"
                :disabled="!apiKey || isTesting"
                class="w-full h-9 px-4 rounded-xl text-xs font-bold bg-zinc-100 hover:bg-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-800 border border-zinc-300 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>🔌 Uji Koneksi Model Terpilih</span>
              </button>
            </div>
          </div>

          <!-- Save Button -->
          <div class="flex items-center justify-end pt-3 border-t border-zinc-100">
            <button
              type="button"
              @click="saveSettings"
              class="px-6 py-2 rounded-xl text-xs font-black bg-red-600 hover:bg-red-500 text-white shadow-md shadow-red-600/25 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
              <span>Simpan Pengaturan Gemini</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Section Guide -->
      <div class="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-2xl p-5 text-white border border-zinc-800 shadow-md space-y-3">
        <div class="flex items-center gap-2">
          <span class="text-amber-400 text-base">💡</span>
          <h3 class="text-xs font-black tracking-wide uppercase text-zinc-100">
            Cara Mendapatkan Google AI Studio API Key (Gratis)
          </h3>
        </div>
        <ol class="list-decimal list-inside text-xs text-zinc-300 space-y-1.5 pl-1">
          <li>Buka portal resmi <strong>Google AI Studio</strong> di <a href="https://aistudio.google.com/" target="_blank" class="text-red-400 hover:underline font-mono">https://aistudio.google.com/</a>.</li>
          <li>Login menggunakan akun Google Anda.</li>
          <li>Klik menu <strong>"Get API Key"</strong> di navigasi samping.</li>
          <li>Klik tombol <strong>"Create API key in new project"</strong> lalu salin kunci yang dihasilkan.</li>
          <li>Tempel kunci tersebut ke formulir di atas dan klik <strong>Simpan Pengaturan Gemini</strong>.</li>
        </ol>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════════════ -->
    <!-- TAB 2: AUTOMATION AI SHEET (DAFTAR OTOMASI AI & DETAIL)               -->
    <!-- ═══════════════════════════════════════════════════════════════════════ -->
    <div v-else-if="activeTab === 'automation'" class="space-y-6 animate-fade-in">
      <!-- Sheet Automation Header -->
      <div class="bg-white rounded-2xl border border-zinc-200 shadow-xs overflow-hidden">
        <div class="px-5 py-4 border-b border-zinc-100 bg-zinc-50/70 flex items-center justify-between flex-wrap gap-2">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-sm">
              ⚡
            </div>
            <div>
              <h2 class="text-sm font-black text-zinc-900">Daftar Automation AI Aktif</h2>
              <p class="text-[11px] text-zinc-500">Tugas cerdas yang dikerjakan AI secara berkala di latar belakang</p>
            </div>
          </div>

          <span class="px-2.5 py-1 rounded-full text-[10.5px] font-black bg-purple-100 text-purple-800 border border-purple-200">
            1 Task Terkonfigurasi
          </span>
        </div>

        <!-- Automation Items Table / Cards -->
        <div class="divide-y divide-zinc-100">
          
          <!-- AUTOMATION 1 (Defect Quick Tags Extraction) -->
          <div
            @click="openAutomationDrawer"
            class="p-4 sm:p-5 hover:bg-zinc-50/80 transition-all cursor-pointer flex items-center justify-between gap-4 group"
          >
            <div class="flex items-start gap-3.5 min-w-0">
              <div class="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center font-bold text-lg shrink-0 group-hover:scale-105 transition-transform">
                🏷️
              </div>
              <div class="min-w-0 space-y-1">
                <div class="flex items-center gap-2 flex-wrap">
                  <h3 class="text-xs sm:text-sm font-black text-zinc-900 group-hover:text-blue-600 transition-colors">
                    {{ automationConfig.name }}
                  </h3>
                  <span
                    :class="[
                      'px-2 py-0.2 rounded-full text-[10px] font-black border',
                      automationConfig.enabled
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                        : 'bg-zinc-100 text-zinc-500 border-zinc-300'
                    ]"
                  >
                    {{ automationConfig.enabled ? '● Otomasi Aktif' : '○ Non-aktif' }}
                  </span>
                  <span class="px-2 py-0.2 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 font-mono">
                    ⏱️ Setiap {{ automationConfig.frequencyDays || 3 }} Hari Sekali
                  </span>
                </div>

                <p class="text-xs text-zinc-500 line-clamp-1">
                  {{ automationConfig.description }}
                </p>

                <!-- Status Detail Info -->
                <div class="flex items-center gap-3 text-[10.5px] text-zinc-400 font-medium pt-1 flex-wrap">
                  <span>Terakhir Eksekusi: <strong class="text-zinc-700">{{ formatDate(automationConfig.lastRun) }}</strong></span>
                  <span>•</span>
                  <span>Jadwal Berikutnya: <strong class="text-zinc-700">{{ formatDate(automationConfig.nextRun) }}</strong></span>
                  <span>•</span>
                  <span>Tag Aktif: <strong class="text-blue-700">{{ (automationConfig.tags || []).length }} Kata Kunci</strong></span>
                </div>
              </div>
            </div>

            <!-- Right Action Indicator -->
            <div class="flex items-center gap-2 shrink-0">
              <button
                type="button"
                class="px-3 py-1.5 rounded-xl text-xs font-bold bg-white group-hover:bg-zinc-900 group-hover:text-white border border-zinc-200 text-zinc-700 transition-all shadow-2xs flex items-center gap-1"
              >
                <span>Konfigurasi & Riwayat</span>
                <span>➔</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Detail Automation Modal / Drawer -->
      <teleport to="body">
        <div
          v-if="isDrawerOpen"
          class="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-xs animate-fade-in font-sans"
          @click.self="isDrawerOpen = false"
        >
          <div class="bg-white w-full max-w-3xl max-h-[92vh] rounded-3xl shadow-2xl border border-zinc-200 flex flex-col overflow-hidden text-xs">
            
            <!-- Drawer Header -->
            <div class="px-5 py-3.5 border-b border-zinc-100 bg-zinc-50 flex items-center justify-between">
              <div class="flex items-center gap-2.5">
                <span class="text-xl">🏷️</span>
                <div>
                  <h3 class="font-black text-sm text-zinc-900">{{ automationConfig.name }}</h3>
                  <p class="text-[11px] text-zinc-500">Pengaturan frekuensi pemindaian defect database & riwayat eksekusi AI</p>
                </div>
              </div>
              <button
                @click="isDrawerOpen = false"
                class="w-7 h-7 rounded-full bg-zinc-200 hover:bg-zinc-300 text-zinc-700 font-bold flex items-center justify-center cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            <!-- Drawer Body -->
            <div class="p-5 space-y-5 overflow-y-auto flex-1">
              
              <!-- 1. PENGATURAN STATUS & FREKUENSI -->
              <div class="p-4 bg-zinc-50/80 rounded-2xl border border-zinc-200 space-y-3">
                <h4 class="font-black text-zinc-900 uppercase tracking-wide text-xs flex items-center gap-2">
                  <span>⚙️ Pengaturan Jadwal Eksekusi</span>
                </h4>

                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                  <!-- Toggle Aktif -->
                  <div>
                    <label class="block font-bold text-zinc-700 mb-1">Status Otomasi</label>
                    <label class="inline-flex items-center gap-2 cursor-pointer bg-white px-3 py-1.5 rounded-xl border border-zinc-300 shadow-2xs">
                      <input
                        type="checkbox"
                        v-model="automationConfig.enabled"
                        class="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
                      />
                      <span :class="['font-bold text-xs', automationConfig.enabled ? 'text-emerald-700' : 'text-zinc-400']">
                        {{ automationConfig.enabled ? 'Aktif Berjalan' : 'Dinonaktifkan' }}
                      </span>
                    </label>
                  </div>

                  <!-- Frekuensi Pilihan -->
                  <div>
                    <label class="block font-bold text-zinc-700 mb-1">Frekuensi Analisis AI</label>
                    <select
                      v-model.number="automationConfig.frequencyDays"
                      class="w-full px-3 py-1.5 text-xs font-bold border border-zinc-300 rounded-xl bg-white outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-2xs"
                    >
                      <option :value="1">Setiap 1 Hari Sekali</option>
                      <option :value="3">Setiap 3 Hari Sekali (Rekomendasi)</option>
                      <option :value="7">Setiap 7 Hari Sekali (Mingguan)</option>
                      <option :value="14">Setiap 14 Hari Sekali (2 Minggu)</option>
                    </select>
                  </div>

                  <!-- Target Database -->
                  <div>
                    <label class="block font-bold text-zinc-700 mb-1">Target Data Label</label>
                    <div class="px-3 py-1.5 bg-white border border-zinc-300 rounded-xl text-xs font-bold text-zinc-800 shadow-2xs flex items-center gap-1.5">
                      <span class="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[10px]">HOLD</span>
                      <span class="px-1.5 py-0.2 rounded bg-red-100 text-red-800 text-[10px]">REJECT</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 2. REKOMENDASI TAG DEFECT AKTIF -->
              <div class="p-4 bg-blue-50/50 rounded-2xl border border-blue-200/80 space-y-2.5">
                <div class="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h4 class="font-black text-blue-950 uppercase tracking-wide text-xs">
                      🏷️ Daftar Tag Cepat Defect Aktif (Muncul di Form Label)
                    </h4>
                    <p class="text-[10.5px] text-blue-700 mt-0.5">
                      Tag di bawah ini dihasilkan oleh AI berdasarkan ringkasan riwayat defect roll HOLD & REJECT.
                    </p>
                  </div>

                  <!-- Tambah Tag Manual Input -->
                  <div class="flex items-center gap-1.5">
                    <input
                      v-model="newTagInput"
                      @keydown.enter.prevent="addCustomTag"
                      placeholder="Tambah tag baru..."
                      class="px-2.5 py-1 text-xs border border-blue-300 rounded-lg bg-white outline-none focus:ring-1 focus:ring-blue-500 w-36"
                    />
                    <button
                      type="button"
                      @click="addCustomTag"
                      class="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer shadow-xs"
                    >
                      + Tambah
                    </button>
                  </div>
                </div>

                <!-- Chips List -->
                <div class="flex items-center gap-1.5 flex-wrap pt-1">
                  <div
                    v-for="(tag, idx) in automationConfig.tags"
                    :key="idx"
                    class="px-2.5 py-1 rounded-lg bg-white border border-blue-300 text-blue-900 font-bold text-xs shadow-2xs flex items-center gap-1.5 group"
                  >
                    <span>{{ tag }}</span>
                    <button
                      type="button"
                      @click="removeTag(idx)"
                      class="text-blue-400 hover:text-red-600 font-black text-[10px] cursor-pointer"
                      title="Hapus tag"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>

              <!-- 3. TOMBOL EKSEKUSI MANUAL SEKARANG -->
              <div class="flex items-center justify-between p-3.5 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-2xl">
                <div>
                  <h5 class="font-black text-xs text-purple-950">Jalankan Analisis AI Sekarang</h5>
                  <p class="text-[10.5px] text-purple-700">Perbarui rekomendasi tag secara instan dari database saat ini tanpa menunggu jadwal 3 hari.</p>
                </div>

                <button
                  type="button"
                  @click="runAnalysisNow"
                  :disabled="isRunningAnalysis"
                  class="px-4 py-2 rounded-xl text-xs font-black bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white shadow-md shadow-purple-600/20 transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <span v-if="isRunningAnalysis" class="animate-spin">⏳</span>
                  <span v-else>⚡</span>
                  <span>{{ isRunningAnalysis ? 'Memproses AI...' : 'Jalankan Sekarang' }}</span>
                </button>
              </div>

              <!-- 4. RIWAYAT EKSEKUSI AI (HISTORY LOGS) -->
              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <h4 class="font-black text-zinc-900 uppercase tracking-wide text-xs">
                    📜 Riwayat Eksekusi yang Telah Dikerjakan AI
                  </h4>
                  <span class="text-[10px] text-zinc-400 font-medium">
                    Total: {{ (automationConfig.history || []).length }} Eksekusi
                  </span>
                </div>

                <div class="border border-zinc-200 rounded-2xl overflow-hidden shadow-2xs">
                  <table class="w-full text-left text-xs border-collapse">
                    <thead class="bg-zinc-100 border-b border-zinc-200 font-extrabold text-zinc-700 text-[10.5px] uppercase">
                      <tr>
                        <th class="p-2.5">Waktu Eksekusi</th>
                        <th class="p-2.5">Metode AI</th>
                        <th class="p-2.5 text-center">Data Terpindai</th>
                        <th class="p-2.5 text-center">Hasil Tag</th>
                        <th class="p-2.5">Status & Catatan</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-zinc-100 bg-white">
                      <tr
                        v-for="item in automationConfig.history"
                        :key="item.id"
                        class="hover:bg-zinc-50 transition-colors"
                      >
                        <td class="p-2.5 font-mono text-[10.5px] text-zinc-600 font-semibold whitespace-nowrap">
                          {{ formatDate(item.timestamp) }}
                        </td>
                        <td class="p-2.5 font-medium text-zinc-800">
                          <span class="px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 font-mono text-[10px] border border-zinc-200">
                            {{ item.method || 'Google AI' }}
                          </span>
                        </td>
                        <td class="p-2.5 text-center font-bold text-blue-700">
                          {{ item.scannedCount || 0 }} Roll
                        </td>
                        <td class="p-2.5 text-center font-bold text-emerald-700">
                          {{ item.tagsCount || (item.tagsExtracted || []).length }} Tag
                        </td>
                        <td class="p-2.5 text-[10.5px] text-zinc-600">
                          <div class="flex items-center gap-1.5">
                            <span class="text-emerald-600 font-bold">✓</span>
                            <span>{{ item.message }}</span>
                          </div>
                        </td>
                      </tr>

                      <tr v-if="!automationConfig.history || automationConfig.history.length === 0">
                        <td colspan="5" class="p-6 text-center text-zinc-400 italic">
                          Belum ada riwayat eksekusi AI yang tersimpan.
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <!-- Drawer Footer -->
            <div class="px-5 py-3 border-t border-zinc-100 bg-zinc-50 flex items-center justify-end gap-2.5">
              <button
                type="button"
                @click="isDrawerOpen = false"
                class="px-4 py-1.5 rounded-xl text-xs font-bold bg-zinc-200 hover:bg-zinc-300 text-zinc-700 cursor-pointer"
              >
                Tutup
              </button>
              <button
                type="button"
                @click="saveDrawerConfig"
                class="px-6 py-1.5 rounded-xl text-xs font-black bg-red-600 hover:bg-red-500 text-white shadow-md shadow-red-600/20 cursor-pointer"
              >
                💾 Simpan Pengaturan
              </button>
            </div>
          </div>
        </div>
      </teleport>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════════════ -->
    <!-- TAB 3: SIGN RIBBON LABEL CONFIGURATION                                 -->
    <!-- ═══════════════════════════════════════════════════════════════════════ -->
    <div v-if="activeTab === 'sign'" class="space-y-6 animate-fade-in">
      <div class="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 class="font-black text-zinc-900 text-sm">Aturan Sign Ribbon Label</h2>
          <p class="text-xs text-zinc-400 mt-0.5">Tanda visual pojok kiri atas label roll berdasarkan jenis mesin, formula, prefix, atau kategori film</p>
        </div>
        <button
          @click="openSignModal(null)"
          class="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Tambah Aturan Sign
        </button>
      </div>

      <!-- SIGN TABLE -->
      <div class="bg-white rounded-2xl border border-zinc-200 shadow-xs overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-xs">
            <thead class="bg-zinc-100 border-b border-zinc-200">
              <tr>
                <th class="px-4 py-2.5 text-left font-bold text-zinc-600 w-8">#</th>
                <th class="px-4 py-2.5 text-left font-bold text-zinc-600">Nama Aturan</th>
                <th class="px-4 py-2.5 text-left font-bold text-zinc-600">Tipe Pemicu (Trigger)</th>
                <th class="px-4 py-2.5 text-left font-bold text-zinc-600">Nilai Pemicu</th>
                <th class="px-4 py-2.5 text-left font-bold text-zinc-600">Teks Sign</th>
                <th class="px-4 py-2.5 text-center font-bold text-zinc-600 w-44">Visual Badge Pojok Kiri</th>
                <th class="px-4 py-2.5 text-center font-bold text-zinc-600 w-28">Status</th>
                <th class="px-4 py-2.5 text-center font-bold text-zinc-600 w-24">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-zinc-100">
              <tr v-if="configStore.labelSignList.length === 0">
                <td colspan="8" class="py-12 text-center text-zinc-400 text-xs">Belum ada aturan sign label yang dikonfigurasi</td>
              </tr>
              <tr
                v-for="(row, idx) in configStore.labelSignList"
                :key="row.id"
                :class="['hover:bg-zinc-50 transition-colors', idx % 2 === 0 ? '' : 'bg-zinc-50/30']"
              >
                <td class="px-4 py-3 text-zinc-400 font-mono">{{ idx + 1 }}</td>
                <td class="px-4 py-3 font-bold text-zinc-900">{{ row.name }}</td>
                <td class="px-4 py-3">
                  <span class="px-2 py-0.5 rounded bg-zinc-100 font-semibold text-zinc-700 text-[11px]">
                    {{ formatTriggerTypeName(row.triggerType) }}
                  </span>
                </td>
                <td class="px-4 py-3 font-mono font-bold text-zinc-800">{{ row.triggerValue || '—' }}</td>
                <td class="px-4 py-3 font-mono font-black text-zinc-900">{{ row.badgeText }}</td>
                <td class="px-4 py-3 text-center">
                  <span
                    :style="{ backgroundColor: row.bgColor, color: row.textColor || '#ffffff' }"
                    class="inline-block px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wider shadow-xs"
                  >
                    {{ row.badgeText }}
                  </span>
                </td>
                <td class="px-4 py-3 text-center">
                  <button
                    @click="toggleSignActive(row)"
                    :class="[
                      'px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition-colors cursor-pointer',
                      row.active !== false
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                        : 'bg-zinc-100 text-zinc-500 border-zinc-200 hover:bg-zinc-200'
                    ]"
                  >
                    {{ row.active !== false ? 'Aktif' : 'Non-aktif' }}
                  </button>
                </td>
                <td class="px-4 py-3 text-center">
                  <div class="flex items-center justify-center gap-1">
                    <button @click="openSignModal(row)" class="p-1.5 rounded-lg hover:bg-blue-50 text-zinc-400 hover:text-blue-600 transition-colors cursor-pointer" title="Edit Sign">
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                    </button>
                    <button @click="deleteSign(row.id)" class="p-1.5 rounded-lg hover:bg-red-50 text-zinc-400 hover:text-red-600 transition-colors cursor-pointer" title="Hapus Sign">
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

    <!-- ══════ SIGN RIBBON LABEL MODAL (CUSTOM TRIGGER) ══════ -->
    <div v-if="showSignModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div class="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
          <h3 class="font-black text-zinc-900 text-sm">{{ editingSign ? 'Edit' : 'Tambah' }} Aturan Sign Pojok Label</h3>
          <button @click="closeSignModal" class="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400 cursor-pointer">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="px-6 py-4 space-y-3.5">
          <!-- Nama Aturan -->
          <div>
            <label class="block text-[11px] font-bold text-zinc-700 mb-1">Nama Aturan *</label>
            <input
              v-model="signForm.name"
              type="text"
              placeholder="Misal: Inline Casting / SML, B-Grade..."
              class="w-full px-3 py-2 text-xs border border-zinc-300 rounded-xl focus:ring-1 focus:ring-purple-500 outline-none font-bold"
              autofocus
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <!-- Tipe Pemicu -->
            <div>
              <label class="block text-[11px] font-bold text-zinc-700 mb-1">Tipe Pemicu (Trigger) *</label>
              <select v-model="signForm.triggerType" class="w-full px-2.5 py-2 text-xs border border-zinc-300 rounded-xl focus:ring-1 focus:ring-purple-500 outline-none bg-white font-semibold">
                <option value="JENIS_MESIN">Nama Mesin (Contoh: SML)</option>
                <option value="KODE_PACK">Prefix Pra-CodePack (Contoh: R)</option>
                <option value="KODE_FORMULA">Kode Formula (Contoh: M01)</option>
                <option value="KATEGORI_FILM">Kategori Film (Contoh: METAL)</option>
              </select>
            </div>
            <!-- Nilai Pemicu -->
            <div>
              <label class="block text-[11px] font-bold text-zinc-700 mb-1">Nilai Pemicu (Trigger Value) *</label>
              <input
                v-model="signForm.triggerValue"
                type="text"
                placeholder="Misal: SML, M01, R..."
                class="w-full px-3 py-2 text-xs border border-zinc-300 rounded-xl focus:ring-1 focus:ring-purple-500 outline-none font-mono font-bold uppercase"
              />
            </div>
          </div>

          <!-- Teks Badge Pojok -->
          <div>
            <label class="block text-[11px] font-bold text-zinc-700 mb-1">Teks Sign Pojok Label *</label>
            <input
              v-model="signForm.badgeText"
              type="text"
              placeholder="Misal: INLINE SML, B-GRADE..."
              class="w-full px-3 py-2 text-xs border border-zinc-300 rounded-xl focus:ring-1 focus:ring-purple-500 outline-none font-mono font-bold uppercase"
            />
          </div>

          <!-- Pilihan Warna Badge -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-[11px] font-bold text-zinc-700 mb-1">Warna Background (Bg Color)</label>
              <div class="flex items-center gap-2">
                <input v-model="signForm.bgColor" type="color" class="w-9 h-9 rounded-xl border border-zinc-300 cursor-pointer p-0.5" />
                <input v-model="signForm.bgColor" type="text" class="flex-1 px-2.5 py-1.5 text-xs border border-zinc-300 rounded-xl font-mono uppercase" />
              </div>
            </div>
            <div>
              <label class="block text-[11px] font-bold text-zinc-700 mb-1">Warna Teks (Text Color)</label>
              <div class="flex items-center gap-2">
                <input v-model="signForm.textColor" type="color" class="w-9 h-9 rounded-xl border border-zinc-300 cursor-pointer p-0.5" />
                <input v-model="signForm.textColor" type="text" class="flex-1 px-2.5 py-1.5 text-xs border border-zinc-300 rounded-xl font-mono uppercase" />
              </div>
            </div>
          </div>

          <!-- Live Preview Banner -->
          <div class="p-3 bg-zinc-900 text-white rounded-xl border border-zinc-800 space-y-2">
            <span class="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">Pratinjau Sign Pojok Label:</span>
            <div class="p-3 bg-white text-zinc-900 rounded-lg border border-zinc-300 flex items-center justify-between">
              <span
                :style="{ backgroundColor: signForm.bgColor, color: signForm.textColor }"
                class="px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wider shadow-xs"
              >
                {{ signForm.badgeText || 'SIGN TEXT' }}
              </span>
              <span class="font-black text-red-600 text-xs font-sans tracking-wide">PT. SAPTAWARNA CEMERLANG</span>
            </div>
          </div>
        </div>

        <div class="px-6 py-4 border-t border-zinc-100 flex justify-end gap-2">
          <button @click="closeSignModal" class="px-4 py-2 text-xs font-bold text-zinc-600 hover:bg-zinc-100 rounded-xl transition-colors cursor-pointer">Batal</button>
          <button @click="saveSign" class="px-5 py-2 text-xs font-black bg-purple-600 hover:bg-purple-500 text-white rounded-xl transition-colors cursor-pointer">
            {{ editingSign ? 'Simpan Perubahan' : 'Tambahkan Aturan' }}
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue';
import { saveSetting, getSetting } from '@/db';
import { useConfigStore } from '@/stores/configStore';
import {
  getAutomationConfig,
  saveAutomationConfig,
  runDefectTagAnalysis
} from '@/services/aiAutomationService';

const configStore = useConfigStore();
const activeTab = ref('gemini');

// ── SIGN RIBBON LABEL STATE & HANDLERS ──
const showSignModal = ref(false);
const editingSign = ref(null);
const signForm = reactive({
  name: '', triggerType: 'JENIS_MESIN', triggerValue: '',
  badgeText: '', textColor: '#ffffff', bgColor: '#15803d'
});

const openSignModal = (row) => {
  editingSign.value = row;
  if (row) {
    Object.assign(signForm, { ...row });
  } else {
    Object.assign(signForm, {
      name: '', triggerType: 'JENIS_MESIN', triggerValue: '',
      badgeText: '', textColor: '#ffffff', bgColor: '#15803d'
    });
  }
  showSignModal.value = true;
};

const closeSignModal = () => {
  showSignModal.value = false;
  editingSign.value = null;
};

const saveSign = async () => {
  if (!signForm.name || !signForm.badgeText) {
    alert('Nama aturan dan Teks sign wajib diisi.');
    return;
  }
  if (editingSign.value) {
    await configStore.updateSign(editingSign.value.id, { ...signForm });
  } else {
    await configStore.addSign({ ...signForm });
  }
  closeSignModal();
};

const deleteSign = async (id) => {
  if (confirm('Hapus aturan sign ribbon ini?')) {
    await configStore.deleteSign(id);
  }
};

const toggleSignActive = async (row) => {
  await configStore.updateSign(row.id, { active: row.active === false });
};

const formatTriggerTypeName = (type) => {
  switch (type) {
    case 'JENIS_MESIN': return 'Nama Mesin';
    case 'KODE_PACK': return 'Prefix Pra-CodePack';
    case 'KODE_FORMULA': return 'Kode Formula';
    case 'KATEGORI_FILM': return 'Kategori Film';
    default: return type || 'Trigger';
  }
};

// Gemini Tab State
const apiKey = ref('');
const selectedModel = ref('gemini-2.0-flash');
const customModelName = ref('');
const showApiKey = ref(false);

const isTesting = ref(false);
const testSuccess = ref(null);
const testStatusText = ref('Belum diuji');
const isFetchingModels = ref(false);

const DEFAULT_MODELS = [
  { id: 'gemini-2.0-flash', displayName: 'Gemini 2.0 Flash', description: 'Model cepat multimodal Google AI — stabil dan hemat kuota.' },
  { id: 'gemini-2.5-flash', displayName: 'Gemini 2.5 Flash', description: 'Generasi 2.5 Flash (cek ketersediaan regional).' },
  { id: 'gemini-2.5-pro', displayName: 'Gemini 2.5 Pro', description: 'Generasi 2.5 Pro untuk dokumen kompleks.' },
  { id: 'gemini-1.5-flash', displayName: 'Gemini 1.5 Flash', description: 'Generasi 1.5 Flash legacy.' },
  { id: 'gemini-1.5-pro', displayName: 'Gemini 1.5 Pro', description: 'Generasi 1.5 Pro legacy.' }
];

const availableModels = ref([...DEFAULT_MODELS]);

const isKeyConfigured = computed(() => Boolean(apiKey.value && apiKey.value.trim().length > 10));
const isCustomModel = computed(() => selectedModel.value === '__custom__');

const activeModelId = computed(() => {
  if (selectedModel.value === '__custom__') {
    return customModelName.value.trim() || 'gemini-2.0-flash';
  }
  return selectedModel.value;
});

const activeModelInfo = computed(() => {
  return availableModels.value.find(m => m.id === activeModelId.value) || {
    displayName: activeModelId.value,
    description: 'Model kustom Google AI'
  };
});

// Automation Tab State
const isDrawerOpen = ref(false);
const isRunningAnalysis = ref(false);
const newTagInput = ref('');
const automationConfig = ref({
  id: 'defect_quick_tags',
  name: 'Ekstraksi Rekomendasi Tag Cepat Defect (Hold & Reject)',
  description: 'AI membaca riwayat keterangan roll berstatus HOLD dan REJECT untuk memperbarui daftar rekomendasi tag cepat pada form label.',
  enabled: true,
  frequencyDays: 3,
  lastRun: '',
  nextRun: '',
  tags: [],
  history: []
});

onMounted(async () => {
  apiKey.value = await getSetting('google_ai_api_key', '');
  const savedModel = await getSetting('google_ai_model', 'gemini-2.0-flash');
  const savedModelList = await getSetting('google_ai_available_models', null);

  if (savedModelList && Array.isArray(savedModelList) && savedModelList.length > 0) {
    availableModels.value = savedModelList;
  }

  const isPreset = availableModels.value.some(m => m.id === savedModel);
  if (isPreset) {
    selectedModel.value = savedModel;
  } else {
    selectedModel.value = '__custom__';
    customModelName.value = savedModel;
  }

  if (apiKey.value && apiKey.value.trim().length > 10) {
    fetchModelsRealtime();
  }

  // Load Automation Config
  automationConfig.value = await getAutomationConfig();

  // Load Master Data Config for Label Signs
  await configStore.loadAll();
});

const onApiKeyChanged = () => {
  if (apiKey.value && apiKey.value.trim().length > 10) {
    fetchModelsRealtime();
  }
};

const fetchModelsRealtime = async () => {
  if (!apiKey.value.trim()) return;

  isFetchingModels.value = true;
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models`;
    const res = await fetch(url, {
      headers: {
        'x-goog-api-key': apiKey.value.trim()
      }
    });
    if (res.ok) {
      const data = await res.json();
      if (data.models && Array.isArray(data.models)) {
        const geminiModels = data.models
          .filter(m => {
            const hasGenerate = m.supportedGenerationMethods?.includes('generateContent');
            const isGemini = m.name?.includes('gemini');
            return hasGenerate && isGemini;
          })
          .map(m => ({
            id: m.name.replace(/^models\//, ''),
            displayName: m.displayName || m.name.replace(/^models\//, ''),
            description: m.description || ''
          }));

        if (geminiModels.length > 0) {
          availableModels.value = geminiModels;
          await saveSetting('google_ai_available_models', geminiModels);
          testStatusText.value = `Berhasil memuat ${geminiModels.length} model real-time`;
        }
      }
    }
  } catch (err) {
    console.warn('Gagal memuat model secara real-time:', err);
  } finally {
    isFetchingModels.value = false;
  }
};

const saveSettings = async () => {
  const modelToSave = activeModelId.value;
  await saveSetting('google_ai_api_key', apiKey.value.trim());
  await saveSetting('gemini_api_key', apiKey.value.trim());
  await saveSetting('google_ai_model', modelToSave);
  await saveSetting('gemini_model', modelToSave);
  await saveSetting('google_ai_available_models', availableModels.value);
  alert(`Pengaturan Google AI API Key dan Model (${modelToSave}) berhasil disimpan!`);
};

const testApiConnection = async () => {
  if (!apiKey.value.trim()) return;

  const modelTarget = activeModelId.value;
  isTesting.value = true;
  testStatusText.value = `Menguji model ${modelTarget}...`;
  testSuccess.value = null;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelTarget}:generateContent`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey.value.trim()
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: 'Ping test. Reply with word OK.' }] }]
      })
    });

    if (res.ok) {
      testSuccess.value = true;
      testStatusText.value = `Model ${modelTarget} Aktif & Siap!`;
    } else {
      const errData = await res.json();
      testSuccess.value = false;
      testStatusText.value = `Gagal (${res.status}): ${errData.error?.message || 'Unauthorized'}`;
    }
  } catch {
    testSuccess.value = false;
    testStatusText.value = 'Gagal: Koneksi jaringan terputus';
  } finally {
    isTesting.value = false;
  }
};

// Automation Sheet Methods
const openAutomationDrawer = () => {
  isDrawerOpen.value = true;
};

const addCustomTag = () => {
  const val = newTagInput.value.trim();
  if (!val) return;
  if (!automationConfig.value.tags) automationConfig.value.tags = [];
  if (!automationConfig.value.tags.includes(val)) {
    automationConfig.value.tags.push(val);
  }
  newTagInput.value = '';
};

const removeTag = (index) => {
  if (automationConfig.value.tags) {
    automationConfig.value.tags.splice(index, 1);
  }
};

const runAnalysisNow = async () => {
  isRunningAnalysis.value = true;
  try {
    const res = await runDefectTagAnalysis(true);
    if (res.success) {
      automationConfig.value = await getAutomationConfig();
      alert(`⚡ Analisis AI Berhasil!\n${res.message}`);
    } else {
      alert(`⚠️ ${res.message}`);
    }
  } catch (err) {
    alert(`Gagal: ${err.message}`);
  } finally {
    isRunningAnalysis.value = false;
  }
};

const saveDrawerConfig = async () => {
  await saveAutomationConfig(automationConfig.value);
  alert('Pengaturan Automation AI dan daftar Tag Cepat berhasil disimpan!');
  isDrawerOpen.value = false;
};

const formatDate = (isoStr) => {
  if (!isoStr) return '—';
  try {
    const d = new Date(isoStr);
    return d.toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return isoStr;
  }
};
</script>
