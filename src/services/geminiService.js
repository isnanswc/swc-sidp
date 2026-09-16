import { getSetting, saveSetting, deleteSetting } from '@/db';
import { supabase } from '@/services/supabaseClient';

export const DEFAULT_AI_MODELS = [
  { id: 'gemini-2.5-flash', displayName: 'Gemini 2.5 Flash (Rekomendasi)', description: 'Model generasi 2.5 Flash — cepat, akurat, dan stabil.' },
  { id: 'gemini-2.5-pro', displayName: 'Gemini 2.5 Pro', description: 'Model penalaran tinggi untuk analisis dokumen kompleks.' },
  { id: 'gemini-2.0-flash', displayName: 'Gemini 2.0 Flash', description: 'Generasi 2.0 Flash berkecepatan tinggi.' },
  { id: 'gemini-1.5-flash', displayName: 'Gemini 1.5 Flash', description: 'Model cepat hemat kuota generasi 1.5.' },
  { id: 'gemini-1.5-pro', displayName: 'Gemini 1.5 Pro', description: 'Model presisi tinggi generasi 1.5.' },
  { id: 'gemini-3.5-flash', displayName: 'Gemini 3.5 Flash', description: 'Model generasi 3.5 eksperimental.' }
];

export const DEFAULT_FALLBACK_MODELS = [
  'gemini-2.0-flash',
  'gemini-1.5-flash'
];

export const HEALTH_REGISTRY_KEY = 'google_ai_health_registry';

// In-memory cache to eliminate repetitive DB queries within short bursts
let memoryHealthRegistry = null;
let lastHealthFetchTime = 0;
const HEALTH_CACHE_TTL_MS = 15000; // 15 detik TTL

/**
 * Mengambil status kesehatan model & sticky winner dari Cloud Supabase (dengan IndexedDB fallback)
 * Format data:
 * {
 *   winner: string | null,
 *   winnerUpdatedAt: string,
 *   cooldowns: { [modelId]: { until: number, reason: string, status: number, reportedAt: string } }
 * }
 */
export async function getAiHealthRegistry(forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && memoryHealthRegistry && (now - lastHealthFetchTime < HEALTH_CACHE_TTL_MS)) {
    return memoryHealthRegistry;
  }

  let registry = null;

  // 1. Ambil langsung dari Supabase Cloud Database (lintas device & akun)
  try {
    if (supabase && typeof navigator !== 'undefined' && navigator.onLine) {
      const { data, error } = await supabase
        .from('settings')
        .select('value')
        .eq('key', HEALTH_REGISTRY_KEY)
        .maybeSingle();

      if (!error && data && data.value) {
        registry = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
      }
    }
  } catch (e) {
    console.warn('[GeminiHealth] Cloud fetch notice:', e);
  }

  // 2. Jika offline atau gagal fetch cloud, baca dari IndexedDB lokal
  if (!registry) {
    try {
      const local = await getSetting(HEALTH_REGISTRY_KEY, null);
      if (local) {
        registry = typeof local === 'string' ? JSON.parse(local) : local;
      }
    } catch (e) {
      console.warn('[GeminiHealth] Local fetch notice:', e);
    }
  }

  if (!registry || typeof registry !== 'object') {
    registry = { winner: null, cooldowns: {}, winnerUpdatedAt: null };
  }
  if (!registry.cooldowns) registry.cooldowns = {};

  // Bersihkan cooldown yang sudah kedaluwarsa secara otomatis
  let hasExpired = false;
  for (const [model, info] of Object.entries(registry.cooldowns)) {
    if (info && info.until && now >= info.until) {
      delete registry.cooldowns[model];
      hasExpired = true;
    }
  }

  memoryHealthRegistry = registry;
  lastHealthFetchTime = now;

  if (hasExpired) {
    saveAiHealthRegistry(registry).catch(() => {});
  }

  return registry;
}

/**
 * Menyimpan status kesehatan model & sticky winner ke Cloud Database (Supabase)
 */
