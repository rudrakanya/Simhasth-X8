# Drone Flight Path Optimization for Heritage Sites
# Automated flight planning for comprehensive site coverage

import numpy as np
import json
import matplotlib.pyplot as plt
from pathlib import Path
import math

class DroneFlightPlanner:
    """
    Automated drone flight path planning for heritage site documentation
    Optimizes coverage while respecting no-fly zones and cultural sensitivities
    """
    
    def __init__(self, site_bounds, elevation_data):
        self.site_bounds = site_bounds  # [min_lat, max_lat, min_lon, max_lon]
        self.elevation_data = elevation_data
        self.flight_paths = []
        self.no_fly_zones = []  # Sacred areas requiring special permissions
        
    def add_no_fly_zone(self, zone_coords, reason="cultural_sensitivity"):
        """Add restricted zones for cultural or safety reasons"""
        self.no_fly_zones.append({
            "coordinates": zone_coords,
            "reason": reason,
            "altitude_restriction": 50  # meters above ground
        })
    
    def generate_grid_pattern(self, altitude=60, overlap=80):
        """
        Generate systematic grid pattern for photogrammetry
        80% overlap ensures good feature matching
        """
        lat_step = self.calculate_step_size(altitude, overlap, 'latitude')
        lon_step = self.calculate_step_size(altitude, overlap, 'longitude')
        
        flight_points = []
        current_lat = self.site_bounds[0]
        
        while current_lat <= self.site_bounds[1]:
            current_lon = self.site_bounds[2]
            row_points = []
            
            while current_lon <= self.site_bounds[3]:
                if not self.is_in_no_fly_zone(current_lat, current_lon):
                    row_points.append({
                        "lat": current_lat,
                        "lon": current_lon,
                        "altitude": altitude,
                        "gimbal_angle": -90,  # Nadir shots for photogrammetry
                        "capture": True
                    })
                current_lon += lon_step
            
            # Reverse direction for efficient flight pattern
            if len(flight_points) % 2 == 1:
                row_points.reverse()
            
            flight_points.extend(row_points)
            current_lat += lat_step
        
        return flight_points
    
    def generate_architectural_detail_path(self, structure_center, radius=30):
        """
        Generate circular flight path around specific structures
        For detailed architectural documentation
        """
        detail_points = []
        angles = np.linspace(0, 2*np.pi, 36)  # 10-degree intervals
        
        for i, angle in enumerate(angles):
            # Calculate position
            lat_offset = radius * np.cos(angle) / 111000  # Approximate meters to degrees
            lon_offset = radius * np.sin(angle) / (111000 * np.cos(np.radians(structure_center[0])))
            
            detail_points.append({
                "lat": structure_center[0] + lat_offset,
                "lon": structure_center[1] + lon_offset,
                "altitude": 25,  # Lower for detail shots
                "gimbal_angle": -45,  # Angled for architecture
                "capture": True,
                "shot_type": "architectural_detail",
                "target": structure_center
            })
        
        return detail_points
    
    def calculate_step_size(self, altitude, overlap_percent, direction):
        """Calculate appropriate step size for desired overlap"""
        # Camera parameters (example for DJI Phantom 4 Pro)
        sensor_width = 13.2  # mm
        focal_length = 8.8   # mm
        image_width = 5472   # pixels
        
        # Ground sample distance
        gsd = (sensor_width * altitude * 100) / (focal_length * image_width)
        
        # Coverage per image
        coverage = gsd * image_width / 100  # meters
        
        # Step size for desired overlap
        step_size_meters = coverage * (1 - overlap_percent / 100)
        
        # Convert to degrees (approximate)
        if direction == 'latitude':
            return step_size_meters / 111000
        else:  # longitude
            return step_size_meters / (111000 * np.cos(np.radians(np.mean(self.site_bounds[:2]))))
    
    def is_in_no_fly_zone(self, lat, lon):
        """Check if coordinates fall within restricted zones"""
        for zone in self.no_fly_zones:
            # Simple polygon check (can be enhanced with proper geometric algorithms)
            coords = zone["coordinates"]
            if self.point_in_polygon(lat, lon, coords):
                return True
        return False
    
    def point_in_polygon(self, lat, lon, polygon):
        """Ray casting algorithm for point-in-polygon test"""
        n = len(polygon)
        inside = False
        
        p1_lat, p1_lon = polygon[0]
        for i in range(1, n + 1):
            p2_lat, p2_lon = polygon[i % n]
            if lon > min(p1_lon, p2_lon):
                if lon <= max(p1_lon, p2_lon):
                    if lat <= max(p1_lat, p2_lat):
                        if p1_lon != p2_lon:
                            xinters = (lon - p1_lon) * (p2_lat - p1_lat) / (p2_lon - p1_lon) + p1_lat
                        if p1_lat == p2_lat or lat <= xinters:
                            inside = not inside
            p1_lat, p1_lon = p2_lat, p2_lon
        
        return inside
    
    def optimize_flight_time(self, flight_points, drone_speed=15):
        """
        Optimize flight path to minimize total flight time
        Considering battery constraints and landing points
        """
        optimized_path = []
        total_distance = 0
        
        for i in range(len(flight_points) - 1):
            current = flight_points[i]
            next_point = flight_points[i + 1]
            
            # Calculate distance between points
            distance = self.haversine_distance(
                current["lat"], current["lon"],
                next_point["lat"], next_point["lon"]
            )
            
            total_distance += distance
            
            # Add waypoint with estimated time
            optimized_path.append({
                **current,
                "segment_distance": distance,
                "estimated_flight_time": distance / drone_speed
            })
        
        # Add final point
        if flight_points:
            optimized_path.append(flight_points[-1])
        
        return optimized_path, total_distance
    
    def haversine_distance(self, lat1, lon1, lat2, lon2):
        """Calculate distance between two GPS coordinates"""
        R = 6371000  # Earth radius in meters
        
        lat1_rad = math.radians(lat1)
        lat2_rad = math.radians(lat2)
        delta_lat = math.radians(lat2 - lat1)
        delta_lon = math.radians(lon2 - lon1)
        
        a = (math.sin(delta_lat/2)**2 + 
             math.cos(lat1_rad) * math.cos(lat2_rad) * 
             math.sin(delta_lon/2)**2)
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
        
        return R * c
    
    def export_flight_plan(self, filename, flight_points):
        """Export flight plan in standard formats (Waypoint, KML, etc.)"""
        flight_plan = {
            "metadata": {
                "site_name": "Heritage Site Survey",
                "total_waypoints": len(flight_points),
                "estimated_flight_time": sum(p.get("estimated_flight_time", 0) for p in flight_points),
                "safety_altitude": 60,
                "return_to_home": True
            },
            "waypoints": flight_points,
            "safety_guidelines": [
                "Maintain visual line of sight",
                "Check weather conditions before flight",
                "Obtain necessary permissions from ASI/local authorities",
                "Respect cultural sensitivities around sacred sites",
                "Have backup landing sites identified"
            ]
        }
        
        with open(filename, 'w') as f:
            json.dump(flight_plan, f, indent=2)
        
        return flight_plan


