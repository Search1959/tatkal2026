import { Station, Train, Passenger, JourneyConfig, PnrRecord } from '../types';

export const STATIONS: Station[] = [
  { code: 'NDLS', name: 'New Delhi', city: 'New Delhi', state: 'Delhi', junction: true },
  { code: 'HWH', name: 'Howrah Junction', city: 'Kolkata', state: 'West Bengal', junction: true },
  { code: 'BSB', name: 'Varanasi Junction', city: 'Varanasi', state: 'Uttar Pradesh', junction: true },
  { code: 'CSMT', name: 'Chhatrapati Shivaji Maharaj Terminus', city: 'Mumbai', state: 'Maharashtra', junction: true },
  { code: 'SBC', name: 'KSR Bengaluru City Junction', city: 'Bengaluru', state: 'Karnataka', junction: true },
  { code: 'MAS', name: 'MGR Chennai Central', city: 'Chennai', state: 'Tamil Nadu', junction: true },
  { code: 'PNBE', name: 'Patna Junction', city: 'Patna', state: 'Bihar', junction: true },
  { code: 'ADI', name: 'Ahmedabad Junction', city: 'Ahmedabad', state: 'Gujarat', junction: true },
  { code: 'HYB', name: 'Hyderabad Deccan Nampally', city: 'Hyderabad', state: 'Telangana', junction: true },
  { code: 'CNB', name: 'Kanpur Central', city: 'Kanpur', state: 'Uttar Pradesh', junction: true },
  { code: 'GKP', name: 'Gorakhpur Junction', city: 'Gorakhpur', state: 'Uttar Pradesh', junction: true },
  { code: 'CDG', name: 'Chandigarh Junction', city: 'Chandigarh', state: 'Punjab/Haryana', junction: true },
  { code: 'JP', name: 'Jaipur Junction', city: 'Jaipur', state: 'Rajasthan', junction: true },
  { code: 'PUNE', name: 'Pune Junction', city: 'Pune', state: 'Maharashtra', junction: true },
  { code: 'BPL', name: 'Bhopal Junction', city: 'Bhopal', state: 'Madhya Pradesh', junction: true },
  { code: 'SVDK', name: 'Shri Mata Vaishno Devi Katra', city: 'Katra', state: 'Jammu & Kashmir', junction: false },
  { code: 'LKO', name: 'Lucknow Charbagh NR', city: 'Lucknow', state: 'Uttar Pradesh', junction: true },
  { code: 'SDAH', name: 'Sealdah', city: 'Kolkata', state: 'West Bengal', junction: true },
  { code: 'ASR', name: 'Amritsar Junction', city: 'Amritsar', state: 'Punjab', junction: true },
  { code: 'GHY', name: 'Guwahati Junction', city: 'Guwahati', state: 'Assam', junction: true },
  { code: 'TVC', name: 'Thiruvananthapuram Central', city: 'Thiruvananthapuram', state: 'Kerala', junction: true }
];

