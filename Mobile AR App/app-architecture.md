# App Architecture Document
# Technical specifications for BharatVRsh Heritage AR Mobile App

## System Architecture Overview

### High-Level Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Mobile App    │    │   Backend API   │    │  Content CDN    │
│   (React Native)│◄──►│   (Node.js)     │◄──►│   (AWS S3)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐              │
         │              │   Database      │              │
         └──────────────►│   (MongoDB)     │◄─────────────┘
                        └─────────────────┘
```

### Technology Stack

**Frontend (Mobile App):**
- React Native 0.72+
- Redux Toolkit (state management)
- React Native AR (ARKit/ARCore wrapper)
- Three.js for 3D rendering
- React Navigation 6.x
- Async Storage for offline data
- React Native Video for media
- React Native Sound for audio

**Backend Services:**
- Node.js 18+ with Express.js
- MongoDB 6.0+ with Mongoose ODM
- JWT for authentication
- Multer for file uploads
- Socket.io for real-time features
- Redis for caching
- PM2 for process management

**Cloud Infrastructure:**
- AWS EC2 for application servers
- AWS S3 for 3D models and media storage
- AWS CloudFront CDN for global delivery
- AWS MongoDB Atlas for database
- AWS SES for email services

**Development Tools:**
- TypeScript for type safety
- ESLint and Prettier for code quality
- Jest for unit testing
- Detox for E2E testing
- Flipper for debugging
- Fastlane for CI/CD

## Mobile App Architecture

### Folder Structure
```
/src
├── components/           # Reusable UI components
│   ├── AR/              # AR-specific components
│   ├── Heritage/        # Heritage content components
│   ├── UI/             # Common UI elements
│   └── Navigation/     # Navigation components
├── screens/            # Screen components
│   ├── Onboarding/
│   ├── Home/
│   ├── AR/
│   ├── Tours/
│   └── Profile/
├── services/           # API and external services
│   ├── api/
│   ├── ar/
│   ├── storage/
│   └── analytics/
├── store/              # Redux store configuration
│   ├── slices/
│   └── middleware/
├── utils/              # Utility functions
├── constants/          # App constants
├── types/              # TypeScript type definitions
└── assets/             # Static assets
```

### State Management (Redux)

**Store Structure:**
```typescript
interface RootState {
  auth: AuthState;
  heritage: HeritageState;
  ar: ARState;
  tours: ToursState;
  offline: OfflineState;
  user: UserState;
}

interface HeritageState {
  sites: HeritageSite[];
  currentSite: HeritageSite | null;
  loading: boolean;
  error: string | null;
}

interface ARState {
  isTracking: boolean;
  placedModels: PlacedModel[];
  currentSession: ARSession | null;
  tracking Quality: TrackingQuality;
}
```

### AR Implementation

**ARKit/ARCore Wrapper:**
```typescript
// AR Service Interface
interface ARService {
  initializeSession(): Promise<void>;
  startTracking(): void;
  stopTracking(): void;
  placeModel(model: Model3D, position: Vector3): void;
  detectPlanes(): Plane[];
  getTrackingState(): TrackingState;
}

// Platform-specific implementations
class IOSARService implements ARService {
  // ARKit implementation
}

class AndroidARService implements ARService {
  // ARCore implementation
}
```

### 3D Model Management

**Model Loading System:**
```typescript
interface Model3D {
  id: string;
  name: string;
  url: string;
  size: number;
  lodLevels: LODLevel[];
  textures: Texture[];
  animations?: Animation[];
}

class ModelManager {
  private cache: Map<string, Model3D> = new Map();
  
  async loadModel(modelId: string): Promise<Model3D> {
    // Check cache first
    if (this.cache.has(modelId)) {
      return this.cache.get(modelId)!;
    }
    
    // Download and cache model
    const model = await this.downloadModel(modelId);
    this.cache.set(modelId, model);
    return model;
  }
  
