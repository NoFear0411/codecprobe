/**
 * Theme Management Module
 *
 * Handles theme switching, persistence, and UI updates
 * Completely decoupled from codec testing logic
 */

export const THEMES = {
    'dark-oled': {
        name: 'Dark OLED',
        className: 'theme-dark-oled'
    },
    'light': {
        name: 'Light',
        className: 'theme-light'
    },
    'retro': {
        name: 'Retro Terminal',
        className: 'theme-retro-terminal'
    }
};

const THEME_STORAGE_KEY = 'codecprobe-theme';
const DEFAULT_THEME = 'dark-oled';

let currentTheme = DEFAULT_THEME;

/**
 * Initialize theme system
 */
export function initThemeSystem() {
    // Load saved theme from localStorage
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (savedTheme && THEMES[savedTheme]) {
        currentTheme = savedTheme;
    }

    // Apply initial theme
    applyTheme(currentTheme);

    // Setup theme switcher UI
    setupThemeSwitcher();

}

/**
 * Apply theme to document body
 * @param {string} themeId - Theme identifier
 */
function applyTheme(themeId) {
    if (!THEMES[themeId]) {
        console.error('[Theme] Unknown theme:', themeId);
        return;
    }

    const theme = THEMES[themeId];

    // Remove all theme classes
    Object.values(THEMES).forEach(t => {
        document.body.classList.remove(t.className);
    });

    // Apply new theme
    document.body.classList.add(theme.className);
    currentTheme = themeId;

    // Save to localStorage
    localStorage.setItem(THEME_STORAGE_KEY, themeId);

    // Update UI
    updateThemeSwitcherUI();

}

/**
 * Setup theme switcher UI
 */
function setupThemeSwitcher() {
    const switcher = document.getElementById('theme-switcher');
    if (!switcher) {
        console.warn('Theme switcher element not found');
        return;
    }

    // Create theme buttons
    Object.entries(THEMES).forEach(([themeId, theme]) => {
        const btn = document.createElement('button');
        btn.className = `theme-switcher-btn theme-btn-${themeId}`;
        btn.setAttribute('data-theme', themeId);
        btn.setAttribute('aria-label', `Switch to ${theme.name} theme`);
        btn.setAttribute('title', theme.name);
        btn.setAttribute('tabindex', '0');

        // Click handler
        const handleActivation = (e) => {
            if (e.type === 'click' || e.key === 'Enter' || e.key === ' ') {
                if (e.key === ' ') e.preventDefault();
                applyTheme(themeId);
            }
        };

        btn.addEventListener('click', handleActivation);
        btn.addEventListener('keydown', handleActivation);

        switcher.appendChild(btn);
    });

    // Update initial state
    updateThemeSwitcherUI();
}

/**
 * Update theme switcher UI to reflect current theme
 */
function updateThemeSwitcherUI() {
    const buttons = document.querySelectorAll('.theme-switcher-btn');
    buttons.forEach(btn => {
        const themeId = btn.getAttribute('data-theme');
        if (themeId === currentTheme) {
            btn.classList.add('active');
            btn.setAttribute('aria-pressed', 'true');
        } else {
            btn.classList.remove('active');
            btn.setAttribute('aria-pressed', 'false');
        }
    });
}

/**
 * Get current theme
 * @returns {string} Current theme ID
 */
export function getCurrentTheme() {
    return currentTheme;
}

/**
 * Get current theme display name
 * @returns {string} Theme name
 */
export function getCurrentThemeName() {
    return THEMES[currentTheme]?.name || 'Unknown';
}
