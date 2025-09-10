// BharatVRsh Web Platform - Main Application JavaScript
// Core functionality for heritage AR tourism platform

class BharatVRsh {
    constructor() {
        this.isLoading = true;
        this.currentLanguage = 'en';
        this.currentSection = 'home';
        this.heritageSites = [];
        this.tours = [];
        this.isARSupported = false;
        
        this.init();
    }
    
    async init() {
        console.log('Initializing BharatVRsh Platform...');
        
        // Check device capabilities
        await this.checkDeviceCapabilities();
        
        // Load initial data
        await this.loadInitialData();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Initialize components
        this.initializeComponents();
        
        // Hide loading screen
        setTimeout(() => {
            this.hideLoadingScreen();
        }, 2000);
    }
    
    async checkDeviceCapabilities() {
        // Check WebXR support
        if ('xr' in navigator) {
            try {
                const isSupported = await navigator.xr.isSessionSupported('immersive-ar');
                this.isARSupported = isSupported;
                console.log('AR Support:', isSupported);
            } catch (error) {
                console.log('AR not supported:', error);
                this.isARSupported = false;
            }
        }
        
        // Check device orientation support
        if ('DeviceOrientationEvent' in window) {
            console.log('Device orientation supported');
        }
        
        // Check geolocation support
        if ('geolocation' in navigator) {
            console.log('Geolocation supported');
        }
    }
    
    async loadInitialData() {
        try {
            // Load heritage sites data
            this.heritageSites = await this.fetchHeritageSites();
            console.log('Loaded heritage sites:', this.heritageSites.length);
            
            // Load tours data
            this.tours = await this.fetchTours();
            console.log('Loaded tours:', this.tours.length);
            
            // Load language preferences
            this.loadLanguagePreferences();
            
        } catch (error) {
            console.error('Error loading initial data:', error);
        }
    }
    
    async fetchHeritageSites() {
        // Mock data for demonstration
        return [
            {
                id: 'bateshwar',
                name: 'Bateshwar Temple Complex',
                category: 'temple',
                location: 'Morena, Madhya Pradesh',
                description: 'A magnificent cluster of over 200 restored 8th-9th century Hindu temples',
                thumbnailUrl: '/assets/images/bateshwar-thumb.jpg',
                imageUrl: '/assets/images/bateshwar-featured.jpg',
                tourDuration: '45 min',
                languages: ['hi', 'en', 'mr'],
                isOfflineAvailable: true,
                rating: 4.8,
                reviewCount: 1247,
                culturalPeriod: '8th-9th Century CE',
                significance: 'Largest temple complex in North India'
            },
            {
                id: 'udaygiri',
                name: 'Udaygiri Caves',
                category: 'cave',
                location: 'Vidisha, Madhya Pradesh',
                description: 'Ancient rock-cut caves from the Gupta period with intricate sculptures',
                thumbnailUrl: '/assets/images/udaygiri-thumb.jpg',
                imageUrl: '/assets/images/udaygiri-featured.jpg',
                tourDuration: '30 min',
                languages: ['hi', 'en'],
                isOfflineAvailable: true,
                rating: 4.6,
                reviewCount: 892,
                culturalPeriod: '4th-5th Century CE',
                significance: 'Gupta period rock-cut architecture'
            },
            {
                id: 'dongla',
                name: 'Dongla Observatory',
                category: 'observatory',
                location: 'Ujjain, Madhya Pradesh',
                description: 'Medieval astronomical observatory with ancient instruments',
                thumbnailUrl: '/assets/images/dongla-thumb.jpg',
                imageUrl: '/assets/images/dongla-featured.jpg',
                tourDuration: '25 min',
                languages: ['hi', 'en'],
                isOfflineAvailable: false,
                rating: 4.5,
                reviewCount: 634,
                culturalPeriod: '15th-16th Century CE',
                significance: 'Ancient astronomical knowledge center'
            }
        ];
    }
    
    async fetchTours() {
        // Mock tours data
        return [
            {
                id: 'bateshwar-basic',
                siteId: 'bateshwar',
                name: 'Heritage Discovery Tour',
                description: 'Explore the architectural marvels of Bateshwar temples',
                duration: 45,
                language: 'en',
                type: 'audio_guided',
                price: 0,
                narrator: 'Dr. Priya Sharma',
                rating: 4.9,
                thumbnailUrl: '/assets/images/tour-bateshwar.jpg'
            },
            {
                id: 'udaygiri-exploration',
                siteId: 'udaygiri',
                name: 'Cave Art Exploration',
                description: 'Discover Gupta period sculptures and rock art',
                duration: 30,
                language: 'en',
                type: 'audio_guided',
                price: 0,
                narrator: 'Prof. Raj Kumar',
                rating: 4.7,
                thumbnailUrl: '/assets/images/tour-udaygiri.jpg'
            }
        ];
    }
    
