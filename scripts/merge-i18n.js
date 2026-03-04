
const fs = require('fs');
const path = require('path');

const libPath = path.join(__dirname, '../client/src/lib/i18n.ts');
const contextPath = path.join(__dirname, '../client/src/contexts/i18n.tsx');

// Helper to extract translation object
function extractTranslations(content) {
  // Find the start of the translations object
  const startMatch = content.match(/const translations:.*= {/);
  if (!startMatch) {
    throw new Error('Could not find translations start');
  }
  
  const startIndex = startMatch.index + startMatch[0].length - 1; // point to {
  
  // Simple brace matching to find the end
  let openBraces = 0;
  let endIndex = -1;
  
  for (let i = startIndex; i < content.length; i++) {
    if (content[i] === '{') openBraces++;
    if (content[i] === '}') openBraces--;
    
    if (openBraces === 0) {
      endIndex = i + 1;
      break;
    }
  }
  
  if (endIndex === -1) {
    throw new Error('Could not find translations end');
  }
  
  const objectStr = content.substring(startIndex, endIndex);
  
  // Use eval to parse the object (be careful in production, but okay for migration script)
  // We need to wrap it in parentheses to make it an expression
  try {
    return eval('(' + objectStr + ')');
  } catch (e) {
    console.error('Failed to parse translations object:', e);
    // Fallback: try to fix common issues like comments
    const cleanStr = objectStr
      .replace(/\/\/.*$/gm, '') // Remove single line comments
      .replace(/\/\*[\s\S]*?\*\//g, ''); // Remove block comments
    return eval('(' + cleanStr + ')');
  }
}

try {
  console.log('Reading files...');
  const libContent = fs.readFileSync(libPath, 'utf8');
  const contextContent = fs.readFileSync(contextPath, 'utf8');
  
  console.log('Extracting translations...');
  const libTranslations = extractTranslations(libContent);
  const contextTranslations = extractTranslations(contextContent);
  
  console.log(`Lib keys (en): ${Object.keys(libTranslations.en).length}`);
  console.log(`Context keys (en): ${Object.keys(contextTranslations.en).length}`);
  
  // Merge: Context translations overwrite Lib translations (assuming Context has more Admin stuff)
  // BUT: Lib has Portal specific stuff.
  // Strategy: Merge Context INTO Lib, but prefer Lib for existing keys if conflict?
  // Actually, Context seems to have "Portal" keys too but maybe older?
  // User said: "@lib/i18n (Portal) ... @contexts/i18n (Admin)"
  // So we should keep Lib keys for Portal stuff, and add Context keys for Admin stuff.
  
  const mergedTranslations = {
    en: { ...contextTranslations.en, ...libTranslations.en },
    zh: { ...contextTranslations.zh, ...libTranslations.zh }
  };
  
  // Special case: Ensure nav items from both are preserved if they don't overlap
  // The simple merge above does this. If key exists in both, Lib wins (Portal specific).
  
  console.log(`Merged keys (en): ${Object.keys(mergedTranslations.en).length}`);
  
  // Generate new file content
  const newContent = `/**
 * Unified i18n System (Merged from @/lib/i18n and @/contexts/i18n)
 *
 * Usage:
 *   const { t, locale, setLocale } = useI18n();
 *   t("nav.dashboard") → "Dashboard" | "仪表盘"
 *   t("welcome", { name: "John" }) → "Welcome, John"
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Locale = "en" | "zh";

// ─── Translation Dictionary ─────────────────────────────────────────────────

const translations: Record<Locale, Record<string, string>> = ${JSON.stringify(mergedTranslations, null, 2)};

// ─── Store ──────────────────────────────────────────────────────────────────

interface I18nState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  /**
   * Translate a key with optional parameter substitution
   * @example t("welcome", { name: "John" }) // "Welcome, John"
   */
  t: (key: string, params?: Record<string, string | number>) => string;
}

export const useI18n = create<I18nState>()(
  persist(
    (set, get) => ({
      locale: "en",
      setLocale: (locale) => set({ locale }),
      t: (key, params) => {
        const { locale } = get();
        // Fallback to English if key missing in current locale, then key itself
        let text = translations[locale]?.[key] || translations["en"]?.[key] || key;
        
        if (params) {
          Object.entries(params).forEach(([k, v]) => {
            text = text.replace(new RegExp(\`{\${k}}\`, "g"), String(v));
          });
        }
        
        return text;
      },
    }),
    {
      name: "portal-i18n-storage",
    }
  )
);
`;

  console.log('Writing merged file...');
  fs.writeFileSync(libPath, newContent);
  console.log('Done!');
  
} catch (error) {
  console.error('Error:', error);
  process.exit(1);
}
