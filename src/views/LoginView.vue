<template>
  <div class="min-h-screen w-full bg-[#f8fafc] flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden font-sans select-none">
    
    <!-- ========================================================================= -->
    <!-- ANIMATED BACKGROUND: 9 IKON INDUSTRIAL (PABRIK, ROLL FILM, RESIN, FORKLIFT, MESIN, GEAR, METERAN, AI, KOMPUTER) -->
    <!-- ========================================================================= -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <!-- Fine Subtle Hairline Grid -->
      <div class="absolute inset-0 bg-[linear-gradient(to_right,rgba(24,24,27,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(24,24,27,0.05)_1px,transparent_1px)] bg-[size:52px_52px]"></div>

      <!-- STREAM 1 (UPPER BAND - DRIFTING SLOWLY LEFT TO RIGHT) -->
      <div class="absolute top-[6%] left-0 w-[200%] flex items-center justify-around stream-track stream-slow">
        <!-- 1. Pabrik (Red) -->
        <div class="industrial-icon text-red-600 transform -rotate-6" title="Pabrik Industri">
          <svg class="w-12 h-12 sm:w-14 sm:h-14" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 40h40M6 40V22l10 6V18l10 6V14l10 6v20" fill="#fee2e2" fill-opacity="0.6" />
            <line x1="36" y1="14" x2="42" y2="14" stroke-width="2.5" />
            <path d="M36 40V14h6v26" fill="#dc2626" fill-opacity="0.25" />
            <circle cx="12" cy="32" r="2.5" fill="currentColor" stroke="none" />
            <circle cx="22" cy="32" r="2.5" fill="currentColor" stroke="none" />
          </svg>
        </div>

        <!-- 2. Roll Film (Black) -->
        <div class="industrial-icon text-zinc-950 transform rotate-12" title="Roll Film">
          <svg class="w-12 h-12 sm:w-14 sm:h-14" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <ellipse cx="18" cy="24" rx="8" ry="16" fill="#e4e4e7" fill-opacity="0.6" />
            <path d="M18 8h18c4.4 0 8 7.2 8 16s-3.6 16-8 16H18" fill="#f4f4f5" fill-opacity="0.5" />
            <ellipse cx="18" cy="24" rx="3.5" ry="7" fill="#ffffff" stroke="currentColor" stroke-width="2" />
            <path d="M18 40c6 0 14 2 22 2" stroke-dasharray="3 2" />
          </svg>
        </div>

        <!-- 3. Karung Resin (Red) -->
        <div class="industrial-icon text-red-600 transform -rotate-12" title="Karung Resin PP">
          <svg class="w-11 h-11 sm:w-13 sm:h-13" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 14c0-4 4-6 12-6s12 2 12 6l3 22c0 3-4 6-15 6s-15-3-15-6z" fill="#fee2e2" fill-opacity="0.6" />
            <ellipse cx="24" cy="8" rx="7" ry="2.5" fill="currentColor" />
            <line x1="17" y1="12" x2="31" y2="12" stroke-width="3" stroke-linecap="round" />
            <rect x="18" y="21" width="12" height="9" rx="1.5" stroke="currentColor" stroke-width="1.8" fill="#ffffff" />
            <text x="24" y="27.5" font-size="6.5" font-family="monospace" font-weight="900" text-anchor="middle" fill="currentColor" stroke="none">PP</text>
          </svg>
        </div>

        <!-- 4. Forklift (Black) -->
        <div class="industrial-icon text-zinc-950 transform rotate-6" title="Forklift">
          <svg class="w-13 h-13 sm:w-15 sm:h-15" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 32h18v-8l-8-6H8v14z" fill="#f4f4f5" fill-opacity="0.7" />
            <path d="M24 14h6v22" stroke-width="2.5" />
            <path d="M30 30h10v-4" stroke-width="2.5" stroke-linecap="round" />
            <circle cx="12" cy="36" r="4.5" fill="#18181b" stroke="#ef4444" stroke-width="2" />
            <circle cx="26" cy="36" r="4.5" fill="#18181b" stroke="#ef4444" stroke-width="2" />
            <line x1="16" y1="18" x2="16" y2="24" stroke-width="2" />
          </svg>
        </div>

        <!-- 5. Mesin Converting (Red) -->
        <div class="industrial-icon text-red-600 transform -rotate-8" title="Mesin Konversi">
          <svg class="w-12 h-12 sm:w-14 sm:h-14" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="6" y="24" width="36" height="16" rx="2" fill="#fee2e2" fill-opacity="0.5" />
            <circle cx="15" cy="18" r="6" fill="#ffffff" stroke="currentColor" stroke-width="2" />
            <circle cx="33" cy="18" r="6" fill="#ffffff" stroke="currentColor" stroke-width="2" />
            <path d="M15 12h18" stroke-width="2.5" />
            <line x1="12" y1="32" x2="20" y2="32" stroke-width="2.5" />
            <circle cx="28" cy="32" r="2.5" fill="currentColor" stroke="none" />
            <circle cx="34" cy="32" r="2.5" fill="currentColor" stroke="none" />
          </svg>
        </div>

        <!-- REPEAT SET 1 (For seamless looping) -->
        <div class="industrial-icon text-red-600 transform -rotate-6">
          <svg class="w-12 h-12 sm:w-14 sm:h-14" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 40h40M6 40V22l10 6V18l10 6V14l10 6v20" fill="#fee2e2" fill-opacity="0.6" />
            <circle cx="12" cy="32" r="2.5" fill="currentColor" stroke="none" />
            <circle cx="22" cy="32" r="2.5" fill="currentColor" stroke="none" />
          </svg>
        </div>
        <div class="industrial-icon text-zinc-950 transform rotate-12">
          <svg class="w-12 h-12 sm:w-14 sm:h-14" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <ellipse cx="18" cy="24" rx="8" ry="16" fill="#e4e4e7" fill-opacity="0.6" />
            <path d="M18 8h18c4.4 0 8 7.2 8 16s-3.6 16-8 16H18" fill="#f4f4f5" fill-opacity="0.5" />
            <ellipse cx="18" cy="24" rx="3.5" ry="7" fill="#ffffff" stroke="currentColor" stroke-width="2" />
          </svg>
        </div>
      </div>

      <!-- STREAM 2 (MIDDLE BAND - DRIFTING WITH MODERATE SPEED) -->
      <div class="absolute top-[46%] left-0 w-[200%] flex items-center justify-around stream-track stream-mid">
        <!-- 6. Roda Gigi (Black) -->
        <div class="industrial-icon text-zinc-950 transform rotate-25" title="Roda Gigi Mekanikal">
          <svg class="w-12 h-12 sm:w-14 sm:h-14" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.2">
            <path d="M24 6v4m0 28v4M6 24h4m28 0h4m-7.2-12.8-2.8 2.8m-16 16-2.8 2.8m0-21.6 2.8 2.8m16 16 2.8 2.8" stroke-width="3" stroke-linecap="round" />
            <circle cx="24" cy="24" r="11" fill="#f4f4f5" fill-opacity="0.7" stroke-width="2" />
            <circle cx="24" cy="24" r="4.5" fill="currentColor" />
          </svg>
        </div>

        <!-- 7. Alat Ukur Meteran (Red) -->
        <div class="industrial-icon text-red-600 transform -rotate-15" title="Meteran Roll Pengukur">
          <svg class="w-12 h-12 sm:w-14 sm:h-14" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="6" y="14" width="24" height="24" rx="5" fill="#fee2e2" fill-opacity="0.6" />
            <circle cx="18" cy="26" r="6" fill="#ffffff" stroke="currentColor" stroke-width="2" />
            <circle cx="18" cy="26" r="2.5" fill="currentColor" stroke="none" />
            <path d="M30 32h14v-7H30" fill="#dc2626" fill-opacity="0.25" />
            <line x1="33" y1="25" x2="33" y2="29" stroke-width="2" />
            <line x1="37" y1="25" x2="37" y2="31" stroke-width="2" />
            <line x1="41" y1="25" x2="41" y2="29" stroke-width="2" />
          </svg>
        </div>

        <!-- 8. AI Chip Brain (Black) -->
        <div class="industrial-icon text-zinc-950 transform rotate-12" title="Kecerdasan Buatan (AI)">
          <svg class="w-12 h-12 sm:w-14 sm:h-14" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="12" y="12" width="24" height="24" rx="4" fill="#f4f4f5" fill-opacity="0.8" />
            <text x="24" y="27" font-size="11.5" font-family="monospace" font-weight="900" text-anchor="middle" fill="#dc2626" stroke="none">AI</text>
            <line x1="18" y1="6" x2="18" y2="12" stroke-width="2.5" />
            <line x1="24" y1="6" x2="24" y2="12" stroke-width="2.5" />
            <line x1="30" y1="6" x2="30" y2="12" stroke-width="2.5" />
            <line x1="18" y1="36" x2="18" y2="42" stroke-width="2.5" />
            <line x1="24" y1="36" x2="24" y2="42" stroke-width="2.5" />
            <line x1="30" y1="36" x2="30" y2="42" stroke-width="2.5" />
            <line x1="6" y1="18" x2="12" y2="18" stroke-width="2.5" />
            <line x1="6" y1="24" x2="12" y2="24" stroke-width="2.5" />
            <line x1="6" y1="30" x2="12" y2="30" stroke-width="2.5" />
            <line x1="36" y1="18" x2="42" y2="18" stroke-width="2.5" />
            <line x1="36" y1="24" x2="42" y2="24" stroke-width="2.5" />
            <line x1="36" y1="30" x2="42" y2="30" stroke-width="2.5" />
          </svg>
        </div>

        <!-- 9. Komputer Terminal (Red) -->
        <div class="industrial-icon text-red-600 transform -rotate-6" title="Komputer Kontrol">
          <svg class="w-12 h-12 sm:w-14 sm:h-14" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="6" y="8" width="36" height="24" rx="3" fill="#fee2e2" fill-opacity="0.5" />
            <line x1="12" y1="15" x2="26" y2="15" stroke-width="2.5" />
            <line x1="12" y1="21" x2="36" y2="21" stroke-width="2" stroke-dasharray="3 2" />
            <line x1="12" y1="26" x2="22" y2="26" stroke-width="2" />
            <path d="M24 32v6M16 38h16" stroke-width="2.8" stroke-linecap="round" />
            <circle cx="33" cy="15" r="2.5" fill="#dc2626" stroke="none" />
          </svg>
        </div>

        <!-- REPEAT SET 2 -->
        <div class="industrial-icon text-zinc-950 transform rotate-25">
          <svg class="w-12 h-12 sm:w-14 sm:h-14" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.2">
            <circle cx="24" cy="24" r="11" fill="#f4f4f5" fill-opacity="0.7" stroke-width="2" />
            <circle cx="24" cy="24" r="4.5" fill="currentColor" />
          </svg>
        </div>
        <div class="industrial-icon text-red-600 transform -rotate-15">
          <svg class="w-12 h-12 sm:w-14 sm:h-14" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="6" y="14" width="24" height="24" rx="5" fill="#fee2e2" fill-opacity="0.6" />
            <circle cx="18" cy="26" r="6" fill="#ffffff" stroke="currentColor" stroke-width="2" />
          </svg>
        </div>
      </div>

      <!-- STREAM 3 (LOWER BAND - STEADY FLOW) -->
      <div class="absolute bottom-[6%] left-0 w-[200%] flex items-center justify-around stream-track stream-slow">
        <!-- Forklift (Red) -->
        <div class="industrial-icon text-red-600 transform -rotate-4" title="Forklift Pabrik">
          <svg class="w-13 h-13 sm:w-15 sm:h-15" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 32h18v-8l-8-6H8v14z" fill="#fee2e2" fill-opacity="0.6" />
            <path d="M24 14h6v22" stroke-width="2.5" />
            <path d="M30 30h10v-4" stroke-width="2.5" stroke-linecap="round" />
            <circle cx="12" cy="36" r="4.5" fill="#dc2626" stroke="#18181b" stroke-width="2" />
            <circle cx="26" cy="36" r="4.5" fill="#dc2626" stroke="#18181b" stroke-width="2" />
          </svg>
        </div>

        <!-- Roll Film (Red) -->
        <div class="industrial-icon text-red-600 transform rotate-8" title="Roll Film Selesai">
          <svg class="w-12 h-12 sm:w-14 sm:h-14" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <ellipse cx="18" cy="24" rx="8" ry="16" fill="#fee2e2" fill-opacity="0.6" />
            <path d="M18 8h18c4.4 0 8 7.2 8 16s-3.6 16-8 16H18" fill="#fecdd3" fill-opacity="0.4" />
            <ellipse cx="18" cy="24" rx="3.5" ry="7" fill="#ffffff" stroke="currentColor" stroke-width="2" />
          </svg>
        </div>

        <!-- Pabrik (Black) -->
        <div class="industrial-icon text-zinc-950 transform rotate-6" title="Pabrik Utama">
          <svg class="w-12 h-12 sm:w-14 sm:h-14" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 40h40M6 40V22l10 6V18l10 6V14l10 6v20" fill="#f4f4f5" fill-opacity="0.7" />
            <path d="M36 40V14h6v26" fill="#27272a" fill-opacity="0.25" />
            <circle cx="12" cy="32" r="2.5" fill="#ef4444" stroke="none" />
            <circle cx="22" cy="32" r="2.5" fill="#ef4444" stroke="none" />
          </svg>
        </div>

        <!-- AI (Red) -->
        <div class="industrial-icon text-red-600 transform -rotate-12" title="AI Analytics">
          <svg class="w-12 h-12 sm:w-14 sm:h-14" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="12" y="12" width="24" height="24" rx="4" fill="#fee2e2" fill-opacity="0.6" />
            <text x="24" y="27" font-size="11.5" font-family="monospace" font-weight="900" text-anchor="middle" fill="#dc2626" stroke="none">AI</text>
            <line x1="18" y1="6" x2="18" y2="12" stroke-width="2.5" />
            <line x1="24" y1="6" x2="24" y2="12" stroke-width="2.5" />
            <line x1="30" y1="6" x2="30" y2="12" stroke-width="2.5" />
            <line x1="18" y1="36" x2="18" y2="42" stroke-width="2.5" />
            <line x1="24" y1="36" x2="24" y2="42" stroke-width="2.5" />
            <line x1="30" y1="36" x2="30" y2="42" stroke-width="2.5" />
          </svg>
        </div>

        <!-- Komputer (Black) -->
        <div class="industrial-icon text-zinc-950 transform rotate-15" title="Sistem Komputer">
          <svg class="w-12 h-12 sm:w-14 sm:h-14" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="6" y="8" width="36" height="24" rx="3" fill="#f4f4f5" fill-opacity="0.8" />
            <line x1="12" y1="15" x2="26" y2="15" stroke-width="2.5" />
            <line x1="12" y1="21" x2="36" y2="21" stroke-width="2" stroke-dasharray="3 2" />
            <path d="M24 32v6M16 38h16" stroke-width="2.8" stroke-linecap="round" />
          </svg>
        </div>

        <!-- REPEAT SET 3 -->
        <div class="industrial-icon text-red-600 transform -rotate-4">
          <svg class="w-13 h-13 sm:w-15 sm:h-15" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 32h18v-8l-8-6H8v14z" fill="#fee2e2" fill-opacity="0.6" />
            <path d="M24 14h6v22" stroke-width="2.5" />
            <circle cx="12" cy="36" r="4.5" fill="#dc2626" />
          </svg>
        </div>
      </div>
    </div>
    
    <!-- ========================================================================= -->
    <!-- SEDIKIT OVERLAY PUTIH (SEIMBANG & ESTETIK: IKON TETAP JELAS TERLIHAT) -->
    <!-- ========================================================================= -->
    <div class="absolute inset-0 bg-white/35 backdrop-blur-[1px] pointer-events-none"></div>

    <!-- Soft Radial Gradient: Sedikit lebih putih di tengah agar form login sangat nyaman dibaca -->
    <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.75)_0%,rgba(255,255,255,0.25)_65%,transparent_100%)] pointer-events-none"></div>

    <!-- Ambient Subtle Red Highlights -->
    <div class="absolute top-10 left-10 w-72 h-72 bg-red-500/8 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute bottom-10 right-10 w-72 h-72 bg-red-600/8 rounded-full blur-3xl pointer-events-none"></div>

    <!-- ========================================================================= -->
    <!-- FORM LOGIN TENGAH: KEREN, ESTETIK, PROFESIONAL & ELEGAN -->
    <!-- ========================================================================= -->
    <div class="w-full max-w-md relative z-10 animate-fade-in">
      
      <!-- Card Container (Clean White with Floating Shadow & Red Top Stripe) -->
      <div class="bg-white border border-zinc-200/90 rounded-3xl shadow-[0_25px_65px_-15px_rgba(0,0,0,0.14)] p-7 sm:p-9 relative overflow-hidden">
        
        <!-- Top Accent Red Line -->
        <div class="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-red-600 via-red-500 to-zinc-900"></div>

        <!-- ===================================================================== -->
        <!-- HEADER FORM: VARIASI UKURAN FONT ESTETIK & PROFESIONAL -->
        <!-- ===================================================================== -->
        <div class="text-center space-y-2 mb-7">
          <!-- Official SWC Corporate Badge -->
          <div class="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-zinc-50 border border-zinc-200/80 shadow-2xs mb-2">
            <span class="font-black text-red-600 text-base leading-none tracking-tighter" style="font-family: 'Arial Black', Impact, sans-serif;">
              SWC
            </span>
            <span class="w-1 h-1 rounded-full bg-zinc-300"></span>
            <span class="text-[9px] font-black text-zinc-800 font-mono tracking-widest uppercase">
              PT. SAPTAWARNA CEMERLANG
            </span>
          </div>

          <!-- Variasi Font Judul: SISTEM INFORMASI DATA PRODUKSI -->
          <div>
            <div class="text-[10px] font-mono font-bold tracking-[0.22em] text-red-600 uppercase">
              PORTAL AUTENTIKASI RESMI
            </div>
            <h1 class="text-xl sm:text-2xl font-black text-zinc-950 tracking-tight leading-snug mt-0.5">
              SISTEM INFORMASI DATA PRODUKSI
            </h1>
            <div class="text-xs sm:text-[13px] font-black text-zinc-800 tracking-wider uppercase font-mono mt-1">
              SWC INHOUSE PRODUCTION FILM
            </div>
          </div>

          <p class="text-[11px] text-zinc-500 font-medium leading-relaxed max-w-xs mx-auto">
            Slitting • Rewind • Casting • Metallizing Converting System
          </p>
        </div>

        <!-- Error Alert Banner -->
        <div
          v-if="errorMessage"
          class="mb-5 p-3 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2.5 animate-fade-in"
        >
          <span class="text-sm text-red-600 shrink-0 mt-0.5">⚠️</span>
          <div class="leading-relaxed font-semibold">{{ errorMessage }}</div>
        </div>

        <!-- Login Form -->
        <form @submit.prevent="handleLogin" class="space-y-4">
          <!-- Username / Email Field -->
          <div class="space-y-1.5">
            <label class="block text-[11px] font-bold text-zinc-700 font-mono tracking-tight uppercase">
              Username atau Email
            </label>
            <div class="relative">
              <span class="absolute left-3.5 top-3 text-zinc-400">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </span>
              <input
                v-model="loginForm.identifier"
                type="text"
                required
                autocomplete="username"
                placeholder="Masukkan username atau email"
                class="w-full bg-zinc-50/70 border border-zinc-200 text-zinc-900 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm font-mono focus:bg-white focus:border-red-600 focus:ring-2 focus:ring-red-600/15 outline-none transition-all placeholder:text-zinc-400 shadow-2xs"
              />
            </div>
          </div>

          <!-- Password Field -->
          <div class="space-y-1.5">
            <div class="flex items-center justify-between">
              <label class="block text-[11px] font-bold text-zinc-700 font-mono tracking-tight uppercase">
                Kata Sandi (Password)
              </label>
              <button
                type="button"
                @click="openResetModal"
                class="text-[11px] font-bold text-red-600 hover:text-red-700 transition-colors cursor-pointer"
              >
                Lupa Kata Sandi?
              </button>
            </div>
            <div class="relative">
              <span class="absolute left-3.5 top-3 text-zinc-400">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
              </span>
              <input
                v-model="loginForm.password"
                :type="showPassword ? 'text' : 'password'"
                required
                autocomplete="current-password"
                placeholder="Masukkan kata sandi"
                class="w-full bg-zinc-50/70 border border-zinc-200 text-zinc-900 rounded-xl pl-10 pr-10 py-2.5 text-xs sm:text-sm font-mono focus:bg-white focus:border-red-600 focus:ring-2 focus:ring-red-600/15 outline-none transition-all placeholder:text-zinc-400 shadow-2xs"
              />
              <!-- Show/Hide Toggle -->
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3.5 top-2.5 text-zinc-400 hover:text-zinc-700 transition-colors cursor-pointer text-xs"
                title="Lihat/Sembunyikan Password"
              >
                <span v-if="showPassword">👁️</span>
                <span v-else>👁️‍🗨️</span>
              </button>
            </div>
          </div>

          <!-- Remember Me -->
          <div class="flex items-center justify-between text-xs pt-0.5">
            <label class="flex items-center gap-2 cursor-pointer text-zinc-600 hover:text-zinc-900 font-medium">
              <input
                v-model="loginForm.remember"
                type="checkbox"
                class="rounded bg-zinc-100 border-zinc-300 text-red-600 focus:ring-red-500 cursor-pointer"
              />
              <span class="text-[11.5px]">Ingat Sesi di Perangkat Ini</span>
            </label>
          </div>

          <!-- Submit Button (Minimalist Monochrome Black with Red Hover) -->
          <button
            type="submit"
            :disabled="isLoading"
            class="w-full py-3 px-4 rounded-xl bg-zinc-950 hover:bg-red-600 text-white font-black text-xs sm:text-sm tracking-wider uppercase font-mono shadow-md hover:shadow-red-600/25 transition-all cursor-pointer flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed mt-3 border border-zinc-900 hover:border-red-600"
          >
            <svg v-if="isLoading" class="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span v-else>🔒</span>
            <span>{{ isLoading ? 'MEMVERIFIKASI...' : 'MASUK KE SISTEM' }}</span>
          </button>
        </form>

        <!-- Footer Notice -->
        <div class="text-center text-[10.5px] text-zinc-400 font-mono mt-6 pt-4 border-t border-zinc-100 flex items-center justify-between">
          <span>Enterprise Secure</span>
          <span>© 2026 PT. Saptawarna Cemerlang</span>
        </div>
      </div>
    </div>

    <!-- ========================================================================= -->
    <!-- MODAL: PEMULIHAN PASSWORD & VERIFIKASI OTP -->
    <!-- ========================================================================= -->
    <div
      v-if="showResetModal"
      class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
      @click.self="showResetModal = false"
    >
      <div class="w-full max-w-md bg-white text-zinc-900 border border-zinc-200 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 animate-fade-in">
        <div class="flex items-center justify-between border-b border-zinc-100 pb-3">
          <div class="flex items-center gap-2">
            <span class="text-base text-red-600 font-black">🔑</span>
            <h3 class="font-black text-sm text-zinc-900 font-mono">Pemulihan Kata Sandi</h3>
          </div>
          <button
            @click="showResetModal = false"
            class="text-zinc-400 hover:text-zinc-700 text-xs font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div v-if="resetError" class="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold">
          {{ resetError }}
        </div>

        <!-- Step 1: Input Email -->
        <div v-if="resetStep === 1" class="space-y-4">
          <p class="text-xs text-zinc-600 leading-relaxed">
            Masukkan alamat email akun Super Admin Anda. Sistem akan memverifikasi dan mengirimkan kode OTP satu kali pakai.
          </p>
          <div>
            <label class="block text-xs font-bold text-zinc-800 mb-1 font-mono">Email Terdaftar</label>
            <input
              v-model="resetEmailInput"
              type="email"
              required
              class="w-full px-3 py-2 text-xs bg-zinc-50 border border-zinc-300 rounded-xl text-zinc-900 font-mono focus:border-red-600 focus:bg-white outline-none"
              placeholder="nama@email.com"
            />
          </div>
          <button
            @click="handleSendOtp"
            :disabled="isResetting || !resetEmailInput"
            class="w-full py-2.5 rounded-xl bg-zinc-950 hover:bg-red-600 font-bold font-mono tracking-wider uppercase text-xs text-white transition-colors cursor-pointer disabled:opacity-50"
          >
            {{ isResetting ? 'Mengirim...' : 'KIRIM KODE OTP' }}
          </button>
        </div>

        <!-- Step 2: Input OTP & New Password -->
        <div v-else-if="resetStep === 2" class="space-y-4">
          <div class="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs space-y-1">
            <p>Kode OTP telah dikirimkan ke: <strong>{{ resetMaskedEmail }}</strong></p>
            <p v-if="demoOtpCode" class="font-mono font-bold text-[11px] text-emerald-800">
              [Kode Verifikasi: {{ demoOtpCode }}]
            </p>
          </div>
          <div>
            <label class="block text-xs font-bold text-zinc-800 mb-1 font-mono">Kode OTP (6 Digit)</label>
            <input
              v-model="resetOtpInput"
              maxlength="6"
              class="w-full px-3 py-2 text-center tracking-widest text-base font-black bg-zinc-50 border border-zinc-300 rounded-xl text-zinc-900 font-mono focus:border-red-600 focus:bg-white outline-none uppercase"
              placeholder="123456"
            />
          </div>
          <div>
            <label class="block text-xs font-bold text-zinc-800 mb-1 font-mono">Kata Sandi Baru</label>
            <input
              v-model="resetNewPassword"
              type="password"
              class="w-full px-3 py-2 text-xs bg-zinc-50 border border-zinc-300 rounded-xl text-zinc-900 font-mono focus:border-red-600 focus:bg-white outline-none"
              placeholder="Minimal 8 karakter (kombinasi huruf & angka)"
            />
          </div>
          <button
            @click="handleVerifyAndReset"
            :disabled="isResetting || !resetOtpInput || !resetNewPassword"
            class="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold font-mono tracking-wider uppercase text-xs text-white transition-colors cursor-pointer disabled:opacity-50"
          >
            {{ isResetting ? 'Menyimpan...' : 'SIMPAN KATA SANDI BARU' }}
          </button>
        </div>

        <!-- Step 3: Success -->
        <div v-else-if="resetStep === 3" class="space-y-4 text-center py-2">
          <div class="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-2xl mx-auto font-black">
            ✓
          </div>
          <div class="space-y-1">
            <h4 class="font-bold text-base text-zinc-900 font-mono">Kata Sandi Berhasil Diperbarui!</h4>
            <p class="text-xs text-zinc-500">Silakan login kembali dengan kredensial baru Anda.</p>
          </div>
          <button
            @click="showResetModal = false; resetStep = 1"
            class="px-5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-950 text-white font-bold font-mono text-xs cursor-pointer"
          >
            Tutup & Kembali ke Login
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import { DEFAULT_SUPER_ADMIN } from '@/services/authService';

