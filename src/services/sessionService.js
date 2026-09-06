/**
 * sessionService.js
 * Layanan pelacakan sesi perangkat multi-device dan remote logout untuk M-Label.
 * 
 * Mekanisme:
 * 1. Setiap login menghasilkan sessionId unik & mendeteksi platform (Browser, OS, Device Type).
 * 2. Menyimpan & menyinkronkan daftar sesi aktif di Supabase tabel 'settings' (key: 'active_device_sessions').
 * 3. Menjalankan heartbeat berkala untuk memperbarui lastActiveAt.
 * 4. Mendengarkan broadcast event realtime / polling untuk remote logout.
 * 5. Super Admin dapat melihat sesi aktif semua user atau per user dan melakukan revoke.
 */

import { supabase } from './supabaseClient';
import { db } from '@/db';

const SESSIONS_SETTING_KEY = 'active_device_sessions';
const REVOKED_SETTING_KEY = 'revoked_device_sessions';
const LOCAL_SESSION_KEY = 'mlabel_current_session_id';

let heartbeatTimer = null;
let realtimeChannel = null;
let revocationListeners = [];

/**
 * Deteksi informasi perangkat, OS, dan browser dari User Agent
 */
export function getDeviceInfo() {
  const ua = typeof navigator !== 'undefined' ? (navigator.userAgent || '') : '';
  let os = 'Unknown OS';
  let browser = 'Unknown Browser';
  let deviceType = 'Desktop';

  // Deteksi OS
  if (/windows phone/i.test(ua)) {
    os = 'Windows Phone';
    deviceType = 'Mobile';
  } else if (/win/i.test(ua)) {
    if (/nt 10\.0/i.test(ua)) os = 'Windows 10/11';
    else if (/nt 6\.3/i.test(ua)) os = 'Windows 8.1';
    else if (/nt 6\.2/i.test(ua)) os = 'Windows 8';
    else if (/nt 6\.1/i.test(ua)) os = 'Windows 7';
    else os = 'Windows';
  } else if (/android/i.test(ua)) {
    os = 'Android';
    deviceType = 'Mobile';
  } else if (/iphone|ipad|ipod/i.test(ua)) {
    os = /ipad/i.test(ua) ? 'iPadOS' : 'iOS';
    deviceType = /ipad/i.test(ua) ? 'Tablet' : 'Mobile';
  } else if (/macintosh|mac os x/i.test(ua)) {
    os = 'macOS';
  } else if (/linux/i.test(ua)) {
    os = 'Linux';
  }

  // Deteksi Browser
  if (/edg\//i.test(ua)) {
    const match = ua.match(/edg\/([\d.]+)/i);
    browser = 'Edge ' + (match ? match[1].split('.')[0] : '');
  } else if (/opr\/|opera/i.test(ua)) {
    browser = 'Opera';
  } else if (/chrome|crios/i.test(ua)) {
    const match = ua.match(/(?:chrome|crios)\/([\d.]+)/i);
    browser = 'Chrome ' + (match ? match[1].split('.')[0] : '');
  } else if (/firefox|fxios/i.test(ua)) {
    const match = ua.match(/(?:firefox|fxios)\/([\d.]+)/i);
    browser = 'Firefox ' + (match ? match[1].split('.')[0] : '');
  } else if (/safari/i.test(ua)) {
    browser = 'Safari';
  }

  const screenResolution = typeof window !== 'undefined' && window.screen 
    ? (window.screen.width || 0) + 'x' + (window.screen.height || 0)
    : 'Unknown';

  return {
    os: os.trim(),
    browser: browser.trim(),
    deviceType,
    screenResolution,
    userAgentSummary: browser.trim() + ' on ' + os.trim() + ' (' + deviceType + ')'
  };
}

/**
 * Dapatkan ID Sesi lokal saat ini
 */
export function getCurrentSessionId() {
  if (typeof localStorage === 'undefined') return null;
  return localStorage.getItem(LOCAL_SESSION_KEY) || null;
}

/**
 * Baca seluruh daftar sesi aktif dari Supabase / fallback ke IndexedDB
 */
export async function getAllActiveSessions() {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('value')
      .eq('key', SESSIONS_SETTING_KEY)
      .maybeSingle();

    if (!error && data && data.value) {
      const list = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
      // Filter sesi kadaluarsa (> 7 hari tidak ada aktivitas)
      const now = Date.now();
      const validList = (Array.isArray(list) ? list : []).filter(item => {
        const last = item.lastActiveAt ? new Date(item.lastActiveAt).getTime() : 0;
        return (now - last) < (7 * 24 * 60 * 60 * 1000);
      });
      return validList;
    }
  } catch (err) {
    console.warn('[SessionService] Failed to fetch active sessions from cloud:', err);
  }

  // Fallback ke IndexedDB jika offline
  try {
    if (db.settings) {
      const localRow = await db.settings.get(SESSIONS_SETTING_KEY);
      if (localRow && localRow.value) {
        const parsed = typeof localRow.value === 'string' ? JSON.parse(localRow.value) : localRow.value;
        return Array.isArray(parsed) ? parsed : [];
      }
    }
  } catch (e) {
    console.warn('[SessionService] Local fallback get error:', e);
  }

  return [];
}

