from colorama import Fore, Style, init

init(autoreset=True)
DEBUG = False


def init(debug: bool):
    global DEBUG
    DEBUG = debug


def _print(msg: str, color: str, prefix: str = "System") -> None:
    global DEBUG
    if DEBUG:
        print(
            f"{color}{Style.DIM}{Style.BRIGHT}[{prefix}] {Style.RESET_ALL}{color}{msg}")


def info(msg: str, prefix: str = "Info") -> None:
    _print(msg, Fore.WHITE, prefix)


def warn(msg: str, prefix: str = "Warning") -> None:
    _print(msg, Fore.YELLOW, prefix)


def error(msg: str, prefix: str = "Error") -> None:
    _print(msg, Fore.RED, prefix)


def success(msg: str, prefix: str = "Success") -> None:
    _print(msg, Fore.GREEN, prefix)


def loading(msg: str, prefix: str = "Loading") -> None:
    _print(msg, Fore.MAGENTA, prefix)
