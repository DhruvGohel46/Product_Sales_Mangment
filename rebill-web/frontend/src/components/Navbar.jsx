import { Link } from 'react-router-dom';
import { Rocket } from 'lucide-react';

const Navbar = () => {
    return (
        <nav className="border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center space-x-2">
                            <Rocket className="h-8 w-8 text-blue-600" />
                            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                ReBill POS
                            </span>
                        </Link>
                    </div>
                    <div className="hidden md:flex items-center space-x-8">
                        <Link to="/" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-white transition-colors">Features</Link>
                        <Link to="/" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-white transition-colors">Pricing</Link>
                        <Link to="/" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-white transition-colors">Download</Link>
                        <Link to="/login" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-white font-medium transition-colors">Login</Link>
                        <Link to="/register" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-full transition-all transform hover:scale-105 shadow-lg shadow-blue-500/30">
                            Get Started
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
