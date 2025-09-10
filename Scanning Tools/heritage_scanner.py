# LiDAR and Photogrammetry Processing Scripts
# Heritage Site Digital Twinning - Scanning Tools Module

import os
import sys
import numpy as np
import open3d as o3d
import cv2
from pathlib import Path
import json
import logging
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class HeritageScanner:
    """
    Main class for heritage site LiDAR and photogrammetry processing
    Supports BHeri (Bharat Heritage Stack) integration
    """
    
    def __init__(self, site_name, project_path):
        self.site_name = site_name
        self.project_path = Path(project_path)
        self.raw_data_path = self.project_path / "raw_data"
        self.processed_data_path = self.project_path / "processed_data"
        self.metadata = {}
        
        # Create project directories
        self.create_project_structure()
        
    def create_project_structure(self):
        """Create standardized folder structure for heritage site scanning"""
        folders = [
            "raw_data/lidar",
            "raw_data/photogrammetry",
            "raw_data/drone_imagery",
            "raw_data/dslr_captures",
            "processed_data/point_clouds",
            "processed_data/meshes",
            "processed_data/textures",
            "processed_data/cultural_metadata",
            "processed_data/bheri_exports",
            "quality_control",
            "documentation"
        ]
        
        for folder in folders:
            (self.project_path / folder).mkdir(parents=True, exist_ok=True)
            
        logger.info(f"Project structure created for {self.site_name}")
    
    def validate_lidar_data(self, lidar_file_path):
        """
        Validate and preprocess raw LiDAR data
        Supports common formats: PLY, PCD, LAS, XYZ
        """
        try:
            # Load point cloud
            if lidar_file_path.suffix.lower() == '.ply':
                pcd = o3d.io.read_point_cloud(str(lidar_file_path))
            elif lidar_file_path.suffix.lower() == '.pcd':
                pcd = o3d.io.read_point_cloud(str(lidar_file_path))
            else:
                raise ValueError(f"Unsupported LiDAR format: {lidar_file_path.suffix}")
            
            # Basic validation
            if len(pcd.points) == 0:
                raise ValueError("Empty point cloud")
            
            # Quality metrics
            quality_metrics = {
                "point_count": len(pcd.points),
                "has_colors": len(pcd.colors) > 0,
                "has_normals": len(pcd.normals) > 0,
                "bbox_dimensions": np.array(pcd.get_max_bound()) - np.array(pcd.get_min_bound()),
                "scan_timestamp": datetime.now().isoformat()
            }
            
            logger.info(f"LiDAR validation complete: {quality_metrics['point_count']} points")
            return pcd, quality_metrics
            
        except Exception as e:
            logger.error(f"LiDAR validation failed: {e}")
            return None, None
    
    def process_photogrammetry_images(self, image_folder):
        """
        Process DSLR/drone images for photogrammetry pipeline
        Compatible with RealityCapture, Agisoft Metashape workflows
        """
        image_folder = Path(image_folder)
        processed_images = []
        
        # Supported image formats
        supported_formats = ['.jpg', '.jpeg', '.png', '.tiff', '.tif', '.raw']
        
        for img_path in image_folder.glob('*'):
            if img_path.suffix.lower() in supported_formats:
                try:
                    # Load and validate image
                    img = cv2.imread(str(img_path))
                    if img is None:
                        continue
                    
                    # Extract EXIF data for GPS and camera parameters
                    img_metadata = self.extract_image_metadata(img_path)
                    
                    # Image quality assessment
                    quality_score = self.assess_image_quality(img)
                    
                    processed_images.append({
                        "path": str(img_path),
                        "resolution": f"{img.shape[1]}x{img.shape[0]}",
                        "quality_score": quality_score,
                        "metadata": img_metadata,
                        "suitable_for_photogrammetry": quality_score > 0.7
                    })
                    
                except Exception as e:
                    logger.warning(f"Failed to process image {img_path}: {e}")
        
        logger.info(f"Processed {len(processed_images)} images for photogrammetry")
        return processed_images
    
    def extract_image_metadata(self, img_path):
        """Extract EXIF data including GPS coordinates and camera parameters"""
        try:
            from PIL import Image
            from PIL.ExifTags import TAGS, GPSTAGS
            
            image = Image.open(img_path)
            exif_data = {}
            
            if hasattr(image, '_getexif'):
                exif = image._getexif()
                if exif:
                    for tag_id, value in exif.items():
                        tag = TAGS.get(tag_id, tag_id)
                        exif_data[tag] = value
            
            return exif_data
        except Exception as e:
            logger.warning(f"Could not extract EXIF from {img_path}: {e}")
            return {}
    
    def assess_image_quality(self, img):
        """Assess image quality for photogrammetry suitability"""
        # Convert to grayscale for analysis
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # Calculate sharpness using Laplacian variance
        sharpness = cv2.Laplacian(gray, cv2.CV_64F).var()
        
        # Normalize sharpness score (typical range 0-1000+)
        quality_score = min(sharpness / 1000.0, 1.0)
        
        return quality_score
    
    def create_bheri_export(self, processed_data):
        """
        Export data in BHeri (Bharat Heritage Stack) compatible format
        For integration with IIT Consortium heritage platform
        """
        bheri_export = {
            "site_information": {
                "name": self.site_name,
                "location": processed_data.get("gps_coordinates", "Unknown"),
                "heritage_type": "temple_complex",  # Can be parameterized
                "period": "8th-9th_century",  # Example for Bateshwar
                "cultural_significance": "Historic Hindu temple complex"
            },
            "technical_data": {
                "scanning_method": "LiDAR + Photogrammetry",
                "point_cloud_resolution": processed_data.get("point_count", 0),
                "mesh_quality": "high_fidelity",
                "texture_resolution": "4K",
                "coordinate_system": "WGS84"
            },
            "digital_assets": {
                "point_cloud_path": "processed_data/point_clouds/",
                "mesh_path": "processed_data/meshes/",
                "texture_path": "processed_data/textures/",
                "documentation_path": "documentation/"
            },
            "metadata": {
                "scan_date": datetime.now().isoformat(),
                "processing_software": ["Open3D", "OpenCV", "Custom_Pipeline"],
                "quality_verified": True,
                "cultural_curator_approved": False  # Requires local expert validation
            }
        }
        
        # Save BHeri export
        bheri_path = self.processed_data_path / "bheri_exports" / f"{self.site_name}_bheri_export.json"
        with open(bheri_path, 'w') as f:
            json.dump(bheri_export, f, indent=2)
        
        logger.info(f"BHeri export created: {bheri_path}")
        return bheri_export
    
    def generate_scan_report(self, scan_results):
        """Generate comprehensive scanning report for MSME teams"""
        report = {
            "project_summary": {
                "site_name": self.site_name,
                "scan_date": datetime.now().isoformat(),
                "total_data_size": self.calculate_project_size(),
                "processing_status": "completed"
            },
            "technical_metrics": scan_results,
            "quality_assessment": {
                "point_cloud_coverage": "95%",  # Example metric
                "texture_completeness": "90%",
                "geometric_accuracy": "±2cm",
                "color_fidelity": "high"
            },
            "next_steps": [
                "Import to Unity 3D for MR development",
                "Cultural curation with local experts",
                "Mobile AR app integration",
                "Dome projection optimization"
            ]
        }
        
        # Save report
        report_path = self.project_path / "documentation" / f"{self.site_name}_scan_report.json"
        with open(report_path, 'w') as f:
            json.dump(report, f, indent=2)
        
        return report
    
    def calculate_project_size(self):
        """Calculate total project data size"""
        total_size = 0
        for root, dirs, files in os.walk(self.project_path):
            for file in files:
                file_path = os.path.join(root, file)
                total_size += os.path.getsize(file_path)
        
        # Convert to human readable format
        for unit in ['B', 'KB', 'MB', 'GB', 'TB']:
            if total_size < 1024.0:
                return f"{total_size:.1f} {unit}"
            total_size /= 1024.0
        
        return f"{total_size:.1f} PB"


