import numpy as np
from typing import Tuple, Optional

def compute_ndwi(
    green_band: np.ndarray,
    nir_band: np.ndarray,
    cloud_mask: Optional[np.ndarray] = None
) -> np.ndarray:
    """
    Computes McFeeters Normalized Difference Water Index (NDWI):
        NDWI = (Green - NIR) / (Green + NIR)
    Sentinel-2:
        Green = Band 3 (560 nm)
        NIR   = Band 8 (842 nm)

    Safely handles zeros and invalid pixels.
    Values range from -1.0 to +1.0.
    Surface water bodies typically exhibit positive values (> 0.0).
    """
    green = green_band.astype(np.float32)
    nir = nir_band.astype(np.float32)

    numerator = green - nir
    denominator = green + nir

    # Avoid zero division
    with np.errstate(divide='ignore', invalid='ignore'):
        ndwi = np.where(denominator != 0, numerator / denominator, -1.0)
        ndwi = np.nan_to_num(ndwi, nan=-1.0, posinf=1.0, neginf=-1.0)

    # Apply cloud mask if provided (cloudy pixels masked as -1.0)
    if cloud_mask is not None:
        ndwi = np.where(cloud_mask == 0, ndwi, -1.0)

    return ndwi

def threshold_water_mask(
    ndwi: np.ndarray,
    threshold: float = 0.0,
    min_cluster_size: int = 5
) -> np.ndarray:
    """
    Generates a binary water mask where pixels > threshold are 1 (water), else 0.
    Applies noise suppression filter to eliminate isolated single-pixel false positives.
    """
    water_mask = (ndwi > threshold).astype(np.uint8)

    # Morphological filtering using numpy rolling/slicing (3x3 structuring element)
    # Simple binary opening (erosion followed by dilation) to remove speckle noise
    padded = np.pad(water_mask, 1, mode='constant', constant_values=0)
    
    # 3x3 neighborhood sum
    neighborhood_sum = (
        padded[:-2, :-2] + padded[:-2, 1:-1] + padded[:-2, 2:] +
        padded[1:-1, :-2] + padded[1:-1, 1:-1] + padded[1:-1, 2:] +
        padded[2:, :-2] + padded[2:, 1:-1] + padded[2:, 2:]
    )
    
    # Retain water pixel only if it has at least 2 water neighbors
    filtered_mask = np.where((water_mask == 1) & (neighborhood_sum >= 3), 1, 0).astype(np.uint8)
    return filtered_mask
