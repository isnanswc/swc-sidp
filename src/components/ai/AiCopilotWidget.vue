<template>
  <div class="fixed z-50 font-sans print:hidden">
    <!-- ═══════════════════════════════════════════════════════════════════════ -->
    <!-- 1. FLOATING DRAGGABLE BUBBLE (COLLAPSED STATE)                          -->
    <!-- ═══════════════════════════════════════════════════════════════════════ -->
    <!-- ═══════════════════════════════════════════════════════════════════════ -->
    <!-- 1. FLOATING MINIMALIST BUTTON (COLLAPSED STATE)                         -->
    <!-- ═══════════════════════════════════════════════════════════════════════ -->
    <div
      v-if="!isOpen && !isTemporarilyHidden"
      ref="bubbleRef"
      @mousedown="startBubbleDrag"
      @touchstart="startBubbleDragTouch"
      @click="handleBubbleClick"
      :style="{ left: `${bubblePos.x}px`, top: `${bubblePos.y}px` }"
      class="fixed cursor-grab active:cursor-grabbing group z-50 select-none transition-transform hover:scale-105 active:scale-95"
    >
      <div class="relative">
        <!-- Compact Minimalist Button (Red-White-Black Heartbeat Circuit) -->
        <div class="w-12 h-12 rounded-2xl bg-black text-white shadow-xl shadow-red-950/40 border border-red-600/50 heartbeat-border flex items-center justify-center transition-all duration-200 backdrop-blur-md relative overflow-hidden">
          <!-- Subtle Circuit Glow Overlay -->
          <div class="absolute inset-0 bg-radial from-red-600/20 via-transparent to-transparent opacity-75"></div>
          
          <!-- Clean AI Sparkle Icon (Red & White) -->
          <svg class="w-5 h-5 text-red-500 group-hover:text-white transition-colors relative z-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
            <path d="M5 3v4"/>
            <path d="M19 17v4"/>
            <path d="M3 5h4"/>
            <path d="M17 19h4"/>
          </svg>

          <!-- Rhythmic Heartbeat Glowing Dot at Top Right -->
          <span class="absolute top-1 right-1 flex h-2 w-2 z-10">
            <span class="heartbeat-dot inline-flex h-full w-full rounded-full bg-red-500"></span>
          </span>
        </div>

        <!-- Sleek Tooltip on Hover (Muncul Detail Tulisan saat Hover) -->
        <div 
          :class="[
            'absolute top-1/2 -translate-y-1/2 px-3.5 py-2 rounded-xl bg-black/95 text-white shadow-2xl border border-red-900/80 opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 whitespace-nowrap flex items-center gap-2.5 backdrop-blur-md scale-95 group-hover:scale-100 z-50',
            bubblePos.x > 250 ? 'right-full mr-3 origin-right' : 'left-full ml-3 origin-left'
          ]"
        >
          <div class="w-2 h-2 rounded-full bg-red-500 heartbeat-dot"></div>
          <div class="text-left">
            <div class="font-black text-xs text-white leading-tight flex items-center gap-1.5">
              <span>SWC AI Copilot</span>
              <span class="px-1.5 py-0.2 rounded text-[9px] bg-red-600 text-white font-mono font-bold">ONLINE</span>
            </div>
            <div class="text-[10px] text-zinc-400 leading-tight mt-0.5">Tanya Data Roll, SPK & Kualitas</div>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════════════ -->
    <!-- 2. EXPANDED AI COPILOT CHAT WINDOW                                     -->
    <!-- ═══════════════════════════════════════════════════════════════════════ -->
    <div
      v-if="isOpen"
      ref="modalWindowRef"
      :style="windowStyle"
      class="fixed w-[92vw] sm:w-[480px] h-[620px] max-h-[88vh] bg-zinc-950 rounded-2xl shadow-2xl border border-red-900/60 shadow-red-950/50 overflow-hidden flex flex-col z-50 text-white select-text animate-fade-in"
    >
      <!-- DRAGGABLE MODAL HEADER (WITH HEARTBEAT CIRCUIT ANIMATION) -->
      <div 
        @mousedown="startModalDrag"
        @touchstart="startModalDragTouch"
        class="px-4 py-2.5 bg-black border-b border-red-900/60 text-white flex items-center justify-between shadow-xs relative z-20 select-none cursor-grab active:cursor-grabbing overflow-hidden"
      >
        <!-- Heartbeat Animated Circuit SVG in Header Background -->
        <svg class="absolute inset-0 w-full h-full pointer-events-none opacity-30 circuit-heartbeat-bg" viewBox="0 0 480 44" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="headerCircuitGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#ef4444" stop-opacity="0.3" />
              <stop offset="35%" stop-color="#ef4444" stop-opacity="0.95" />
              <stop offset="65%" stop-color="#ffffff" stop-opacity="0.95" />
              <stop offset="100%" stop-color="#ef4444" stop-opacity="0.3" />
            </linearGradient>
            <filter id="circuitGlowFilter" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <!-- Animated Pulse Circuit Lines -->
          <path d="M 0 22 L 60 22 L 78 8 L 135 8 L 150 32 L 200 32 L 218 14 L 260 14 L 275 36 L 330 36 L 350 12 L 400 12 L 420 22 L 480 22" 
                fill="none" stroke="url(#headerCircuitGrad)" stroke-width="1.6" filter="url(#circuitGlowFilter)" />
          <path d="M 30 40 L 70 40 L 85 26 L 160 26 M 240 5 L 280 5 L 295 24 L 370 24" 
                fill="none" stroke="#ef4444" stroke-width="1" opacity="0.4" stroke-dasharray="3,3" />
          <!-- Circuit Nodes -->
          <circle cx="78" cy="8" r="2.5" fill="#ef4444" filter="url(#circuitGlowFilter)" />
          <circle cx="150" cy="32" r="2.5" fill="#ffffff" filter="url(#circuitGlowFilter)" />
          <circle cx="218" cy="14" r="2.5" fill="#ef4444" filter="url(#circuitGlowFilter)" />
          <circle cx="275" cy="36" r="2.5" fill="#ffffff" filter="url(#circuitGlowFilter)" />
          <circle cx="350" cy="12" r="2.5" fill="#ef4444" filter="url(#circuitGlowFilter)" />
        </svg>

        <!-- Left: History & Title -->
        <div class="flex items-center gap-2 relative z-10">
          <!-- History Drawer Toggle Button -->
          <button
            type="button"
            @click.stop="isHistoryOpen = !isHistoryOpen"
            :class="['p-1.5 px-2 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold', isHistoryOpen ? 'bg-red-600 text-white shadow-xs' : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800']"
            title="Buka Riwayat Percakapan"
          >
            <span class="text-xs">📜</span>
            <span class="hidden sm:inline text-[10.5px]">Riwayat</span>
          </button>

          <!-- Minimalist Title -->
          <div class="flex items-center gap-2 ml-1">
            <div class="w-6 h-6 rounded-lg bg-red-950/70 text-red-500 border border-red-600/40 flex items-center justify-center text-xs">
              ✨
            </div>
            <div>
              <h3 class="font-black text-xs text-white leading-tight flex items-center gap-1.5">
                SWC AI Copilot
                <span class="w-1.5 h-1.5 rounded-full bg-red-500 heartbeat-dot"></span>
              </h3>
              <p class="text-[9px] text-zinc-400 font-mono leading-none mt-0.5">Asisten Analisis Roll & Kualitas</p>
            </div>
          </div>
        </div>

        <!-- Center: Drag Handle Grip Indicator -->
        <div class="hidden sm:flex flex-col items-center justify-center opacity-50 hover:opacity-100 transition-opacity relative z-10">
          <div class="w-10 h-1 rounded-full bg-red-600/80"></div>
        </div>

        <!-- Right: Action Controls (New Chat, Minimize, Close) -->
        <div class="flex items-center gap-1 relative z-10">
          <button
            type="button"
            @click.stop="createNewConversation"
            title="Percakapan Baru"
            class="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 hover:border-red-600/50 transition-colors cursor-pointer"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M12 4v16m8-8H4"/>
            </svg>
          </button>
          
          <!-- Minimize Button (Always visible with clear icon) -->
          <button
            type="button"
            @click.stop="minimizeModal"
            title="Minimize ke tombol float"
            class="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-colors cursor-pointer"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M20 12H4"/>
            </svg>
          </button>

          <!-- Close Button -->
          <button
            type="button"
            @click.stop="closeModal"
            title="Tutup Chat AI"
            class="p-1.5 rounded-lg bg-zinc-900 hover:bg-red-600 text-zinc-300 hover:text-white border border-zinc-800 hover:border-red-500 transition-colors cursor-pointer"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- MAIN CONTAINER (WITH SLIDE-OVER HISTORY DRAWER) -->
      <div class="relative flex-1 overflow-hidden flex flex-col bg-zinc-50/50">
        <!-- ───────────────────────────────────────────────────────────────── -->
        <!-- 2A. LEFT SLIDE-OUT DRAWER: RIWAYAT PERCAKAPAN                     -->
        <!-- ───────────────────────────────────────────────────────────────── -->
        <div
          v-if="isHistoryOpen"
          class="absolute inset-0 z-30 bg-zinc-900/95 backdrop-blur-md text-white flex flex-col animate-fade-in"
        >
          <!-- Drawer Header -->
          <div class="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
            <div class="flex items-center gap-2">
              <span class="text-base">📜</span>
              <div>
                <h4 class="text-xs font-black text-white uppercase tracking-wider">Riwayat Percakapan</h4>
                <p class="text-[10px] text-zinc-400">{{ conversations.length }} sesi tersimpan</p>
              </div>
            </div>
            <button
              @click="isHistoryOpen = false"
              class="p-1 px-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              ✕ Tutup
            </button>
          </div>

          <!-- New Chat Button inside Drawer -->
          <div class="p-3 border-b border-white/5">
            <button
              @click="createNewConversation"
              class="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-black flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <span>✨</span>
              <span>+ Mulai Percakapan Baru</span>
            </button>
          </div>

          <!-- List of Conversations -->
          <div class="flex-1 overflow-y-auto p-3 space-y-2">
            <div v-if="conversations.length === 0" class="py-12 text-center text-zinc-400 text-xs space-y-1">
              <span>📭</span>
              <p>Belum ada riwayat percakapan</p>
            </div>

            <div
              v-for="session in conversations"
              :key="session.id"
              @click="selectConversation(session.id)"
              :class="[
                'p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between group',
                currentSessionId === session.id
                  ? 'bg-indigo-600/30 border-indigo-500 text-white shadow-xs'
                  : 'bg-white/5 border-white/5 text-zinc-300 hover:bg-white/10 hover:text-white'
              ]"
            >
              <div class="flex-1 min-w-0 pr-2">
                <p class="text-xs font-bold truncate">{{ session.title || 'Percakapan Tanpa Judul' }}</p>
                <p class="text-[10px] text-zinc-400 flex items-center gap-2 mt-0.5">
                  <span>{{ formatTimestamp(session.updatedAt || session.createdAt) }}</span>
                  <span>•</span>
                  <span>{{ session.messages.length }} pesan</span>
                </p>
              </div>

              <!-- Delete Single Session Button -->
              <button
                @click.stop="deleteSingleConversation(session.id)"
                title="Hapus sesi ini"
                class="p-1.5 rounded-lg opacity-60 hover:opacity-100 hover:bg-red-500/20 hover:text-red-400 transition-all text-xs cursor-pointer"
              >
                🗑️
              </button>
            </div>
          </div>

          <!-- Drawer Footer: Clear All History Button -->
          <div v-if="conversations.length > 0" class="p-3 border-t border-white/10 bg-white/5 flex items-center justify-between">
            <button
              @click="clearAllConversations"
              class="w-full py-2 px-3 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-red-500/30"
            >
              <span>🗑️</span>
              <span>Hapus Semua Riwayat Percakapan</span>
            </button>
          </div>
        </div>

        <!-- ───────────────────────────────────────────────────────────────── -->
        <!-- 2B. CHAT MESSAGE AREA (DEEP BLACK BASE, HIGH CONTRAST)            -->
        <!-- ───────────────────────────────────────────────────────────────── -->
        <div ref="chatContainerRef" class="flex-1 overflow-y-auto p-4 space-y-3.5 bg-zinc-950/95">
          <!-- Welcome Greeting & Suggested Quick Chips -->
          <div v-if="currentMessages.length === 0" class="py-4 space-y-4 text-center animate-fade-in">
            <div class="w-12 h-12 rounded-2xl bg-black text-red-500 border border-red-600/50 heartbeat-border flex items-center justify-center text-2xl mx-auto shadow-lg shadow-red-950/40 relative">
              ✨
              <span class="w-2 h-2 rounded-full bg-red-500 heartbeat-dot absolute -top-1 -right-1"></span>
            </div>
            <div class="space-y-1">
              <h4 class="font-black text-sm text-white">Halo! Ada yang bisa saya bantu?</h4>
              <p class="text-xs text-zinc-400 max-w-xs mx-auto">
                Tanyakan apa saja seputar data roll, status kualitas (PASS/HOLD/REJECT), alasan defect, formula, mesin, atau operator.
              </p>
            </div>

            <!-- Quick Suggestions -->
            <div class="space-y-1.5 text-left pt-2">
              <p class="text-[10.5px] font-black text-red-400 uppercase tracking-wider px-1">Saran Pertanyaan Cepat:</p>
              <div class="flex flex-col gap-1.5">
                <button
                  v-for="(chip, idx) in defaultChips"
                  :key="idx"
                  @click="sendQuery(chip)"
                  class="p-2 px-3 rounded-xl bg-zinc-900 hover:bg-black border border-zinc-800 hover:border-red-500/70 text-xs text-zinc-200 hover:text-white font-bold transition-all text-left flex items-center justify-between group cursor-pointer shadow-xs"
                >
                  <span>{{ chip }}</span>
                  <span class="text-zinc-500 group-hover:text-red-400 text-[11px]">➔</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Render Chat Messages -->
          <div
            v-for="(msg, idx) in currentMessages"
            :key="idx"
            :class="['flex flex-col', msg.sender === 'user' ? 'items-end' : 'items-start']"
          >
            <!-- Sender Label -->
            <span class="text-[9.5px] font-bold text-zinc-400 mb-1 px-1 select-none">
              {{ msg.sender === 'user' ? 'Anda' : 'SWC AI Copilot' }} • {{ formatTime(msg.timestamp) }}
            </span>

            <!-- User Message Bubble (Crisp White on Pure Dark with Crimson Border) -->
            <div
              v-if="msg.sender === 'user'"
              class="p-3 px-4 rounded-2xl max-w-[88%] text-xs font-bold bg-zinc-900 !text-white border border-red-600/70 rounded-tr-xs shadow-md shadow-red-950/20 select-text"
            >
              <div class="whitespace-pre-line !text-white leading-relaxed select-text font-bold text-[12px]">{{ msg.text }}</div>
            </div>

            <!-- AI Message Card (Pure White Background for Flawless Readability) -->
            <div
              v-else
              class="p-3.5 rounded-2xl max-w-[96%] text-xs leading-relaxed transition-all shadow-md bg-white border border-zinc-200 !text-zinc-950 rounded-tl-xs space-y-2.5 select-text"
            >
              <!-- AI Header: Red Accent Badge + Copy Button -->
              <div class="flex items-center justify-between border-b border-zinc-100 pb-1.5 select-none">
                <div class="flex items-center gap-1.5 text-[10.5px] font-black text-red-700">
                  <span class="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                  <span>Analisis AI SWC</span>
                </div>
                <button
                  @click="copyMessage(msg.text, idx)"
                  class="px-2 py-0.5 rounded-md text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                  :class="copiedIdx === idx ? 'bg-red-100 text-red-800' : 'bg-zinc-100 hover:bg-red-50 text-zinc-700 hover:text-red-700 border border-zinc-200'"
                  title="Salin isi jawaban ini"
                >
                  <span>{{ copiedIdx === idx ? '✅' : '📋' }}</span>
                  <span>{{ copiedIdx === idx ? 'Tersalin!' : 'Salin' }}</span>
                </button>
              </div>

              <!-- Main Text (Maximum Contrast & Readability) -->
              <div class="text-xs leading-relaxed !text-zinc-950 font-normal select-text" v-html="renderFormattedHtml(msg.text)"></div>

              <!-- Interactive Follow-up Suggestion Chips -->
              <div v-if="msg.suggestions && msg.suggestions.length > 0" class="flex flex-wrap gap-1.5 pt-2 border-t border-zinc-100 select-none">
                <button
                  v-for="(sug, sIdx) in msg.suggestions"
                  :key="sIdx"
                  @click="sendQuery(sug)"
                  class="px-2.5 py-1 rounded-full text-[10.5px] font-bold bg-red-50/80 hover:bg-red-100 text-red-800 border border-red-200 transition-all cursor-pointer flex items-center gap-1 hover:scale-102 shadow-2xs text-left"
                >
                  <span>💬</span>
                  <span>{{ sug }}</span>
                </button>
              </div>

              <!-- Optional Metrics Stats Pills -->
              <div v-if="msg.metrics && typeof msg.metrics === 'object' && !Array.isArray(msg.metrics)" class="flex items-center gap-1.5 flex-wrap pt-1">
                <span v-if="msg.metrics.passRate" class="px-2 py-0.5 rounded-md text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                  PASS: {{ msg.metrics.passRate }}
                </span>
                <span v-if="msg.metrics.defectRate" class="px-2 py-0.5 rounded-md text-[10px] font-black bg-red-100 text-red-800 border border-red-200">
                  Defect Rate: {{ msg.metrics.defectRate }}
                </span>
                <span v-if="msg.metrics.slitting !== undefined" class="px-2 py-0.5 rounded-md text-[10px] font-black bg-zinc-100 text-zinc-800 border border-zinc-200">
                  Slitting: {{ msg.metrics.slitting }}
                </span>
                <span v-if="msg.metrics.rewind !== undefined" class="px-2 py-0.5 rounded-md text-[10px] font-black bg-zinc-900 text-white border border-zinc-800">
                  Rewind: {{ msg.metrics.rewind }}
                </span>
              </div>

              <!-- Optional Mini Data Table -->
              <div v-if="msg.tableData && msg.tableData.length > 0" class="mt-2 border border-zinc-200 rounded-xl overflow-hidden bg-white">
                <div class="p-1.5 bg-zinc-900 border-b border-zinc-800 text-[10px] font-black text-white flex items-center justify-between font-mono">
                  <span>{{ msg.tableTitle || 'Daftar Roll Terkait' }}</span>
                  <span class="text-zinc-400 font-normal">({{ msg.tableData.length }} roll)</span>
                </div>
                <div class="max-h-36 overflow-y-auto">
                  <table class="w-full text-left text-[10px] font-mono divide-y divide-zinc-200">
                    <thead class="bg-zinc-100 text-zinc-700 font-bold sticky top-0">
                      <tr>
                        <th class="py-1 px-1.5">No. Lot</th>
                        <th class="py-1 px-1.5 text-center">Status</th>
                        <th class="py-1 px-1.5">Defect / Ket</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-zinc-100 bg-white">
                      <tr v-for="(r, rIdx) in msg.tableData" :key="rIdx" class="hover:bg-red-50/50">
                        <td class="py-1 px-1.5 font-bold text-zinc-900 truncate max-w-[110px]">{{ r.lot || r.kodeFg }}</td>
                        <td class="py-1 px-1.5 text-center">
                          <span
                            class="px-1 py-0.2 rounded text-[9px] font-black"
                            :class="
                              (r.qualityStatus || r.status) === 'REJECT' ? 'bg-red-100 text-red-800' :
                              (r.qualityStatus || r.status) === 'HOLD' ? 'bg-amber-100 text-amber-800' :
                              'bg-emerald-100 text-emerald-800'
                            "
                          >
                            {{ r.qualityStatus || r.status || 'PASS' }}
                          </span>
                        </td>
                        <td class="py-1 px-1.5 text-zinc-600 truncate max-w-[130px]">{{ r.reasonDefect || r.reasonOfDefect || r.keterangan || '—' }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <!-- Typing Indicator -->
          <div v-if="isThinking" class="flex items-center gap-2 p-3 bg-zinc-900 rounded-2xl border border-red-900/60 w-fit text-xs text-zinc-300 animate-pulse">
            <span class="w-2 h-2 rounded-full bg-red-500 heartbeat-dot"></span>
            <span>Menganalisis 30.000+ data roll & formula...</span>
          </div>
        </div>

        <!-- ───────────────────────────────────────────────────────────────── -->
        <!-- 2C. CHAT INPUT BAR & DRAGGABLE FOOTER (BISA DIGESER)              -->
        <!-- ───────────────────────────────────────────────────────────────── -->
        <div 
          @mousedown="startModalDrag"
          @touchstart="startModalDragTouch"
          class="p-3 bg-black border-t border-red-900/60 cursor-grab active:cursor-grabbing select-none relative"
        >
          <form @submit.prevent="handleSubmit" class="flex items-center gap-2 relative z-10">
            <div class="relative flex-1">
              <input
                v-model="inputQuery"
                ref="inputFieldRef"
                placeholder="Tanyakan data roll, alasan defect, operator, mesin..."
                class="w-full pl-3.5 pr-8 py-2 text-xs border border-zinc-700 bg-zinc-900 focus:bg-zinc-950 rounded-xl focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all placeholder:text-zinc-500 font-medium text-white"
              />
              <button
                v-if="inputQuery"
                type="button"
                @click="inputQuery = ''"
                class="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <button
              type="submit"
              :disabled="!inputQuery.trim() || isThinking"
              class="p-2 px-3.5 bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 shadow-md shadow-red-600/30 active:scale-95"
              title="Kirim Pesan (Enter)"
            >
              <span>Kirim</span>
              <svg class="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
              </svg>
            </button>
          </form>

          <!-- Dedicated Drag Handle Grip Zone in Footer -->
          <div class="flex items-center justify-between text-[9.5px] text-zinc-400 pt-2 px-1 font-mono select-none">
            <div class="flex items-center gap-1.5 text-zinc-400">
              <span class="w-1.5 h-1.5 rounded-full bg-red-500 heartbeat-dot"></span>
              <span>SWC AI Engine v2.0</span>
            </div>

            <!-- Visual Drag Handle Indicator -->
            <div class="flex items-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity">
              <div class="w-1 h-1 rounded-full bg-red-500"></div>
              <div class="w-10 h-1 rounded-full bg-zinc-700"></div>
              <div class="w-1 h-1 rounded-full bg-white"></div>
              <span class="text-[9px] text-zinc-400 ml-1">⋮⋮ Geser Modal</span>
            </div>

            <span class="text-zinc-500">Enter ➔ Kirim</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick } from 'vue';
