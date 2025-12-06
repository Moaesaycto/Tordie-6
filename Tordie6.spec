# -*- mode: python ; coding: utf-8 -*-

import os
from PyInstaller.building.build_main import Analysis
from PyInstaller.building.build_main import PYZ, EXE

def collect_folder(src_folder, target_folder):
    datas = []
    for root, _, files in os.walk(src_folder):
        for f in files:
            full_path = os.path.join(root, f)
            rel_path = os.path.relpath(root, src_folder)
            datas.append((full_path, os.path.join(target_folder, rel_path)))
    return datas


a = Analysis(
    ['main.py'],
    pathex=[],
    binaries=[],
    datas=[
        ('icon.ico', '.'),
        ('config.ini', '.'),
    ] + collect_folder("src/assets", "src/assets"),
    hiddenimports=[],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    noarchive=False,
    optimize=0,
)
pyz = PYZ(a.pure)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.datas,
    [],
    name='Tordie6',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=False,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    icon=['icon.ico'],
)
