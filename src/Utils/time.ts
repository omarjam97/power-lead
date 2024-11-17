import TIMEZONE from "../Config/timezone";

class Time {
  /**
   * Get current time in ISO format
   * @returns {string} Current time in ISO format
   */
  static getCurrentTime() {
    return new Date().getTime();
  }

  /**
   * Parse GMT/UTC date string to ISO format
   * If the string doesn't end with Z, adds it to ensure UTC
   * @param {string} dateString - Date string in format "YYYY-MM-DDTHH:mm:ss" or "YYYY-MM-DDTHH:mm:ss.sssZ"
   * @returns {string} Date string in ISO format
   */
  static parseGMTtoUTC(dateString) {
    // If dateString doesn't end with Z, add it
    const normalizedDate = dateString.endsWith("Z")
      ? dateString
      : dateString + "Z";
    return new Date(normalizedDate).getTime();
  }

  /**
   * Convert UTC time to specified timezone and return ISO string
   * @param {Date|string} date - Date object or UTC date string
   * @param {string} targetTimezone - Target timezone (e.g., 'America/New_York')
   * @returns {string} Date in ISO format
   */
  static convertUTCToTimezone(date, targetTimezone = TIMEZONE) {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    // Create a date in target timezone
    const targetDate = new Date(
      dateObj.toLocaleString("en-US", { timeZone: targetTimezone })
    );
    return targetDate.toISOString();
  }

  /**
   * Convert time from a specific timezone to UTC
   * @param {string} dateString - Date string
   * @param {string} sourceTimezone - Source timezone (e.g., 'America/New_York')
   * @returns {string} UTC date in ISO format
   */
  static convertToUTC(dateString, sourceTimezone = TIMEZONE) {
    // Create a formatter for the source timezone
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: sourceTimezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

    // Parse the input date
    const sourceDate = new Date(dateString);

    // Get the parts in source timezone
    const parts = formatter.formatToParts(sourceDate);
    const dateParts: Record<
      | "year"
      | "month"
      | "day"
      | "hour"
      | "minute"
      | "second"
      | "dayPeriod"
      | "era"
      | "timeZoneName"
      | "weekday"
      | "unknown",
      any
    > = {
      year: null,
      month: null,
      day: null,
      hour: null,
      minute: null,
      second: null,
      dayPeriod: null,
      era: null,
      timeZoneName: null,
      weekday: null,
      unknown: null,
    };

    // Convert formatter parts to an object
    parts.forEach((part) => {
      if (part.type !== "literal") {
        dateParts[part.type] = parseInt(part.value);
      }
    });

    // Create UTC date with the same time components
    const utcDate = new Date(
      Date.UTC(
        dateParts.year,
        dateParts.month - 1, // Month is 0-based
        dateParts.day,
        dateParts.hour,
        dateParts.minute,
        dateParts.second
      )
    );

    return utcDate.toISOString();
  }

  /**
   * Add time to a date
   * @param {Date|string} date - Base date
   * @param {number} amount - Amount to add
   * @param {string} unit - Unit ('hours'|'days'|'minutes'|'seconds'|'milliseconds')
   * @returns {string} New date in ISO format
   */
  static addTime(date, amount, unit = "hours") {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    const newDate = new Date(dateObj);

    switch (unit.toLowerCase()) {
      case "hours":
        newDate.setUTCHours(dateObj.getUTCHours() + amount);
        break;
      case "days":
        newDate.setUTCDate(dateObj.getUTCDate() + amount);
        break;
      case "minutes":
        newDate.setUTCMinutes(dateObj.getUTCMinutes() + amount);
        break;
      case "seconds":
        newDate.setUTCSeconds(dateObj.getUTCSeconds() + amount);
        break;
      case "milliseconds":
        newDate.setUTCMilliseconds(dateObj.getUTCMilliseconds() + amount);
        break;
    }
    return newDate.toISOString();
  }

  /**
   * Compare two dates
   * @param {Date|string} date1 - First date
   * @param {Date|string} date2 - Second date
   * @returns {number} -1 if date1 < date2, 0 if equal, 1 if date1 > date2
   */
  static compareDates(date1, date2) {
    const d1 = typeof date1 === "string" ? new Date(date1) : date1;
    const d2 = typeof date2 === "string" ? new Date(date2) : date2;

    return Math.sign(d1.getTime() - d2.getTime());
  }

  /**
   * Check if a date is between two other dates
   * @param {Date|string} date - Date to check
   * @param {Date|string} startDate - Start date
   * @param {Date|string} endDate - End date
   * @returns {boolean} True if date is between start and end dates
   */
  static isBetween(date, startDate, endDate) {
    const d = typeof date === "string" ? new Date(date) : date;
    const start =
      typeof startDate === "string" ? new Date(startDate) : startDate;
    const end = typeof endDate === "string" ? new Date(endDate) : endDate;

    return d >= start && d <= end;
  }

  /**
   * Get the difference between two dates in specified unit
   * @param {Date|string} date1 - First date
   * @param {Date|string} date2 - Second date
   * @param {string} unit - Unit ('hours'|'days'|'minutes'|'seconds'|'milliseconds')
   * @returns {number} Difference in specified unit
   */
  static getDifference(date1, date2, unit = "milliseconds") {
    const d1 = typeof date1 === "string" ? new Date(date1) : date1;
    const d2 = typeof date2 === "string" ? new Date(date2) : date2;

    const diffMs = Math.abs(d2.getTime() - d1.getTime());

    switch (unit.toLowerCase()) {
      case "hours":
        return diffMs / (1000 * 60 * 60);
      case "days":
        return diffMs / (1000 * 60 * 60 * 24);
      case "minutes":
        return diffMs / (1000 * 60);
      case "seconds":
        return diffMs / 1000;
      case "milliseconds":
      default:
        return diffMs;
    }
  }

  /**
   * Validate if a string is in ISO format
   * @param {string} dateString - Date string to validate
   * @returns {boolean} True if string is valid ISO format
   */
  static isValidISOString(dateString) {
    try {
      const date = new Date(dateString);
      return date.toISOString() === dateString;
    } catch (e) {
      return false;
    }
  }
  
}

export default Time;
