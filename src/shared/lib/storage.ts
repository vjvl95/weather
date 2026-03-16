import AsyncStorage from '@react-native-async-storage/async-storage';

let saveQueue: Promise<void> = Promise.resolve();

/**
 * Persist queue to prevent race conditions during storage writes.
 */
export const enqueueSave = (key: string, data: any) => {
  saveQueue = saveQueue.then(async () => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error(`Failed to save to storage [${key}]:`, e);
    }
  });
};
