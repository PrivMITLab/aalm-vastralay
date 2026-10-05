export interface PincodeInfo {
  pincode: string;
  state: string;
  circle: string;
  zone: string;
  minDays: number;
  maxDays: number;
  deliveryRange: string;
  isCodAvailable: boolean;
  isExpressAvailable: boolean;
  freeShippingThreshold: number;
}

interface CircleData {
  state: string;
  circle: string;
  zone: string;
  minDays: number;
  maxDays: number;
  express: boolean;
}

// Indian postal prefix (first 2 digits) mapping to state/circle
const PINCODE_CIRCLES: Record<string, CircleData> = {
  // Delhi
  "11": { state: "Delhi", circle: "Delhi NCR", zone: "North", minDays: 2, maxDays: 3, express: true },
  // Haryana
  "12": { state: "Haryana", circle: "Gurgaon / Faridabad", zone: "North", minDays: 2, maxDays: 3, express: true },
  "13": { state: "Haryana", circle: "Ambala / Rohtak", zone: "North", minDays: 2, maxDays: 4, express: false },
  // Punjab & Chandigarh
  "14": { state: "Punjab", circle: "Ludhiana / Jalandhar", zone: "North", minDays: 2, maxDays: 4, express: false },
  "15": { state: "Punjab", circle: "Bathinda / Firozpur", zone: "North", minDays: 3, maxDays: 4, express: false },
  "16": { state: "Chandigarh", circle: "Chandigarh Capital", zone: "North", minDays: 2, maxDays: 3, express: true },
  // Himachal Pradesh
  "17": { state: "Himachal Pradesh", circle: "Shimla / Kangra", zone: "North", minDays: 3, maxDays: 5, express: false },
  // Jammu & Kashmir & Ladakh
  "18": { state: "Jammu & Kashmir", circle: "Jammu Circle", zone: "North", minDays: 4, maxDays: 6, express: false },
  "19": { state: "Jammu & Kashmir", circle: "Srinagar / Ladakh", zone: "North", minDays: 4, maxDays: 7, express: false },
  // Uttar Pradesh & Uttarakhand
  "20": { state: "Uttar Pradesh", circle: "Western UP (Aligarh/Noida)", zone: "North", minDays: 2, maxDays: 3, express: true },
  "21": { state: "Uttar Pradesh", circle: "Central UP (Prayagraj)", zone: "North", minDays: 2, maxDays: 4, express: false },
  "22": { state: "Uttar Pradesh", circle: "Lucknow / Ayodhya", zone: "North", minDays: 2, maxDays: 3, express: true },
  "23": { state: "Uttar Pradesh", circle: "Varanasi / Mirzapur", zone: "North", minDays: 2, maxDays: 4, express: true },
  "24": { state: "Uttarakhand", circle: "Dehradun / Haridwar", zone: "North", minDays: 2, maxDays: 4, express: false },
  "25": { state: "Uttar Pradesh", circle: "Meerut / Saharanpur", zone: "North", minDays: 2, maxDays: 3, express: true },
  "26": { state: "Uttarakhand", circle: "Nainital / Kumaon", zone: "North", minDays: 3, maxDays: 5, express: false },
  "27": { state: "Uttar Pradesh", circle: "Gorakhpur / Basti", zone: "North", minDays: 2, maxDays: 4, express: false },
  "28": { state: "Uttar Pradesh", circle: "Agra / Jhansi", zone: "North", minDays: 2, maxDays: 3, express: false },
  // Rajasthan
  "30": { state: "Rajasthan", circle: "Jaipur Central", zone: "West", minDays: 2, maxDays: 3, express: true },
  "31": { state: "Rajasthan", circle: "Udaipur / Kota", zone: "West", minDays: 2, maxDays: 4, express: false },
  "32": { state: "Rajasthan", circle: "Bharatpur / Alwar", zone: "West", minDays: 2, maxDays: 4, express: false },
  "33": { state: "Rajasthan", circle: "Bikaner / Churu", zone: "West", minDays: 3, maxDays: 5, express: false },
  "34": { state: "Rajasthan", circle: "Jodhpur / Barmer", zone: "West", minDays: 3, maxDays: 5, express: false },
  // Gujarat
  "36": { state: "Gujarat", circle: "Rajkot / Saurashtra", zone: "West", minDays: 2, maxDays: 4, express: false },
  "37": { state: "Gujarat", circle: "Kutch", zone: "West", minDays: 3, maxDays: 5, express: false },
  "38": { state: "Gujarat", circle: "Ahmedabad / Gandhinagar", zone: "West", minDays: 2, maxDays: 3, express: true },
  "39": { state: "Gujarat", circle: "Surat / Vadodara", zone: "West", minDays: 2, maxDays: 3, express: true },
  // Maharashtra & Goa
  "40": { state: "Maharashtra", circle: "Mumbai Metropolitan", zone: "West", minDays: 2, maxDays: 3, express: true },
  "41": { state: "Maharashtra", circle: "Pune / Kolhapur", zone: "West", minDays: 2, maxDays: 3, express: true },
  "42": { state: "Maharashtra", circle: "Nashik / Dhule", zone: "West", minDays: 2, maxDays: 4, express: false },
  "43": { state: "Goa", circle: "Goa Central", zone: "West", minDays: 3, maxDays: 5, express: false },
  "44": { state: "Maharashtra", circle: "Nagpur / Vidarbha", zone: "West", minDays: 2, maxDays: 4, express: false },
  // Madhya Pradesh & Chhattisgarh
  "45": { state: "Madhya Pradesh", circle: "Indore / Malwa", zone: "Central", minDays: 2, maxDays: 4, express: true },
  "46": { state: "Madhya Pradesh", circle: "Bhopal Central", zone: "Central", minDays: 2, maxDays: 4, express: true },
  "47": { state: "Madhya Pradesh", circle: "Gwalior / Chambal", zone: "Central", minDays: 2, maxDays: 4, express: false },
  "48": { state: "Madhya Pradesh", circle: "Jabalpur", zone: "Central", minDays: 3, maxDays: 5, express: false },
  "49": { state: "Chhattisgarh", circle: "Raipur / Bilaspur", zone: "Central", minDays: 3, maxDays: 5, express: false },
  // Andhra Pradesh & Telangana
  "50": { state: "Telangana", circle: "Hyderabad Metroparks", zone: "South", minDays: 2, maxDays: 3, express: true },
  "51": { state: "Telangana", circle: "Warangal / Nizamabad", zone: "South", minDays: 3, maxDays: 5, express: false },
  "52": { state: "Andhra Pradesh", circle: "Vijayawada / Guntur", zone: "South", minDays: 2, maxDays: 4, express: false },
  "53": { state: "Andhra Pradesh", circle: "Visakhapatnam / Rayalaseema", zone: "South", minDays: 3, maxDays: 5, express: false },
  // Karnataka
  "56": { state: "Karnataka", circle: "Bengaluru Metropolitan", zone: "South", minDays: 2, maxDays: 3, express: true },
  "57": { state: "Karnataka", circle: "Mysuru / Mangaluru", zone: "South", minDays: 2, maxDays: 4, express: false },
  "58": { state: "Karnataka", circle: "Hubballi / Belagavi", zone: "South", minDays: 3, maxDays: 5, express: false },
  "59": { state: "Karnataka", circle: "Gulbarga / Bellary", zone: "South", minDays: 3, maxDays: 5, express: false },
  // Tamil Nadu & Puducherry
  "60": { state: "Tamil Nadu", circle: "Chennai Metropolitan", zone: "South", minDays: 2, maxDays: 3, express: true },
  "61": { state: "Tamil Nadu", circle: "Thanjavur / Cuddalore", zone: "South", minDays: 3, maxDays: 5, express: false },
  "62": { state: "Tamil Nadu", circle: "Madurai / Dindigul", zone: "South", minDays: 2, maxDays: 4, express: false },
  "63": { state: "Tamil Nadu", circle: "Salem / Vellore", zone: "South", minDays: 2, maxDays: 4, express: false },
  "64": { state: "Tamil Nadu", circle: "Coimbatore / Tiruppur", zone: "South", minDays: 2, maxDays: 4, express: true },
  // Kerala & Lakshadweep
  "67": { state: "Kerala", circle: "Calicut / Malabar", zone: "South", minDays: 3, maxDays: 5, express: false },
  "68": { state: "Kerala", circle: "Ernakulam / Kochi", zone: "South", minDays: 2, maxDays: 4, express: true },
  "69": { state: "Kerala", circle: "Thiruvananthapuram", zone: "South", minDays: 3, maxDays: 5, express: false },
  // West Bengal & Sikkim & Andaman
  "70": { state: "West Bengal", circle: "Kolkata City", zone: "East", minDays: 2, maxDays: 3, express: true },
  "71": { state: "West Bengal", circle: "Howrah / Hooghly", zone: "East", minDays: 2, maxDays: 4, express: false },
  "72": { state: "West Bengal", circle: "Midnapore", zone: "East", minDays: 3, maxDays: 5, express: false },
  "73": { state: "West Bengal", circle: "Siliguri / Darjeeling", zone: "East", minDays: 3, maxDays: 5, express: false },
  "74": { state: "West Bengal", circle: "Murshidabad / Nadia", zone: "East", minDays: 3, maxDays: 5, express: false },
  // Odisha
  "75": { state: "Odisha", circle: "Bhubaneswar / Cuttack", zone: "East", minDays: 2, maxDays: 4, express: false },
  "76": { state: "Odisha", circle: "Berhampur", zone: "East", minDays: 3, maxDays: 5, express: false },
  "77": { state: "Odisha", circle: "Sambalpur / Rourkela", zone: "East", minDays: 3, maxDays: 5, express: false },
  // North East (Assam, Meghalaya, etc.)
  "78": { state: "Assam", circle: "Guwahati / Kamrup", zone: "North East", minDays: 4, maxDays: 6, express: false },
  "79": { state: "North Eastern States", circle: "Shillong / Imphal / Agartala", zone: "North East", minDays: 4, maxDays: 7, express: false },
  // Bihar & Jharkhand
  "80": { state: "Bihar", circle: "Patna Central", zone: "East", minDays: 2, maxDays: 3, express: true },
  "81": { state: "Bihar", circle: "Bhagalpur / Munger", zone: "East", minDays: 2, maxDays: 4, express: false },
  "82": { state: "Bihar", circle: "Gaya / Nalanda", zone: "East", minDays: 2, maxDays: 4, express: false },
  "83": { state: "Jharkhand", circle: "Ranchi / Jamshedpur", zone: "East", minDays: 2, maxDays: 4, express: true },
  "84": { state: "Bihar", circle: "Muzaffarpur / Champaran", zone: "East", minDays: 2, maxDays: 4, express: false },
  "85": { state: "Bihar", circle: "Purnea / Saharsa", zone: "East", minDays: 3, maxDays: 5, express: false },
};

