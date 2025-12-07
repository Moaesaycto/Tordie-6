import importlib
import configparser
from PySide6.QtWidgets import (
    QMainWindow, QWidget, QHBoxLayout, QSplitter
)
from PySide6.QtGui import QIcon
from PySide6.QtCore import Qt

from src.frames.canvas import CanvasFrame
from src.frames.controller import ControllerFrame
from src.frames.tool import ToolFrame
from src.utils.os import resource_path
import src.utils.logger as logger

import src.frames.tool as tool_module
import src.frames.canvas as canvas_module
import src.frames.controller as controller_module

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

        self.central = QWidget()
        self.setCentralWidget(self.central)
        self.layout = QHBoxLayout()
        self.layout.setContentsMargins(6, 6, 6, 6)
        self.central.setLayout(self.layout)

        self.build_ui()

    def build_ui(self):
        self.splitter = QSplitter()
        for i, p in enumerate([ToolFrame, CanvasFrame, ControllerFrame]):
            self.splitter.addWidget(p(self))
            self.splitter.setStretchFactor(i, 0)
        self.layout.addWidget(self.splitter)

    def rebuild_ui(self):
        try:
            while self.layout.count():
                item = self.layout.takeAt(0)
                widget = item.widget()
                if widget:
                    widget.deleteLater()

            importlib.reload(tool_module)
            importlib.reload(canvas_module)
            importlib.reload(controller_module)

            ToolFrame = tool_module.ToolFrame
            CanvasFrame = canvas_module.CanvasFrame
            ControllerFrame = controller_module.ControllerFrame

            self.splitter = QSplitter()
            for i, p in enumerate([ToolFrame, CanvasFrame, ControllerFrame]):
                self.splitter.addWidget(p(self))
                self.splitter.setStretchFactor(i, 0)
            self.layout.addWidget(self.splitter)

            logger.info("UI reloaded successfully!")

        except Exception as e:
            logger.error(f"Failed to reload UI: {e}")