export async function saveAiHealthRegistry(registry) {
  if (!registry) return;
  memoryHealthRegistry = registry;
  lastHealthFetchTime = Date.now();

  const nowIso = new Date().toISOString();
  const payload = {
    key: HEALTH_REGISTRY_KEY,
    value: JSON.stringify(registry),
    updated_at: nowIso
  };

  // 1. Simpan ke local Dexie & localStorage
  await saveSetting(HEALTH_REGISTRY_KEY, registry);

  // 2. Simpan langsung ke Supabase Cloud (Background sync)
  try {
    if (supabase && typeof navigator !== 'undefined' && navigator.onLine) {
      supabase.from('settings').upsert([payload], { onConflict: 'key' }).then(({ error }) => {
        if (error) console.warn('[GeminiHealth] Cloud upsert notice:', error.message);
      }).catch(err => console.warn('[GeminiHealth] Push error:', err));
    }
  } catch (e) {
    console.warn('[GeminiHealth] Cloud save notice:', e);
  }

  // Broadcast event agar UI dan tab lain terupdate seketika
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('sync:ai-health-updated', { detail: registry }));
  }
}

/**
 * Mencatat model yang BERHASIL (Sticky Winner) dan menyimpannya ke Cloud Database
 */
export async function recordModelSuccess(modelId) {
  if (!modelId || modelId === '__custom__') return;
  try {
    const registry = await getAiHealthRegistry();
    let changed = false;

    if (registry.winner !== modelId) {
      registry.winner = modelId;
      registry.winnerUpdatedAt = new Date().toISOString();
      changed = true;
    }

    if (registry.cooldowns && registry.cooldowns[modelId]) {
      delete registry.cooldowns[modelId];
      changed = true;
    }

    if (changed) {
      await saveAiHealthRegistry(registry);
      console.log(`[SmartAI] 🏆 Model "${modelId}" berhasil merespon. Dipromosikan sebagai Sticky Winner di Cloud Database.`);
    }
  } catch (e) {
    console.warn('[SmartAI] Error recording model success:', e);
  }
}

/**
 * Mencatat model yang GAGAL / LIMIT (Circuit Breaker Cooldown) dan menyimpannya ke Cloud Database
 */
export async function recordModelFailure(modelId, reason = 'Error', status = null) {
  if (!modelId || modelId === '__custom__') return;
  try {
    const registry = await getAiHealthRegistry();
    const now = Date.now();

    // Tentukan durasi penalti cooldown:
    // HTTP 429 (Rate Limit / Too Many Requests): 5 menit
    // HTTP 503/500 (Overloaded): 3 menit
    // Timeout (AbortError / hanging): 3 menit
    // HTTP 404: 15 menit
    let cooldownDurationMs = 3 * 60 * 1000;
    if (status === 429) {
      cooldownDurationMs = 5 * 60 * 1000;
    } else if (status === 404) {
      cooldownDurationMs = 15 * 60 * 1000;
    }

    const until = now + cooldownDurationMs;

    registry.cooldowns[modelId] = {
      until,
      reason: String(reason || 'Rate limit / Error'),
      status,
      failedAt: new Date().toISOString()
    };

    // Jika model yang terkena limit ini tadinya adalah winner, copot status winner-nya
    if (registry.winner === modelId) {
      registry.winner = null;
    }

    await saveAiHealthRegistry(registry);
    console.warn(`[SmartAI] ⚠️ Model "${modelId}" terkena limit/gagal (${status || ''} - ${reason}). Diberi Cooldown selama ${(cooldownDurationMs / 60000)} menit di Cloud Database.`);
  } catch (e) {
    console.warn('[SmartAI] Error recording model failure:', e);
  }
}

/**
 * Mendapatkan konfigurasi AI lengkap dari IndexedDB / LocalStorage / Cloud
 */
export async function getAiConfig() {
  const apiKey = (await getSetting('google_ai_api_key', '')) || (await getSetting('gemini_api_key', ''));
  const selectedModel = (await getSetting('google_ai_model', '')) || (await getSetting('gemini_model', 'gemini-2.5-flash'));
  const rawFallbacks = await getSetting('google_ai_fallback_models', null);
  const fallbackModels = Array.isArray(rawFallbacks) ? rawFallbacks : [...DEFAULT_FALLBACK_MODELS];
  const rawAvailable = await getSetting('google_ai_available_models', null);
  const availableModels = (Array.isArray(rawAvailable) && rawAvailable.length > 0) ? rawAvailable : [...DEFAULT_AI_MODELS];

  return {
    apiKey: (apiKey || '').trim(),
    selectedModel: selectedModel || 'gemini-2.5-flash',
    fallbackModels: fallbackModels.slice(0, 5),
    availableModels
  };
}

/**
 * Menyimpan konfigurasi AI ke lokal dan langsung sinkron ke Cloud Supabase
 */
