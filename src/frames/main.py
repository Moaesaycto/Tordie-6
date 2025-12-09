import configparser
from PySide6.QtWidgets import (
    QMainWindow, QWidget, QVBoxLayout, QSplitter, QToolBar, QMenuBar, QLabel, QStatusBar
)
from PySide6.QtGui import QIcon, QAction
from PySide6.QtCore import QSize, Qt

from src.frames.canvas import CanvasFrame
from src.frames.controller import ControllerFrame
from src.frames.footer import Footer
from src.frames.tool import ToolFrame
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

        # Menu Bar
        menubar = self.menuBar()
        self._build_menus(menubar)

        ribbon = QToolBar("Ribbon")
        ribbon.setIconSize(QSize(20, 20))
        ribbon.setToolButtonStyle(Qt.ToolButtonTextBesideIcon)
        self.addToolBar(Qt.TopToolBarArea, ribbon)

        new_act = QAction(QIcon.fromTheme("document-new"), "New", self)
        open_act = QAction(QIcon.fromTheme("document-open"), "Open", self)
        save_act = QAction(QIcon.fromTheme("document-save"), "Save", self)
        ribbon.addAction(new_act)
        ribbon.addAction(open_act)
        ribbon.addAction(save_act)
        ribbon.addSeparator()
        ribbon.addWidget(QLabel("Mode:"))
        ribbon.addAction(QAction("Select", self))
        ribbon.addAction(QAction("Draw", self))

        # Central area with canvas, controller and sidebar
        self.central = QWidget()
        self.setCentralWidget(self.central)
        self.layout = QVBoxLayout()
        self.layout.setContentsMargins(6, 6, 6, 6)
        self.central.setLayout(self.layout)

        self.splitter = QSplitter()
        for i, p in enumerate([ToolFrame, CanvasFrame, ControllerFrame]):
            self.splitter.addWidget(p(self))
            self.splitter.setStretchFactor(i, 0)
        self.layout.addWidget(self.splitter)

        footer = Footer()
        self.layout.addWidget(footer)
    
    def _build_menus(self, menubar: QMenuBar):
        # File menu
        file_menu = menubar.addMenu("&File")
        file_menu.addAction(QAction("New", self))
        file_menu.addAction(QAction("Open...", self))
        file_menu.addAction(QAction("Save", self))
        file_menu.addSeparator()
        file_menu.addAction(QAction("Exit", self, triggered=self.close))

        # Edit menu
        edit_menu = menubar.addMenu("&Edit")
        edit_menu.addAction(QAction("Undo", self))
        edit_menu.addAction(QAction("Redo", self))
        edit_menu.addSeparator()
        edit_menu.addAction(QAction("Cut", self))
        edit_menu.addAction(QAction("Copy", self))
        edit_menu.addAction(QAction("Paste", self))

        # View menu
        view_menu = menubar.addMenu("&View")
        view_menu.addAction(QAction("Zoom In", self))
        view_menu.addAction(QAction("Zoom Out", self))
        view_menu.addAction(QAction("Reset View", self))

        # Help
        help_menu = menubar.addMenu("&Help")
        help_menu.addAction(QAction("About", self))