import { useDataRollStore } from '@/stores/dataRollStore';
import { useLabelStore } from '@/stores/labelStore';
import { useConfigStore } from '@/stores/configStore';
import { db } from '@/db';
import { processAiQueryAsync } from '@/services/aiQueryService';

const dataRollStore = useDataRollStore();
const labelStore = useLabelStore();
const configStore = useConfigStore();

// Window State
const isOpen = ref(false);
const isHistoryOpen = ref(false);
const isTemporarilyHidden = ref(false);
const isThinking = ref(false);
const copiedIdx = ref(null);
const inputQuery = ref('');
const inputFieldRef = ref(null);
const chatContainerRef = ref(null);

// Floating Bubble Position (Minimalist Button)
const bubblePos = reactive({
  x: typeof window !== 'undefined' ? Math.max(20, window.innerWidth - 76) : 300,
  y: typeof window !== 'undefined' ? Math.max(20, window.innerHeight - 76) : 500
});

// Modal Window Position (Draggable anywhere on screen, clamped safe from viewport top)
const modalPos = reactive({
  x: 0,
  y: 0
});

const isMobileScreen = computed(() => {
  return typeof window !== 'undefined' && window.innerWidth < 640;
});

const initModalPosition = () => {
  if (typeof window === 'undefined') return;
  const modalWidth = Math.min(480, window.innerWidth - 32);
  const modalHeight = Math.min(620, window.innerHeight - 40);

  if (modalPos.x <= 0 || modalPos.x > window.innerWidth - 100 || modalPos.y < 16 || modalPos.y > window.innerHeight - 100) {
    modalPos.x = Math.max(16, window.innerWidth - modalWidth - 24);
    modalPos.y = Math.max(20, window.innerHeight - modalHeight - 24);
  } else {
    // Strictly clamp y >= 16 so the top minimize/close buttons are ALWAYS visible!
    modalPos.y = Math.max(16, Math.min(window.innerHeight - 80, modalPos.y));
    modalPos.x = Math.max(12, Math.min(window.innerWidth - modalWidth - 12, modalPos.x));
  }
};

