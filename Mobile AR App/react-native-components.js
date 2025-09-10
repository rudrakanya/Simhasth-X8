# React Native Components for BharatVRsh Heritage AR App
# Core UI components for mobile heritage tourism application

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  Image,
  FlatList,
  Modal,
  ActivityIndicator,
  Alert
} from 'react-native';
import { ARView, ARTrackingState } from 'react-native-ar';
import { useDispatch, useSelector } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Sound from 'react-native-sound';

// Heritage Site Card Component
export const HeritageSiteCard = ({ site, onPress, style }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  
  return (
    <TouchableOpacity 
      style={[styles.siteCard, style]} 
      onPress={() => onPress(site)}
      activeOpacity={0.8}
      testID="site-card"
    >
      <View style={styles.cardImageContainer}>
        <Image
          source={{ uri: site.thumbnailUrl }}
          style={styles.cardImage}
          onLoad={() => setImageLoaded(true)}
          testID="site-thumbnail"
        />
        {!imageLoaded && (
          <ActivityIndicator 
            style={styles.imageLoader} 
            color="#D4AF37" 
          />
        )}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)']}
          style={styles.cardGradient}
        />
      </View>
      
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {site.name}
        </Text>
        <View style={styles.cardLocationRow}>
          <Icon name="location-on" size={16} color="#666" />
          <Text style={styles.cardLocation}>{site.location}</Text>
        </View>
        <View style={styles.cardMetrics}>
          <View style={styles.metricItem}>
            <Icon name="access-time" size={14} color="#D4AF37" />
            <Text style={styles.metricText}>{site.tourDuration}</Text>
          </View>
          <View style={styles.metricItem}>
            <Icon name="language" size={14} color="#D4AF37" />
            <Text style={styles.metricText}>{site.languages.length} lang</Text>
          </View>
        </View>
      </View>
      
      {site.isOfflineAvailable && (
        <View style={styles.offlineBadge}>
          <Icon name="offline-pin" size={12} color="#4CAF50" />
        </View>
      )}
    </TouchableOpacity>
  );
};

