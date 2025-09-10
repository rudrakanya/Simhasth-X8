# Camera Calibration and Image Processing for Heritage Sites
# Tools for processing DSLR and drone imagery for photogrammetry

import cv2
import numpy as np
import json
import os
from pathlib import Path
import logging
from PIL import Image, ExifTags
from datetime import datetime

logger = logging.getLogger(__name__)

class HeritageImageProcessor:
    """
    Specialized image processing for heritage site documentation
    Handles DSLR, drone imagery, and photogrammetry preprocessing
    """
    
    def __init__(self, project_name):
        self.project_name = project_name
        self.camera_calibrations = {}
        self.processed_images = []
        
    def load_camera_calibration(self, calibration_file):
        """Load camera calibration parameters"""
        try:
            with open(calibration_file, 'r') as f:
                calibration_data = json.load(f)
            
            self.camera_calibrations[calibration_data['camera_model']] = calibration_data
            logger.info(f"Loaded calibration for {calibration_data['camera_model']}")
            return True
        except Exception as e:
            logger.error(f"Failed to load calibration: {e}")
            return False
    
    def calibrate_camera_from_images(self, calibration_images_path, board_size=(9,6)):
        """
        Perform camera calibration using checkerboard pattern images
        Standard procedure for photogrammetry accuracy
        """
        # Prepare object points
        objp = np.zeros((board_size[0] * board_size[1], 3), np.float32)
        objp[:,:2] = np.mgrid[0:board_size[0], 0:board_size[1]].T.reshape(-1,2)
        
        # Arrays to store object points and image points
        objpoints = []  # 3d points in real world space
        imgpoints = []  # 2d points in image plane
        
        images = list(Path(calibration_images_path).glob('*.jpg'))
        
        for img_path in images:
            img = cv2.imread(str(img_path))
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            
            # Find chessboard corners
            ret, corners = cv2.findChessboardCorners(gray, board_size, None)
            
            if ret:
                objpoints.append(objp)
                
                # Refine corner positions
                corners2 = cv2.cornerSubPix(gray, corners, (11,11), (-1,-1), 
                                          criteria=(cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 30, 0.001))
                imgpoints.append(corners2)
        
        if len(objpoints) > 0:
            # Calibrate camera
            ret, mtx, dist, rvecs, tvecs = cv2.calibrateCamera(
                objpoints, imgpoints, gray.shape[::-1], None, None
            )
            
            # Calculate reprojection error
            mean_error = 0
            for i in range(len(objpoints)):
                imgpoints2, _ = cv2.projectPoints(objpoints[i], rvecs[i], tvecs[i], mtx, dist)
                error = cv2.norm(imgpoints[i], imgpoints2, cv2.NORM_L2)/len(imgpoints2)
                mean_error += error
            
            mean_error /= len(objpoints)
            
            calibration_result = {
                "camera_matrix": mtx.tolist(),
                "distortion_coefficients": dist.tolist(),
                "reprojection_error": mean_error,
                "calibration_date": datetime.now().isoformat(),
                "images_used": len(objpoints)
            }
            
            logger.info(f"Camera calibration complete. Reprojection error: {mean_error:.3f}")
            return calibration_result
        
        else:
            logger.error("No valid calibration images found")
            return None
    
    def extract_image_metadata(self, image_path):
        """Extract comprehensive metadata from heritage site images"""
        metadata = {
            "file_path": str(image_path),
            "file_size": os.path.getsize(image_path),
            "processing_timestamp": datetime.now().isoformat()
        }
        
        try:
            # Open with PIL for EXIF data
            with Image.open(image_path) as img:
                metadata.update({
                    "image_size": img.size,
                    "format": img.format,
                    "mode": img.mode
                })
                
                # Extract EXIF data
                exif_dict = {}
                if hasattr(img, '_getexif'):
                    exif = img._getexif()
                    if exif:
                        for tag_id, value in exif.items():
                            tag = ExifTags.TAGS.get(tag_id, tag_id)
                            exif_dict[tag] = value
                
                # Extract key photogrammetry-relevant data
                metadata.update({
                    "camera_make": exif_dict.get("Make", "Unknown"),
                    "camera_model": exif_dict.get("Model", "Unknown"),
                    "focal_length": exif_dict.get("FocalLength", None),
                    "aperture": exif_dict.get("FNumber", None),
                    "iso": exif_dict.get("ISOSpeedRatings", None),
                    "shutter_speed": exif_dict.get("ExposureTime", None),
                    "gps_info": self.extract_gps_data(exif_dict),
                    "datetime_original": exif_dict.get("DateTimeOriginal", None)
                })
        
        except Exception as e:
            logger.warning(f"Could not extract metadata from {image_path}: {e}")
        
        return metadata
    
    def extract_gps_data(self, exif_dict):
        """Extract GPS coordinates from EXIF data"""
        gps_info = exif_dict.get("GPSInfo", {})
        if not gps_info:
            return None
        
        try:
            # Extract latitude
            lat_ref = gps_info.get(1)  # N or S
            lat_data = gps_info.get(2)  # Degrees, minutes, seconds
            
            # Extract longitude
            lon_ref = gps_info.get(3)  # E or W
            lon_data = gps_info.get(4)  # Degrees, minutes, seconds
            
            if lat_data and lon_data:
                # Convert to decimal degrees
                latitude = self.dms_to_decimal(lat_data, lat_ref)
                longitude = self.dms_to_decimal(lon_data, lon_ref)
                
                return {
                    "latitude": latitude,
                    "longitude": longitude,
                    "altitude": gps_info.get(6, None)
                }
        except Exception as e:
            logger.warning(f"Could not parse GPS data: {e}")
        
        return None
    
    def dms_to_decimal(self, dms, ref):
        """Convert degrees, minutes, seconds to decimal degrees"""
        degrees, minutes, seconds = dms
        decimal = degrees + minutes/60 + seconds/3600
        
        if ref in ['S', 'W']:
            decimal = -decimal
        
        return decimal
    
    def assess_image_quality_for_photogrammetry(self, image_path):
        """Comprehensive image quality assessment for heritage photogrammetry"""
        img = cv2.imread(str(image_path))
        if img is None:
            return None
        
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # Sharpness assessment using Laplacian variance
        laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
        sharpness_score = min(laplacian_var / 1000.0, 1.0)
        
        # Brightness assessment
        brightness = np.mean(gray)
        brightness_score = 1.0 - abs(brightness - 127) / 127  # Optimal around middle gray
        
        # Contrast assessment
        contrast = gray.std()
        contrast_score = min(contrast / 64.0, 1.0)  # Normalize to 0-1
        
        # Feature detection for photogrammetry suitability
        sift = cv2.SIFT_create()
        keypoints = sift.detect(gray, None)
        feature_density = len(keypoints) / (img.shape[0] * img.shape[1])
        feature_score = min(feature_density * 100000, 1.0)  # Normalize feature density
        
        # Overall quality score
        quality_metrics = {
            "sharpness": sharpness_score,
            "brightness": brightness_score,
            "contrast": contrast_score,
            "feature_density": feature_score,
            "keypoint_count": len(keypoints)
        }
        
        # Weighted overall score
        weights = {"sharpness": 0.4, "brightness": 0.2, "contrast": 0.2, "feature_density": 0.2}
        overall_score = sum(quality_metrics[metric] * weights[metric] for metric in weights)
        
        quality_metrics["overall_score"] = overall_score
        quality_metrics["photogrammetry_suitable"] = overall_score > 0.6
        
        return quality_metrics
    
    def undistort_image(self, image_path, camera_model=None):
        """Remove lens distortion from image using camera calibration"""
        if not camera_model or camera_model not in self.camera_calibrations:
            logger.warning(f"No calibration data for camera model: {camera_model}")
            return None
        
        calibration = self.camera_calibrations[camera_model]
        camera_matrix = np.array(calibration["camera_matrix"])
        dist_coeffs = np.array(calibration["distortion_coefficients"])
        
        img = cv2.imread(str(image_path))
        if img is None:
            return None
        
        # Undistort image
        undistorted = cv2.undistort(img, camera_matrix, dist_coeffs)
        
        return undistorted
    
    def enhance_heritage_image(self, image_path, enhancement_type="architectural"):
        """Apply heritage-specific image enhancements"""
        img = cv2.imread(str(image_path))
        if img is None:
            return None
        
        if enhancement_type == "architectural":
            # Enhance structural details
            enhanced = self.enhance_architectural_details(img)
        elif enhancement_type == "sculptural":
            # Enhance sculptural and artistic details
            enhanced = self.enhance_sculptural_details(img)
        elif enhancement_type == "inscription":
            # Enhance text and inscription visibility
            enhanced = self.enhance_inscriptions(img)
        else:
            enhanced = img
        
        return enhanced
    
    def enhance_architectural_details(self, img):
        """Enhance architectural features and structural details"""
        # Convert to LAB color space for better enhancement
        lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
        l, a, b = cv2.split(lab)
        
        # Apply CLAHE (Contrast Limited Adaptive Histogram Equalization) to L channel
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
        l = clahe.apply(l)
        
        # Merge channels and convert back to BGR
        enhanced_lab = cv2.merge([l, a, b])
        enhanced = cv2.cvtColor(enhanced_lab, cv2.COLOR_LAB2BGR)
        
        # Apply unsharp masking for edge enhancement
        gaussian = cv2.GaussianBlur(enhanced, (0, 0), 2.0)
        unsharp_mask = cv2.addWeighted(enhanced, 1.5, gaussian, -0.5, 0)
        
        return unsharp_mask
    
    def enhance_sculptural_details(self, img):
        """Enhance sculptural and artistic details"""
        # Use bilateral filter to preserve edges while smoothing
        bilateral = cv2.bilateralFilter(img, 15, 80, 80)
        
        # Enhance details using high-pass filtering
        gaussian_3 = cv2.GaussianBlur(bilateral, (0, 0), 3.0)
        unsharp_mask = cv2.addWeighted(bilateral, 2.0, gaussian_3, -1.0, 0)
        
        return unsharp_mask
    
    def enhance_inscriptions(self, img):
        """Enhance visibility of inscriptions and text"""
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # Apply morphological operations to enhance text
        kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3))
        enhanced_gray = cv2.morphologyEx(gray, cv2.MORPH_CLOSE, kernel)
        
        # Apply adaptive thresholding for better text visibility
        adaptive_thresh = cv2.adaptiveThreshold(
            enhanced_gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2
        )
        
        # Convert back to color
        enhanced = cv2.cvtColor(adaptive_thresh, cv2.COLOR_GRAY2BGR)
        
        return enhanced
    
    def process_image_batch(self, input_folder, output_folder, processing_options=None):
        """Process a batch of heritage images"""
        if processing_options is None:
            processing_options = {
                "extract_metadata": True,
                "assess_quality": True,
                "enhance_images": False,
                "undistort": False
            }
        
        input_path = Path(input_folder)
        output_path = Path(output_folder)
        output_path.mkdir(parents=True, exist_ok=True)
        
        image_formats = ['.jpg', '.jpeg', '.png', '.tiff', '.tif']
        processed_count = 0
        
        batch_results = {
            "processed_images": [],
            "processing_summary": {},
            "quality_statistics": {}
        }
        
        for img_file in input_path.iterdir():
            if img_file.suffix.lower() in image_formats:
                try:
                    result = {"filename": img_file.name}
                    
                    # Extract metadata
                    if processing_options["extract_metadata"]:
                        metadata = self.extract_image_metadata(img_file)
                        result["metadata"] = metadata
                    
                    # Assess quality
                    if processing_options["assess_quality"]:
                        quality = self.assess_image_quality_for_photogrammetry(img_file)
                        result["quality"] = quality
                    
                    # Process image
                    if processing_options["enhance_images"] or processing_options["undistort"]:
                        img = cv2.imread(str(img_file))
                        
                        if processing_options["undistort"] and "metadata" in result:
                            camera_model = result["metadata"].get("camera_model")
                            img = self.undistort_image(img_file, camera_model) or img
                        
                        if processing_options["enhance_images"]:
                            img = self.enhance_heritage_image(img_file, "architectural")
                        
                        # Save processed image
                        output_file = output_path / f"processed_{img_file.name}"
                        cv2.imwrite(str(output_file), img)
                        result["processed_image"] = str(output_file)
                    
                    batch_results["processed_images"].append(result)
                    processed_count += 1
                    
                except Exception as e:
                    logger.error(f"Failed to process {img_file.name}: {e}")
        
        # Generate batch statistics
        if processed_count > 0:
            quality_scores = [img["quality"]["overall_score"] for img in batch_results["processed_images"] if "quality" in img]
            batch_results["processing_summary"] = {
                "total_processed": processed_count,
                "average_quality": np.mean(quality_scores) if quality_scores else 0,
                "suitable_for_photogrammetry": sum(1 for score in quality_scores if score > 0.6)
            }
        
        # Save batch results
        results_file = output_path / f"{self.project_name}_batch_results.json"
        with open(results_file, 'w') as f:
            json.dump(batch_results, f, indent=2, default=str)
        
        logger.info(f"Batch processing complete: {processed_count} images processed")
        return batch_results


def process_heritage_images(input_folder, output_folder, project_name="heritage_site"):
    """Main function to process heritage site images"""
    
    processor = HeritageImageProcessor(project_name)
    
    processing_options = {
        "extract_metadata": True,
        "assess_quality": True,
        "enhance_images": True,
        "undistort": False  # Set to True if calibration data available
    }
    
    results = processor.process_image_batch(input_folder, output_folder, processing_options)
    
    print(f"Processing complete for {project_name}")
    print(f"Images processed: {results['processing_summary']['total_processed']}")
    print(f"Average quality score: {results['processing_summary']['average_quality']:.2f}")
    print(f"Suitable for photogrammetry: {results['processing_summary']['suitable_for_photogrammetry']}")
    
    return results


if __name__ == "__main__":
    # Example usage
    input_directory = "raw_data/dslr_captures/"
    output_directory = "processed_data/enhanced_images/"
    
    results = process_heritage_images(
        input_folder=input_directory,
        output_folder=output_directory,
        project_name="bateshwar_temple_complex"
    )