// ================================
// Application State
// ================================

const state = {
    musicPlaying: false,
    currentTheme: 'romantic',
    particles: []
};

// ================================
// Particle System
// ================================

class Particle {
    constructor(canvas) {
        this.canvas = canvas;
        this.reset();
    }

    reset() {
        this.x = Math.random() * this.canvas.width;
        this.y = Math.random() * this.canvas.height;
        this.size = Math.random() * 3 + 1;
        this.speedX = Math.random() * 0.5 - 0.25;
        this.speedY = Math.random() * 0.5 - 0.25;
        this.opacity = Math.random() * 0.5 + 0.2;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;

        // Wrap around screen
        if (this.x > this.canvas.width) this.x = 0;
        if (this.x < 0) this.x = this.canvas.width;
        if (this.y > this.canvas.height) this.y = 0;
        if (this.y < 0) this.y = this.canvas.height;
    }

    draw(ctx) {
        ctx.fillStyle = `rgba(212, 165, 165, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

class ParticleSystem {
    constructor(canvasId, particleCount = 80) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.particleCount = particleCount;
        
        this.init();
    }

    init() {
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Create particles
        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push(new Particle(this.canvas));
        }
        
        this.animate();
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Update and draw particles
        this.particles.forEach(particle => {
            particle.update();
            particle.draw(this.ctx);
        });

        // Draw connections
        this.drawConnections();
        
        requestAnimationFrame(() => this.animate());
    }

    drawConnections() {
        const maxDistance = 120;
        
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < maxDistance) {
                    const opacity = (1 - distance / maxDistance) * 0.2;
                    this.ctx.strokeStyle = `rgba(212, 165, 165, ${opacity})`;
                    this.ctx.lineWidth = 0.5;
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.stroke();
                }
            }
        }
    }

    updateColor(color) {
        this.particles.forEach(particle => {
            particle.color = color;
        });
    }
}

// ================================
// Music Control
// ================================

class MusicController {
    constructor(audioId, buttonId) {
        this.audio = document.getElementById(audioId);
        this.button = document.getElementById(buttonId);
        this.isPlaying = false;
        
        this.init();
    }

    init() {
        this.button.addEventListener('click', () => this.toggle());
    }

    toggle() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }

    play() {
        this.audio.play().catch(error => {
            console.log('Audio play prevented:', error);
            this.showNotification('Please interact with the page to enable music');
        });
        this.isPlaying = true;
        this.button.classList.add('active');
        state.musicPlaying = true;
    }

    pause() {
        this.audio.pause();
        this.isPlaying = false;
        this.button.classList.remove('active');
        state.musicPlaying = false;
    }

    showNotification(message) {
        // Simple notification (could be enhanced with a toast system)
        console.log(message);
    }
}

// ================================
// Theme Controller
// ================================

class ThemeController {
    constructor(buttonId) {
        this.button = document.getElementById(buttonId);
        this.themes = ['romantic', 'vibrant'];
        this.currentThemeIndex = 0;
        
        this.init();
    }

    init() {
        this.button.addEventListener('click', () => this.toggle());
    }

    toggle() {
        this.currentThemeIndex = (this.currentThemeIndex + 1) % this.themes.length;
        const newTheme = this.themes[this.currentThemeIndex];
        this.applyTheme(newTheme);
        this.animateTransition();
    }

    applyTheme(theme) {
        document.body.setAttribute('data-theme', theme);
        state.currentTheme = theme;
        
        // Update button state
        if (theme === 'vibrant') {
            this.button.classList.add('active');
        } else {
            this.button.classList.remove('active');
        }
    }

    animateTransition() {
        // Add transition effect
        document.body.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
        
        // Create ripple effect
        this.createRippleEffect();
        
        // Trigger re-animation of grid items
        this.reanimateElements();
    }

    createRippleEffect() {
        const ripple = document.createElement('div');
        ripple.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            width: 0;
            height: 0;
            border-radius: 50%;
            background: ${state.currentTheme === 'vibrant' ? 'rgba(255, 107, 157, 0.3)' : 'rgba(212, 165, 165, 0.3)'};
            transform: translate(-50%, -50%);
            pointer-events: none;
            z-index: 9999;
            transition: all 1s cubic-bezier(0.4, 0, 0.2, 1);
        `;
        
        document.body.appendChild(ripple);
        
        setTimeout(() => {
            ripple.style.width = '200vmax';
            ripple.style.height = '200vmax';
            ripple.style.opacity = '0';
        }, 10);
        
        setTimeout(() => {
            ripple.remove();
        }, 1000);
    }

