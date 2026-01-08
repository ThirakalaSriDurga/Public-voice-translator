
import React from 'react';
import { KioskLocation } from './types';

export const CURRENT_KIOSK: KioskLocation = {
  id: 'NDLS-001',
  name: 'New Delhi Railway Station',
  type: 'Station',
  lat: 28.6415,
  lng: 77.2197
};

export const LANGUAGES = [
  { code: 'en-IN', name: 'Indian English' },
  { code: 'hi-IN', name: 'हिन्दी (Hindi)' },
  { code: 'bn-IN', name: 'বাংলা (Bengali)' },
  { code: 'te-IN', name: 'తెలుగు (Telugu)' },
  { code: 'mr-IN', name: 'मराठी (Marathi)' },
  { code: 'ta-IN', name: 'தமிழ் (Tamil)' },
  { code: 'gu-IN', name: 'ગુજરાતી (Gujarati)' },
  { code: 'kn-IN', name: 'ಕನ್ನಡ (Kannada)' },
  { code: 'ml-IN', name: 'മലയാളം (Malayalam)' },
  { code: 'pa-IN', name: 'ਪੰਜਾਬੀ (Punjabi)' }
];

export const SYSTEM_INSTRUCTION = `
You are a Public Voice Translator Kiosk located at ${CURRENT_KIOSK.name} in India.
Your primary goal is to help visitors, migrants, and travelers.

Rules:
1. Detect the user's language and intent.
2. If intent is EMERGENCY, provide info for Medical (108) or Police (100).
3. Always translate accurately between the source and target languages.
4. If in Kiosk Mode, respond to the user in their selected language.
5. If in Translator Mode, strictly translate the speaker's input into the target language.
6. Use Indian English and common Indian terms where appropriate.
`;