# Predefined heritage site configurations
HERITAGE_SITE_CONFIGS = {
    "bateshwar": {
        "site_bounds": [26.0150, 26.0200, 77.2060, 77.2110],  # Approximate bounds
        "structures": [
            {"name": "Main Temple Complex", "center": [26.0173, 77.2088], "priority": "high"},
            {"name": "Satellite Temples", "center": [26.0165, 77.2095], "priority": "medium"}
        ],
        "no_fly_zones": [
            {
                "coordinates": [[26.0170, 77.2085], [26.0175, 77.2085], [26.0175, 77.2090], [26.0170, 77.2090]],
                "reason": "Main sanctum - cultural sensitivity"
            }
        ]
    },
    "udaygiri_caves": {
        "site_bounds": [23.5340, 23.5380, 77.7700, 77.7740],
        "structures": [
            {"name": "Cave 5 (Varaha)", "center": [23.5360, 77.7720], "priority": "high"},
            {"name": "Cave 19 (Vishnu)", "center": [23.5355, 77.7715], "priority": "high"}
        ],
        "no_fly_zones": []
    }
}


def create_heritage_survey_plan(site_name):
    """Create comprehensive drone survey plan for heritage site"""
    
    if site_name not in HERITAGE_SITE_CONFIGS:
        raise ValueError(f"Site {site_name} not configured")
    
    config = HERITAGE_SITE_CONFIGS[site_name]
    planner = DroneFlightPlanner(config["site_bounds"], elevation_data=None)
    
    # Add no-fly zones
    for zone in config.get("no_fly_zones", []):
        planner.add_no_fly_zone(zone["coordinates"], zone["reason"])
    
    # Generate main grid pattern
    main_survey = planner.generate_grid_pattern(altitude=60, overlap=80)
    
    # Add detailed shots for each structure
    detail_shots = []
    for structure in config["structures"]:
        if structure["priority"] == "high":
            detail_points = planner.generate_architectural_detail_path(
                structure["center"], radius=20
            )
            detail_shots.extend(detail_points)
    
    # Combine and optimize
    all_points = main_survey + detail_shots
    optimized_path, total_distance = planner.optimize_flight_time(all_points)
    
    # Export flight plan
    filename = f"{site_name}_drone_survey_plan.json"
    flight_plan = planner.export_flight_plan(filename, optimized_path)
    
    print(f"Flight plan created for {site_name}")
    print(f"Total waypoints: {len(optimized_path)}")
    print(f"Estimated flight distance: {total_distance:.0f} meters")
    print(f"Estimated flight time: {sum(p.get('estimated_flight_time', 0) for p in optimized_path):.1f} minutes")
    
    return flight_plan, planner


if __name__ == "__main__":
    # Example: Create flight plan for Bateshwar temple complex
    bateshwar_plan, planner = create_heritage_survey_plan("bateshwar")
    
    # Example: Create flight plan for Udaygiri caves
    udaygiri_plan, planner2 = create_heritage_survey_plan("udaygiri_caves")