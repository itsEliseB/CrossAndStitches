"""
Image Processing Utilities
Handles image upload, pixelation, and color quantization for cross-stitch patterns
"""

from PIL import Image
import numpy as np
from typing import List, Tuple
import io


def hex_to_rgb(hex_color: str) -> Tuple[int, int, int]:
    """Convert hex color to RGB tuple"""
    hex_color = hex_color.lstrip('#')
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))


def rgb_to_hex(rgb: Tuple[int, int, int]) -> str:
    """Convert RGB tuple to hex color"""
    return '#{:02x}{:02x}{:02x}'.format(int(rgb[0]), int(rgb[1]), int(rgb[2]))


def process_image_for_crossstitch(
    image_bytes: bytes,
    target_width: int,
    target_height: int,
    num_colors: int = 16
) -> Tuple[List[List[str]], List[str]]:
    """
    Process an uploaded image into a cross-stitch pattern

    This function:
    1. Opens the image
    2. Resizes to target dimensions (pixelates)
    3. Reduces colors to specified palette size
    4. Returns grid of colors and the color palette

    Args:
        image_bytes: Raw image file bytes
        target_width: Desired pattern width (in stitches)
        target_height: Desired pattern height (in stitches)
        num_colors: Number of colors to reduce to (2-64)

    Returns:
        Tuple of (grid_data, palette)
        - grid_data: 2D list of hex colors [[#RRGGBB, ...], ...]
        - palette: List of unique hex colors used

    Example:
        grid, palette = process_image_for_crossstitch(
            image_bytes=file_content,
            target_width=50,
            target_height=50,
            num_colors=16
        )
        # grid = [["#FF0000", "#00FF00", ...], [...], ...]
        # palette = ["#FF0000", "#00FF00", "#0000FF", ...]
    """

    # Open image from bytes
    image = Image.open(io.BytesIO(image_bytes))

    # Convert to RGB (remove alpha channel if present)
    if image.mode in ('RGBA', 'LA', 'P'):
        # Create white background
        background = Image.new('RGB', image.size, (255, 255, 255))
        if image.mode == 'P':
            image = image.convert('RGBA')
        background.paste(image, mask=image.split()[-1] if image.mode in ('RGBA', 'LA') else None)
        image = background
    else:
        image = image.convert('RGB')

    # Resize to target dimensions (this pixelates the image)
    # NEAREST = no smoothing, gives blocky pixel effect
    image = image.resize((target_width, target_height), Image.Resampling.NEAREST)

    # Reduce colors using quantization
    # This groups similar colors together
    # Method 1: Using PIL's quantize (adaptive palette)
    quantized = image.quantize(colors=num_colors, method=2)  # method=2 is median cut
    quantized = quantized.convert('RGB')

    # Convert image to numpy array for easier manipulation
    img_array = np.array(quantized)

    # Build grid data (2D array of hex colors)
    grid_data = []
    for row in img_array:
        grid_row = []
        for pixel in row:
            hex_color = rgb_to_hex(tuple(pixel))
            grid_row.append(hex_color)
        grid_data.append(grid_row)

    # Extract unique colors to create palette
    pixels = img_array.reshape(-1, 3)  # Flatten to list of RGB values
    unique_colors = np.unique(pixels, axis=0)
    palette = [rgb_to_hex(tuple(color)) for color in unique_colors]

    return grid_data, palette


def create_preview_image(grid_data: List[List[str]], cell_size: int = 10) -> bytes:
    """
    Create a preview image from grid data

    Args:
        grid_data: 2D list of hex colors
        cell_size: Size of each cell in pixels (default: 10x10)

    Returns:
        PNG image bytes
    """
    height = len(grid_data)
    width = len(grid_data[0]) if height > 0 else 0

    # Create image
    img_width = width * cell_size
    img_height = height * cell_size
    image = Image.new('RGB', (img_width, img_height), 'white')

    # Draw each cell
    pixels = image.load()
    for y, row in enumerate(grid_data):
        for x, hex_color in enumerate(row):
            rgb = hex_to_rgb(hex_color)
            # Fill cell_size x cell_size block
            for dy in range(cell_size):
                for dx in range(cell_size):
                    px = x * cell_size + dx
                    py = y * cell_size + dy
                    if px < img_width and py < img_height:
                        pixels[px, py] = rgb

    # Save to bytes
    img_byte_arr = io.BytesIO()
    image.save(img_byte_arr, format='PNG')
    img_byte_arr.seek(0)
    return img_byte_arr.getvalue()


# Example DMC thread color palette (subset)
# DMC is a popular cross-stitch thread brand
DMC_COLORS = {
    "310": "#000000",  # Black
    "B5200": "#FFFFFF",  # White
    "321": "#C1272D",  # Red
    "798": "#2B4C8F",  # Blue
    "907": "#AFCD3A",  # Green
    "741": "#FF8C00",  # Orange
    "208": "#912F80",  # Purple
    "3853": "#F27B3A",  # Orange
    "3812": "#00A390",  # Teal
    "725": "#FFC700",  # Yellow
    # Add more as needed
}


def map_to_thread_colors(palette: List[str], thread_palette: dict = DMC_COLORS) -> dict:
    """
    Map color palette to actual thread colors (like DMC)

    Args:
        palette: List of hex colors from design
        thread_palette: Dictionary of thread code -> hex color

    Returns:
        Dictionary mapping design color -> thread info
        Example: {"#FF0000": {"code": "321", "hex": "#C1272D", "name": "Red"}}
    """
    mapping = {}

    for color in palette:
        rgb = hex_to_rgb(color)

        # Find closest thread color
        min_distance = float('inf')
        closest_thread = None

        for thread_code, thread_hex in thread_palette.items():
            thread_rgb = hex_to_rgb(thread_hex)

            # Calculate color distance (Euclidean in RGB space)
            distance = sum((a - b) ** 2 for a, b in zip(rgb, thread_rgb)) ** 0.5

            if distance < min_distance:
                min_distance = distance
                closest_thread = (thread_code, thread_hex)

        if closest_thread:
            mapping[color] = {
                "code": closest_thread[0],
                "hex": closest_thread[1],
                "original": color
            }

    return mapping
