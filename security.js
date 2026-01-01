/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║                    NEBULA ARCADE - SECURITY                       ║
 * ║          Source Code Protection & Anti-Tampering System           ║
 * ╚══════════════════════════════════════════════════════════════════╝
 * 
 * This module implements multiple layers of protection to prevent
 * unauthorized access, code theft, and reverse engineering.
 */

// ═══════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════

const SecurityConfig = {
    // Authorized domain(s) - change this to your actual domain
    authorizedDomains: [
        'localhost',
        '127.0.0.1',
        'nebula-arcade.vercel.app',
        'nebula-arcade.com',
        'www.nebula-arcade.com'
    ],
    
    // Enable/disable protection features
    protections: {
        domainLocking: true,
        antiDebug: true,
        disableRightClick: true,
        disableShortcuts: true,
        consoleBlocking: true,
        obfuscationCheck: false
    },
    
    // Messages for security violations
    messages: {
        unauthorizedDomain: 'This game can only be played on authorized websites.',
        devToolsDetected: 'Developer tools detected. Access denied.',
        suspiciousActivity: 'Suspicious activity detected. Access denied.'
    }
};

// ═══════════════════════════════════════════════════════════════════
// DOMAIN LOCKING
// ═══════════════════════════════════════════════════════════════════

/**
 * Checks if the current domain is authorized
 * This prevents people from downloading your games and running them elsewhere
 */
function checkDomainAuthorization() {
    if (!SecurityConfig.protections.domainLocking) return true;
    
    const currentHost = window.location.hostname.toLowerCase();
    const authorizedDomains = SecurityConfig.authorizedDomains.map(d => d.toLowerCase());
    
    const isAuthorized = authorizedDomains.some(domain => {
        return currentHost === domain || 
               currentHost.endsWith('.' + domain) ||
               domain.includes('*') && currentHost.match(new RegExp(domain.replace('*', '.*')));
    });
    
    if (!isAuthorized) {
        showSecurityViolation(SecurityConfig.messages.unauthorizedDomain);
        return false;
    }
    
    return true;
}

// ═══════════════════════════════════════════════════════════════════
// ANTI-DEBUGGING PROTECTION
// ═══════════════════════════════════════════════════════════════════

let debugAttempts = 0;
const MAX_DEBUG_ATTEMPTS = 3;

/**
 * Detects when developer tools are opened
 * Uses multiple detection methods for better coverage
 */
function initAntiDebug() {
    if (!SecurityConfig.protections.antiDebug) return;
    
    // Method 1: Check for DevTools opening via timing
    // DevTools opening causes a significant delay in execution
    const checkDebugTiming = () => {
        const start = performance.now();
        debugger;
        const end = performance.now();
        
        if (end - start > 100) {
            handleDevToolsDetected();
        }
    };
    
    // Method 2: Check for console open (mobile/devices without F12)
    const checkConsole = () => {
        if (window.console && window.console.open) {
            handleDevToolsDetected();
        }
    };
    
    // Method 3: Listen for devtools change event (Chrome)
    if (typeof window !== 'undefined') {
        const devtools = {
            isOpen: false,
            orientation: null
        };
        
        const threshold = 160;
        
        // Check via window.outerDimensions
        const checkDimensions = () => {
            if (window.outerHeight - window.innerHeight > threshold ||
                window.outerWidth - window.innerWidth > threshold) {
                if (!devtools.isOpen) {
                    devtools.isOpen = true;
                    handleDevToolsDetected();
                }
            } else {
                devtools.isOpen = false;
            }
        };
        
        setInterval(checkDimensions, 500);
    }
    
    // Random debugger checks (unpredictable)
    setInterval(() => {
        if (Math.random() < 0.1) { // 10% chance each interval
            checkDebugTiming();
        }
    }, 1000);
}

/**
 * Handles DevTools detection
 */