export async function saveAiConfig({ apiKey, selectedModel, fallbackModels, availableModels }) {
  const cleanKey = (apiKey || '').trim();
  const cleanModel = (selectedModel || '').trim() || 'gemini-2.5-flash';
  const cleanFallbacks = (Array.isArray(fallbackModels) ? fallbackModels : []).filter(Boolean).slice(0, 5);

  await saveSetting('google_ai_api_key', cleanKey);
  await saveSetting('gemini_api_key', cleanKey);
  await saveSetting('google_ai_model', cleanModel);
  await saveSetting('gemini_model', cleanModel);
  await saveSetting('google_ai_fallback_models', cleanFallbacks);

  if (Array.isArray(availableModels) && availableModels.length > 0) {
    await saveSetting('google_ai_available_models', availableModels);
  }

  // Kirim event agar komponen UI (seperti Copilot Chat & Settings) langsung reaktif
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('sync:ai-config-updated', {
      detail: { apiKey: cleanKey, selectedModel: cleanModel, fallbackModels: cleanFallbacks }
    }));
  }

  return true;
}

/**
 * Menghapus/reset konfigurasi AI dari lokal dan Cloud Supabase
 */
export async function deleteAiConfig() {
  await deleteSetting('google_ai_api_key');
  await deleteSetting('gemini_api_key');
  await deleteSetting('google_ai_model');
  await deleteSetting('gemini_model');
  await deleteSetting('google_ai_fallback_models');

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('sync:ai-config-updated', {
      detail: { apiKey: '', selectedModel: 'gemini-2.5-flash', fallbackModels: [] }
    }));
  }

  return true;
}

/**
 * Mengambil daftar prioritas model dinamis (Auto Rearrange & Sticky Winner dari Cloud Database)
 * 1. Model pemenang terakhir (Sticky Winner di Cloud) diprioritaskan di indeks #0
 * 2. Model sehat lainnya mengikuti
 * 3. Model yang sedang dalam masa Cooldown (Rate Limit) digeser ke paling belakang
 */
export async function getAiModelCandidates() {
  const config = await getAiConfig();
  const configuredCandidates = [config.selectedModel, ...(config.fallbackModels || [])]
    .filter((m, idx, arr) => m && m !== '__custom__' && arr.indexOf(m) === idx);

  if (configuredCandidates.length === 0) return [];

  try {
    const health = await getAiHealthRegistry();
    const now = Date.now();
    const cooldowns = health.cooldowns || {};
    const winner = health.winner;

    const healthy = [];
    const cooling = [];

    for (const model of configuredCandidates) {
      const cd = cooldowns[model];
      if (cd && cd.until && now < cd.until) {
        cooling.push(model);
      } else {
        healthy.push(model);
      }
    }

    // Jika ada Sticky Winner yang sehat di Cloud, tempatkan paling pertama!
    if (winner && healthy.includes(winner)) {
      const restHealthy = healthy.filter(m => m !== winner);
      return [winner, ...restHealthy, ...cooling];
    }

    return [...healthy, ...cooling];
  } catch (e) {
    console.warn('[SmartAI] Error rearranging candidates:', e);
    return configuredCandidates;
  }
}

/**
 * Menguji koneksi dan respon model tertentu (Ping Test)
 */
export async function testGeminiModel(modelId, customApiKey = null) {
  const targetKey = customApiKey || (await getSetting('google_ai_api_key', '')) || (await getSetting('gemini_api_key', ''));
  if (!targetKey || !targetKey.trim()) {
    return {
      success: false,
      latencyMs: 0,
      message: 'API Key belum diisi'
    };
  }

  const cleanModel = (modelId || '').trim();
  if (!cleanModel || cleanModel === '__custom__') {
    return {
      success: false,
      latencyMs: 0,
      message: 'Model belum ditentukan'
    };
  }

  const startTime = Date.now();
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${cleanModel}:generateContent`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': targetKey.trim()
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: 'Ping test. Reply only with OK.' }] }]
      })
    });

    const latencyMs = Date.now() - startTime;

    if (res.ok) {
      const resJson = await res.json();
      const reply = resJson.candidates?.[0]?.content?.parts?.[0]?.text || 'OK';
      return {
        success: true,
        latencyMs,
        reply: reply.trim(),
        message: `✓ Aktif (${latencyMs} ms)`
      };
    } else {
      const errData = await res.json().catch(() => null);
      const errMsg = errData?.error?.message || `HTTP ${res.status}`;
      return {
        success: false,
        latencyMs,
        message: `✕ Gagal (${errMsg})`
      };
    }
  } catch (err) {
    const latencyMs = Date.now() - startTime;
    return {
      success: false,
      latencyMs,
      message: `✕ Gagal koneksi (${err.message || 'Network error'})`
    };
  }
}
