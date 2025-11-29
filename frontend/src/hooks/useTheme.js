import { useEffect, useState } from 'react';

export const useTheme = () => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'system';
  });

  useEffect(() => {
    const root = document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = () => {
      const isDark =
        theme === 'dark' || (theme === 'system' && mediaQuery.matches);

      if (isDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    applyTheme();
    localStorage.setItem('theme', theme);

    if (theme === 'system') {
      mediaQuery.addEventListener('change', applyTheme);
      return () => mediaQuery.removeEventListener('change', applyTheme);
    }
  }, [theme]);

  const isDark =
    theme === 'dark' ||
    (theme === 'system' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return { theme, setTheme, isDark, toggleTheme };
};
