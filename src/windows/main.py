import configparser
from PySide6.QtWidgets import (
    QMainWindow, QWidget
)
from PySide6.QtGui import QIcon

from src.utils.os import resource_path

config = configparser.ConfigParser()
config.read(resource_path('config.ini'))


class MainWindow(QMainWindow):
    def __init__(self, parent: QWidget = None):
        super().__init__(parent)
        self.setWindowTitle(
            f"{config.get('app', 'name')} V.{config.get('app', 'version')}")
        self.resize(1200, 800)
        icon = QIcon(resource_path("icon.ico"))
        self.setWindowIcon(icon)
