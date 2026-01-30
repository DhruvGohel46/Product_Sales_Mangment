from datetime import datetime
from typing import Dict, List
import win32print



class PrinterService:
    """Thermal printer service for bill printing"""
    
    def __init__(self):
        # Printer configuration for TVS Champ RP Series
        self.max_chars_per_line = 48  # 80mm paper width at 203 DPI (approx 48 characters)
        self.shop_name = "Burger Bhau(Kothariya)"
        self.printer_name = self._find_champ_printer()
        self.has_cutter = True  # TVS Champ RP has built-in cutter
    
    def _find_champ_printer(self):
        """Find Champ RP Series printer from available printers"""
        try:
            printers = win32print.EnumPrinters(win32print.PRINTER_ENUM_LOCAL | win32print.PRINTER_ENUM_CONNECTIONS)
            for printer in printers:
                printer_name = printer[2]  # Printer name is at index 2
                if 'champ' in printer_name.lower() or 'rp' in printer_name.lower():
                    print(f"Found Champ printer: {printer_name}")
                    return printer_name
            
            # If no Champ printer found, use default printer
            default_printer = win32print.GetDefaultPrinter()
            print(f"Champ printer not found, using default: {default_printer}")
            return default_printer
        except Exception as e:
            print(f"Error finding printer: {e}")
            return None
    
    def print_bill(self, bill_data: Dict) -> bool:
        """
        Print bill to thermal printer
        Returns True if successful, False otherwise
        """
        try:
            # Generate bill text
            bill_text = self._generate_bill_text(bill_data)
            
            # Print to actual thermal printer
            if self.printer_name:
                success = self._send_to_printer(bill_text)
                if success:
                    print(f"Bill {bill_data['bill_no']} printed successfully to {self.printer_name}")
                    return True
                else:
                    print(f"Failed to print bill to {self.printer_name}")
                    return False
            else:
                print("No printer available, falling back to console output")
                print("=== THERMAL PRINTER OUTPUT ===")
                print(bill_text)
                print("=== END PRINTER OUTPUT ===")
                return True
            
        except Exception as e:
            print(f"Error printing bill: {e}")
            return False
    
    def _generate_bill_text(self, bill_data: Dict) -> str:
        """Generate formatted bill text for TVS Champ RP thermal printer"""
        lines = []
        
        # Header with TVS Champ RP optimized formatting
        lines.append(self._center_text(self.shop_name))
        lines.append(self._center_text("=" * self.max_chars_per_line))
        lines.extend([""])
        
        # Bill info in single row for efficient paper usage
        bill_info = f"Bill No: {bill_data['bill_no']}    Date: {bill_data['date']}    Time: {bill_data['time']}"
        lines.append(bill_info)
        lines.append("=" * self.max_chars_per_line)
        
        # Product headers optimized for 48-character width
        lines.append(f"{'Item':<25} {'Qty':<4} {'Price':<9} {'Total':<10}")
        lines.append("-" * self.max_chars_per_line)
        
        # Products
        for product in bill_data['products']:
            name = product['name'][:24]  # Truncate if too long
            qty = str(product['quantity'])
            price = f"{product['price']:.2f}"
            total = f"{product['price'] * product['quantity']:.2f}"
            
            lines.append(f"{name:<25} {qty:<4} {price:<9} {total:<10}")
        
        # Footer
        lines.append("-" * self.max_chars_per_line)
        lines.append(f"{'TOTAL:':<38} {bill_data['total']:.2f}")
        lines.append("=" * self.max_chars_per_line)
        lines.append(self._center_text("Thank You!"))
        lines.append(self._center_text("Visit Again"))
        
        # Add feed lines for cutting (more space for cutter)
        lines.extend([""])
        
        return "\n".join(lines)
    
    def _center_text(self, text: str) -> str:
        """Center text within max line width"""
        if len(text) >= self.max_chars_per_line:
            text = text[:self.max_chars_per_line]
        
        padding = (self.max_chars_per_line - len(text)) // 2
        return " " * padding + text
    
    def _send_to_printer(self, text: str) -> bool:
        """
        Send text to TVS Champ RP thermal printer using Windows API
        Includes printer-specific commands and automatic paper cutting
        """
        try:
            # Open printer
            hPrinter = win32print.OpenPrinter(self.printer_name)
            
            try:
                # Start document
                win32print.StartDocPrinter(hPrinter, 1, ("Bill", None, "RAW"))
                
                try:
                    # Start page
                    win32print.StartPagePrinter(hPrinter)
                    
                    # TVS Champ RP specific initialization commands
                    init_commands = b'\x1B@'  # Initialize printer
                    
                    # Set character size to normal with bold
                    char_size_cmd = b'\x1B!\x18'  # Bold text
                    
                    # Convert text to bytes with proper encoding
                    text_bytes = text.encode('utf-8')
                    
                    # Add paper feed lines before cutting (4 lines)
                    feed_lines = b'\x1B\x64\x04'
                    
                    # Paper cut command (GS V m n) - full cut
                    if self.has_cutter:
                        cut_command = b'\x1D\x56\x00'  # Full cut
                    else:
                        cut_command = b''  # No cutter
                    
                    # Combine all commands
                    full_command = init_commands + char_size_cmd + text_bytes + feed_lines + cut_command
                    
                    # Send to printer
                    win32print.WritePrinter(hPrinter, full_command)
                    
                    # End page
                    win32print.EndPagePrinter(hPrinter)
                    
                finally:
                    # End document
                    win32print.EndDocPrinter(hPrinter)
                    
            finally:
                # Close printer
                win32print.ClosePrinter(hPrinter)
                
            return True
            
        except Exception as e:
            print(f"Error sending to printer: {e}")
            return False
