# API Documentation for BharatVRsh Heritage AR Mobile App
# REST API endpoints and data schemas

## Base URL
- **Development:** `http://localhost:3000/api/v1`
- **Staging:** `https://staging-api.bharatvrsh.com/api/v1`
- **Production:** `https://api.bharatvrsh.com/api/v1`

## Authentication

### Headers
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
X-App-Version: 1.0.0
X-Platform: ios|android
```

### Auth Endpoints

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe",
  "language": "en",
  "country": "IN"
}

Response 201:
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "name": "John Doe",
      "language": "en",
      "country": "IN",
      "createdAt": "2025-09-10T08:00:00Z"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
      "expiresIn": 3600
    }
  }
}
```

#### Login User
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}

Response 200:
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "name": "John Doe",
      "language": "en",
      "preferences": {
        "notifications": true,
        "offlineDownload": true,
        "dataUsage": "wifi_only"
      }
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
      "expiresIn": 3600
    }
  }
}
```

#### Refresh Token
```http
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}

Response 200:
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 3600
  }
}
```

## Heritage Sites

### Get Heritage Sites List
```http
GET /heritage/sites?category=temple&state=MP&limit=20&offset=0
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "data": {
    "sites": [
      {
        "id": "site_bateshwar",
        "name": "Bateshwar Temple Complex",
        "description": "A magnificent complex of over 200 restored Hindu temples",
        "location": {
          "name": "Morena District, Madhya Pradesh",
          "coordinates": {
            "latitude": 26.0173,
            "longitude": 77.2088
          },
          "address": "Bateshwar, Morena, MP 476001"
        },
        "category": "temple",
        "subcategory": "temple_complex",
        "culturalPeriod": "8th-9th Century CE",
        "thumbnailUrl": "https://cdn.bharatvrsh.com/sites/bateshwar/thumb.jpg",
        "images": [
          "https://cdn.bharatvrsh.com/sites/bateshwar/img1.jpg",
          "https://cdn.bharatvrsh.com/sites/bateshwar/img2.jpg"
        ],
        "tourDuration": "45 min",
        "languages": ["hi", "en", "mr"],
        "isOfflineAvailable": true,
        "offlineSize": 85000000,
        "rating": 4.8,
        "reviewCount": 1247,
        "accessibility": {
          "wheelchairAccessible": false,
          "audioDescriptions": true,
          "textAlternatives": true
        },
        "features": [
          "AR_VISUALIZATION",
          "GUIDED_TOURS",
          "HISTORICAL_TIMELINE",
          "CULTURAL_STORIES"
        ]
      }
    ],
    "pagination": {
      "total": 156,
      "limit": 20,
      "offset": 0,
      "hasMore": true
    },
    "filters": {
      "categories": ["temple", "cave", "fort", "observatory"],
      "states": ["MP", "RJ", "UP", "GJ"],
      "periods": ["ancient", "medieval", "colonial", "modern"]
    }
  }
}
```

### Get Site Details
```http
GET /heritage/sites/site_bateshwar
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "data": {
    "site": {
      "id": "site_bateshwar",
      "name": "Bateshwar Temple Complex",
      "description": "A magnificent complex of over 200 restored Hindu temples representing one of the largest collections of ancient temples in Asia.",
      "location": {
        "name": "Morena District, Madhya Pradesh",
        "coordinates": {
          "latitude": 26.0173,
          "longitude": 77.2088
        },
        "address": "Bateshwar, Morena, MP 476001",
        "nearestCity": "Gwalior",
        "distanceFromCity": 42
      },
      "historicalInfo": {
        "built": "8th-9th Century CE",
        "dynasty": "Gurjara-Pratihara",
        "architects": "Unknown master craftsmen",
        "significance": "Largest temple complex in North India",
        "currentStatus": "ASI Protected Monument"
      },
      "content": {
        "hi": {
          "name": "बटेश्वर मंदिर परिसर",
          "description": "200 से अधिक पुनर्निर्मित हिंदू मंदिरों का एक भव्य परिसर",
          "culturalSignificance": "उत्तर भारत की सबसे बड़ी मंदिर परिसर"
        },
        "en": {
          "name": "Bateshwar Temple Complex",
          "description": "A magnificent complex of over 200 restored Hindu temples",
          "culturalSignificance": "Largest temple complex in North India"
        }
      },
      "timeline": [
        {
          "id": "period_1",
          "name": "Gurjara-Pratihara Era",
          "dateRange": "8th-9th Century CE",
          "year": "750 CE",
          "description": "Original construction period during the height of Pratihara power",
          "color": "#D4AF37",
          "significance": "Construction of main temples"
        }
      ],
      "tours": [
        {
          "id": "tour_basic",
          "name": "Heritage Discovery Tour",
          "description": "Explore the architectural marvels of ancient India",
          "duration": 2700,
          "language": "en",
          "audioUrl": "https://cdn.bharatvrsh.com/tours/bateshwar/basic_en.mp3",
          "type": "audio_guided",
          "price": 0
        }
      ],
      "models": [
        {
          "id": "model_main_temple",
          "name": "Bhuteśvara Temple",
          "description": "Main temple dedicated to Lord Shiva",
          "url": "https://cdn.bharatvrsh.com/models/bateshwar/main_temple.glb",
          "thumbnailUrl": "https://cdn.bharatvrsh.com/models/bateshwar/main_temple_thumb.jpg",
          "size": 15000000,
          "boundingBox": {
            "min": [-10, 0, -15],
            "max": [10, 25, 15]
          },
          "lodLevels": [
            {
              "quality": "low",
              "url": "https://cdn.bharatvrsh.com/models/bateshwar/main_temple_low.glb",
              "size": 5000000,
              "vertices": 5000
            },
            {
              "quality": "medium",
              "url": "https://cdn.bharatvrsh.com/models/bateshwar/main_temple_med.glb",
              "size": 10000000,
              "vertices": 15000
            },
            {
              "quality": "high",
              "url": "https://cdn.bharatvrsh.com/models/bateshwar/main_temple_high.glb",
              "size": 25000000,
              "vertices": 50000
            }
          ]
        }
      ],
      "culturalElements": [
        {
          "id": "element_main_sanctum",
          "name": "Main Sanctum",
          "description": "Sacred chamber housing the Shiva lingam",
          "type": "architectural",
          "significance": "religious",
          "audioClip": "https://cdn.bharatvrsh.com/audio/bateshwar/sanctum_en.mp3",
          "position": [0, 2, 0]
        }
      ],
      "offlineContent": {
        "available": true,
        "totalSize": 85000000,
        "assets": [
          {
            "type": "models",
            "size": 45000000,
            "count": 8
          },
          {
            "type": "audio",
            "size": 25000000,
            "count": 12
          },
          {
            "type": "images",
            "size": 15000000,
            "count": 24
          }
        ]
      }
    }
  }
}
```

## AR Content

### Get AR Models
```http
GET /ar/models/model_main_temple
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "data": {
    "model": {
      "id": "model_main_temple",
      "name": "Bhuteśvara Temple",
      "siteId": "site_bateshwar",
      "format": "glb",
      "version": "1.2.0",
      "url": "https://cdn.bharatvrsh.com/models/bateshwar/main_temple.glb",
      "size": 15000000,
      "checksum": "sha256:a1b2c3d4...",
      "metadata": {
        "vertices": 25000,
        "faces": 45000,
        "textures": 8,
        "animations": 2,
        "createdAt": "2025-08-15T10:30:00Z",
        "lastModified": "2025-09-01T14:20:00Z"
      },
      "boundingBox": {
        "min": [-10, 0, -15],
        "max": [10, 25, 15]
      },
      "lodLevels": [
        {
          "quality": "low",
          "url": "https://cdn.bharatvrsh.com/models/bateshwar/main_temple_low.glb",
          "size": 5000000,
          "vertices": 5000,
          "recommendedDistance": 10
        }
      ],
      "textures": [
        {
          "type": "diffuse",
          "url": "https://cdn.bharatvrsh.com/textures/bateshwar/temple_diffuse.jpg",
          "size": 2048
        },
        {
          "type": "normal",
          "url": "https://cdn.bharatvrsh.com/textures/bateshwar/temple_normal.jpg",
          "size": 2048
        }
      ],
      "culturalAccuracy": {
        "verified": true,
        "verifiedBy": "Dr. K.K. Sharma, ASI",
        "verificationDate": "2025-08-20T00:00:00Z",
        "accuracyScore": 0.98
      }
    }
  }
}
```

### Download AR Model
```http
GET /ar/models/model_main_temple/download?quality=medium
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "data": {
    "downloadUrl": "https://cdn.bharatvrsh.com/models/bateshwar/main_temple_med.glb",
    "expiresAt": "2025-09-10T12:00:00Z",
    "size": 10000000,
    "checksum": "sha256:a1b2c3d4...",
    "downloadId": "dl_123456789"
  }
}
```

## Tours & Guides

### Get Available Tours
```http
GET /tours?siteId=site_bateshwar&language=en
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "data": {
    "tours": [
      {
        "id": "tour_basic_bateshwar",
        "name": "Heritage Discovery Tour",
        "description": "Explore the architectural marvels and historical significance",
        "type": "audio_guided",
        "duration": 2700,
        "language": "en",
        "narrator": {
          "name": "Dr. Priya Sharma",
          "credentials": "Archaeologist, ASI",
          "audioSample": "https://cdn.bharatvrsh.com/narrators/priya_sample.mp3"
        },
        "price": 0,
        "currency": "INR",
        "audioUrl": "https://cdn.bharatvrsh.com/tours/bateshwar/basic_en.mp3",
        "transcript": "https://cdn.bharatvrsh.com/tours/bateshwar/basic_en.txt",
        "waypoints": [
          {
            "id": "wp_entrance",
            "name": "Temple Complex Entrance",
            "timestamp": 0,
            "position": [0, 0, -20],
            "description": "Welcome to the magnificent Bateshwar temple complex"
          }
        ],
        "rating": 4.9,
        "reviewCount": 856
      }
    ]
  }
}
```

### Get Available Guides
```http
GET /guides?siteId=site_bateshwar&language=en&date=2025-09-15
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "data": {
    "guides": [
      {
        "id": "guide_ravi_sharma",
        "name": "Ravi Sharma",
        "bio": "Local heritage expert with 15 years of experience",
        "languages": ["hi", "en", "mr"],
        "specialties": ["temple_architecture", "local_history", "cultural_traditions"],
        "rating": 4.8,
        "reviewCount": 234,
        "pricePerHour": 500,
        "currency": "INR",
        "avatarUrl": "https://cdn.bharatvrsh.com/guides/ravi_sharma.jpg",
        "certifications": [
          "Licensed Tourist Guide",
          "Heritage Site Specialist"
        ],
        "availableSlots": [
          {
            "id": "slot_morning",
            "time": "10:00 AM",
            "duration": 3600,
            "available": true,
            "price": 500
          },
          {
            "id": "slot_afternoon",
            "time": "2:00 PM",
            "duration": 3600,
            "available": false,
            "price": 500
          }
        ],
        "msmePartner": true,
        "partnerInfo": {
          "businessName": "Bateshwar Heritage Tours",
          "registrationNumber": "MSME123456",
          "location": "Morena, MP"
        }
      }
    ]
  }
}
```

### Book Guide Session
```http
POST /guides/guide_ravi_sharma/book
Authorization: Bearer <token>
Content-Type: application/json

