import { BangaloreDeliveryZone } from '../types';
import { getDeliveryZones } from '../data/db';

export interface DeliveryCheckResult {
  isServiceable: boolean;
  pincode: string;
  areaName?: string;
  deliveryFee: number;
  freeDeliveryThreshold: number;
  minOrderValue: number;
  estimatedHours?: string;
  message: string;
}

export class DeliveryService {
  /**
   * Validate if a pincode is a valid 6-digit Bangalore pincode (560xxx)
   */
  static isValidBangalorePincodeFormat(pincode: string): boolean {
    const cleaned = (pincode || '').trim();
    return /^560\d{3}$/.test(cleaned);
  }

  /**
   * Check delivery availability and fee structure for a given Bangalore pincode
   */
  static checkPincode(pincode: string): DeliveryCheckResult {
    const cleaned = (pincode || '').trim();

    if (!cleaned) {
      return {
        isServiceable: false,
        pincode: cleaned,
        deliveryFee: 0,
        freeDeliveryThreshold: 399,
        minOrderValue: 149,
        message: 'Please enter a 6-digit Bangalore pincode.'
      };
    }

    if (!this.isValidBangalorePincodeFormat(cleaned)) {
      return {
        isServiceable: false,
        pincode: cleaned,
        deliveryFee: 0,
        freeDeliveryThreshold: 399,
        minOrderValue: 149,
        message: 'Currently SV Freshmart delivers only within Bangalore (Pincodes starting with 560xxx).'
      };
    }

    const zones = getDeliveryZones();
    const zone = zones.find(z => z.pincode === cleaned);

    if (zone && zone.isServiceable) {
      return {
        isServiceable: true,
        pincode: zone.pincode,
        areaName: zone.areaName,
        deliveryFee: zone.deliveryFee,
        freeDeliveryThreshold: zone.freeDeliveryThreshold,
        minOrderValue: zone.minOrderValue,
        estimatedHours: zone.estimatedHours,
        message: `Delivery available to ${zone.areaName} (${zone.pincode})! Est: ${zone.estimatedHours}`
      };
    }

    // Default fallback for any standard Bangalore pincode within city limits
    return {
      isServiceable: true,
      pincode: cleaned,
      areaName: 'Bangalore City Zone',
      deliveryFee: 35,
      freeDeliveryThreshold: 399,
      minOrderValue: 149,
      estimatedHours: 'Same Day Delivery',
      message: `Delivery available to Bangalore (${cleaned})!`
    };
  }

  /**
   * Calculate final delivery charge given subtotal and pincode
   */
  static calculateDeliveryCharge(pincode: string, subtotal: number): {
    deliveryFee: number;
    isFreeDelivery: number;
    thresholdRemaining: number;
    minOrderMet: boolean;
    minOrderValue: number;
  } {
    const check = this.checkPincode(pincode);
    if (!check.isServiceable) {
      return {
        deliveryFee: 0,
        isFreeDelivery: 0,
        thresholdRemaining: 0,
        minOrderMet: false,
        minOrderValue: check.minOrderValue
      };
    }

    const minOrderMet = subtotal >= check.minOrderValue;
    const isFreeDelivery = subtotal >= check.freeDeliveryThreshold;
    const fee = isFreeDelivery ? 0 : check.deliveryFee;
    const thresholdRemaining = isFreeDelivery ? 0 : Math.max(0, check.freeDeliveryThreshold - subtotal);

    return {
      deliveryFee: fee,
      isFreeDelivery: isFreeDelivery ? 1 : 0,
      thresholdRemaining,
      minOrderMet,
      minOrderValue: check.minOrderValue
    };
  }
}
