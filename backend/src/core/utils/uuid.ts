import { randomUUID } from "node:crypto";

/**
 *  generate a random code
 * @returns returns a short uuid v4 that it contains 25 characters without "-"
 * @example - this: 76a3f066-b53e-4e40-94a4-78be682f2110 to this: 76a3f066b53e4e4094a478be6
 */

export function generateUniqueCode() {
  return randomUUID().replace(/-/g, "").substring(0, 25);
}