    reanimateElements() {
        const gridItems = document.querySelectorAll('.grid-item');
        
        gridItems.forEach((item, index) => {
            item.style.animation = 'none';
            setTimeout(() => {
                item.style.animation = '';
            }, 10);
        });
    }
}

// ================================
// Floating Hearts Effect
// ================================

class FloatingHeartsEffect {
    constructor() {
        this.hearts = ['♥', '♡', '❤', '💕', '💖'];
        this.interval = null;
    }

    start() {
        this.createHeart();
        this.interval = setInterval(() => this.createHeart(), 2000);
    }

    createHeart() {
        const heart = document.createElement('div');
        const heartSymbol = this.hearts[Math.floor(Math.random() * this.hearts.length)];
        
        heart.textContent = heartSymbol;
        heart.style.cssText = `
            position: fixed;
            font-size: ${Math.random() * 20 + 20}px;
            color: var(--accent-primary);
            opacity: 0;
            pointer-events: none;
            z-index: 999;
            left: ${Math.random() * 100}vw;
            bottom: -50px;
            animation: floatUp ${Math.random() * 3 + 4}s ease-in-out forwards;
        `;
        
        document.body.appendChild(heart);
        
        setTimeout(() => {
            heart.remove();
        }, 7000);
    }

    stop() {
        if (this.interval) {
            clearInterval(this.interval);
        }
    }
}

// ================================
// Dynamic Love Tree Creator
// ================================

class LoveTreeCreator {
    constructor(buttonId) {
        this.button = document.getElementById(buttonId);
        this.currentTree = null;
        this.isGrowing = false;
        this.treeCount = 0;
        this.maxTrees = 3; // Maximum number of trees on screen
        this.activeTrees = [];
        
        this.init();
    }

    init() {
        this.button.addEventListener('click', () => this.handleClick());
    }

    handleClick() {
        if (this.isGrowing) return;
        
        // Remove oldest tree if at max capacity
        if (this.activeTrees.length >= this.maxTrees) {
            this.removeOldestTree();
        }
        
        this.createTree();
    }

    createTree() {
        this.isGrowing = true;
        this.button.classList.add('active');
        
        const tree = document.createElement('div');
        tree.className = 'dynamic-love-tree';
        
        // Random position at bottom of screen
        const position = this.getRandomPosition();
        tree.style.left = position + 'px';
        
        // Create tree structure
        const treeContainer = document.createElement('div');
        treeContainer.className = 'dynamic-tree-container';
        
        // Create crown with pink hearts
        const crown = document.createElement('div');
        crown.className = 'dynamic-tree-crown';
        
        // Create heart layers (pyramid shape)
        const layers = [
            { hearts: 1, delay: 0 },
            { hearts: 3, delay: 0.2 },
            { hearts: 5, delay: 0.4 },
            { hearts: 7, delay: 0.6 },
            { hearts: 5, delay: 0.8 },
            { hearts: 3, delay: 1.0 }
        ];
        
        layers.forEach((layer, layerIndex) => {
            const row = document.createElement('div');
            row.className = 'dynamic-heart-row';
            
            for (let i = 0; i < layer.hearts; i++) {
                const heart = document.createElement('span');
                heart.className = 'dynamic-heart';
                heart.textContent = '💕';
                heart.style.animationDelay = (layer.delay + i * 0.1) + 's';
                row.appendChild(heart);
            }
            
            crown.appendChild(row);
            
            // Animate row appearance
            setTimeout(() => {
                row.classList.add('animate');
            }, layerIndex * 150);
        });
        
        // Create trunk
        const trunk = document.createElement('div');
        trunk.className = 'dynamic-tree-trunk';
        
        treeContainer.appendChild(crown);
        treeContainer.appendChild(trunk);
        tree.appendChild(treeContainer);
        
        document.body.appendChild(tree);
        this.activeTrees.push(tree);
        
        // Add sparkles around the tree
        setTimeout(() => {
            this.addSparkles(tree);
        }, 1500);
        
        // Remove tree after duration
        setTimeout(() => {
            this.removeTree(tree);
        }, 15000); // Tree stays for 15 seconds
        
        // Reset button state
        setTimeout(() => {
            this.isGrowing = false;
            if (this.activeTrees.length === 0) {
                this.button.classList.remove('active');
            }
        }, 2000);
    }

