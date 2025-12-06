import configparser
from PySide6.QtWidgets import (
    QMainWindow, QWidget, QGraphicsScene, QGraphicsView, QHBoxLayout, QFrame, QVBoxLayout,
    QLabel, QPushButton, QSizePolicy, QSplitter
)
from PySide6.QtGui import QIcon
from PySide6.QtCore import Qt

from src.utils.os import resource_path
import src.utils.logger as logger

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

        central = QWidget()
        layout = QHBoxLayout()
        layout.setContentsMargins(6, 6, 6, 6)
        central.setLayout(layout)

        splitter = QSplitter()
        for i, p in enumerate([
            ToolWindow,
            CanvasWindow,
            ControllerWindow
        ]):
            splitter.addWidget(p(self))
            splitter.setStretchFactor(i, i % 2)

        layout.addWidget(splitter)
        self.setCentralWidget(central)


class ControllerWindow(QFrame):
    def __init__(self, parent: QWidget = None):
        super().__init__(parent)
        self.setFrameShape(QFrame.StyledPanel)
        self.setMinimumWidth(300)
        layout = QVBoxLayout()
        layout.setContentsMargins(6, 6, 6, 6)
        self.setLayout(layout)
        layout.addWidget(QLabel("Properties", alignment=Qt.AlignCenter))


class CanvasWindow(QGraphicsView):
    def __init__(self, parent: QWidget = None):
        super().__init__(parent)
        scene = QGraphicsScene(self)
        scene.setSceneRect(0, 0, 2000, 2000)
        self.setScene(scene)

        # Contents will go here
        scene.addRect(0, 0, 800, 600, brush=Qt.white)


class ToolWindow(QFrame):
    TOOLS = [
        {"icon": None, "title": "Select", },
        {"icon": None, "title": "Pen", },
    ]

    def __init__(self, parent: QWidget = None):
        super().__init__(parent)
        self.setFrameShape(QFrame.StyledPanel)
        self.setMinimumWidth(80)
        layout = QVBoxLayout()
        layout.setContentsMargins(4, 4, 4, 4)
        self.setLayout(layout)

        layout.addWidget(QLabel("Tools", alignment=Qt.AlignCenter))
        for tool in self.TOOLS:
            btn = QPushButton(tool['title'])
            btn.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Fixed)
            btn.clicked.connect(
                lambda checked, t=tool['title']: logger.info(f"{t} mode selected"))
            layout.addWidget(btn)
