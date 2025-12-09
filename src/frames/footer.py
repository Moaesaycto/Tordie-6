from PySide6.QtWidgets import (
    QFrame, QWidget, QHBoxLayout, QLabel
)


class Footer(QFrame):
    def __init__(self, parent: QWidget = None):
        super().__init__(parent)
        self.layout = QHBoxLayout(self)
        label = QLabel("Whoa")
        label.setContentsMargins(0, 0, 0, 0)
        self.layout.addWidget(label)
        self.layout.setContentsMargins(0, 0, 0, 0)
