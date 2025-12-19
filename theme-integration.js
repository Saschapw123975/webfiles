/**
 * Crymson Theme Integration Script
 * Handles theme switching between Blue and Gold accent themes
 * Communicates with C# app via WebView2 postMessage API
 */

(function() {
    'use strict';
    
    // Initialize theme from C# app or localStorage
    let currentTheme = window.currentTheme || localStorage.getItem('crymson_accent_theme') || 'blue';
    
    // Apply theme on load
    applyTheme(currentTheme);
    
    /**
     * Apply theme to the page with smooth fade transitions
     */
    function applyTheme(theme) {
        const body = document.body;
        const html = document.documentElement;
        
        // Remove existing theme classes
        body.classList.remove('gold-theme', 'blue-theme');
        html.classList.remove('gold-theme', 'blue-theme');
        
        // Add new theme class
        body.classList.add(theme + '-theme');
        html.classList.add(theme + '-theme');
        
        // Save to localStorage
        localStorage.setItem('crymson_accent_theme', theme);
        
        // Update CSS variables with smooth transitions
        updateCSSVariables(theme);
        
        // Update current theme
        currentTheme = theme;
        
        // Notify any listeners
        if (window.onThemeApplied) {
            window.onThemeApplied(theme);
        }
        
        console.log('[Crymson Theme] Applied theme:', theme);
    }
    
    /**
     * Update CSS variables for the current theme
     */
    function updateCSSVariables(theme) {
        const root = document.documentElement;
        
        if (theme === 'gold') {
            root.style.setProperty('--accent-color', '#ffd700');
            root.style.setProperty('--accent-secondary', '#d4af37');
            root.style.setProperty('--accent-hover', '#ffed4e');
            root.style.setProperty('--border-color', '#d4af37');
            root.style.setProperty('--button-bg', '#d4af37');
            root.style.setProperty('--button-hover', '#ffd700');
            root.style.setProperty('--success-color', '#ffd700');
            root.style.setProperty('--gradient-start', '#d4af37');
            root.style.setProperty('--gradient-end', '#ffd700');
        } else {
            root.style.setProperty('--accent-color', '#3d73ff');
            root.style.setProperty('--accent-secondary', '#6dd8ff');
            root.style.setProperty('--accent-hover', '#5a8fff');
            root.style.setProperty('--border-color', '#3d73ff');
            root.style.setProperty('--button-bg', '#3d73ff');
            root.style.setProperty('--button-hover', '#5a8fff');
            root.style.setProperty('--success-color', '#48bb78');
            root.style.setProperty('--gradient-start', '#3d73ff');
            root.style.setProperty('--gradient-end', '#6dd8ff');
        }
    }
    
    /**
     * Toggle between themes
     */
    window.toggleTheme = function() {
        const newTheme = currentTheme === 'gold' ? 'blue' : 'gold';
        
        // Send message to C# app
        if (typeof window.chrome !== 'undefined' && window.chrome.webview) {
            try {
                window.chrome.webview.postMessage(JSON.stringify({ 
                    type: 'TOGGLE_THEME' 
                }));
                console.log('[Crymson Theme] Toggle request sent to app');
            } catch (e) {
                console.error('[Crymson Theme] Failed to send toggle request:', e);
                // Fallback: apply theme locally
                applyTheme(newTheme);
            }
        } else {
            // Fallback: apply theme locally (for testing)
            applyTheme(newTheme);
        }
    };
    
    /**
     * Switch to a specific theme
     */
    window.switchToTheme = function(theme) {
        if (theme !== 'blue' && theme !== 'gold') {
            console.error('[Crymson Theme] Invalid theme:', theme);
            return;
        }
        
        if (currentTheme === theme) {
            console.log('[Crymson Theme] Already on theme:', theme);
            return;
        }
        
        // Send toggle message if different theme
        window.toggleTheme();
    };
    
    /**
     * Get current theme
     */
    window.getCurrentTheme = function() {
        return currentTheme;
    };
    
    /**
     * Listen for theme changes from C# app
     */
    window.onThemeChanged = function(newTheme) {
        console.log('[Crymson Theme] Theme changed from app:', newTheme);
        applyTheme(newTheme);
    };
    
    // Export for other scripts
    window.CrymsonTheme = {
        current: function() { return currentTheme; },
        toggle: window.toggleTheme,
        switchTo: window.switchToTheme,
        apply: applyTheme
    };
    
    console.log('[Crymson Theme] Integration script loaded. Current theme:', currentTheme);
})();