export const TRAINS: Train[] = [
  {
    number: '12301',
    name: 'Howrah Rajdhani Express (via Gaya)',
    type: 'Rajdhani Express',
    fromStationCode: 'HWH',
    toStationCode: 'NDLS',
    departureTime: '16:50',
    arrivalTime: '10:05',
    duration: '17h 15m',
    runsOn: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    classes: ['1A', '2A', '3A'],
    tatkalAllowed: true,
    distanceKm: 1451,
    stopsCount: 7
  },
  {
    number: '12305',
    name: 'Howrah Rajdhani Express (via Patna)',
    type: 'Rajdhani Express',
    fromStationCode: 'HWH',
    toStationCode: 'NDLS',
    departureTime: '14:05',
    arrivalTime: '10:05',
    duration: '20h 00m',
    runsOn: ['Sun'],
    classes: ['1A', '2A', '3A'],
    tatkalAllowed: true,
    distanceKm: 1531,
    stopsCount: 9
  },
  {
    number: '22436',
    name: 'Vande Bharat Express (NDLS to BSB)',
    type: 'Vande Bharat',
    fromStationCode: 'NDLS',
    toStationCode: 'BSB',
    departureTime: '06:00',
    arrivalTime: '14:00',
    duration: '08h 00m',
    runsOn: ['Tue', 'Wed', 'Fri', 'Sat', 'Sun'],
    classes: ['CC', 'EC'],
    tatkalAllowed: true,
    distanceKm: 759,
    stopsCount: 3
  },
  {
    number: '12560',
    name: 'Shiv Ganga Express',
    type: 'Superfast Express',
    fromStationCode: 'NDLS',
    toStationCode: 'BSB',
    departureTime: '20:05',
    arrivalTime: '06:10',
    duration: '10h 05m',
    runsOn: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    classes: ['1A', '2A', '3A', '3E', 'SL'],
    tatkalAllowed: true,
    distanceKm: 757,
    stopsCount: 2
  },
  {
    number: '12951',
    name: 'Mumbai Rajdhani Express',
    type: 'Rajdhani Express',
    fromStationCode: 'CSMT',
    toStationCode: 'NDLS',
    departureTime: '17:00',
    arrivalTime: '08:32',
    duration: '15h 32m',
    runsOn: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    classes: ['1A', '2A', '3A'],
    tatkalAllowed: true,
    distanceKm: 1386,
    stopsCount: 6
  },
  {
    number: '12259',
    name: 'Sealdah Bikaner AC Duronto Express',
    type: 'Duronto Express',
    fromStationCode: 'SDAH',
    toStationCode: 'NDLS',
    departureTime: '17:00',
    arrivalTime: '11:00',
    duration: '18h 00m',
    runsOn: ['Mon', 'Wed', 'Thu', 'Sun'],
    classes: ['1A', '2A', '3A', '3E'],
    tatkalAllowed: true,
    distanceKm: 1458,
    stopsCount: 4
  },
  {
    number: '12004',
    name: 'Lucknow Shatabdi Express',
    type: 'Shatabdi Express',
    fromStationCode: 'NDLS',
    toStationCode: 'LKO',
    departureTime: '06:10',
    arrivalTime: '12:40',
    duration: '06h 30m',
    runsOn: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    classes: ['CC', 'EC'],
    tatkalAllowed: true,
    distanceKm: 512,
    stopsCount: 5
  },
  {
    number: '12626',
    name: 'Kerala Express',
    type: 'Superfast Express',
    fromStationCode: 'NDLS',
    toStationCode: 'TVC',
    departureTime: '20:10',
    arrivalTime: '19:15',
    duration: '47h 05m',
    runsOn: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    classes: ['2A', '3A', '3E', 'SL'],
    tatkalAllowed: true,
    distanceKm: 3036,
    stopsCount: 42
  },
  {
    number: '20817',
    name: 'Bhubaneswar Rajdhani Express',
    type: 'Rajdhani Express',
    fromStationCode: 'HWH',
    toStationCode: 'NDLS',
    departureTime: '07:15',
    arrivalTime: '09:55',
    duration: '26h 40m',
    runsOn: ['Sat'],
    classes: ['1A', '2A', '3A'],
    tatkalAllowed: true,
    distanceKm: 1801,
    stopsCount: 14
  }
];

export const INITIAL_PASSENGERS: Passenger[] = [
  {
    id: 'pass-01',
    fullName: 'Arun Sharma',
    age: 34,
    gender: 'Male',
    berthPreference: 'Lower Berth',
    foodPreference: 'Veg',
    seniorCitizenOpt: false,
    idCardType: 'Aadhaar',
    idCardNumberMasked: 'XXXX-XXXX-8921'
  },
  {
    id: 'pass-02',
    fullName: 'Pooja Sharma',
    age: 31,
    gender: 'Female',
    berthPreference: 'Side Lower',
    foodPreference: 'Veg',
    seniorCitizenOpt: false,
    idCardType: 'PAN Card',
    idCardNumberMasked: 'ABCDE****F'
  },
  {
    id: 'pass-03',
    fullName: 'Dev Sharma',
    age: 7,
    gender: 'Male',
    berthPreference: 'Window Seat',
    foodPreference: 'Veg',
    seniorCitizenOpt: false
  },
  {
    id: 'pass-04',
    fullName: 'Rameshwar Nath Sharma',
    age: 68,
    gender: 'Male',
    berthPreference: 'Lower Berth',
    foodPreference: 'Veg',
    seniorCitizenOpt: true,
    idCardType: 'Aadhaar',
    idCardNumberMasked: 'XXXX-XXXX-4512'
  }
];