    getRandomPosition() {
        const margin = 100;
        const maxWidth = window.innerWidth - margin * 2;
        return margin + Math.random() * maxWidth;
    }

    addSparkles(tree) {
        const sparkleCount = 12;
        const treeRect = tree.getBoundingClientRect();
        
        for (let i = 0; i < sparkleCount; i++) {
            setTimeout(() => {
                const sparkle = document.createElement('div');
                sparkle.className = 'tree-sparkle';
                sparkle.textContent = '✨';
                
                const angle = (Math.PI * 2 * i) / sparkleCount;
                const radius = 100;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                
                sparkle.style.left = '50%';
                sparkle.style.top = '30%';
                sparkle.style.transform = `translate(${x}px, ${y}px)`;
                sparkle.style.animationDelay = (i * 0.1) + 's';
                
                tree.appendChild(sparkle);
            }, i * 100);
        }
    }

    removeTree(tree) {
        tree.classList.add('grow-out');
        
        setTimeout(() => {
            tree.remove();
            const index = this.activeTrees.indexOf(tree);
            if (index > -1) {
                this.activeTrees.splice(index, 1);
            }
            
            if (this.activeTrees.length === 0) {
                this.button.classList.remove('active');
            }
        }, 1500);
    }

    removeOldestTree() {
        if (this.activeTrees.length > 0) {
            const oldestTree = this.activeTrees[0];
            this.removeTree(oldestTree);
        }
    }

    clearAllTrees() {
        this.activeTrees.forEach(tree => {
            tree.remove();
        });
        this.activeTrees = [];
        this.button.classList.remove('active');
    }
}

// Add CSS for floating hearts animation
const style = document.createElement('style');
style.textContent = `
    @keyframes floatUp {
        0% {
            transform: translateY(0) rotate(0deg);
            opacity: 0;
        }
        10% {
            opacity: 0.8;
        }
        90% {
            opacity: 0.8;
        }
        100% {
            transform: translateY(-100vh) rotate(360deg);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ================================
// Fireworks Controller
// ================================

class FireworksController {
    constructor(buttonId) {
        this.button = document.getElementById(buttonId);
        this.isActive = false;
        this.colors = [
            '#ff6b9d', '#ffd700', '#00ff00', '#00bfff', 
            '#ff69b4', '#ff1493', '#ff4500', '#9370db',
            '#00fa9a', '#ffa500', '#ff6347', '#7fff00'
        ];
        
        this.init();
    }

    init() {
        this.button.addEventListener('click', () => this.launch());
    }

    launch() {
        if (this.isActive) return;
        
        this.isActive = true;
        this.button.classList.add('active');
        
        // Launch multiple fireworks
        for (let i = 0; i < 8; i++) {
            setTimeout(() => {
                this.createFirework();
            }, i * 400);
        }
        
        // Reset button after sequence
        setTimeout(() => {
            this.isActive = false;
            this.button.classList.remove('active');
        }, 4000);
    }

    createFirework() {
        const startX = Math.random() * window.innerWidth;
        const startY = window.innerHeight;
        const endX = startX + (Math.random() - 0.5) * 200;
        const endY = Math.random() * (window.innerHeight * 0.4) + 100;
        
        // Create rocket trail
        this.createRocketTrail(startX, startY, endX, endY);
        
        // Explode after delay
        setTimeout(() => {
            this.explode(endX, endY);
        }, 800);
    }

    createRocketTrail(startX, startY, endX, endY) {
        const trail = document.createElement('div');
        trail.className = 'firework-trail';
        trail.style.left = startX + 'px';
        trail.style.top = startY + 'px';
        
        document.body.appendChild(trail);
        
        // Animate rocket to destination
        const duration = 800;
        const startTime = Date.now();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const currentX = startX + (endX - startX) * progress;
            const currentY = startY + (endY - startY) * progress;
            
            trail.style.left = currentX + 'px';
            trail.style.top = currentY + 'px';
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                setTimeout(() => trail.remove(), 1000);
            }
        };
        
        animate();
    }

    explode(x, y) {
        const particleCount = 40;
        const color = this.colors[Math.floor(Math.random() * this.colors.length)];
        
        const firework = document.createElement('div');
        firework.className = 'firework';
        firework.style.left = x + 'px';
        firework.style.top = y + 'px';
        
        document.body.appendChild(firework);
        
        // Create particles
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'firework-particle';
            particle.style.backgroundColor = color;
            
            const angle = (Math.PI * 2 * i) / particleCount;
            const velocity = 100 + Math.random() * 100;
            const tx = Math.cos(angle) * velocity;
            const ty = Math.sin(angle) * velocity;
            
            particle.style.animation = `explode ${1.5 + Math.random() * 0.5}s ease-out forwards`;
            particle.style.setProperty('--tx', tx + 'px');
            particle.style.setProperty('--ty', ty + 'px');
            
            // Set transform directly in style
            particle.style.transform = `translate(${tx}px, ${ty}px) scale(0)`;
            
            firework.appendChild(particle);
        }
        
        // Add glow effect
        const glow = document.createElement('div');
        glow.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 100px;
            height: 100px;
            background: radial-gradient(circle, ${color}, transparent);
            opacity: 0.8;
            animation: glowFade 1s ease-out forwards;
        `;
        firework.appendChild(glow);
        
        // Cleanup
        setTimeout(() => {
            firework.remove();
        }, 3000);
    }
}

