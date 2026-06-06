// Vintage Web Theme JavaScript
// Retro functionality with modern enhancements

document.addEventListener('DOMContentLoaded', function() {
    // Window controls functionality
    initWindowControls();
    
    // Retro effects
    initRetroEffects();
    
    // Keyboard navigation
    initKeyboardNavigation();
    
    // Image galleries
    initImageGalleries();
    
    // Code copy functionality
    initCodeCopy();
    
    // Search functionality
    initSearch();
    
    // Theme persistence
    initThemePersistence();
});

// Window controls (minimize, maximize, close)
function initWindowControls() {
    document.querySelectorAll('.window-button').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const buttonText = this.textContent;
            const panel = getWindowPanel(this);
            
            // Visual feedback
            this.style.border = '1px inset var(--button-face)';
            setTimeout(() => {
                this.style.border = '1px outset var(--button-face)';
            }, 100);
            
            switch(buttonText) {
                case '_': // Minimize
                    toggleWindowMinimize(panel);
                    break;
                case '□': // Maximize
                    toggleWindowMaximize(panel);
                    break;
                case '×': // Close
                    showCloseDialog(panel);
                    break;
            }
        });
    });
}

function getWindowPanel(button) {
    return button.closest('.window, .hero-panel, .split-statement, .program-band, .method-panel, .principles-panel, .reading-panel, .contact-panel, .subpage-hero, .article-window, .archive-window');
}

function getWindowContent(panel) {
    if (!panel) {
        return null;
    }
    return panel.querySelector('.window-content') || panel.querySelector(':scope > :not(.window-header)');
}

function toggleWindowMinimize(panel) {
    const content = getWindowContent(panel);
    if (!panel || !content) {
        return;
    }
    if (content.style.display === 'none') {
        content.style.display = 'block';
        panel.style.height = 'auto';
    } else {
        content.style.display = 'none';
        panel.style.height = 'auto';
    }
}

function toggleWindowMaximize(panel) {
    if (!panel) {
        return;
    }
    if (panel.classList.contains('maximized')) {
        panel.classList.remove('maximized');
        panel.style.position = 'static';
        panel.style.top = 'auto';
        panel.style.left = 'auto';
        panel.style.width = 'auto';
        panel.style.height = 'auto';
        panel.style.zIndex = 'auto';
    } else {
        panel.classList.add('maximized');
        panel.style.position = 'fixed';
        panel.style.top = '10px';
        panel.style.left = '10px';
        panel.style.width = 'calc(100vw - 20px)';
        panel.style.height = 'calc(100vh - 40px)';
        panel.style.zIndex = '1000';
    }
}

function showCloseDialog(panel) {
    if (!panel) {
        return;
    }
    showRetroCloseDialog(panel);
}

function showRetroCloseDialog(panel) {
    const existingDialog = document.querySelector('.retro-dialog-backdrop');
    if (existingDialog) {
        existingDialog.remove();
    }

    const backdrop = document.createElement('div');
    backdrop.className = 'retro-dialog-backdrop';
    backdrop.innerHTML = `
        <div class="retro-dialog-window" role="dialog" aria-modal="true" aria-labelledby="retro-dialog-title">
            <div class="retro-dialog-titlebar">
                <span id="retro-dialog-title">System Message</span>
                <button class="retro-dialog-x" type="button" aria-label="Cancel">×</button>
            </div>
            <div class="retro-dialog-body">
                <div class="retro-dialog-icon">!</div>
                <div class="retro-dialog-copy">
                    <p class="retro-dialog-heading">Cannot close democracy.exe</p>
                    <p>Participation is still running in the background.</p>
                </div>
            </div>
            <div class="retro-dialog-actions">
                <button class="retro-dialog-button retro-dialog-ok" type="button">OK</button>
                <button class="retro-dialog-button retro-dialog-cancel" type="button">Cancel</button>
            </div>
        </div>
    `;

    document.body.appendChild(backdrop);

    const keyHandler = function(e) {
        if (e.key === 'Escape') {
            closeDialog();
        }
        if (e.key === 'Enter') {
            closeWindow();
        }
    };

    const closeDialog = () => {
        document.removeEventListener('keydown', keyHandler);
        backdrop.remove();
    };

    const closeWindow = () => {
        closeDialog();
        panel.classList.add('closing-window');
        panel.addEventListener('animationend', function handleCloseAnimation() {
            panel.style.display = 'none';
            panel.classList.remove('closing-window');
            panel.removeEventListener('animationend', handleCloseAnimation);
        }, { once: true });
    };

    backdrop.querySelector('.retro-dialog-ok').addEventListener('click', closeWindow);
    backdrop.querySelector('.retro-dialog-cancel').addEventListener('click', closeDialog);
    backdrop.querySelector('.retro-dialog-x').addEventListener('click', closeDialog);
    backdrop.addEventListener('click', function(e) {
        if (e.target === backdrop) {
            closeDialog();
        }
    });

    document.addEventListener('keydown', keyHandler);
    backdrop.querySelector('.retro-dialog-ok').focus();
}

