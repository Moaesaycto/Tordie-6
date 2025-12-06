from PySide6.QtWidgets import (
    QWidget, QFrame, QVBoxLayout, QLabel, QPushButton, QSizePolicy
)
from PySide6.QtCore import Qt

import src.utils.logger as logger


class ToolFrame(QFrame):
    TOOLS = [
        {"icon": None, "title": "Select", },
        {"icon": None, "title": "Pen", },
    ]

    def __init__(self, parent: QWidget = None):
        super().__init__(parent)
        self.setFrameShape(QFrame.StyledPanel)
        self.setMinimumWidth(80)
        layout = QVBoxLayout()
        layout.setContentsMargins(4, 4, 4, 4)
        self.setLayout(layout)

        layout.addWidget(QLabel("Tools", alignment=Qt.AlignCenter))
        for tool in self.TOOLS:
            btn = QPushButton(tool['title'])
            btn.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Fixed)
            btn.clicked.connect(
                lambda checked, t=tool['title']: logger.info(f"{t} mode selected"))
            layout.addWidget(btn)