// Add glow animation
const glowStyle = document.createElement('style');
glowStyle.textContent = `
    @keyframes glowFade {
        0% {
            transform: translate(-50%, -50%) scale(0);
            opacity: 0.8;
        }
        100% {
            transform: translate(-50%, -50%) scale(3);
            opacity: 0;
        }
    }
`;
document.head.appendChild(glowStyle);

// ================================
// Ultimate Celebration Controller
// ================================

class UltimateCelebration {
    constructor(buttonId) {
        this.button = document.getElementById(buttonId);
        this.isActive = false;
        
        this.init();
    }

    init() {
        this.button.addEventListener('click', () => this.activate());
    }

    activate() {
        if (this.isActive) return;
        
        this.isActive = true;
        this.button.classList.add('active');
        
        // Screen flash
        this.createScreenFlash();
        
        // Massive confetti
        this.launchConfetti(200);
        
        // Multiple fireworks
        this.launchFireworksShow();
        
        // Spawn multiple trees
        this.spawnTrees();
        
        // Heart burst
        this.heartBurst();
        
        // Display celebration message
        this.showCelebrationMessage();
        
        // Play all effects together
        this.triggerAllEffects();
        
        // Reset after celebration
        setTimeout(() => {
            this.isActive = false;
            this.button.classList.remove('active');
        }, 8000);
    }

    createScreenFlash() {
        const flash = document.createElement('div');
        flash.className = 'screen-flash';
        document.body.appendChild(flash);
        
        setTimeout(() => flash.remove(), 500);
    }

