from PySide6.QtWidgets import QWidget, QLabel, QVBoxLayout
from PySide6.QtSvgWidgets import QSvgWidget
from PySide6.QtGui import QFont
from PySide6.QtCore import Qt
from PySide6.QtGui import QFont
from PySide6.QtGui import QMovie
import configparser
from src.utils.os import resource_path

config = configparser.ConfigParser()
config.read(resource_path('config.ini'))


class SplashScreen(QWidget):
    def __init__(self):
        super().__init__()
        self.setWindowFlags(Qt.FramelessWindowHint | Qt.WindowStaysOnTopHint)
        self.setAttribute(Qt.WA_TranslucentBackground)

        self.svg = QSvgWidget(resource_path("src/assets/vectors/splashscreen.svg"), self)
        self.svg.resize(400, 300)
        self.svg.setStyleSheet("background-color: white; border-radius: 15px;")

        self.label = QLabel("TORDIE 6", self)
        self.label.setFont(QFont("Bahnschrift", 24))
        self.label.setStyleSheet("color: black;")
        self.label.adjustSize()
        self.label.move(204, 243)

        self.sublabel = QLabel(
            f"Loading {config.get('app', 'name')} Version {config.get('app', 'version')} ...", self)
        self.sublabel.setFont(QFont("Roboto", 10))
        self.sublabel.setStyleSheet("color: gray;")
        self.sublabel.adjustSize()

        self.spinner = QLabel(self)
        spinner_movie = QMovie(resource_path("src/assets/gifs/loading.gif"))
        self.spinner.setMovie(spinner_movie)
        spinner_movie.start()
        self.spinner.move(347, 247)
        self.spinner.setFixedSize(40, 40)
        self.spinner.setScaledContents(True)

        self.resize(400, 300)

    def showEvent(self, event):
        super().showEvent(event)
        label_right = self.label.x() + self.label.width()
        sublabel_x = label_right - self.sublabel.width()
        self.sublabel.move(sublabel_x, 275)
