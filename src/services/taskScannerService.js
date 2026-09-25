/**
 * Task Scanner Utility Service
 * Handles QR decoding for SWC Label Management format,
 * audio/haptic feedback, theoretical weight calculation,
 * and duplicate scan prevention.
 */

/**
 * Audio and Haptic feedback for successful scans
 */
export function playSuccessFeedback() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      // Pleasant high-pitch double chime
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
      osc.frequency.setValueAtTime(1320, ctx.currentTime + 0.08); // E6

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    }
  } catch (e) {
    // Audio context may be restricted before user gesture
  }

  // Haptic feedback (Vibration) on mobile devices
  if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
    try {
      navigator.vibrate([70, 40, 70]);
    } catch (e) {}
  }
}

/**
 * Audio and Haptic feedback for warning / duplicate / invalid scans
 */
export function playWarningFeedback() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      // Low buzzer
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.setValueAtTime(180, ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    }
  } catch (e) {
    // Audio context may be restricted before user gesture
  }

  // Strong vibration warning
  if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
    try {
      navigator.vibrate([200, 100, 200]);
    } catch (e) {}
  }
}

/**
 * Calculate Theoretical Weight (kg)
 * Formula: (thickness * width * length * density) / 1,000,000
 */
export function calculateBeratTeori(thick, width, length, density = 0.91) {
  const t = parseFloat(thick) || 0;
  const w = parseFloat(width) || 0;
  const l = parseFloat(length) || 0;
  const d = parseFloat(density) || 0.91;
  if (!t || !w || !l || !d) return 0;
  return parseFloat(((t * w * l * d) / 1000000).toFixed(2));
}

/**
 * Parse QR string generated from Label Management:
 * Format:
 * [jenis] [kode] [thick] MC X [width] MM = [length]|[lot][turunan]|[kodePack][subKode]
 * Example:
 * VMCPP M01 18 MC X 1000 MM = 3000|M01240826C101HA01|SL08240001
 */
