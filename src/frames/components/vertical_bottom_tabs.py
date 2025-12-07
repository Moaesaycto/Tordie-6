from PySide6.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QWidget, QTabBar,
    QStackedWidget,
)
from PySide6.QtCore import QSize


class VerticalBottomTabs(QWidget):
    def __init__(self):
        super().__init__()

        layout = QHBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)

        left = QVBoxLayout()
        left.addStretch()

        self.tabbar = QTabBar()
        self.tabbar.setShape(QTabBar.RoundedWest)
        self.tabbar.setExpanding(False)
        left.addWidget(self.tabbar)

        layout.addLayout(left)
        self.pages = QStackedWidget()
        layout.addWidget(self.pages)

        self.tabbar.currentChanged.connect(self.pages.setCurrentIndex)

    def addTab(self, widget, icon, label=""):
        self.pages.addWidget(widget)
        self.tabbar.addTab(icon, label)

    def setIconSize(self, size: QSize):
        self.tabbar.setIconSize(size)

    def setStyleSheet(self, style: str):
        self.tabbar.setStyleSheet(style)
        super().setStyleSheet(style)

    def setCurrentIndex(self, index: int):
        self.tabbar.setCurrentIndex(index)
        self.pages.setCurrentIndex(index)

    def currentIndex(self):
        return self.tabbar.currentIndex()
