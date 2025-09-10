// Service Worker for BharatVRsh Web Platform
// Handles caching, offline functionality, and background sync

const CACHE_NAME = 'bharatvrsh-v1.2.0';
const STATIC_CACHE = 'bharatvrsh-static-v1.2.0';
const DYNAMIC_CACHE = 'bharatvrsh-dynamic-v1.2.0';
const HERITAGE_CACHE = 'bharatvrsh-heritage-v1.2.0';

// Static assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/styles/main.css',
  '/styles/heritage.css',
  '/styles/ar-viewer.css',
  '/scripts/app.js',
  '/scripts/ar-viewer.js',
  '/scripts/heritage-sites.js',
  '/scripts/tours.js',
  '/scripts/utils.js',
  '/assets/logo.svg',
  '/assets/favicon.ico',
  '/assets/icons/icon-192x192.png',
  '/assets/icons/icon-512x512.png',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@400;600;700&display=swap',
  'https://fonts.googleapis.com/icon?family=Material+Icons',
  'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js'
];

// Heritage content that can be cached for offline use
const HERITAGE_ASSETS = [
  '/assets/images/bateshwar-featured.jpg',
  '/assets/images/bateshwar-thumb.jpg',
  '/assets/images/udaygiri-featured.jpg',
  '/assets/images/udaygiri-thumb.jpg',
  '/assets/images/dongla-featured.jpg',
  '/assets/images/dongla-thumb.jpg',
  '/assets/models/bateshwar_temple.glb',
  '/assets/models/udaygiri_caves.glb',
  '/assets/models/dongla_observatory.glb',
  '/assets/audio/bateshwar_tour_en.mp3',
  '/assets/audio/udaygiri_tour_en.mp3'
];

// API endpoints to cache
const API_ENDPOINTS = [
  '/api/heritage/sites',
  '/api/tours',
  '/api/guides'
];

// Install event - cache static assets
self.addEventListener('install', event => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(STATIC_CACHE).then(cache => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      }),
      
      // Skip waiting to activate immediately
      self.skipWaiting()
    ])
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE && 
                cacheName !== HERITAGE_CACHE) {
              console.log('Service Worker: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      
      // Take control of all clients
      self.clients.claim()
    ])
  );
});

// Fetch event - serve cached content or fetch from network
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip chrome-extension and other non-http(s) requests
  if (!url.protocol.startsWith('http')) {
    return;
  }
  
  event.respondWith(
    handleFetchRequest(request)
  );
});

// Handle different types of fetch requests
async function handleFetchRequest(request) {
  const url = new URL(request.url);
  
  // Handle static assets (cache first)
  if (isStaticAsset(url)) {
    return handleStaticAsset(request);
  }
  
  // Handle API requests (network first with cache fallback)
  if (isAPIRequest(url)) {
    return handleAPIRequest(request);
  }
  
  // Handle heritage content (cache first with network fallback)
  if (isHeritageContent(url)) {
    return handleHeritageContent(request);
  }
  
  // Handle navigation requests (network first with cache fallback)
  if (request.mode === 'navigate') {
    return handleNavigation(request);
  }
  
  // Default: network first
  return handleDefault(request);
}

// Check if request is for static assets
function isStaticAsset(url) {
  return STATIC_ASSETS.some(asset => url.pathname.endsWith(asset)) ||
         url.pathname.includes('/styles/') ||
         url.pathname.includes('/scripts/') ||
         url.pathname.includes('/assets/icons/') ||
         url.hostname === 'fonts.googleapis.com' ||
         url.hostname === 'fonts.gstatic.com' ||
         url.hostname === 'cdnjs.cloudflare.com';
}

// Check if request is for API
function isAPIRequest(url) {
  return url.pathname.startsWith('/api/') ||
         API_ENDPOINTS.some(endpoint => url.pathname.startsWith(endpoint));
}

// Check if request is for heritage content
function isHeritageContent(url) {
  return url.pathname.includes('/assets/images/') ||
         url.pathname.includes('/assets/models/') ||
         url.pathname.includes('/assets/audio/') ||
         url.pathname.includes('/assets/videos/');
}

// Handle static assets with cache-first strategy
async function handleStaticAsset(request) {
  try {
    const cacheResponse = await caches.match(request);
    if (cacheResponse) {
      return cacheResponse;
    }
    
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
    
  } catch (error) {
    console.log('Service Worker: Static asset fetch failed:', error);
    
    // Return cached version if available
    const cacheResponse = await caches.match(request);
    if (cacheResponse) {
      return cacheResponse;
    }
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/offline.html');
    }
    
    throw error;
  }
}