/**
 * Simpan daftar sesi aktif ke Supabase & IndexedDB
 */
async function saveAllActiveSessions(sessions) {
  const nowIso = new Date().toISOString();
  const serialized = JSON.stringify(sessions || []);
  try {
    await supabase.from('settings').upsert({
      key: SESSIONS_SETTING_KEY,
      value: serialized,
      updated_at: nowIso
    }, { onConflict: 'key' });
  } catch (err) {
    console.warn('[SessionService] Failed to upsert active sessions to Supabase:', err);
  }

  try {
    if (db.settings) {
      await db.settings.put({
        key: SESSIONS_SETTING_KEY,
        value: serialized,
        updatedAt: nowIso
      });
    }
  } catch (e) {
    console.warn('[SessionService] Failed to cache sessions in Dexie:', e);
  }
}

/**
 * Baca daftar revoked sessions (sesi yang dipaksa logout)
 */
async function getRevokedSessions() {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('value')
      .eq('key', REVOKED_SETTING_KEY)
      .maybeSingle();

    if (!error && data && data.value) {
      const parsed = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
      return Array.isArray(parsed) ? parsed : [];
    }
  } catch (err) {
    // ignore
  }
  return [];
}

/**
 * Catat daftar session yang dicabut
 */
async function addRevokedSession(sessionId, reason = 'LOGOUT_BY_ADMIN') {
  try {
    const existing = await getRevokedSessions();
    const nowIso = new Date().toISOString();
    const updated = [
      ...existing.filter(r => r.sessionId !== sessionId),
      { sessionId, reason, revokedAt: nowIso }
    ].slice(-100);

    await supabase.from('settings').upsert({
      key: REVOKED_SETTING_KEY,
      value: JSON.stringify(updated),
      updated_at: nowIso
    }, { onConflict: 'key' });
  } catch (err) {
    console.warn('[SessionService] Failed to record revoked session:', err);
  }
}

/**
 * Daftarkan sesi perangkat baru saat login
 */
export async function registerDeviceSession(user) {
  if (!user || !user.id) return null;

  const sessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
  const deviceInfo = getDeviceInfo();
  const nowIso = new Date().toISOString();

  const sessionObj = {
    sessionId,
    userId: user.id,
    uuid: user.uuid || null,
    username: user.username,
    name: user.name,
    email: user.email,
    role: user.role,
    deviceInfo,
    loginAt: nowIso,
    lastActiveAt: nowIso
  };

  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(LOCAL_SESSION_KEY, sessionId);
  }

  try {
    const sessions = await getAllActiveSessions();
    const updatedSessions = [...sessions.filter(s => s.sessionId !== sessionId), sessionObj];
    await saveAllActiveSessions(updatedSessions);
  } catch (err) {
    console.warn('[SessionService] Failed to register session in cloud:', err);
  }

  startSessionHeartbeat(sessionId);
  initRealtimeSessionListener();

  return sessionObj;
}

/**
 * Perbarui detak jantung (heartbeat) sesi setiap interval tertentu
 */
export function startSessionHeartbeat(sessionId) {
  if (heartbeatTimer) clearInterval(heartbeatTimer);
  if (!sessionId) sessionId = getCurrentSessionId();
  if (!sessionId) return;

  updateSessionHeartbeat(sessionId);

  // Heartbeat setiap 45 detik
  heartbeatTimer = setInterval(() => {
    updateSessionHeartbeat(sessionId);
  }, 45 * 1000);
}

/**
 * Hentikan heartbeat sesi
 */
export function stopSessionHeartbeat() {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer);
    heartbeatTimer = null;
  }
}

/**
 * Kirim update lastActiveAt ke cloud
 */
export async function updateSessionHeartbeat(sessionId) {
  if (!sessionId) sessionId = getCurrentSessionId();
  if (!sessionId) return;

  const nowIso = new Date().toISOString();

  try {
    // Periksa apakah sesi lokal ini telah dicabut secara eksplisit di cloud
    const revokedList = await getRevokedSessions();
    const isRevoked = revokedList.some(r => r.sessionId === sessionId);
    if (isRevoked) {
      console.warn('[SessionService] Current session has been revoked by Super Admin.');
      triggerRevocationCallbacks('Sesi perangkat Anda telah dihentikan oleh Super Admin.');
      return;
    }

    const sessions = await getAllActiveSessions();
    let currentSession = sessions.find(s => s.sessionId === sessionId);

    if (!currentSession) {
      // Auto-heal: Pulihkan sesi ini jika belum terdaftar di cloud dan belum di-revoke
      const savedUserStr = typeof localStorage !== 'undefined' ? localStorage.getItem('mlabel_session_user') : null;
      if (savedUserStr) {
        try {
          const user = JSON.parse(savedUserStr);
          if (user && user.id) {
            currentSession = {
              sessionId,
              userId: user.id,
              uuid: user.uuid || null,
              username: user.username,
              name: user.name,
              email: user.email,
              role: user.role,
              deviceInfo: getDeviceInfo(),
              loginAt: nowIso,
              lastActiveAt: nowIso
            };
            sessions.push(currentSession);
            await saveAllActiveSessions(sessions);
            return;
          }
        } catch (e) {
          console.warn('[SessionService] Auto-heal session parsing failed:', e);
        }
      }
      return;
    }

    currentSession.lastActiveAt = nowIso;
    await saveAllActiveSessions(sessions);
  } catch (err) {
    // Diamkan bila jaringan terputus
  }
}