function handleDevToolsDetected() {
    debugAttempts++;
    
    if (debugAttempts >= MAX_DEBUG_ATTEMPTS) {
        showSecurityViolation(SecurityConfig.messages.devToolsDetected);
    } else {
        // Show warning but allow limited access
        console.warn('⚠️ DevTools detected. Further attempts will result in access denial.');
        
        // Add visual warning to page
        document.body.style.filter = 'blur(5px)';
        setTimeout(() => {
            document.body.style.filter = '';
        }, 500);
    }
}

// ═══════════════════════════════════════════════════════════════════
// CONTEXT MENU & SHORTCUT BLOCKING
// ═══════════════════════════════════════════════════════════════════

/**
 * Disables right-click context menu on the page
 * This prevents "View Source" and "Inspect Element" via context menu
 */
function disableRightClick() {
    if (!SecurityConfig.protections.disableRightClick) return;
    
    document.addEventListener('contextmenu', (e) => {
        // Allow right-click on form elements
        if (e.target.tagName === 'INPUT' || 
            e.target.tagName === 'TEXTAREA' ||
            e.target.isContentEditable) {
            return true;
        }
        
        e.preventDefault();
        showToast('Right-click disabled');
        return false;
    });
}

/**
 * Disables keyboard shortcuts that could expose source code
 */
function disableKeyboardShortcuts() {
    if (!SecurityConfig.protections.disableShortcuts) return;
    
    const blockedShortcuts = [
        // View Source
        { key: 'u', ctrl: true },
        { key: 's', ctrl: true }, // Save page
        { key: 's', ctrl: true, shift: true },
        
        // DevTools
        { key: 'i', ctrl: true, shift: true }, // DevTools (Cmd+Opt+I)
        { key: 'j', ctrl: true, shift: true }, // Console (Cmd+Opt+J)
        { key: 'c', ctrl: true, shift: true }, // Inspector
        
        // General
        { key: 'p', ctrl: true }, // Print
        { key: 'a', ctrl: true }, // Select all
    ];
    
    document.addEventListener('keydown', (e) => {
        const isBlocked = blockedShortcuts.some(shortcut => {
            return e.key.toLowerCase() === shortcut.key &&
                   e.ctrlKey === (shortcut.ctrl || false) &&
                   e.shiftKey === (shortcut.shift || false) &&
                   e.metaKey === (shortcut.ctrl || false);
        });
        
        if (isBlocked) {
            e.preventDefault();
            e.stopPropagation();
            showToast('This shortcut is disabled');
            return false;
        }
    });
}

// ═══════════════════════════════════════════════════════════════════
// CONSOLE INTERCEPTION
// ═══════════════════════════════════════════════════════════════════

/**
 * Overrides console methods to monitor for suspicious activity
 * and discourage console-based exploration
 */
function initConsoleBlocking() {
    if (!SecurityConfig.protections.consoleBlocking) return;
    
    const originalConsole = { ...console };
    
    // Override console.log with a warning
    console.log = function(...args) {
        // Only allow our own logs (identified by a marker)
        if (args.some(arg => typeof arg === 'object' && arg && arg._fromGame)) {
            originalConsole.log.apply(console, args);
        }
    };
    
    // Warn about console usage
    console.warn('%c⚠️ WARNING', 'color: red; font-size: 20px; font-weight: bold;');
    console.warn('%cConsole access is being monitored. Suspicious activity will be blocked.', 
        'color: orange; font-size: 14px;');
    
    // Detect console debugging attempts
    let consoleCount = 0;
    const originalDebug = console.debug;
    
    console.debug = function(...args) {
        consoleCount++;
        if (consoleCount > 10) {
            handleDevToolsDetected();
        }
        originalDebug.apply(console, args);
    };
}

// ═══════════════════════════════════════════════════════════════════
// SOURCE CODE OBFUSCATION MARKERS
// ═══════════════════════════════════════════════════════════════════

/**
 * Marks game objects to distinguish them from external code
 * This helps our protection system identify legitimate game code
 */
