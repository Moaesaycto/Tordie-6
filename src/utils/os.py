import sys
import os
import ctypes
import src.utils.logger as logger


def resource_path(relative_path: str) -> str:
    """Get absolute path to resource for dev and build"""
    try:
        base_path = sys._MEIPASS
    except:
        base_path = os.path.abspath(".")

    return os.path.join(base_path, relative_path)


def register_app() -> None:
    """Register the application with the operating system"""
    if sys.platform == 'win32':
        try:
            ctypes.windll.shell32.SetCurrentProcessExplicitlyAppUserModelID(
                'tordie.tordie6.application.1')
        except Exception as e:
            logger.warn(f"Failed to set up Windows App User Model ID: {e}")
