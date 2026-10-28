import { TravelClass, QuotaType, JourneyConfig, Passenger, ReadinessCheckItem } from '../types';

export const AC_CLASSES: TravelClass[] = ['1A', '2A', '3A', '3E', 'CC', 'EC'];
export const NON_AC_CLASSES: TravelClass[] = ['SL', '2S'];

export interface TatkalTimingStatus {
  targetWindowTime: string; // e.g. "10:00:00 AM IST (AC Classes)"
  windowClassType: 'AC' | 'NON_AC';
  opensAtHour: number;
  opensAtMinute: number;
  isWindowActive: boolean; // active during the 15 min priority rush
  isBeforeWindow: boolean;
  isPastWindow: boolean;
  secondsRemaining: number;
  formattedCountdown: string;
  urgencyState: 'normal' | 'preparation' | 'alert_imminent' | 'rush_active' | 'completed';
}

export function isAcClass(travelClass: TravelClass): boolean {
  return AC_CLASSES.includes(travelClass);
}

/**
 * Accurately calculate Indian Standard Time (IST: UTC+5:30)
 */
export function getCurrentIstDate(): Date {
  const now = new Date();
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utcMs + 5.5 * 3600000);
}

export function formatIstTime(istDate: Date): string {
  const h = String(istDate.getHours()).padStart(2, '0');
  const m = String(istDate.getMinutes()).padStart(2, '0');
  const s = String(istDate.getSeconds()).padStart(2, '0');
  return `${h}:${m}:${s} IST`;
}

/**
 * Compute the Tatkal countdown and window status for a given class
 */
export function getTatkalWindowStatus(travelClass: TravelClass = '3A'): TatkalTimingStatus {
  const istNow = getCurrentIstDate();
  const isAc = isAcClass(travelClass);
  const targetHour = isAc ? 10 : 11;
  const targetMinute = 0;

  // Build target Date in IST for today
  const targetToday = new Date(istNow);
  targetToday.setHours(targetHour, targetMinute, 0, 0);

  const diffMs = targetToday.getTime() - istNow.getTime();
  const totalSeconds = Math.floor(diffMs / 1000);

  const windowClassType = isAc ? 'AC' : 'NON_AC';
  const targetWindowTime = `${targetHour}:00:00 AM IST (${windowClassType} Classes)`;

  if (totalSeconds > 0) {
    // Before window
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    const formattedCountdown = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;

    let urgencyState: TatkalTimingStatus['urgencyState'] = 'normal';
    if (totalSeconds <= 120) {
      urgencyState = 'alert_imminent'; // Under 2 minutes!
    } else if (totalSeconds <= 900) {
      urgencyState = 'preparation'; // Under 15 minutes
    }

    return {
      targetWindowTime,
      windowClassType,
      opensAtHour: targetHour,
      opensAtMinute: targetMinute,
      isWindowActive: false,
      isBeforeWindow: true,
      isPastWindow: false,
      secondsRemaining: totalSeconds,
      formattedCountdown,
      urgencyState
    };
  } else {
    // Window passed or is currently active
    const elapsedSeconds = Math.abs(totalSeconds);
    // Rush window is the first 15 minutes (10:00 - 10:15 / 11:00 - 11:15) where agents are restricted
    if (elapsedSeconds <= 900) {
      const remainingRush = 900 - elapsedSeconds;
      const m = Math.floor(remainingRush / 60);
      const s = remainingRush % 60;
      return {
        targetWindowTime,
        windowClassType,
        opensAtHour: targetHour,
        opensAtMinute: targetMinute,
        isWindowActive: true,
        isBeforeWindow: false,
        isPastWindow: false,
        secondsRemaining: remainingRush,
        formattedCountdown: `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`,
        urgencyState: 'rush_active'
      };
    } else {
      return {
        targetWindowTime,
        windowClassType,
        opensAtHour: targetHour,
        opensAtMinute: targetMinute,
        isWindowActive: false,
        isBeforeWindow: false,
        isPastWindow: true,
        secondsRemaining: 0,
        formattedCountdown: '00:00:00',
        urgencyState: 'completed'
      };
    }
  }
}

/**
 * Verify readiness of a journey configuration against IRCTC legitimate guidelines
 */