{
  "slotId": "slot_morning",
  "date": "2025-09-15",
  "siteId": "site_bateshwar",
  "duration": 3600,
  "language": "en",
  "specialRequests": "Focus on architectural details"
}

Response 201:
{
  "success": true,
  "data": {
    "booking": {
      "id": "booking_abc123",
      "guideId": "guide_ravi_sharma",
      "userId": "user_123",
      "siteId": "site_bateshwar",
      "scheduledAt": "2025-09-15T10:00:00Z",
      "duration": 3600,
      "status": "confirmed",
      "price": 500,
      "currency": "INR",
      "language": "en",
      "meetingInfo": {
        "type": "video_call",
        "joinUrl": "https://meet.bharatvrsh.com/session/abc123",
        "meetingId": "abc123",
        "accessCode": "7890"
      },
      "guideInfo": {
        "name": "Ravi Sharma",
        "phone": "+91-9876543210",
        "whatsapp": "+91-9876543210"
      },
      "createdAt": "2025-09-10T08:30:00Z"
    }
  }
}
```

## User Profile & Preferences

### Get User Profile
```http
GET /user/profile
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "name": "John Doe",
      "avatar": "https://cdn.bharatvrsh.com/avatars/user_123.jpg",
      "language": "en",
      "country": "IN",
      "preferences": {
        "notifications": {
          "tours": true,
          "bookings": true,
          "newContent": false
        },
        "accessibility": {
          "audioDescriptions": true,
          "largeText": false,
          "highContrast": false
        },
        "download": {
          "wifiOnly": true,
          "autoDownload": false,
          "maxStorageGB": 2
        }
      },
      "stats": {
        "sitesVisited": 12,
        "toursCompleted": 8,
        "totalTime": 14400,
        "favoriteCategory": "temple"
      },
      "achievements": [
        {
          "id": "explorer_bronze",
          "name": "Heritage Explorer",
          "description": "Visited 10 heritage sites",
          "unlockedAt": "2025-09-01T00:00:00Z"
        }
      ],
      "subscriptionStatus": {
        "type": "premium",
        "expiresAt": "2025-12-10T00:00:00Z",
        "autoRenew": true
      }
    }
  }
}
```

### Update User Preferences
```http
PUT /user/preferences
Authorization: Bearer <token>
Content-Type: application/json