export function parseTaskQrCode(qrString, defaultDensity = 0.91) {
  if (!qrString || typeof qrString !== 'string') return null;
  const raw = qrString.trim();
  if (!raw) return null;

  // 1. Check if payload is in JSON format
  if (raw.startsWith('{') && raw.endsWith('}')) {
    try {
      const data = JSON.parse(raw);
      const thick = parseFloat(data.thickness || data.thick || data.t || 0);
      const width = parseFloat(data.width || data.w || 0);
      const length = parseFloat(data.length || data.len || data.meter || data.l || 0);
      const density = parseFloat(data.density || defaultDensity);
      const beratTeori = calculateBeratTeori(thick, width, length, density);

      return {
        rawQr: raw,
        jenis: String(data.jenis || data.j || '').toUpperCase().trim(),
        kodeFormula: String(data.kodeFormula || data.kode || data.kf || '').toUpperCase().trim(),
        thickness: thick,
        width: width,
        length: length,
        lot: String(data.lot || data.l || '').toUpperCase().trim(),
        turunan: String(data.turunan || data.tur || '').toUpperCase().trim(),
        kodePack: String(data.kodePack || data.kp || '').toUpperCase().trim(),
        subKode: String(data.subKode || data.sk || '').toUpperCase().trim(),
        density,
        beratTeori
      };
    } catch (e) {
      // not JSON, fallback to string parsing
    }
  }

  // 2. Standard Pipe Delimited Format from SWC Label Management
  const parts = raw.split('|').map(s => s.trim());

  let jenis = '';
  let kodeFormula = '';
  let thickness = 0;
  let width = 0;
  let length = 0;
  let lot = '';
  let turunan = '';
  let kodePack = '';
  let subKode = '';

  if (parts.length >= 2) {
    const descPart = parts[0];
    const lotPart = parts[1];
    const packPart = parts[2] || '';

    // Parse descPart: e.g. "VMCPP M01 18 MC X 1000 MM = 3000" or "CPP C01 20 MC X 1200 MM = 6000"
    const descMatch = descPart.match(/^([A-Za-z0-9\-\_]+)\s+([A-Za-z0-9\-\_]+)\s+(\d+(?:\.\d+)?)\s*MC\s*[xX]\s*(\d+(?:\.\d+)?)\s*MM(?:\s*=\s*(\d+(?:\.\d+)?))?/i);
    if (descMatch) {
      jenis = descMatch[1].toUpperCase();
      kodeFormula = descMatch[2].toUpperCase();
      thickness = parseFloat(descMatch[3]) || 0;
      width = parseFloat(descMatch[4]) || 0;
      length = descMatch[5] ? parseFloat(descMatch[5]) : 0;
    } else {
      // Fallback regex if spacing differs
      const thickMatch = descPart.match(/(\d+(?:\.\d+)?)\s*MC/i);
      const widthMatch = descPart.match(/[xX]\s*(\d+(?:\.\d+)?)\s*MM/i);
      const lengthMatch = descPart.match(/=\s*(\d+(?:\.\d+)?)/i);
      if (thickMatch) thickness = parseFloat(thickMatch[1]) || 0;
      if (widthMatch) width = parseFloat(widthMatch[1]) || 0;
      if (lengthMatch) length = parseFloat(lengthMatch[1]) || 0;

      const words = descPart.split(/\s+/);
      if (words.length >= 1) jenis = words[0].toUpperCase();
      if (words.length >= 2 && !words[1].includes('MC')) kodeFormula = words[1].toUpperCase();
    }

    // Parse lot and turunan from lotPart e.g. "M01240826C101HA01" or "M01240826C101/HA01"
    if (lotPart.includes('/')) {
      const segs = lotPart.split('/');
      turunan = segs.pop().toUpperCase();
      lot = segs.join('/').toUpperCase();
    } else {
      // Common turunan pattern: suffix 1-2 letters + 2-3 digits e.g. HA01, A01, J101, B02
      const tMatch = lotPart.match(/([A-Za-z]{1,2}\d{2,3})$/);
      if (tMatch && lotPart.length > tMatch[1].length) {
        turunan = tMatch[1].toUpperCase();
        lot = lotPart.slice(0, -tMatch[1].length).toUpperCase();
      } else {
        lot = lotPart.toUpperCase();
        turunan = '';
      }
    }

    // Parse packPart: e.g. "SL08240001" or "SL0824 0001" or "RW0924REJECT"
    if (packPart) {
      const pMatch = packPart.match(/^([A-Za-z0-9]{5,7})\s*(\d{4}|0000|REJECT|HOLD)$/i);
      if (pMatch) {
        kodePack = pMatch[1].toUpperCase();
        subKode = pMatch[2].toUpperCase();
      } else {
        kodePack = packPart.toUpperCase();
      }
    }
  } else {
    // 3. Simple space or single string fallback
    lot = raw.toUpperCase();
  }

  // Lookup density based on film type
  let density = defaultDensity;
  const upperJenis = (jenis || '').toUpperCase();
  if (['VMPET', 'PET'].includes(upperJenis)) {
    density = 1.40;
  } else if (['VMCPP', 'CPP', 'BOPP', 'OPP'].includes(upperJenis)) {
    density = 0.91;
  }

  const beratTeori = calculateBeratTeori(thickness, width, length, density);

  return {
    rawQr: raw,
    jenis,
    kodeFormula,
    thickness,
    width,
    length,
    lot,
    turunan,
    kodePack,
    subKode,
    density,
    beratTeori
  };
}

/**
 * Format timestamp display
 */
export function formatScanTimestamp(date = new Date()) {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '-';
  const pad = (n) => String(n).padStart(2, '0');
  const day = pad(d.getDate());
  const month = pad(d.getMonth() + 1);
  const year = d.getFullYear();
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  const seconds = pad(d.getSeconds());
  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
}
