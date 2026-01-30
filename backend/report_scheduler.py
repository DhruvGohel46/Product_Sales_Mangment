import os
import sys
import schedule
import time
import logging
from datetime import datetime, timedelta
from flask_cors import CORS
from flask import Flask
import sqlite3
import pandas as pd
from pathlib import Path
import threading
import json

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import existing modules
from routes.billing import get_bills_for_date_range
from routes.products import get_products
from config import RESET_PASSWORD, REPORTS_FOLDER

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('report_scheduler.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class ReportScheduler:
    def __init__(self):
        self.app = Flask(__name__)
        CORS(self.app)
        self.db_path = os.path.join(os.path.dirname(__file__), 'data', 'products.db')
        self.reports_folder = REPORTS_FOLDER
        self.ensure_reports_folder()
        
    def ensure_reports_folder(self):
        """Ensure reports folder exists"""
        try:
            Path(self.reports_folder).mkdir(parents=True, exist_ok=True)
            logger.info(f"Reports folder ensured at: {self.reports_folder}")
        except Exception as e:
            logger.error(f"Failed to create reports folder: {e}")
            raise
    
    def get_previous_day_report(self):
        """Generate previous day's sales report"""
        try:
            # Calculate previous day's date range
            yesterday = datetime.now() - timedelta(days=1)
            start_date = yesterday.replace(hour=0, minute=0, second=0, microsecond=0)
            end_date = yesterday.replace(hour=23, minute=59, second=59, microsecond=999999)
            
            logger.info(f"Generating report for {yesterday.strftime('%Y-%m-%d')}")
            
            # Connect to database
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Get bills for previous day
            cursor.execute("""
                SELECT id, customer_name, total_amount, payment_method, 
                       created_at, updated_at
                FROM bills 
                WHERE created_at >= ? AND created_at <= ?
                ORDER BY created_at DESC
            """, (start_date, end_date))
            
            bills_data = cursor.fetchall()
            
            if not bills_data:
                logger.info("No bills found for previous day")
                return None
            
            # Get bill items for each bill
            bills_list = []
            for bill in bills_data:
                bill_id = bill[0]
                cursor.execute("""
                    SELECT bi.quantity, bi.price, bi.total, p.name, p.category
                    FROM bill_items bi
                    JOIN products p ON bi.product_id = p.id
                    WHERE bi.bill_id = ?
                """, (bill_id,))
                
                items_data = cursor.fetchall()
                
                bills_list.append({
                    'id': bill[0],
                    'customer_name': bill[1],
                    'total_amount': bill[2],
                    'payment_method': bill[3],
                    'created_at': bill[4],
                    'updated_at': bill[5],
                    'items': [
                        {
                            'quantity': item[0],
                            'price': item[1],
                            'total': item[2],
                            'product_name': item[3],
                            'category': item[4]
                        } for item in items_data
                    ]
                })
            
            conn.close()
            
            # Calculate summary statistics
            total_sales = sum(bill['total_amount'] for bill in bills_list)
            total_bills = len(bills_list)
            
            # Category-wise sales
            category_sales = {}
            for bill in bills_list:
                for item in bill['items']:
                    category = item['category']
                    if category not in category_sales:
                        category_sales[category] = 0
                    category_sales[category] += item['total']
            
            # Payment method breakdown
            payment_methods = {}
            for bill in bills_list:
                method = bill['payment_method']
                if method not in payment_methods:
                    payment_methods[method] = 0
                payment_methods[method] += bill['total_amount']
            
            # Create report data
            report_data = {
                'report_date': yesterday.strftime('%Y-%m-%d'),
                'generated_at': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                'summary': {
                    'total_sales': total_sales,
                    'total_bills': total_bills,
                    'average_bill_amount': total_sales / total_bills if total_bills > 0 else 0
                },
                'category_sales': category_sales,
                'payment_methods': payment_methods,
                'bills': bills_list
            }
            
            return report_data
            
        except Exception as e:
            logger.error(f"Error generating report: {e}")
            return None
    
    def save_report_to_files(self, report_data):
        """Save report as Excel file only"""
        if not report_data:
            return False
        
        try:
            report_date = report_data['report_date']
            base_filename = f"daily_report_{report_date}"
            
            # Create only Excel report
            self.save_excel_report(report_data, base_filename)
            
            logger.info(f"Excel report saved for {report_date}")
            return True
            
        except Exception as e:
            logger.error(f"Error saving report: {e}")
            return False
    
    def save_excel_report(self, report_data, base_filename):
        """Save report as Excel file with multiple sheets"""
        excel_path = os.path.join(self.reports_folder, f"{base_filename}.xlsx")
        
        with pd.ExcelWriter(excel_path, engine='openpyxl') as writer:
            # Summary sheet
            summary_df = pd.DataFrame([
                ['Report Date', report_data['report_date']],
                ['Generated At', report_data['generated_at']],
                ['Total Sales', report_data['summary']['total_sales']],
                ['Total Bills', report_data['summary']['total_bills']],
                ['Average Bill Amount', report_data['summary']['average_bill_amount']]
            ], columns=['Metric', 'Value'])
            summary_df.to_excel(writer, sheet_name='Summary', index=False)
            
            # Category sales sheet
            category_df = pd.DataFrame(
                list(report_data['category_sales'].items()),
                columns=['Category', 'Sales Amount']
            )
            category_df.to_excel(writer, sheet_name='Category Sales', index=False)
            
            # Payment methods sheet
            payment_df = pd.DataFrame(
                list(report_data['payment_methods'].items()),
                columns=['Payment Method', 'Amount']
            )
            payment_df.to_excel(writer, sheet_name='Payment Methods', index=False)
            
            # Detailed bills sheet
            bills_data = []
            for bill in report_data['bills']:
                for item in bill['items']:
                    bills_data.append({
                        'Bill ID': bill['id'],
                        'Customer Name': bill['customer_name'],
                        'Product Name': item['product_name'],
                        'Category': item['category'],
                        'Quantity': item['quantity'],
                        'Price': item['price'],
                        'Total': item['total'],
                        'Payment Method': bill['payment_method'],
                        'Created At': bill['created_at']
                    })
            
            bills_df = pd.DataFrame(bills_data)
            bills_df.to_excel(writer, sheet_name='Detailed Bills', index=False)
        
        logger.info(f"Excel report saved: {excel_path}")
    
    def generate_and_save_report(self):
        """Main function to generate and save report"""
        try:
            logger.info("=" * 50)
            logger.info("Starting automatic report generation")
            logger.info("=" * 50)
            
            report_data = self.get_previous_day_report()
            
            if report_data:
                success = self.save_report_to_files(report_data)
                if success:
                    logger.info(f"✅ Report generated successfully for {report_data['report_date']}")
                    
                    # Log summary
                    summary = report_data['summary']
                    logger.info(f"📊 Summary: {summary['total_bills']} bills, ₹{summary['total_sales']:.2f} total sales")
                else:
                    logger.error("❌ Failed to save report")
            else:
                logger.info("ℹ️ No data available for previous day")
            
            logger.info("=" * 50)
            
        except Exception as e:
            logger.error(f"❌ Error in report generation: {e}")
    
    def start_scheduler(self):
        """Start the scheduler"""
        logger.info("🚀 Starting Report Scheduler...")
        logger.info(f"📅 Reports will be generated daily at 12:01 PM")
        logger.info(f"📁 Reports folder: {self.reports_folder}")
        
        # Schedule job for 12:01 PM every day
        schedule.every().day.at("12:01").do(self.generate_and_save_report)
        
        # Run scheduler continuously
        while True:
            schedule.run_pending()
            time.sleep(60)  # Check every minute
    
    def run_immediate(self):
        """Generate report immediately (for testing)"""
        logger.info("🔄 Generating immediate report...")
        self.generate_and_save_report()

def main():
    """Main entry point"""
    try:
        scheduler = ReportScheduler()
        
        if len(sys.argv) > 1 and sys.argv[1] == '--immediate':
            # Run immediately for testing
            scheduler.run_immediate()
        else:
            # Start scheduler
            scheduler.start_scheduler()
            
    except KeyboardInterrupt:
        logger.info("🛑 Scheduler stopped by user")
    except Exception as e:
        logger.error(f"❌ Fatal error: {e}")

if __name__ == "__main__":
    main()