// AR Heritage Viewer Component
export const ARHeritageViewer = ({ siteData, onClose }) => {
  const [arState, setARState] = useState({
    isTracking: false,
    trackingState: 'limited',
    isModelPlaced: false,
    showInstructions: true
  });
  
  const [currentTour, setCurrentTour] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const instructionFade = useRef(new Animated.Value(1)).current;
  const sound = useRef(null);
  
  useEffect(() => {
    // Initialize AR session
    initializeAR();
    
    return () => {
      // Cleanup
      if (sound.current) {
        sound.current.stop();
        sound.current.release();
      }
    };
  }, []);
  
  const initializeAR = async () => {
    try {
      // AR initialization logic
      setARState(prev => ({ ...prev, isTracking: true }));
    } catch (error) {
      Alert.alert('AR Error', 'Failed to initialize AR session');
    }
  };
  
  const onARTrackingUpdate = (trackingState) => {
    setARState(prev => ({ 
      ...prev, 
      trackingState,
      isTracking: trackingState === 'normal'
    }));
    
    if (trackingState === 'normal' && arState.showInstructions) {
      // Hide instructions after successful tracking
      Animated.timing(instructionFade, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true
      }).start(() => {
        setARState(prev => ({ ...prev, showInstructions: false }));
      });
    }
  };
  
  const placeHeritageModel = () => {
    // Place 3D model logic
    setARState(prev => ({ ...prev, isModelPlaced: true }));
  };
  
  const startGuidedTour = async (tourId) => {
    try {
      const tour = siteData.tours.find(t => t.id === tourId);
      setCurrentTour(tour);
      
      // Load and play audio narration
      sound.current = new Sound(tour.audioUrl, null, (error) => {
        if (!error) {
          sound.current.play();
          setIsPlaying(true);
        }
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to start guided tour');
    }
  };
  
  const renderTrackingInstructions = () => {
    if (!arState.showInstructions) return null;
    
    return (
      <Animated.View 
        style={[styles.instructionsOverlay, { opacity: instructionFade }]}
      >
        <View style={styles.instructionsCard}>
          <Icon name="camera" size={48} color="#D4AF37" />
          <Text style={styles.instructionsTitle}>
            Point your camera at a flat surface
          </Text>
          <Text style={styles.instructionsText}>
            Move your device slowly to detect surfaces for placing the heritage model
          </Text>
        </View>
      </Animated.View>
    );
  };
  
  const renderARControls = () => {
    if (!arState.isModelPlaced) return null;
    
    return (
      <View style={styles.arControlsContainer}>
        <TouchableOpacity 
          style={styles.tourButton}
          onPress={() => startGuidedTour(siteData.defaultTourId)}
        >
          <Icon name="play-arrow" size={24} color="#fff" />
          <Text style={styles.tourButtonText}>Start Tour</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.infoButton}
          onPress={() => setShowInfoModal(true)}
        >
          <Icon name="info" size={24} color="#D4AF37" />
        </TouchableOpacity>
      </View>
    );
  };
  
  return (
    <View style={styles.arContainer}>
      <ARView
        style={styles.arView}
        onTrackingUpdate={onARTrackingUpdate}
        onPlaneDetected={placeHeritageModel}
        configuration={{
          planeDetection: 'horizontal',
          lightEstimation: true,
          providesAudioData: false
        }}
      />
      
      {renderTrackingInstructions()}
      {renderARControls()}
      
      {/* AR Session Header */}
      <View style={styles.arHeader}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Icon name="close" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.arTitle}>{siteData.name}</Text>
        <View style={styles.trackingIndicator}>
          <View 
            style={[
              styles.trackingDot, 
              { backgroundColor: arState.isTracking ? '#4CAF50' : '#F44336' }
            ]} 
          />
        </View>
      </View>
      
      {/* Current Tour Info */}
      {currentTour && (
        <View style={styles.tourOverlay}>
          <Text style={styles.tourTitle}>{currentTour.title}</Text>
          <Text style={styles.tourDescription}>{currentTour.description}</Text>
          <View style={styles.audioControls}>
            <TouchableOpacity 
              onPress={() => isPlaying ? sound.current.pause() : sound.current.play()}
            >
              <Icon 
                name={isPlaying ? "pause" : "play-arrow"} 
                size={32} 
                color="#D4AF37" 
              />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

// Heritage Site List Component
export const HeritageSiteList = ({ sites, onSiteSelect, loading }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  const categories = [
    { id: 'all', name: 'All Sites', icon: 'apps' },
    { id: 'temple', name: 'Temples', icon: 'account-balance' },
    { id: 'cave', name: 'Caves', icon: 'landscape' },
    { id: 'fort', name: 'Forts', icon: 'security' },
    { id: 'observatory', name: 'Observatories', icon: 'visibility' }
  ];
  
  const filteredSites = selectedCategory === 'all' 
    ? sites 
    : sites.filter(site => site.category === selectedCategory);
  
  const renderCategoryFilter = () => (
    <View style={styles.categoryContainer}>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={categories}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.categoryChip,
              selectedCategory === item.id && styles.categoryChipActive
            ]}
            onPress={() => setSelectedCategory(item.id)}
          >
            <Icon 
              name={item.icon} 
              size={16} 
              color={selectedCategory === item.id ? '#fff' : '#666'} 
            />
            <Text 
              style={[
                styles.categoryChipText,
                selectedCategory === item.id && styles.categoryChipTextActive
              ]}
            >
              {item.name}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
  
  const renderSiteItem = ({ item }) => (
    <HeritageSiteCard
      site={item}
      onPress={onSiteSelect}
      style={styles.listSiteCard}
    />
  );
  
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="location-off" size={64} color="#ccc" />
      <Text style={styles.emptyStateTitle}>No heritage sites found</Text>
      <Text style={styles.emptyStateText}>
        Try selecting a different category or check your connection
      </Text>
    </View>
  );
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#D4AF37" />
        <Text style={styles.loadingText}>Loading heritage sites...</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.listContainer}>
      {renderCategoryFilter()}
      <FlatList
        data={filteredSites}
        keyExtractor={(item) => item.id}
        renderItem={renderSiteItem}
        numColumns={2}
        columnWrapperStyle={styles.listRow}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

// Cultural Timeline Component
export const CulturalTimeline = ({ periods, currentPeriod, onPeriodSelect }) => {
  const scrollViewRef = useRef();
  const [timelineWidth, setTimelineWidth] = useState(0);
  
  useEffect(() => {
    // Auto-scroll to current period
    if (currentPeriod && scrollViewRef.current) {
      const periodIndex = periods.findIndex(p => p.id === currentPeriod.id);
      const scrollPosition = (periodIndex * 120) - (timelineWidth / 2);
      scrollViewRef.current.scrollTo({ x: scrollPosition, animated: true });
    }
  }, [currentPeriod, timelineWidth]);
  
  const renderTimelinePeriod = (period, index) => {
    const isActive = currentPeriod?.id === period.id;
    
    return (
      <TouchableOpacity
        key={period.id}
        style={[styles.timelinePeriod, isActive && styles.timelinePeriodActive]}
        onPress={() => onPeriodSelect(period)}
      >
        <View style={[styles.timelineDot, { backgroundColor: period.color }]} />
        <Text style={[styles.timelineYear, isActive && styles.timelineYearActive]}>
          {period.year}
        </Text>
        <Text style={[styles.timelineName, isActive && styles.timelineNameActive]}>
          {period.name}
        </Text>
        {index < periods.length - 1 && <View style={styles.timelineLine} />}
      </TouchableOpacity>
    );
  };
  
  return (
    <View style={styles.timelineContainer}>
      <Text style={styles.timelineTitle}>Historical Timeline</Text>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.timelineContent}
        onLayout={(event) => setTimelineWidth(event.nativeEvent.layout.width)}
      >
        {periods.map((period, index) => renderTimelinePeriod(period, index))}
      </ScrollView>
      
      {currentPeriod && (
        <View style={styles.timelineDetails}>
          <Text style={styles.timelineDetailsTitle}>{currentPeriod.name}</Text>
          <Text style={styles.timelineDetailsDate}>{currentPeriod.dateRange}</Text>
          <Text style={styles.timelineDetailsDescription}>
            {currentPeriod.description}
          </Text>
        </View>
      )}
    </View>
  );
};