export function evaluateJourneyReadiness(
  journey: JourneyConfig,
  allPassengers: Passenger[]
): {
  isFullyReady: boolean;
  scorePercent: number;
  checks: ReadinessCheckItem[];
} {
  const selectedPassengers = allPassengers.filter(p => journey.selectedPassengerIds.includes(p.id));
  const checks: ReadinessCheckItem[] = [];

  // Check 1: Route selected
  const hasRoute = Boolean(journey.sourceStation?.code && journey.destinationStation?.code && journey.sourceStation.code !== journey.destinationStation.code);
  checks.push({
    id: 'route_valid',
    title: 'Origin & Destination Stations',
    description: hasRoute 
      ? `${journey.sourceStation.code} (${journey.sourceStation.city}) → ${journey.destinationStation.code} (${journey.destinationStation.city})`
      : 'Select valid distinct origin and destination stations.',
    category: 'journey',
    isPassed: hasRoute,
    severity: 'error',
    recommendation: hasRoute ? undefined : 'Choose both source and destination stations'
  });

  // Check 2: Date specified
  const hasDate = Boolean(journey.journeyDate);
  checks.push({
    id: 'date_valid',
    title: 'Journey Date Configured',
    description: hasDate ? `Date: ${journey.journeyDate}` : 'Select target journey date.',
    category: 'journey',
    isPassed: hasDate,
    severity: 'error',
    recommendation: hasDate ? undefined : 'Specify the departure date'
  });

  // Check 3: Train & Class
  const hasTrain = Boolean(journey.selectedTrainNumber && journey.selectedClass);
  checks.push({
    id: 'train_class_valid',
    title: 'Train & Travel Class',
    description: hasTrain 
      ? `Train #${journey.selectedTrainNumber} · Class: ${journey.selectedClass}`
      : 'Select train number and desired coach class.',
    category: 'journey',
    isPassed: hasTrain,
    severity: 'error',
    recommendation: hasTrain ? undefined : 'Select preferred train and travel class'
  });

  // Check 4: Passenger Count for Quota
  const passengerCount = selectedPassengers.length;
  const isTatkal = journey.quota === 'TATKAL' || journey.quota === 'PREMIUM_TATKAL';
  const isPassengerCountOk = isTatkal 
    ? passengerCount >= 1 && passengerCount <= 4
    : passengerCount >= 1 && passengerCount <= 6;

  checks.push({
    id: 'passenger_count_valid',
    title: isTatkal ? 'Tatkal Passenger Quota Limit' : 'Passenger Count',
    description: isPassengerCountOk
      ? `${passengerCount} passenger${passengerCount > 1 ? 's' : ''} assigned (${isTatkal ? 'Max 4 allowed in Tatkal' : 'Max 6 in General'})`
      : isTatkal
        ? passengerCount === 0 ? 'At least 1 passenger required.' : `Tatkal allows maximum 4 passengers per PNR. Selected: ${passengerCount}.`
        : 'Select between 1 and 6 passengers.',
    category: 'passenger',
    isPassed: isPassengerCountOk,
    severity: 'error',
    recommendation: isPassengerCountOk ? undefined : 'Adjust passenger count within official railway quota limits'
  });

  // Check 5: Passenger Profiles complete
  const allPassengerDetailsComplete = selectedPassengers.length > 0 && selectedPassengers.every(p => {
    return p.fullName.trim().length >= 3 && p.age > 0 && p.gender;
  });

  checks.push({
    id: 'passenger_details_complete',
    title: 'Passenger Master Profile Verification',
    description: allPassengerDetailsComplete
      ? 'All passenger names, ages, and genders are verified.'
      : 'Some selected passengers have incomplete names or missing details.',
    category: 'passenger',
    isPassed: allPassengerDetailsComplete,
    severity: 'warning',
    recommendation: allPassengerDetailsComplete ? undefined : 'Review passenger names and ages in the Master List'
  });

  // Check 6: Senior citizen concession warning for Tatkal
  const hasSeniorOptInTatkal = isTatkal && selectedPassengers.some(p => p.seniorCitizenOpt);
  checks.push({
    id: 'senior_concession_check',
    title: 'Concession Eligibility Verification',
    description: hasSeniorOptInTatkal
      ? 'Note: Indian Railways does not permit Senior Citizen concessions under Tatkal/Premium Tatkal quota.'
      : 'No conflicting quota concession applied.',
    category: 'passenger',
    isPassed: !hasSeniorOptInTatkal,
    severity: 'info',
    recommendation: hasSeniorOptInTatkal ? 'Senior citizen concessions will be ignored by IRCTC in Tatkal quota' : undefined
  });

  // Check 7: Quota Timing Readiness
  const isAc = isAcClass(journey.selectedClass);
  const timingWindowDesc = isAc
    ? 'AC Tatkal opens at 10:00:00 AM IST (1 day prior)'
    : 'Non-AC Tatkal opens at 11:00:00 AM IST (1 day prior)';

  checks.push({
    id: 'timing_sync_check',
    title: 'Booking Window Timing',
    description: timingWindowDesc,
    category: 'timing',
    isPassed: true,
    severity: 'info'
  });

  const passedCount = checks.filter(c => c.isPassed).length;
  const scorePercent = Math.round((passedCount / checks.length) * 100);
  const isFullyReady = checks.filter(c => c.severity === 'error').every(c => c.isPassed);

  return {
    isFullyReady,
    scorePercent,
    checks
  };
}