const windowStyle = computed(() => {
  if (isMobileScreen.value) {
    return {
      left: '4vw',
      top: '4vh',
      width: '92vw',
      height: '92vh'
    };
  }
  return {
    left: `${modalPos.x}px`,
    top: `${modalPos.y}px`
  };
});

// Storage Key for persistent conversations
const STORAGE_KEY = 'swc_ai_copilot_conversations_v1';
const conversations = ref([]);
const currentSessionId = ref(null);

const defaultChips = [
  '⚠️ Alasan defect apa yang paling sering terjadi?',
  '📊 Berapa yield rate dan persentase kelulusan PASS?',
  '🔴 Rekap total roll REJECT dan afval',
  '🏭 Bandingkan output mesin Slitting vs Rewind',
  '👷 Siapa operator dengan output terbanyak?'
];

// Current Conversation Messages
const currentMessages = computed(() => {
  const session = conversations.value.find(s => s.id === currentSessionId.value);
  return session ? session.messages : [];
});

const toggleOpen = () => {
  isOpen.value = !isOpen.value;
  if (isOpen.value) {
    initModalPosition();
    if (!currentSessionId.value || conversations.value.length === 0) {
      createNewConversation();
    }
    nextTick(() => {
      inputFieldRef.value?.focus();
      scrollToBottom();
    });
  }
};

