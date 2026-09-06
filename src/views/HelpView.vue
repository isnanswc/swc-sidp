<template>
  <div class="space-y-6 font-sans select-none max-w-6xl mx-auto pb-20">
    <!-- Header Banner: Pure White with Crisp Border & Red Line Accent -->
    <div class="bg-white p-5 sm:p-7 rounded-3xl border border-zinc-200/80 shadow-xs relative overflow-hidden flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-zinc-900 to-red-600"></div>

      <div class="flex items-center gap-4">
        <div class="w-12 h-12 rounded-2xl bg-zinc-900 text-white flex items-center justify-center shadow-md border border-zinc-800 shrink-0">
          <svg class="w-6 h-6 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-base sm:text-xl font-black text-zinc-900 tracking-tight">PUSAT BANTUAN & INFORMASI SISTEM</h1>
            <span class="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-red-50 text-red-600 border border-red-200">
              v2.5 Next-Gen
            </span>
          </div>
          <p class="text-xs text-zinc-500 font-medium mt-0.5">
            Panduan komprehensif M-Label, dokumentasi alur manufaktur, profil pengembang, dan catatan sejarah evolusi sistem.
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2 shrink-0 self-start md:self-auto">
        <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-700 text-xs font-bold">
          <span class="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
          Dokumentasi Resmi
        </span>
      </div>
    </div>

    <!-- Sheet Switcher (Tab Navigation): Clean Pill Design -->
    <div class="flex items-center gap-2 border-b border-zinc-200 pb-2 overflow-x-auto select-none">
      <button
        type="button"
        @click="activeSheet = 'docs'"
        :class="[
          'px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all duration-200 flex items-center gap-2 cursor-pointer shrink-0 shadow-2xs',
          activeSheet === 'docs'
            ? 'bg-zinc-900 text-white shadow-xs'
            : 'bg-white text-zinc-600 hover:bg-zinc-50 border border-zinc-200'
        ]"
      >
        <svg class="w-4 h-4" :class="activeSheet === 'docs' ? 'text-red-400' : 'text-zinc-400'" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
        <span>Panduan Dokumentasi Program</span>
        <span class="px-2 py-0.5 text-[10px] rounded-full font-bold" :class="activeSheet === 'docs' ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-100 text-zinc-500'">
          {{ filteredDocs.length }} Modul
        </span>
      </button>

      <button
        type="button"
        @click="activeSheet = 'about'"
        :class="[
          'px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all duration-200 flex items-center gap-2 cursor-pointer shrink-0 shadow-2xs',
          activeSheet === 'about'
            ? 'bg-zinc-900 text-white shadow-xs'
            : 'bg-white text-zinc-600 hover:bg-zinc-50 border border-zinc-200'
        ]"
      >
        <svg class="w-4 h-4" :class="activeSheet === 'about' ? 'text-red-400' : 'text-zinc-400'" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        <span>Tentang Saya & Sejarah Evolusi</span>
        <span class="px-2 py-0.5 text-[10px] rounded-full font-bold" :class="activeSheet === 'about' ? 'bg-red-600 text-white' : 'bg-red-50 text-red-600 border border-red-200'">
          Creator
        </span>
      </button>
    </div>

    <!-- ======================================================== -->
    <!-- SHEET 1: PANDUAN DOKUMENTASI LENGKAP -->
    <!-- ======================================================== -->
    <div v-show="activeSheet === 'docs'" class="space-y-6">
      <!-- Search & Category Filters -->
      <div class="bg-white p-4 rounded-2xl border border-zinc-200 shadow-xs space-y-3">
        <div class="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div class="relative w-full sm:w-80">
            <svg class="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Cari fitur, SPK, label, offline, rumus..."
              class="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition"
            />
            <button
              v-if="searchQuery"
              @click="searchQuery = ''"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 text-xs cursor-pointer"
            >
              ✕
            </button>
          </div>

          <!-- Category Tags Filter -->
          <div class="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            <button
              v-for="cat in docCategories"
              :key="cat"
              @click="selectedCategory = cat"
              :class="[
                'px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer',
                selectedCategory === cat
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              ]"
            >
              {{ cat }}
            </button>
          </div>
        </div>
      </div>

      <!-- Documentation Accordions / Cards -->
      <div class="grid grid-cols-1 gap-4">
        <div
          v-for="item in filteredDocs"
          :key="item.id"
          class="bg-white rounded-2xl border border-zinc-200 shadow-xs overflow-hidden transition-all duration-200 hover:border-zinc-300"
        >
          <!-- Accordion Header -->
          <div
            @click="toggleDoc(item.id)"
            class="p-4 sm:p-5 flex items-start justify-between gap-4 cursor-pointer select-none bg-gradient-to-r hover:from-zinc-50 hover:to-white transition"
          >
            <div class="flex items-start gap-3.5">
              <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border" :class="item.iconBg">
                <span class="text-lg">{{ item.icon }}</span>
              </div>
              <div>
                <div class="flex items-center gap-2 flex-wrap">
                  <h2 class="text-sm sm:text-base font-bold text-zinc-900">{{ item.title }}</h2>
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider" :class="item.tagClass">
                    {{ item.category }}
                  </span>
                  <span v-if="item.roles" class="text-[10px] text-zinc-400 font-mono">
                    Akses: {{ item.roles.join(', ') }}
                  </span>
                </div>
                <p class="text-xs text-zinc-500 mt-1 leading-relaxed">{{ item.summary }}</p>
              </div>
            </div>

            <div class="flex items-center gap-2 shrink-0 pt-1">
              <span class="text-xs text-zinc-400 font-medium hidden sm:inline">
                {{ expandedDocs[item.id] ? 'Tutup Panduan' : 'Buka Detail' }}
              </span>
              <svg
                :class="['w-5 h-5 text-zinc-400 transition-transform duration-200', expandedDocs[item.id] ? 'rotate-180 text-red-600' : '']"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          <!-- Expanded Content -->
          <div v-if="expandedDocs[item.id]" class="border-t border-zinc-100 p-5 sm:p-6 bg-zinc-50/50 space-y-5">
            <!-- Step-by-Step Instructions -->
            <div>
              <h3 class="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3 flex items-center gap-1.5">
                <svg class="w-4 h-4 text-red-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                </svg>
                Langkah-Langkah Penggunaan (SOP):
              </h3>
              <ol class="space-y-2.5">
                <li
                  v-for="(step, sIdx) in item.steps"
                  :key="sIdx"
                  class="flex items-start gap-3 text-xs sm:text-sm text-zinc-700 bg-white p-3 rounded-xl border border-zinc-200/80 shadow-2xs"
                >
                  <span class="w-5 h-5 rounded-full bg-zinc-900 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    {{ sIdx + 1 }}
                  </span>
                  <div class="flex-1" v-html="step"></div>
                </li>
              </ol>
            </div>

            <!-- Pro Tips & Important Notes -->
            <div v-if="item.tips && item.tips.length" class="bg-amber-50/80 border border-amber-200 rounded-xl p-3.5 space-y-1.5">
              <div class="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                <svg class="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Tips Penting & Best Practices:
              </div>
              <ul class="list-disc list-inside space-y-1 text-xs text-amber-800 leading-relaxed">
                <li v-for="(tip, tIdx) in item.tips" :key="tIdx" v-html="tip"></li>
              </ul>
            </div>

            <!-- Features Highlights Badges -->
            <div v-if="item.features && item.features.length" class="flex items-center gap-2 flex-wrap pt-2">
              <span class="text-[11px] font-bold text-zinc-400">Fitur Utama:</span>
              <span
                v-for="(feat, fIdx) in item.features"
                :key="fIdx"
                class="px-2 py-0.5 rounded-md bg-white border border-zinc-200 text-zinc-700 text-[11px] font-medium shadow-2xs"
              >
                ✓ {{ feat }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- No Results State -->
      <div v-if="filteredDocs.length === 0" class="bg-white rounded-2xl border border-zinc-200 p-12 text-center">
        <div class="w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center mx-auto mb-3 text-zinc-400 text-xl">
          🔍
        </div>
        <h3 class="text-sm font-bold text-zinc-800">Tidak ada panduan yang cocok</h3>
        <p class="text-xs text-zinc-500 mt-1">Coba kata kunci lain atau pilih kategori "Semua".</p>
        <button
          @click="searchQuery = ''; selectedCategory = 'Semua'"
          class="mt-3 px-3 py-1.5 bg-zinc-900 text-white rounded-lg text-xs font-medium cursor-pointer"
        >
          Reset Pencarian
        </button>
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- SHEET 2: ABOUT ME & SEJARAH EVOLUSI (Clean White, Red Accent) -->
    <!-- ======================================================== -->
    <div v-show="activeSheet === 'about'" class="space-y-12">
      <!-- Creator Profile Card: Minimalist Crisp White with Red & Black Accents -->
      <div class="bg-white rounded-3xl p-6 sm:p-10 border border-zinc-200 shadow-sm relative overflow-hidden transition hover:border-zinc-300">
        <!-- Elegant subtle red gradient line on top -->
        <div class="absolute top-0 left-0 right-0 h-1 bg-red-600"></div>

        <!-- Ambient decorative corner watermark -->
        <div class="absolute -right-10 -bottom-10 w-44 h-44 bg-red-50 rounded-full blur-2xl pointer-events-none opacity-60"></div>

        <div class="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">
          <!-- Flat Minimalist Avatar Box with Animated Badge -->
          <div class="relative shrink-0 group">
            <div class="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-zinc-950 text-white p-1 shadow-lg border border-zinc-900 transition-transform duration-300 group-hover:scale-105 flex items-center justify-center">
              <div class="w-full h-full rounded-[22px] bg-white border border-zinc-100 flex flex-col items-center justify-center p-3 text-center relative overflow-hidden">
                <!-- Flat Minimalist Developer Illustration -->
                <svg class="w-12 h-12 text-zinc-900 mb-1 group-hover:text-red-600 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <span class="text-[11px] font-black tracking-wider text-zinc-900 font-mono">ISNAN M.S.</span>
                <span class="text-[8.5px] font-bold text-red-600 uppercase tracking-widest">S.Kom.</span>
              </div>
            </div>
            <!-- Pulse Status Pill -->
            <div class="absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-red-600 text-white text-[9.5px] font-extrabold uppercase tracking-wider shadow-md flex items-center gap-1.5 whitespace-nowrap">
              <span class="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
              Creator
            </div>
          </div>

          <!-- Profile Details -->
          <div class="flex-1 text-center md:text-left space-y-3">
            <div>
              <div class="flex items-center justify-center md:justify-start gap-2.5 flex-wrap">
                <h2 class="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight">
                  Isnan Mauladi Syahputra, S.Kom.
                </h2>
                <span class="px-2.5 py-0.5 rounded-lg bg-zinc-900 text-white text-[11px] font-bold">
                  Lead Software Creator & AI Engineer
                </span>
              </div>
              <p class="text-xs sm:text-sm text-zinc-500 font-medium mt-1">
                Industrial System Architect & Full-Stack Web Developer
              </p>
            </div>

            <!-- Heartfelt Mission Quote -->
            <div class="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80 text-zinc-700 text-xs sm:text-sm leading-relaxed relative">
              <span class="text-red-600 font-black text-lg absolute -top-2 left-3">“</span>
              <p class="italic pl-3 text-zinc-600">
                Program <strong>M-Label</strong> lahir dan dibangun sebagai bentuk kontribusi nyata untuk meringankan serta melipatgandakan efisiensi kerja di lingkungan industri PT. Saptawarna Cemerlang. Menghilangkan beban penulisan manual yang melelahkan, mencegah salah hitung rumus, dan memberikan kepastian data yang rapi dan dapat diandalkan oleh seluruh rekan kerja di pabrik.
              </p>
            </div>

            <!-- Tech Badges: Clean Minimalist Tags -->
            <div class="flex items-center justify-center md:justify-start gap-2 flex-wrap pt-1">
              <span class="px-2.5 py-1 rounded-xl bg-white border border-zinc-200 text-zinc-800 text-xs font-semibold shadow-2xs hover:border-red-300 transition">
                ⚡ Vue 3 & Vite
              </span>
              <span class="px-2.5 py-1 rounded-xl bg-white border border-zinc-200 text-zinc-800 text-xs font-semibold shadow-2xs hover:border-red-300 transition">
                📦 Dexie IndexedDB (Offline-First)
              </span>
              <span class="px-2.5 py-1 rounded-xl bg-white border border-zinc-200 text-zinc-800 text-xs font-semibold shadow-2xs hover:border-red-300 transition">
                ☁️ Supabase Realtime
              </span>
              <span class="px-2.5 py-1 rounded-xl bg-white border border-zinc-200 text-zinc-800 text-xs font-semibold shadow-2xs hover:border-red-300 transition">
                🤖 Google Gemini Vision AI
              </span>
              <span class="px-2.5 py-1 rounded-xl bg-white border border-zinc-200 text-zinc-800 text-xs font-semibold shadow-2xs hover:border-red-300 transition">
                🎨 Tailwind CSS
              </span>
            </div>
          </div>
        </div>

        <!-- Contact & Direct Actions Strip -->
        <div class="mt-8 pt-6 border-t border-zinc-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div class="flex items-center gap-6 text-xs text-zinc-600 flex-wrap justify-center sm:justify-start">
            <!-- Email -->
            <a
              href="mailto:isnanswc@gmail.com"
              class="flex items-center gap-2 group hover:text-red-600 transition font-medium"
            >
              <div class="w-7 h-7 rounded-lg bg-zinc-100 group-hover:bg-red-50 text-zinc-700 group-hover:text-red-600 flex items-center justify-center transition">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <span><strong>Email:</strong> isnanswc@gmail.com</span>
            </a>

            <!-- Location -->
            <div class="flex items-center gap-2">
              <div class="w-7 h-7 rounded-lg bg-zinc-100 text-zinc-700 flex items-center justify-center">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <span><strong>Lokasi:</strong> PT. Saptawarna Cemerlang</span>
            </div>
          </div>

          <div>
            <a
              href="mailto:isnanswc@gmail.com?subject=Tanya%20Sistem%20M-Label"
              class="px-5 py-2.5 rounded-2xl bg-zinc-900 hover:bg-red-600 text-white text-xs font-bold transition-all duration-300 flex items-center gap-2 shadow-xs cursor-pointer group"
            >
              <svg class="w-4 h-4 text-red-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span>Kirim Pesan / Feedback</span>
            </a>
          </div>
        </div>
      </div>

      <!-- Historical Evolution Timeline (Alternating Left-Right Central Axis) -->
      <div class="space-y-8">
        <!-- Title Banner -->
        <div class="text-center max-w-2xl mx-auto space-y-2">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-red-600 border border-red-200 text-xs font-black uppercase tracking-wider">
            <span>🚀</span> Rekam Jejak Transformasi
          </div>
          <h3 class="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight">
            Evolusi Sistem Pembuatan Label & Pengolahan Data
          </h3>
          <p class="text-xs sm:text-sm text-zinc-500 leading-relaxed">
            Perjalanan inovasi berkelanjutan dari lembaran kertas manual hingga menjadi platform Executive Decision Support System.
          </p>
        </div>

        <!-- Central Timeline Container -->
        <div class="relative py-6">
          <!-- Central Vertical Axis Line -->
          <div class="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-zinc-200 via-red-500 to-zinc-200 -translate-x-1/2"></div>

          <div class="space-y-12">
            <!-- ============================================== -->
            <!-- ITEM 1: ERA 0 - MANUAL KERTAS (KIRI di desktop) -->
            <!-- ============================================== -->
            <div class="relative flex flex-col md:flex-row items-center group">
              <!-- Content Card (Left) -->
              <div class="w-full md:w-1/2 pl-12 md:pl-0 md:pr-12">
                <div class="bg-white rounded-3xl p-6 sm:p-7 border border-zinc-200 shadow-xs transition-all duration-300 hover:shadow-lg hover:border-zinc-300 group-hover:-translate-y-1 relative">
                  <!-- Era Badge & Header -->
                  <div class="flex items-center justify-between gap-2 mb-3">
                    <span class="px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider bg-zinc-100 text-zinc-600 border border-zinc-200">
                      Era Pra-Sistem • Masa Lalu
                    </span>
                    <span class="text-[11px] font-mono text-zinc-400">Metode Manual</span>
                  </div>

                  <!-- Flat Minimal Illustration: Paper & Pen -->
                  <div class="mb-4 p-4 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-white border border-zinc-200 flex items-center justify-center shrink-0 text-zinc-700 shadow-2xs">
                      <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                        <line x1="10" y1="9" x2="8" y2="9" />
                      </svg>
                    </div>
                    <div>
                      <h4 class="text-xs sm:text-sm font-bold text-zinc-900">Form Excel / Word Diprint Massal</h4>
                      <p class="text-[11px] text-zinc-500">Pencatatan bertumpu pada kertas fisik & pena</p>
                    </div>
                  </div>

                  <p class="text-xs sm:text-sm text-zinc-600 leading-relaxed mb-4">
                    Sebelum hadirnya sistem, pembuatan label produksi dan pencatatan roll masih menggunakan dokumen Microsoft Word atau Excel yang dicetak banyak. Operator menuliskan seluruh data roll (nomor roll, berat timbangan, spesifikasi bahan, dan meter) menggunakan pulpen secara manual.
                  </p>

                  <!-- Critical Points Box -->
                  <div class="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/80 text-xs text-zinc-600 space-y-1.5">
                    <div class="font-bold text-zinc-800 flex items-center gap-1.5 text-[11.5px]">
                      <span class="text-red-500">✕</span> Titik Kelemahan & Risiko:
                    </div>
                    <ul class="space-y-1 pl-4 list-disc text-[11px] text-zinc-500">
                      <li>Sering terjadi salah tulis identitas nomor roll oleh operator.</li>
                      <li>Tulisan tangan sulit dibaca oleh staf Gudang dan QC.</li>
                      <li>Rawan salah hitung berat teoritis vs timbangan aktual.</li>
                      <li>Kertas fisik mudah kotor, basah, atau hilang di area mesin.</li>
                    </ul>
                  </div>
                </div>
              </div>

              <!-- Center Timeline Node (Number 0) -->
              <div class="absolute left-4 md:left-1/2 top-6 md:top-1/2 -translate-x-1/2 md:-translate-y-1/2 w-9 h-9 rounded-2xl bg-white border-2 border-zinc-300 flex items-center justify-center font-black text-xs text-zinc-600 shadow-md group-hover:border-zinc-900 group-hover:scale-110 transition-all z-10">
                0
              </div>

              <!-- Right Side Spacer (Desktop) -->
              <div class="hidden md:block md:w-1/2"></div>
            </div>

            <!-- ============================================== -->
            <!-- ITEM 2: INOVASI 1 - EXCEL KHUSUS (KANAN di desktop) -->
            <!-- ============================================== -->
            <div class="relative flex flex-col md:flex-row items-center group">
              <!-- Left Side Spacer (Desktop) -->
              <div class="hidden md:block md:w-1/2"></div>

              <!-- Center Timeline Node (Number 1) -->
              <div class="absolute left-4 md:left-1/2 top-6 md:top-1/2 -translate-x-1/2 md:-translate-y-1/2 w-9 h-9 rounded-2xl bg-white border-2 border-zinc-400 flex items-center justify-center font-black text-xs text-zinc-800 shadow-md group-hover:border-red-500 group-hover:scale-110 transition-all z-10">
                1
              </div>

              <!-- Content Card (Right) -->
              <div class="w-full md:w-1/2 pl-12 md:pl-12">
                <div class="bg-white rounded-3xl p-6 sm:p-7 border border-zinc-200 shadow-xs transition-all duration-300 hover:shadow-lg hover:border-zinc-300 group-hover:-translate-y-1 relative">
                  <!-- Era Badge & Header -->
                  <div class="flex items-center justify-between gap-2 mb-3">
                    <span class="px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider bg-zinc-100 text-zinc-800 border border-zinc-200">
                      Inovasi Generasi 1 • Spreadsheet Cerdas
                    </span>
                    <span class="text-[11px] font-mono text-zinc-400">Formula Math</span>
                  </div>

                  <!-- Flat Minimal Illustration: Spreadsheet Automation -->
                  <div class="mb-4 p-4 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-white border border-zinc-200 flex items-center justify-center shrink-0 text-zinc-800 shadow-2xs">
                      <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <line x1="3" y1="9" x2="21" y2="9" />
                        <line x1="3" y1="15" x2="21" y2="15" />
                        <line x1="9" y1="3" x2="9" y2="21" />
                        <line x1="15" y1="3" x2="15" y2="21" />
                      </svg>
                    </div>
                    <div>
                      <h4 class="text-xs sm:text-sm font-bold text-zinc-900">File Excel Khusus Berformula</h4>
                      <p class="text-[11px] text-zinc-500">Perhitungan berat teori & validasi otomatis</p>
                    </div>
                  </div>

                  <p class="text-xs sm:text-sm text-zinc-600 leading-relaxed mb-4">
                    Langkah inovasi pertama diinisiasi oleh <strong>Isnan Mauladi Syahputra, S.Kom.</strong> dengan merancang template Excel khusus yang dilengkapi berbagai formula matematika otomatis. Begitu ukuran tebal, lebar, dan panjang dimasukkan, berat teoritis film dihitung seketika berdasarkan densitas material.
                  </p>

                  <!-- Impact Box -->
                  <div class="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/80 text-xs text-zinc-600 space-y-1.5">
                    <div class="font-bold text-zinc-800 flex items-center gap-1.5 text-[11.5px]">
                      <span class="text-emerald-600">✓</span> Nilai Tambah & Kemajuan:
                    </div>
                    <ul class="space-y-1 pl-4 list-disc text-[11px] text-zinc-500">
                      <li>Operator tidak perlu lagi menghitung manual dengan kalkulator tangan.</li>
                      <li>Mengurangi kesalahan perhitungan berat teori hingga lebih dari 70%.</li>
                      <li>Adanya validasi dasar saat angka yang dimasukkan tidak wajar.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <!-- ============================================== -->
            <!-- ITEM 3: INOVASI 2 - WEB SEDERHANA (KIRI di desktop) -->
            <!-- ============================================== -->
            <div class="relative flex flex-col md:flex-row items-center group">
              <!-- Content Card (Left) -->
              <div class="w-full md:w-1/2 pl-12 md:pl-0 md:pr-12">
                <div class="bg-white rounded-3xl p-6 sm:p-7 border border-zinc-200 shadow-xs transition-all duration-300 hover:shadow-lg hover:border-zinc-300 group-hover:-translate-y-1 relative">
                  <!-- Era Badge & Header -->
                  <div class="flex items-center justify-between gap-2 mb-3">
                    <span class="px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider bg-zinc-900 text-white">
                      Inovasi Generasi 2 • Digitalisasi Web
                    </span>
                    <span class="text-[11px] font-mono text-zinc-400">Web App HTML-JS</span>
                  </div>

                  <!-- Flat Minimal Illustration: Browser & Barcode -->
                  <div class="mb-4 p-4 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-white border border-zinc-200 flex items-center justify-center shrink-0 text-zinc-900 shadow-2xs">
                      <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                        <rect x="2" y="3" width="20" height="14" rx="2" />
                        <line x1="8" y1="21" x2="16" y2="21" />
                        <line x1="12" y1="17" x2="12" y2="21" />
                        <path d="M6 8h.01M9 8h.01" />
                      </svg>
                    </div>
                    <div>
                      <h4 class="text-xs sm:text-sm font-bold text-zinc-900">Program Web Ringan & Barcode Thermal</h4>
                      <p class="text-[11px] text-zinc-500">Antarmuka formulir interaktif di browser</p>
                    </div>
                  </div>

                  <p class="text-xs sm:text-sm text-zinc-600 leading-relaxed mb-4">
                    Untuk mengatasi keterbatasan file Excel yang sering bentrok atau korup saat dibuka banyak komputer, sistem dikembangkan menjadi program web ringan berbasis HTML, CSS, dan JavaScript. Mulai dilengkapi generator barcode instan dan cetak thermal label langsung ke printer lapangan.
                  </p>

                  <!-- Impact Box -->
                  <div class="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/80 text-xs text-zinc-600 space-y-1.5">
                    <div class="font-bold text-zinc-800 flex items-center gap-1.5 text-[11.5px]">
                      <span class="text-emerald-600">✓</span> Dampak Operasional:
                    </div>
                    <ul class="space-y-1 pl-4 list-disc text-[11px] text-zinc-500">
                      <li>Tampilan antarmuka yang bersih dan ramah bagi operator lapangan.</li>
                      <li>Proses cetak label menjadi jauh lebih cepat dan terstandarisasi.</li>
                      <li>Tidak ada lagi ketergantungan pada file spreadsheet lokal.</li>
                    </ul>
                  </div>
                </div>
              </div>

              <!-- Center Timeline Node (Number 2) -->
              <div class="absolute left-4 md:left-1/2 top-6 md:top-1/2 -translate-x-1/2 md:-translate-y-1/2 w-9 h-9 rounded-2xl bg-white border-2 border-zinc-600 flex items-center justify-center font-black text-xs text-zinc-900 shadow-md group-hover:border-red-500 group-hover:scale-110 transition-all z-10">
                2
              </div>

              <!-- Right Side Spacer (Desktop) -->
              <div class="hidden md:block md:w-1/2"></div>
            </div>

            <!-- ============================================== -->
            <!-- ITEM 4: INOVASI TERKINI - M-LABEL NEXT-GEN (KANAN di desktop) -->
            <!-- ============================================== -->
            <div class="relative flex flex-col md:flex-row items-center group">
              <!-- Left Side Spacer (Desktop) -->
              <div class="hidden md:block md:w-1/2"></div>

              <!-- Center Timeline Node (Special Red Glowing Star) -->
              <div class="absolute left-4 md:left-1/2 top-6 md:top-1/2 -translate-x-1/2 md:-translate-y-1/2 w-10 h-10 rounded-2xl bg-red-600 text-white flex items-center justify-center font-black text-sm shadow-lg shadow-red-600/30 group-hover:scale-125 transition-all duration-300 z-10">
                ★
              </div>

              <!-- Content Card (Right - Highlighted) -->
              <div class="w-full md:w-1/2 pl-12 md:pl-12">
                <div class="bg-white rounded-3xl p-6 sm:p-8 border-2 border-red-500/80 shadow-md transition-all duration-300 hover:shadow-xl group-hover:-translate-y-1 relative overflow-hidden">
                  <!-- Red corner ribbon accent -->
                  <div class="absolute top-0 right-0 w-24 h-24 overflow-hidden pointer-events-none">
                    <div class="absolute transform rotate-45 bg-red-600 text-white text-[9px] font-black uppercase py-1 right-[-35px] top-[18px] w-[120px] text-center shadow-xs">
                      Aktif
                    </div>
                  </div>

                  <!-- Era Badge & Header -->
                  <div class="flex items-center gap-2 mb-3">
                    <span class="px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider bg-red-600 text-white shadow-2xs">
                      Generasi Terkini • Modern M-Label
                    </span>
                  </div>

                  <h4 class="text-base sm:text-lg font-black text-zinc-900 mb-2">
                    Enterprise Manufacturing Intelligence & Decision Support System
                  </h4>

                  <p class="text-xs sm:text-sm text-zinc-700 leading-relaxed mb-4">
                    Kini, <strong>M-Label</strong> telah melompat jauh ke depan. Program ini <strong>bukan sekadar alat pendataan Roll ID atau pencetak label</strong>, melainkan sebuah mesin pengolah data industri cerdas yang mengubah input harian lapangan menjadi <strong>informasi strategis untuk pengambilan keputusan tingkat manajemen (Executive Decision Support System)</strong>.
                  </p>

                  <!-- 3 Pillar Capability Cards: Pure White with Crisp Border -->
                  <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-5">
                    <div class="p-3 rounded-2xl bg-zinc-50 border border-zinc-200 text-center space-y-1">
                      <div class="text-base">📊</div>
                      <div class="text-xs font-bold text-zinc-900">Executive Analytics</div>
                      <p class="text-[10px] text-zinc-500 leading-tight">Monitoring KPI tonase, scrap ratio, dan kapasitas mesin real-time.</p>
                    </div>
                    <div class="p-3 rounded-2xl bg-zinc-50 border border-zinc-200 text-center space-y-1">
                      <div class="text-base">🤖</div>
                      <div class="text-xs font-bold text-zinc-900">Google Gemini AI</div>
                      <p class="text-[10px] text-zinc-500 leading-tight">OCR Vision otomatis membaca tabel tulisan tangan operator.</p>
                    </div>
                    <div class="p-3 rounded-2xl bg-zinc-50 border border-zinc-200 text-center space-y-1">
                      <div class="text-base">🛡️</div>
                      <div class="text-xs font-bold text-zinc-900">Offline & Security</div>
                      <p class="text-[10px] text-zinc-500 leading-tight">Dexie IndexedDB tahan mati internet & forced remote logout.</p>
                    </div>
                  </div>

                  <!-- Developer Note Footer -->
                  <div class="p-3 rounded-2xl bg-zinc-900 text-white text-xs flex items-center justify-between gap-3">
                    <div class="flex items-center gap-2">
                      <span class="text-red-400">💡</span>
                      <span class="italic text-[11px] text-zinc-300">
                        "Data yang rapi adalah fondasi efisiensi; dan efisiensi adalah kunci kemenangan industri."
                      </span>
                    </div>
                    <span class="text-[10px] font-mono text-zinc-400 shrink-0">— Isnan M.S.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

// Sheet State: 'docs' | 'about'
const activeSheet = ref('docs');

// Search & Filter State
const searchQuery = ref('');
const selectedCategory = ref('Semua');

const docCategories = ['Semua', 'Produksi & SPK', 'Label & Roll', 'Laporan & AI', 'Gudang & IMS', 'Sistem & Keamanan'];

// Expanded state for documentation items
const expandedDocs = ref({
  'doc-dashboard': true, // Open first doc by default
  'doc-spk': false,
  'doc-label': false,
  'doc-dataroll': false,
  'doc-dereport': false,
  'doc-inventory': false,
  'doc-opname': false,
  'doc-scan': false,
  'doc-tools': false,
  'doc-users': false,
  'doc-offline': false
});

const toggleDoc = (id) => {
  expandedDocs.value[id] = !expandedDocs.value[id];
};

// Comprehensive Documentation Database
const docsData = [
  {
    id: 'doc-dashboard',
    category: 'Produksi & SPK',
    tagClass: 'bg-blue-50 text-blue-700 border border-blue-200',
    icon: '📊',
    iconBg: 'bg-blue-50 border-blue-200 text-blue-700',
    title: 'Dashboard Overview & Executive Analytics',
    summary: 'Pusat monitoring visual kinerja produksi real-time: total tonase, pencapaian target SPK harian, status mesin, dan grafik tren produksi.',
    roles: ['SUPER_ADMIN', 'ADMIN_DE', 'PPIC', 'OPERATOR', 'QC', 'GUDANG'],
    steps: [
      'Buka menu <strong>Dashboard</strong> melalui navigasi sidebar paling atas.',
      'Periksa <strong>Kartu Statistik Ringkasan</strong>: Total Roll Hari Ini, Total Berat Aktual (Kg), Selisih Berat Teori vs Aktual, dan Persentase Scrap.',
      'Gunakan tombol <strong>Filter Tanggal</strong> (Hari Ini, 7 Hari Terakhir, Bulan Ini) untuk melihat performa produksi pada periode spesifik.',
      'Amati grafik tren batang dan garis: grafik menunjukkan fluktuasi output produksi per shift (Shift 1, Shift 2, Shift 3) untuk evaluasi kapasitas mesin.'
    ],
    tips: [
      'Super Admin & PPIC dapat memanfaatkan perbandingan berat teori vs aktual untuk mendeteksi pemborosan raw material (over-weight film).',
      'Dashboard secara otomatis membaca database lokal IndexedDB sehingga tetap tampil cepat meski koneksi internet terputus.'
    ],
    features: ['Real-time KPI metric', 'Shift Output Comparison', 'Scrap Ratio Calculation', 'Offline Resilient']
  },
  {
    id: 'doc-spk',
    category: 'Produksi & SPK',
    tagClass: 'bg-blue-50 text-blue-700 border border-blue-200',
    icon: '📄',
    iconBg: 'bg-indigo-50 border-indigo-200 text-indigo-700',
    title: 'Manajemen SPK (Surat Perintah Kerja / Work Order)',
    summary: 'Pengelolaan perintah kerja produksi film, alokasi mesin, target kuantiti roll/kg, status pengerjaan (Draft, In Progress, Selesai), dan integrasi otomatis ke form Label.',
    roles: ['SUPER_ADMIN', 'PPIC', 'ADMIN_DE', 'OPERATOR'],
    steps: [
      'Masuk ke menu <strong>Rencana SPK</strong> (/spk).',
      'Klik tombol <strong>+ Buat SPK Baru</strong> di pojok kanan atas.',
      'Isi nomor SPK resmi, nama pelanggan (Customer), nama item film, jenis material (misal: LDPE, BOPP, PET, CPP), ukuran (Tebal, Lebar, Panjang roll), dan target kuantiti.',
      'Tentukan alokasi <strong>Mesin Extruder / Printing / Slitting</strong> serta tanggal rencana mulai dan deadline.',
      'Simpan SPK. Setelah disimpan, nomor SPK akan langsung tersedia sebagai pilihan dropdown pada form cetak <strong>Label Produksi</strong>.'
    ],
    tips: [
      'Gunakan fitur <em>Filter Status</em> (Berjalan / Selesai) untuk menyaring SPK aktif sehingga operator tidak salah memilih SPK yang sudah closed.',
      'Data SPK dapat diexport ke format Excel untuk laporan mingguan divisi PPIC.'
    ],
    features: ['Direct Link to Label Form', 'Target Progress Tracker', 'Export Excel SPK', 'Auto Material Specification']
  },
  {
    id: 'doc-label',
    category: 'Label & Roll',
    tagClass: 'bg-red-50 text-red-700 border border-red-200',
    icon: '🏷️',
    iconBg: 'bg-red-50 border-red-200 text-red-700',
    title: 'Pembuatan & Pencetakan Label Produksi (Roll Tag)',
    summary: 'Generator label identitas roll Finished Goods (FG) lengkap dengan barcode 1D/2D, kalkulasi berat teori otomatis, toleransi timbangan, dan layout cetak thermal printer.',
    roles: ['SUPER_ADMIN', 'ADMIN_DE', 'OPERATOR'],
    steps: [
      'Buka menu <strong>Label Produksi</strong> (/label).',
      'Pilih <strong>Nomor SPK</strong> dari daftar yang aktif — data ukuran (Tebal, Lebar, Panjang, Density) akan terisi otomatis.',
      'Masukkan nomor roll atau klik <em>Auto Number</em> untuk mendapatkan nomor urut roll berikutnya sesuai format mesin.',
      'Input <strong>Berat Aktual (Gross/Netto Kg)</strong> dari timbangan lapangan. Sistem secara otomatis menghitung <strong>Berat Teori (Kg)</strong> dan menampilkan deviasi (+/- %).',
      'Jika berat timbangan berada di luar batas toleransi standar (misal > 5%), sistem akan memunculkan peringatan visual kuning/merah.',
      'Klik tombol <strong>Cetak Label</strong> untuk mencetak langsung ke printer thermal (Direct Thermal / Barcode Printer) atau simpan data ke memori.'
    ],
    tips: [
      'Pastikan setting ukuran kertas printer thermal Anda sesuai (misal: 100x50 mm atau 80x80 mm) pada dialog print browser.',
      'Label yang sudah dicetak akan otomatis masuk ke tabel <strong>Data Roll FG</strong> tanpa perlu diinput ulang.'
    ],
    features: ['Auto Density Formula', 'Weight Tolerance Alert', 'Barcode Tag Preview', 'One-Click Direct Print']
  },
  {
    id: 'doc-dataroll',
    category: 'Label & Roll',
    tagClass: 'bg-red-50 text-red-700 border border-red-200',
    icon: '🌀',
    iconBg: 'bg-rose-50 border-rose-200 text-rose-700',
    title: 'Data Roll FG (Identitas & Riwayat Roll)',
    summary: 'Tabel master data seluruh roll yang telah diproduksi: pencarian nomor roll, filter status QC, tracking lokasi fisik, dan ekspor data audit.',
    roles: ['SUPER_ADMIN', 'ADMIN_DE', 'QC', 'GUDANG', 'PPIC'],
    steps: [
      'Akses menu <strong>Data Roll FG</strong> (/data-roll).',
      'Gunakan kotak pencarian cepat untuk mencari berdasarkan <em>Nomor Roll, Nomor SPK, atau Nama Item</em>.',
      'Gunakan filter lanjutan: filter berdasarkan mesin, tanggal produksi, shift kerja, atau status inspeksi QC (Passed, Hold, Reject).',
      'Klik tombol aksi pada baris roll untuk melihat detail data roll, mencetak ulang label (re-print), atau mengubah status.'
    ],
    tips: [
      'Jika label fisik di lapangan rusak atau robek, operator atau admin dapat mencetak ulang dengan mengklik icon printer pada Data Roll FG.',
      'Gunakan fitur <strong>Export Excel</strong> untuk mengirim rekapan nomor roll ke departemen Logistik atau Audit.'
    ],
    features: ['Full Search by Roll ID', 'QC Inspection Badges', 'Reprint Function', 'Bulk Export']
  },
  {
    id: 'doc-dereport',
    category: 'Laporan & AI',
    tagClass: 'bg-purple-50 text-purple-700 border border-purple-200',
    icon: '📋',
    iconBg: 'bg-purple-50 border-purple-200 text-purple-700',
    title: 'DE Report (Rekapitulasi Laporan Harian Data Entry)',
    summary: 'Pusat rekap data harian terpadu produksi: tabel rekap komprehensif, upload data dari Excel, verifikasi kuantiti, dan pelaporan shift.',
    roles: ['SUPER_ADMIN', 'ADMIN_DE', 'PPIC'],
    steps: [
      'Buka menu <strong>Laporan Harian (DE Report)</strong> (/de-report).',
      'Pilih tanggal produksi dan shift yang ingin direkap atau ditinjau.',
      'Untuk mengunggah data rekapan dari Excel luar: klik <strong>Import Excel</strong>, pilih file laporan sesuai format template.',
      'Periksa hasil kalkulasi total meter, total tonase, dan kesesuaian data input sebelum melakukan finalisasi laporan.',
      'Laporan yang telah diverifikasi dapat dicetak dalam format PDF rekap harian resmi atau diexport ke file Excel rapi.'
    ],
    tips: [
      'Pastikan format header kolom pada file Excel yang diimpor tidak diubah agar sistem dapat memetakan field secara presisi.',
      'Data pada DE Report langsung terhubung dengan analitik grafik pada Dashboard.'
    ],
    features: ['Excel Batch Import', 'Shift Consolidation', 'Instant Anomaly Check', 'Official PDF Export']
  },
  {
    id: 'doc-scan',
    category: 'Laporan & AI',
    tagClass: 'bg-purple-50 text-purple-700 border border-purple-200',
    icon: '🤖',
    iconBg: 'bg-fuchsia-50 border-fuchsia-200 text-fuchsia-700',
    title: 'Pindai Laporan Produksi dengan Google Gemini Vision AI',
    summary: 'Fitur kecerdasan buatan cerdas untuk memindai dokumen fisik laporan tulisan tangan operator melalui kamera/foto, membaca tabel roll otomatis (OCR AI), dan memasukkannya ke database.',
    roles: ['SUPER_ADMIN', 'ADMIN_DE', 'QC', 'PPIC'],
    steps: [
      'Pastikan Google Gemini API Key telah aktif di menu <em>Pengaturan Sistem > Google Gemini Engine</em>.',
      'Akses menu <strong>Pindai AI</strong> (/scan-report).',
      'Ambil foto lembar laporan fisik menggunakan kamera smartphone/tablet, atau upload file gambar/PDF dari komputer.',
      'Pastikan foto tegak lurus, tidak buram (blur), dan pencahayaan cukup terang.',
      'Klik tombol <strong>Mulai Ekstraksi AI</strong>. Model Gemini Vision akan memproses gambar dan mengekstrak nomor roll, berat, meter, dan catatan operator menjadi baris data terstruktur.',
      'Tinjau hasil pembacaan tabel di layar preview. Lakukan koreksi cepat jika ada angka tulisan tangan yang meragukan.',
      'Klik <strong>Konfirmasi & Simpan ke Data Roll</strong> untuk memasukkan seluruh baris ke database.'
    ],
    tips: [
      'Gunakan pencahayaan yang merata tanpa bayangan tajam pada kertas laporan untuk akurasi pembacaan AI di atas 95%.',
      'Sistem mendukung model Gemini 1.5 Flash yang sangat cepat dan hemat kuota token.'
    ],
    features: ['Handwriting OCR AI', 'Auto Table Structuring', 'Visual Review Diff', 'Instant Verification']
  },
  {
    id: 'doc-inventory',
    category: 'Gudang & IMS',
    tagClass: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    icon: '📦',
    iconBg: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    title: 'Roll & Inventory Management System (IMS Gudang)',
    summary: 'Sistem pergudangan Finished Goods: penerimaan roll dari produksi, pemetaan lokasi rak / palet, status pengiriman (Shipping), dan kartu stok gudang.',
    roles: ['SUPER_ADMIN', 'GUDANG', 'PPIC'],
    steps: [
      'Buka menu <strong>Stok Gudang (IMS)</strong> (/inventory).',
      'Gunakan fitur <strong>Scan Barcode Terima</strong> untuk memindai label barcode roll saat barang fisik diterima dari divisi produksi.',
      'Tentukan nomor <strong>Pallet / Rak / Bin</strong> lokasi penyimpanan roll di gudang.',
      'Status roll otomatis berubah menjadi <em>Ready in Warehouse</em>.',
      'Saat barang akan dikirim (Delivery / Surat Jalan): scan barcode roll untuk menandai status sebagai <em>Shipped</em>, mengurangi stok gudang secara akurat.'
    ],
    tips: [
      'Petugas gudang dapat menggunakan smartphone dengan barcode scanner Bluetooth atau kamera bawaan untuk mempercepat proses penerimaan.',
      'Cek stok kritis secara berkala melalui tab <em>Ringkasan Stok Material</em>.'
    ],
    features: ['Barcode Inbound / Outbound', 'Rack & Pallet Location', 'Stock Balance Live', 'Shipping Dispatch Log']
  },
  {
    id: 'doc-opname',
    category: 'Gudang & IMS',
    tagClass: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    icon: '📝',
    iconBg: 'bg-teal-50 border-teal-200 text-teal-700',
    title: 'Stok Opname & Audit Inventaris Fisik',
    summary: 'Modul audit periodik untuk mencocokkan stok fisik di lantai gudang dengan catatan sistem: scan massal, deteksi selisih roll, dan laporan audit.',
    roles: ['SUPER_ADMIN', 'GUDANG', 'PPIC'],
    steps: [
      'Akses menu <strong>Stok Opname</strong> (/opname).',
      'Klik <strong>Mulai Sesi Opname Baru</strong> dan tentukan zona area gudang yang akan diaudit.',
      'Petugas menyisir area dan memindai barcode setiap roll fisik yang ada di palet.',
      'Sistem otomatis membandingkan roll hasil scan fisik dengan saldo roll di sistem: menampilkan status <em>Match (Cocok)</em>, <em>Missing (Hilang di Fisik)</em>, atau <em>Surplus (Ada di Fisik tapi Belum Tercatat)</em>.',
      'Setelah verifikasi selesai, klik <strong>Finalisasi Stok Opname</strong> untuk memperbarui data saldo resmi.'
    ],
    tips: [
      'Opname dapat dilakukan secara offline; data scan akan disimpan di lokal HP dan otomatis disinkronkan ke server saat terkoneksi kembali.',
      'Laporan selisih opname dapat langsung diekspor untuk lampiran laporan akuntansi / audit.'
    ],
    features: ['Blind Audit Support', 'Discrepancy Highlight', 'Multi-operator Scanning', 'Audit Reconciliation']
  },
  {
    id: 'doc-tools',
    category: 'Produksi & SPK',
    tagClass: 'bg-blue-50 text-blue-700 border border-blue-200',
    icon: '🛠️',
    iconBg: 'bg-orange-50 border-orange-200 text-orange-700',
    title: 'Tools & Kalkulator Konversi Lapangan (Engineering)',
    summary: 'Kumpulan kalkulator industri fleksibel: hitung berat roll, estimasi diameter luar bobbin (OD), perhitungan yield meter persegi per kilogram, dan rumus toleransi film.',
    roles: ['SUPER_ADMIN', 'ADMIN_DE', 'OPERATOR', 'QC', 'PPIC'],
    steps: [
      'Buka menu <strong>Kalkulator Konversi</strong> (/tools).',
      'Pilih alat kalkulasi yang dibutuhkan (misal: <em>Kalkulator Berat Teori Roll</em> atau <em>Kalkulator Estimasi Diameter Roll</em>).',
      'Masukkan parameter: jenis polimer / densitas (g/cm³), ketebalan (mikron), lebar (mm), dan panjang (meter).',
      'Hasil berat teoritis (kg) dan diameter roll luar (mm) akan muncul seketika secara matematis akurat.'
    ],
    tips: [
      'Densitas standar umum: LDPE (0.92), LLDPE (0.92), HDPE (0.95), PP (0.90), PET (1.40). Pastikan densitas tepat untuk akurasi berat.',
      'Gunakan kalkulator konversi meter-ke-kg saat merencanakan pemotongan roll pada mesin slitting.'
    ],
    features: ['Instant Density Presets', 'Roll Outer Diameter (OD)', 'Square Meter Yield (m²)', 'Slitting Matrix Calc']
  },
  {
    id: 'doc-users',
    category: 'Sistem & Keamanan',
    tagClass: 'bg-zinc-100 text-zinc-700 border border-zinc-300',
    icon: '👥',
    iconBg: 'bg-zinc-100 border-zinc-300 text-zinc-800',
    title: 'Manajemen Pengguna, Hak Akses & Keamanan Sesi Device',
    summary: 'Pengaturan akun staf (Super Admin, Operator, QC, Gudang, PPIC), pemantauan sesi aktif login di berbagai perangkat, forced remote logout, dan proteksi Kunci Layar PIN 4-Digit.',
    roles: ['SUPER_ADMIN'],
    steps: [
      'Akses menu <strong>Manajemen Pengguna</strong> (/users) — menu ini hanya dapat diakses oleh Super Admin.',
      '<strong>Kelola Akun Pengguna:</strong> Tambah pengguna baru, pilih role preset (hak akses menu otomatis terkonfigurasi), atur PIN 4-digit, atau reset kata sandi.',
      '<strong>Monitoring Sesi Perangkat (Multi-Device Tracking):</strong> Buka tab <em>Sesi Perangkat Aktif</em> untuk melihat daftar seluruh device (Laptop, Tablet, HP) yang sedang login dengan akun pengguna tertentu.',
      'Periksa informasi perangkat: tipe OS, browser, IP lokal, status Online/Idle, dan lama waktu login berjalan.',
      '<strong>Putus Sesi Jarak Jauh (Forced Remote Logout):</strong> Jika ada perangkat asing atau pengguna yang ingin dikeluarkan paksa, klik tombol <em>Putus Sesi</em>. Perangkat tujuan akan langsung terkunci, sesi dihapus, dan dipaksa kembali ke halaman login seketika.'
    ],
    tips: [
      'Aktifkan fitur <strong>Kunci Layar PIN</strong> pada profil masing-masing pengguna. Jika komputer ditinggal selama waktu tertentu (idle), layar akan otomatis terkunci demi mencegah penyalahgunaan oleh pihak lain.',
      'Jika pengguna operasional lupa PIN atau kata sandi, Super Admin dapat melakukan reset langsung dari menu Manajemen Pengguna.'
    ],
    features: ['Multi-Device Live Tracker', 'Instant Remote Kill Session', 'Role-Based Access Control', '4-Digit PIN Screen Lock']
  },
  {
    id: 'doc-offline',
    category: 'Sistem & Keamanan',
    tagClass: 'bg-zinc-100 text-zinc-700 border border-zinc-300',
    icon: '⚡',
    iconBg: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    title: 'Arsitektur Offline-First (Dexie IndexedDB & Supabase Cloud)',
    summary: 'Pemahaman tentang cara kerja sistem M-Label saat internet pabrik padam: penyimpanan data lokal IndexedDB di browser dan sinkronisasi otomatis ke Cloud saat kembali online.',
    roles: ['SEMUA ROLE'],
    steps: [
      'M-Label dibangun dengan arsitektur <strong>Offline-First</strong> modern.',
      'Saat komputer atau tablet Anda terputus dari jaringan WiFi/Internet, sistem <strong>tetap dapat digunakan 100%</strong> untuk input data roll, cetak label, dan kalkulasi tools.',
      'Semua data tersimpan secara aman di database browser perangkat Anda (IndexedDB via Dexie.js).',
      'Indikator status di pojok kiri bawah sidebar akan menampilkan status <em>IndexedDB Offline Ready</em>.',
      'Ketika koneksi internet pulih kembali, data akan disinkronisasikan ke Supabase Cloud secara otomatis tanpa menghilangkan data lokal.'
    ],
    tips: [
      'Hindari melakukan <em>Clear Site Data / Hapus Cookie Riwayat Lengkap</em> pada browser sebelum memastikan data penting telah tersinkron atau dibackup.',
      'Gunakan fitur <strong>Backup Database</strong> di menu Pengaturan secara berkala sebagai cadangan arsip berkas JSON.'
    ],
    features: ['Zero Downtime on Outage', 'Automatic Cloud Sync', 'Instant Local Read/Write', 'Safe Device Caching']
  }
];

// Filtered documentation list based on search and category
const filteredDocs = computed(() => {
  return docsData.filter(item => {
    // Category filter
    if (selectedCategory.value !== 'Semua' && item.category !== selectedCategory.value) {
      return false;
    }

    // Search query filter
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchSummary = item.summary.toLowerCase().includes(q);
      const matchCategory = item.category.toLowerCase().includes(q);
      const matchSteps = item.steps.some(s => s.toLowerCase().includes(q));
      const matchFeatures = item.features ? item.features.some(f => f.toLowerCase().includes(q)) : false;

      return matchTitle || matchSummary || matchCategory || matchSteps || matchFeatures;
    }

    return true;
  });
});
</script>

<style scoped>
/* Smooth transitions */
.custom-scrollbar-x::-webkit-scrollbar {
  height: 4px;
}
.custom-scrollbar-x::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 9999px;
}
</style>
