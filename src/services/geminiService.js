import { getSetting, saveSetting, deleteSetting } from '@/db';
import { supabase } from '@/services/supabaseClient';

export function cleanModelId(modelId) {
  if (!modelId) return '';
  return String(modelId).trim().replace(/^models\//, '');
}

export function isObsoleteModel(modelId) {
  if (!modelId) return true;
  const m = cleanModelId(modelId).toLowerCase();
  // Hanya filter model eksperimental lawas yang terbukti 404 (sudah dinonaktifkan Google secara permanen)
  return m === 'gemini-2.0-pro-exp-02-05' || m === 'gemini-1.0-pro' || m === 'gemini-pro-vision';
}

export const DEFAULT_AI_MODELS = [
  { id: 'gemini-2.0-flash', displayName: 'Gemini 2.0 Flash (Rekomendasi Utama)', description: 'Model multimodal generasi 2.0 — performa ultra cepat, akurasi visual tinggi, dan stabil.' },
  { id: 'gemini-2.0-flash-lite', displayName: 'Gemini 2.0 Flash Lite', description: 'Model generasi 2.0 hemat kuota, efisien, dan responsif.' },
  { id: 'gemini-1.5-flash', displayName: 'Gemini 1.5 Flash (Super Stabil)', description: 'Model multimodal standar Google yang sangat stabil untuk pembacaan dokumen dan tabel industri.' },
  { id: 'gemini-1.5-pro', displayName: 'Gemini 1.5 Pro', description: 'Model penalaran analitik mendalam untuk dokumen industri kompleks.' }
];

export const DEFAULT_FALLBACK_MODELS = [
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  'gemini-1.5-flash',
  'gemini-1.5-pro'
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

  // Bersihkan model obsolete (seperti model eksperimental yang sudah ditutup) atau cooldown kadaluwarsa secara otomatis
  let hasExpired = false;
  if (registry.winner && isObsoleteModel(registry.winner)) {
    registry.winner = 'gemini-2.0-flash';
    hasExpired = true;
  }
  for (const [model, info] of Object.entries(registry.cooldowns)) {
    if (isObsoleteModel(model) || (info && info.until && now >= info.until)) {
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
  let cloudApiKey = null;
  let cloudSelectedModel = null;
  let cloudFallbacks = null;
  let cloudAvailable = null;

  // 1. Ambil langsung dari Supabase Cloud Database (lintas device & user)
  try {
    if (supabase && typeof navigator !== 'undefined' && navigator.onLine) {
      const { data, error } = await supabase
        .from('settings')
        .select('key, value')
        .in('key', [
          'google_ai_model',
          'gemini_model',
          'google_ai_fallback_models',
          'google_ai_available_models',
          'google_ai_api_key',
          'gemini_api_key'
        ]);

      if (!error && Array.isArray(data)) {
        for (const row of data) {
          if ((row.key === 'google_ai_model' || row.key === 'gemini_model') && row.value) {
            cloudSelectedModel = typeof row.value === 'string' ? row.value.replace(/['"]/g, '') : row.value;
          }
          if (row.key === 'google_ai_fallback_models' && row.value) {
            cloudFallbacks = typeof row.value === 'string' ? JSON.parse(row.value) : row.value;
          }
          if (row.key === 'google_ai_available_models' && row.value) {
            cloudAvailable = typeof row.value === 'string' ? JSON.parse(row.value) : row.value;
          }
          if ((row.key === 'google_ai_api_key' || row.key === 'gemini_api_key') && row.value) {
            cloudApiKey = typeof row.value === 'string' ? row.value.replace(/['"]/g, '') : row.value;
          }
        }
      }
    }
  } catch (e) {
    console.warn('[SmartAI] Cloud settings fetch notice:', e);
  }

  // 2. Fallback ke IndexedDB lokal jika offline atau cloud kosong
  const localApiKey = (await getSetting('google_ai_api_key', '')) || (await getSetting('gemini_api_key', ''));
  const localModel = (await getSetting('google_ai_model', '')) || (await getSetting('gemini_model', 'gemini-2.0-flash'));
  const localFallbacks = await getSetting('google_ai_fallback_models', null);
  const localAvailable = await getSetting('google_ai_available_models', null);

  const apiKey = (cloudApiKey || localApiKey || '').trim();
  let selectedModel = cloudSelectedModel || localModel || 'gemini-2.0-flash';
  // Filter out any obsolete models (seperti model eksperimental yang sudah kadaluwarsa)
  if (isObsoleteModel(selectedModel)) {
    selectedModel = 'gemini-2.0-flash';
  }

  const rawFallbacks = cloudFallbacks || localFallbacks;
  let fallbackModels = Array.isArray(rawFallbacks) ? rawFallbacks : [...DEFAULT_FALLBACK_MODELS];
  fallbackModels = fallbackModels.filter(m => m && !isObsoleteModel(m));
  if (fallbackModels.length === 0) {
    fallbackModels = [...DEFAULT_FALLBACK_MODELS];
  }

  const rawAvailable = cloudAvailable || localAvailable;
  let availableModels = (Array.isArray(rawAvailable) && rawAvailable.length > 0) ? rawAvailable : [...DEFAULT_AI_MODELS];
  availableModels = availableModels.filter(m => m && m.id && !isObsoleteModel(m.id));
  if (availableModels.length === 0) {
    availableModels = [...DEFAULT_AI_MODELS];
  }

  return {
    apiKey,
    selectedModel,
    fallbackModels: fallbackModels.slice(0, 5),
    availableModels
  };
}

/**
 * Menyimpan konfigurasi AI ke lokal dan langsung sinkron ke Cloud Supabase
 */
export async function saveAiConfig({ apiKey, selectedModel, fallbackModels, availableModels }) {
  const cleanKey = (apiKey || '').trim();
  let cleanModel = (selectedModel || '').trim() || 'gemini-2.0-flash';
  if (isObsoleteModel(cleanModel)) cleanModel = 'gemini-2.0-flash';
  const cleanFallbacks = (Array.isArray(fallbackModels) ? fallbackModels : [])
    .filter(m => m && !isObsoleteModel(m))
    .slice(0, 5);

  const cleanAvailable = (Array.isArray(availableModels) && availableModels.length > 0)
    ? availableModels.filter(m => m && m.id && !isObsoleteModel(m.id))
    : [...DEFAULT_AI_MODELS];

  // 1. Simpan ke IndexedDB lokal
  await saveSetting('google_ai_api_key', cleanKey);
  await saveSetting('gemini_api_key', cleanKey);
  await saveSetting('google_ai_model', cleanModel);
  await saveSetting('gemini_model', cleanModel);
  await saveSetting('google_ai_fallback_models', cleanFallbacks);
  await saveSetting('google_ai_available_models', cleanAvailable);

  // 2. Simpan langsung ke Supabase Cloud (Background sync)
  try {
    if (supabase && typeof navigator !== 'undefined' && navigator.onLine) {
      const nowIso = new Date().toISOString();
      const rowsToUpsert = [
        { key: 'google_ai_model', value: cleanModel, updated_at: nowIso },
        { key: 'gemini_model', value: cleanModel, updated_at: nowIso },
        { key: 'google_ai_fallback_models', value: JSON.stringify(cleanFallbacks), updated_at: nowIso },
        { key: 'google_ai_available_models', value: JSON.stringify(cleanAvailable), updated_at: nowIso }
      ];
      if (cleanKey) {
        rowsToUpsert.push({ key: 'google_ai_api_key', value: cleanKey, updated_at: nowIso });
        rowsToUpsert.push({ key: 'gemini_api_key', value: cleanKey, updated_at: nowIso });
      }
      supabase.from('settings').upsert(rowsToUpsert, { onConflict: 'key' }).then(({ error }) => {
        if (error) console.warn('[SmartAI] Cloud upsert notice:', error.message);
      }).catch(err => console.warn('[SmartAI] Push error:', err));
    }
  } catch (e) {
    console.warn('[SmartAI] Cloud save notice:', e);
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

  try {
    if (supabase && typeof navigator !== 'undefined' && navigator.onLine) {
      supabase.from('settings').delete().in('key', [
        'google_ai_api_key', 'gemini_api_key', 'google_ai_model', 'gemini_model', 'google_ai_fallback_models'
      ]).catch(() => {});
    }
  } catch (e) {}

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('sync:ai-config-updated', {
      detail: { apiKey: '', selectedModel: 'gemini-2.0-flash', fallbackModels: [] }
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
  const rawList = [
    config.selectedModel,
    ...(Array.isArray(config.fallbackModels) ? config.fallbackModels : []),
    ...(Array.isArray(config.availableModels) ? config.availableModels.map(a => a.id || a) : []),
    'gemini-2.0-flash',
    'gemini-2.0-flash-lite',
    'gemini-1.5-flash',
    'gemini-1.5-pro'
  ];
  const configuredCandidates = rawList
    .map(m => cleanModelId(m))
    .filter((m, idx, arr) => m && m !== '__custom__' && !isObsoleteModel(m) && arr.indexOf(m) === idx);

  if (configuredCandidates.length === 0) return ['gemini-2.0-flash'];

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

  const cleanModel = cleanModelId(modelId);
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