const minimizeModal = () => {
  isOpen.value = false;
};

const closeModal = () => {
  isOpen.value = false;
};

// ─── 1. BUBBLE DRAG LOGIC ─────────────────────────────────────────────
let isBubbleDragging = false;
let bubbleStartX = 0;
let bubbleStartY = 0;
let bubbleInitialX = 0;
let bubbleInitialY = 0;
let bubbleDragDist = 0;

const startBubbleDrag = (e) => {
  isBubbleDragging = true;
  bubbleDragDist = 0;
  bubbleStartX = e.clientX;
  bubbleStartY = e.clientY;
  bubbleInitialX = bubblePos.x;
  bubbleInitialY = bubblePos.y;
  window.addEventListener('mousemove', onBubbleDrag);
  window.addEventListener('mouseup', stopBubbleDrag);
};

const startBubbleDragTouch = (e) => {
  const touch = e.touches[0];
  isBubbleDragging = true;
  bubbleDragDist = 0;
  bubbleStartX = touch.clientX;
  bubbleStartY = touch.clientY;
  bubbleInitialX = bubblePos.x;
  bubbleInitialY = bubblePos.y;
  window.addEventListener('touchmove', onBubbleDragTouch);
  window.addEventListener('touchend', stopBubbleDragTouch);
};

