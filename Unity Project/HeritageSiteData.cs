# Heritage Site Data Configuration
# ScriptableObject for defining heritage site properties and content

using UnityEngine;
using System;

namespace HeritageDigitalTwins
{
    /// <summary>
    /// ScriptableObject containing all data for a heritage site
    /// Supports Bateshwar, Udaygiri, and other MP heritage locations
    /// </summary>
    [CreateAssetMenu(fileName = "New Heritage Site", menuName = "Heritage Digital Twins/Heritage Site Data")]
    public class HeritageSiteData : ScriptableObject
    {
        [Header("Basic Site Information")]
        public string siteName = "Heritage Site";
        public string location = "Madhya Pradesh, India";
        public SiteType siteType = SiteType.TempleComplex;
        public string culturalPeriod = "8th-9th Century";
        public string briefDescription = "";
        
        [Header("Geographic Data")]
        public Vector2 gpsCoordinates = Vector2.zero; // Lat, Lon
        public float siteArea = 25f; // in acres
        public float elevationASL = 0f; // meters above sea level
        
        [Header("3D Models and Positioning")]
        public GameObject[] modelPrefabs;
        public Vector3[] modelPositions;
        public Vector3[] modelRotations;
        public Vector3[] modelScales;
        
        [Header("Default Camera Settings")]
        public Vector3 defaultViewPosition = new Vector3(0, 2, -5);
        public Vector3 defaultViewRotation = new Vector3(0, 0, 0);
        public float defaultFOV = 60f;
        
        [Header("Cultural Content")]
        [TextArea(3, 10)]
        public string introductoryText = "";
        [TextArea(3, 5)]
        public string[] historicalTexts;
        [TextArea(3, 5)]
        public string[] architecturalDescriptions;
        [TextArea(3, 5)]
        public string[] culturalSignificanceTexts;
        
        [Header("Interactive Elements")]
        public InteractionType[] interactionTypes;
        public ArchitecturalElement[] architecturalElements;
        public CulturalElementData[] culturalElements;
        
        [Header("Audio Content")]
        public AudioClip welcomeAudio;
        public AudioClip ambientAudio;
        public AudioClip[] spatialAudio;
        public MultilingualAudio[] narrationAudio;
        
        [Header("Timeline Data")]
        public HistoricalPeriod[] timeline;
        
        [Header("MSME Training Configuration")]
        public MSMETrainingData trainingData;
        
        [Header("BHeri Integration")]
        public BHeriMetadata bheriData;
    }
    
    [System.Serializable]
    public class CulturalElementData
    {
        public string elementName;
        public string description;
        public Sprite icon;
        public AudioClip narrationClip;
        public GameObject highlightPrefab;
        public CulturalSignificance significance;
    }
    
    [System.Serializable]
    public class MultilingualAudio
    {
        public string languageCode; // "hi", "en", "mr", etc.
        public string languageName;
        public AudioClip audioClip;
    }
    
    [System.Serializable]
    public class HistoricalPeriod
    {
        public string periodName;
        public string dateRange;
        public string description;
        public Sprite periodImage;
        public Color timelineColor;
    }
    
    [System.Serializable]
    public class MSMETrainingData
    {
        public string localGuideScript;
        public string[] keyPoints;
        public string[] culturalSensitivities;
        public string[] technicalNotes;
        public bool requiresSpecialPermissions;
    }
    
    [System.Serializable]
    public class BHeriMetadata
    {
        public string bheriID;
        public string assetRegistryURL;
        public string culturalCuratorCredits;
        public string digitalPreservationNotes;
        public bool verifiedByExperts;
    }
    
    public enum SiteType
    {
        TempleComplex,
        RockCutCaves,
        Fort,
        Palace,
        AstronomicalSite,
        ArchaeologicalRuins,
        SacredGrove,
        TribalSite
    }
    
    public enum CulturalSignificance
    {
        Religious,
        Historical,
        Architectural,
        Astronomical,
        Archaeological,
        Tribal,
        Artistic
    }
}