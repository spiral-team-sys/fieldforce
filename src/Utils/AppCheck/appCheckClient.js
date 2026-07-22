// appCheckClient.js
import { initializeAppCheck } from '@react-native-firebase/app-check';
import { getApp } from '@react-native-firebase/app';
import { ReactNativeFirebaseAppCheckProvider } from '@react-native-firebase/app-check';

const DEBUG_TOKEN = __DEV__ ? '420EA3BC-17DB-4612-8F32-56C2415FCF40' : null;

export function initAppCheck() {
    const provider = new ReactNativeFirebaseAppCheckProvider();
    if (__DEV__ && DEBUG_TOKEN) {
        provider.configure({
            android: { provider: 'debug', debugToken: DEBUG_TOKEN },
            apple: { provider: 'debug', debugToken: DEBUG_TOKEN },
        });
    } else {
        // Real providers
        provider.configure({
            android: { provider: 'playIntegrity' },
            apple: { provider: 'appAttestWithDeviceCheckFallback' },
        });
    }

    initializeAppCheck(getApp(), {
        provider,
        isTokenAutoRefreshEnabled: true,
    });
}

export async function fetchAppCheckToken({ forceRefresh = false, retries = 3 } = {}) {
    const appCheck = require('@react-native-firebase/app-check').default();
    let attempt = 0;
    let backoffMs = 500;

    while (attempt < retries) {
        try {
            const tokenResponse = await appCheck.getToken(forceRefresh);
            return tokenResponse?.token ?? null;
        } catch (err) {
            const msg = err?.message || String(err);
            if (msg.includes('Too many attempts') || msg.includes('app attestation failed')) {
                attempt++;
                await new Promise((res) => setTimeout(res, backoffMs));
                backoffMs *= 2;
                continue;
            }
            throw err;
        }
    }
    throw new Error('Failed to get AppCheck token after retries');
}

export async function sendToBackend(url, body = {}) {
    const token = await fetchAppCheckToken({ forceRefresh: true });
    if (!token) throw new Error('No AppCheck token available');

    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Firebase-AppCheck': token,
        },
        body: JSON.stringify(body),
    });
    return res;
}