const onBubbleDrag = (e) => {
  if (!isBubbleDragging) return;
  const dx = e.clientX - bubbleStartX;
  const dy = e.clientY - bubbleStartY;
  bubbleDragDist = Math.hypot(dx, dy);
  bubblePos.x = Math.max(10, Math.min(window.innerWidth - 60, bubbleInitialX + dx));
  bubblePos.y = Math.max(10, Math.min(window.innerHeight - 60, bubbleInitialY + dy));
};

const onBubbleDragTouch = (e) => {
  if (!isBubbleDragging) return;
  const touch = e.touches[0];
  const dx = touch.clientX - bubbleStartX;
  const dy = touch.clientY - bubbleStartY;
  bubbleDragDist = Math.hypot(dx, dy);
  bubblePos.x = Math.max(10, Math.min(window.innerWidth - 60, bubbleInitialX + dx));
  bubblePos.y = Math.max(10, Math.min(window.innerHeight - 60, bubbleInitialY + dy));
};

const stopBubbleDrag = () => {
  isBubbleDragging = false;
  window.removeEventListener('mousemove', onBubbleDrag);
  window.removeEventListener('mouseup', stopBubbleDrag);
};

const stopBubbleDragTouch = () => {
  isBubbleDragging = false;
  window.removeEventListener('touchmove', onBubbleDragTouch);
  window.removeEventListener('touchend', stopBubbleDragTouch);
};

