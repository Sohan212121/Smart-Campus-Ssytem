import crypto from "crypto";

const QR_SECRET = process.env.JWT_SECRET || "super-secret-key-scaash-token-2026";
const TOKEN_VALIDITY_SECONDS = 10; // QR token valid for 10 seconds

export interface QRPayload {
  lectureId: string;
  token: string;
  timestamp: number;
  expiresAt: number;
}

/**
 * Generates a cryptographically signed dynamic QR token payload.
 * Token rotates every ~5 seconds and is valid for 10 seconds to allow scan latency.
 */
export function generateQRToken(lectureId: string): QRPayload {
  const timestamp = Date.now();
  const expiresAt = timestamp + TOKEN_VALIDITY_SECONDS * 1000;

  const signatureData = `${lectureId}:${timestamp}:${QR_SECRET}`;
  const token = crypto
    .createHmac("sha256", QR_SECRET)
    .update(signatureData)
    .digest("hex")
    .substring(0, 16); // Short token for QR code compactness

  return {
    lectureId,
    token,
    timestamp,
    expiresAt,
  };
}

/**
 * Validates a student-submitted QR token against the expected cryptographic signature.
 * Returns true if the token is valid and not expired.
 */
export function validateQRToken(
  lectureId: string,
  submittedToken: string,
  submittedTimestamp: number
): { valid: boolean; reason: string } {
  // Check if token has expired
  const now = Date.now();
  const tokenAge = now - submittedTimestamp;

  if (tokenAge > TOKEN_VALIDITY_SECONDS * 1000) {
    return { valid: false, reason: "QR code has expired. Please scan the latest code." };
  }

  if (tokenAge < 0) {
    return { valid: false, reason: "Invalid token timestamp detected." };
  }

  // Recompute expected token
  const signatureData = `${lectureId}:${submittedTimestamp}:${QR_SECRET}`;
  const expectedToken = crypto
    .createHmac("sha256", QR_SECRET)
    .update(signatureData)
    .digest("hex")
    .substring(0, 16);

  if (submittedToken !== expectedToken) {
    return { valid: false, reason: "Invalid QR token signature. Possible tampering detected." };
  }

  return { valid: true, reason: "Token verified successfully." };
}

/**
 * Haversine formula: calculates the distance in meters between two GPS coordinate pairs.
 * Used for geofenced classroom proximity verification.
 */
export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Earth radius in meters
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRadians(deg: number): number {
  return deg * (Math.PI / 180);
}

// Default classroom coordinates for testing (New Delhi, India)
export const DEFAULT_CLASSROOM_COORDS = {
  latitude: 28.6139,
  longitude: 77.209,
};

export const MAX_GEOFENCE_RADIUS_METERS = 50; // 50 meters for testing flexibility
