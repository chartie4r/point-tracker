import { ref, watch, onMounted } from 'vue';

const STORAGE_KEY = 'pointtracker-theme';

function getStored() {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function setStored(value) {
  try {
    if (value) localStorage.setItem(STORAGE_KEY, value);
    else localStorage.removeItem(STORAGE_KEY);
  } catch {}
}

function applyDark(isDark) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (isDark) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

export function useTheme() {
  const isDark = ref(
    typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
  );

  onMounted(() => {
    const stored = getStored();
    if (stored === 'dark' || stored === 'light') {
      isDark.value = stored === 'dark';
    } else {
      isDark.value = document.documentElement.classList.contains('dark');
    }
    applyDark(isDark.value);
  });

  watch(isDark, (dark) => {
    applyDark(dark);
    setStored(dark ? 'dark' : 'light');
  }, { flush: 'sync' });

  function toggle() {
    isDark.value = !isDark.value;
  }

  return { isDark, toggle };
}

/** Call before app mount to avoid flash: apply saved or system preference on first paint */
export function initTheme() {
  const stored = getStored();
  if (stored === 'dark') {
    applyDark(true);
    return;
  }
  if (stored === 'light') {
    applyDark(false);
    return;
  }
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    applyDark(true);
  }
}