// Handle API requests with network-first strategy
async function handleAPIRequest(request) {
  try {
    const networkResponse = await fetch(request);
    
    // Cache successful GET requests
    if (networkResponse.ok && request.method === 'GET') {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
    
  } catch (error) {
    console.log('Service Worker: API request failed, checking cache:', error);
    
    // Return cached version if available
    const cacheResponse = await caches.match(request);
    if (cacheResponse) {
      return cacheResponse;
    }
    
    // Return offline API response
    return new Response(
      JSON.stringify({
        error: 'Offline',
        message: 'This request is not available offline'
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Handle heritage content with cache-first strategy
async function handleHeritageContent(request) {
  try {
    const cacheResponse = await caches.match(request);
    if (cacheResponse) {
      return cacheResponse;
    }
    
    const networkResponse = await fetch(request);
    
    // Cache heritage content for offline use
    if (networkResponse.ok) {
      const cache = await caches.open(HERITAGE_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
    
  } catch (error) {
    console.log('Service Worker: Heritage content fetch failed:', error);
    
    // Return cached version if available
    const cacheResponse = await caches.match(request);
    if (cacheResponse) {
      return cacheResponse;
    }
    
    throw error;
  }
}

// Handle navigation requests
async function handleNavigation(request) {
  try {
    const networkResponse = await fetch(request);
    return networkResponse;
    
  } catch (error) {
    console.log('Service Worker: Navigation failed, serving cached version');
    
    // Serve cached index.html for SPA navigation
    const cacheResponse = await caches.match('/index.html');
    if (cacheResponse) {
      return cacheResponse;
    }
    
    // Fallback to offline page
    return caches.match('/offline.html') || new Response(
      '<!DOCTYPE html><html><head><title>Offline</title></head><body><h1>Offline</h1><p>Please check your internet connection.</p></body></html>',
      { headers: { 'Content-Type': 'text/html' } }
    );
  }
}

// Default handler for other requests
async function handleDefault(request) {
  try {
    const networkResponse = await fetch(request);
    
    // Cache successful responses in dynamic cache
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
    
  } catch (error) {
    // Return cached version if available
    const cacheResponse = await caches.match(request);
    if (cacheResponse) {
      return cacheResponse;
    }
    
    throw error;
  }
}

// Background sync for offline actions
self.addEventListener('sync', event => {
  console.log('Service Worker: Background sync triggered:', event.tag);
  
  if (event.tag === 'heritage-data-sync') {
    event.waitUntil(syncHeritageData());
  }
  
  if (event.tag === 'user-feedback-sync') {
    event.waitUntil(syncUserFeedback());
  }
  
  if (event.tag === 'analytics-sync') {
    event.waitUntil(syncAnalytics());
  }
});

// Sync heritage data when online
async function syncHeritageData() {
  try {
    console.log('Service Worker: Syncing heritage data...');
    
    // Get pending heritage data from IndexedDB
    const pendingData = await getStoredData('heritage-updates');
    
    for (const data of pendingData) {
      try {
        await fetch('/api/heritage/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        
        // Remove from pending queue
        await removeStoredData('heritage-updates', data.id);
        
      } catch (error) {
        console.log('Service Worker: Failed to sync heritage data:', error);
      }
    }
    
  } catch (error) {
    console.log('Service Worker: Heritage data sync failed:', error);
  }
}

// Sync user feedback when online
async function syncUserFeedback() {
  try {
    console.log('Service Worker: Syncing user feedback...');
    
    const pendingFeedback = await getStoredData('pending-feedback');
    
    for (const feedback of pendingFeedback) {
      try {
        await fetch('/api/feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(feedback)
        });
        
        await removeStoredData('pending-feedback', feedback.id);
        
      } catch (error) {
        console.log('Service Worker: Failed to sync feedback:', error);
      }
    }
    
  } catch (error) {
    console.log('Service Worker: Feedback sync failed:', error);
  }
}

// Sync analytics data when online
async function syncAnalytics() {
  try {
    console.log('Service Worker: Syncing analytics...');
    
    const pendingAnalytics = await getStoredData('pending-analytics');
    
    if (pendingAnalytics.length > 0) {
      try {
        await fetch('/api/analytics/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ events: pendingAnalytics })
        });
        
        // Clear all pending analytics
        await clearStoredData('pending-analytics');
        
      } catch (error) {
        console.log('Service Worker: Failed to sync analytics:', error);
      }
    }
    
  } catch (error) {
    console.log('Service Worker: Analytics sync failed:', error);
  }
}

// Push notification handling
self.addEventListener('push', event => {
  console.log('Service Worker: Push notification received');
  
  const options = {
    body: 'New heritage content available!',
    icon: '/assets/icons/icon-192x192.png',
    badge: '/assets/icons/badge-72x72.png',
    tag: 'heritage-update',
    data: {
      url: '/#heritage-sites'
    },
    actions: [
      {
        action: 'explore',
        title: 'Explore Now',
        icon: '/assets/icons/explore-icon.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  };
  
  if (event.data) {
    try {
      const payload = event.data.json();
      options.body = payload.body || options.body;
      options.data = { ...options.data, ...payload.data };
    } catch (error) {
      console.log('Service Worker: Invalid push payload:', error);
    }
  }
  
  event.waitUntil(
    self.registration.showNotification('BharatVRsh', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', event => {
  console.log('Service Worker: Notification clicked:', event.action);
  
  event.notification.close();
  
  if (event.action === 'explore' || !event.action) {
    event.waitUntil(
      clients.openWindow(event.notification.data.url || '/')
    );
  }
});

// Message handling for communication with main thread
self.addEventListener('message', event => {
  console.log('Service Worker: Message received:', event.data);
  
  const { type, payload } = event.data;
  
  switch (type) {
    case 'CACHE_HERITAGE_SITE':
      cacheHeritageSite(payload);
      break;
      
    case 'CLEAR_CACHE':
      clearAllCaches();
      break;
      
    case 'GET_CACHE_STATUS':
      getCacheStatus().then(status => {
        event.ports[0].postMessage(status);
      });
      break;
      
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    default:
      console.log('Service Worker: Unknown message type:', type);
  }
});

// Cache specific heritage site for offline use
async function cacheHeritageSite(siteData) {
  try {
    const cache = await caches.open(HERITAGE_CACHE);
    
    const urlsToCache = [
      siteData.imageUrl,
      siteData.thumbnailUrl,
      siteData.modelUrl,
      ...siteData.audioUrls || []
    ].filter(Boolean);
    
    await Promise.all(
      urlsToCache.map(url => 
        fetch(url).then(response => {
          if (response.ok) {
            return cache.put(url, response);
          }
        }).catch(error => {
          console.log('Service Worker: Failed to cache:', url, error);
        })
      )
    );
    
    console.log('Service Worker: Heritage site cached:', siteData.id);
    
  } catch (error) {
    console.log('Service Worker: Failed to cache heritage site:', error);
  }
}

// Clear all caches
async function clearAllCaches() {
  try {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames.map(cacheName => caches.delete(cacheName))
    );
    console.log('Service Worker: All caches cleared');
  } catch (error) {
    console.log('Service Worker: Failed to clear caches:', error);
  }
}

// Get cache status
async function getCacheStatus() {
  try {
    const cacheNames = await caches.keys();
    const status = {};
    
    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName);
      const keys = await cache.keys();
      status[cacheName] = keys.length;
    }
    
    return status;
  } catch (error) {
    console.log('Service Worker: Failed to get cache status:', error);
    return {};
  }
}

// IndexedDB helper functions (simplified)
async function getStoredData(storeName) {
  // In a real implementation, this would use IndexedDB
  // For this example, we'll return empty array
  return [];
}

async function removeStoredData(storeName, id) {
  // In a real implementation, this would remove from IndexedDB
  console.log('Service Worker: Would remove from', storeName, 'id:', id);
}

async function clearStoredData(storeName) {
  // In a real implementation, this would clear IndexedDB store
  console.log('Service Worker: Would clear store:', storeName);
}

// Cache size management
async function manageCacheSize() {
  const MAX_CACHE_SIZE = 100 * 1024 * 1024; // 100MB
  
  try {
    const estimate = await navigator.storage.estimate();
    
    if (estimate.usage > MAX_CACHE_SIZE) {
      console.log('Service Worker: Cache size exceeded, cleaning up...');
      
      // Clean up dynamic cache first
      const dynamicCache = await caches.open(DYNAMIC_CACHE);
      const requests = await dynamicCache.keys();
      
      // Remove oldest entries (simple FIFO approach)
      const deleteCount = Math.floor(requests.length * 0.2); // Remove 20%
      await Promise.all(
        requests.slice(0, deleteCount).map(request => 
          dynamicCache.delete(request)
        )
      );
    }
  } catch (error) {
    console.log('Service Worker: Cache management failed:', error);
  }
}

// Periodic cache cleanup
setInterval(manageCacheSize, 60000); // Check every minute

console.log('Service Worker: Loaded successfully');