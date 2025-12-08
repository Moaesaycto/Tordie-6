from PySide6.QtWidgets import (
    QWidget, QLabel, QWidget, QLabel
)

from src.frames.controller.tab_frame import TabFrame


class SettingsControllerFrame(TabFrame):
    def __init__(self, parent: QWidget = None):
        super().__init__(parent, title="Settings")
        content_label = QLabel("Settings content here")
        self.layout.addWidget(content_label)
        self.layout.addStretch()