    launchConfetti(count) {
        const colors = ['#ff6b9d', '#ffd700', '#00ff00', '#00bfff', '#ff69b4', '#ff1493', '#9370db'];
        const shapes = ['●', '■', '▲', '★', '♥'];
        
        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.className = 'confetti-piece';
                confetti.textContent = shapes[Math.floor(Math.random() * shapes.length)];
                confetti.style.left = Math.random() * 100 + '%';
                confetti.style.top = '-20px';
                confetti.style.color = colors[Math.floor(Math.random() * colors.length)];
                confetti.style.fontSize = (Math.random() * 20 + 15) + 'px';
                confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
                confetti.style.animationDelay = (Math.random() * 0.5) + 's';
                
                document.body.appendChild(confetti);
                
                setTimeout(() => confetti.remove(), 5000);
            }, i * 20);
        }
    }

    launchFireworksShow() {
        // Trigger massive fireworks system - 15 fireworks over 6 seconds
        const fireworksController = window.birthdayApp.fireworksController;
        if (fireworksController) {
            for (let i = 0; i < 15; i++) {
                setTimeout(() => {
                    fireworksController.createFirework();
                }, i * 400);
            }
        }
    }

    spawnTrees() {
        const treeCreator = window.birthdayApp.treeCreator;
        if (treeCreator) {
            for (let i = 0; i < 3; i++) {
                setTimeout(() => {
                    treeCreator.createTree();
                }, i * 500);
            }
        }
    }

    heartBurst() {
        const hearts = ['♥', '♡', '❤', '💕', '💖', '💗', '💝', '💘'];
        
        for (let i = 0; i < 100; i++) {
            setTimeout(() => {
                const heart = document.createElement('div');
                heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
                heart.style.cssText = `
                    position: fixed;
                    font-size: ${Math.random() * 30 + 20}px;
                    color: #ff69b4;
                    left: 50%;
                    top: 50%;
                    pointer-events: none;
                    z-index: 9999;
                    animation: heartBurstOut ${Math.random() * 2 + 2}s ease-out forwards;
                `;
                
                const angle = (Math.PI * 2 * i) / 50;
                const distance = 200 + Math.random() * 300;
                heart.style.setProperty('--angle', angle);
                heart.style.setProperty('--distance', distance + 'px');
                
                document.body.appendChild(heart);
                
                setTimeout(() => heart.remove(), 4000);
            }, i * 10);
        }
    }

    showCelebrationMessage() {
        const banner = document.createElement('div');
        banner.className = 'message-banner';
        banner.innerHTML = '<h2>🎊 Happy Birthday! 🎊</h2>';
        
        document.body.appendChild(banner);
        
        setTimeout(() => {
            banner.classList.add('fade-out');
            setTimeout(() => banner.remove(), 1000);
        }, 4000);
    }

    triggerAllEffects() {
        // Shake screen slightly
        document.body.style.animation = 'shake 0.5s ease-in-out';
        setTimeout(() => {
            document.body.style.animation = '';
        }, 500);
    }
}

// Add heart burst animation
const heartBurstStyle = document.createElement('style');
heartBurstStyle.textContent = `
    @keyframes heartBurstOut {
        0% {
            transform: translate(-50%, -50%) scale(0) rotate(0deg);
            opacity: 1;
        }
        100% {
            transform: translate(
                calc(-50% + cos(var(--angle)) * var(--distance)),
                calc(-50% + sin(var(--angle)) * var(--distance))
            ) scale(1.5) rotate(720deg);
            opacity: 0;
        }
    }

    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-10px); }
        75% { transform: translateX(10px); }
    }
`;
document.head.appendChild(heartBurstStyle);

// ================================
// Image Carousel Controller
// ================================

class ImageCarouselController {
    constructor() {
        this.carousels = document.querySelectorAll('.image-carousel');
        this.imageDatabase = {
            cake: [
                'p4.jpg', // Chocolate cake// Celebration cake
                'p5.jpg', // Pink cake
            ],
            chocolate: [
                'p2.jpg',
                'p5.jpg', // Chocolate truffles
            ],
            love: [
                'p3.jpg',
                'p5.jpg',  // Love decoration
            ]
        };
        
        this.currentIndices = {};
        this.init();
    }

    init() {
        this.carousels.forEach(carousel => {
            const category = carousel.getAttribute('data-category');
            const img = carousel.querySelector('.carousel-image');
            
            if (this.imageDatabase[category]) {
                // Initialize with first image
                this.currentIndices[category] = 0;
                this.loadImage(img, this.imageDatabase[category][0]);
                
                // Start rotation
                this.startRotation(carousel, category);
            }
        });
    }

    loadImage(imgElement, src) {
        const tempImg = new Image();
        tempImg.onload = () => {
            imgElement.src = src;
            imgElement.classList.add('active');
        };
        tempImg.onerror = () => {
            // Fallback gradient if image fails to load
            imgElement.style.background = 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))';
        };
        tempImg.src = src;
    }

    startRotation(carousel, category) {
        const img = carousel.querySelector('.carousel-image');
        const images = this.imageDatabase[category];
        
        setInterval(() => {
            // Fade out current image
            img.classList.remove('active');
            
            setTimeout(() => {
                // Move to next image
                this.currentIndices[category] = (this.currentIndices[category] + 1) % images.length;
                const nextImage = images[this.currentIndices[category]];
                
                // Load and fade in new image
                this.loadImage(img, nextImage);
            }, 800); // Wait for fade out
            
        }, 5000); // Change image every 5 seconds
    }
}

class InteractiveEffects {
    constructor() {
        this.init();
    }

    init() {
        this.addImageHoverEffects();
    }

