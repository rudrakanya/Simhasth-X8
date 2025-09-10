// AR Viewer for BharatVRsh Web Platform
// WebXR-based AR experience for heritage sites

class ARViewer {
    constructor() {
        this.session = null;
        this.renderer = null;
        this.scene = null;
        this.camera = null;
        this.reticle = null;
        this.heritageSites = new Map();
        this.currentSite = null;
        this.isPlacementMode = true;
        this.placedModels = [];
        this.hitTestSource = null;
        this.localSpace = null;
        
        this.init();
    }
    
    async init() {
        // Check WebXR support
        if (!('xr' in navigator)) {
            throw new Error('WebXR not supported');
        }
        
        // Initialize Three.js scene
        this.initThreeJS();
        
        // Load heritage site models
        await this.loadHeritageSiteModels();
    }
    
    initThreeJS() {
        // Scene setup
        this.scene = new THREE.Scene();
        
        // Camera setup (will be managed by WebXR)
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        
        // Renderer setup
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true, 
            alpha: true,
            preserveDrawingBuffer: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.xr.enabled = true;
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        // Lighting setup
        this.setupLighting();
        
        // Create reticle for placement
        this.createReticle();
    }
    
    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);
        
        // Directional light (sun)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 50;
        this.scene.add(directionalLight);
        
        // Environment mapping for realistic reflections
        const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
        this.scene.environment = pmremGenerator.fromScene(new THREE.RoomEnvironment(), 0.04).texture;
    }
    
    createReticle() {
        const geometry = new THREE.RingGeometry(0.15, 0.2, 32);
        const material = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.8
        });
        
        this.reticle = new THREE.Mesh(geometry, material);
        this.reticle.matrixAutoUpdate = false;
        this.reticle.visible = false;
        this.scene.add(this.reticle);
        
        // Add pulsing animation
        this.animateReticle();
    }
    
    animateReticle() {
        const animate = () => {
            if (this.reticle && this.reticle.visible) {
                const time = Date.now() * 0.005;
                const scale = 1 + Math.sin(time) * 0.1;
                this.reticle.scale.setScalar(scale);
            }
            requestAnimationFrame(animate);
        };
        animate();
    }
    
    async loadHeritageSiteModels() {
        const loader = new THREE.GLTFLoader();
        const dracoLoader = new THREE.DRACOLoader();
        dracoLoader.setDecoderPath('/libs/draco/');
        loader.setDRACOLoader(dracoLoader);
        
        // Heritage site model configurations
        const siteConfigs = [
            {
                id: 'bateshwar',
                modelUrl: '/assets/models/bateshwar_temple.glb',
                scale: 0.01,
                name: 'Bateshwar Temple Complex'
            },
            {
                id: 'udaygiri',
                modelUrl: '/assets/models/udaygiri_caves.glb',
                scale: 0.015,
                name: 'Udaygiri Caves'
            },
            {
                id: 'dongla',
                modelUrl: '/assets/models/dongla_observatory.glb',
                scale: 0.02,
                name: 'Dongla Observatory'
            }
        ];
        
        for (const config of siteConfigs) {
            try {
                const gltf = await this.loadModel(loader, config.modelUrl);
                
                // Process the model
                const model = this.processHeritageModel(gltf.scene, config);
                
                // Store the model
                this.heritageSites.set(config.id, {
                    model: model,
                    config: config,
                    gltf: gltf
                });
                
                console.log(`Loaded heritage site model: ${config.name}`);
                
            } catch (error) {
                console.error(`Failed to load model for ${config.id}:`, error);
            }
        }
    }
    
    loadModel(loader, url) {
        return new Promise((resolve, reject) => {
            loader.load(
                url,
                (gltf) => resolve(gltf),
                (progress) => {
                    console.log('Loading progress:', (progress.loaded / progress.total * 100) + '%');
                },
                (error) => reject(error)
            );
        });
    }
    
    processHeritageModel(scene, config) {
        // Clone the scene to allow multiple instances
        const model = scene.clone();
        
        // Set scale
        model.scale.setScalar(config.scale);
        
        // Enable shadows
        model.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                
                // Enhance materials for AR
                if (child.material) {
                    child.material.envMapIntensity = 0.5;
                    child.material.needsUpdate = true;
                }
            }
        });
        
        // Add invisible ground plane for shadows
        const groundGeometry = new THREE.PlaneGeometry(10, 10);
        const groundMaterial = new THREE.ShadowMaterial({ opacity: 0.3 });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        ground.visible = false; // Only shadows visible
        model.add(ground);
        
        return model;
    }
    
    async startARSession(container, siteId = 'bateshwar') {
        try {
            // Request AR session
            this.session = await navigator.xr.requestSession('immersive-ar', {
                requiredFeatures: ['local'],
                optionalFeatures: ['hit-test', 'dom-overlay', 'light-estimation'],
                domOverlay: { root: container }
            });
            
            // Set up session
            await this.setupXRSession(container);
            
            // Set current site
            this.currentSite = siteId;
            
            console.log('AR session started for site:', siteId);
            
        } catch (error) {
            console.error('Failed to start AR session:', error);
            throw error;
        }
    }
    
    async setupXRSession(container) {
        // Append renderer to container
        container.appendChild(this.renderer.domElement);
        
        // Set up XR session
        await this.renderer.xr.setSession(this.session);
        
        // Get reference space
        this.localSpace = await this.session.requestReferenceSpace('local');
        
        // Set up hit testing
        if (this.session.requestHitTestSource) {
            const viewerSpace = await this.session.requestReferenceSpace('viewer');
            this.hitTestSource = await this.session.requestHitTestSource({ space: viewerSpace });
        }
        
        // Start render loop
        this.renderer.setAnimationLoop(this.render.bind(this));
        
        // Handle session end
        this.session.addEventListener('end', () => {
            this.hitTestSource = null;
            this.session = null;
            this.renderer.setAnimationLoop(null);
            
            // Clean up
            if (container.contains(this.renderer.domElement)) {
                container.removeChild(this.renderer.domElement);
            }
            
            console.log('AR session ended');
        });
    }
    
    render(timestamp, frame) {
        if (!frame) return;
        
        // Handle hit testing for placement
        if (this.hitTestSource && this.isPlacementMode) {
            const hitTestResults = frame.getHitTestResults(this.hitTestSource);
            
            if (hitTestResults.length > 0) {
                const hit = hitTestResults[0];
                const pose = hit.getPose(this.localSpace);
                
                if (pose) {
                    this.reticle.visible = true;
                    this.reticle.matrix.fromArray(pose.transform.matrix);
                }
            } else {
                this.reticle.visible = false;
            }
        }
        
        // Update placed models animations
        this.updateModelAnimations();
        
        // Render the scene
        this.renderer.render(this.scene, this.camera);
    }
    
    updateModelAnimations() {
        // Update any running animations on placed models
        this.placedModels.forEach(placedModel => {
            if (placedModel.mixer) {
                placedModel.mixer.update(0.016); // Assuming 60fps
            }
            
            // Add subtle floating animation for ambiance
            if (placedModel.floatAnimation) {
                const time = Date.now() * 0.001;
                placedModel.model.position.y = placedModel.originalY + Math.sin(time) * 0.002;
            }
        });
    }
    
    placeHeritageModel() {
        if (!this.reticle.visible || !this.currentSite) {
            console.warn('Cannot place model: reticle not visible or no site selected');
            return false;
        }
        
        const siteData = this.heritageSites.get(this.currentSite);
        if (!siteData) {
            console.error('Heritage site data not found:', this.currentSite);
            return false;
        }
        
        // Clone the model for placement
        const model = siteData.model.clone();
        
        // Position the model at reticle location
        model.matrix.copy(this.reticle.matrix);
        model.matrix.decompose(model.position, model.quaternion, model.scale);
        
        // Add to scene
        this.scene.add(model);
        
        // Store placed model info
        const placedModel = {
            id: Date.now(),
            siteId: this.currentSite,
            model: model,
            originalY: model.position.y,
            floatAnimation: true
        };
        
        // Set up animations if available
        if (siteData.gltf.animations && siteData.gltf.animations.length > 0) {
            placedModel.mixer = new THREE.AnimationMixer(model);
            siteData.gltf.animations.forEach(clip => {
                const action = placedModel.mixer.clipAction(clip);
                action.play();
            });
        }
        
        this.placedModels.push(placedModel);
        
        // Hide reticle and exit placement mode
        this.reticle.visible = false;
        this.isPlacementMode = false;
        
        console.log('Heritage model placed:', this.currentSite);
        
        // Create information hotspots
        this.createInformationHotspots(model, this.currentSite);
        
        return true;
    }
    
    createInformationHotspots(model, siteId) {
        // Add interactive hotspots with cultural information
        const hotspotData = this.getHotspotData(siteId);
        
        hotspotData.forEach(hotspot => {
            const hotspotMesh = this.createHotspotMesh();
            hotspotMesh.position.copy(hotspot.position);
            hotspotMesh.userData = {
                type: 'hotspot',
                info: hotspot.info,
                title: hotspot.title
            };
            
            model.add(hotspotMesh);
        });
    }
    
    createHotspotMesh() {
        const geometry = new THREE.SphereGeometry(0.02, 16, 16);
        const material = new THREE.MeshBasicMaterial({
            color: 0xffd700,
            transparent: true,
            opacity: 0.8
        });
        
        const hotspot = new THREE.Mesh(geometry, material);
        
        // Add pulsing animation
        const animate = () => {
            const time = Date.now() * 0.003;
            const scale = 1 + Math.sin(time) * 0.3;
            hotspot.scale.setScalar(scale);
        };
        
        setInterval(animate, 16);
        
        return hotspot;
    }
    
    getHotspotData(siteId) {
        const hotspots = {
            bateshwar: [
                {
                    position: new THREE.Vector3(0, 0.5, 0),
                    title: 'Main Sanctum',
                    info: 'Sacred chamber housing the Shiva lingam, representing the cosmic pillar of consciousness.'
                },
                {
                    position: new THREE.Vector3(0.3, 0.2, 0.3),
                    title: 'Architectural Details',
                    info: 'Intricate Pratihara-style carvings depicting celestial beings and divine stories.'
                }
            ],
            udaygiri: [
                {
                    position: new THREE.Vector3(0, 0.3, 0),
                    title: 'Cave Entrance',
                    info: 'Gupta period rock-cut architecture showcasing ancient Indian craftsmanship.'
                }
            ],
            dongla: [
                {
                    position: new THREE.Vector3(0, 0.4, 0),
                    title: 'Astronomical Instruments',
                    info: 'Medieval instruments used for celestial observations and calendar calculations.'
                }
            ]
        };
        
        return hotspots[siteId] || [];
    }
    
    startGuidedTour(siteId) {
        const placedModel = this.placedModels.find(pm => pm.siteId === siteId);
        if (!placedModel) {
            console.warn('No placed model found for guided tour');
            return;
        }
        
        // Create tour camera path
        this.createTourCameraPath(placedModel.model);
        
        console.log('Started guided tour for:', siteId);
    }
    
    createTourCameraPath(model) {
        // Define camera positions around the model
        const positions = [
            new THREE.Vector3(1, 0.5, 1),
            new THREE.Vector3(-1, 0.5, 1),
            new THREE.Vector3(0, 1, -1),
            new THREE.Vector3(0.5, 0.3, 0.5)
        ];
        
        let currentIndex = 0;
        const duration = 3000; // 3 seconds per position
        
        const animateCamera = () => {
            if (currentIndex < positions.length) {
                const startPos = this.camera.position.clone();
                const endPos = positions[currentIndex].clone().add(model.position);
                const startTime = Date.now();
                
                const animate = () => {
                    const elapsed = Date.now() - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    
                    // Smooth interpolation
                    const eased = this.easeInOutCubic(progress);
                    this.camera.position.lerpVectors(startPos, endPos, eased);
                    this.camera.lookAt(model.position);
                    
                    if (progress < 1) {
                        requestAnimationFrame(animate);
                    } else {
                        currentIndex++;
                        setTimeout(animateCamera, 500); // Brief pause between positions
                    }
                };
                
                animate();
            }
        };
        
        animateCamera();
    }
    
    easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
    }
    
    toggleInformationOverlay() {
        // Toggle visibility of information hotspots
        this.placedModels.forEach(placedModel => {
            placedModel.model.traverse(child => {
                if (child.userData.type === 'hotspot') {
                    child.visible = !child.visible;
                }
            });
        });
    }
    
    switchHeritageSite(siteId) {
        if (this.heritageSites.has(siteId)) {
            this.currentSite = siteId;
            this.isPlacementMode = true;
            this.reticle.visible = true;
            
            console.log('Switched to heritage site:', siteId);
        } else {
            console.error('Heritage site not available:', siteId);
        }
    }
    
    removeAllModels() {
        // Remove all placed models from scene
        this.placedModels.forEach(placedModel => {
            this.scene.remove(placedModel.model);
            
            // Dispose of mixer if it exists
            if (placedModel.mixer) {
                placedModel.mixer.stopAllAction();
            }
        });
        
        this.placedModels = [];
        this.isPlacementMode = true;
        
        console.log('All heritage models removed');
    }
    
    endARSession() {
        if (this.session) {
            this.session.end();
        }
    }
    
    // Handle user interaction with hotspots
    onTouchStart(event) {
        if (!this.session || this.placedModels.length === 0) return;
        
        // Raycast to detect hotspot interactions
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        
        // Convert touch position to normalized device coordinates
        mouse.x = (event.touches[0].clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.touches[0].clientY / window.innerHeight) * 2 + 1;
        
        raycaster.setFromCamera(mouse, this.camera);
        
        // Check for intersections with hotspots
        const intersects = raycaster.intersectObjects(this.scene.children, true);
        
        for (const intersect of intersects) {
            if (intersect.object.userData.type === 'hotspot') {
                this.showHotspotInfo(intersect.object.userData);
                break;
            }
        }
    }
    
    showHotspotInfo(hotspotData) {
        // Display hotspot information in AR overlay
        console.log('Hotspot selected:', hotspotData.title);
        
        // In a real implementation, this would show AR UI overlay
        // For now, we'll use DOM overlay or console output
        const infoEvent = new CustomEvent('ar-hotspot-selected', {
            detail: hotspotData
        });
        window.dispatchEvent(infoEvent);
    }
    
    // Cleanup resources
    dispose() {
        // Dispose of Three.js resources
        this.scene.traverse(object => {
            if (object.geometry) {
                object.geometry.dispose();
            }
            
            if (object.material) {
                if (Array.isArray(object.material)) {
                    object.material.forEach(material => material.dispose());
                } else {
                    object.material.dispose();
                }
            }
        });
        
        // Dispose of renderer
        if (this.renderer) {
            this.renderer.dispose();
        }
        
        console.log('AR Viewer disposed');
    }
}

// Export for use in main application
window.ARViewer = ARViewer;