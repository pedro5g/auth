type Duration = {
  years?: number;
  months?: number;
  days?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
  milliseconds?: number;
};
/**
 * increment time or days in date object
 *
 * @param date - base date
 * @param duration - config object, containing the date field that should being add the value
 * @returns  returns date with increase time or days
 */

export function add(date: Date, duration: Duration): Date {
  const result = new Date(date);

  if (duration.years) {
    result.setFullYear(result.getFullYear() + duration.years);
  }
  if (duration.months) {
    result.setMonth(result.getMonth() + duration.months);
  }
  if (duration.days) {
    result.setDate(result.getDate() + duration.days);
  }
  if (duration.hours) {
    result.setHours(result.getHours() + duration.hours);
  }
  if (duration.minutes) {
    result.setMinutes(result.getMinutes() + duration.minutes);
  }
  if (duration.seconds) {
    result.setSeconds(result.getSeconds() + duration.seconds);
  }
  if (duration.milliseconds) {
    result.setMilliseconds(result.getMilliseconds() + duration.milliseconds);
  }

  return result;
}

/**
 * @returns returns a Date that contains the value thirty days after today
 */

export function thirtyDaysFromNow(): Date {
  return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
}

/**
 * @param  minutes Number
 * @returns returns a Date contain the current minutes sum with the minutes quantity passed by params
 */

export function minutesFromNow(minutes: number = 45): Date {
  const now = new Date();

  return add(now, { minutes });
}

/**
 * utility function to decrease minutes to current date
 *
 * @param   minutes Number
 * @returns returns a Date contain the current minutes decrease with the minutes quantity passed by params
 */

export function minutesAgo(minutes: number = 3): Date {
  const now = new Date();

  return add(now, { minutes: -minutes });
}

/**
 *
 * @param expiresIn - receives JWT expiresIn text format ("15m", "1h", or "2d")
 * @returns returns a Date matching expiresIn value
 */
export function calculateExpirationDate(expiresIn: string): Date {
  // Match number + unit (m = minutes, h = hours, d = days)
  const match = expiresIn.match(/^(\d+)([mhd])$/);
  if (!match) throw new Error('Invalid format. Use "15m", "1h", or "2d".');
  const [, value, unit] = match;
  const expirationDate = new Date();

  // Check the unit and apply accordingly
  switch (unit) {
    case "m": // minutes
      return add(expirationDate, { minutes: parseInt(value) });
    case "h": // hours
      return add(expirationDate, { hours: parseInt(value) });
    case "d": // days
      return add(expirationDate, { days: parseInt(value) });
    default:
      throw new Error('Invalid unit. Use "m", "h", or "d".');
  }
}

/**
 *
 * @returns returns a Date contains an hour starting to current time
 */
export function anHourFromNow() {
  const now = new Date();
  return add(now, { hours: 1 });
}

/** contains value of one day in milliseconds */
export const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;