    addImageHoverEffects() {
        const carousels = document.querySelectorAll('.image-carousel');
        carousels.forEach(carousel => {
            carousel.addEventListener('mouseenter', () => {
                carousel.style.transition = 'transform 0.3s ease';
            });
        });
    }
}

// ================================
// Performance Monitor
// ================================

class PerformanceMonitor {
    constructor() {
        this.checkPerformance();
    }

    checkPerformance() {
        // Reduce particles on low-end devices
        if (window.innerWidth < 768) {
            const canvas = document.getElementById('particleCanvas');
            if (canvas) {
                canvas.style.opacity = '0.2';
            }
        }

        // Reduce animations if prefers-reduced-motion
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            document.body.style.setProperty('--transition-smooth', 'none');
            document.body.style.setProperty('--transition-bounce', 'none');
        }
    }
}

// ================================
// Initialize Application
// ================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('🎂 Happy Birthday Application Initialized');

    // Initialize particle system
    const particleSystem = new ParticleSystem('particleCanvas', 60);

    // Initialize music controller
    const musicController = new MusicController('bgAudio', 'musicBtn');

    // Initialize theme controller
    const themeController = new ThemeController('modeBtn');

    // Initialize floating hearts
    const floatingHearts = new FloatingHeartsEffect();
    floatingHearts.start();

    // Initialize love tree creator
    const loveTreeCreator = new LoveTreeCreator('treeBtn');

    // Initialize image carousel
    const imageCarousel = new ImageCarouselController();

    // Initialize fireworks controller (used internally by ultimate celebration)
    const fireworksController = new FireworksController('ultimateBtn');

    // Initialize ultimate celebration
    const ultimateCelebration = new UltimateCelebration('ultimateBtn');

    // Initialize interactive effects
    const interactiveEffects = new InteractiveEffects();

    // Initialize performance monitor
    const performanceMonitor = new PerformanceMonitor();

    // Store references for cross-component access
    window.birthdayApp = window.birthdayApp || {};
    window.birthdayApp.fireworksController = fireworksController;
    window.birthdayApp.treeCreator = loveTreeCreator;
    window.birthdayApp.floatingHearts = floatingHearts;

    // Add smooth scroll behavior
    document.documentElement.style.scrollBehavior = 'smooth';

    // Easter egg: Konami code
    let konamiCode = [];
    const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    
    document.addEventListener('keydown', (e) => {
        konamiCode.push(e.key);
        konamiCode = konamiCode.slice(-10);
        
        if (konamiCode.join(',') === konamiSequence.join(',')) {
            triggerSpecialEffect();
        }
    });

    function triggerSpecialEffect() {
        // Trigger ultimate celebration
        ultimateCelebration.activate();
    }

    // Log theme changes
    window.addEventListener('storage', (e) => {
        if (e.key === 'theme') {
            console.log('Theme changed to:', e.newValue);
        }
    });

    // Cursor trail effect (optional enhancement)
    let cursorTrail = [];
    const maxTrailLength = 20;

    document.addEventListener('mousemove', (e) => {
        if (window.innerWidth > 768) {
            createCursorTrail(e.clientX, e.clientY);
        }
    });

    function createCursorTrail(x, y) {
        const trail = document.createElement('div');
        trail.style.cssText = `
            position: fixed;
            width: 4px;
            height: 4px;
            background: var(--accent-primary);
            border-radius: 50%;
            pointer-events: none;
            z-index: 9998;
            left: ${x}px;
            top: ${y}px;
            opacity: 0.5;
            transition: all 0.5s;
        `;
        
        document.body.appendChild(trail);
        
        setTimeout(() => {
            trail.style.opacity = '0';
            trail.style.transform = 'scale(0)';
        }, 10);
        
        setTimeout(() => {
            trail.remove();
        }, 500);
    }

    console.log('✨ All systems initialized. Enjoy the celebration!');
});

// ================================
// Export for debugging (optional)
// ================================

window.birthdayApp = {
    state,
    version: '2.0.0',
    theme: () => state.currentTheme,
    toggleMusic: () => document.getElementById('musicBtn').click(),
    toggleTheme: () => document.getElementById('modeBtn').click(),
    growTree: () => document.getElementById('treeBtn').click(),
    celebrate: () => document.getElementById('ultimateBtn').click()
};s