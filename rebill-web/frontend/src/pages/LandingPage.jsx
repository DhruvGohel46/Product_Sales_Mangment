import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, Zap, Shield, BarChart3, Smartphone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

const LandingPage = () => {
    return (
        <div className="overflow-hidden">
            {/* Hero Section */}
            <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
                <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={containerVariants}
                        className="max-w-4xl mx-auto"
                    >
                        <motion.div variants={itemVariants} className="inline-flex items-center px-4 py-1.5 rounded-full border border-primary/20 bg-primary/10 text-primary text-sm font-medium mb-8">
                            <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
                            New Version 2.0 Now Available
                        </motion.div>

                        <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground mb-8 leading-tight">
                            Billing made <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">effortless</span> <br />
                            for modern shops.
                        </motion.h1>

                        <motion.p variants={itemVariants} className="mt-4 text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
                            Manage sales, track inventory, and generate reports with a POS system designed for speed, simplicity, and scale.
                        </motion.p>

                        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-center gap-4">
                            <Link to="/register">
                                <Button size="lg" className="text-lg px-8 h-14 rounded-full shadow-xl shadow-primary/20">
                                    Start Free Trial <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </Link>
                            <Link to="/features">
                                <Button variant="outline" size="lg" className="text-lg px-8 h-14 rounded-full bg-background/50 backdrop-blur-sm">
                                    View Live Demo
                                </Button>
                            </Link>
                        </motion.div>
                    </motion.div>

                    {/* Hero Image Mockup */}
                    <motion.div
                        initial={{ opacity: 0, y: 100, rotateX: 20 }}
                        animate={{ opacity: 1, y: 0, rotateX: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="mt-20 relative mx-auto max-w-5xl perspective-1000"
                    >
                        <div className="rounded-xl bg-background border border-border shadow-2xl overflow-hidden aspect-video relative group">
                            {/* Mock UI content */}
                            <div className="absolute inset-x-0 top-0 h-8 bg-muted flex items-center px-4 space-x-2 border-b border-border">
                                <div className="h-3 w-3 rounded-full bg-red-400"></div>
                                <div className="h-3 w-3 rounded-full bg-yellow-400"></div>
                                <div className="h-3 w-3 rounded-full bg-green-400"></div>
                            </div>
                            <div className="p-8 mt-8 grid grid-cols-12 gap-6 h-full bg-muted/20">
                                {/* Sidebar */}
                                <div className="col-span-2 space-y-3">
                                    {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-8 bg-muted rounded-md w-full animate-pulse" style={{ animationDelay: `${i * 0.1}s` }}></div>)}
                                </div>
                                {/* Main Content */}
                                <div className="col-span-10 space-y-6">
                                    <div className="flex justify-between">
                                        <div className="h-10 bg-muted rounded-md w-1/3"></div>
                                        <div className="h-10 bg-primary/20 rounded-md w-1/4"></div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4">
                                        {[1, 2, 3].map(i => <div key={i} className="h-32 bg-background border border-border rounded-xl shadow-sm"></div>)}
                                    </div>
                                    <div className="h-64 bg-background border border-border rounded-xl shadow-sm"></div>
                                </div>
                            </div>

                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Button size="lg" variant="secondary" className="font-bold">Explore Dashboard</Button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-32 bg-muted/30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-20">
                        <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-4">Everything you need to grow</h2>
                        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Powerful features packaged in a simple, intuitive interface that your team will actually enjoy using.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { icon: Zap, title: 'Lightning Fast', desc: 'Optimized for speed. Process transactions in seconds, not minutes.' },
                            { icon: BarChart3, title: 'Real-time Analytics', desc: 'Track sales, profits, and inventory movement as they happen.' },
                            { icon: Shield, title: 'Secure & Reliable', desc: 'Enterprise-grade encryption keeps your business data safe.' },
                            { icon: Smartphone, title: 'Mobile Ready', desc: 'Manage your shop from anywhere with our responsive mobile app.' },
                            { icon: CheckCircle2, title: 'Inventory Control', desc: 'Automatic stock updates and low-inventory alerts.' },
                            { icon: ArrowRight, title: 'And much more', desc: 'Explore all features in our detailed documentation.' }
                        ].map((feature, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                viewport={{ once: true }}
                            >
                                <Card className="h-full hover:border-primary/50 transition-colors">
                                    <CardContent className="pt-8">
                                        <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-6">
                                            <feature.icon className="h-6 w-6" />
                                        </div>
                                        <h3 className="text-xl font-bold text-foreground mb-3">{feature.title}</h3>
                                        <p className="text-muted-foreground">{feature.desc}</p>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing Preview */}
            <section className="py-32">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-foreground mb-4">Simple, transparent pricing</h2>
                    <p className="text-muted-foreground mb-12">Start for free, upgrade as you grow.</p>
                    <Link to="/pricing">
                        <Button variant="outline" size="lg" className="rounded-full">
                            View Full Pricing
                        </Button>
                    </Link>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 relative overflow-hidden">
                <div className="absolute inset-0 bg-primary"></div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-primary-foreground">
                    <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to transform your shop?</h2>
                    <p className="text-xl opacity-90 mb-10 max-w-2xl mx-auto">Join thousands of shop owners who trust ReBill for their daily operations.</p>
                    <Link to="/register">
                        <Button size="lg" variant="secondary" className="text-lg px-10 h-16 rounded-full font-bold shadow-2xl">
                            Get Started for Free
                        </Button>
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default LandingPage;