    loadLanguagePreferences() {
        const savedLanguage = localStorage.getItem('bharatvrsh_language');
        if (savedLanguage && ['en', 'hi', 'mr'].includes(savedLanguage)) {
            this.currentLanguage = savedLanguage;
            document.getElementById('language-select').value = savedLanguage;
        }
    }
    
    setupEventListeners() {
        // Navigation
        document.addEventListener('click', (e) => {
            if (e.target.matches('.nav-link')) {
                e.preventDefault();
                const section = e.target.dataset.section;
                this.navigateToSection(section);
            }
        });
        
        // Language selector
        const languageSelect = document.getElementById('language-select');
        languageSelect.addEventListener('change', (e) => {
            this.changeLanguage(e.target.value);
        });
        
        // Mobile navigation toggle
        const navToggle = document.getElementById('nav-toggle');
        const navMenu = document.getElementById('nav-menu');
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
        
        // Hero buttons
        document.getElementById('start-journey-btn').addEventListener('click', () => {
            this.navigateToSection('heritage-sites');
        });
        
        document.getElementById('watch-demo-btn').addEventListener('click', () => {
            this.showVideoModal();
        });
        
        // Get app button
        document.getElementById('get-app-btn').addEventListener('click', () => {
            this.showAppDownloadOptions();
        });
        
        // AR Experience button
        const startARBtn = document.getElementById('start-ar-btn');
        if (startARBtn) {
            startARBtn.addEventListener('click', () => {
                this.startARExperience();
            });
        }
        
        // Modal close buttons
        document.addEventListener('click', (e) => {
            if (e.target.matches('.modal-close') || e.target.matches('.modal')) {
                this.closeAllModals();
            }
        });
        
        // Smooth scrolling for anchor links
        document.addEventListener('click', (e) => {
            if (e.target.matches('a[href^="#"]')) {
                e.preventDefault();
                const target = document.querySelector(e.target.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
        
        // Scroll events for header transparency
        let lastScroll = 0;
        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;
            const header = document.getElementById('main-header');
            
            if (currentScroll > 100) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
            
            lastScroll = currentScroll;
        });
        
        // Intersection Observer for section navigation
        this.setupIntersectionObserver();
    }
    
    setupIntersectionObserver() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-link');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.id;
                    
                    // Update active nav link
                    navLinks.forEach(link => {
                        link.classList.remove('active');
                        if (link.dataset.section === id) {
                            link.classList.add('active');
                        }
                    });
                    
                    this.currentSection = id;
                }
            });
        }, {
            threshold: 0.3,
            rootMargin: '-80px 0px -80px 0px'
        });
        
        sections.forEach(section => observer.observe(section));
    }
    
    initializeComponents() {
        // Render heritage sites
        this.renderHeritageSites();
        
        // Render tours
        this.renderTours();
        
        // Initialize load more functionality
        this.setupLoadMore();
        
        // Initialize tour categories
        this.setupTourCategories();
        
        // Apply current language
        this.applyLanguage(this.currentLanguage);
    }
    
    renderHeritageSites() {
        const sitesGrid = document.getElementById('sites-grid');
        if (!sitesGrid) return;
        
        const sitesHTML = this.heritageSites.map(site => `
            <div class="site-card" data-site-id="${site.id}">
                <div class="site-card-image">
                    <img src="${site.thumbnailUrl}" alt="${site.name}" loading="lazy">
                    ${site.isOfflineAvailable ? '<div class="offline-badge"><span class="material-icons">offline_pin</span></div>' : ''}
                </div>
                <div class="site-card-content">
                    <div class="site-category">${this.getCategoryLabel(site.category)}</div>
                    <h3 class="site-card-title">${site.name}</h3>
                    <p class="site-card-description">${site.description}</p>
                    <div class="site-card-meta">
                        <span><span class="material-icons">schedule</span> ${site.tourDuration}</span>
                        <span><span class="material-icons">star</span> ${site.rating}</span>
                    </div>
                    <div class="site-card-actions">
                        <button class="btn btn-primary btn-sm" onclick="app.startVirtualTour('${site.id}')">
                            <span class="material-icons">play_arrow</span>
                            Virtual Tour
                        </button>
                        <button class="btn btn-outline btn-sm" onclick="app.viewInAR('${site.id}')" ${!this.isARSupported ? 'disabled' : ''}>
                            <span class="material-icons">view_in_ar</span>
                            AR View
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
        
        sitesGrid.innerHTML = sitesHTML;
    }
    
    renderTours() {
        const toursGrid = document.getElementById('tours-grid');
        if (!toursGrid) return;
        
        const toursHTML = this.tours.map(tour => `
            <div class="tour-card" data-tour-id="${tour.id}">
                <div class="tour-card-image">
                    <img src="${tour.thumbnailUrl}" alt="${tour.name}" loading="lazy">
                    <div class="tour-duration">${tour.duration} min</div>
                </div>
                <div class="tour-card-content">
                    <h3 class="tour-card-title">${tour.name}</h3>
                    <p class="tour-card-description">${tour.description}</p>
                    <div class="tour-card-meta">
                        <span class="narrator">Narrated by ${tour.narrator}</span>
                        <div class="tour-rating">
                            <span class="material-icons">star</span>
                            <span>${tour.rating}</span>
                        </div>
                    </div>
                    <button class="btn btn-primary" onclick="app.startTour('${tour.id}')">
                        <span class="material-icons">play_arrow</span>
                        Start Tour
                    </button>
                </div>
            </div>
        `).join('');
        
        toursGrid.innerHTML = toursHTML;
    }
    
    setupLoadMore() {
        const loadMoreBtn = document.getElementById('load-more-sites');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', async () => {
                loadMoreBtn.textContent = 'Loading...';
                loadMoreBtn.disabled = true;
                
                // Simulate loading more sites
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // In real implementation, fetch more sites here
                
                loadMoreBtn.textContent = 'Load More Sites';
                loadMoreBtn.disabled = false;
            });
        }
    }
    
    setupTourCategories() {
        const categoryBtns = document.querySelectorAll('.category-btn');
        categoryBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Remove active class from all buttons
                categoryBtns.forEach(b => b.classList.remove('active'));
                
                // Add active class to clicked button
                btn.classList.add('active');
                
                // Filter tours by category
                const category = btn.dataset.category;
                this.filterTours(category);
            });
        });
    }
    
    filterTours(category) {
        const tourCards = document.querySelectorAll('.tour-card');
        
        tourCards.forEach(card => {
            const tourId = card.dataset.tourId;
            const tour = this.tours.find(t => t.id === tourId);
            
            if (category === 'all' || !tour) {
                card.style.display = 'block';
            } else {
                const site = this.heritageSites.find(s => s.id === tour.siteId);
                if (site && site.category === category) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            }
        });
    }
    
    navigateToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth' });
        }
    }
    
    changeLanguage(language) {
        this.currentLanguage = language;
        localStorage.setItem('bharatvrsh_language', language);
        this.applyLanguage(language);
        
        // In real implementation, reload content with new language
        console.log('Language changed to:', language);
    }
    
    applyLanguage(language) {
        // Apply language-specific changes
        document.documentElement.lang = language;
        
        // Update content based on language
        // In real implementation, load translations here
    }
    
    getCategoryLabel(category) {
        const labels = {
            temple: 'Temple',
            cave: 'Cave',
            fort: 'Fort',
            observatory: 'Observatory'
        };
        return labels[category] || category;
    }
    
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
            this.isLoading = false;
        }, 500);
    }
    
    showVideoModal() {
        const modal = document.getElementById('video-modal');
        const video = document.getElementById('demo-video');
        
        modal.style.display = 'block';
        video.play();
        
        // Pause video when modal is closed
        modal.addEventListener('click', () => {
            video.pause();
        });
    }
    
    showAppDownloadOptions() {
        // Detect platform and show appropriate download
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const isAndroid = /Android/.test(navigator.userAgent);
        
        if (isIOS) {
            window.open('https://apps.apple.com/app/bharatvrsh', '_blank');
        } else if (isAndroid) {
            window.open('https://play.google.com/store/apps/details?id=com.bharatvrsh', '_blank');
        } else {
            // Show both options
            this.showModal('Download BharatVRsh App', `
                <div class="download-options">
                    <a href="https://apps.apple.com/app/bharatvrsh" class="download-btn ios">
                        <img src="/assets/icons/app-store.png" alt="Download on App Store">
                    </a>
                    <a href="https://play.google.com/store/apps/details?id=com.bharatvrsh" class="download-btn android">
                        <img src="/assets/icons/google-play.png" alt="Get it on Google Play">
                    </a>
                </div>
            `);
        }
    }
    
    startARExperience(siteId = 'bateshwar') {
        if (!this.isARSupported) {
            this.showNotification('AR not supported on this device. Please use a mobile device with AR capabilities.', 'warning');
            return;
        }
        
        const modal = document.getElementById('ar-modal');
        modal.style.display = 'block';
        
        // Initialize AR viewer
        this.initializeARViewer(siteId);
    }
    
    async initializeARViewer(siteId) {
        const container = document.getElementById('ar-container');
        
        try {
            // Initialize WebXR AR session
            const session = await navigator.xr.requestSession('immersive-ar', {
                requiredFeatures: ['local'],
                optionalFeatures: ['dom-overlay'],
                domOverlay: { root: container }
            });
            
            // Setup AR scene
            this.setupARScene(session, siteId);
            
        } catch (error) {
            console.error('Failed to start AR session:', error);
            this.showNotification('Failed to start AR experience. Please try again.', 'error');
        }
    }
    
    setupARScene(session, siteId) {
        // This would integrate with Three.js or WebXR for actual AR rendering
        console.log('Setting up AR scene for site:', siteId);
        
        // Mock AR controls
        document.getElementById('place-model').addEventListener('click', () => {
            this.showNotification('3D model placed in AR!', 'success');
        });
        
        document.getElementById('start-tour').addEventListener('click', () => {
            this.startARTour(siteId);
        });
        
        document.getElementById('toggle-info').addEventListener('click', () => {
            this.toggleARInfo();
        });
    }
    
    startVirtualTour(siteId) {
        const site = this.heritageSites.find(s => s.id === siteId);
        if (!site) return;
        
        // Navigate to dedicated tour page or start inline tour
        this.showNotification(`Starting virtual tour of ${site.name}`, 'info');
        
        // In real implementation, this would start the virtual tour experience
        console.log('Starting virtual tour for:', site.name);
    }
    
    viewInAR(siteId) {
        this.startARExperience(siteId);
    }
    
    startTour(tourId) {
        const tour = this.tours.find(t => t.id === tourId);
        if (!tour) return;
        
        this.showNotification(`Starting ${tour.name}`, 'info');
        
        // In real implementation, start the audio tour
        console.log('Starting tour:', tour.name);
    }
    
    startARTour(siteId) {
        this.showNotification('AR guided tour started!', 'success');
        console.log('Starting AR tour for site:', siteId);
    }
    
    toggleARInfo() {
        // Toggle information overlay in AR
        console.log('Toggling AR information overlay');
    }
    
    closeAllModals() {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.style.display = 'none';
        });
    }
    
    showModal(title, content) {
        // Create and show custom modal
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="modal-close">&times;</span>
                <h3>${title}</h3>
                <div>${content}</div>
            </div>
        `;
        
        document.body.appendChild(modal);
        modal.style.display = 'block';
        
        // Auto-remove modal when closed
        modal.addEventListener('click', (e) => {
            if (e.target === modal || e.target.classList.contains('modal-close')) {
                document.body.removeChild(modal);
            }
        });
    }
    
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        `;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.classList.add('fade-out');
                setTimeout(() => {
                    if (notification.parentNode) {
                        document.body.removeChild(notification);
                    }
                }, 300);
            }
        }, 5000);
        
        // Manual close
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.classList.add('fade-out');
            setTimeout(() => {
                if (notification.parentNode) {
                    document.body.removeChild(notification);
                }
            }, 300);
        });
    }
    
    // Analytics tracking
    trackEvent(eventName, properties = {}) {
        console.log('Analytics event:', eventName, properties);
        
        // In real implementation, send to analytics service
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, properties);
        }
    }
    
    // Performance monitoring
    measurePerformance(name, fn) {
        const start = performance.now();
        const result = fn();
        const end = performance.now();
        
        console.log(`Performance [${name}]: ${end - start}ms`);
        return result;
    }
}

// Utility functions
const utils = {
    // Format duration in minutes to readable format
    formatDuration(minutes) {
        if (minutes < 60) {
            return `${minutes} min`;
        }
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m`;
    },
    
    // Format large numbers
    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    },
    
    // Debounce function
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    // Check if element is in viewport
    isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    },
    
    // Lazy load images
    setupLazyLoading() {
        const images = document.querySelectorAll('img[loading="lazy"]');
        
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src || img.src;
                        img.classList.remove('lazy');
                        imageObserver.unobserve(img);
                    }
                });
            });
            
            images.forEach(img => imageObserver.observe(img));
        }
    }
};

// Initialize application when DOM is loaded
let app;

document.addEventListener('DOMContentLoaded', () => {
    app = new BharatVRsh();
    utils.setupLazyLoading();
});

// Error handling
window.addEventListener('error', (event) => {
    console.error('Application error:', event.error);
    
    // In production, send errors to monitoring service
    if (typeof app !== 'undefined' && app.showNotification) {
        app.showNotification('An error occurred. Please refresh the page.', 'error');
    }
});

// Handle offline/online status
window.addEventListener('online', () => {
    if (typeof app !== 'undefined' && app.showNotification) {
        app.showNotification('Connection restored', 'success');
    }
});

window.addEventListener('offline', () => {
    if (typeof app !== 'undefined' && app.showNotification) {
        app.showNotification('You are offline. Some features may not work.', 'warning');
    }
});

// Export for global access
window.BharatVRsh = BharatVRsh;
window.utils = utils;