const handleBubbleClick = () => {
  if (bubbleDragDist > 5) return; // Abaikan klik jika kursor bergeser (sedang dragging)
  toggleOpen();
};

// ─── 2. MODAL WINDOW DRAG LOGIC (SELURUH MODAL DAPAT DIGESER) ──────────
let isModalDragging = false;
let modalStartX = 0;
let modalStartY = 0;
let modalInitialX = 0;
let modalInitialY = 0;

const startModalDrag = (e) => {
  if (isMobileScreen.value) return;
  if (e.target.closest('button') || e.target.closest('input')) return;
  isModalDragging = true;
  modalStartX = e.clientX;
  modalStartY = e.clientY;
  modalInitialX = modalPos.x;
  modalInitialY = modalPos.y;
  window.addEventListener('mousemove', onModalDrag);
  window.addEventListener('mouseup', stopModalDrag);
};

const startModalDragTouch = (e) => {
  if (isMobileScreen.value) return;
  if (e.target.closest('button') || e.target.closest('input')) return;
  const touch = e.touches[0];
  isModalDragging = true;
  modalStartX = touch.clientX;
  modalStartY = touch.clientY;
  modalInitialX = modalPos.x;
  modalInitialY = modalPos.y;
  window.addEventListener('touchmove', onModalDragTouch);
  window.addEventListener('touchend', stopModalDragTouch);
};

const onModalDrag = (e) => {
  if (!isModalDragging) return;
  const dx = e.clientX - modalStartX;
  const dy = e.clientY - modalStartY;
  const modalWidth = Math.min(480, window.innerWidth - 32);

  // Batasan: Header modal TIDAK BOLEH lebih tinggi dari 16px dari atas layar!
  modalPos.x = Math.max(12, Math.min(window.innerWidth - modalWidth - 12, modalInitialX + dx));
  modalPos.y = Math.max(16, Math.min(window.innerHeight - 80, modalInitialY + dy));
};