const router = useRouter();
const authStore = useAuthStore();

// Form State
const loginForm = reactive({
  identifier: '',
  password: '',
  remember: true
});

const showPassword = ref(false);
const isLoading = ref(false);
const errorMessage = ref('');

// Password Reset Modal State
const showResetModal = ref(false);
const resetStep = ref(1); // 1: Email, 2: OTP, 3: Success
const resetEmailInput = ref(DEFAULT_SUPER_ADMIN.email);
const resetOtpInput = ref('');
const resetNewPassword = ref('');
const resetMaskedEmail = ref('');
const demoOtpCode = ref('');
const resetError = ref('');
const isResetting = ref(false);

const handleLogin = async () => {
  errorMessage.value = '';
  isLoading.value = true;
  try {
    await authStore.login(loginForm.identifier, loginForm.password);
    router.push('/');
  } catch (err) {
    errorMessage.value = err.message || 'Gagal login. Silakan periksa kembali username dan kata sandi Anda.';
  } finally {
    isLoading.value = false;
  }
};

const openResetModal = () => {
  resetStep.value = 1;
  resetError.value = '';
  resetOtpInput.value = '';
  resetNewPassword.value = '';
  resetEmailInput.value = DEFAULT_SUPER_ADMIN.email;
  showResetModal.value = true;
};