/**
 * Hapus sesi perangkat saat logout normal
 */
export async function removeDeviceSession(sessionId = null) {
  stopSessionHeartbeat();
  if (!sessionId) sessionId = getCurrentSessionId();
  if (!sessionId) return;

  try {
    const sessions = await getAllActiveSessions();
    const filtered = sessions.filter(s => s.sessionId !== sessionId);
    await saveAllActiveSessions(filtered);
  } catch (err) {
    console.warn('[SessionService] Failed to remove device session:', err);
  } finally {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(LOCAL_SESSION_KEY);
    }
  }
}

/**
 * Paksa logout satu perangkat tertentu oleh Super Admin
 */
export async function revokeDeviceSession(sessionId, reason = 'Dihentikan oleh Super Admin') {
  if (!sessionId) return false;

  try {
    await addRevokedSession(sessionId, reason);

    const sessions = await getAllActiveSessions();
    const filtered = sessions.filter(s => s.sessionId !== sessionId);
    await saveAllActiveSessions(filtered);

    if (supabase) {
      const channel = supabase.channel('mlabel_session_control');
      await channel.send({
        type: 'broadcast',
        event: 'session_revoked',
        payload: { sessionId, reason, timestamp: Date.now() }
      });
    }

    return true;
  } catch (err) {
    console.error('[SessionService] Error revoking device session:', err);
    throw err;
  }
}

/**
 * Paksa logout semua sesi perangkat milik pengguna tertentu
 */
export async function revokeAllUserSessions(userId, exceptSessionId = null, reason = 'Semua sesi lain dihentikan oleh Super Admin') {
  if (!userId) return false;

  try {
    const sessions = await getAllActiveSessions();
    const userSessions = sessions.filter(s => s.userId === userId && (!exceptSessionId || s.sessionId !== exceptSessionId));

    for (const us of userSessions) {
      await addRevokedSession(us.sessionId, reason);
    }

    const remainingSessions = sessions.filter(s => !userSessions.some(us => us.sessionId === s.sessionId));
    await saveAllActiveSessions(remainingSessions);

    if (supabase) {
      const channel = supabase.channel('mlabel_session_control');
      await channel.send({
        type: 'broadcast',
        event: 'user_sessions_revoked',
        payload: { userId, exceptSessionId, reason, timestamp: Date.now() }
      });
    }

    return true;
  } catch (err) {
    console.error('[SessionService] Error revoking all user sessions:', err);
    throw err;
  }
}

/**
 * Trigger semua callback listener saat sesi ini dicabut
 */
function triggerRevocationCallbacks(reason) {
  revocationListeners.forEach(cb => {
    try {
      cb(reason);
    } catch (e) {
      console.error(e);
    }
  });
}

/**
 * Daftarkan listener saat sesi saat ini dicabut dari jarak jauh
 */
export function onSessionRevoked(callback) {
  if (typeof callback === 'function') {
    revocationListeners.push(callback);
  }
  return () => {
    revocationListeners = revocationListeners.filter(cb => cb !== callback);
  };
}

/**
 * Inisialisasi listener Realtime Supabase untuk menerima instruksi pencabutan sesi secara instan
 */
export function initRealtimeSessionListener() {
  if (realtimeChannel) return;

  const currentSessionId = getCurrentSessionId();
  if (!currentSessionId) return;

  try {
    realtimeChannel = supabase
      .channel('mlabel_session_control')
      .on('broadcast', { event: 'session_revoked' }, payload => {
        const targetSessionId = payload?.payload?.sessionId;
        if (targetSessionId && targetSessionId === getCurrentSessionId()) {
          const reason = payload?.payload?.reason || 'Sesi perangkat Anda telah dihentikan oleh Super Admin.';
          triggerRevocationCallbacks(reason);
        }
      })
      .on('broadcast', { event: 'user_sessions_revoked' }, payload => {
        const { userId, exceptSessionId, reason } = payload?.payload || {};
        const savedUserStr = localStorage.getItem('mlabel_session_user');
        if (savedUserStr) {
          try {
            const user = JSON.parse(savedUserStr);
            if (user.id === userId && getCurrentSessionId() !== exceptSessionId) {
              triggerRevocationCallbacks(reason || 'Sesi perangkat Anda telah dihentikan oleh Super Admin.');
            }
          } catch (e) {}
        }
      })
      .subscribe();
  } catch (e) {
    console.warn('[SessionService] Realtime channel setup failed:', e);
  }
}

/**
 * Bersihkan listener realtime
 */
export function cleanupRealtimeSessionListener() {
  if (realtimeChannel) {
    try {
      supabase.removeChannel(realtimeChannel);
    } catch (e) {}
    realtimeChannel = null;
  }
}
