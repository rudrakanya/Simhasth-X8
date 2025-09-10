# Mobile App Testing Plan
# Comprehensive testing strategy for BharatVRsh Heritage AR Mobile App

## Testing Overview

### Testing Phases
1. **Unit Testing** - Component and function level testing
2. **Integration Testing** - API and service integration
3. **UI/UX Testing** - User interface and experience validation
4. **AR Testing** - Augmented Reality functionality verification
5. **Performance Testing** - App performance and optimization
6. **Device Testing** - Cross-device compatibility
7. **User Acceptance Testing** - End-user validation
8. **Security Testing** - Data protection and privacy

### Testing Tools
- **Unit Testing:** Jest, React Native Testing Library
- **E2E Testing:** Detox, Appium
- **Performance:** Flipper, React Native Performance Monitor
- **Device Testing:** Firebase Test Lab, BrowserStack
- **AR Testing:** Manual testing on various AR-capable devices
- **API Testing:** Postman, Newman
- **Security:** OWASP Mobile Security Testing Guide

## Unit Testing

### Component Testing Strategy

#### Heritage Site Card Component
```javascript
// __tests__/components/HeritageSiteCard.test.js
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { HeritageSiteCard } from '../src/components/Heritage/HeritageSiteCard';

const mockSite = {
  id: 'site_bateshwar',
  name: 'Bateshwar Temple Complex',
  location: 'Morena, MP',
  thumbnailUrl: 'https://example.com/thumb.jpg',
  tourDuration: '45 min',
  languages: ['hi', 'en'],
  isOfflineAvailable: true
};

describe('HeritageSiteCard', () => {
  it('renders site information correctly', () => {
    const { getByText, getByTestId } = render(
      <HeritageSiteCard site={mockSite} onPress={jest.fn()} />
    );
    
    expect(getByText('Bateshwar Temple Complex')).toBeTruthy();
    expect(getByText('Morena, MP')).toBeTruthy();
    expect(getByText('45 min')).toBeTruthy();
    expect(getByTestId('site-thumbnail')).toBeTruthy();
  });
  
  it('handles press events correctly', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <HeritageSiteCard site={mockSite} onPress={onPress} />
    );
    
    fireEvent.press(getByTestId('site-card'));
    expect(onPress).toHaveBeenCalledWith(mockSite);
  });
  
  it('shows offline indicator when available', () => {
    const { getByTestId } = render(
      <HeritageSiteCard site={mockSite} onPress={jest.fn()} />
    );
    
    expect(getByTestId('offline-badge')).toBeTruthy();
  });
  
  it('handles image loading states', async () => {
    const { getByTestId } = render(
      <HeritageSiteCard site={mockSite} onPress={jest.fn()} />
    );
    
    const image = getByTestId('site-thumbnail');
    
    // Simulate image load
    fireEvent(image, 'load');
    
    await waitFor(() => {
      expect(getByTestId('image-loader')).toBeFalsy();
    });
  });
});
```

#### AR Heritage Viewer Component
```javascript
// __tests__/components/ARHeritageViewer.test.js
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ARHeritageViewer } from '../src/components/AR/ARHeritageViewer';

// Mock AR dependencies
jest.mock('react-native-ar', () => ({
  ARView: 'ARView',
  ARTrackingState: {
    normal: 'normal',
    limited: 'limited'
  }
}));

const mockSiteData = {
  id: 'site_bateshwar',
  name: 'Bateshwar Temple Complex',
  defaultTourId: 'tour_basic',
  tours: [
    {
      id: 'tour_basic',
      title: 'Heritage Discovery',
      description: 'Explore the ancient temples',
      audioUrl: 'https://example.com/audio.mp3'
    }
  ]
};

describe('ARHeritageViewer', () => {
  it('initializes AR session correctly', () => {
    const { getByTestId } = render(
      <ARHeritageViewer siteData={mockSiteData} onClose={jest.fn()} />
    );
    
    expect(getByTestId('ar-view')).toBeTruthy();
    expect(getByTestId('ar-header')).toBeTruthy();
  });
  
  it('shows tracking instructions initially', () => {
    const { getByText } = render(
      <ARHeritageViewer siteData={mockSiteData} onClose={jest.fn()} />
    );
    
    expect(getByText('Point your camera at a flat surface')).toBeTruthy();
  });
  
  it('handles close button press', () => {
    const onClose = jest.fn();
    const { getByTestId } = render(
      <ARHeritageViewer siteData={mockSiteData} onClose={onClose} />
    );
    
    fireEvent.press(getByTestId('close-button'));
    expect(onClose).toHaveBeenCalled();
  });
  
  it('displays tracking quality indicator', () => {
    const { getByTestId } = render(
      <ARHeritageViewer siteData={mockSiteData} onClose={jest.fn()} />
    );
    
    expect(getByTestId('tracking-indicator')).toBeTruthy();
  });
});
```

