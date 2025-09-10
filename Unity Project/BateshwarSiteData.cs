# Heritage Site Bateshwar Data
# ScriptableObject data configuration for Bateshwar Temple Complex

using UnityEngine;

[CreateAssetMenu(fileName = "Bateshwar_Heritage_Site", menuName = "Heritage Digital Twins/Sites/Bateshwar")]
public class BateshwarSiteData : HeritageSiteData
{
    private void OnEnable()
    {
        // Basic Site Information
        siteName = "Bateshwar Temple Complex";
        location = "Morena District, Madhya Pradesh, India";
        siteType = SiteType.TempleComplex;
        culturalPeriod = "8th-9th Century CE";
        briefDescription = "A magnificent complex of over 200 restored Hindu temples, representing one of the largest collections of ancient temples in Asia. The site showcases Pratihara architectural style with intricate carvings and diverse religious traditions.";
        
        // Geographic Data
        gpsCoordinates = new Vector2(26.0173f, 77.2088f); // Lat, Lon
        siteArea = 25f; // acres
        elevationASL = 177f; // meters above sea level
        
        // Default Camera Settings
        defaultViewPosition = new Vector3(0, 5, -15);
        defaultViewRotation = new Vector3(15, 0, 0);
        defaultFOV = 60f;
        
        // Cultural Content
        introductoryText = "Welcome to the Bateshwar Temple Complex, a breathtaking testament to India's ancient architectural mastery. This sacred site houses over 200 beautifully restored temples from the 8th-9th centuries, each telling a unique story of devotion, artistry, and cultural heritage.";
        
        historicalTexts = new string[]
        {
            "The Bateshwar temples were built during the Gurjara-Pratihara period, representing the pinnacle of early medieval Indian temple architecture.",
            "These temples demonstrate the religious pluralism of ancient India, with Shaiva, Vaishnava, and Shakta traditions coexisting harmoniously.",
            "The site was abandoned for centuries before being rediscovered and meticulously restored by the Archaeological Survey of India.",
            "Each temple follows the Panchayatana style, with a central shrine surrounded by four subsidiary shrines, reflecting ancient Hindu cosmology."
        };
        
        architecturalDescriptions = new string[]
        {
            "The main temples feature the classic Nagara style with tall curvilinear towers (shikharas) crowned by amalaka and kalasha finials.",
            "Intricate stone carvings adorn every surface, depicting scenes from Hindu mythology, celestial beings, and floral motifs.",
            "The temples are constructed using locally quarried sandstone, fitted together with remarkable precision without mortar.",
            "Sacred geometry governs the temple layouts, with proportions based on ancient Vastu Shastra principles."
        };
        
        culturalSignificanceTexts = new string[]
        {
            "Bateshwar represents the golden age of temple construction in North India, showcasing the synthesis of religious devotion and artistic excellence.",
            "The site serves as a living laboratory for understanding ancient Indian engineering, astronomy, and religious practices.",
            "Local legends speak of the temples emerging from the earth overnight, reflecting the profound spiritual significance of this sacred landscape.",
            "The complex demonstrates the economic prosperity and cultural sophistication of medieval Indian society."
        };
        
        // Interactive Elements
        interactionTypes = new InteractionType[]
        {
            InteractionType.HistoricalNarration,
            InteractionType.ArchitecturalDetails,
            InteractionType.CulturalSignificance,
            InteractionType.TimelineVisualization
        };
        
        architecturalElements = new ArchitecturalElement[]
        {
            ArchitecturalElement.Temple,
            ArchitecturalElement.Pillar,
            ArchitecturalElement.Sculpture,
            ArchitecturalElement.Inscription,
            ArchitecturalElement.Sanctum
        };
        
        // Cultural Elements Data
        culturalElements = new CulturalElementData[]
        {
            new CulturalElementData
            {
                elementName = "Bhuteśvara Temple",
                description = "The main temple dedicated to Lord Shiva, featuring exquisite Pratihara architecture",
                significance = CulturalSignificance.Religious
            },
            new CulturalElementData
            {
                elementName = "Carved Pillars",
                description = "Intricately carved sandstone pillars showcasing divine figures and mythological scenes",
                significance = CulturalSignificance.Artistic
            },
            new CulturalElementData
            {
                elementName = "Sanskrit Inscriptions",
                description = "Ancient stone inscriptions providing historical context and religious dedications",
                significance = CulturalSignificance.Historical
            },
            new CulturalElementData
            {
                elementName = "Torana Gateways",
                description = "Ornate entrance gateways marking the transition from profane to sacred space",
                significance = CulturalSignificance.Architectural
            }
        };
        
        // Timeline Data
        timeline = new HistoricalPeriod[]
        {
            new HistoricalPeriod
            {
                periodName = "Gurjara-Pratihara Era",
                dateRange = "8th-9th Century CE",
                description = "Original construction period during the height of Pratihara power. Master craftsmen created these architectural marvels as expressions of royal devotion and artistic excellence.",
                timelineColor = new Color(0.8f, 0.3f, 0.2f)
            },
            new HistoricalPeriod
            {
                periodName = "Medieval Flourishing",
                dateRange = "10th-12th Century CE",
                description = "Continued patronage and additions to the temple complex. Peak period of religious activities and pilgrimages to the sacred site.",
                timelineColor = new Color(0.9f, 0.6f, 0.1f)
            },
            new HistoricalPeriod
            {
                periodName = "Decline and Abandonment",
                dateRange = "13th-18th Century CE",
                description = "Political upheavals and changing religious patterns led to gradual abandonment. Temples fell into disrepair, gradually consumed by vegetation.",
                timelineColor = new Color(0.5f, 0.4f, 0.6f)
            },
            new HistoricalPeriod
            {
                periodName = "Colonial Documentation",
                dateRange = "19th-Early 20th Century CE",
                description = "British colonial officers and archaeologists began documenting the ruins. Early photography and surveys recorded the site's condition.",
                timelineColor = new Color(0.4f, 0.6f, 0.8f)
            },
            new HistoricalPeriod
            {
                periodName = "Archaeological Restoration",
                dateRange = "1980s-2000s CE",
                description = "Massive restoration project by ASI brought the temples back to their former glory. Scientific conservation methods preserved architectural integrity.",
                timelineColor = new Color(0.2f, 0.8f, 0.4f)
            },
            new HistoricalPeriod
            {
                periodName = "Digital Heritage Era",
                dateRange = "2020s-Present",
                description = "Digital documentation and virtual reality experiences make Bateshwar accessible to global audiences while preserving it for future generations.",
                timelineColor = new Color(0.6f, 0.2f, 0.9f)
            }
        };
        
        // MSME Training Configuration
        trainingData = new MSMETrainingData
        {
            localGuideScript = "Welcome to Bateshwar, where stone speaks of devotion spanning over a millennium. As we explore these sacred halls, remember we walk in the footsteps of ancient pilgrims, master craftsmen, and countless devotees who found divine connection in these hallowed spaces.",
            keyPoints = new string[]
            {
                "Emphasize the scale - over 200 temples in one complex",
                "Explain the three main religious traditions represented",
                "Point out the precision of stone carving without modern tools",
                "Discuss the restoration efforts and archaeological significance",
                "Respect active worship areas and photography restrictions"
            },
            culturalSensitivities = new string[]
            {
                "This is an active religious site - maintain respectful silence in sanctum areas",
                "Remove shoes before entering temple compounds",
                "Avoid pointing feet toward deities or sacred structures",
                "Some areas may restrict photography during worship times",
                "Local festivals may affect access - coordinate with temple committee"
            },
            technicalNotes = new string[]
            {
                "Best scanning light conditions: early morning or late afternoon",
                "Wind can affect drone operations - check weather conditions",
                "Stone surfaces may require different exposure settings",
                "Backup power essential for extended documentation sessions",
                "GPS coordinates: 26.0173°N, 77.2088°E"
            },
            requiresSpecialPermissions = true
        };
        
        // BHeri Integration Data
        bheriData = new BHeriMetadata
        {
            bheriID = "MP_BAT_001",
            assetRegistryURL = "https://bheri.gov.in/sites/bateshwar",
            culturalCuratorCredits = "Dr. K.K. Sharma (ASI), Local Heritage Committee, Morena District Administration",
            digitalPreservationNotes = "High-resolution LiDAR scanning completed 2024. Photogrammetry models verified for cultural accuracy. Multilingual content curated with local experts.",
            verifiedByExperts = true
        };
    }
    
    // Additional Bateshwar-specific methods
    public string[] GetTempleNames()
    {
        return new string[]
        {
            "Bhuteśvara Temple",
            "Gopteshvara Temple", 
            "Nilkantheshvara Temple",
            "Hanuman Temple",
            "Devi Temple",
            "Vishnu Temple",
            "Ganesh Temple",
            "Brahma Temple"
        };
    }
    
    public string GetArchitecturalStyle()
    {
        return "Gurjara-Pratihara Nagara Style with Panchayatana layout";
    }
    
    public string[] GetConservationChallenges()
    {
        return new string[]
        {
            "Sandstone weathering due to monsoon exposure",
            "Tourist pressure on restored structures", 
            "Vegetation growth in stone joints",
            "Air pollution effects on carved surfaces",
            "Balancing conservation with active worship"
        };
    }
    
    public float GetRestorationCompletionPercentage()
    {
        return 85.7f; // Approximate restoration completion
    }
}