# Heritage Digital Twins - Unity MR Experience
# Unity project scripts for immersive heritage site experiences

using UnityEngine;
using UnityEngine.XR.ARFoundation;
using UnityEngine.XR.ARCore;
using UnityEngine.UI;
using TMPro;
using System.Collections;
using System.Collections.Generic;

namespace HeritageDigitalTwins
{
    /// <summary>
    /// Main controller for heritage site MR experiences
    /// Handles AR/VR mode switching, site loading, and user interactions
    /// </summary>
    public class HeritageSiteManager : MonoBehaviour
    {
        [Header("Heritage Site Configuration")]
        public HeritageSiteData currentSite;
        public Transform userTransform;
        public Camera mainCamera;
        
        [Header("AR Components")]
        public ARSessionOrigin arSessionOrigin;
        public ARPlaneManager planeManager;
        public ARPointCloudManager pointCloudManager;
        
        [Header("VR Components")]
        public GameObject vrRig;
        public Transform vrCamera;
        
        [Header("UI Elements")]
        public Canvas mainUI;
        public TextMeshProUGUI siteTitle;
        public TextMeshProUGUI culturalNarrative;
        public Button[] interactionButtons;
        public GameObject loadingPanel;
        
        [Header("Audio")]
        public AudioSource backgroundAudio;
        public AudioSource narrationAudio;
        public AudioClip[] culturalNarrations;
        
        // Private variables
        private ExperienceMode currentMode = ExperienceMode.AR;
        private bool isInitialized = false;
        private HeritageAudioManager audioManager;
        private CulturalContentManager contentManager;
        
        public enum ExperienceMode
        {
            AR,
            VR,
            Desktop
        }
        
        private void Start()
        {
            InitializeHeritageSite();
        }
        
        private void InitializeHeritageSite()
        {
            if (currentSite == null)
            {
                Debug.LogError("No heritage site data assigned!");
                return;
            }
            
            // Initialize managers
            audioManager = GetComponent<HeritageAudioManager>();
            contentManager = GetComponent<CulturalContentManager>();
            
            // Set up UI
            siteTitle.text = currentSite.siteName;
            
            // Determine experience mode based on platform
            DetermineExperienceMode();
            
            // Load site content
            StartCoroutine(LoadHeritageSiteContent());
        }
        
        private void DetermineExperienceMode()
        {
            #if UNITY_IOS || UNITY_ANDROID
                currentMode = ExperienceMode.AR;
                SetupARMode();
            #elif UNITY_STANDALONE_WIN || UNITY_STANDALONE_OSX
                currentMode = ExperienceMode.VR;
                SetupVRMode();
            #else
                currentMode = ExperienceMode.Desktop;
                SetupDesktopMode();
            #endif
        }
        
        private void SetupARMode()
        {
            // Enable AR components
            arSessionOrigin.gameObject.SetActive(true);
            vrRig.SetActive(false);
            
            // Configure AR settings for heritage sites
            planeManager.requestedDetectionMode = PlaneDetectionMode.Horizontal;
            
            Debug.Log("Heritage AR Mode Initialized");
        }
        
        private void SetupVRMode()
        {
            // Enable VR components
            vrRig.SetActive(true);
            arSessionOrigin.gameObject.SetActive(false);
            
            // Configure VR settings for immersive heritage experience
            vrCamera.position = currentSite.defaultViewPosition;
            vrCamera.rotation = Quaternion.Euler(currentSite.defaultViewRotation);
            
            Debug.Log("Heritage VR Mode Initialized");
        }
        
        private void SetupDesktopMode()
        {
            // Setup for desktop/dome projection
            arSessionOrigin.gameObject.SetActive(false);
            vrRig.SetActive(false);
            
            mainCamera.transform.position = currentSite.defaultViewPosition;
            mainCamera.transform.rotation = Quaternion.Euler(currentSite.defaultViewRotation);
            
            Debug.Log("Heritage Desktop Mode Initialized");
        }
        
