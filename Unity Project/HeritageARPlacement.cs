# AR Placement Controller for Heritage Sites
# Handles AR object placement and tracking for mobile devices

using UnityEngine;
using UnityEngine.XR.ARFoundation;
using UnityEngine.XR.ARSubsystems;
using System.Collections.Generic;

namespace HeritageDigitalTwins.AR
{
    /// <summary>
    /// Manages AR placement of heritage site models on detected surfaces
    /// Optimized for heritage tourism and educational experiences
    /// </summary>
    public class HeritageARPlacement : MonoBehaviour
    {
        [Header("AR Components")]
        public ARRaycastManager raycastManager;
        public ARPlaneManager planeManager;
        public ARPointCloudManager pointCloudManager;
        public ARSession arSession;
        
        [Header("Heritage Models")]
        public GameObject[] heritagePrefabs;
        public Transform placementIndicator;
        
        [Header("UI Controls")]
        public UnityEngine.UI.Button placeButton;
        public UnityEngine.UI.Button resetButton;
        public UnityEngine.UI.Dropdown modelSelector;
        public TMPro.TextMeshProUGUI instructionText;
        
        [Header("Placement Settings")]
        public LayerMask groundLayer = 1;
        public float placementHeight = 0.1f;
        public float maxPlacementDistance = 10f;
        
        // Private variables
        private List<ARRaycastHit> raycastHits = new List<ARRaycastHit>();
        private GameObject placedHeritageModel;
        private bool isPlacementModeActive = false;
        private Camera arCamera;
        private HeritageModelScaler modelScaler;
        
        private void Start()
        {
            InitializeAR();
        }
        
        private void InitializeAR()
        {
            arCamera = Camera.main;
            modelScaler = GetComponent<HeritageModelScaler>();
            
            // Setup UI
            SetupUI();
            
            // Initialize placement indicator
            if (placementIndicator != null)
                placementIndicator.gameObject.SetActive(false);
            
            // Setup dropdown with heritage models
            PopulateModelSelector();
            
            UpdateInstructionText("Point your camera at a flat surface to place heritage model");
        }
        
        private void SetupUI()
        {
            if (placeButton != null)
                placeButton.onClick.AddListener(PlaceHeritageModel);
                
            if (resetButton != null)
                resetButton.onClick.AddListener(ResetPlacement);
                
            if (modelSelector != null)
                modelSelector.onValueChanged.AddListener(OnModelSelectionChanged);
        }
        
        private void PopulateModelSelector()
        {
            if (modelSelector == null) return;
            
            modelSelector.options.Clear();
            
            foreach (GameObject prefab in heritagePrefabs)
            {
                if (prefab != null)
                {
                    modelSelector.options.Add(new TMPro.TMP_Dropdown.OptionData(prefab.name));
                }
            }
            
            modelSelector.RefreshShownValue();
        }
        
        private void Update()
        {
            UpdatePlacementIndicator();
            HandleTouchInput();
        }
        