function markAsGameCode(obj) {
    if (typeof obj === 'object' && obj !== null) {
        obj._fromGame = true;
        Object.defineProperty(obj, '_fromGame', {
            value: true,
            writable: false,
            enumerable: false
        });
    }
    return obj;
}

// ═══════════════════════════════════════════════════════════════════
// SECURITY VIOLATION HANDLING
// ═══════════════════════════════════════════════════════════════════

/**
 * Shows security violation overlay
 */
function showSecurityViolation(message) {
    // Clear the page
    document.body.innerHTML = '';
    
    // Create security overlay
    const overlay = document.createElement('div');
    overlay.id = 'security-overlay';
    overlay.innerHTML = `
        <div class="security-warning">
            <div class="warning-icon">⚠️</div>
            <h2>Security Alert</h2>
            <p>${message}</p>
            <button onclick="location.reload()">Return to Safety</button>
        </div>
    `;
    
    // Add styles if not already present
    if (!document.getElementById('security-styles')) {
        const styles = document.createElement('style');
        styles.id = 'security-styles';
        styles.textContent = `
            body {
                margin: 0;
                padding: 0;
                background: #0f172a;
                font-family: 'Inter', system-ui, sans-serif;
            }
            #security-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(15, 23, 42, 0.98);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
            }
            .security-warning {
                text-align: center;
                padding: 2rem;
                max-width: 400px;
            }
            .warning-icon {
                font-size: 4rem;
                margin-bottom: 1.5rem;
            }
            .security-warning h2 {
                color: #ef4444;
                font-family: 'Orbitron', sans-serif;
                font-size: 1.5rem;
                margin-bottom: 1rem;
            }
            .security-warning p {
                color: #94a3b8;
                margin-bottom: 1.5rem;
            }
            .security-warning button {
                padding: 0.75rem 1.5rem;
                background: #ef4444;
                color: white;
                border: none;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
            }
        `;
        document.head.appendChild(styles);
    }
    
    document.body.appendChild(overlay);
    
    // Disable further interaction
    document.body.style.pointerEvents = 'none';
    
    // Log the violation (for analytics)
    console.error('SECURITY VIOLATION:', message);
}

/**
 * Shows a temporary toast notification
 */
function showToast(message) {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(239, 68, 68, 0.9);
        color: white;
        padding: 10px 20px;
        border-radius: 8px;
        font-size: 14px;
        z-index: 10001;
        animation: fadeIn 0.3s ease;
    `;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}

// ═══════════════════════════════════════════════════════════════════
// INITIALIZATION
// ═══════════════════════════════════════════════════════════════════

/**
 * Initialize all security measures
 */
function initSecurity() {
    // Check domain first
    if (!checkDomainAuthorization()) {
        return false;
    }
    
    // Initialize protections
    disableRightClick();
    disableKeyboardShortcuts();
    initAntiDebug();
    initConsoleBlocking();
    
    // Add security badge (subtle)
    addSecurityBadge();
    
    console.log('🔒 Security system initialized');
    return true;
}

/**
 * Adds a subtle security badge to the page
 */
function addSecurityBadge() {
    const badge = document.createElement('div');
    badge.style.cssText = `
        position: fixed;
        bottom: 10px;
        right: 10px;
        font-size: 10px;
        color: rgba(255, 255, 255, 0.2);
        font-family: monospace;
        z-index: 1000;
        pointer-events: none;
    `;
    badge.textContent = '🔒 Protected';
    document.body.appendChild(badge);
}

// ═══════════════════════════════════════════════════════════════════
// EXPORT FOR GAME USE
// ═══════════════════════════════════════════════════════════════════

// Make security functions available globally for games
window.Security = {
    config: SecurityConfig,
    checkDomain: checkDomainAuthorization,
    markAsGameCode: markAsGameCode,
    showViolation: showSecurityViolation,
    init: initSecurity
};

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSecurity);
} else {
    initSecurity();
}