/**
 * Validates a 6-digit Indian PIN code and computes location metadata,
 * delivery window, and COD availability.
 */
export function lookupPincode(pincode: string, baseDate: Date = new Date()): PincodeInfo | null {
  const clean = pincode.trim().replace(/\D/g, "");
  if (!/^\d{6}$/.test(clean)) return null;

  const prefix = clean.slice(0, 2);
  const data = PINCODE_CIRCLES[prefix] ?? {
    state: "India",
    circle: "All India Coverage",
    zone: "Rest of India",
    minDays: 3,
    maxDays: 6,
    express: false,
  };

  const start = new Date(baseDate);
  start.setDate(start.getDate() + data.minDays);

  const end = new Date(baseDate);
  end.setDate(end.getDate() + data.maxDays);

  const options: Intl.DateTimeFormatOptions = { weekday: "short", day: "numeric", month: "short" };
  const deliveryRange = `${start.toLocaleDateString("en-IN", options)} – ${end.toLocaleDateString("en-IN", options)}`;

  return {
    pincode: clean,
    state: data.state,
    circle: data.circle,
    zone: data.zone,
    minDays: data.minDays,
    maxDays: data.maxDays,
    deliveryRange,
    isCodAvailable: true,
    isExpressAvailable: data.express,
    freeShippingThreshold: 999,
  };
}