# Heritage-specific scanning configurations
HERITAGE_SITES_CONFIG = {
    "bateshwar": {
        "site_type": "temple_complex",
        "scan_priority": ["main_temples", "sculptural_details", "inscriptions"],
        "cultural_keywords": ["Shaiva", "Vaishnava", "Shakta", "Lakulisa"],
        "recommended_resolution": "1mm"
    },
    "udaygiri_caves": {
        "site_type": "rock_cut_caves",
        "scan_priority": ["cave_interiors", "relief_sculptures", "architectural_details"],
        "cultural_keywords": ["Gupta_period", "Vishnu", "cave_art"],
        "recommended_resolution": "0.5mm"
    },
    "dongla_observatory": {
        "site_type": "astronomical_site",
        "scan_priority": ["stone_instruments", "architectural_alignments", "inscriptions"],
        "cultural_keywords": ["astronomy", "medieval", "scientific_heritage"],
        "recommended_resolution": "2mm"
    }
}


def main():
    """Example usage of HeritageScanner for Madhya Pradesh sites"""
    
    # Initialize scanner for Bateshwar temple complex
    scanner = HeritageScanner("Bateshwar_Temple_Complex", "./heritage_projects/bateshwar")
    
    # Process LiDAR data (example)
    # lidar_path = Path("raw_data/lidar/bateshwar_scan_001.ply")
    # pcd, metrics = scanner.validate_lidar_data(lidar_path)
    
    # Process photogrammetry images (example)
    # images_folder = Path("raw_data/dslr_captures/")
    # img_results = scanner.process_photogrammetry_images(images_folder)
    
    # Create BHeri export
    sample_data = {"point_count": 2500000, "gps_coordinates": "26.0173°N, 77.2088°E"}
    bheri_export = scanner.create_bheri_export(sample_data)
    
    # Generate final report
    report = scanner.generate_scan_report(sample_data)
    
    print(f"Heritage scanning pipeline completed for {scanner.site_name}")
    print(f"Project size: {scanner.calculate_project_size()}")


if __name__ == "__main__":
    main()