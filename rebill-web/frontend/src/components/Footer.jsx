import { Rocket } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className="flex items-center space-x-2 mb-4 md:mb-0">
                        <Rocket className="h-6 w-6 text-blue-600" />
                        <span className="text-lg font-bold text-gray-900 dark:text-white">ReBill POS</span>
                    </div>
                    <div className="text-gray-500 dark:text-gray-400 text-sm">
                        &copy; {new Date().getFullYear()} ReBill POS. All rights reserved.
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
