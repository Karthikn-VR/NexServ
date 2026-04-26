import logging
import sys

def setup_logging():
    # Configure root logger
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        handlers=[
            logging.StreamHandler(sys.stdout)
        ]
    )
    
    # Set levels for specific loggers if needed
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    
    return logging.getLogger("nexserv")

logger = setup_logging()
