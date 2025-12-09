from PySide6.QtWidgets import (
    QWidget, QFrame, QHBoxLayout
)


class Ribbon(QFrame):
    def __init__(self, parent: QWidget = None):
        super().__init__(parent)
        self.layout = QHBoxLayout(self)
        self.setContentsMargins(0, 0, 0, 0)
        self.setMinimumHeight(100)
