import configparser
from PySide6.QtWidgets import QApplication, QWidget
from PySide6.QtCore import QTimer
from PySide6.QtGui import QKeySequence, QShortcut
import sys

from src.utils.fonts import load_fonts
import src.utils.logger as logger
from src.utils.discord import discord_setup
from src.utils.os import resource_path
from src.frames.splash import SplashScreen
from src.frames.main import MainWindow


def _debug_setup(window: QWidget):
    pass


def main():
    config = configparser.ConfigParser()
    config.read(resource_path('config.ini'))
    DEBUG = config.getboolean('app', 'debug')

    logger.init(DEBUG)
    logger.loading(
        f"Initializing {config.get('app', 'name')} V{config.get('app', 'version')}...")
    if DEBUG:
        logger.warn("Debug mode is active")

    app = QApplication(sys.argv)
    splash = SplashScreen()
    splash.show()

    # Connecting discord
    discord_cleanup = None

    def setup_discord_async():
        global discord_cleanup
        discord_cleanup = discord_setup(DEBUG)

    QTimer.singleShot(500, setup_discord_async)

    # Setting up custom fonts
    load_fonts(["Bahnschrift.ttf"])

    def cleanup():
        logger.info("Attempting cleanup")
        if discord_cleanup:
            discord_cleanup()
        logger.info("Clean up finished")

    # Setting up main window
    window = MainWindow()

    if DEBUG:
        _debug_setup(window)

    app.aboutToQuit.connect(cleanup)

    QTimer.singleShot(1000, lambda: (logger.info(
        "QApplication initialized"), splash.close(), window.show()))
    sys.exit(app.exec())
    return app
