# BharatVRsh Web Platform README

## Overview

The **BharatVRsh Web Platform** is a Progressive Web Application (PWA) that provides immersive heritage tourism experiences through AR and virtual tours. This web platform complements the mobile application and serves as the primary entry point for users to discover and explore India's cultural heritage sites.

## Project Structure

```
web-platform/
├── index.html              # Main HTML file with complete page structure
├── manifest.json           # PWA manifest for installability
├── sw.js                  # Service Worker for offline functionality
├── styles/
│   ├── main.css           # Main stylesheet with design system
│   ├── heritage.css       # Heritage-specific styles
│   └── ar-viewer.css      # AR viewer component styles
├── scripts/
│   ├── app.js            # Main application logic
│   ├── ar-viewer.js      # WebXR AR implementation
│   ├── heritage-sites.js # Heritage site management
│   ├── tours.js          # Virtual tour functionality
│   └── utils.js          # Utility functions
├── assets/
│   ├── images/           # Site images and thumbnails
│   ├── models/           # 3D heritage site models (GLB/GLTF)
│   ├── audio/            # Tour audio narrations
│   ├── videos/           # Demo and background videos
│   └── icons/            # PWA icons and graphics
└── README.md             # This file
```

## Key Features

### 🏛️ Heritage Site Exploration
- **Interactive Site Gallery**: Browse heritage sites with rich media
- **Detailed Site Information**: Cultural significance, historical periods, accessibility info
- **Category Filtering**: Filter by temples, caves, forts, observatories
- **Multilingual Support**: Content in Hindi, English, and Marathi

### 🔮 Augmented Reality Experience
- **WebXR Integration**: Cross-platform AR using WebXR standards
- **3D Heritage Models**: High-fidelity digital twins of heritage sites
- **Interactive Hotspots**: Touch points with cultural information
- **Guided AR Tours**: Narrated experiences with camera movement

### 🎯 Virtual Tours
- **Audio-Guided Tours**: Expert narrations with cultural context
- **Live Guide Booking**: Connect with local MSME heritage guides
- **Tour Categories**: Different experience types for various interests
- **Progress Tracking**: Save and resume tour progress

### 📱 Progressive Web App
- **Offline Capability**: Works without internet connection
- **Push Notifications**: Updates about new content and tours
- **App-like Experience**: Install to home screen, fullscreen mode
- **Background Sync**: Sync data when connection is restored

## Technical Architecture

### Frontend Stack
- **HTML5**: Semantic markup with accessibility features
- **CSS3**: Modern design system with CSS Grid and Flexbox
- **JavaScript ES6+**: Modular architecture with classes
- **WebXR**: AR experiences using WebXR Device API
- **Three.js**: 3D rendering and model loading
- **Service Workers**: Offline functionality and caching

### AR Implementation
- **WebXR Device API**: Standard AR/VR web API
- **ARCore/ARKit**: Device-native AR capabilities
- **Hit Testing**: Surface detection for model placement
- **Light Estimation**: Realistic lighting in AR scenes
- **DOM Overlay**: UI elements over AR content

### Performance Optimizations
- **Lazy Loading**: Images and models loaded on demand
- **Level of Detail (LOD)**: Multiple quality levels for 3D models
- **Caching Strategy**: Multi-tier caching for different content types
- **Progressive Loading**: Critical content loaded first
- **Asset Compression**: Optimized images and models

## Setup and Installation

### Prerequisites
- **Web Server**: Apache, Nginx, or Node.js server
- **HTTPS**: Required for WebXR and PWA features
- **Modern Browser**: Chrome 79+, Firefox 70+, Safari 13+

### Local Development
```bash
# Clone the repository
git clone https://github.com/x8studios/bharatvrsh-web

# Navigate to web platform
cd bharatvrsh-web/web-platform

# Start local server (Python example)
python -m http.server 8000

# Or use Node.js
npx http-server -p 8000 -c-1

# Open in browser
open https://localhost:8000
```

### Production Deployment
```bash
# Build optimized assets
npm run build

# Deploy to web server
# Ensure HTTPS is configured
# Configure proper MIME types for .glb files
# Set up CDN for static assets
```

### Required Server Configuration
```nginx
# Nginx configuration for PWA
location ~* \.(glb|gltf)$ {
    add_header Content-Type model/gltf-binary;
    add_header Cache-Control "public, max-age=31536000";
}

location /manifest.json {
    add_header Content-Type application/manifest+json;
}

location /sw.js {
    add_header Content-Type application/javascript;
    add_header Cache-Control "no-cache";
}
```

## Browser Compatibility

### WebXR Support
| Browser | AR Support | Version |
|---------|------------|---------|
| Chrome Android | ✅ | 79+ |
| Chrome Desktop | ✅ | 79+ |
| Edge | ✅ | 79+ |
| Firefox | ⚠️ | Experimental |
| Safari iOS | ⚠️ | WebXR Viewer |

### PWA Features
| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Service Workers | ✅ | ✅ | ✅ | ✅ |
| Web App Manifest | ✅ | ✅ | ✅ | ✅ |
| Push Notifications | ✅ | ✅ | ⚠️ | ✅ |
| Background Sync | ✅ | ⚠️ | ❌ | ✅ |

