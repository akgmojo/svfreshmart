import crypto from 'crypto';

export interface CreatePaymentParams {
  orderId: string;
  amount: number; // in INR
  currency?: string;
  customerPhone: string;
  customerName: string;
}

export interface PaymentGatewayResponse {
  success: boolean;
  gatewayOrderId: string;
  amount: number;
  currency: string;
  keyId: string;
  isTestMode: boolean;
}

export interface VerifyPaymentParams {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export interface IPaymentGateway {
  createOrder(params: CreatePaymentParams): Promise<PaymentGatewayResponse>;
  verifyPayment(params: VerifyPaymentParams): Promise<boolean>;
  processRefund(paymentId: string, amount: number): Promise<{ success: boolean; refundId?: string }>;
}

/**
 * Concrete Razorpay Provider implementing the IPaymentGateway abstraction
 */
export class RazorpayProvider implements IPaymentGateway {
  private keyId: string;
  private keySecret: string;

  constructor() {
    this.keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_svfreshmart2026';
    this.keySecret = process.env.RAZORPAY_KEY_SECRET || 'secret_svfreshmart_bangalore';
  }

  async createOrder(params: CreatePaymentParams): Promise<PaymentGatewayResponse> {
    const amountInPaise = Math.round(params.amount * 100);
    const mockRazorpayOrderId = `order_rzp_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    return {
      success: true,
      gatewayOrderId: mockRazorpayOrderId,
      amount: amountInPaise,
      currency: params.currency || 'INR',
      keyId: this.keyId,
      isTestMode: this.keyId.startsWith('rzp_test')
    };
  }

  async verifyPayment(params: VerifyPaymentParams): Promise<boolean> {
    if (!params.razorpayOrderId || !params.razorpayPaymentId) {
      return false;
    }

    // In simulated test mode with mock keys
    if (this.keyId.startsWith('rzp_test') && params.razorpaySignature === 'simulated_test_signature') {
      return true;
    }

    // Real HMAC SHA256 verification
    try {
      const generatedSignature = crypto
        .createHmac('sha256', this.keySecret)
        .update(`${params.razorpayOrderId}|${params.razorpayPaymentId}`)
        .digest('hex');

      return generatedSignature === params.razorpaySignature;
    } catch {
      return false;
    }
  }

  async processRefund(paymentId: string, amount: number): Promise<{ success: boolean; refundId?: string }> {
    console.log(`[PaymentService] Processing refund of ₹${amount} for payment ${paymentId}`);
    return {
      success: true,
      refundId: `rfnd_${Date.now()}`
    };
  }
}

// Export singleton payment service instance
export const PaymentService = new RazorpayProvider();