### Service Testing

#### AR Service Testing
```javascript
// __tests__/services/ARService.test.js
import { ARService } from '../src/services/ARService';

// Mock platform-specific modules
jest.mock('react-native-ar');

describe('ARService', () => {
  let arService;
  
  beforeEach(() => {
    arService = new ARService();
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  it('initializes successfully', async () => {
    const result = await arService.initialize();
    expect(result.success).toBe(true);
    expect(arService.isInitialized()).toBe(true);
  });
  
  it('detects surfaces correctly', async () => {
    await arService.initialize();
    const surfaces = await arService.detectSurfaces();
    
    expect(Array.isArray(surfaces)).toBe(true);
    expect(surfaces.length).toBeGreaterThanOrEqual(0);
  });
  
  it('places models on detected surfaces', async () => {
    await arService.initialize();
    const mockModel = {
      id: 'model_temple',
      url: 'https://example.com/model.glb'
    };
    
    const result = await arService.placeModel(mockModel, { x: 0, y: 0, z: 0 });
    expect(result.success).toBe(true);
    
    const placedModels = arService.getPlacedModels();
    expect(placedModels).toHaveLength(1);
    expect(placedModels[0].id).toBe('model_temple');
  });
  
  it('handles tracking state changes', () => {
    const callback = jest.fn();
    arService.onTrackingStateChanged(callback);
    
    arService.updateTrackingState('normal');
    expect(callback).toHaveBeenCalledWith('normal');
  });
});
```

#### API Service Testing
```javascript
// __tests__/services/APIService.test.js
import { APIService } from '../src/services/APIService';

// Mock fetch
global.fetch = jest.fn();

describe('APIService', () => {
  let apiService;
  
  beforeEach(() => {
    apiService = new APIService();
    fetch.mockClear();
  });
  
  it('fetches heritage sites successfully', async () => {
    const mockResponse = {
      success: true,
      data: {
        sites: [
          {
            id: 'site_bateshwar',
            name: 'Bateshwar Temple Complex'
          }
        ]
      }
    };
    
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });
    
    const result = await apiService.getHeritageSites();
    
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/heritage/sites'),
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          'Authorization': expect.stringContaining('Bearer')
        })
      })
    );
    
    expect(result.success).toBe(true);
    expect(result.data.sites).toHaveLength(1);
  });
  
  it('handles API errors gracefully', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({
        success: false,
        error: { message: 'Not found' }
      })
    });
    
    const result = await apiService.getHeritageSites();
    
    expect(result.success).toBe(false);
    expect(result.error.message).toBe('Not found');
  });
  
  it('handles network errors', async () => {
    fetch.mockRejectedValueOnce(new Error('Network error'));
    
    const result = await apiService.getHeritageSites();
    
    expect(result.success).toBe(false);
    expect(result.error.message).toContain('Network error');
  });
});
```

## Integration Testing

