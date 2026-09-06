<template>
  <div class="space-y-6 font-sans select-none max-w-6xl mx-auto pb-16">
    <!-- Header Banner -->
    <div class="bg-white p-4 sm:p-6 rounded-2xl border border-zinc-200 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div class="flex items-center gap-3.5">
        <div class="w-12 h-12 rounded-2xl bg-zinc-950 text-white flex items-center justify-center shadow-sm border border-zinc-800 shrink-0">
          <svg class="w-6 h-6 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-base sm:text-xl font-black text-zinc-900 tracking-tight">PUSAT BANTUAN & INFORMASI SISTEM</h1>
            <span class="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-red-50 text-red-700 border border-red-200">
              v2.5 Next-Gen
            </span>
          </div>
          <p class="text-xs text-zinc-500 font-medium mt-0.5">
            Panduan lengkap pengoperasian M-Label, dokumentasi alur manufaktur, profil pengembang, dan catatan sejarah evolusi sistem.
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2 shrink-0 self-start md:self-auto">
        <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Dokumentasi Aktif
        </span>
      </div>
    </div>

    <!-- Sheet Switcher (Tab Navigation) -->
    <div class="flex items-center gap-2 border-b border-zinc-200 pb-2 overflow-x-auto select-none">
      <button
        type="button"
        @click="activeSheet = 'docs'"
        :class="[
          'px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 shadow-2xs',
          activeSheet === 'docs'
            ? 'bg-zinc-900 text-white shadow-xs'
            : 'bg-white text-zinc-600 hover:bg-zinc-100 border border-zinc-200'
        ]"
      >
        <svg class="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
        <span>Panduan Dokumentasi Program</span>
        <span class="px-1.5 py-0.5 text-[10px] rounded-full font-bold bg-zinc-800 text-zinc-300">
          {{ filteredDocs.length }} Modul
        </span>
      </button>

      <button
        type="button"
        @click="activeSheet = 'about'"
        :class="[
          'px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 shadow-2xs',
          activeSheet === 'about'
            ? 'bg-zinc-900 text-white shadow-xs'
            : 'bg-white text-zinc-600 hover:bg-zinc-100 border border-zinc-200'
        ]"
      >
        <svg class="w-4 h-4 text-red-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        <span>Tentang Saya & Sejarah Evolusi</span>
        <span class="px-1.5 py-0.5 text-[10px] rounded-full font-bold bg-red-500/20 text-red-300">
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
    <!-- SHEET 2: ABOUT ME & REKAM JEJAK SEJARAH EVOLUSI -->
    <!-- ======================================================== -->
    <div v-show="activeSheet === 'about'" class="space-y-8">
      <!-- Profile Card (Modern Industrial Design) -->
      <div class="bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900 text-white rounded-3xl p-6 sm:p-8 border border-zinc-800 shadow-xl relative overflow-hidden">
        <!-- Background Ambient Accents -->
        <div class="absolute -right-20 -top-20 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute -left-20 -bottom-20 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div class="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6">
          <!-- Avatar / Monogram Badge -->
          <div class="relative">
            <div class="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-red-600 to-amber-500 p-1 shadow-xl flex items-center justify-center shrink-0">
              <div class="w-full h-full bg-zinc-950 rounded-[22px] flex flex-col items-center justify-center text-center p-2">
                <span class="text-2xl sm:text-3xl font-black tracking-tight text-white">IMS</span>
                <span class="text-[9px] font-mono text-red-400 uppercase tracking-widest mt-0.5">DEV LEAD</span>
              </div>
            </div>
            <div class="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full bg-emerald-500 text-zinc-950 text-[9px] font-black uppercase tracking-wider shadow-md">
              Verified
            </div>
          </div>

          <!-- Info Details -->
          <div class="flex-1 text-center md:text-left space-y-2.5">
            <div>
              <div class="flex items-center justify-center md:justify-start gap-2 flex-wrap">
                <h2 class="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Isnan Mauladi Syahputra, S.Kom.
                </h2>
                <span class="px-2.5 py-0.5 rounded-full bg-red-600/20 text-red-400 border border-red-500/30 text-[11px] font-bold">
                  Software Creator & AI Programmer
                </span>
              </div>
              <p class="text-xs sm:text-sm text-zinc-400 font-medium mt-1">
                Full-Stack Web Developer & Industrial Systems Innovator
              </p>
            </div>

            <!-- Mission Statement -->
            <p class="text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-3xl">
              "Program <strong>M-Label</strong> lahir dan dibangun sebagai bentuk dedikasi serta kontribusi nyata untuk meringankan beban kerja operasional harian, mengeliminasi kesalahan manusia (human error), dan melipatgandakan efisiensi pencatatan di lingkungan industri manufaktur PT. Saptawarna Cemerlang. Dari proses manual kertas hingga kini menjadi platform cerdas berbasis AI dan Cloud, sistem ini didesain agar setiap detik kerja kita lebih bermakna dan bernilai tinggi."
            </p>

            <!-- Skill Badges -->
            <div class="flex items-center justify-center md:justify-start gap-2 flex-wrap pt-2">
              <span class="px-2.5 py-1 rounded-lg bg-zinc-800/80 border border-zinc-700 text-zinc-300 text-[11px] font-mono">
                Vue 3 + Vite
              </span>
              <span class="px-2.5 py-1 rounded-lg bg-zinc-800/80 border border-zinc-700 text-zinc-300 text-[11px] font-mono">
                Dexie.js IndexedDB (Offline-First)
              </span>
              <span class="px-2.5 py-1 rounded-lg bg-zinc-800/80 border border-zinc-700 text-zinc-300 text-[11px] font-mono">
                Supabase Realtime Cloud
              </span>
              <span class="px-2.5 py-1 rounded-lg bg-zinc-800/80 border border-zinc-700 text-zinc-300 text-[11px] font-mono">
                Google Gemini Vision AI (OCR)
              </span>
              <span class="px-2.5 py-1 rounded-lg bg-zinc-800/80 border border-zinc-700 text-zinc-300 text-[11px] font-mono">
                Tailwind CSS
              </span>
            </div>
          </div>
        </div>

        <!-- Contact & Direct Links Bar -->
        <div class="mt-6 pt-6 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div class="flex items-center gap-4 text-xs text-zinc-400 flex-wrap justify-center sm:justify-start">
            <span class="flex items-center gap-1.5">
              <svg class="w-4 h-4 text-red-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <strong>Email:</strong> isnanmauladi10@gmail.com
            </span>
            <span class="flex items-center gap-1.5">
              <svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <strong>Lokasi:</strong> PT. Saptawarna Cemerlang, Tangerang
            </span>
          </div>

          <div class="flex items-center gap-2">
            <a
              href="mailto:isnanmauladi10@gmail.com?subject=Tanya%20Sistem%20M-Label"
              class="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-red-900/30 cursor-pointer"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Hubungi Pengembang
            </a>
          </div>
        </div>
      </div>

      <!-- Historical Evolution Timeline (From Manual Paper to Decision Support AI) -->
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-base sm:text-lg font-black text-zinc-900 tracking-tight flex items-center gap-2">
              <span>🚀</span>
              <span>Rekam Jejak & Sejarah Evolusi Inovasi Sistem</span>
            </h3>
            <p class="text-xs text-zinc-500 font-medium">
              Perjalanan transformasi digital dari lembaran kertas manual hingga menjadi platform Executive Decision Support.
            </p>
          </div>
          <span class="px-2.5 py-1 rounded-lg bg-zinc-100 text-zinc-700 text-xs font-mono font-bold">
            4 Generasi Inovasi
          </span>
        </div>

        <div class="relative border-l-2 border-red-500/40 ml-4 sm:ml-6 space-y-8 pl-6 sm:pl-8 py-2">
          <!-- ERA 0: Masa Pra-Program (Manual Kertas) -->
          <div class="relative group">
            <!-- Timeline Dot -->
            <div class="absolute -left-[35px] sm:-left-[43px] top-1.5 w-6 h-6 rounded-full bg-zinc-300 border-4 border-white flex items-center justify-center text-[10px] font-black text-zinc-700 shadow-sm">
              0
            </div>

            <div class="bg-white rounded-2xl border border-zinc-200 p-5 shadow-xs transition hover:shadow-md">
              <div class="flex items-center justify-between gap-2 flex-wrap mb-2">
                <div class="flex items-center gap-2">
                  <span class="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase bg-zinc-100 text-zinc-600">
                    Era Awal (Masa Lalu)
                  </span>
                  <h4 class="text-sm sm:text-base font-bold text-zinc-800">
                    Sistem Manual Kertas & Form Excel/Word Konvensional
                  </h4>
                </div>
                <span class="text-[11px] font-mono text-zinc-400">Metode Konvensional</span>
              </div>

              <p class="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                Sebelum hadirnya sistem digital, proses pembuatan label produksi dan pencatatan roll masih mengandalkan dokumen Microsoft Word atau Excel standar yang dicetak (print) dalam jumlah banyak. Operator lapangan harus menuliskan rincian data roll (nomor roll, berat timbangan, jenis bahan, meter) menggunakan pulpen secara manual.
              </p>

              <div class="mt-3 p-3 rounded-xl bg-red-50/60 border border-red-100 text-xs text-red-800 space-y-1">
                <strong class="font-bold flex items-center gap-1">
                  <span>⚠️</span> Kendala & Titik Kritis:
                </strong>
                <p>
                  Sering terjadi salah tulis identitas roll, tulisan tangan sulit dibaca oleh gudang, resiko salah perhitungan berat teoritis (teori vs aktual), kertas basah/hilang di area mesin, serta ketiadaan validasi data secara otomatis.
                </p>
              </div>
            </div>
          </div>

          <!-- ERA 1: Inovasi Generasi 1 (Excel Automation) -->
          <div class="relative group">
            <div class="absolute -left-[35px] sm:-left-[43px] top-1.5 w-6 h-6 rounded-full bg-blue-500 border-4 border-white flex items-center justify-center text-[10px] font-black text-white shadow-sm">
              1
            </div>

            <div class="bg-white rounded-2xl border border-zinc-200 p-5 shadow-xs transition hover:shadow-md">
              <div class="flex items-center justify-between gap-2 flex-wrap mb-2">
                <div class="flex items-center gap-2">
                  <span class="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase bg-blue-50 text-blue-700 border border-blue-200">
                    Generasi 1 • Inovasi Awal
                  </span>
                  <h4 class="text-sm sm:text-base font-bold text-zinc-800">
                    File Excel Khusus dengan Formula Berat Teori & Validasi Otomatis
                  </h4>
                </div>
                <span class="text-[11px] font-mono text-blue-600 font-semibold">Excel Automation</span>
              </div>

              <p class="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                Langkah inovasi pertama diinisiasi oleh <strong>Isnan Mauladi Syahputra, S.Kom.</strong> dengan merancang template Excel interaktif khusus. Di dalamnya disematkan berbagai formula matematika (VLOOKUP, IF, kalkulasi densitas film) untuk menghitung berat teori secara otomatis seketika ukuran tebal, lebar, dan panjang dimasukkan.
              </p>

              <div class="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div class="p-2.5 rounded-xl bg-blue-50/50 border border-blue-100 text-blue-900">
                  <strong>Pencapaian:</strong> Operator tidak perlu lagi menghitung manual dengan kalkulator tangan, mengurangi kesalahan hitung berat teori hingga 70%.
                </div>
                <div class="p-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-700">
                  <strong>Keterbatasan:</strong> Masih bergantung pada satu PC lokal, file rentan ter-overwrite atau korup jika dipakai banyak orang bersamaan.
                </div>
              </div>
            </div>
          </div>

          <!-- ERA 2: Inovasi Generasi 2 (Lightweight Web App HTML-JS) -->
          <div class="relative group">
            <div class="absolute -left-[35px] sm:-left-[43px] top-1.5 w-6 h-6 rounded-full bg-amber-500 border-4 border-white flex items-center justify-center text-[10px] font-black text-white shadow-sm">
              2
            </div>

            <div class="bg-white rounded-2xl border border-zinc-200 p-5 shadow-xs transition hover:shadow-md">
              <div class="flex items-center justify-between gap-2 flex-wrap mb-2">
                <div class="flex items-center gap-2">
                  <span class="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase bg-amber-50 text-amber-800 border border-amber-200">
                    Generasi 2 • Digitalisasi Web
                  </span>
                  <h4 class="text-sm sm:text-base font-bold text-zinc-800">
                    Aplikasi Web HTML, CSS & JavaScript Sederhana
                  </h4>
                </div>
                <span class="text-[11px] font-mono text-amber-600 font-semibold">Web Prototype</span>
              </div>

              <p class="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                Melihat kebutuhan akses yang lebih fleksibel dan tampilan yang lebih ramah bagi operator, sistem kemudian berevolusi menjadi program web ringan berbasis HTML dan vanilla JavaScript. Program ini mulai dilengkapi tampilan form modern, generator barcode instan, cetak thermal label langsung ke printer lapangan, dan validasi field formulir.
              </p>

              <div class="mt-3 p-3 rounded-xl bg-amber-50/50 border border-amber-100 text-xs text-amber-900">
                <strong>Dampak Positif:</strong> Mulai diadopsi secara resmi di lini kerja; operator merasa jauh lebih cepat dalam mencetak label produksi, serta tidak lagi terjadi bentrok file seperti saat masih menggunakan spreadsheet.
              </div>
            </div>
          </div>

          <!-- ERA 3: Inovasi Generasi Terkini (Modern M-Label Executive Platform) -->
          <div class="relative group">
            <div class="absolute -left-[35px] sm:-left-[43px] top-1.5 w-6 h-6 rounded-full bg-red-600 border-4 border-white flex items-center justify-center text-[10px] font-black text-white shadow-md animate-bounce">
              ★
            </div>

            <div class="bg-gradient-to-br from-white to-red-50/30 rounded-2xl border-2 border-red-500/30 p-5 sm:p-6 shadow-sm">
              <div class="flex items-center justify-between gap-2 flex-wrap mb-2.5">
                <div class="flex items-center gap-2">
                  <span class="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase bg-red-600 text-white shadow-xs">
                    Generasi Terkini • Modern M-Label
                  </span>
                  <h4 class="text-base sm:text-lg font-black text-zinc-900">
                    Enterprise Manufacturing Intelligence & Decision Support System
                  </h4>
                </div>
                <span class="px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold">
                  Active Production System
                </span>
              </div>

              <p class="text-xs sm:text-sm text-zinc-700 leading-relaxed">
                Kini, <strong>M-Label</strong> telah bertransformasi secara radikal menjadi sebuah ekosistem perangkat lunak manufaktur modern berkemampuan tinggi. Program ini <strong>bukan sekadar alat pendataan Roll ID atau pencetak label</strong>, melainkan sebuah mesin pengolah data industri yang mengubah input operasional lapangan menjadi <strong>informasi strategis untuk pengambilan keputusan tingkat manajemen (Executive Decision Support System)</strong>.
              </p>

              <!-- Fitur Pembeda Utama di Versi Ini -->
              <div class="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                <div class="bg-white p-3.5 rounded-xl border border-zinc-200 shadow-2xs space-y-1">
                  <div class="flex items-center gap-1.5 text-xs font-bold text-zinc-900">
                    <span class="text-red-600">📊</span> Executive Analytics
                  </div>
                  <p class="text-[11.5px] text-zinc-600 leading-normal">
                    Dashboard visual memantau rasio output aktual vs target SPK, scrap percentage, tren shift harian, dan metrik efisiensi mesin secara real-time.
                  </p>
                </div>

                <div class="bg-white p-3.5 rounded-xl border border-zinc-200 shadow-2xs space-y-1">
                  <div class="flex items-center gap-1.5 text-xs font-bold text-zinc-900">
                    <span class="text-blue-600">🤖</span> Google Gemini AI Vision
                  </div>
                  <p class="text-[11.5px] text-zinc-600 leading-normal">
                    Pindai lembar laporan tulisan tangan operator secara otomatis via OCR AI, mendeteksi tabel roll dan mengubahnya menjadi database dalam hitungan detik.
                  </p>
                </div>

                <div class="bg-white p-3.5 rounded-xl border border-zinc-200 shadow-2xs space-y-1">
                  <div class="flex items-center gap-1.5 text-xs font-bold text-zinc-900">
                    <span class="text-emerald-600">🛡️</span> Hybrid Offline-Cloud & Keamanan
                  </div>
                  <p class="text-[11.5px] text-zinc-600 leading-normal">
                    Arsitektur Dexie IndexedDB menjamin sistem 100% tahan mati internet di pabrik, sinkronisasi Supabase Realtime, multi-device tracking, dan proteksi kunci PIN.
                  </p>
                </div>
              </div>

              <!-- Kutipan Filosofis -->
              <div class="mt-4 p-3.5 rounded-xl bg-zinc-900 text-zinc-200 text-xs flex items-center justify-between gap-3">
                <div class="flex items-center gap-2">
                  <span class="text-lg">💡</span>
                  <span class="italic">
                    "Data yang rapi adalah fondasi efisiensi; dan efisiensi adalah kunci kemenangan industri."
                  </span>
                </div>
                <span class="text-[10px] font-mono text-zinc-400 shrink-0">— Isnan M.S., S.Kom.</span>
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
