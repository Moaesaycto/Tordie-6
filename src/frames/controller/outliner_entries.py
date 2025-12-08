from PySide6.QtWidgets import QWidget, QLabel, QHBoxLayout, QPushButton
from PySide6.QtGui import QIcon
from PySide6.QtCore import QSize

from src.utils.os import resource_path

ICON_HASH = {
    "point": "src/assets/icons/point.svg",
    "line": "src/assets/icons/line.svg",
    "circle": "src/assets/icons/circle.svg",
    "parametric": "src/assets/icons/parametric.svg",
    "default": "src/assets/icons/default.svg",
    "group": "src/assets/icons/group.svg",
}

from PySide6.QtWidgets import QWidget, QLabel, QHBoxLayout, QPushButton
from PySide6.QtGui import QIcon
from PySide6.QtCore import Qt

class OutlineEntry(QWidget):
    def __init__(self, text, object_type: str = "default"):
        super().__init__()
        self.visible = True
        self.render_enabled = True
        
        layout = QHBoxLayout()
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(2)

        # Icon and label
        icon_label = QLabel()
        icon_label.setPixmap(QIcon(resource_path(ICON_HASH[object_type])).pixmap(16, 16))
        self.label = QLabel(text)
        self.label.setStyleSheet("padding: 0px 5px;")
        
        layout.addWidget(icon_label)
        layout.addWidget(self.label)
        layout.addStretch()

        btn_style = """
            QPushButton {
                background: transparent;
                border: none;
                padding: 0px;
                margin: 0px;
            }
        """

        # Visibility button
        self.visibility_btn = QPushButton()
        self.visibility_btn.setFixedSize(16, 16)
        self.visibility_btn.setFlat(True)
        self.visibility_btn.clicked.connect(self.toggle_visibility)
        self.visibility_btn.setStyleSheet(btn_style)
        self.update_visibility_icon()
        
        # Render button
        self.render_btn = QPushButton()
        self.render_btn.setFixedSize(16, 16)
        self.render_btn.setFlat(True)
        self.render_btn.clicked.connect(self.toggle_render)
        self.render_btn.setStyleSheet(btn_style)
        self.update_render_icon()
        
        layout.addSpacing(5)
        layout.addWidget(self.visibility_btn)
        layout.addSpacing(2)
        layout.addWidget(self.render_btn)
        layout.addSpacing(5)

        self.setLayout(layout)
    
    def toggle_visibility(self):
        self.visible = not self.visible
        self.update_visibility_icon()
        self.update_opacity()
        # TODO: Update children visibility state
    
    def toggle_render(self):
        self.render_enabled = not self.render_enabled
        self.update_render_icon()
        # TODO: Update children render state
    
    def update_visibility_icon(self):
        icon_path = "src/assets/icons/visible.svg" if self.visible else "src/assets/icons/visibility_off.svg"
        self.visibility_btn.setIcon(QIcon(resource_path(icon_path)))
        self.visibility_btn.setIconSize(QSize(16, 16))
    
    def update_render_icon(self):
        icon_path = "src/assets/icons/render.svg" if self.render_enabled else "src/assets/icons/render_off.svg"
        self.render_btn.setIcon(QIcon(resource_path(icon_path)))
        self.render_btn.setIconSize(QSize(16, 16))
    
    def update_opacity(self):
        opacity = 1.0 if self.visible else 0.4
        self.setStyleSheet(f"opacity: {opacity};")
    
    def set_parent_render_disabled(self, disabled):
        """Call this on children when parent render is toggled"""
        if disabled:
            self.render_btn.setEnabled(False)
            self.render_btn.setStyleSheet("opacity: 0.4;")
        else:
            self.render_btn.setEnabled(True)
            self.render_btn.setStyleSheet("")