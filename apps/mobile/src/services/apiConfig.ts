import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * Dynamically resolves the FastAPI backend host URL.
 * Automatically identifies Metro host LAN IP when running on physical mobile devices or simulators.
 */
export const getMobileBackendUrl = (): string => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // Running on Web Browser on PC
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.location?.hostname && window.location.hostname !== 'localhost') {
      return `http://${window.location.hostname}:8000`;
    }
    return 'http://localhost:8000';
  }

  // Running on Mobile Device (Expo Go / Physical Phone / Emulator)
  // Constants.expoConfig?.hostUri or debuggerHost holds "<pc_lan_ip>:<metro_port>" e.g. "192.168.0.101:8081"
  const hostUri =
    Constants.expoConfig?.hostUri ||
    (Constants as any).manifest?.debuggerHost ||
    (Constants as any).manifest2?.extra?.expoGo?.debuggerHost;

  if (hostUri) {
    const hostIp = hostUri.split(':')[0];
    if (hostIp) {
      return `http://${hostIp}:8000`;
    }
  }

  // Fallback to LAN IP
  return 'http://192.168.0.101:8000';
};

/**
 * Returns WebSocket URL for real-time telemetry and dispatch broadcasts.
 */
export const getMobileWsUrl = (): string => {
  return getMobileBackendUrl().replace(/^http/, 'ws');
};
