from PySide6.QtWidgets import (
    QWidget, QFrame, QVBoxLayout, QLabel, QHBoxLayout, QTabWidget, QWidget, QLabel
)
from PySide6.QtGui import QIcon, QPixmap, QTransform
from PySide6.QtCore import QSize
from src.utils.os import resource_path


from src.frames.controller.modifiers import ModifierControllerFrame
from src.frames.controller.document import DocumentControllerFrame
from src.frames.controller.geometry import GeometryControllerFrame
from src.frames.controller.scripts import ScriptsControllerFrame
from src.frames.controller.settings import SettingsControllerFrame


class TabFrame(QFrame):
    def __init__(self, parent: QWidget = None, title: str = ""):
        super().__init__(parent)
        self.layout = QVBoxLayout(self)
        self.layout.setContentsMargins(0, 0, 0, 0)
        self.layout.setSpacing(0)

        label = QLabel(title)
        label.setStyleSheet("padding: 2px 2px 2px 2px;")
        self.layout.addWidget(label)

        line = QFrame()
        line.setFrameShape(QFrame.Shape.HLine)
        line.setFrameShadow(QFrame.Shadow.Plain)
        line.setMaximumHeight(1)
        self.layout.addWidget(line)

        self.layout.addStretch()


class ControllerFrame(QFrame):
    def __init__(self, parent: QWidget = None):
        super().__init__(parent)
        self.layout = QVBoxLayout(self)
        self.layout.setContentsMargins(0, 0, 0, 0)

        self.layout.addWidget(QLabel("Hello"))
        self.layout.addWidget(PropertiesFrame())


class PropertiesFrame(QFrame):
    def __init__(self, parent: QWidget = None):
        super().__init__(parent)
        CONTROLLER_TABS = [
            {
                "title": "Scripts",
                "icon": "src/assets/icons/scripts_tab.svg",
                "frame": ScriptsControllerFrame,
                "color": "#A9575F"
            },
            {
                "title": "Modifiers",
                "icon": "src/assets/icons/modifiers_tab.svg",
                "frame": ModifierControllerFrame,
                "color": "#6387D2",
            },
            {
                "title": "Geometry",
                "icon": "src/assets/icons/geometry_tab.svg",
                "frame": GeometryControllerFrame,
                "color": "#099A78"
            },
            {
                "title": "Document",
                "icon": "src/assets/icons/document_tab.svg",
                "frame": DocumentControllerFrame,
                "color": "#099A78"
            },
            {
                "title": "Settings",
                "icon": "src/assets/icons/settings_tab.svg",
                "frame": SettingsControllerFrame,
                "color": "#099A78"
            },
        ]

        layout = QHBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)
        self.setMinimumWidth(300)

        self.tab_widget = QTabWidget()
        self.tab_widget.setTabPosition(QTabWidget.West)

        palette = self.palette()
        style = f"""
            QTabBar::tab {{
                width: 16px;
                height: 16px;
                padding: 5px;
                margin: 0px 0px 0px 2px;
                border-top-left-radius: 5px;
                border-bottom-left-radius: 5px;
                border-right: none;
            }}

            QTabBar::tab:first {{
                margin-top: 3px;
            }}
            
            QTabBar::tab:last {{
                margin-bottom: 3px;
            }}
            
            QTabBar::tab:selected {{
                background-color: {palette.color(palette.ColorRole.Base).name()};
            }}
        """
        for i, c in enumerate(CONTROLLER_TABS):
            style += f"QTabBar::tab:nth-child({i + 1}) {{ background: {c['color']}; }}\n"
            tab = c['frame'](self)
            pix = QPixmap(resource_path(c['icon']))
            pix = pix.transformed(QTransform().rotate(90))

            self.tab_widget.addTab(tab, QIcon(pix), "")
            self.tab_widget.setIconSize(QSize(16, 16))

        self.tab_widget.setStyleSheet(style)
        layout.addWidget(self.tab_widget)