// Retro effects
function initRetroEffects() {
    // Random retro messages
    const retroMessages = [
        "Loading... Please wait...",
        "System is Y2K compliant!",
        "Best viewed in 1024x768",
        "Optimized for Internet Explorer 6.0",
        "This site uses cutting-edge JavaScript!",
        "Now with 256 colors!",
        "Geocities approved!",
        "Web 1.0 Forever!"
    ];
    
    // Add random message to status bar if it exists
    const statusBar = document.querySelector('.status-bar .status-left');
    if (statusBar && Math.random() > 0.7) {
        const message = retroMessages[Math.floor(Math.random() * retroMessages.length)];
        const messageElement = document.createElement('span');
        messageElement.className = 'status-item';
        messageElement.textContent = message;
        statusBar.appendChild(messageElement);
    }
    
    // Add retro cursor trail effect (optional)
    if (localStorage.getItem('retroCursor') === 'true') {
        initCursorTrail();
    }
    
    // Konami code easter egg
    initKonamiCode();
}

function initCursorTrail() {
    let trail = [];
    document.addEventListener('mousemove', function(e) {
        trail.push({x: e.clientX, y: e.clientY, time: Date.now()});
        
        // Remove old trail points
        trail = trail.filter(point => Date.now() - point.time < 500);
        
        // Create trail elements
        trail.forEach((point, index) => {
            if (index % 3 === 0) { // Only every 3rd point to reduce clutter
                const dot = document.createElement('div');
                dot.style.position = 'fixed';
                dot.style.left = point.x + 'px';
                dot.style.top = point.y + 'px';
                dot.style.width = '3px';
                dot.style.height = '3px';
                dot.style.backgroundColor = '#00ffff';
                dot.style.borderRadius = '50%';
                dot.style.pointerEvents = 'none';
                dot.style.zIndex = '9999';
                dot.style.opacity = (500 - (Date.now() - point.time)) / 500;
                document.body.appendChild(dot);
                
                setTimeout(() => {
                    if (dot.parentNode) {
                        dot.parentNode.removeChild(dot);
                    }
                }, 500);
            }
        });
    });
}

function initKonamiCode() {
    const konamiCode = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65]; // ↑↑↓↓←→←→BA
    let konamiIndex = 0;
    
    document.addEventListener('keydown', function(e) {
        if (e.keyCode === konamiCode[konamiIndex]) {
            konamiIndex++;
            if (konamiIndex === konamiCode.length) {
                activateRetroMode();
                konamiIndex = 0;
            }
        } else {
            konamiIndex = 0;
        }
    });
}

function activateRetroMode() {
    alert('🎉 RETRO MODE ACTIVATED! 🎉\n\nCursor trail enabled!\nExtra retro effects unlocked!');
    localStorage.setItem('retroCursor', 'true');
    document.body.style.background = 'linear-gradient(45deg, #ff00ff, #00ffff, #ffff00, #ff00ff)';
    document.body.style.backgroundSize = '400% 400%';
    document.body.style.animation = 'retroBackground 3s ease infinite';
    
    // Add CSS animation for background
    const style = document.createElement('style');
    style.textContent = `
        @keyframes retroBackground {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
        @keyframes fadeOut {
            from { opacity: 1; transform: scale(1); }
            to { opacity: 0; transform: scale(0.8); }
        }
    `;
    document.head.appendChild(style);
    
    initCursorTrail();
}

// Keyboard navigation
function initKeyboardNavigation() {
    document.addEventListener('keydown', function(e) {
        // Alt + H for home
        if (e.altKey && e.key === 'h') {
            e.preventDefault();
            window.location.href = '/';
        }
        
        // Alt + M for manifesto
        if (e.altKey && e.key === 'm') {
            e.preventDefault();
            window.location.href = '/#manifesto-text';
        }
        
        // Escape to minimize all windows
        if (e.key === 'Escape') {
            document.querySelectorAll('.window .window-content').forEach(content => {
                if (content.style.display !== 'none') {
                    content.style.display = 'none';
                }
            });
        }
        
        // F11 for fullscreen (show message)
        if (e.key === 'F11') {
            e.preventDefault();
            alert('F11 detected! If this were a real 90s browser, you\'d now be in fullscreen mode! 📺');
        }
    });
}