  async preloadModels(modelIds: string[]): Promise<void> {
    // Background preloading for better UX
  }
}
```

## Backend API Architecture

### API Endpoints

**Authentication:**
```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh
POST /api/auth/logout
```

**Heritage Sites:**
```
GET  /api/heritage/sites          # List all heritage sites
GET  /api/heritage/sites/:id      # Get site details
GET  /api/heritage/sites/:id/models # Get 3D models for site
GET  /api/heritage/sites/:id/tours  # Get available tours
POST /api/heritage/sites/:id/download # Request offline content
```

**AR Content:**
```
GET  /api/ar/models/:id           # Get 3D model metadata
GET  /api/ar/models/:id/download  # Download 3D model file
GET  /api/ar/textures/:id         # Get texture files
GET  /api/ar/animations/:id       # Get animation data
```

**Tours & Guides:**
```
GET  /api/tours                   # List available tours
GET  /api/tours/:id               # Get tour details
POST /api/tours/:id/book          # Book guided tour
GET  /api/guides                  # List available guides
POST /api/guides/:id/session      # Start live session
```

### Database Schema

**Heritage Sites Collection:**
```javascript
{
  _id: ObjectId,
  name: String,
  location: {
    latitude: Number,
    longitude: Number,
    address: String,
    state: String
  },
  description: String,
  culturalPeriod: String,
  siteType: String, // temple, cave, fort, etc.
  models: [ObjectId], // Reference to Model3D collection
  tours: [ObjectId],  // Reference to Tours collection
  content: {
    hindi: ContentData,
    english: ContentData,
    marathi: ContentData
  },
  metadata: {
    createdAt: Date,
    updatedAt: Date,
    verifiedBy: String,
    accuracy: Number
  }
}
```

**3D Models Collection:**
```javascript
{
  _id: ObjectId,
  name: String,
  siteId: ObjectId,
  fileUrl: String,
  thumbnailUrl: String,
  fileSize: Number,
  format: String, // gltf, obj, fbx
  lodLevels: [{
    quality: String, // low, medium, high
    fileUrl: String,
    fileSize: Number
  }],
  textures: [{
    type: String, // diffuse, normal, roughness
    url: String,
    size: Number
  }],
  boundingBox: {
    min: [Number, Number, Number],
    max: [Number, Number, Number]
  },
  metadata: {
    vertices: Number,
    faces: Number,
    uploadedAt: Date,
    processedAt: Date
  }
}
```

## Performance Optimization

### 3D Model Optimization

**Level of Detail (LOD) System:**
```typescript
class LODManager {
  private currentLOD: number = 0;
  
  updateLOD(distance: number, deviceCapability: DeviceCapability): void {
    const targetLOD = this.calculateOptimalLOD(distance, deviceCapability);
    
    if (targetLOD !== this.currentLOD) {
      this.switchToLOD(targetLOD);
      this.currentLOD = targetLOD;
    }
  }
  
  private calculateOptimalLOD(distance: number, capability: DeviceCapability): number {
    // Algorithm to determine optimal LOD based on:
    // - Distance from model
    // - Device performance capability
    // - Available memory
    // - Network conditions
  }
}
```

**Model Compression:**
- Draco geometry compression for GLTF models
- Texture compression (ASTC, ETC2, S3TC)
- Progressive mesh loading
- Octree spatial optimization

### Memory Management

**Asset Caching Strategy:**
```typescript
class AssetCache {
  private memoryCache: LRUCache<string, ArrayBuffer>;
  private diskCache: Map<string, string>; // file paths
  
  async getAsset(url: string): Promise<ArrayBuffer> {
    // 1. Check memory cache
    if (this.memoryCache.has(url)) {
      return this.memoryCache.get(url)!;
    }
    
    // 2. Check disk cache
    if (this.diskCache.has(url)) {
      const data = await this.loadFromDisk(url);
      this.memoryCache.set(url, data);
      return data;
    }
    
    // 3. Download and cache
    const data = await this.download(url);
    this.memoryCache.set(url, data);
    await this.saveToDisk(url, data);
    this.diskCache.set(url, this.getFilePath(url));
    
    return data;
  }
}
```

### Network Optimization

**Progressive Loading:**
```typescript
class ProgressiveLoader {
  async loadHeritageSite(siteId: string): Promise<void> {
    // 1. Load basic site information first
    const siteInfo = await this.api.getSiteInfo(siteId);
    this.store.dispatch(setSiteInfo(siteInfo));
    
    // 2. Load low-resolution preview model
    const previewModel = await this.loadPreviewModel(siteId);
    this.store.dispatch(setPreviewModel(previewModel));
    
    // 3. Background load high-resolution assets
    this.backgroundLoadAssets(siteId);
  }
  
