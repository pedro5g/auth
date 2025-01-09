import * as bcrypt from "bcrypt";

const SALT_ROUNDS = 12;

/**
 * Hashes a password using bcrypt with a salt.
 *
 * @param password - The plain text password to hash.
 * @returns A promise that resolves to the hashed password.
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
}

/**
 *
 * @param password - The plain text password to be comparar
 * @param hash - The password hashed that be compared
 * @returns A boolean promise
 */

export async function comparPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}
