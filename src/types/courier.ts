/**
 * 👑 AALM VASTRALAY — COURIER & AWB GENERATION TYPES
 * Type definitions for Shiprocket, Delhivery & Unified Logistics Engine.
 */

export type CourierProvider = "shiprocket" | "delhivery" | "auto";

export interface AwbGenerationResult {
  success: boolean;
  courier: "Shiprocket" | "Delhivery";
  awbCode: string;
  labelUrl: string;
  orderId: string;
  orderNumber?: string;
  routingCode?: string;
  estimatedDeliveryDays?: number;
  pickupScheduled?: boolean;
  error?: string;
}

export interface CourierPackageDetails {
  weightGrams: number;
  dimensionsCm: {
    length: number;
    width: number;
    height: number;
  };
}

export interface TrackingActivity {
  timestamp: string;
  status: string;
  location: string;
  details: string;
}

export interface LiveTrackingResult {
  courier: string;
  awbCode: string;
  status: "in_transit" | "out_for_delivery" | "delivered" | "exception";
  currentLocation: string;
  expectedDelivery: string;
  activities: TrackingActivity[];
}
