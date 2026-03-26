/**
 * Text Sanitization Utilities
 *
 * Removes invisible / zero-width Unicode characters that cause rendering
 * issues in PDFKit (displayed as ☒ boxes) while preserving all visible
 * characters including CJK, accented Latin, symbols (®, ™, ©), and
 * standard punctuation.
 *
 * Targeted character categories:
 *  - Zero-width spaces & joiners: U+200B – U+200D, U+FEFF (BOM)
 *  - Directional formatting:      U+200E – U+200F, U+202A – U+202E, U+2066 – U+2069
 *  - Word joiner / invisible:     U+2060, U+2061 – U+2064
 *  - Soft hyphen:                 U+00AD
 *  - Variation selectors:         U+FE00 – U+FE0F
 *  - Interlinear annotation:      U+FFF9 – U+FFFB
 *  - Object replacement char:     U+FFFC
 *  - Replacement character:       U+FFFD
 *  - C0/C1 control characters except \t \n \r
 */

// Single regex covering all invisible / problematic characters
const INVISIBLE_CHARS_RE =
  // eslint-disable-next-line no-control-regex
  /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F\u00AD\u200B-\u200F\u2028\u2029\u202A-\u202E\u2060-\u2064\u2066-\u2069\uFE00-\uFE0F\uFEFF\uFFF9-\uFFFD]/g;

/**
 * Remove invisible Unicode characters from a string and trim whitespace.
 *
 * Safe for all visible scripts (Latin, CJK, Arabic, Cyrillic, etc.).
 * Returns the original value unchanged if it is not a string.
 */
export function sanitizeText(text: string): string {
  return text.replace(INVISIBLE_CHARS_RE, "").trim();
}

/**
 * Sanitize all string-valued fields in a flat object.
 *
 * Non-string values and `null`/`undefined` are passed through unchanged.
 * Useful for cleaning an entire input payload before persisting to DB.
 *
 * @example
 *   sanitizeTextFields({ companyName: "Foo\u200B", count: 3 })
 *   // => { companyName: "Foo", count: 3 }
 */
export function sanitizeTextFields<T extends Record<string, unknown>>(obj: T): T {
  const result = { ...obj };
  for (const key of Object.keys(result)) {
    const val = result[key];
    if (typeof val === "string") {
      (result as any)[key] = sanitizeText(val);
    }
  }
  return result;
}
