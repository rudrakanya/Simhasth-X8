# Scanning Tools Configuration
# Configuration parameters for heritage site scanning tools

import json
from pathlib import Path

# Heritage site specific scanning configurations
HERITAGE_SITES = {
    "bateshwar": {
        "name": "Bateshwar Temple Complex",
        "location": {"lat": 26.0173, "lon": 77.2088},
        "site_type": "temple_complex",
        "cultural_period": "8th-9th_century",
        "scanning_priority": ["main_temples", "sculptural_details", "inscriptions"],
        "lidar_settings": {
            "resolution": "1mm",
            "range": "100m",
            "accuracy": "±2mm"
        },
        "photogrammetry_settings": {
            "overlap": 80,
            "flight_altitude": 60,
            "gsd_requirement": "2mm"
        },
        "cultural_sensitivities": [
            "Main sanctum requires special permissions",
            "Active worship areas - coordinate with priests",
            "No scanning during prayer times"
        ],
        "access_restrictions": {
            "no_fly_zones": [
                {"coordinates": [[26.0170, 77.2085], [26.0175, 77.2090]], "reason": "sanctum"}
            ],
            "time_restrictions": ["sunrise to sunset only"],
            "permission_required": ["ASI", "temple_committee"]
        }
    },
    
    "udaygiri_caves": {
        "name": "Udaygiri Caves",
        "location": {"lat": 23.5360, "lon": 77.7720},
        "site_type": "rock_cut_caves",
        "cultural_period": "gupta_period",
        "scanning_priority": ["cave_interiors", "relief_sculptures", "architectural_details"],
        "lidar_settings": {
            "resolution": "0.5mm",
            "range": "50m",
            "accuracy": "±1mm"
        },
        "photogrammetry_settings": {
            "overlap": 85,
            "flight_altitude": 30,
            "gsd_requirement": "1mm"
        },
        "cultural_sensitivities": [
            "Cave 5 (Varaha) is archaeologically significant",
            "Minimal lighting to preserve paintings",
            "Document any new discoveries immediately"
        ],
        "access_restrictions": {
            "no_fly_zones": [],
            "time_restrictions": ["daylight hours only"],
            "permission_required": ["ASI", "MP_archaeology_dept"]
        }
    },
    
    "dongla_observatory": {
        "name": "Dongla Space Observatory",
        "location": {"lat": 25.2138, "lon": 78.1828},
        "site_type": "astronomical_site",
        "cultural_period": "medieval",
        "scanning_priority": ["stone_instruments", "architectural_alignments", "inscriptions"],
        "lidar_settings": {
            "resolution": "2mm",
            "range": "200m",
            "accuracy": "±3mm"
        },
        "photogrammetry_settings": {
            "overlap": 75,
            "flight_altitude": 80,
            "gsd_requirement": "3mm"
        },
        "cultural_sensitivities": [
            "Astronomical alignments must be preserved",
            "Document seasonal shadow patterns",
            "Record celestial measurement capabilities"
        ],
        "access_restrictions": {
            "no_fly_zones": [],
            "time_restrictions": ["avoid full moon nights - active use"],
            "permission_required": ["local_administration"]
        }
    }
}