### AR Integration Testing
```javascript
// __tests__/integration/ARIntegration.test.js
import { render, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { store } from '../src/store';
import { ARExperienceScreen } from '../src/screens/ARExperienceScreen';

describe('AR Integration', () => {
  it('completes full AR workflow', async () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <ARExperienceScreen route={{ params: { siteId: 'site_bateshwar' } }} />
      </Provider>
    );
    
    // Wait for site data to load
    await waitFor(() => {
      expect(getByTestId('ar-view')).toBeTruthy();
    });
    
    // Simulate surface detection
    const arView = getByTestId('ar-view');
    fireEvent(arView, 'planeDetected', {
      center: { x: 0, y: 0, z: 0 },
      extent: { width: 2, height: 2 }
    });
    
    // Verify model placement
    await waitFor(() => {
      expect(getByTestId('placed-model')).toBeTruthy();
    });
    
    // Test tour functionality
    const tourButton = getByTestId('start-tour-button');
    fireEvent.press(tourButton);
    
    await waitFor(() => {
      expect(getByTestId('tour-overlay')).toBeTruthy();
    });
  });
});
```

### API Integration Testing
```javascript
// __tests__/integration/APIIntegration.test.js
import { store } from '../src/store';
import { fetchHeritageSites } from '../src/store/slices/heritageSlice';

describe('API Integration', () => {
  it('fetches and stores heritage sites', async () => {
    const initialState = store.getState().heritage;
    expect(initialState.sites).toHaveLength(0);
    
    // Dispatch async action
    await store.dispatch(fetchHeritageSites());
    
    const finalState = store.getState().heritage;
    expect(finalState.sites.length).toBeGreaterThan(0);
    expect(finalState.loading).toBe(false);
    expect(finalState.error).toBeNull();
  });
  
  it('handles API errors in Redux', async () => {
    // Mock API failure
    jest.spyOn(global, 'fetch').mockRejectedValueOnce(
      new Error('API Error')
    );
    
    await store.dispatch(fetchHeritageSites());
    
    const state = store.getState().heritage;
    expect(state.error).toBeTruthy();
    expect(state.loading).toBe(false);
  });
});
```

## Performance Testing

### AR Performance Testing
```javascript
// __tests__/performance/ARPerformance.test.js
import { PerformanceMonitor } from '../src/utils/PerformanceMonitor';
import { ARService } from '../src/services/ARService';

describe('AR Performance', () => {
  let performanceMonitor;
  let arService;
  
  beforeEach(() => {
    performanceMonitor = new PerformanceMonitor();
    arService = new ARService();
  });
  
  it('maintains acceptable frame rate during AR session', async () => {
    performanceMonitor.startMonitoring();
    
    // Start AR session
    await arService.initialize();
    await arService.startTracking();
    
    // Load complex model
    const complexModel = {
      id: 'complex_temple',
      vertices: 50000,
      textures: 8
    };
    
    await arService.loadModel(complexModel);
    
    // Run for 30 seconds
    await new Promise(resolve => setTimeout(resolve, 30000));
    
    const metrics = performanceMonitor.getMetrics();
    
    expect(metrics.averageFPS).toBeGreaterThan(30);
    expect(metrics.frameDrops).toBeLessThan(10);
    expect(metrics.memoryUsage).toBeLessThan(512); // MB
  });
  
  it('handles model loading efficiently', async () => {
    const startTime = Date.now();
    
    const model = await arService.loadModel({
      id: 'bateshwar_temple',
      url: 'https://example.com/model.glb',
      size: 15000000 // 15MB
    });
    
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(10000); // Less than 10 seconds
    expect(model).toBeDefined();
  });
});
```