  private async backgroundLoadAssets(siteId: string): Promise<void> {
    // Load HD models, textures, and audio in background
    const assets = await this.api.getSiteAssets(siteId);
    
    for (const asset of assets) {
      await this.assetCache.preload(asset.url);
      this.store.dispatch(updateLoadingProgress(asset.id));
    }
  }
}
```

## Offline Support

### Content Synchronization

**Offline Manager:**
```typescript
class OfflineManager {
  private downloadQueue: DownloadTask[] = [];
  private storage: AsyncStorage;
  
  async downloadSiteForOffline(siteId: string): Promise<void> {
    const site = await this.api.getSiteDetails(siteId);
    
    // Create download tasks
    const tasks: DownloadTask[] = [
      { type: 'site-data', url: site.dataUrl },
      { type: 'model', url: site.model.url },
      { type: 'textures', urls: site.textures.map(t => t.url) },
      { type: 'audio', urls: site.audioTracks.map(a => a.url) }
    ];
    
    this.downloadQueue.push(...tasks);
    await this.processDownloadQueue();
  }
  
  async isAvailableOffline(siteId: string): Promise<boolean> {
    const offlineData = await this.storage.getItem(`offline_${siteId}`);
    return offlineData !== null;
  }
}
```

### Data Synchronization Strategy

**Sync Algorithm:**
```typescript
interface SyncStrategy {
  // Download priority: Essential → Important → Nice-to-have
  priority: 'essential' | 'important' | 'optional';
  
  // Sync conditions
  wifiOnly: boolean;
  batteryLevel: number; // minimum battery level
  storageSpace: number; // minimum free space in MB
}

class DataSynchronizer {
  async syncWhenConditionsMet(): Promise<void> {
    const conditions = await this.checkSyncConditions();
    
    if (conditions.canSync) {
      await this.performIncrementalSync();
    }
  }
  
  private async performIncrementalSync(): Promise<void> {
    // 1. Sync user data and preferences
    await this.syncUserData();
    
    // 2. Check for content updates
    const updates = await this.checkForContentUpdates();
    
    // 3. Download updates based on priority
    await this.downloadUpdates(updates);
  }
}
```

## Security Implementation

### Data Protection

**Encryption:**
```typescript
class SecurityManager {
  private encryptionKey: string;
  
  async encryptSensitiveData(data: any): Promise<string> {
    // AES-256 encryption for sensitive user data
    return await AES.encrypt(JSON.stringify(data), this.encryptionKey);
  }
  
  async decryptSensitiveData(encryptedData: string): Promise<any> {
    const decrypted = await AES.decrypt(encryptedData, this.encryptionKey);
    return JSON.parse(decrypted);
  }
  
  // Secure key storage using Keychain (iOS) / Keystore (Android)
  async storeSecureKey(key: string, value: string): Promise<void> {
    await Keychain.setInternetCredentials(key, key, value);
  }
}
```

### API Security

**JWT Token Management:**
```typescript
class AuthTokenManager {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  
  async getValidToken(): Promise<string> {
    if (!this.accessToken || this.isTokenExpired(this.accessToken)) {
      await this.refreshAccessToken();
    }
    
    return this.accessToken!;
  }
  