# Equipment configurations
EQUIPMENT_PROFILES = {
    "lidar_scanners": {
        "faro_focus_3d": {
            "range": "0.6-330m",
            "accuracy": "±2mm",
            "acquisition_speed": "976,000 points/sec",
            "operating_temp": "-5°C to +45°C",
            "suitable_for": ["temple_complex", "archaeological_ruins"]
        },
        "leica_rtc360": {
            "range": "0.5-130m",
            "accuracy": "±1mm",
            "acquisition_speed": "2,000,000 points/sec",
            "operating_temp": "-5°C to +45°C",
            "suitable_for": ["rock_cut_caves", "detailed_sculptures"]
        },
        "iphone_lidar": {
            "range": "0.2-5m",
            "accuracy": "±1cm",
            "acquisition_speed": "variable",
            "operating_temp": "0°C to +35°C",
            "suitable_for": ["small_artifacts", "quick_surveys"]
        }
    },
    
    "drones": {
        "dji_phantom_4_rtk": {
            "sensor": "20MP 1-inch CMOS",
            "flight_time": "30min",
            "max_altitude": "500m",
            "rtk_accuracy": "±3cm",
            "suitable_for": ["large_site_mapping", "photogrammetry"]
        },
        "dji_mavic_2_pro": {
            "sensor": "20MP Hasselblad",
            "flight_time": "31min",
            "max_altitude": "500m",
            "rtk_accuracy": "±5m (GPS only)",
            "suitable_for": ["architectural_details", "general_mapping"]
        }
    },
    
    "cameras": {
        "canon_eos_r5": {
            "sensor": "45MP Full Frame",
            "lens_compatibility": "RF mount",
            "image_stabilization": "5-axis IBIS",
            "suitable_for": ["high_resolution_details", "low_light_caves"]
        },
        "nikon_d850": {
            "sensor": "45.7MP Full Frame",
            "lens_compatibility": "F mount",
            "image_stabilization": "VR lenses",
            "suitable_for": ["precision_photogrammetry", "architectural_photography"]
        }
    }
}

# Processing pipeline configurations
PROCESSING_PIPELINES = {
    "temple_complex": {
        "lidar_processing": {
            "voxel_size": 0.01,
            "outlier_removal": {"neighbors": 20, "std_ratio": 2.0},
            "normal_estimation_radius": 0.05,
            "mesh_reconstruction": "poisson",
            "texture_resolution": "4K"
        },
        "photogrammetry_processing": {
            "feature_detection": "SIFT",
            "matching_threshold": 0.7,
            "bundle_adjustment": "global",
            "dense_reconstruction": "PMVS",
            "mesh_generation": "screened_poisson"
        }
    },
    
    "rock_cut_caves": {
        "lidar_processing": {
            "voxel_size": 0.005,
            "outlier_removal": {"neighbors": 30, "std_ratio": 1.5},
            "normal_estimation_radius": 0.03,
            "mesh_reconstruction": "ball_pivoting",
            "texture_resolution": "8K"
        },
        "photogrammetry_processing": {
            "feature_detection": "SURF",
            "matching_threshold": 0.6,
            "bundle_adjustment": "hierarchical",
            "dense_reconstruction": "OpenMVS",
            "mesh_generation": "delaunay_triangulation"
        }
    }
}

# MSME training configurations
MSME_TRAINING_MODULES = {
    "basic_scanning": {
        "duration": "2_days",
        "topics": [
            "Heritage site documentation basics",
            "LiDAR scanner operation",
            "Safety protocols",
            "Cultural sensitivity training"
        ],
        "practical_exercises": [
            "Equipment setup",
            "Basic scanning workflow",
            "Data quality assessment",
            "File organization"
        ]
    },
    
    "advanced_processing": {
        "duration": "5_days",
        "topics": [
            "Point cloud processing",
            "Photogrammetry workflows",
            "Mesh generation",
            "Texture mapping",
            "Quality control"
        ],
        "practical_exercises": [
            "Software operation (Blender, RealityCapture)",
            "Pipeline automation",
            "Problem troubleshooting",
            "Export for Unity/Unreal"
        ]
    },
    
    "cultural_curation": {
        "duration": "3_days",
        "topics": [
            "Local history and significance",
            "Storytelling for digital media",
            "Multilingual content creation",
            "Community engagement"
        ],
        "practical_exercises": [
            "Audio narration recording",
            "Cultural metadata documentation",
            "Community interview techniques",
            "Digital asset organization"
        ]
    }
}