### Memory Performance Testing
```javascript
// __tests__/performance/MemoryPerformance.test.js
import { MemoryMonitor } from '../src/utils/MemoryMonitor';
import { ModelManager } from '../src/services/ModelManager';

describe('Memory Performance', () => {
  let memoryMonitor;
  let modelManager;
  
  beforeEach(() => {
    memoryMonitor = new MemoryMonitor();
    modelManager = new ModelManager();
  });
  
  it('manages memory efficiently during model loading', async () => {
    const initialMemory = memoryMonitor.getCurrentUsage();
    
    // Load multiple models
    const models = [
      'bateshwar_temple_1',
      'bateshwar_temple_2',
      'bateshwar_temple_3'
    ];
    
    for (const modelId of models) {
      await modelManager.loadModel(modelId);
    }
    
    const peakMemory = memoryMonitor.getPeakUsage();
    const memoryIncrease = peakMemory - initialMemory;
    
    // Should not exceed 200MB increase
    expect(memoryIncrease).toBeLessThan(200);
    
    // Cleanup and verify memory release
    modelManager.clearCache();
    
    // Allow garbage collection
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const finalMemory = memoryMonitor.getCurrentUsage();
    const memoryRecovered = peakMemory - finalMemory;
    
    // Should recover at least 80% of memory
    expect(memoryRecovered / memoryIncrease).toBeGreaterThan(0.8);
  });
});
```

## Device Compatibility Testing

### Device Test Matrix
```yaml
iOS_Devices:
  iPhone_14_Pro:
    OS: iOS 16.0
    Chipset: A16 Bionic
    RAM: 6GB
    ARKit: 6.0
    Tests:
      - AR_tracking_accuracy
      - Performance_benchmarks
      - Battery_usage
      
  iPhone_12:
    OS: iOS 15.0
    Chipset: A14 Bionic
    RAM: 4GB
    ARKit: 5.0
    Tests:
      - Basic_AR_functionality
      - Model_loading_performance
      
  iPad_Air_5:
    OS: iOS 16.0
    Chipset: M1
    RAM: 8GB
    ARKit: 6.0
    Tests:
      - Large_screen_AR
      - Extended_session_performance

Android_Devices:
  Samsung_Galaxy_S23:
    OS: Android 13
    Chipset: Snapdragon 8 Gen 2
    RAM: 8GB
    ARCore: Latest
    Tests:
      - AR_tracking_accuracy
      - Performance_benchmarks
      
  Google_Pixel_7:
    OS: Android 13
    Chipset: Google Tensor G2
    RAM: 8GB
    ARCore: Latest
    Tests:
      - AR_functionality
      - Camera_integration
      
  Samsung_Galaxy_A54:
    OS: Android 13
    Chipset: Exynos 1380
    RAM: 6GB
    ARCore: Latest
    Tests:
      - Mid_range_performance
      - Battery_efficiency
```

### Device Testing Scripts
```javascript
// __tests__/device/DeviceCompatibility.test.js
import { DeviceInfo } from 'react-native-device-info';
import { ARCapabilities } from '../src/utils/ARCapabilities';

describe('Device Compatibility', () => {
  it('detects AR capabilities correctly', async () => {
    const deviceInfo = await DeviceInfo.getDeviceInfo();
    const arCapabilities = await ARCapabilities.check();
    
    if (deviceInfo.platform === 'ios') {
      expect(arCapabilities.hasARKit).toBeDefined();
      expect(arCapabilities.arkitVersion).toBeDefined();
    } else if (deviceInfo.platform === 'android') {
      expect(arCapabilities.hasARCore).toBeDefined();
      expect(arCapabilities.arcoreVersion).toBeDefined();
    }
    
    expect(arCapabilities.supportsPlaneDetection).toBe(true);
    expect(arCapabilities.supportsLightEstimation).toBeDefined();
  });
  
  it('adjusts quality settings based on device capabilities', async () => {
    const deviceCapabilities = await DeviceInfo.getDeviceCapabilities();
    const qualitySettings = await getOptimalQualitySettings(deviceCapabilities);
    
    if (deviceCapabilities.ram < 4000) {
      expect(qualitySettings.modelQuality).toBe('low');
      expect(qualitySettings.textureResolution).toBeLessThanOrEqual(1024);
    } else if (deviceCapabilities.ram >= 6000) {
      expect(qualitySettings.modelQuality).toBe('high');
      expect(qualitySettings.textureResolution).toBe(2048);
    }
  });
});
```

