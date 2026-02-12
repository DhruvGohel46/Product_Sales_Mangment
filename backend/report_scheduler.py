import os
import sys
import schedule
import time
import logging
from datetime import datetime, timedelta, date
from flask_cors import CORS
from flask import Flask
import pandas as pd
from pathlib import Path
import json
from sqlalchemy import func

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app
from models import db, Bill
from config import REPORTS_FOLDER

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
        self.app = create_app('default')
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
        with self.app.app_context():
            try:
                # Calculate previous day's date
                yesterday = date.today() - timedelta(days=1)
                
                logger.info(f"Generating report for {yesterday}")
                
                # Get bills for previous day
                bills = Bill.query.filter(
                    func.date(Bill.created_at) == yesterday
                ).order_by(Bill.created_at.desc()).all()
                
                if not bills:
                    logger.info("No bills found for previous day")
                    return None
                
                # Transform bills to list of dicts for processing
                bills_list = []
                for bill in bills:
                    # Parse items
                    try:
                        items = json.loads(bill.items) if isinstance(bill.items, str) else bill.items
                    except:
                        items = []
                        
                    # Calculate bill-level item details
                    processed_items = []
                    for item in items:
                        processed_items.append({
                            'quantity': item.get('quantity', 0),
                            'price': item.get('price', 0),
                            'total': item.get('quantity', 0) * item.get('price', 0),
                            'product_name': item.get('name', 'Unknown'),
                            'category': item.get('category', 'Unknown') # Note: category might be in item or we look it up? 
                            # In sqlite service it joined products table. 
                            # Here items JSON usually has category logic handled by frontend/service.
                            # If not, we might need to fetch products. 
                            # For simplicity assuming items has it or we accept 'Unknown'
                        })

                    bills_list.append({
                        'id': bill.id,
                        'customer_name': bill.customer_name,
                        'total_amount': bill.total_amount,
                        'payment_method': bill.payment_method,
                        'created_at': bill.created_at,
                        'updated_at': bill.updated_at,
                        'items': processed_items
                    })
                
                # Calculate summary statistics
                total_sales = sum(bill['total_amount'] for bill in bills_list)
                total_bills = len(bills_list)
                
                # Category-wise sales
                category_sales = {}
                for bill in bills_list:
                    for item in bill['items']:
                        category = item.get('category', 'Unknown')
                        if category not in category_sales:
                            category_sales[category] = 0
                        category_sales[category] += item['total']
                
                # Payment method breakdown
                payment_methods = {}
                for bill in bills_list:
                    method = bill['payment_method'] or 'CASH'
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
                        'Created At': str(bill['created_at'])
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
