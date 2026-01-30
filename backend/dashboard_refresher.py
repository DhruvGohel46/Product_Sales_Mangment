import os
import sys
import schedule
import time
import logging
from datetime import datetime, timedelta
import sqlite3
import shutil
from pathlib import Path

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config import config

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
        self.db_path = os.path.join(os.path.dirname(__file__), 'data', 'products.db')
        self.archive_dir = os.path.join(os.path.dirname(__file__), 'data', 'archive')
        self.ensure_archive_directory()
        
    def ensure_archive_directory(self):
        """Ensure archive directory exists"""
        try:
            Path(self.archive_dir).mkdir(parents=True, exist_ok=True)
            logger.info(f"Archive directory ensured at: {self.archive_dir}")
        except Exception as e:
            logger.error(f"Failed to create archive directory: {e}")
            raise
    
    def archive_previous_day_data(self):
        """Archive previous day's data to separate database"""
        try:
            # Calculate previous day's date range
            yesterday = datetime.now() - timedelta(days=1)
            start_date = yesterday.replace(hour=0, minute=0, second=0, microsecond=0)
            end_date = yesterday.replace(hour=23, minute=59, second=59, microsecond=999999)
            
            date_str = yesterday.strftime('%Y-%m-%d')
            archive_db_path = os.path.join(self.archive_dir, f"archive_{date_str}.db")
            
            logger.info(f"Archiving data for {date_str}")
            
            # Connect to current database
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Create archive database
            archive_conn = sqlite3.connect(archive_db_path)
            archive_cursor = archive_conn.cursor()
            
            # Get schema from current database
            cursor.execute("SELECT sql FROM sqlite_master WHERE type='table'")
            tables = cursor.fetchall()
            
            # Create tables in archive database
            for table in tables:
                if table[0]:  # Skip empty SQL statements
                    archive_cursor.execute(table[0])
            
            # Archive bills from previous day
            cursor.execute("""
                SELECT * FROM bills 
                WHERE created_at >= ? AND created_at <= ?
                ORDER BY created_at
            """, (start_date, end_date))
            
            bills_data = cursor.fetchall()
            
            if bills_data:
                # Get column names for bills table
                cursor.execute("PRAGMA table_info(bills)")
                bill_columns = [col[1] for col in cursor.fetchall()]
                
                # Insert bills into archive
                placeholders = ', '.join(['?'] * len(bill_columns))
                archive_cursor.execute(f"INSERT INTO bills ({', '.join(bill_columns)}) VALUES ({placeholders})", bills_data)
                
                # Commit archive database
                archive_conn.commit()
                archive_conn.close()
                
                # Delete archived data from current database
                bill_ids = [bill[0] for bill in bills_data]  # Use id column
                placeholders_bills = ', '.join(['?'] * len(bill_ids))
                cursor.execute(f"DELETE FROM bills WHERE id IN ({placeholders_bills})", bill_ids)
                
                conn.commit()
                logger.info(f"Archived {len(bills_data)} bills and removed from current database")
            else:
                logger.info("No data found for previous day")
                archive_conn.close()
            
            conn.close()
            
            logger.info(f"Archive created: {archive_db_path}")
            return True
            
        except Exception as e:
            logger.error(f"Error archiving data: {e}")
            return False
    
    def refresh_dashboard_data(self):
        """Refresh dashboard by clearing old data and resetting counters"""
        try:
            logger.info("Refreshing dashboard data...")
            
            # Connect to database
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Reset daily counters (you can add more as needed)
            # This is where you would reset any dashboard-specific data
            
            # Example: Reset daily summary if it exists
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='daily_summary'")
            if cursor.fetchone():
                cursor.execute("DELETE FROM daily_summary")
                logger.info("Cleared daily summary table")
            
            # You can add more dashboard refresh logic here
            # For example: reset daily totals, clear temporary tables, etc.
            
            conn.commit()
            conn.close()
            
            logger.info("Dashboard data refreshed successfully")
            return True
            
        except Exception as e:
            logger.error(f"Error refreshing dashboard: {e}")
            return False
    
    def daily_refresh_and_archive(self):
        """Main function to archive previous day and refresh dashboard"""
        try:
            logger.info("=" * 60)
            logger.info("Starting Daily Dashboard Refresh and Archive")
            logger.info("=" * 60)
            
            # Archive previous day's data
            archive_success = self.archive_previous_day_data()
            
            # Refresh dashboard
            refresh_success = self.refresh_dashboard_data()
            
            if archive_success and refresh_success:
                logger.info("✅ Daily refresh and archive completed successfully")
            else:
                logger.error("❌ Some operations failed during daily refresh")
            
            logger.info("=" * 60)
            
        except Exception as e:
            logger.error(f"❌ Error in daily refresh: {e}")
    
    def start_scheduler(self):
        """Start the scheduler"""
        logger.info("🚀 Starting Dashboard Refresh Scheduler...")
        logger.info(f"📅 Dashboard will refresh daily at 12:01 AM")
        logger.info(f"📁 Archive directory: {self.archive_dir}")
        
        # Schedule job for 12:01 AM every day (start of new day)
        schedule.every().day.at("00:01").do(self.daily_refresh_and_archive)
        
        # Run scheduler continuously
        while True:
            schedule.run_pending()
            time.sleep(60)  # Check every minute
    
    def run_immediate(self):
        """Run refresh immediately (for testing)"""
        logger.info("🔄 Running immediate dashboard refresh...")
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
        logger.info("🛑 Scheduler stopped by user")
    except Exception as e:
        logger.error(f"❌ Fatal error: {e}")

if __name__ == "__main__":
    main()