## Usage Guide

### Basic Navigation
1. **Home Page**: Hero section with quick access to features
2. **Heritage Sites**: Browse and filter available sites
3. **Virtual Tours**: Access guided experiences
4. **AR Experience**: Launch WebXR AR viewer
5. **Community**: Connect with local guides and MSME partners

### Starting an AR Experience
```javascript
// Check AR support
if (navigator.xr) {
    const supported = await navigator.xr.isSessionSupported('immersive-ar');
    if (supported) {
        // Launch AR experience
        app.startARExperience('bateshwar');
    }
}
```

### Offline Usage
1. **Initial Visit**: Core content cached automatically
2. **Download Sites**: Use "Download for Offline" button
3. **Offline Access**: All downloaded content available without internet
4. **Background Sync**: Data synced when connection restored

## API Integration

### Heritage Sites API
```javascript
// Fetch heritage sites
const response = await fetch('/api/heritage/sites?category=temple');
const sites = await response.json();

// Get site details
const siteDetail = await fetch('/api/heritage/sites/bateshwar');
```

### Tour Management
```javascript
// Start virtual tour
const tour = await fetch('/api/tours/bateshwar-basic');
const tourData = await tour.json();

// Book live guide
const booking = await fetch('/api/guides/book', {
    method: 'POST',
    body: JSON.stringify({
        guideId: 'guide_123',
        siteId: 'bateshwar',
        timeSlot: '10:00'
    })
});
```

## Accessibility Features

### WCAG 2.1 Compliance
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Reader Support**: ARIA labels and descriptions
- **High Contrast**: CSS custom properties for theming
- **Focus Management**: Visible focus indicators
- **Alt Text**: Descriptive text for all images

### Inclusive Design
- **Font Scaling**: Respects user font size preferences
- **Reduced Motion**: Honors prefers-reduced-motion
- **Voice Navigation**: Compatible with voice control
- **Touch Targets**: Minimum 44px touch target size

## Performance Metrics

### Core Web Vitals
- **Largest Contentful Paint (LCP)**: < 2.5s
- **First Input Delay (FID)**: < 100ms
- **Cumulative Layout Shift (CLS)**: < 0.1

### Asset Optimization
- **Images**: WebP format with fallbacks
- **3D Models**: Draco compression for GLTF
- **Fonts**: Font-display swap for faster rendering
- **JavaScript**: Code splitting and lazy loading

## Security Considerations

### Content Security Policy
```html
<meta http-equiv="Content-Security-Policy" content="
    default-src 'self';
    script-src 'self' 'unsafe-eval' https://cdnjs.cloudflare.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' data: https:;
    connect-src 'self' https://api.bharatvrsh.com;
    media-src 'self';
    worker-src 'self';
    frame-src 'none';
">
```

### Data Protection
- **HTTPS Only**: All communication encrypted
- **Local Storage**: Sensitive data encrypted
- **User Consent**: GDPR-compliant data collection
- **No Tracking**: Privacy-first analytics

## Deployment Checklist

### Pre-Deployment
- [ ] Test on target browsers and devices
- [ ] Validate WebXR functionality
- [ ] Check offline capabilities
- [ ] Verify PWA installability
- [ ] Run accessibility audit
- [ ] Performance testing

### Production Setup
- [ ] Configure HTTPS with valid certificate
- [ ] Set up CDN for static assets
- [ ] Configure proper MIME types
- [ ] Enable gzip compression
- [ ] Set up monitoring and analytics
- [ ] Configure backup systems

### Post-Deployment
- [ ] Monitor Core Web Vitals
- [ ] Track AR usage metrics
- [ ] Monitor error rates
- [ ] Collect user feedback
- [ ] Regular security updates

## Contributing

### Development Workflow
1. Fork the repository
2. Create feature branch: `git checkout -b feature/new-feature`
3. Follow coding standards and add tests
4. Submit pull request with detailed description

### Code Standards
- **ES6+ JavaScript**: Modern syntax and features
- **CSS Modules**: Scoped styling approach
- **Semantic HTML**: Accessible markup patterns
- **Progressive Enhancement**: Core functionality without JavaScript

## Support and Documentation

### Resources
- **API Documentation**: `/docs/api.md`
- **AR Development Guide**: `/docs/ar-development.md`
- **PWA Best Practices**: `/docs/pwa-guide.md`
- **Accessibility Guide**: `/docs/accessibility.md`

### Getting Help
- **Issues**: GitHub Issues for bug reports
- **Discussions**: GitHub Discussions for questions
- **Email**: support@bharatvrsh.com
- **Discord**: [Community Chat](https://discord.gg/bharatvrsh)

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgments

- **X8 Studios**: Primary development team
- **MSME Partners**: Local heritage guides and content creators
- **Archaeological Survey of India**: Heritage site permissions and validation
- **Community Contributors**: Beta testers and feedback providers

---

**BharatVRsh** - Preserving India's heritage through immersive technology 🏛️✨