// Theme management - light/dark mode

const THEME_KEY = 'loto_theme';
const THEME_LIGHT = 'light';
const THEME_DARK = 'dark';

export class ThemeManager {
  constructor() {
    this.currentTheme = this.loadTheme();
    this.sunIcon = null;
    this.moonIcon = null;
  }

  init(toggleButton) {
    this.toggleButton = toggleButton;
    this.sunIcon = toggleButton.querySelector('.sun-icon');
    this.moonIcon = toggleButton.querySelector('.moon-icon');
    
    // Apply saved theme
    this.applyTheme(this.currentTheme);
    
    // Setup toggle button
    toggleButton.addEventListener('click', () => this.toggle());
  }

  loadTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved) {
      return saved;
    }
    
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return THEME_DARK;
    }
    
    return THEME_LIGHT;
  }

  saveTheme(theme) {
    localStorage.setItem(THEME_KEY, theme);
  }

  applyTheme(theme) {
    this.currentTheme = theme;
    
    if (theme === THEME_DARK) {
      document.documentElement.setAttribute('data-theme', 'dark');
      this.updateIcons(false);
    } else {
      document.documentElement.removeAttribute('data-theme');
      this.updateIcons(true);
    }
  }

  updateIcons(isLight) {
    if (!this.sunIcon || !this.moonIcon) return;
    
    if (isLight) {
      this.sunIcon.classList.add('active');
      this.moonIcon.classList.remove('active');
    } else {
      this.sunIcon.classList.remove('active');
      this.moonIcon.classList.add('active');
    }
  }

  toggle() {
    const newTheme = this.currentTheme === THEME_LIGHT ? THEME_DARK : THEME_LIGHT;
    this.applyTheme(newTheme);
    this.saveTheme(newTheme);
  }

  getTheme() {
    return this.currentTheme;
  }

  isDark() {
    return this.currentTheme === THEME_DARK;
  }

  isLight() {
    return this.currentTheme === THEME_LIGHT;
  }
}

// Listen to system theme changes
export function watchSystemTheme(themeManager) {
  if (!window.matchMedia) return;
  
  const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
  
  darkModeQuery.addEventListener('change', (e) => {
    // Only auto-switch if user hasn't manually set preference
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (!savedTheme) {
      const newTheme = e.matches ? THEME_DARK : THEME_LIGHT;
      themeManager.applyTheme(newTheme);
    }
  });
}
