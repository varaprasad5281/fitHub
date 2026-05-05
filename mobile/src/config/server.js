/**
 * Server configuration for the mobile app.
 *
 * In development:
 *   - iOS Simulator:        use 'http://localhost:3001'
 *   - Android Emulator:     use 'http://10.0.2.2:3001'
 *   - Physical device:      use your computer's local network IP, e.g. 'http://192.168.1.100:3001'
 *
 * In production:
 *   - Set PRODUCTION_API_URL to your deployed server URL.
 */

import Constants from 'expo-constants';

const IS_DEV = __DEV__;

// ── Update this to your computer's local IP when testing on a physical device ──
const DEV_API_URL = 'http://10.0.2.2:3001'; // Android emulator → host machine

// ── Update this to your deployed server URL before building for production ──
const PRODUCTION_API_URL = 'https://your-production-server.com';

export const API_BASE_URL = IS_DEV ? DEV_API_URL : PRODUCTION_API_URL;
export const API_URL = `${API_BASE_URL}/api`;
