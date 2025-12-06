from typing import Callable
from pypresence import Presence
import os
from dotenv import load_dotenv
import time

import src.utils.logger as logger

load_dotenv()
CLIENT_ID = os.getenv('DISCORD_APP_ID')
RPC = None


def discord_setup(debug: bool = False) -> Callable[[Presence], None]:
    """Set up Discord presence"""
    global RPC

    state: str = "Working on a project"
    details: str = "Development mode" if debug else "Starting a project"

    if CLIENT_ID:
        try:
            RPC = Presence(CLIENT_ID)
            RPC.connect()
            RPC.update(
                state=state,
                details=details,
                large_image="tordie_logo",
                large_text="Tordie6",
                small_image="development-icon" if debug else None,
                start=int(time.time())
            )
            logger.success("Discord RPC connection successful!")
        except Exception as e:
            logger.error(f"Discord RPC failed: {e}")
            RPC = None
    else:
        logger.warn("Discord Client ID not found in environment")
        RPC = None

    return lambda: discord_cleanup()


def discord_cleanup() -> None:
    """Default Discord RPC close protocol"""
    global RPC
    if RPC:
        try:
            RPC.close()
            logger.info("Discord RPC closed")
        except:
            pass