        private IEnumerator LoadHeritageSiteContent()
        {
            loadingPanel.SetActive(true);
            
            // Load 3D models
            yield return StartCoroutine(LoadSiteModels());
            
            // Load cultural content
            yield return StartCoroutine(contentManager.LoadCulturalContent(currentSite));
            
            // Initialize audio
            audioManager.InitializeAudioForSite(currentSite);
            
            // Setup interactive elements
            SetupInteractiveElements();
            
            loadingPanel.SetActive(false);
            isInitialized = true;
            
            // Start ambient experience
            BeginHeritageExperience();
        }
        
        private IEnumerator LoadSiteModels()
        {
            for (int i = 0; i < currentSite.modelPrefabs.Length; i++)
            {
                if (currentSite.modelPrefabs[i] != null)
                {
                    GameObject model = Instantiate(currentSite.modelPrefabs[i]);
                    model.transform.position = currentSite.modelPositions[i];
                    model.transform.rotation = Quaternion.Euler(currentSite.modelRotations[i]);
                    
                    // Add heritage-specific components
                    AddHeritageComponents(model, i);
                }
                yield return null;
            }
        }
        
        private void AddHeritageComponents(GameObject model, int index)
        {
            // Add cultural interaction component
            CulturalInteraction interaction = model.AddComponent<CulturalInteraction>();
            interaction.culturalData = currentSite.culturalElements[index];
            
            // Add audio zones for spatial storytelling
            HeritageAudioZone audioZone = model.AddComponent<HeritageAudioZone>();
            audioZone.SetAudioClip(currentSite.spatialAudio[index]);
            
            // Add highlight system
            HeritageHighlight highlight = model.AddComponent<HeritageHighlight>();
            highlight.InitializeHighlight();
        }
        
        private void SetupInteractiveElements()
        {
            // Setup UI buttons for heritage interactions
            for (int i = 0; i < interactionButtons.Length && i < currentSite.interactionTypes.Length; i++)
            {
                int index = i; // Capture for closure
                interactionButtons[i].onClick.AddListener(() => TriggerHeritageInteraction(index));
                
                // Set button text based on interaction type
                TextMeshProUGUI buttonText = interactionButtons[i].GetComponentInChildren<TextMeshProUGUI>();
                buttonText.text = GetInteractionButtonText(currentSite.interactionTypes[i]);
            }
        }
        
        private string GetInteractionButtonText(InteractionType type)
        {
            switch (type)
            {
                case InteractionType.HistoricalNarration:
                    return "Listen to History";
                case InteractionType.ArchitecturalDetails:
                    return "Explore Architecture";
                case InteractionType.CulturalSignificance:
                    return "Cultural Story";
                case InteractionType.TimelineVisualization:
                    return "Timeline";
                default:
                    return "Interact";
            }
        }
        
        private void BeginHeritageExperience()
        {
            // Start with welcome narration
            audioManager.PlayWelcomeNarration(currentSite.welcomeAudio);
            
            // Begin ambient audio
            if (currentSite.ambientAudio != null)
            {
                backgroundAudio.clip = currentSite.ambientAudio;
                backgroundAudio.Play();
            }
            
            // Show initial cultural context
            StartCoroutine(ShowCulturalIntroduction());
        }
        
        private IEnumerator ShowCulturalIntroduction()
        {
            yield return new WaitForSeconds(2f);
            
            culturalNarrative.text = currentSite.introductoryText;
            
            // Animate text appearance
            culturalNarrative.alpha = 0f;
            float timer = 0f;
            while (timer < 1f)
            {
                culturalNarrative.alpha = Mathf.Lerp(0f, 1f, timer);
                timer += Time.deltaTime;
                yield return null;
            }
            
            yield return new WaitForSeconds(5f);
            
            // Fade out introduction
            timer = 0f;
            while (timer < 1f)
            {
                culturalNarrative.alpha = Mathf.Lerp(1f, 0f, timer);
                timer += Time.deltaTime;
                yield return null;
            }
        }
        