export const INITIAL_JOURNEYS: JourneyConfig[] = [
  {
    id: 'journey-a',
    title: 'Journey A',
    sourceStation: STATIONS[1], // HWH (Kolkata)
    destinationStation: STATIONS[0], // NDLS (Delhi)
    journeyDate: getTomorrowDateString(1),
    quota: 'TATKAL',
    selectedTrainNumber: '12301',
    selectedClass: '3A',
    selectedPassengerIds: ['pass-01', 'pass-02'],
    notes: 'Kolkata to Delhi via Howrah Rajdhani AC 3-Tier',
    lastUpdated: 'Today at 09:15 AM'
  },
  {
    id: 'journey-b',
    title: 'Journey B',
    sourceStation: STATIONS[0], // NDLS (Delhi)
    destinationStation: STATIONS[2], // BSB (Varanasi)
    journeyDate: getTomorrowDateString(2),
    quota: 'TATKAL',
    selectedTrainNumber: '22436',
    selectedClass: 'CC',
    selectedPassengerIds: ['pass-01'],
    notes: 'Delhi to Varanasi via Vande Bharat Express Chair Car',
    lastUpdated: 'Today at 09:40 AM'
  }
];

export const MOCK_PNR_DATABASE: PnrRecord[] = [
  {
    pnrNumber: '2458910234',
    trainNumber: '12301',
    trainName: 'Howrah Rajdhani Express',
    fromStationCode: 'HWH',
    fromStationName: 'Howrah Junction',
    toStationCode: 'NDLS',
    toStationName: 'New Delhi',
    journeyDate: '28-Oct-2026',
    boardingDate: '28-Oct-2026',
    travelClass: '3A',
    quota: 'TATKAL',
    chartStatus: 'Chart Not Prepared',
    remarks: 'Booking confirmed under Tatkal quota. Final chart prepares ~4 hours before scheduled departure.',
    isDemoData: true,
    passengers: [
      {
        passengerIndex: 1,
        bookingStatus: 'CNF',
        currentStatus: 'CNF B3-24 (Lower)',
        berth: '24 (Lower)',
        coach: 'B3',
        statusType: 'CNF'
      },
      {
        passengerIndex: 2,
        bookingStatus: 'CNF',
        currentStatus: 'CNF B3-25 (Middle)',
        berth: '25 (Middle)',
        coach: 'B3',
        statusType: 'CNF'
      }
    ]
  },
  {
    pnrNumber: '6124589021',
    trainNumber: '22436',
    trainName: 'Vande Bharat Express',
    fromStationCode: 'NDLS',
    fromStationName: 'New Delhi',
    toStationCode: 'BSB',
    toStationName: 'Varanasi Junction',
    journeyDate: '29-Oct-2026',
    boardingDate: '29-Oct-2026',
    travelClass: 'CC',
    quota: 'GENERAL',
    chartStatus: 'Chart Not Prepared',
    remarks: 'RAC passengers are guaranteed boarding with shared seat.',
    isDemoData: true,
    passengers: [
      {
        passengerIndex: 1,
        bookingStatus: 'WL 4',
        currentStatus: 'RAC 1',
        berth: 'Seat 45 (Shared)',
        coach: 'C5',
        statusType: 'RAC'
      }
    ]
  },
  {
    pnrNumber: '4389102847',
    trainNumber: '12560',
    trainName: 'Shiv Ganga Express',
    fromStationCode: 'NDLS',
    fromStationName: 'New Delhi',
    toStationCode: 'BSB',
    toStationName: 'Varanasi Junction',
    journeyDate: '26-Oct-2026',
    boardingDate: '26-Oct-2026',
    travelClass: 'SL',
    quota: 'TATKAL',
    chartStatus: 'Chart Prepared',
    remarks: 'Chart finalised. Coach S4 has been assigned.',
    isDemoData: true,
    passengers: [
      {
        passengerIndex: 1,
        bookingStatus: 'CNF',
        currentStatus: 'CNF S4-18 (Side Lower)',
        berth: '18 (Side Lower)',
        coach: 'S4',
        statusType: 'CNF'
      }
    ]
  }
];

export function getTomorrowDateString(daysAhead: number = 1): string {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      return d.toLocaleDateString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    }
  } catch {
    // fallback
  }
  return dateStr;
}