# Quality control standards
QUALITY_STANDARDS = {
    "point_cloud_quality": {
        "minimum_point_density": 1000,  # points per square meter
        "maximum_noise_level": 0.02,    # meters
        "minimum_coverage": 0.95,       # 95% coverage required
        "maximum_holes": 0.05           # 5% missing data acceptable
    },
    
    "photogrammetry_quality": {
        "minimum_overlap": 0.6,         # 60% image overlap
        "maximum_reprojection_error": 0.5,  # pixels
        "minimum_tie_points": 1000,     # per image pair
        "gsd_accuracy": 0.002          # 2mm ground sample distance
    },
    
    "mesh_quality": {
        "maximum_triangle_size": 0.01,  # meters
        "minimum_triangle_quality": 0.3,
        "texture_resolution": 4096,     # pixels minimum
        "uv_mapping_efficiency": 0.8    # 80% texture space utilization
    }
}

# Export configurations for different platforms
EXPORT_CONFIGURATIONS = {
    "unity_3d": {
        "mesh_format": "FBX",
        "texture_format": "PNG",
        "maximum_vertices": 65000,      # Unity mesh limit
        "texture_size": [2048, 4096],
        "compression": "medium",
        "lod_levels": 3
    },
    
    "unreal_engine": {
        "mesh_format": "FBX",
        "texture_format": "TGA",
        "maximum_vertices": 100000,
        "texture_size": [4096, 8192],
        "compression": "low",
        "lod_levels": 5
    },
    
    "web_platform": {
        "mesh_format": "GLTF",
        "texture_format": "JPG",
        "maximum_vertices": 50000,
        "texture_size": [1024, 2048],
        "compression": "high",
        "lod_levels": 2
    },
    
    "bheri_platform": {
        "mesh_format": "OBJ",
        "texture_format": "PNG",
        "maximum_vertices": 200000,
        "texture_size": [4096, 8192],
        "compression": "lossless",
        "metadata_format": "JSON",
        "coordinate_system": "WGS84"
    }
}


def get_site_configuration(site_name):
    """Get configuration for specific heritage site"""
    return HERITAGE_SITES.get(site_name.lower())

def get_equipment_profile(equipment_type, model):
    """Get equipment configuration profile"""
    return EQUIPMENT_PROFILES.get(equipment_type, {}).get(model)

def get_processing_pipeline(site_type):
    """Get processing pipeline configuration for site type"""
    return PROCESSING_PIPELINES.get(site_type)

def get_export_configuration(platform):
    """Get export configuration for specific platform"""
    return EXPORT_CONFIGURATIONS.get(platform)

def save_project_config(project_name, site_name, output_path):
    """Generate and save project-specific configuration"""
    project_config = {
        "project_name": project_name,
        "site_configuration": get_site_configuration(site_name),
        "processing_pipeline": get_processing_pipeline(HERITAGE_SITES[site_name]["site_type"]),
        "quality_standards": QUALITY_STANDARDS,
        "export_configurations": EXPORT_CONFIGURATIONS,
        "training_modules": MSME_TRAINING_MODULES
    }
    
    config_path = Path(output_path) / f"{project_name}_config.json"
    with open(config_path, 'w') as f:
        json.dump(project_config, f, indent=2)
    
    return str(config_path)


if __name__ == "__main__":
    # Example: Generate configuration for Bateshwar project
    config_file = save_project_config(
        project_name="bateshwar_digital_twin",
        site_name="bateshwar",
        output_path="."
    )
    print(f"Project configuration saved to: {config_file}")
    
    # Display site information
    bateshwar_config = get_site_configuration("bateshwar")
    print(f"\nSite: {bateshwar_config['name']}")
    print(f"Type: {bateshwar_config['site_type']}")
    print(f"Cultural Sensitivities: {len(bateshwar_config['cultural_sensitivities'])} items")
    print(f"Access Restrictions: {len(bateshwar_config['access_restrictions']['permission_required'])} permissions required")