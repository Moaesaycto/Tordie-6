from PySide6.QtWidgets import (
    QWidget, QFrame, QVBoxLayout, QLabel, QHBoxLayout, QTabWidget, QLabel, QSplitter,
    QTreeWidget, QTreeWidgetItem
)
from PySide6.QtGui import QIcon, QPixmap, QTransform
from PySide6.QtCore import QSize, Qt
from src.frames.controller.outliner_entries import OutlineEntry
from src.utils.os import resource_path
from PySide6.QtCore import QTimer


from src.frames.controller.tabs.modifiers import ModifierControllerFrame
from src.frames.controller.tabs.document import DocumentControllerFrame
from src.frames.controller.tabs.geometry import GeometryControllerFrame
from src.frames.controller.tabs.scripts import ScriptsControllerFrame
from src.frames.controller.tabs.settings import SettingsControllerFrame


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
        self.splitter = QSplitter(Qt.Vertical)
        self.splitter.addWidget(OutlinerFrame())

        self.splitter.addWidget(PropertiesFrame())

        self.layout = QVBoxLayout(self)
        self.layout.setContentsMargins(0, 0, 0, 0)

        self.layout.addWidget(self.splitter)


class OutlinerFrame(QFrame):
    SUPPORTS_CHILDREN = [
        "group"
    ]

    def __init__(self, parent=None):
        super().__init__(parent)
        self.layout = QVBoxLayout(self)
        self.layout.setContentsMargins(0, 0, 0, 0)
        self.layout.setSpacing(0)

        label = QLabel("Diagram Collection")
        label.setStyleSheet("padding: 5px;")
        self.layout.addWidget(label)

        tree = QTreeWidget()
        tree.setHeaderHidden(True)
        tree.setDragEnabled(True)
        tree.setAcceptDrops(True)
        tree.setDropIndicatorShown(True)
        tree.setAlternatingRowColors(True)
        tree.setIndentation(10)
        tree.setSelectionMode(QTreeWidget.ExtendedSelection)
        tree.setDragDropMode(QTreeWidget.InternalMove)

        self.tree = tree

        colors = ["point", "line", "circle", "parametric", "default", "group"]
        for i, color in enumerate(colors):
            child_item = QTreeWidgetItem(tree)
            child_item.setData(
                0, Qt.UserRole, {"text": f"Item {i+1}", "color": color})

            if color not in self.SUPPORTS_CHILDREN:
                child_item.setFlags(child_item.flags() & ~Qt.ItemIsDropEnabled)

            entry = OutlineEntry(f"Item {i+1}", color)
            tree.setItemWidget(child_item, 0, entry)

        tree.expandAll()

        original_drop_event = tree.dropEvent

        def custom_drop_event(event):
            original_drop_event(event)
            QTimer.singleShot(0, self.recreate_widgets)

        tree.dropEvent = custom_drop_event

        palette = self.palette()
        alt_color = palette.color(palette.ColorRole.AlternateBase).name()
        base_color = palette.color(palette.ColorRole.Base).name()
        row_height = tree.visualItemRect(tree.topLevelItem(0)).height()

        tree.setStyleSheet(f"""
                QTreeView {{
                    background: repeating-linear-gradient(
                        0deg,
                        {base_color} 0px,
                        {base_color} {row_height}px,
                        {alt_color} {row_height}px,
                        {alt_color} {row_height * 2}px
                    );
                }}
            """)

        self.layout.addWidget(tree)

    def recreate_widgets(self):
        def recreate_recursive(item):
            for i in range(item.childCount()):
                child = item.child(i)
                data = child.data(0, Qt.UserRole)
                if data:
                    existing_widget = self.tree.itemWidget(child, 0)
                    if not existing_widget or not isinstance(existing_widget, OutlineEntry):
                        entry = OutlineEntry(data["text"], data["color"])
                        self.tree.setItemWidget(child, 0, entry)
                recreate_recursive(child)

        recreate_recursive(self.tree.invisibleRootItem())

    def sizeHint(self):
        return QSize(self.width(), 50)


class PropertiesFrame(QFrame):
    def __init__(self, parent: QWidget = None):
        super().__init__(parent)
        CONTROLLER_TABS = [
            {
                "title": "Scripts",
                "icon": "src/assets/icons/scripts_tab.svg",
                "frame": ScriptsControllerFrame,
            },
            {
                "title": "Modifiers",
                "icon": "src/assets/icons/modifiers_tab.svg",
                "frame": ModifierControllerFrame,
            },
            {
                "title": "Geometry",
                "icon": "src/assets/icons/geometry_tab.svg",
                "frame": GeometryControllerFrame,
            },
            {
                "title": "Document",
                "icon": "src/assets/icons/document_tab.svg",
                "frame": DocumentControllerFrame,
            },
            {
                "title": "Settings",
                "icon": "src/assets/icons/settings_tab.svg",
                "frame": SettingsControllerFrame,
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
                margin-top: 28px;
            }}
            
            QTabBar::tab:last {{
                margin-bottom: 3px;
            }}
            
            QTabBar::tab:selected {{
                background-color: {palette.color(palette.ColorRole.Base).name()};
            }}
        """
        for i, c in enumerate(CONTROLLER_TABS):
            # style += f"QTabBar::tab:nth-child({i + 1}) {{ background: {c['color']}; }}\n"
            tab = c['frame'](self)
            pix = QPixmap(resource_path(c['icon']))
            pix = pix.transformed(QTransform().rotate(90))

            self.tab_widget.addTab(tab, QIcon(pix), "")
            self.tab_widget.setIconSize(QSize(16, 16))

        self.tab_widget.setStyleSheet(style)
        layout.addWidget(self.tab_widget)
