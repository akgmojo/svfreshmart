interface OtpRecord {
  phone: string;
  code: string;
  expiresAt: number;
  attempts: number;
}

// In-memory OTP store with rate limiting
const otpCache = new Map<string, OtpRecord>();
const rateLimitCache = new Map<string, { count: number; resetAt: number }>();

export class NotificationService {
  /**
   * Generates a 6-digit numeric OTP and handles rate-limiting
   */
  static generateOtp(phone: string): { success: boolean; code?: string; message: string; remainingSeconds?: number } {
    const cleaned = (phone || '').replace(/\D/g, '').slice(-10);
    if (cleaned.length !== 10) {
      return { success: false, message: 'Please enter a valid 10-digit Indian mobile number.' };
    }

    const now = Date.now();
    const rateData = rateLimitCache.get(cleaned) || { count: 0, resetAt: now + 60000 };

    if (now > rateData.resetAt) {
      rateData.count = 0;
      rateData.resetAt = now + 60000;
    }

    if (rateData.count >= 4) {
      const waitSec = Math.ceil((rateData.resetAt - now) / 1000);
      return { 
        success: false, 
        message: `Too many OTP requests. Please wait ${waitSec}s before requesting again.`,
        remainingSeconds: waitSec
      };
    }

    rateData.count++;
    rateLimitCache.set(cleaned, rateData);

    // Fixed test OTP for demo testing convenience or generate random 6-digit code
    const code = cleaned === '9876543210' ? '123456' : Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = now + 5 * 60 * 1000; // 5 minutes validity

    otpCache.set(cleaned, {
      phone: cleaned,
      code,
      expiresAt,
      attempts: 0
    });

    console.log(`[NotificationService] OTP for ${cleaned} is: ${code}`);

    // In production, integrate external SMS/WhatsApp gateway (e.g. Gupshup, Twilio, MSG91)
    return {
      success: true,
      code, // returned for friendly preview in development/testing mode
      message: `OTP sent successfully to +91 ${cleaned}`
    };
  }

  /**
   * Verifies submitted OTP against cached record
   */
  static verifyOtp(phone: string, submittedCode: string): { success: boolean; message: string } {
    const cleaned = (phone || '').replace(/\D/g, '').slice(-10);
    const record = otpCache.get(cleaned);

    if (!record) {
      return { success: false, message: 'No active OTP found. Please request a new OTP.' };
    }

    if (Date.now() > record.expiresAt) {
      otpCache.delete(cleaned);
      return { success: false, message: 'OTP has expired. Please request a fresh one.' };
    }

    if (record.attempts >= 5) {
      otpCache.delete(cleaned);
      return { success: false, message: 'Maximum attempts reached. Please request a new OTP.' };
    }

    record.attempts++;

    // Accept developer test master code '123456' or exact generated code
    if (submittedCode.trim() === record.code || submittedCode.trim() === '123456') {
      otpCache.delete(cleaned);
      return { success: true, message: 'Mobile number verified successfully.' };
    }

    return { success: false, message: 'Incorrect OTP. Please check and try again.' };
  }

  /**
   * Order status notification trigger (ready for WhatsApp/SMS in V1.1)
   */
  static async sendOrderStatusUpdate(phone: string, orderNumber: string, status: string): Promise<void> {
    console.log(`[NotificationService] Alert to ${phone}: Order ${orderNumber} is now "${status}".`);
  }
}
