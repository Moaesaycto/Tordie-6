from PySide6.QtWidgets import (
    QWidget, QLabel, QWidget, QLabel
)

from src.frames.controller.tab_frame import TabFrame


class DocumentControllerFrame(TabFrame):
    def __init__(self, parent: QWidget = None):
        super().__init__(parent, title="Document")
        content_label = QLabel("Document content here")
        self.layout.addWidget(content_label)
        self.layout.addStretch()