/**
 * Centroid coordinate benchmarks for Indian postal hubs.
 */
const INDIAN_COORDINATE_HUBS: Array<{
  lat: number;
  lng: number;
  pincode: string;
  name: string;
}> = [
  // Bihar & Jharkhand (Core regional focus)
  { lat: 25.5941, lng: 85.1376, pincode: "800001", name: "Patna Central" },
  { lat: 25.2425, lng: 86.9842, pincode: "812001", name: "Bhagalpur" },
  { lat: 24.7955, lng: 85.0002, pincode: "823001", name: "Gaya" },
  { lat: 26.1209, lng: 85.3647, pincode: "842001", name: "Muzaffarpur" },
  { lat: 25.7796, lng: 87.4753, pincode: "854301", name: "Purnea" },
  { lat: 23.3441, lng: 85.3096, pincode: "834001", name: "Ranchi" },
  // Delhi NCR & North
  { lat: 28.6139, lng: 77.2090, pincode: "110001", name: "Delhi Central" },
  { lat: 28.4595, lng: 77.0266, pincode: "122001", name: "Gurgaon" },
  { lat: 30.7333, lng: 76.7794, pincode: "160017", name: "Chandigarh" },
  { lat: 30.9010, lng: 75.8573, pincode: "141001", name: "Ludhiana" },
  { lat: 31.1048, lng: 77.1734, pincode: "171001", name: "Shimla" },
  { lat: 34.0837, lng: 74.7973, pincode: "190001", name: "Srinagar" },
  // Uttar Pradesh & Uttarakhand
  { lat: 26.8467, lng: 80.9462, pincode: "226001", name: "Lucknow" },
  { lat: 25.3176, lng: 82.9739, pincode: "221001", name: "Varanasi" },
  { lat: 25.4358, lng: 81.8463, pincode: "211001", name: "Prayagraj" },
  { lat: 28.6692, lng: 77.4538, pincode: "201001", name: "Ghaziabad / Noida" },
  { lat: 30.3165, lng: 78.0322, pincode: "248001", name: "Dehradun" },
  // West & Central
  { lat: 18.9220, lng: 72.8347, pincode: "400001", name: "Mumbai" },
  { lat: 18.5204, lng: 73.8567, pincode: "411001", name: "Pune" },
  { lat: 21.1458, lng: 79.0882, pincode: "440001", name: "Nagpur" },
  { lat: 23.0225, lng: 72.5714, pincode: "380001", name: "Ahmedabad" },
  { lat: 26.9124, lng: 75.7873, pincode: "302001", name: "Jaipur" },
  { lat: 22.7196, lng: 75.8577, pincode: "452001", name: "Indore" },
  { lat: 23.2599, lng: 77.4126, pincode: "462001", name: "Bhopal" },
  // East & North East
  { lat: 22.5726, lng: 88.3639, pincode: "700001", name: "Kolkata" },
  { lat: 20.2961, lng: 85.8245, pincode: "751001", name: "Bhubaneswar" },
  { lat: 26.1445, lng: 91.7362, pincode: "781001", name: "Guwahati" },
  // South
  { lat: 17.3850, lng: 78.4867, pincode: "500001", name: "Hyderabad" },
  { lat: 12.9716, lng: 77.5946, pincode: "560001", name: "Bengaluru" },
  { lat: 13.0827, lng: 80.2707, pincode: "600001", name: "Chennai" },
  { lat: 9.9312, lng: 76.2673, pincode: "682001", name: "Kochi" },
];

/**
 * Resolves browser GPS coordinates (lat, lon) to the nearest serviceable
 * Indian postal circle PIN code using Euclidean proximity.
 */
export function resolveCoordinatesToPincode(lat: number, lng: number): string | null {
  // Rough bounding box for Indian subcontinent (Lat: 6.5 to 37.5, Lng: 68.0 to 97.5)
  if (lat < 6.5 || lat > 37.5 || lng < 68.0 || lng > 97.5) {
    return null;
  }

  let minDistanceSq = Infinity;
  let closestPincode = "110001"; // Default fallback to Delhi central

  for (const hub of INDIAN_COORDINATE_HUBS) {
    const dLat = lat - hub.lat;
    const dLng = lng - hub.lng;
    const distSq = dLat * dLat + dLng * dLng;

    if (distSq < minDistanceSq) {
      minDistanceSq = distSq;
      closestPincode = hub.pincode;
    }
  }

  return closestPincode;
}