const onModalDragTouch = (e) => {
  if (!isModalDragging) return;
  const touch = e.touches[0];
  const dx = touch.clientX - modalStartX;
  const dy = touch.clientY - modalStartY;
  const modalWidth = Math.min(480, window.innerWidth - 32);

  modalPos.x = Math.max(12, Math.min(window.innerWidth - modalWidth - 12, modalInitialX + dx));
  modalPos.y = Math.max(16, Math.min(window.innerHeight - 80, modalInitialY + dy));
};

const stopModalDrag = () => {
  isModalDragging = false;
  window.removeEventListener('mousemove', onModalDrag);
  window.removeEventListener('mouseup', stopModalDrag);
};

const stopModalDragTouch = () => {
  isModalDragging = false;
  window.removeEventListener('touchmove', onModalDragTouch);
  window.removeEventListener('touchend', stopModalDragTouch);
};

// Conversation Management
const loadConversations = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      conversations.value = JSON.parse(raw);
      if (conversations.value.length > 0) {
        currentSessionId.value = conversations.value[0].id;
      }
    }
  } catch (e) {
    console.warn('Gagal memuat riwayat percakapan AI:', e);
  }
};

const saveConversations = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations.value));
  } catch (e) {
    console.warn('Gagal menyimpan riwayat percakapan AI:', e);
  }
};

const createNewConversation = () => {
  const newSession = {
    id: `chat_${Date.now()}`,
    title: 'Percakapan Baru',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    messages: []
  };
  conversations.value.unshift(newSession);
  currentSessionId.value = newSession.id;
  isHistoryOpen.value = false;
  saveConversations();
  nextTick(() => inputFieldRef.value?.focus());
};

const selectConversation = (id) => {
  currentSessionId.value = id;
  isHistoryOpen.value = false;
  nextTick(() => scrollToBottom());
};

const deleteSingleConversation = (id) => {
  if (confirm('Hapus sesi percakapan ini dari riwayat?')) {
    conversations.value = conversations.value.filter(s => s.id !== id);
    if (currentSessionId.value === id) {
      currentSessionId.value = conversations.value[0]?.id || null;
      if (!currentSessionId.value) {
        createNewConversation();
      }
    }
    saveConversations();
  }
};

const clearAllConversations = () => {
  if (confirm('Apakah Anda yakin ingin menghapus SELURUH riwayat percakapan AI? Tindakan ini tidak dapat dibatalkan.')) {
    conversations.value = [];
    createNewConversation();
    saveConversations();
  }
};

const scrollToBottom = () => {
  if (chatContainerRef.value) {
    chatContainerRef.value.scrollTop = chatContainerRef.value.scrollHeight;
  }
};

const sendQuery = (text) => {
  inputQuery.value = text;
  handleSubmit();
};

const handleSubmit = () => {
  const query = inputQuery.value.trim();
  if (!query) return;

  // Find or create session
  let session = conversations.value.find(s => s.id === currentSessionId.value);
  if (!session) {
    createNewConversation();
    session = conversations.value.find(s => s.id === currentSessionId.value);
  }

  // Update session title if first message
  if (session.messages.length === 0) {
    session.title = query.length > 35 ? `${query.slice(0, 35)}...` : query;
  }

  // 1. Add User Message
  session.messages.push({
    sender: 'user',
    text: query,
    timestamp: new Date().toISOString()
  });

  inputQuery.value = '';
  isThinking.value = true;
  nextTick(() => scrollToBottom());

  // 2. Process query via AI Engine
  setTimeout(async () => {
    try {
      let operators = configStore.operatorList || [];
      if (!operators || operators.length === 0) {
        try {
          operators = await db.operator_list.toArray();
        } catch (e) {
          console.warn('Gagal membaca operator dari db:', e);
        }
      }
      const rolls = dataRollStore.rolls;
      const labels = labelStore.labels;
      const response = await processAiQueryAsync(query, rolls, labels, operators, session.messages);

      session.messages.push({
        sender: 'ai',
        text: response.text,
        metrics: response.metrics,
        tableData: response.tableData,
        tableTitle: response.tableTitle,
        suggestions: response.suggestions || [],
        timestamp: new Date().toISOString()
      });

      session.updatedAt = new Date().toISOString();
      saveConversations();
    } catch (err) {
      console.error('Error processing AI Query:', err);
      session.messages.push({
        sender: 'ai',
        text: `⚠️ Maaf, terjadi kendala teknis saat memproses data: *${err.message}*.\nSilakan coba formulasi pertanyaan lain.`,
        suggestions: ['Tampilkan ringkasan data keseluruhan', 'Alasan defect terbanyak'],
        timestamp: new Date().toISOString()
      });
    } finally {
      isThinking.value = false;
      nextTick(() => scrollToBottom());
    }
  }, 150);
};

const copyMessage = (text, idx) => {
  if (!text) return;
  // Strip Markdown symbols for clean plain-text copying
  const plainText = String(text)
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1');

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(plainText).then(() => {
      copiedIdx.value = idx;
      setTimeout(() => {
        if (copiedIdx.value === idx) copiedIdx.value = null;
      }, 2000);
    }).catch(() => {
      fallbackCopyText(plainText, idx);
    });
  } else {
    fallbackCopyText(plainText, idx);
  }
};

