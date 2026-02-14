import { Rocket, Github, Twitter, Linkedin } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-background border-t border-border pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <div className="bg-primary text-primary-foreground p-1.5 rounded-md">
                                <Rocket className="h-5 w-5" />
                            </div>
                            <span className="text-xl font-bold">ReBill</span>
                        </div>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                            The modern POS system designed for speed, reliability, and growth. Built for the future of retail.
                        </p>
                        <div className="flex space-x-4">
                            {[Twitter, Github, Linkedin].map((Icon, idx) => (
                                <a key={idx} href="#" className="text-muted-foreground hover:text-primary transition-colors">
                                    <Icon className="h-5 w-5" />
                                </a>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-6">Product</h4>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <li><Link to="/features" className="hover:text-primary transition-colors">Features</Link></li>
                            <li><Link to="/pricing" className="hover:text-primary transition-colors">Pricing</Link></li>
                            <li><Link to="/download" className="hover:text-primary transition-colors">Download</Link></li>
                            <li><Link to="/changelog" className="hover:text-primary transition-colors">Changelog</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-6">Resources</h4>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <li><Link to="/docs" className="hover:text-primary transition-colors">Documentation</Link></li>
                            <li><Link to="/api" className="hover:text-primary transition-colors">API Reference</Link></li>
                            <li><Link to="/blog" className="hover:text-primary transition-colors">Blog</Link></li>
                            <li><Link to="/community" className="hover:text-primary transition-colors">Community</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-6">Legal</h4>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <li><Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                            <li><Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
                    <p>&copy; {new Date().getFullYear()} ReBill POS. All rights reserved.</p>
                    <div className="flex items-center space-x-2">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        <span>All systems operational</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
