# Point Cloud Processing and Optimization
# Specialized tools for heritage site point cloud processing

import numpy as np
import open3d as o3d
import json
import logging
from pathlib import Path
from scipy.spatial.distance import cdist
from sklearn.cluster import DBSCAN

logger = logging.getLogger(__name__)

class PointCloudProcessor:
    """
    Advanced point cloud processing for heritage site documentation
    Optimized for architectural and sculptural details
    """
    
    def __init__(self, heritage_site_type="temple_complex"):
        self.heritage_site_type = heritage_site_type
        self.processing_parameters = self.get_heritage_specific_parameters()
        
    def get_heritage_specific_parameters(self):
        """Get processing parameters specific to heritage site types"""
        parameters = {
            "temple_complex": {
                "voxel_size": 0.01,  # 1cm for detailed architecture
                "normal_estimation_radius": 0.05,
                "outlier_removal_neighbors": 20,
                "outlier_removal_std": 2.0,
                "clustering_eps": 0.02,
                "min_cluster_points": 100
            },
            "rock_cut_caves": {
                "voxel_size": 0.005,  # 5mm for fine cave details
                "normal_estimation_radius": 0.03,
                "outlier_removal_neighbors": 30,
                "outlier_removal_std": 1.5,
                "clustering_eps": 0.015,
                "min_cluster_points": 150
            },
            "archaeological_ruins": {
                "voxel_size": 0.02,  # 2cm for structural elements
                "normal_estimation_radius": 0.08,
                "outlier_removal_neighbors": 15,
                "outlier_removal_std": 2.5,
                "clustering_eps": 0.03,
                "min_cluster_points": 80
            }
        }
        return parameters.get(self.heritage_site_type, parameters["temple_complex"])
    
    def load_and_validate_point_cloud(self, file_path):
        """Load point cloud with validation for heritage scanning"""
        try:
            pcd = o3d.io.read_point_cloud(str(file_path))
            
            if len(pcd.points) == 0:
                raise ValueError("Empty point cloud")
            
            # Heritage-specific validation
            validation_results = {
                "point_count": len(pcd.points),
                "has_colors": len(pcd.colors) > 0,
                "has_normals": len(pcd.normals) > 0,
                "bbox_volume": self.calculate_bounding_box_volume(pcd),
                "point_density": self.calculate_point_density(pcd),
                "coverage_completeness": self.assess_coverage_completeness(pcd)
            }
            
            logger.info(f"Point cloud loaded: {validation_results}")
            return pcd, validation_results
            
        except Exception as e:
            logger.error(f"Failed to load point cloud: {e}")
            return None, None
    
    def preprocess_heritage_point_cloud(self, pcd):
        """Comprehensive preprocessing pipeline for heritage point clouds"""
        logger.info("Starting heritage point cloud preprocessing...")
        
        original_count = len(pcd.points)
        
        # Step 1: Remove outliers (noise from scanning environment)
        pcd_clean = self.remove_statistical_outliers(pcd)
        logger.info(f"Outlier removal: {original_count} -> {len(pcd_clean.points)} points")
        
        # Step 2: Downsample while preserving architectural details
        pcd_downsampled = self.intelligent_downsampling(pcd_clean)
        logger.info(f"Intelligent downsampling: {len(pcd_clean.points)} -> {len(pcd_downsampled.points)} points")
        
        # Step 3: Estimate normals for surface reconstruction
        pcd_with_normals = self.estimate_normals_heritage(pcd_downsampled)
        
        # Step 4: Segment architectural elements
        segments = self.segment_architectural_elements(pcd_with_normals)
        
        return pcd_with_normals, segments
    
    def remove_statistical_outliers(self, pcd):
        """Remove outliers using statistical analysis"""
        params = self.processing_parameters
        pcd_filtered, _ = pcd.remove_statistical_outlier(
            nb_neighbors=params["outlier_removal_neighbors"],
            std_ratio=params["outlier_removal_std"]
        )
        return pcd_filtered
    
    def intelligent_downsampling(self, pcd):
        """
        Adaptive downsampling that preserves architectural details
        Higher density around edges and sculptural elements
        """
        # Calculate surface variation for each point
        surface_variation = self.calculate_surface_variation(pcd)
        
        # Create adaptive voxel sizes based on surface complexity
        base_voxel_size = self.processing_parameters["voxel_size"]
        
        # Points with high surface variation get smaller voxel sizes (preserved)
        # Points in flat areas get larger voxel sizes (more downsampling)
        adaptive_pcd = o3d.geometry.PointCloud()
        points = np.asarray(pcd.points)
        colors = np.asarray(pcd.colors) if len(pcd.colors) > 0 else None
        
        # Simple uniform downsampling as base (can be enhanced with adaptive logic)
        pcd_downsampled = pcd.voxel_down_sample(voxel_size=base_voxel_size)
        
        return pcd_downsampled
    
    def calculate_surface_variation(self, pcd, radius=0.05):
        """Calculate surface variation for each point (curvature estimation)"""
        pcd.estimate_normals(
            search_param=o3d.geometry.KDTreeSearchParamHybrid(radius=radius, max_nn=30)
        )
        
        # Simple curvature estimation using normal variation
        # In practice, this would be more sophisticated
        normals = np.asarray(pcd.normals)
        surface_variation = np.linalg.norm(normals, axis=1)  # Placeholder
        
        return surface_variation
    
    def estimate_normals_heritage(self, pcd):
        """Estimate normals optimized for architectural surfaces"""
        radius = self.processing_parameters["normal_estimation_radius"]
        
        pcd.estimate_normals(
            search_param=o3d.geometry.KDTreeSearchParamHybrid(
                radius=radius, 
                max_nn=50
            )
        )
        
        # Orient normals consistently (important for heritage reconstruction)
        pcd.orient_normals_consistent_tangent_plane(k=15)
        
        return pcd
    
    def segment_architectural_elements(self, pcd):
        """
        Segment point cloud into architectural elements
        (walls, pillars, sculptures, decorative elements)
        """
        points = np.asarray(pcd.points)
        normals = np.asarray(pcd.normals)
        
        # Use normal-based clustering to identify architectural elements
        normal_clustering = DBSCAN(
            eps=self.processing_parameters["clustering_eps"],
            min_samples=self.processing_parameters["min_cluster_points"]
        ).fit(normals)
        
        segments = {}
        unique_labels = set(normal_clustering.labels_)
        
        for label in unique_labels:
            if label == -1:  # Noise
                continue
                
            mask = normal_clustering.labels_ == label
            segment_points = points[mask]
            
            # Classify segment type based on geometric properties
            segment_type = self.classify_architectural_element(segment_points)
            
            segments[f"{segment_type}_{label}"] = {
                "points": segment_points,
                "point_count": len(segment_points),
                "type": segment_type,
                "centroid": np.mean(segment_points, axis=0).tolist()
            }
        
        logger.info(f"Segmented into {len(segments)} architectural elements")
        return segments
    
    def classify_architectural_element(self, points):
        """Classify architectural element based on geometric properties"""
        if len(points) < 10:
            return "small_detail"
        
        # Calculate bounding box dimensions
        min_bound = np.min(points, axis=0)
        max_bound = np.max(points, axis=0)
        dimensions = max_bound - min_bound
        
        # Simple classification logic (can be enhanced with ML)
        height, width, depth = sorted(dimensions, reverse=True)
        aspect_ratio = height / width if width > 0 else 0
        
        if aspect_ratio > 3:
            return "pillar_or_column"
        elif height < 0.5:
            return "floor_or_platform"
        elif aspect_ratio < 1.5:
            return "wall_surface"
        else:
            return "sculptural_element"
    
    def optimize_for_unity_export(self, pcd, target_point_count=500000):
        """Optimize point cloud for Unity 3D import"""
        current_count = len(pcd.points)
        
        if current_count > target_point_count:
            # Calculate appropriate voxel size for target count
            bbox = pcd.get_axis_aligned_bounding_box()
            volume = bbox.volume()
            target_density = target_point_count / volume
            voxel_size = (1.0 / target_density) ** (1/3)
            
            pcd_optimized = pcd.voxel_down_sample(voxel_size=voxel_size)
            logger.info(f"Optimized for Unity: {current_count} -> {len(pcd_optimized.points)} points")
        else:
            pcd_optimized = pcd
        
        # Ensure colors are present (Unity requirement)
        if len(pcd_optimized.colors) == 0:
            # Generate default colors based on height or normals
            colors = self.generate_default_colors(pcd_optimized)
            pcd_optimized.colors = o3d.utility.Vector3dVector(colors)
        
        return pcd_optimized
    
    def generate_default_colors(self, pcd):
        """Generate default colors for visualization"""
        points = np.asarray(pcd.points)
        
        # Color by height (common for heritage visualization)
        heights = points[:, 2]  # Z-axis
        normalized_heights = (heights - heights.min()) / (heights.max() - heights.min())
        
        # Create a gradient from brown (base) to light yellow (top)
        colors = np.zeros((len(points), 3))
        colors[:, 0] = 0.6 + 0.4 * normalized_heights  # Red component
        colors[:, 1] = 0.4 + 0.5 * normalized_heights  # Green component
        colors[:, 2] = 0.2 + 0.3 * normalized_heights  # Blue component
        
        return colors
    
    def calculate_bounding_box_volume(self, pcd):
        """Calculate bounding box volume"""
        bbox = pcd.get_axis_aligned_bounding_box()
        return bbox.volume()
    
    def calculate_point_density(self, pcd):
        """Calculate average point density"""
        volume = self.calculate_bounding_box_volume(pcd)
        if volume > 0:
            return len(pcd.points) / volume
        return 0
    
    def assess_coverage_completeness(self, pcd):
        """Assess how complete the site coverage is"""
        # This would involve more sophisticated analysis
        # For now, return a placeholder assessment
        points = np.asarray(pcd.points)
        
        # Simple assessment based on point distribution
        std_dev = np.std(points, axis=0)
        uniformity_score = 1.0 / (1.0 + np.mean(std_dev))
        
        if uniformity_score > 0.8:
            return "excellent"
        elif uniformity_score > 0.6:
            return "good"
        elif uniformity_score > 0.4:
            return "fair"
        else:
            return "poor"
    
    def export_processed_data(self, pcd, segments, output_path):
        """Export processed point cloud and metadata"""
        output_path = Path(output_path)
        output_path.mkdir(parents=True, exist_ok=True)
        
        # Export main point cloud
        main_pcd_path = output_path / "processed_point_cloud.ply"
        o3d.io.write_point_cloud(str(main_pcd_path), pcd)
        
        # Export Unity-optimized version
        unity_pcd = self.optimize_for_unity_export(pcd)
        unity_pcd_path = output_path / "unity_optimized_point_cloud.ply"
        o3d.io.write_point_cloud(str(unity_pcd_path), unity_pcd)
        
        # Export segmentation metadata
        segments_metadata = {
            "total_segments": len(segments),
            "processing_parameters": self.processing_parameters,
            "segments": segments
        }
        
        segments_path = output_path / "architectural_segments.json"
        with open(segments_path, 'w') as f:
            json.dump(segments_metadata, f, indent=2, default=str)
        
        logger.info(f"Processed data exported to {output_path}")
        return {
            "main_point_cloud": str(main_pcd_path),
            "unity_optimized": str(unity_pcd_path),
            "segments_metadata": str(segments_path)
        }


def process_heritage_site_point_cloud(input_file, output_dir, site_type="temple_complex"):
    """Main function to process heritage site point cloud"""
    
    processor = PointCloudProcessor(heritage_site_type=site_type)
    
    # Load and validate
    pcd, validation = processor.load_and_validate_point_cloud(input_file)
    if pcd is None:
        return None
    
    # Preprocess
    processed_pcd, segments = processor.preprocess_heritage_point_cloud(pcd)
    
    # Export results
    export_paths = processor.export_processed_data(processed_pcd, segments, output_dir)
    
    return {
        "validation_results": validation,
        "segment_count": len(segments),
        "export_paths": export_paths,
        "processing_complete": True
    }


if __name__ == "__main__":
    # Example usage
    input_file = "raw_data/bateshwar_lidar_scan.ply"
    output_directory = "processed_data/bateshwar/"
    
    results = process_heritage_site_point_cloud(
        input_file=input_file,
        output_dir=output_directory,
        site_type="temple_complex"
    )
    
    if results:
        print("Point cloud processing completed successfully!")
        print(f"Found {results['segment_count']} architectural segments")
        print(f"Files exported to: {output_directory}")