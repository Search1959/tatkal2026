export type TravelClass = '1A' | '2A' | '3A' | '3E' | 'SL' | 'CC' | 'EC' | '2S';

export type QuotaType = 'TATKAL' | 'GENERAL' | 'PREMIUM_TATKAL' | 'LADIES' | 'SENIOR_CITIZEN';

export type BerthPreference = 
  | 'No Preference'
  | 'Lower Berth'
  | 'Middle Berth'
  | 'Upper Berth'
  | 'Side Lower'
  | 'Side Upper'
  | 'Window Seat';

export type FoodPreference = 'Veg' | 'Non-Veg' | 'No Food';

export interface Station {
  code: string;
  name: string;
  city: string;
  state: string;
  junction?: boolean;
}

export interface TrainScheduleStop {
  stationCode: string;
  stationName: string;
  arrivalTime: string;
  departureTime: string;
  haltMinutes: number;
  dayNumber: number;
  distanceKm: number;
}

export interface Train {
  number: string;
  name: string;
  type: 'Vande Bharat' | 'Rajdhani Express' | 'Shatabdi Express' | 'Duronto Express' | 'Superfast Express' | 'Mail / Express';
  fromStationCode: string;
  toStationCode: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  runsOn: ('Sun' | 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat')[];
  classes: TravelClass[];
  tatkalAllowed: boolean;
  distanceKm: number;
  stopsCount: number;
}

export interface Passenger {
  id: string;
  fullName: string;
  age: number;
  gender: 'Male' | 'Female' | 'Transgender';
  berthPreference: BerthPreference;
  foodPreference: FoodPreference;
  seniorCitizenOpt: boolean;
  idCardType?: 'Aadhaar' | 'PAN Card' | 'Passport' | 'Voter ID' | 'Driving License';
  idCardNumberMasked?: string;
}

export interface JourneyConfig {
  id: string;
  title: string;
  sourceStation: Station;
  destinationStation: Station;
  journeyDate: string; // YYYY-MM-DD
  quota: QuotaType;
  selectedTrainNumber: string;
  selectedClass: TravelClass;
  selectedPassengerIds: string[];
  notes?: string;
  lastUpdated: string;
}

export interface ReadinessCheckItem {
  id: string;
  title: string;
  description: string;
  category: 'journey' | 'passenger' | 'timing' | 'irctc';
  isPassed: boolean;
  severity: 'error' | 'warning' | 'info';
  recommendation?: string;
}

export interface PnrPassenger {
  passengerIndex: number;
  bookingStatus: string; // e.g. "CNF B4-23" or "WL 12"
  currentStatus: string; // e.g. "CNF B4-23 (Lower)"
  berth: string;
  coach: string;
  statusType: 'CNF' | 'RAC' | 'WL';
}

export interface PnrRecord {
  pnrNumber: string;
  trainNumber: string;
  trainName: string;
  fromStationCode: string;
  fromStationName: string;
  toStationCode: string;
  toStationName: string;
  journeyDate: string;
  boardingDate: string;
  travelClass: TravelClass;
  quota: QuotaType;
  chartStatus: 'Chart Prepared' | 'Chart Not Prepared';
  passengers: PnrPassenger[];
  remarks: string;
  isDemoData: boolean;
}

export type UserRole = 'admin' | 'operator' | 'passenger';

export type UserStatus = 'active' | 'suspended';

export interface AppUser {
  id: string;
  email: string;
  displayName: string;
  password?: string;
  role: UserRole;
  status: UserStatus;
  department?: string;
  assignedStations?: string[];
  createdAt: string;
  createdBy?: string;
  lastLogin?: string;
}

export interface AuditLog {
  id: string;
  action: string;
  targetUserEmail: string;
  performedBy: string;
  timestamp: string;
  details: string;
}

export type ActiveTab = 
  | 'dashboard'
  | 'workspace'
  | 'passengers'
  | 'readiness'
  | 'trains'
  | 'pnr'
  | 'guidelines'
  | 'settings'
  | 'admin';

