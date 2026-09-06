import { getSetting, saveSetting } from '@/db';

// Konfigurasi Default Penyimpanan EmailJS
const EMAIL_SETTINGS_KEYS = {
  SERVICE_ID: 'emailjs_service_id',
  TEMPLATE_ID: 'emailjs_template_id',
  PUBLIC_KEY: 'emailjs_public_key',
  SENDER_NAME: 'emailjs_sender_name'
};

/**
 * Mengambil konfigurasi EmailJS dari IndexedDB / Local Storage
 */
export async function getEmailConfig() {
  const serviceId = (await getSetting(EMAIL_SETTINGS_KEYS.SERVICE_ID)) || '';
  const templateId = (await getSetting(EMAIL_SETTINGS_KEYS.TEMPLATE_ID)) || '';
  const publicKey = (await getSetting(EMAIL_SETTINGS_KEYS.PUBLIC_KEY)) || '';
  const senderName = (await getSetting(EMAIL_SETTINGS_KEYS.SENDER_NAME)) || 'PT. Saptawarna Cemerlang - M-Label Security';

  const isConfigured = Boolean(serviceId && templateId && publicKey);

  return {
    serviceId,
    templateId,
    publicKey,
    senderName,
    isConfigured
  };
}

/**
 * Menyimpan konfigurasi EmailJS
 */
export async function saveEmailConfig(config) {
  if (config.serviceId !== undefined) await saveSetting(EMAIL_SETTINGS_KEYS.SERVICE_ID, config.serviceId.trim());
  if (config.templateId !== undefined) await saveSetting(EMAIL_SETTINGS_KEYS.TEMPLATE_ID, config.templateId.trim());
  if (config.publicKey !== undefined) await saveSetting(EMAIL_SETTINGS_KEYS.PUBLIC_KEY, config.publicKey.trim());
  if (config.senderName !== undefined) await saveSetting(EMAIL_SETTINGS_KEYS.SENDER_NAME, config.senderName.trim());
  return true;
}

/**
 * Mengirim email menggunakan EmailJS REST API (tanpa library tambahan)
 * Endpoint: https://api.emailjs.com/api/v1.0/email/send
 */
export async function sendEmailViaEmailJS({ toEmail, toName, subject, otpCode, message, type = 'OTP' }) {
  const config = await getEmailConfig();

  if (!config.isConfigured) {
    console.warn('[EmailService] EmailJS belum dikonfigurasi. Menjalankan fallback simulasi lokal.');
    return {
      success: true,
      simulated: true,
      message: 'EmailJS belum dikonfigurasi di Pengaturan. Sistem menggunakan mode verifikasi lokal.'
    };
  }

  const nowFormatted = new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'full',
    timeStyle: 'medium',
    timeZone: 'Asia/Jakarta'
  }).format(new Date());

  // Template parameter yang standar dikirim ke EmailJS
  const templateParams = {
    to_email: toEmail,
    to_name: toName || 'Super Admin SWC',
    subject: subject || 'Kode Verifikasi OTP Pemulihan Kata Sandi - M-Label SWC',
    otp_code: otpCode || '',
    message: message || '',
    type: type,
    sender_name: config.senderName,
    request_time: `${nowFormatted} WIB`,
    app_name: 'M-Label Enterprise SIDP (PT. Saptawarna Cemerlang)'
  };

  const payload = {
    service_id: config.serviceId,
    template_id: config.templateId,
    user_id: config.publicKey,
    template_params: templateParams
  };

  try {
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gagal mengirim email via EmailJS (${response.status}): ${errText}`);
    }

    return {
      success: true,
      simulated: false,
      message: `Email kode verifikasi berhasil dikirimkan ke ${toEmail}`
    };
  } catch (error) {
    console.error('[EmailService] Error dispatching email:', error);
    throw error;
  }
}

/**
 * Mengirim email uji coba koneksi dari Menu Settings
 */
export async function testEmailConnection(targetEmail = 'isnanswc@gmail.com') {
  return await sendEmailViaEmailJS({
    toEmail: targetEmail,
    toName: 'Super Admin SWC',
    subject: '🧪 Uji Coba Koneksi Layanan Email M-Label',
    otpCode: '123456',
    message: 'Koneksi EmailJS berhasil dikonfigurasi dengan baik pada sistem M-Label PT. Saptawarna Cemerlang.',
    type: 'TEST'
  });
}
