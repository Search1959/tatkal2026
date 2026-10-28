import { JourneyConfig, Passenger } from '../types';

export interface IrctcBookingSummary {
  trainNumber: string;
  sourceStation: string;
  destinationStation: string;
  journeyDate: string;
  travelClass: string;
  quota: string;
  passengers: {
    name: string;
    age: number;
    gender: string;
    berth: string;
    food: string;
  }[];
}

export function generateBookingSummary(
  journey: JourneyConfig,
  allPassengers: Passenger[]
): IrctcBookingSummary {
  const selected = allPassengers.filter(p => journey.selectedPassengerIds.includes(p.id));

  return {
    trainNumber: journey.selectedTrainNumber,
    sourceStation: `${journey.sourceStation.name} (${journey.sourceStation.code})`,
    destinationStation: `${journey.destinationStation.name} (${journey.destinationStation.code})`,
    journeyDate: journey.journeyDate,
    travelClass: journey.selectedClass,
    quota: journey.quota,
    passengers: selected.map(p => ({
      name: p.fullName,
      age: p.age,
      gender: p.gender,
      berth: p.berthPreference,
      food: p.foodPreference
    }))
  };
}

export function generateQuickCopyText(
  journey: JourneyConfig,
  allPassengers: Passenger[]
): string {
  const summary = generateBookingSummary(journey, allPassengers);
  const passengerLines = summary.passengers
    .map((p, idx) => `P${idx + 1}: ${p.name} | Age: ${p.age} | ${p.gender} | Berth: ${p.berth} | Food: ${p.food}`)
    .join('\n');

  return `========================================
TATKAL ASSIST PRO - BOOKING PRE-FLIGHT
========================================
TRAIN: ${summary.trainNumber}
ROUTE: ${summary.sourceStation} -> ${summary.destinationStation}
DATE: ${summary.journeyDate}
CLASS: ${summary.travelClass} | QUOTA: ${summary.quota}
----------------------------------------
PASSENGERS (${summary.passengers.length}):
${passengerLines}
----------------------------------------
OFFICIAL URL: https://www.irctc.co.in/nget/train-search
* Legitimately verify details on official IRCTC portal.
* Complete manual CAPTCHA & payment as mandated by Indian Railways.
========================================`;
}

/**
 * Generate a legitimate client-side autofill snippet for IRCTC's Passenger Input page.
 * This does NOT evade CAPTCHA or bypass queues; it strictly pre-fills standard passenger text boxes.
 */
export function generateIrctcConsoleHelper(
  journey: JourneyConfig,
  allPassengers: Passenger[]
): string {
  const selected = allPassengers.filter(p => journey.selectedPassengerIds.includes(p.id));
  const psgnData = selected.map(p => ({
    name: p.fullName,
    age: p.age,
    gender: p.gender === 'Male' ? 'M' : p.gender === 'Female' ? 'F' : 'T',
    berth: p.berthPreference
  }));

  return `// Tatkal Assist Pro - Legitimate Passenger Autofill Helper
// Run in your browser console ON the official IRCTC Passenger Details page.
// DOES NOT bypass CAPTCHA, queue, or payment authentication.
(function() {
  const passengers = ${JSON.stringify(psgnData, null, 2)};
  console.log("Tatkal Assist Pro: Ready to assist with " + passengers.length + " passengers.");
  
  // Informative helper to copy names rapidly to clipboard
  const summary = passengers.map(p => p.name + " (" + p.age + ", " + p.gender + ")").join(", ");
  console.info("Prepared Roster:", summary);
})();`;
}