const fallbackCopyText = (text, idx) => {
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    copiedIdx.value = idx;
    setTimeout(() => {
      if (copiedIdx.value === idx) copiedIdx.value = null;
    }, 2000);
  } catch (err) {
    console.warn('Gagal menyalin teks:', err);
  }
};

const escapeHtml = (str) => {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

const renderFormattedHtml = (text) => {
  if (!text) return '';
  // 1. First escape all raw HTML characters to prevent XSS injection
  let safeText = escapeHtml(text);

  // 2. Safely transform Markdown tokens into controlled DOM elements
  let html = safeText
    // Convert **bold** to styled strong (Pure high-contrast black)
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-black">$1</strong>')
    // Convert *italic* to styled em
    .replace(/\*(.*?)\*/g, '<em class="italic text-zinc-800">$1</em>')
    // Convert bullet points • or - into styled red badge bullets
    .replace(/^[•\-\*]\s+(.*)$/gm, '<div class="flex items-start gap-2 my-1"><span class="w-1.5 h-1.5 rounded-full bg-red-600 mt-1.5 shrink-0"></span><span class="flex-1 text-zinc-900 font-medium">$1</span></div>')
    // Convert numbered lists e.g. "1. " to styled red numbered badges
    .replace(/^(\d+)\.\s+(.*)$/gm, '<div class="flex items-start gap-2 my-1"><span class="w-4 h-4 rounded-full bg-red-100 text-red-800 text-[9.5px] font-black flex items-center justify-center shrink-0 mt-0.5">$1</span><span class="flex-1 text-zinc-900 font-medium">$2</span></div>')
    // Preserve double newlines
    .replace(/\n\n/g, '<div class="my-2"></div>')
    // Single newlines
    .replace(/\n/g, '<br/>');

  return html;
};

const formatTime = (isoStr) => {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
};

const formatTimestamp = (isoStr) => {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
};

onMounted(() => {
  loadConversations();
  if (typeof window !== 'undefined') {
    bubblePos.x = Math.max(20, window.innerWidth - 76);
    bubblePos.y = Math.max(20, window.innerHeight - 76);
    initModalPosition();
  }
});
</script>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(8px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
.animate-fade-in {
  animation: fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/* HEARTBEAT CIRCUIT ANIMATION (BERKEDIP, REDUP, DETAKAN JANTUNG)             */
/* ═══════════════════════════════════════════════════════════════════════════ */
@keyframes cardiacPulse {
  0% {
    opacity: 0.2;
    filter: drop-shadow(0 0 1px rgba(239, 68, 68, 0.2));
  }
  14% {
    /* Systole Lub: Sharp surge of red electric glow */
    opacity: 1;
    filter: drop-shadow(0 0 10px rgba(239, 68, 68, 0.95)) drop-shadow(0 0 20px rgba(220, 38, 38, 0.7));
  }
  22% {
    /* Brief diastole dip */
    opacity: 0.35;
    filter: drop-shadow(0 0 2px rgba(239, 68, 68, 0.3));
  }
  30% {
    /* Systole Dub: Second rhythmic pulse */
    opacity: 0.95;
    filter: drop-shadow(0 0 8px rgba(239, 68, 68, 0.9)) drop-shadow(0 0 14px rgba(255, 255, 255, 0.6));
  }
  44% {
    /* Smooth recovery decay */
    opacity: 0.2;
    filter: drop-shadow(0 0 1px rgba(239, 68, 68, 0.2));
  }
  100% {
    /* Resting calm */
    opacity: 0.2;
    filter: drop-shadow(0 0 1px rgba(239, 68, 68, 0.2));
  }
}

.circuit-heartbeat-bg {
  animation: cardiacPulse 2.3s cubic-bezier(0.25, 1, 0.5, 1) infinite;
}

.heartbeat-dot {
  animation: cardiacPulse 2.3s cubic-bezier(0.25, 1, 0.5, 1) infinite;
}

@keyframes cardiacBorder {
  0% {
    border-color: rgba(220, 38, 38, 0.4);
    box-shadow: 0 0 0 rgba(239, 68, 68, 0);
  }
  14% {
    border-color: rgba(239, 68, 68, 1);
    box-shadow: 0 0 16px rgba(239, 68, 68, 0.6), 0 0 4px rgba(255, 255, 255, 0.5);
  }
  22% {
    border-color: rgba(220, 38, 38, 0.4);
    box-shadow: 0 0 2px rgba(239, 68, 68, 0.2);
  }
  30% {
    border-color: rgba(255, 255, 255, 0.9);
    box-shadow: 0 0 12px rgba(239, 68, 68, 0.5);
  }
  44% {
    border-color: rgba(220, 38, 38, 0.35);
    box-shadow: 0 0 0 rgba(239, 68, 68, 0);
  }
  100% {
    border-color: rgba(220, 38, 38, 0.35);
    box-shadow: 0 0 0 rgba(239, 68, 68, 0);
  }
}

.heartbeat-border {
  animation: cardiacBorder 2.3s cubic-bezier(0.25, 1, 0.5, 1) infinite;
}
</style>