{
  "language": "hi",
  "notifications": {
    "tours": true,
    "bookings": true,
    "newContent": true
  },
  "accessibility": {
    "audioDescriptions": true,
    "largeText": true
  }
}

Response 200:
{
  "success": true,
  "data": {
    "message": "Preferences updated successfully"
  }
}
```

## Offline Content

### Request Offline Download
```http
POST /offline/download
Authorization: Bearer <token>
Content-Type: application/json

{
  "siteId": "site_bateshwar",
  "quality": "medium",
  "includeAudio": true,
  "languages": ["en", "hi"]
}

Response 202:
{
  "success": true,
  "data": {
    "downloadId": "dl_site_bateshwar_123",
    "estimatedSize": 65000000,
    "estimatedTime": 180,
    "status": "queued",
    "assets": [
      {
        "type": "site_data",
        "size": 5000000
      },
      {
        "type": "models",
        "size": 35000000
      },
      {
        "type": "audio",
        "size": 20000000
      },
      {
        "type": "images",
        "size": 5000000
      }
    ]
  }
}
```

### Check Download Status
```http
GET /offline/download/dl_site_bateshwar_123/status
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "data": {
    "downloadId": "dl_site_bateshwar_123",
    "status": "in_progress",
    "progress": 65,
    "downloadedSize": 42250000,
    "totalSize": 65000000,
    "estimatedTimeRemaining": 45,
    "currentAsset": {
      "type": "models",
      "name": "temple_complex.glb",
      "progress": 80
    },
    "completedAssets": [
      "site_data",
      "images"
    ],
    "errors": []
  }
}
```

### Get Offline Content List
```http
GET /offline/content
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "data": {
    "offlineContent": [
      {
        "siteId": "site_bateshwar",
        "siteName": "Bateshwar Temple Complex",
        "downloadedAt": "2025-09-08T14:30:00Z",
        "size": 65000000,
        "quality": "medium",
        "languages": ["en", "hi"],
        "expiresAt": "2025-12-08T14:30:00Z",
        "lastAccessedAt": "2025-09-10T08:00:00Z",
        "assets": {
          "siteData": true,
          "models": true,
          "audio": true,
          "images": true
        }
      }
    ],
    "totalSize": 65000000,
    "availableSpace": 1935000000,
    "maxAllowedSize": 2000000000
  }
}
```

## Analytics & Feedback

### Submit User Feedback
```http
POST /feedback
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "app_feedback",
  "category": "ar_experience",
  "siteId": "site_bateshwar",
  "rating": 5,
  "title": "Amazing AR experience",
  "message": "The 3D models are incredibly detailed and the audio tour was very informative",
  "deviceInfo": {
    "platform": "ios",
    "version": "16.0",
    "model": "iPhone 14 Pro",
    "appVersion": "1.0.0"
  }
}

