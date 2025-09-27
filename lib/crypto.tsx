import crypto from "crypto";

// AES Settings
const ALGORITHM = "aes-256-cbc";
const SECRET_KEY = Buffer.from(process.env.SECRET_KEY || "", "hex"); // 32 bytes (256-bit)
const IV_LENGTH = 16; // AES block size

/**
 * Encrypts plain text with AES-256-CBC
 * @param text - The data to encrypt
 * @returns Encrypted string (iv:content format)
 */
export function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, SECRET_KEY, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
}

/**
 * Decrypts AES-256-CBC encrypted string
 * @param encryptedData - Encrypted string (iv:content format)
 * @returns Decrypted text
 */
export function decrypt(encryptedData: string): string {
  const [ivHex, encryptedText] = encryptedData.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const decipher = crypto.createDecipheriv(ALGORITHM, SECRET_KEY, iv);
  let decrypted = decipher.update(encryptedText, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}