        private void UpdatePlacementIndicator()
        {
            if (placementIndicator == null || arCamera == null) return;
            
            Vector3 screenCenter = arCamera.ScreenToWorldPoint(new Vector3(Screen.width / 2f, Screen.height / 2f, 0.3f));\n            \n            if (raycastManager.Raycast(new Vector2(Screen.width / 2f, Screen.height / 2f), raycastHits, TrackableType.PlaneWithinBounds))\n            {\n                if (raycastHits.Count > 0)\n                {\n                    ARRaycastHit hit = raycastHits[0];\n                    \n                    // Check if distance is reasonable for heritage model placement\n                    float distance = Vector3.Distance(arCamera.transform.position, hit.pose.position);\n                    \n                    if (distance <= maxPlacementDistance)\n                    {\n                        placementIndicator.position = hit.pose.position + Vector3.up * placementHeight;\n                        placementIndicator.rotation = hit.pose.rotation;\n                        placementIndicator.gameObject.SetActive(true);\n                        \n                        isPlacementModeActive = true;\n                        \n                        if (placeButton != null)\n                            placeButton.interactable = true;\n                    }\n                    else\n                    {\n                        placementIndicator.gameObject.SetActive(false);\n                        isPlacementModeActive = false;\n                    }\n                }\n            }\n            else\n            {\n                placementIndicator.gameObject.SetActive(false);\n                isPlacementModeActive = false;\n                \n                if (placeButton != null)\n                    placeButton.interactable = false;\n            }\n        }\n        \n        private void HandleTouchInput()\n        {\n            // Handle tap to place functionality\n            if (Input.touchCount > 0 && Input.GetTouch(0).phase == TouchPhase.Began)\n            {\n                if (isPlacementModeActive && placedHeritageModel == null)\n                {\n                    PlaceHeritageModel();\n                }\n            }\n        }\n        \n        public void PlaceHeritageModel()\n        {\n            if (!isPlacementModeActive || placementIndicator == null) return;\n            \n            int selectedModelIndex = modelSelector.value;\n            \n            if (selectedModelIndex >= 0 && selectedModelIndex < heritagePrefabs.Length)\n            {\n                GameObject prefab = heritagePrefabs[selectedModelIndex];\n                \n                if (prefab != null)\n                {\n                    // Remove existing model\n                    if (placedHeritageModel != null)\n                    {\n                        Destroy(placedHeritageModel);\n                    }\n                    \n                    // Instantiate new heritage model\n                    placedHeritageModel = Instantiate(prefab, placementIndicator.position, placementIndicator.rotation);\n                    \n                    // Scale model appropriately for AR viewing\n                    if (modelScaler != null)\n                    {\n                        modelScaler.ScaleForAR(placedHeritageModel);\n                    }\n                    \n                    // Add AR interaction components\n                    AddARInteractionComponents(placedHeritageModel);\n                    \n                    // Hide placement indicator\n                    placementIndicator.gameObject.SetActive(false);\n                    \n                    UpdateInstructionText($\"Heritage model placed! Tap on it to interact.\");\n                    \n                    // Enable reset button\n                    if (resetButton != null)\n                        resetButton.interactable = true;\n                }\n            }\n        }\n        \n        private void AddARInteractionComponents(GameObject model)\n        {\n            // Add collider for touch interaction\n            if (model.GetComponent<Collider>() == null)\n            {\n                BoxCollider collider = model.AddComponent<BoxCollider>();\n                // Adjust collider size based on model bounds\n                Bounds bounds = GetModelBounds(model);\n                collider.size = bounds.size;\n                collider.center = bounds.center;\n            }\n            \n            // Add heritage AR interaction component\n            HeritageARInteraction arInteraction = model.GetComponent<HeritageARInteraction>();\n            if (arInteraction == null)\n            {\n                arInteraction = model.AddComponent<HeritageARInteraction>();\n            }\n            \n            // Setup rotation and scaling gestures\n            ARGestureHandler gestureHandler = model.GetComponent<ARGestureHandler>();\n            if (gestureHandler == null)\n            {\n                gestureHandler = model.AddComponent<ARGestureHandler>();\n                gestureHandler.EnableRotation = true;\n                gestureHandler.EnableScaling = true;\n            }\n        }\n        \n        private Bounds GetModelBounds(GameObject model)\n        {\n            Bounds bounds = new Bounds(model.transform.position, Vector3.zero);\n            \n            Renderer[] renderers = model.GetComponentsInChildren<Renderer>();\n            foreach (Renderer renderer in renderers)\n            {\n                bounds.Encapsulate(renderer.bounds);\n            }\n            \n            return bounds;\n        }\n        \n        public void ResetPlacement()\n        {\n            if (placedHeritageModel != null)\n            {\n                Destroy(placedHeritageModel);\n                placedHeritageModel = null;\n            }\n            \n            isPlacementModeActive = false;\n            \n            if (resetButton != null)\n                resetButton.interactable = false;\n                \n            UpdateInstructionText(\"Point your camera at a flat surface to place heritage model\");\n        }\n        \n        private void OnModelSelectionChanged(int index)\n        {\n            if (placedHeritageModel != null)\n            {\n                // Replace current model with new selection\n                Vector3 position = placedHeritageModel.transform.position;\n                Quaternion rotation = placedHeritageModel.transform.rotation;\n                \n                Destroy(placedHeritageModel);\n                \n                if (index >= 0 && index < heritagePrefabs.Length)\n                {\n                    GameObject prefab = heritagePrefabs[index];\n                    if (prefab != null)\n                    {\n                        placedHeritageModel = Instantiate(prefab, position, rotation);\n                        \n                        if (modelScaler != null)\n                        {\n                            modelScaler.ScaleForAR(placedHeritageModel);\n                        }\n                        \n                        AddARInteractionComponents(placedHeritageModel);\n                    }\n                }\n            }\n        }\n        \n        private void UpdateInstructionText(string message)\n        {\n            if (instructionText != null)\n            {\n                instructionText.text = message;\n            }\n        }\n        \n        public void TogglePlaneDetection()\n        {\n            if (planeManager != null)\n            {\n                planeManager.enabled = !planeManager.enabled;\n                \n                // Hide/show detected planes\n                foreach (var plane in planeManager.trackables)\n                {\n                    plane.gameObject.SetActive(planeManager.enabled);\n                }\n            }\n        }\n        \n        public void TogglePointCloud()\n        {\n            if (pointCloudManager != null)\n            {\n                pointCloudManager.enabled = !pointCloudManager.enabled;\n            }\n        }\n        \n        // Heritage-specific AR quality assessment\n        public ARTrackingQuality GetTrackingQuality()\n        {\n            if (arSession != null && arSession.subsystem != null)\n            {\n                return arSession.subsystem.trackingState == TrackingState.Tracking ? \n                       ARTrackingQuality.Good : ARTrackingQuality.Poor;\n            }\n            return ARTrackingQuality.Poor;\n        }\n        \n        public void AdaptToLightingConditions()\n        {\n            // Adjust model materials based on lighting conditions\n            if (placedHeritageModel != null)\n            {\n                HeritageMaterialController materialController = placedHeritageModel.GetComponent<HeritageMaterialController>();\n                if (materialController != null)\n                {\n                    materialController.AdaptToEnvironmentalLighting();\n                }\n            }\n        }\n        \n        private void OnDisable()\n        {\n            // Cleanup when component is disabled\n            if (placedHeritageModel != null)\n            {\n                Destroy(placedHeritageModel);\n            }\n        }\n    }\n    \n    public enum ARTrackingQuality\n    {\n        Poor,\n        Limited,\n        Good,\n        Excellent\n    }\n}