        public void TriggerHeritageInteraction(int interactionIndex)
        {
            if (!isInitialized || interactionIndex >= currentSite.interactionTypes.Length)
                return;
            
            InteractionType type = currentSite.interactionTypes[interactionIndex];
            
            switch (type)
            {
                case InteractionType.HistoricalNarration:
                    PlayHistoricalNarration(interactionIndex);
                    break;
                case InteractionType.ArchitecturalDetails:
                    ShowArchitecturalDetails(interactionIndex);
                    break;
                case InteractionType.CulturalSignificance:
                    DisplayCulturalSignificance(interactionIndex);
                    break;
                case InteractionType.TimelineVisualization:
                    ShowTimeline(interactionIndex);
                    break;
            }
        }
        
        private void PlayHistoricalNarration(int index)
        {
            if (index < culturalNarrations.Length && culturalNarrations[index] != null)
            {
                narrationAudio.clip = culturalNarrations[index];
                narrationAudio.Play();
                
                // Display accompanying text
                culturalNarrative.text = currentSite.historicalTexts[index];
            }
        }
        
        private void ShowArchitecturalDetails(int index)
        {
            // Trigger architectural highlight system
            HeritageHighlight[] highlights = FindObjectsOfType<HeritageHighlight>();
            foreach (var highlight in highlights)
            {
                if (highlight.architecturalElement == currentSite.architecturalElements[index])
                {
                    highlight.ActivateHighlight();
                }
            }
            
            // Show architectural information
            culturalNarrative.text = currentSite.architecturalDescriptions[index];
        }
        
        private void DisplayCulturalSignificance(int index)
        {
            // Show cultural significance with visual effects
            culturalNarrative.text = currentSite.culturalSignificanceTexts[index];
            
            // Trigger special visual effects for cultural elements
            StartCoroutine(AnimateCulturalElements());
        }
        
        private IEnumerator AnimateCulturalElements()
        {
            // Add subtle animations to highlight cultural significance
            CulturalInteraction[] interactions = FindObjectsOfType<CulturalInteraction>();
            
            foreach (var interaction in interactions)
            {
                interaction.AnimateCulturalSignificance();
                yield return new WaitForSeconds(0.5f);
            }
        }
        
        private void ShowTimeline(int index)
        {
            // Activate timeline visualization
            TimelineVisualization timeline = FindObjectOfType<TimelineVisualization>();
            if (timeline != null)
            {
                timeline.ShowTimelineForSite(currentSite);
            }
        }
        
        public void SwitchExperienceMode(ExperienceMode newMode)
        {
            if (newMode == currentMode) return;
            
            currentMode = newMode;
            
            switch (newMode)
            {
                case ExperienceMode.AR:
                    SetupARMode();
                    break;
                case ExperienceMode.VR:
                    SetupVRMode();
                    break;
                case ExperienceMode.Desktop:
                    SetupDesktopMode();
                    break;
            }
        }
        
        public void LoadNewSite(HeritageSiteData newSiteData)
        {
            // Clean up current site
            CleanupCurrentSite();
            
            // Load new site
            currentSite = newSiteData;
            StartCoroutine(LoadHeritageSiteContent());
        }
        
        private void CleanupCurrentSite()
        {
            // Stop audio
            backgroundAudio.Stop();
            narrationAudio.Stop();
            
            // Clear existing models
            HeritageModelLoader[] loaders = FindObjectsOfType<HeritageModelLoader>();
            foreach (var loader in loaders)
            {
                loader.UnloadModel();
            }
            
            // Reset UI
            culturalNarrative.text = "";
        }
        
        private void OnDestroy()
        {
            CleanupCurrentSite();
        }
    }
    
    // Enumerations for heritage system
    public enum InteractionType
    {
        HistoricalNarration,
        ArchitecturalDetails,
        CulturalSignificance,
        TimelineVisualization,
        VirtualGuide,
        PhotoMode
    }
    
    public enum ArchitecturalElement
    {
        Temple,
        Pillar,
        Sculpture,
        Inscription,
        Doorway,
        Sanctum,
        Courtyard
    }
}