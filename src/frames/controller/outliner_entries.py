from PySide6.QtWidgets import QWidget, QLabel, QHBoxLayout
from PySide6.QtGui import QIcon

from src.utils.os import resource_path

ICON_HASH = {
    "point": "src/assets/icons/point.svg",
    "line": "src/assets/icons/line.svg",
    "circle": "src/assets/icons/circle.svg",
    "parametric": "src/assets/icons/parametric.svg",
    "default": "src/assets/icons/default.svg",
    "group": "src/assets/icons/group.svg",
}

class OutlineEntry(QWidget):
    def __init__(self, text, object_type: str = "default"):
        super().__init__()
        layout = QHBoxLayout()
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(4)
        
        icon_label = QLabel()
        icon_label.setPixmap(
            QIcon(resource_path(ICON_HASH[object_type])).pixmap(16, 16))
        layout.addWidget(icon_label)
        label = QLabel(text)
        layout.addWidget(label)
        layout.addStretch()

        self.setLayout(layout)
