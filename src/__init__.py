
import configparser
from PySide6.QtWidgets import QApplication
from PySide6.QtCore import QTimer
import sys

from src.utils.fonts import load_fonts
import src.utils.logger as logger
from src.utils.discord import discord_setup
from src.utils.os import resource_path
from src.windows.splash import SplashScreen
from src.windows.main import MainWindow


def main():
    app = QApplication(sys.argv)
    splash = SplashScreen()
    splash.show()

    config = configparser.ConfigParser()
    config.read(resource_path('config.ini'))

    logger.init(config.get('app', 'debug'))
    logger.loading(
        f"Initializing {config.get('app', 'name')} V{config.get('app', 'version')}...")
    if config.get('app', 'debug'):
        logger.warn("Debug mode is active")

    # Connecting discord
    discord_cleanup = None

    def setup_discord_async():
        global discord_cleanup
        discord_cleanup = discord_setup(config.getboolean('app', 'debug'))

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


    app.aboutToQuit.connect(cleanup)
    
    QTimer.singleShot(1000, lambda: (logger.info("QApplication initialized"), splash.close(), window.show()))
    sys.exit(app.exec())
    return app
