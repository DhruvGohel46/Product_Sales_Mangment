import { motion } from 'framer-motion';
import {
    Zap, BarChart3, Shield, Smartphone, users,
    CheckCircle2, Box, FileText, Database, Globe
} from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Link } from 'react-router-dom';

const features = [
    {
        icon: Zap,
        title: "Lightning Fast POS",
        description: "Process transactions in milliseconds. Designed for high-volume retail environments where speed is critical."
    },
    {
        icon: BarChart3,
        title: "Real-time Analytics",
        description: "Watch your sales, profit margins, and inventory levels update in real-time as you sell."
    },
    {
        icon: Shield,
        title: "Enterprise Security",
        description: "Bank-grade encryption, automatic backups, and role-based access control to keep your data safe."
    },
    {
        icon: Smartphone,
        title: "Mobile Dashboard",
        description: "Monitor your shop's performance from anywhere in the world with our dedicated mobile app."
    },
    {
        icon: Box,
        title: "Inventory Management",
        description: "Smart inventory tracking with low-stock alerts, barcode scanning, and supplier management."
    },
    {
        icon: FileText,
        title: "GST Compliant Billing",
        description: "Generate GST-compliant invoices automatically. Customize bill formats to match your brand."
    },
    {
        icon: Database,
        title: "Customer Database",
        description: "Build a loyal customer base with built-in CRM features. Track purchase history and preferences."
    },
    {
        icon: Globe,
        title: "Multi-Store Support",
        description: "Manage multiple outlets from a single dashboard. Transfer stock between stores seamlessly."
    }
];

const FeaturesPage = () => {
    return (
        <div className="pt-24 pb-20 overflow-hidden">
            {/* Header */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-20">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6"
                >
                    Powerful features for <span className="text-primary">modern retail</span>
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-xl text-muted-foreground max-w-3xl mx-auto"
                >
                    Everything you need to run your business efficiently, packaged in a beautiful interface that anyone can use.
                </motion.p>
            </div>

            {/* Feature Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-32">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map((feature, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.05 }}
                        >
                            <Card className="h-full hover:shadow-lg transition-all duration-300 border-border/50 bg-card/50 backdrop-blur-sm">
                                <CardContent className="pt-6">
                                    <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-4">
                                        <feature.icon className="h-6 w-6" />
                                    </div>
                                    <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                                    <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Deep Dive Section */}
            <div className="bg-muted/30 py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="text-3xl font-bold mb-6">Inventory management that thinks for you</h2>
                            <div className="space-y-4">
                                {[
                                    "Real-time stock updates across all channels",
                                    "Automatic low-stock notifications",
                                    "Purchase order generation based on sales velocity",
                                    "Barcode scanner integration"
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center space-x-3">
                                        <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                                        <span className="text-lg text-foreground/80">{item}</span>
                                    </div>
                                ))}
                            </div>
                            <Link to="/register">
                                <Button className="mt-8" size="lg">Try Inventory Management</Button>
                            </Link>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="bg-background rounded-2xl shadow-2xl border border-border p-2 aspect-video relative overflow-hidden"
                        >
                            <div className="absolute inset-x-0 top-0 h-8 bg-muted border-b border-border flex items-center px-4 space-x-2">
                                <div className="h-3 w-3 rounded-full bg-red-400"></div>
                                <div className="h-3 w-3 rounded-full bg-yellow-400"></div>
                                <div className="h-3 w-3 rounded-full bg-green-400"></div>
                            </div>
                            {/* Mock Inventory UI */}
                            <div className="mt-8 p-6 space-y-4">
                                <div className="flex justify-between items-center mb-6">
                                    <div className="h-8 w-32 bg-muted rounded"></div>
                                    <div className="h-8 w-24 bg-primary/20 rounded"></div>
                                </div>
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="flex items-center justify-between py-2 border-b border-border/50">
                                        <div className="flex items-center space-x-4">
                                            <div className="h-10 w-10 bg-muted rounded-md"></div>
                                            <div className="space-y-2">
                                                <div className="h-3 w-24 bg-muted rounded"></div>
                                                <div className="h-2 w-16 bg-muted/50 rounded"></div>
                                            </div>
                                        </div>
                                        <div className="h-6 w-12 bg-green-100 dark:bg-green-900 rounded-full"></div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* CTA */}
            <div className="max-w-4xl mx-auto text-center px-4 py-24">
                <h2 className="text-3xl font-bold mb-6">Ready to experience the difference?</h2>
                <Link to="/register">
                    <Button size="lg" className="px-10 h-14 text-lg rounded-full">Get Started Today</Button>
                </Link>
            </div>
        </div>
    );
};

export default FeaturesPage;
