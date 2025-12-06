"""
d888888P  .88888.   888888ba  888888ba  dP  88888888b    .d8888P 
   88    d8'   `8b  88    `8b 88    `8b 88  88           88'     
   88    88     88 a88aaaa8P' 88     88 88 a88aaaa       88baaa. 
   88    88     88  88   `8b. 88     88 88  88           88` `88 
   88    Y8.   .8P  88     88 88    .8P 88  88           8b. .d8 
   dP     `8888P'   dP     dP 8888888P  dP  88888888P    `Y888P'



"""

from src import main
import sys

if __name__ == "__main__":
   sys.argv += ['-platform', 'windows:darkmode=2']
   app = main()
   sys.exit(app.exec())