const handleSendOtp = async () => {
  resetError.value = '';
  isResetting.value = true;
  try {
    const res = await authStore.requestPasswordResetOtp(resetEmailInput.value);
    resetMaskedEmail.value = res.maskedEmail;
    demoOtpCode.value = res.otpCode;
    resetStep.value = 2;
  } catch (err) {
    resetError.value = err.message || 'Gagal mengirim kode verifikasi.';
  } finally {
    isResetting.value = false;
  }
};

const handleVerifyAndReset = async () => {
  resetError.value = '';
  isResetting.value = true;
  try {
    await authStore.verifyOtpAndResetPassword(
      resetEmailInput.value,
      resetOtpInput.value,
      resetNewPassword.value
    );
    resetStep.value = 3;
  } catch (err) {
    resetError.value = err.message || 'Verifikasi gagal.';
  } finally {
    isResetting.value = false;
  }
};
</script>

<style scoped>
/* ========================================================================= */
/* ANIMATED INDUSTRIAL ICONS DRIFTING LEFT TO RIGHT */
/* ========================================================================= */
.stream-track {
  animation: moveTrackLeftToRight linear infinite;
  will-change: transform;
}

.stream-slow {
  animation-duration: 42s;
}

.stream-mid {
  animation-duration: 32s;
}

@keyframes moveTrackLeftToRight {
  0% {
    transform: translateX(-50%);
  }
  100% {
    transform: translateX(0%);
  }
}

.industrial-icon {
  transition: transform 0.25s ease;
  filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 0.08));
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.97);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-fade-in {
  animation: fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
</style>
