from PySide6.QtWidgets import (
    QWidget, QGraphicsScene, QGraphicsView
)
from PySide6.QtCore import Qt


class CanvasFrame(QGraphicsView):
    def __init__(self, parent: QWidget = None):
        super().__init__(parent)
        scene = QGraphicsScene(self)
        scene.setSceneRect(0, 0, 2000, 2000)
        self.setScene(scene)

        # Contents will go here
        scene.addRect(0, 0, 800, 600, brush=Qt.white)
        