// Guide Booking Component
export const GuideBooking = ({ guides, onBookGuide, visible, onClose }) => {
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  
  const renderGuide = ({ item: guide }) => (
    <TouchableOpacity
      style={[
        styles.guideCard,
        selectedGuide?.id === guide.id && styles.guideCardSelected
      ]}
      onPress={() => setSelectedGuide(guide)}
    >
      <Image source={{ uri: guide.avatarUrl }} style={styles.guideAvatar} />
      <View style={styles.guideInfo}>
        <Text style={styles.guideName}>{guide.name}</Text>
        <Text style={styles.guideLanguages}>
          Languages: {guide.languages.join(', ')}
        </Text>
        <View style={styles.guideRating}>
          {[...Array(5)].map((_, i) => (
            <Icon
              key={i}
              name="star"
              size={16}
              color={i < guide.rating ? "#FFD700" : "#ccc"}
            />
          ))}
          <Text style={styles.guideRatingText}>({guide.reviews})</Text>
        </View>
        <Text style={styles.guidePrice}>₹{guide.pricePerHour}/hour</Text>
      </View>
    </TouchableOpacity>
  );
  
  const renderTimeSlot = (timeSlot) => (
    <TouchableOpacity
      key={timeSlot.id}
      style={[
        styles.timeSlot,
        selectedTimeSlot?.id === timeSlot.id && styles.timeSlotSelected,
        !timeSlot.available && styles.timeSlotDisabled
      ]}
      onPress={() => timeSlot.available && setSelectedTimeSlot(timeSlot)}
      disabled={!timeSlot.available}
    >
      <Text style={[
        styles.timeSlotText,
        selectedTimeSlot?.id === timeSlot.id && styles.timeSlotTextSelected,
        !timeSlot.available && styles.timeSlotTextDisabled
      ]}>
        {timeSlot.time}
      </Text>
    </TouchableOpacity>
  );
  
  const handleBooking = () => {
    if (selectedGuide && selectedTimeSlot) {
      onBookGuide({
        guide: selectedGuide,
        timeSlot: selectedTimeSlot
      });
      onClose();
    }
  };
  
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.bookingContainer}>
        <View style={styles.bookingHeader}>
          <TouchableOpacity onPress={onClose}>
            <Icon name="close" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.bookingTitle}>Book a Heritage Guide</Text>
          <View style={{ width: 24 }} />
        </View>
        
        <FlatList
          data={guides}
          keyExtractor={(item) => item.id}
          renderItem={renderGuide}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.guidesList}
        />
        
        {selectedGuide && (
          <View style={styles.timeSlotsContainer}>
            <Text style={styles.timeSlotsTitle}>Available Time Slots</Text>
            <View style={styles.timeSlotsGrid}>
              {selectedGuide.availableSlots.map(renderTimeSlot)}
            </View>
          </View>
        )}
        
        {selectedGuide && selectedTimeSlot && (
          <TouchableOpacity style={styles.bookButton} onPress={handleBooking}>
            <Text style={styles.bookButtonText}>
              Book Guide - ₹{selectedGuide.pricePerHour}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </Modal>
  );
};