Response 201:
{
  "success": true,
  "data": {
    "feedbackId": "fb_123456",
    "message": "Thank you for your feedback"
  }
}
```

### Track User Analytics
```http
POST /analytics/events
Authorization: Bearer <token>
Content-Type: application/json

{
  "events": [
    {
      "type": "ar_session_started",
      "siteId": "site_bateshwar",
      "timestamp": "2025-09-10T08:15:00Z",
      "properties": {
        "modelId": "model_main_temple",
        "quality": "medium",
        "deviceSupported": true
      }
    },
    {
      "type": "tour_completed",
      "siteId": "site_bateshwar",
      "tourId": "tour_basic_bateshwar",
      "timestamp": "2025-09-10T08:45:00Z",
      "properties": {
        "duration": 1800,
        "completionRate": 100,
        "language": "en"
      }
    }
  ]
}

Response 200:
{
  "success": true,
  "data": {
    "eventsProcessed": 2
  }
}
```

## Error Responses

### Standard Error Format
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": [
      {
        "field": "siteId",
        "message": "Site ID is required"
      }
    ],
    "requestId": "req_123456789"
  }
}
```

### Common Error Codes
- `UNAUTHORIZED` (401) - Invalid or expired token
- `FORBIDDEN` (403) - Insufficient permissions
- `NOT_FOUND` (404) - Resource not found
- `VALIDATION_ERROR` (400) - Invalid request data
- `RATE_LIMIT_EXCEEDED` (429) - Too many requests
- `INTERNAL_ERROR` (500) - Server error
- `SERVICE_UNAVAILABLE` (503) - Service temporarily unavailable

## Rate Limiting
- **Free tier:** 100 requests/hour
- **Premium tier:** 1000 requests/hour
- **Guide booking:** 10 requests/hour
- **Downloads:** 5 concurrent downloads

## Data Models

### HeritageSite Schema
```typescript
interface HeritageSite {
  id: string;
  name: string;
  description: string;
  location: Location;
  category: SiteCategory;
  culturalPeriod: string;
  thumbnailUrl: string;
  images: string[];
  content: LocalizedContent;
  timeline: HistoricalPeriod[];
  tours: Tour[];
  models: Model3D[];
  culturalElements: CulturalElement[];
  accessibility: AccessibilityFeatures;
  rating: number;
  reviewCount: number;
  features: SiteFeature[];
  isOfflineAvailable: boolean;
  offlineSize: number;
}

interface Location {
  name: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  address: string;
  nearestCity?: string;
  distanceFromCity?: number;
}

interface LocalizedContent {
  [languageCode: string]: {
    name: string;
    description: string;
    culturalSignificance: string;
  };
}
```

This API documentation provides comprehensive coverage of all endpoints needed for the BharatVRsh Heritage AR mobile application, supporting features like AR visualization, guided tours, offline content, and MSME integration.