## User Acceptance Testing

### UAT Test Scenarios

#### Scenario 1: First-time User Journey
```gherkin
Feature: First-time user onboarding and heritage exploration

Scenario: New user discovers and explores Bateshwar temple
  Given I am a new user opening the app for the first time
  When I complete the onboarding process
  And I select Hindi as my preferred language
  And I choose "Temples" as my interest
  Then I should see the heritage sites list
  When I select "Bateshwar Temple Complex"
  And I tap "Start AR Experience"
  Then I should see the AR camera view
  And I should see instructions to find a flat surface
  When I point my camera at a flat surface
  Then I should see the 3D temple model placed in AR
  When I tap "Start Tour"
  Then I should hear Hindi narration about the temple
  And I should see cultural information overlay
  When I complete the tour
  Then I should see completion confirmation
  And the site should be marked as visited in my profile
```

#### Scenario 2: Offline Content Usage
```gherkin
Feature: Offline heritage content access

Scenario: Download and use heritage content offline
  Given I am connected to WiFi
  When I navigate to Bateshwar Temple details
  And I tap "Download for Offline"
  Then I should see download progress
  And the content should be downloaded successfully
  When I turn off my internet connection
  And I start AR experience for Bateshwar Temple
  Then I should be able to view the 3D model
  And I should be able to play the audio tour
  And all interactions should work normally
```

#### Scenario 3: MSME Guide Booking
```gherkin
Feature: Local guide booking and virtual tour

Scenario: Book and attend virtual guided tour
  Given I am viewing Bateshwar Temple details
  When I tap "Book Local Guide"
  Then I should see available guides list
  When I select "Ravi Sharma" guide
  And I choose "10:00 AM" time slot
  And I confirm the booking for ₹500
  Then I should receive booking confirmation
  And I should get calendar reminder
  When the scheduled time arrives
  And I join the virtual tour session
  Then I should see the guide via video call
  And I should be able to share my AR view
  And the guide should provide personalized commentary
```

### UAT Testing Checklist
- [ ] App installation and first launch
- [ ] User registration and login
- [ ] Language selection and content localization
- [ ] Heritage site browsing and search
- [ ] AR model placement and tracking
- [ ] Audio tour playback and synchronization
- [ ] Offline content download and usage
- [ ] Guide booking and payment flow
- [ ] Profile management and preferences
- [ ] Social sharing and feedback submission

## Security Testing

### Security Test Cases

#### Authentication Security
```javascript
// __tests__/security/AuthSecurity.test.js
import { AuthService } from '../src/services/AuthService';
import { TokenManager } from '../src/utils/TokenManager';

describe('Authentication Security', () => {
  it('stores tokens securely', async () => {
    const tokens = {
      accessToken: 'test_access_token',
      refreshToken: 'test_refresh_token'
    };
    
    await TokenManager.storeTokens(tokens);
    
    // Verify tokens are encrypted in storage
    const rawStorage = await getRawStorageData('auth_tokens');
    expect(rawStorage).not.toContain('test_access_token');
    expect(rawStorage).not.toContain('test_refresh_token');
    
    // Verify tokens can be retrieved and decrypted
    const retrievedTokens = await TokenManager.getTokens();
    expect(retrievedTokens.accessToken).toBe('test_access_token');
  });
  
  it('handles token expiration securely', async () => {
    // Mock expired token
    const expiredToken = createExpiredJWT();
    await TokenManager.storeTokens({ 
      accessToken: expiredToken,
      refreshToken: 'valid_refresh'
    });
    
    const result = await AuthService.makeAuthenticatedRequest('/test');
    
    // Should automatically refresh token
    expect(result.tokenRefreshed).toBe(true);
    
    // Should not expose expired token in logs
    const logs = await getApplicationLogs();
    expect(logs).not.toContain(expiredToken);
  });
});
```

