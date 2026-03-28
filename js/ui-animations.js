/**
 * UI Animations using anime.js
 * Handles menu transitions, in-game popups, screen shake, and hover effects.
 */

const UIAnimations = {
    // === Menu Transitions ===
    
    // Fade in a menu and slide up slightly
    showMenu: (menuId, displayType = 'flex', isStaggered = false) => {
        const menu = document.getElementById(menuId);
        if (!menu) return;
        
        menu.style.display = displayType;
        menu.style.opacity = '0';
        
        if (isStaggered && menuId === 'mainMenu') {
            // Staggered reveal for Main Menu elements
            anime({
                targets: `#${menuId} > *`,
                translateY: [20, 0],
                opacity: [0, 1],
                delay: anime.stagger(100, {start: 100}), // items delay
                easing: 'easeOutQuart',
                duration: 600,
                begin: () => {
                    menu.style.opacity = '1';
                }
            });
        } else {
            // Standard fade + slide up
            anime({
                targets: menu,
                translateY: [20, 0],
                opacity: [0, 1],
                easing: 'easeOutQuart',
                duration: 500
            });
        }
    },

    // Fade out a menu and slide down slightly
    hideMenu: (menuId, onComplete = () => {}) => {
        const menu = document.getElementById(menuId);
        if (!menu) return;

        anime({
            targets: menu,
            translateY: [0, 20],
            opacity: [1, 0],
            easing: 'easeInQuart',
            duration: 300,
            complete: () => {
                menu.style.display = 'none';
                menu.style.opacity = '1'; // Reset for future use
                menu.style.transform = ''; // Reset transform
                onComplete();
            }
        });
    },

    // === Hover & Click Effects (Interactive Cards) ===
    
    initInteractiveCards: () => {
        const cards = document.querySelectorAll('.ship-card, .weapon-card, .control-card, .draft-card, .btn');
        
        cards.forEach(card => {
            // Hover effect
            card.addEventListener('mouseenter', () => {
                anime.remove(card);
                anime({
                    targets: card,
                    scale: 1.05,
                    easing: 'easeOutElastic(1, .6)',
                    duration: 400
                });
            });

            card.addEventListener('mouseleave', () => {
                anime.remove(card);
                anime({
                    targets: card,
                    scale: 1,
                    easing: 'easeOutElastic(1, .6)',
                    duration: 400
                });
            });

            // Click effect
            card.addEventListener('mousedown', () => {
                anime.remove(card);
                anime({
                    targets: card,
                    scale: 0.95,
                    easing: 'easeOutQuad',
                    duration: 100
                });
            });

            card.addEventListener('mouseup', () => {
                anime.remove(card);
                anime({
                    targets: card,
                    scale: 1.05,
                    easing: 'easeOutQuad',
                    duration: 150
                });
            });
            
            // Touch support
            card.addEventListener('touchstart', () => {
                anime.remove(card);
                anime({
                    targets: card,
                    scale: 0.95,
                    easing: 'easeOutQuad',
                    duration: 100
                });
            }, {passive: true});

            card.addEventListener('touchend', () => {
                anime.remove(card);
                anime({
                    targets: card,
                    scale: 1,
                    easing: 'easeOutQuad',
                    duration: 150
                });
            }, {passive: true});
        });
    },

    // === In-Game Feedbacks ===
    
    // Animate score value popping when increasing
    animateScore: () => {
        const scoreSpan = document.getElementById('scoreValue');
        if (!scoreSpan) return;
        
        anime.remove(scoreSpan);
        anime({
            targets: scoreSpan,
            scale: [1.5, 1],
            color: ['#fff', '#66fcf1'],
            easing: 'easeOutElastic(1, .5)',
            duration: 600
        });
    },

    // Animate Wave / Notification displaying
    animateWavePopup: () => {
        const waveBox = document.getElementById('waveDisplay');
        if (!waveBox) return;

        anime.remove(waveBox);
        anime({
            targets: waveBox,
            scale: [1.3, 1],
            opacity: [0.5, 1],
            easing: 'easeOutElastic(1, .4)',
            duration: 1000
        });
    },
    
    // Animate Draft text popping up
    animateDraftPopup: () => {
        const draftScreen = document.getElementById('draftScreen');
        if(!draftScreen) return;
        
        anime({
            targets: '#draftScreen h2',
            scale: [0.8, 1],
            opacity: [0, 1],
            easing: 'easeOutElastic(1, .6)',
            duration: 800
        });
        
        anime({
            targets: '.draft-card',
            translateY: [30, 0],
            opacity: [0, 1],
            delay: anime.stagger(150),
            easing: 'easeOutQuart',
            duration: 500
        });
    },

    // Screen Shake effect for taking damage
    screenShake: (intensity = 10, duration = 300) => {
        const container = document.getElementById('gameContainer');
        if (!container) return;
        
        // Remove existing shake to avoid glitches
        anime.remove(container);
        
        // Use anime timeline for shake
        const tl = anime.timeline({
            targets: container,
            easing: 'easeInOutSine',
            duration: duration / 4
        });
        
        tl.add({ translateX: intensity })
          .add({ translateX: -intensity })
          .add({ translateX: intensity / 2 })
          .add({ translateX: 0 });
          
        // Red flash overlay
        const canvas = document.getElementById('gameCanvas');
        if (canvas) {
            anime({
                targets: canvas,
                boxShadow: [
                    '0 0 0px 0px rgba(255, 0, 60, 0)',
                    'inset 0 0 50px 10px rgba(255, 0, 60, 0.6)',
                    '0 0 0px 0px rgba(255, 0, 60, 0)'
                ],
                easing: 'easeOutQuad',
                duration: duration
            });
        }
    },
    
    // Player HP box hurt (Shake and redden hp box)
    hpBoxShake: (playerNum) => {
        // playerNum is usually 1 (local) or 2 (ally)
        const hpBox = document.getElementById(playerNum === 1 ? 'hpBar1' : 'hpBar2')?.parentElement?.parentElement;
        if (!hpBox) return;
        
        anime.remove(hpBox);
        anime({
            targets: hpBox,
            translateX: [
                { value: -5, duration: 50 },
                { value: 5, duration: 50 },
                { value: -3, duration: 50 },
                { value: 0, duration: 50 }
            ],
            easing: 'linear'
        });
    }
};

// Auto-init cards on DOM load
document.addEventListener('DOMContentLoaded', () => {
    // Initial bindings for cards
    // Some cards might be created dynamically, they need manual re-binding or event delegation,
    // but works fine for static menu items.
    UIAnimations.initInteractiveCards();
});
