import React from 'react';
import { Languages } from 'lucide-react';

const LANGUAGES = [
  { code: 'auto', label: 'Auto Detect' },
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिन्दी (Hindi)' },
  { code: 'ta', label: 'தமிழ் (Tamil)' }
];

export default function LanguageSelector({ currentLanguage = 'en', onSelectLanguage, disabled = false }) {
  return (
    <div className="relative inline-flex items-center">
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300">
        <Languages className="w-3.5 h-3.5 text-teal-600" />
        <select
          value={currentLanguage}
          onChange={(e) => onSelectLanguage(e.target.value)}
          disabled={disabled}
          aria-label="Select conversation language"
          className="bg-transparent font-medium cursor-pointer focus:outline-none"
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
              {lang.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
