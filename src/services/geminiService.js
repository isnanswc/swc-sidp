import { getSetting, saveSetting, deleteSetting } from '@/db';

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
 * Mengambil daftar prioritas model: [modelUtama, ...fallbackModels (maks 5)]
 */
export async function getAiModelCandidates() {
  const config = await getAiConfig();
  const candidates = [config.selectedModel, ...(config.fallbackModels || [])];
  
  // Saring agar unik, tidak kosong, dan bukan placeholder '__custom__'
  return candidates.filter((m, idx, arr) => m && m !== '__custom__' && arr.indexOf(m) === idx);
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
