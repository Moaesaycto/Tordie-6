from PySide6.QtWidgets import (
    QWidget, QFrame, QVBoxLayout, QLabel, QWidget, QLabel
)


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
