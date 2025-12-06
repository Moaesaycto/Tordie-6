from PySide6.QtWidgets import (
    QWidget, QFrame, QVBoxLayout, QLabel, QStyle
)
from PySide6.QtWidgets import QVBoxLayout, QTabWidget, QWidget, QLabel
from PySide6.QtGui import QIcon
from PySide6.QtCore import QSize
from src.utils.os import resource_path


class ControllerFrame(QFrame):
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
                "icon": "src/assets/icons/scripts_tab.svg",
                "frame": ModifierControllerFrame,
                "color": "#6387D2",
            },
            {
                "title": "Geometry",
                "icon": "src/assets/icons/scripts_tab.svg",
                "frame": GeometryControllerFrame,
                "color": "#099A78"
            }
        ]

        layout = QVBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)
        self.setMinimumWidth(300)

        self.tab_widget = QTabWidget()
        palette = self.palette()

        style = f"""            
            QTabBar::tab {{
                width: 20px;
                height: 20px;
                padding: 5px;
                margin: 0px 2px;
                border-top-left-radius: 5px;
                border-top-right-radius: 5px;
            }}

            QTabBar::tab:first {{
                margin-left: 3px;
            }}
            
            QTabBar::tab:last {{
                margin-right: 3px;
            }}
            
            QTabBar::tab:selected {{
                background-color: {palette.color(palette.ColorRole.Base).name()};
            }}
        """
        for i, c in enumerate(CONTROLLER_TABS):
            style += f"QTabBar::tab:nth-child({i + 1}) {{ background: {c['color']}; }}\n"
            tab = c['frame'](self)

            self.tab_widget.addTab(tab, QIcon(resource_path(c['icon'])), "")
            self.tab_widget.setIconSize(QSize(20, 20))

        self.tab_widget.setStyleSheet(style)
        layout.addWidget(self.tab_widget)


class TabFrame(QFrame):
    def __init__(self, parent: QWidget = None, title: str = ""):
        super().__init__(parent)
        self.layout = QVBoxLayout(self)
        self.layout.setContentsMargins(0, 0, 0, 0)
        self.layout.setSpacing(0)
        
        label = QLabel(title)
        label.setStyleSheet("padding: 2px 2px 6px 2px;")
        self.layout.addWidget(label)
        
        line = QFrame()
        line.setFrameShape(QFrame.Shape.HLine)
        line.setFrameShadow(QFrame.Shadow.Plain)
        line.setMaximumHeight(1)
        self.layout.addWidget(line)
        
        self.layout.addStretch()


class ModifierControllerFrame(TabFrame):
    def __init__(self, parent: QWidget = None):
        super().__init__(parent, title="Modifiers")
        content_label = QLabel("Modifier content here")
        self.layout.addWidget(content_label)
        self.layout.addStretch()


class ScriptsControllerFrame(TabFrame):
    def __init__(self, parent: QWidget = None):
        super().__init__(parent, title="Scripts")
        content_label = QLabel("Scripts content here")
        self.layout.addWidget(content_label)
        self.layout.addStretch()


class GeometryControllerFrame(TabFrame):
    def __init__(self, parent: QWidget = None):
        super().__init__(parent, title="Geometry")
        content_label = QLabel("Geometry content here")
        self.layout.addWidget(content_label)
        self.layout.addStretch()