#### Data Protection Testing
```javascript
// __tests__/security/DataProtection.test.js
import { DataProtection } from '../src/utils/DataProtection';
import { UserData } from '../src/models/UserData';

describe('Data Protection', () => {
  it('encrypts sensitive user data', async () => {
    const sensitiveData = {
      email: 'user@example.com',
      personalPreferences: {
        disabilities: ['vision_impaired'],
        location: 'Delhi, India'
      }
    };
    
    const encrypted = await DataProtection.encryptUserData(sensitiveData);
    
    // Verify data is encrypted
    expect(encrypted).not.toContain('user@example.com');
    expect(encrypted).not.toContain('vision_impaired');
    
    // Verify data can be decrypted
    const decrypted = await DataProtection.decryptUserData(encrypted);
    expect(decrypted.email).toBe('user@example.com');
  });
  
  it('validates data before transmission', async () => {
    const userData = {
      feedback: '<script>alert("xss")</script>',
      name: 'Valid Name'
    };
    
    const sanitized = await DataProtection.sanitizeUserInput(userData);
    
    expect(sanitized.feedback).not.toContain('<script>');
    expect(sanitized.name).toBe('Valid Name');
  });
});
```

## Automated Testing Pipeline

### CI/CD Testing Configuration
```yaml
# .github/workflows/test.yml
name: Mobile App Testing Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm install
      - name: Run unit tests
        run: npm run test:unit -- --coverage
      - name: Upload coverage
        uses: codecov/codecov-action@v3

  integration-tests:
    runs-on: ubuntu-latest
    needs: unit-tests
    steps:
      - uses: actions/checkout@v3
      - name: Setup test environment
        run: docker-compose up -d test-api
      - name: Run integration tests
        run: npm run test:integration
      - name: Cleanup
        run: docker-compose down

  ios-tests:
    runs-on: macos-latest
    needs: unit-tests
    steps:
      - uses: actions/checkout@v3
      - name: Setup React Native
        run: |
          npm install
          cd ios && pod install
      - name: Build iOS app
        run: |
          xcodebuild -workspace ios/BharatVRsh.xcworkspace \
                     -scheme BharatVRsh \
                     -destination 'platform=iOS Simulator,name=iPhone 14 Pro' \
                     test
      - name: Run iOS E2E tests
        run: npm run test:e2e:ios

  android-tests:
    runs-on: ubuntu-latest
    needs: unit-tests
    steps:
      - uses: actions/checkout@v3
      - name: Setup Android environment
        uses: android-actions/setup-android@v2
      - name: Build Android app
        run: |
          cd android
          ./gradlew assembleDebug assembleAndroidTest
      - name: Run Android E2E tests
        run: npm run test:e2e:android

  performance-tests:
    runs-on: ubuntu-latest
    needs: [ios-tests, android-tests]
    steps:
      - uses: actions/checkout@v3
      - name: Run performance benchmarks
        run: npm run test:performance
      - name: Generate performance report
        run: npm run report:performance

  security-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run security scan
        run: |
          npm audit
          npm run test:security
      - name: Upload security report
        uses: github/codeql-action/upload-sarif@v2
```

### Test Reporting and Metrics

#### Test Coverage Requirements
- **Unit Tests:** Minimum 80% code coverage
- **Component Tests:** 100% component rendering coverage
- **Integration Tests:** All API endpoints covered
- **E2E Tests:** All user workflows covered

#### Performance Benchmarks
- **App Launch Time:** < 3 seconds
- **AR Session Start:** < 5 seconds
- **Model Loading:** < 10 seconds (medium quality)
- **Memory Usage:** < 512MB peak
- **Battery Drain:** < 20% per hour of AR usage

#### Device Support Matrix
- **iOS:** iPhone 8+ (iOS 12.0+)
- **Android:** ARCore supported devices (Android 7.0+)
- **RAM:** Minimum 3GB, Recommended 4GB+
- **Storage:** Minimum 2GB free space

This comprehensive testing plan ensures the BharatVRsh Heritage AR mobile app meets quality, performance, and security standards while providing an excellent user experience across all supported devices and use cases.