import logging
import traceback

class DebugTools:
    """Provides optimized debugging utilities for the project."""
    def __init__(self, log_file="debug.log"):
        logging.basicConfig(filename=log_file, level=logging.DEBUG,
                            format='%(asctime)s %(levelname)s %(message)s')
    def log(self, message):
        logging.debug(message)
    def log_exception(self, ex):
        logging.error(f"Exception: {ex}")
        logging.error(traceback.format_exc())
    def trace_function(self, func):
        def wrapper(*args, **kwargs):
            logging.debug(f"Calling {func.__name__} with args={args}, kwargs={kwargs}")
            try:
                result = func(*args, **kwargs)
                logging.debug(f"{func.__name__} returned {result}")
                return result
            except Exception as ex:
                self.log_exception(ex)
                raise
        return wrapper
