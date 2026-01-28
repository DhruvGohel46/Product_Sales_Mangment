from datetime import datetime
from typing import Dict, List


class PrinterService:
    """Thermal printer service for bill printing"""
    
    def __init__(self):
        # Printer configuration (can be modified based on actual printer)
        self.max_chars_per_line = 32
        self.shop_name = "FAST FOOD SHOP"
        self.shop_address = "Your Address Here"
        self.shop_phone = "Phone: XXXXXXXXXX"
    
    def print_bill(self, bill_data: Dict) -> bool:
        """
        Print bill to thermal printer
        Returns True if successful, False otherwise
        """
        try:
            # Generate bill text
            bill_text = self._generate_bill_text(bill_data)
            
            # In production, this would send to actual thermal printer
            # For now, we'll just print to console (can be replaced with actual printer API)
            print("=== THERMAL PRINTER OUTPUT ===")
            print(bill_text)
            print("=== END PRINTER OUTPUT ===")
            
            # TODO: Replace with actual thermal printer integration
            # Example: self._send_to_printer(bill_text)
            
            return True
            
        except Exception as e:
            print(f"Error printing bill: {e}")
            return False
    
    def _generate_bill_text(self, bill_data: Dict) -> str:
        """Generate formatted bill text for thermal printer"""
        lines = []
        
        # Header
        lines.append(self._center_text(self.shop_name))
        lines.append(self._center_text(self.shop_address))
        lines.append(self._center_text(self.shop_phone))
        lines.append(self._center_text("-" * self.max_chars_per_line))
        
        # Bill info
        lines.append(f"Bill No: {bill_data['bill_no']}")
        lines.append(f"Date: {bill_data['date']}")
        lines.append(f"Time: {bill_data['time']}")
        lines.append("-" * self.max_chars_per_line)
        
        # Product headers
        lines.append(f"{'Item':<15} {'Qty':<4} {'Price':<6} {'Total':<7}")
        lines.append("-" * self.max_chars_per_line)
        
        # Products
        for product in bill_data['products']:
            name = product['name'][:14]  # Truncate if too long
            qty = str(product['quantity'])
            price = f"{product['price']:.2f}"
            total = f"{product['price'] * product['quantity']:.2f}"
            
            lines.append(f"{name:<15} {qty:<4} {price:<6} {total:<7}")
        
        # Footer
        lines.append("-" * self.max_chars_per_line)
        lines.append(f"{'TOTAL:':<25} {bill_data['total']:.2f}")
        lines.append("-" * self.max_chars_per_line)
        lines.append(self._center_text("Thank You!"))
        lines.append(self._center_text("Visit Again"))
        
        # Add some blank lines for cutting
        lines.extend(["", "", ""])
        
        return "\n".join(lines)
    
    def _center_text(self, text: str) -> str:
        """Center text within max line width"""
        if len(text) >= self.max_chars_per_line:
            return text[:self.max_chars_per_line]
        
        padding = (self.max_chars_per_line - len(text)) // 2
        return " " * padding + text
    
    def _send_to_printer(self, text: str):
        """
        Send text to actual thermal printer
        This method should be implemented based on the specific printer model
        Examples:
        - USB printer: Use pyusb or similar
        - Network printer: Use socket connection
        - Windows printer: Use win32print
        """
        # Example implementation for Windows printer:
        # import win32print
        # printer_name = "Your Printer Name"
        # hPrinter = win32print.OpenPrinter(printer_name)
        # try:
        #     win32print.StartDocPrinter(hPrinter, 1, ("Bill", None, "RAW"))
        #     try:
        #         win32print.StartPagePrinter(hPrinter)
        #         win32print.WritePrinter(hPrinter, text.encode('utf-8'))
        #         win32print.EndPagePrinter(hPrinter)
        #     finally:
        #         win32print.EndDocPrinter(hPrinter)
        # finally:
        #     win32print.ClosePrinter(hPrinter)
        
        pass  # Placeholder for actual printer implementation