  private async refreshAccessToken(): Promise<void> {
    try {
      const response = await this.api.refreshToken(this.refreshToken);
      this.accessToken = response.accessToken;
      this.refreshToken = response.refreshToken;
      
      await this.secureStorage.setItem('tokens', {
        access: this.accessToken,
        refresh: this.refreshToken
      });
    } catch (error) {
      // Redirect to login
      this.navigationService.navigate('Login');
    }
  }
}
```

## Testing Strategy

### Unit Testing

**Component Testing:**
```typescript
// Heritage site component test
describe('HeritageSiteCard', () => {
  const mockSite: HeritageSite = {
    id: '1',
    name: 'Bateshwar Temple',
    location: 'Morena, MP',
    thumbnailUrl: 'https://example.com/thumb.jpg'
  };
  
  it('renders site information correctly', () => {
    const { getByText, getByTestId } = render(
      <HeritageSiteCard site={mockSite} />
    );
    
    expect(getByText('Bateshwar Temple')).toBeTruthy();
    expect(getByText('Morena, MP')).toBeTruthy();
    expect(getByTestId('site-thumbnail')).toBeTruthy();
  });
  
  it('handles press events', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <HeritageSiteCard site={mockSite} onPress={onPress} />
    );
    
    fireEvent.press(getByTestId('site-card'));
    expect(onPress).toHaveBeenCalledWith(mockSite);
  });
});
```

### Integration Testing

**AR Flow Testing:**
```typescript
describe('AR Experience Flow', () => {
  it('should complete full AR session successfully', async () => {
    // 1. Initialize AR session
    await ARService.initialize();
    expect(ARService.isInitialized()).toBe(true);
    
    // 2. Detect surface
    const surface = await ARService.detectSurface();
    expect(surface).toBeDefined();
    
    // 3. Place heritage model
    const model = await ModelManager.loadModel('bateshwar_temple');
    ARService.placeModel(model, surface.center);
    
    // 4. Verify model placement
    const placedModels = ARService.getPlacedModels();
    expect(placedModels).toHaveLength(1);
    expect(placedModels[0].id).toBe('bateshwar_temple');
  });
});
```

### Performance Testing

**AR Performance Benchmarks:**
```typescript
describe('AR Performance', () => {
  it('should maintain 30+ FPS during AR session', async () => {
    const performanceMonitor = new PerformanceMonitor();
    performanceMonitor.startMonitoring();
    
    // Start AR session with complex model
    await ARService.startSession('complex_heritage_site');
    
    // Run for 30 seconds
    await new Promise(resolve => setTimeout(resolve, 30000));
    
    const metrics = performanceMonitor.getMetrics();
    expect(metrics.averageFPS).toBeGreaterThan(30);
    expect(metrics.frameDrops).toBeLessThan(5);
  });
});
```

## Deployment Strategy

### CI/CD Pipeline

**Build Configuration:**
```yaml
# .github/workflows/build.yml
name: Build and Test

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm install
      - name: Run tests
        run: npm test
      - name: Run E2E tests
        run: npm run test:e2e

  build-ios:
    needs: test
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup React Native
        uses: ./.github/actions/setup-rn
      - name: Build iOS
        run: |
          cd ios
          xcodebuild -workspace BharatVRsh.xcworkspace \
                     -scheme BharatVRsh \
                     -configuration Release \
                     -destination generic/platform=iOS \
                     archive

  build-android:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup React Native
        uses: ./.github/actions/setup-rn
      - name: Build Android
        run: |
          cd android
          ./gradlew assembleRelease
```

### Release Management

**Version Strategy:**
- Semantic Versioning (MAJOR.MINOR.PATCH)
- Feature flags for gradual rollouts
- A/B testing for new features
- Rollback capabilities

**Environment Configuration:**
```typescript
// config/environments.ts
export const config = {
  development: {
    apiUrl: 'http://localhost:3000/api',
    enableAnalytics: false,
    enableLogging: true,
    modelQuality: 'medium'
  },
  staging: {
    apiUrl: 'https://staging-api.bharatvrsh.com/api',
    enableAnalytics: true,
    enableLogging: true,
    modelQuality: 'high'
  },
  production: {
    apiUrl: 'https://api.bharatvrsh.com/api',
    enableAnalytics: true,
    enableLogging: false,
    modelQuality: 'adaptive'
  }
};
```

This architecture ensures scalable, maintainable, and performant mobile AR heritage tourism application while supporting offline functionality and optimizing for various device capabilities.