// Image galleries
function initImageGalleries() {
    document.querySelectorAll('.image-gallery img').forEach(img => {
        img.addEventListener('click', function() {
            openLightbox(this);
        });
        
        // Add retro loading effect
        img.addEventListener('load', function() {
            this.style.opacity = '0';
            this.style.transition = 'opacity 0.5s ease';
            setTimeout(() => {
                this.style.opacity = '1';
            }, 100);
        });
    });
}

function openLightbox(img) {
    const lightbox = document.createElement('div');
    lightbox.style.position = 'fixed';
    lightbox.style.top = '0';
    lightbox.style.left = '0';
    lightbox.style.width = '100%';
    lightbox.style.height = '100%';
    lightbox.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    lightbox.style.zIndex = '10000';
    lightbox.style.display = 'flex';
    lightbox.style.alignItems = 'center';
    lightbox.style.justifyContent = 'center';
    lightbox.style.cursor = 'pointer';
    
    const lightboxImg = document.createElement('img');
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightboxImg.style.maxWidth = '90%';
    lightboxImg.style.maxHeight = '90%';
    lightboxImg.style.border = '2px outset var(--border-dark)';
    
    lightbox.appendChild(lightboxImg);
    document.body.appendChild(lightbox);
    
    lightbox.addEventListener('click', function() {
        document.body.removeChild(lightbox);
    });
    
    // ESC to close
    const closeHandler = function(e) {
        if (e.key === 'Escape') {
            document.body.removeChild(lightbox);
            document.removeEventListener('keydown', closeHandler);
        }
    };
    document.addEventListener('keydown', closeHandler);
}

// Code copy functionality
function initCodeCopy() {
    document.querySelectorAll('pre code').forEach(codeBlock => {
        const pre = codeBlock.parentElement;
        
        // Add copy button
        const copyButton = document.createElement('button');
        copyButton.textContent = '📋 Copy';
        copyButton.className = 'btn';
        copyButton.style.position = 'absolute';
        copyButton.style.top = '4px';
        copyButton.style.right = '4px';
        copyButton.style.fontSize = '8px';
        copyButton.style.padding = '2px 4px';
        
        pre.style.position = 'relative';
        pre.appendChild(copyButton);
        
        copyButton.addEventListener('click', function() {
            navigator.clipboard.writeText(codeBlock.textContent).then(() => {
                copyButton.textContent = '✅ Copied!';
                setTimeout(() => {
                    copyButton.textContent = '📋 Copy';
                }, 2000);
            }).catch(() => {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = codeBlock.textContent;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                
                copyButton.textContent = '✅ Copied!';
                setTimeout(() => {
                    copyButton.textContent = '📋 Copy';
                }, 2000);
            });
        });
    });
}

// Simple search functionality
function initSearch() {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const query = this.value.toLowerCase();
            const posts = document.querySelectorAll('.post-list-item');
            
            posts.forEach(post => {
                const title = post.querySelector('.post-list-title a').textContent.toLowerCase();
                const summary = post.querySelector('.post-list-summary');
                const summaryText = summary ? summary.textContent.toLowerCase() : '';
                
                if (title.includes(query) || summaryText.includes(query)) {
                    post.style.display = 'block';
                } else {
                    post.style.display = 'none';
                }
            });
        });
    }
}

// Theme persistence
function initThemePersistence() {
    // Save scroll position
    window.addEventListener('beforeunload', function() {
        localStorage.setItem('scrollPosition', window.scrollY);
    });
    
    // Restore scroll position
    const savedPosition = localStorage.getItem('scrollPosition');
    if (savedPosition) {
        window.scrollTo(0, parseInt(savedPosition));
        localStorage.removeItem('scrollPosition');
    }
    
    // Remember window states
    document.querySelectorAll('.window').forEach((window, index) => {
        const savedState = localStorage.getItem(`window-${index}-minimized`);
        if (savedState === 'true') {
            const content = window.querySelector('.window-content');
            if (content) {
                content.style.display = 'none';
            }
        }
        
        // Save state when minimized
        const minimizeBtn = window.querySelector('.window-button');
        if (minimizeBtn && minimizeBtn.textContent === '_') {
            minimizeBtn.addEventListener('click', function() {
                setTimeout(() => {
                    const content = window.querySelector('.window-content');
                    const isMinimized = content.style.display === 'none';
                    localStorage.setItem(`window-${index}-minimized`, isMinimized);
                }, 200);
            });
        }
    });
}

// Utility functions
function playRetroSound(type) {
    // Create retro-style notification sounds using Web Audio API
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    switch(type) {
        case 'click':
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);
            break;
        case 'error':
            oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.3);
            break;
        case 'success':
            oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.2);
            break;
    }
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
}

// Export functions for global use
window.VintageTheme = {
    playRetroSound,
    activateRetroMode,
    openLightbox
};

console.log('🖥️ Vintage Web Theme loaded! Press ↑↑↓↓←→←→BA for a surprise! 🎮');
