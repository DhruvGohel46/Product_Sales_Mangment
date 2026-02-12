import os
import sys
import schedule
import time
import logging
from datetime import datetime, timedelta

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app
from models import db

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('dashboard_refresh.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class DashboardRefresher:
    def __init__(self):
        # Initialize Flask app context
        self.app = create_app('default')
        
    def refresh_dashboard_data(self):
        """Refresh dashboard by clearing old data and resetting counters"""
        with self.app.app_context():
            try:
                logger.info("Refreshing dashboard data...")
                
                # In PostgreSQL migration, we are preserving history in the main table
                # rather than archiving to separate files. 
                # So we simply log the maintenance task.
                
                # If there are specific counters to reset in Settings, do it here.
                # Example:
                # setting = Settings.query.get('daily_counter')
                # if setting:
                #     setting.value = '0'
                #     db.session.commit()
                
                logger.info("Dashboard maintenance check completed (No action needed for PostgreSQL)")
                return True
                
            except Exception as e:
                logger.error(f"Error refreshing dashboard: {e}")
                return False
    
    def daily_refresh_and_archive(self):
        """Main function to refresh dashboard"""
        try:
            logger.info("=" * 60)
            logger.info("Starting Daily Dashboard Refresh")
            logger.info("=" * 60)
            
            # Refresh dashboard
            refresh_success = self.refresh_dashboard_data()
            
            if refresh_success:
                logger.info("Daily refresh completed successfully")
            else:
                logger.error("Some operations failed during daily refresh")
            
            logger.info("=" * 60)
            
        except Exception as e:
            logger.error(f"Error in daily refresh: {e}")
    
    def start_scheduler(self):
        """Start the scheduler"""
        logger.info("Starting Dashboard Refresh Scheduler...")
        logger.info(f"Dashboard will run maintenance daily at 12:01 AM")
        
        # Schedule job for 12:01 AM every day (start of new day)
        schedule.every().day.at("00:01").do(self.daily_refresh_and_archive)
        
        # Run scheduler continuously
        while True:
            schedule.run_pending()
            time.sleep(60)  # Check every minute
    
    def run_immediate(self):
        """Run refresh immediately (for testing)"""
        logger.info("Running immediate dashboard refresh...")
        self.daily_refresh_and_archive()

def main():
    """Main entry point"""
    try:
        refresher = DashboardRefresher()
        
        if len(sys.argv) > 1 and sys.argv[1] == '--immediate':
            # Run immediately for testing
            refresher.run_immediate()
        else:
            # Start scheduler
            refresher.start_scheduler()
            
    except KeyboardInterrupt:
        logger.info("Scheduler stopped by user")
    except Exception as e:
        logger.error(f"❌ Fatal error: {e}")

if __name__ == "__main__":
    main()
