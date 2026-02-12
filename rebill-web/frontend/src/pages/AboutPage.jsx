import { motion } from 'framer-motion';
import { Card, CardContent } from '../components/ui/Card';
import { Users, Heart, Globe, Award } from 'lucide-react';

const AboutPage = () => {
    return (
        <div className="pt-24 pb-20">
            {/* Header */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-20">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6"
                >
                    We're building the <br />
                    <span className="text-primary">operating system for retail</span>.
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-xl text-muted-foreground max-w-3xl mx-auto"
                >
                    ReBill started with a simple mission: to empower small businesses with the same powerful tools used by retail giants.
                </motion.p>
            </div>

            {/* Stats */}
            <div className="bg-muted/30 py-16 mb-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        {[
                            { label: "Active Merchants", value: "10,000+" },
                            { label: "Transactions Processed", value: "$2B+" },
                            { label: "Cities", value: "500+" },
                            { label: "Customer Support", value: "24/7" }
                        ].map((stat, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, scale: 0.5 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.1 }}
                                viewport={{ once: true }}
                            >
                                <div className="text-4xl font-extrabold text-foreground mb-2">{stat.value}</div>
                                <div className="text-muted-foreground font-medium">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Values */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold mb-4">Our Core Values</h2>
                    <p className="text-muted-foreground">What drives us every single day.</p>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                    {[
                        { icon: Users, title: "Customer Obsessed", desc: "We don't just build software; we build relationships. Your success is our success." },
                        { icon: Heart, title: "Simplicity First", desc: "Complexity is the enemy of execution. We strive for radical simplicity in everything we do." },
                        { icon: Award, title: "Quality Matters", desc: "We sweat the small stuff. Every pixel, every interaction, every line of code matters." }
                    ].map((value, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.2 }}
                            viewport={{ once: true }}
                        >
                            <Card className="text-center h-full border-none shadow-none bg-transparent">
                                <CardContent className="pt-6">
                                    <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto mb-6">
                                        <value.icon className="h-8 w-8" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-3">{value.title}</h3>
                                    <p className="text-muted-foreground leading-relaxed">{value.desc}</p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Team (Placeholder) */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pb-20">
                <h2 className="text-3xl font-bold mb-12">Meet the Team</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="group">
                            <div className="aspect-square rounded-2xl bg-muted mb-4 overflow-hidden relative">
                                {/* Placeholder for team image */}
                                <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent group-hover:scale-110 transition-transform duration-500"></div>
                            </div>
                            <h3 className="font-bold text-lg">Team Member {i}</h3>
                            <p className="text-muted-foreground text-sm">Co-Founder</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AboutPage;
