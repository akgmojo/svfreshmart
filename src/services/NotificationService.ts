interface OtpRecord {
  phone: string;
  code: string;
  expiresAt: number;
  attempts: number;
  lastSentAt: number;
}

interface RateLimitRecord {
  count: number;
  firstRequestAt: number;
  lastRequestAt: number;
}

// In-memory OTP store and rate limiter
const otpStore = new Map<string, OtpRecord>();
const rateLimitStore = new Map<string, RateLimitRecord>();

const RESEND_COOLDOWN_MS = 60 * 1000; // 60 seconds
const OTP_EXPIRY_MS = 5 * 60 * 1000;   // 5 minutes
const MAX_ATTEMPTS = 3;                // Invalidate after 3 failed attempts
const MAX_REQUESTS_PER_WINDOW = 5;     // Max 5 OTP requests per 15 minutes window
const WINDOW_DURATION_MS = 15 * 60 * 1000;

export class NotificationService {
  /**
   * Generates a 6-digit numeric OTP and enforces strict rate-limiting and cooldown
   * NEVER exposes OTP code in public API responses
   */
  static generateOtp(phone: string): { 
    success: boolean; 
    message: string; 
    remainingSeconds?: number 
  } {
    const cleaned = (phone || '').replace(/\D/g, '').slice(-10);
    if (!/^[6-9]\d{9}$/.test(cleaned)) {
      return { 
        success: false, 
        message: 'Please enter a valid 10-digit Indian mobile number.' 
      };
    }

    const now = Date.now();

    // 1. Check Resend Cooldown (60s)
    const existingOtp = otpStore.get(cleaned);
    if (existingOtp) {
      const elapsedSinceLast = now - existingOtp.lastSentAt;
      if (elapsedSinceLast < RESEND_COOLDOWN_MS) {
        const remainingSeconds = Math.ceil((RESEND_COOLDOWN_MS - elapsedSinceLast) / 1000);
        return {
          success: false,
          message: `Please wait ${remainingSeconds} seconds before requesting a new OTP.`,
          remainingSeconds
        };
      }
    }

    // 2. Check 15-minute Rate Limit Window
    let rateData = rateLimitStore.get(cleaned);
    if (!rateData || (now - rateData.firstRequestAt) > WINDOW_DURATION_MS) {
      rateData = { count: 1, firstRequestAt: now, lastRequestAt: now };
    } else {
      if (rateData.count >= MAX_REQUESTS_PER_WINDOW) {
        const remainingWindowSec = Math.ceil((WINDOW_DURATION_MS - (now - rateData.firstRequestAt)) / 1000);
        return {
          success: false,
          message: `Too many OTP requests for this number. Please try again after ${Math.ceil(remainingWindowSec / 60)} minutes.`,
          remainingSeconds: remainingWindowSec
        };
      }
      rateData.count++;
      rateData.lastRequestAt = now;
    }
    rateLimitStore.set(cleaned, rateData);

    // 3. Generate 6-digit OTP
    // For the designated demo account (9876543210) in non-production, use test OTP 123456
    let code: string;
    if (process.env.NODE_ENV !== 'production' && cleaned === '9876543210') {
      code = '123456';
    } else {
      code = Math.floor(100000 + Math.random() * 900000).toString();
    }

    otpStore.set(cleaned, {
      phone: cleaned,
      code,
      expiresAt: now + OTP_EXPIRY_MS,
      attempts: 0,
      lastSentAt: now
    });

    // In production, never log raw OTP to stdout
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[NotificationService - DEV] Generated OTP for +91-${cleaned}: ${code}`);
    }

    return {
      success: true,
      message: `OTP sent successfully to +91 ${cleaned}`
    };
  }

  /**
   * Verifies submitted OTP against stored record
   */
  static verifyOtp(phone: string, submittedCode: string): { 
    success: boolean; 
    message: string;
    remainingAttempts?: number;
  } {
    const cleaned = (phone || '').replace(/\D/g, '').slice(-10);
    const record = otpStore.get(cleaned);

    if (!record) {
      return { 
        success: false, 
        message: 'No active OTP found. Please request an OTP first.' 
      };
    }

    const now = Date.now();
    if (now > record.expiresAt) {
      otpStore.delete(cleaned);
      return { 
        success: false, 
        message: 'OTP has expired. Please request a fresh OTP.' 
      };
    }

    record.attempts++;

    if (record.attempts > MAX_ATTEMPTS) {
      otpStore.delete(cleaned);
      return { 
        success: false, 
        message: 'Maximum verification attempts exceeded. This OTP is now invalid. Please request a new OTP.' 
      };
    }

    const cleanInput = (submittedCode || '').trim();

    // Check match
    const isDemoOverride = process.env.NODE_ENV !== 'production' && cleaned === '9876543210' && cleanInput === '123456';
    const isExactMatch = cleanInput === record.code;

    if (isExactMatch || isDemoOverride) {
      otpStore.delete(cleaned);
      return { 
        success: true, 
        message: 'Mobile number verified successfully.' 
      };
    }

    const remainingAttempts = MAX_ATTEMPTS - record.attempts;
    if (remainingAttempts <= 0) {
      otpStore.delete(cleaned);
      return {
        success: false,
        message: 'Maximum verification attempts reached. Please request a fresh OTP.'
      };
    }

    return { 
      success: false, 
      message: `Incorrect OTP. You have ${remainingAttempts} attempt${remainingAttempts === 1 ? '' : 's'} remaining.`,
      remainingAttempts
    };
  }

  /**
   * Order status notification trigger
   */
  static async sendOrderStatusUpdate(phone: string, orderNumber: string, status: string): Promise<void> {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[NotificationService] Notification to ${phone}: Order ${orderNumber} is now "${status}".`);
    }
  }
}