// Offline Download Manager Component
export const OfflineDownloadManager = ({ site, onDownloadComplete }) => {
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadedSize, setDownloadedSize] = useState(0);
  const [totalSize, setTotalSize] = useState(0);
  
  const startDownload = async () => {
    setIsDownloading(true);
    
    try {
      // Simulate download progress
      const assets = site.offlineAssets || [];
      const total = assets.reduce((sum, asset) => sum + asset.size, 0);
      setTotalSize(total);
      
      let downloaded = 0;
      
      for (const asset of assets) {
        // Download each asset
        await downloadAsset(asset, (progress) => {
          const assetProgress = (asset.size * progress) / 100;
          const totalProgress = ((downloaded + assetProgress) / total) * 100;
          setDownloadProgress(totalProgress);
          setDownloadedSize(downloaded + assetProgress);
        });
        
        downloaded += asset.size;
      }
      
      setIsDownloading(false);
      onDownloadComplete(site.id);
    } catch (error) {
      setIsDownloading(false);
      Alert.alert('Download Failed', 'Failed to download heritage site content');
    }
  };
  
  const downloadAsset = (asset, onProgress) => {
    return new Promise((resolve) => {
      // Simulate download with progress updates
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 10;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          resolve();
        }
        onProgress(progress);
      }, 100);
    });
  };
  
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };
  
  return (
    <View style={styles.downloadContainer}>
      <View style={styles.downloadHeader}>
        <Icon name="cloud-download" size={24} color="#D4AF37" />
        <Text style={styles.downloadTitle}>Download for Offline Use</Text>
      </View>
      
      <Text style={styles.downloadDescription}>
        Download this heritage site to explore it without internet connection
      </Text>
      
      <View style={styles.downloadStats}>
        <View style={styles.downloadStat}>
          <Text style={styles.downloadStatLabel}>Total Size</Text>
          <Text style={styles.downloadStatValue}>
            {formatFileSize(site.totalOfflineSize)}
          </Text>
        </View>
        <View style={styles.downloadStat}>
          <Text style={styles.downloadStatLabel}>Includes</Text>
          <Text style={styles.downloadStatValue}>3D Models, Audio, Images</Text>
        </View>
      </View>
      
      {!isDownloading ? (
        <TouchableOpacity style={styles.downloadButton} onPress={startDownload}>
          <Icon name="file-download" size={20} color="#fff" />
          <Text style={styles.downloadButtonText}>Download Now</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.downloadProgress}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${downloadProgress}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            {Math.round(downloadProgress)}% - {formatFileSize(downloadedSize)} / {formatFileSize(totalSize)}
          </Text>
        </View>
      )}
    </View>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  // Heritage Site Card Styles
  siteCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    margin: 8,
  },
  cardImageContainer: {
    height: 120,
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageLoader: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -10,
    marginLeft: -10,
  },
  cardGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
  },
  cardContent: {
    padding: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  cardLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardLocation: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  cardMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricText: {
    fontSize: 11,
    color: '#666',
    marginLeft: 4,
  },
  offlineBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(76, 175, 80, 0.9)',
    borderRadius: 12,
    padding: 4,
  },
  
  // AR Viewer Styles
  arContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  arView: {
    flex: 1,
  },
  arHeader: {
    position: 'absolute',
    top: 44,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  closeButton: {
    padding: 8,
  },
  arTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  trackingIndicator: {
    padding: 8,
  },
  trackingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  instructionsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  instructionsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    margin: 32,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  arControlsContainer: {
    position: 'absolute',
    bottom: 44,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tourButton: {
    backgroundColor: '#D4AF37',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    flex: 1,
    marginRight: 12,
  },
  tourButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  infoButton: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 12,
    borderRadius: 25,
  },
  tourOverlay: {
    position: 'absolute',
    bottom: 120,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderRadius: 12,
    padding: 16,
  },
  tourTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  tourDescription: {
    color: '#ccc',
    fontSize: 14,
    marginBottom: 12,
  },
  audioControls: {
    alignItems: 'center',
  },
  
  // Heritage Site List Styles
  listContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  categoryContainer: {
    backgroundColor: '#fff',
    paddingVertical: 12,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  categoryChipActive: {
    backgroundColor: '#D4AF37',
  },
  categoryChipText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  categoryChipTextActive: {
    color: '#fff',
  },
  listContent: {
    padding: 8,
  },
  listRow: {
    justifyContent: 'space-between',
  },
  listSiteCard: {
    flex: 1,
    maxWidth: (width - 32) / 2,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  
  // Timeline Styles
  timelineContainer: {
    backgroundColor: '#fff',
    paddingVertical: 16,
  },
  timelineTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
  },
  timelineContent: {
    paddingHorizontal: 16,
  },
  timelinePeriod: {
    alignItems: 'center',
    width: 120,
    marginHorizontal: 8,
    position: 'relative',
  },
  timelinePeriodActive: {
    transform: [{ scale: 1.1 }],
  },
  timelineDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  timelineYear: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  timelineYearActive: {
    color: '#D4AF37',
  },
  timelineName: {
    fontSize: 10,
    color: '#999',
    textAlign: 'center',
  },
  timelineNameActive: {
    color: '#333',
  },
  timelineLine: {
    position: 'absolute',
    top: 8,
    right: -20,
    width: 40,
    height: 1,
    backgroundColor: '#ddd',
  },
  timelineDetails: {
    margin: 16,
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  timelineDetailsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  timelineDetailsDate: {
    fontSize: 14,
    color: '#D4AF37',
    marginBottom: 8,
  },
  timelineDetailsDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  
  // Guide Booking Styles
  bookingContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  bookingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  bookingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  guidesList: {
    padding: 16,
  },
  guideCard: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  guideCardSelected: {
    borderColor: '#D4AF37',
    backgroundColor: '#FFF9E6',
  },
  guideAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  guideInfo: {
    flex: 1,
  },
  guideName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  guideLanguages: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  guideRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  guideRatingText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  guidePrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#D4AF37',
  },
  timeSlotsContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  timeSlotsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  timeSlotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  timeSlot: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    margin: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  timeSlotSelected: {
    borderColor: '#D4AF37',
    backgroundColor: '#FFF9E6',
  },
  timeSlotDisabled: {
    backgroundColor: '#f5f5f5',
    borderColor: '#eee',
  },
  timeSlotText: {
    fontSize: 12,
    color: '#333',
  },
  timeSlotTextSelected: {
    color: '#D4AF37',
    fontWeight: '600',
  },
  timeSlotTextDisabled: {
    color: '#999',
  },
  bookButton: {
    backgroundColor: '#D4AF37',
    margin: 16,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Download Manager Styles
  downloadContainer: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  downloadHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  downloadTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  downloadDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  downloadStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  downloadStat: {
    flex: 1,
  },
  downloadStatLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 2,
  },
  downloadStatValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  downloadButton: {
    backgroundColor: '#D4AF37',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  downloadButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  downloadProgress: {
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#eee',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#D4AF37',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
  },
});

export default {
  HeritageSiteCard,
  ARHeritageViewer,
  HeritageSiteList,
  CulturalTimeline,
  GuideBooking,
  OfflineDownloadManager,
};