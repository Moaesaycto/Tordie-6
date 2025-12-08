from PySide6.QtWidgets import (
    QWidget, QLabel, QWidget, QLabel
)

from src.frames.controller.tab_frame import TabFrame


class ScriptsControllerFrame(TabFrame):
    def __init__(self, parent: QWidget = None):
        super().__init__(parent, title="Scripts")
        content_label = QLabel("Scripts content here")
        self.layout.addWidget(content_label)
        self.layout.addStretch()
