/**
 * @returns returns a Date that contains the value thirty days after today
 */

export function thirtyDaysFromNow(): Date {
  return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
}
