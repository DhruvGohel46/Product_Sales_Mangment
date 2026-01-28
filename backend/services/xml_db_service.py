import xml.etree.ElementTree as ET
import xml.dom.minidom as minidom
import os
from datetime import datetime, date
from typing import List, Dict, Optional
import shutil


class XMLDatabaseService:
    """XML-based database service for POS system"""
    
    def __init__(self, data_dir: str = "data"):
        self.data_dir = data_dir
        self.products_file = os.path.join(data_dir, "products.xml")
        self.bills_dir = os.path.join(data_dir, "bills")
        self.archive_dir = os.path.join(data_dir, "archive")
        
        # Ensure directories exist
        os.makedirs(self.bills_dir, exist_ok=True)
        os.makedirs(self.archive_dir, exist_ok=True)
        
        # Initialize products file if it doesn't exist
        self._init_products_file()
    
    def _init_products_file(self):
        """Initialize products.xml file if it doesn't exist"""
        if not os.path.exists(self.products_file):
            root = ET.Element("products")
            self._save_xml(self.products_file, root)
    
    def _save_xml(self, filepath: str, root: ET.Element):
        """Save XML element to file with proper formatting"""
        rough_string = ET.tostring(root, 'utf-8')
        reparsed = minidom.parseString(rough_string)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(reparsed.toprettyxml(indent="  "))
    
    def _load_xml(self, filepath: str) -> ET.Element:
        """Load XML file and return root element"""
        if not os.path.exists(filepath):
            raise FileNotFoundError(f"XML file not found: {filepath}")
        
        tree = ET.parse(filepath)
        return tree.getroot()
    
    def _get_today_bills_file(self) -> str:
        """Get today's bills XML file path"""
        today = date.today().strftime("%Y-%m-%d")
        return os.path.join(self.bills_dir, f"{today}.xml")
    
    def _archive_yesterday_bills(self):
        """Move yesterday's bills to archive directory"""
        yesterday = (date.today().replace(day=date.today().day-1)).strftime("%Y-%m-%d")
        yesterday_file = os.path.join(self.bills_dir, f"{yesterday}.xml")
        archive_file = os.path.join(self.archive_dir, f"{yesterday}.xml")
        
        if os.path.exists(yesterday_file):
            shutil.move(yesterday_file, archive_file)
    
    def _init_today_bills_file(self):
        """Initialize today's bills file if it doesn't exist"""
        # Archive yesterday's bills first
        self._archive_yesterday_bills()
        
        today_file = self._get_today_bills_file()
        if not os.path.exists(today_file):
            root = ET.Element("bills")
            root.set("date", date.today().strftime("%Y-%m-%d"))
            self._save_xml(today_file, root)
    
    # Product Management Methods
    
    def add_product(self, product_id: str, name: str, price: float, category: str) -> bool:
        """Add a new product"""
        try:
            root = self._load_xml(self.products_file)
            
            # Check if product already exists
            for product in root.findall("product"):
                if product.get("id") == product_id:
                    return False
            
            # Add new product
            product_elem = ET.SubElement(root, "product")
            product_elem.set("id", product_id)
            
            name_elem = ET.SubElement(product_elem, "name")
            name_elem.text = name
            
            price_elem = ET.SubElement(product_elem, "price")
            price_elem.text = str(price)
            
            category_elem = ET.SubElement(product_elem, "category")
            category_elem.text = category
            
            active_elem = ET.SubElement(product_elem, "active")
            active_elem.text = "true"
            
            self._save_xml(self.products_file, root)
            return True
            
        except Exception as e:
            print(f"Error adding product: {e}")
            return False
    
    def get_all_products(self) -> List[Dict]:
        """Get all active products"""
        try:
            root = self._load_xml(self.products_file)
            products = []
            
            for product in root.findall("product"):
                active = product.find("active").text.lower() == "true"
                if active:
                    products.append({
                        "product_id": product.get("id"),
                        "name": product.find("name").text,
                        "price": float(product.find("price").text),
                        "category": product.find("category").text,
                        "active": active
                    })
            
            return products
            
        except Exception as e:
            print(f"Error getting products: {e}")
            return []
    
    def update_product(self, product_id: str, name: str = None, price: float = None, 
                      category: str = None, active: bool = None) -> bool:
        """Update product details"""
        try:
            root = self._load_xml(self.products_file)
            
            for product in root.findall("product"):
                if product.get("id") == product_id:
                    if name is not None:
                        product.find("name").text = name
                    if price is not None:
                        product.find("price").text = str(price)
                    if category is not None:
                        product.find("category").text = category
                    if active is not None:
                        product.find("active").text = str(active).lower()
                    
                    self._save_xml(self.products_file, root)
                    return True
            
            return False
            
        except Exception as e:
            print(f"Error updating product: {e}")
            return False
    
    # Bill Management Methods
    
    def create_bill(self, bill_no: int, products: List[Dict], total: float) -> bool:
        """Create a new bill"""
        try:
            self._init_today_bills_file()
            root = self._load_xml(self._get_today_bills_file())
            
            # Add new bill
            bill_elem = ET.SubElement(root, "bill")
            bill_elem.set("no", str(bill_no))
            
            date_elem = ET.SubElement(bill_elem, "date")
            date_elem.text = date.today().strftime("%Y-%m-%d")
            
            time_elem = ET.SubElement(bill_elem, "time")
            time_elem.text = datetime.now().strftime("%H:%M:%S")
            
            products_elem = ET.SubElement(bill_elem, "products")
            for product in products:
                product_elem = ET.SubElement(products_elem, "product")
                product_elem.set("id", product["product_id"])
                
                name_elem = ET.SubElement(product_elem, "name")
                name_elem.text = product["name"]
                
                price_elem = ET.SubElement(product_elem, "price")
                price_elem.text = str(product["price"])
                
                qty_elem = ET.SubElement(product_elem, "quantity")
                qty_elem.text = str(product["quantity"])
            
            total_elem = ET.SubElement(bill_elem, "total")
            total_elem.text = str(total)
            
            self._save_xml(self._get_today_bills_file(), root)
            return True
            
        except Exception as e:
            print(f"Error creating bill: {e}")
            return False
    
    def get_bill(self, bill_no: int) -> Optional[Dict]:
        """Get a specific bill by number"""
        try:
            today_file = self._get_today_bills_file()
            if not os.path.exists(today_file):
                return None
            
            root = self._load_xml(today_file)
            
            for bill in root.findall("bill"):
                if bill.get("no") == str(bill_no):
                    products = []
                    for product in bill.find("products").findall("product"):
                        products.append({
                            "product_id": product.get("id"),
                            "name": product.find("name").text,
                            "price": float(product.find("price").text),
                            "quantity": int(product.find("quantity").text)
                        })
                    
                    return {
                        "bill_no": int(bill.get("no")),
                        "date": bill.find("date").text,
                        "time": bill.find("time").text,
                        "products": products,
                        "total": float(bill.find("total").text)
                    }
            
            return None
            
        except Exception as e:
            print(f"Error getting bill: {e}")
            return None
    
    def get_today_bills(self) -> List[Dict]:
        """Get all bills for today"""
        try:
            today_file = self._get_today_bills_file()
            if not os.path.exists(today_file):
                return []
            
            root = self._load_xml(today_file)
            bills = []
            
            for bill in root.findall("bill"):
                products = []
                for product in bill.find("products").findall("product"):
                    products.append({
                        "product_id": product.get("id"),
                        "name": product.find("name").text,
                        "price": float(product.find("price").text),
                        "quantity": int(product.find("quantity").text)
                    })
                
                bills.append({
                    "bill_no": int(bill.get("no")),
                    "date": bill.find("date").text,
                    "time": bill.find("time").text,
                    "products": products,
                    "total": float(bill.find("total").text)
                })
            
            return bills
            
        except Exception as e:
            print(f"Error getting today's bills: {e}")
            return []
    
    def get_next_bill_number(self) -> int:
        """Get next bill number for today"""
        try:
            self._init_today_bills_file()
            root = self._load_xml(self._get_today_bills_file())
            
            bills = root.findall("bill")
            if not bills:
                return 1
            
            max_bill_no = 0
            for bill in bills:
                bill_no = int(bill.get("no"))
                if bill_no > max_bill_no:
                    max_bill_no = bill_no
            
            return max_bill_no + 1
            
        except Exception as e:
            print(f"Error getting next bill number: {e}")
            return 1
    
    def get_today_xml_content(self) -> str:
        """Get today's bills XML content as string"""
        try:
            today_file = self._get_today_bills_file()
            if not os.path.exists(today_file):
                return "<bills></bills>"
            
            with open(today_file, 'r', encoding='utf-8') as f:
                return f.read()
                
        except Exception as e:
            print(f"Error getting today's XML content: {e}")
            return "<bills></bills>"
