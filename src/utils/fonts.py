import os
from PySide6.QtGui import QFontDatabase, QFont

from src.utils.os import resource_path
import src.utils.logger as logger

def load_fonts(fonts: list[str]) -> None:
    for f in fonts:
        path = resource_path(f"src/assets/fonts/{f}")
        if os.path.exists(path):
            font_id = QFontDatabase.addApplicationFont("src/assets/fonts/Bahnschrift.ttf")
            if font_id == -1:
                logger.error(f"Failed to load font: {f}")
            else:
                font_family = QFontDatabase.applicationFontFamilies(font_id)[0]
                logger.success(f"Successfully registered font {f} as {font_family}")
        else:
            logger.error(f"Cannot find font {f} in {path}")