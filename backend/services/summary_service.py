from datetime import datetime, date
from typing import List, Dict, Optional
from .xml_db_service import XMLDatabaseService


class SummaryService:
    """Service for generating daily sales summaries"""
    
    def __init__(self, xml_db_service: XMLDatabaseService):
        self.xml_db_service = xml_db_service
    
    def get_today_summary(self) -> Dict:
        """
        Generate comprehensive daily summary
        Returns summary data including totals, category breakdown, and timing info
        """
        try:
            bills = self.xml_db_service.get_today_bills()
            
            if not bills:
                return {
                    "date": date.today().strftime("%Y-%m-%d"),
                    "total_bills": 0,
                    "total_sales": 0.0,
                    "category_totals": {},
                    "first_bill_time": None,
                    "last_bill_time": None,
                    "average_bill_value": 0.0
                }
            
            # Calculate basic totals
            total_bills = len(bills)
            total_sales = sum(bill['total'] for bill in bills)
            average_bill_value = total_sales / total_bills if total_bills > 0 else 0.0
            
            # Get timing info
            times = [bill['time'] for bill in bills]
            first_bill_time = min(times) if times else None
            last_bill_time = max(times) if times else None
            
            # Calculate category totals
            category_totals = self._calculate_category_totals(bills)
            
            # Get hourly sales breakdown
            hourly_sales = self._calculate_hourly_sales(bills)
            
            return {
                "date": date.today().strftime("%Y-%m-%d"),
                "total_bills": total_bills,
                "total_sales": total_sales,
                "category_totals": category_totals,
                "first_bill_time": first_bill_time,
                "last_bill_time": last_bill_time,
                "average_bill_value": average_bill_value,
                "hourly_sales": hourly_sales,
                "peak_hour": self._get_peak_hour(hourly_sales)
            }
            
        except Exception as e:
            print(f"Error generating today's summary: {e}")
            return {
                "date": date.today().strftime("%Y-%m-%d"),
                "total_bills": 0,
                "total_sales": 0.0,
                "category_totals": {},
                "first_bill_time": None,
                "last_bill_time": None,
                "average_bill_value": 0.0,
                "error": str(e)
            }
    
    def _calculate_category_totals(self, bills: List[Dict]) -> Dict[str, float]:
        """Calculate total sales per category"""
        category_totals = {}
        
        for bill in bills:
            for product in bill['products']:
                # Get product category from products database
                products = self.xml_db_service.get_all_products()
                product_category = "unknown"
                
                for prod in products:
                    if prod['product_id'] == product['product_id']:
                        product_category = prod['category']
                        break
                
                line_total = product['price'] * product['quantity']
                
                if product_category in category_totals:
                    category_totals[product_category] += line_total
                else:
                    category_totals[product_category] = line_total
        
        return category_totals
    
    def _calculate_hourly_sales(self, bills: List[Dict]) -> Dict[str, float]:
        """Calculate sales breakdown by hour"""
        hourly_sales = {}
        
        for bill in bills:
            try:
                # Extract hour from time (HH:MM:SS format)
                hour = int(bill['time'].split(':')[0])
                hour_key = f"{hour:02d}:00"
                
                if hour_key in hourly_sales:
                    hourly_sales[hour_key] += bill['total']
                else:
                    hourly_sales[hour_key] = bill['total']
                    
            except (ValueError, IndexError):
                continue
        
        return hourly_sales
    
    def _get_peak_hour(self, hourly_sales: Dict[str, float]) -> Optional[str]:
        """Get the hour with maximum sales"""
        if not hourly_sales:
            return None
        
        peak_hour = max(hourly_sales.items(), key=lambda x: x[1])
        return peak_hour[0]
    
    def get_summary_for_date(self, target_date: str) -> Dict:
        """
        Get summary for a specific date
        target_date format: YYYY-MM-DD
        """
        try:
            # This would require modifying XMLDatabaseService to load specific date files
            # For now, return today's summary if date matches today
            if target_date == date.today().strftime("%Y-%m-%d"):
                return self.get_today_summary()
            else:
                # TODO: Implement archive file reading for historical dates
                return {
                    "date": target_date,
                    "total_bills": 0,
                    "total_sales": 0.0,
                    "category_totals": {},
                    "first_bill_time": None,
                    "last_bill_time": None,
                    "average_bill_value": 0.0,
                    "message": "Historical data not implemented yet"
                }
                
        except Exception as e:
            print(f"Error getting summary for date {target_date}: {e}")
            return {
                "date": target_date,
                "total_bills": 0,
                "total_sales": 0.0,
                "category_totals": {},
                "first_bill_time": None,
                "last_bill_time": None,
                "average_bill_value": 0.0,
                "error": str(e)
            }
    
    def get_top_selling_products(self, limit: int = 10) -> List[Dict]:
        """Get top selling products for today"""
        try:
            bills = self.xml_db_service.get_today_bills()
            product_sales = {}
            
            for bill in bills:
                for product in bill['products']:
                    product_id = product['product_id']
                    quantity = product['quantity']
                    total = product['price'] * quantity
                    
                    if product_id in product_sales:
                        product_sales[product_id]['quantity'] += quantity
                        product_sales[product_id]['total'] += total
                    else:
                        product_sales[product_id] = {
                            'name': product['name'],
                            'quantity': quantity,
                            'total': total
                        }
            
            # Sort by total sales and return top N
            sorted_products = sorted(
                product_sales.items(), 
                key=lambda x: x[1]['total'], 
                reverse=True
            )
            
            result = []
            for product_id, data in sorted_products[:limit]:
                result.append({
                    'product_id': product_id,
                    'name': data['name'],
                    'quantity_sold': data['quantity'],
                    'total_sales': data['total']
                })
            
            return result
            
        except Exception as e:
            print(f"Error getting top selling products: {e}")
            return []
