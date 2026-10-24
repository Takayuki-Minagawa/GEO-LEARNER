// localStorage can be unavailable (private mode, blocked site data), so every access is guarded.
export function readStorage(key, fallback = null) {
  try {
    const value = window.localStorage.getItem(key);
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

export function writeStorage(key, value) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Preferences simply won't persist.
  }
}

export function readStoredList(key) {
  try {
    const parsed = JSON.parse(readStorage(key, '[]'));
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === 'string') : [];
  } catch {
    return [];
  }
}
