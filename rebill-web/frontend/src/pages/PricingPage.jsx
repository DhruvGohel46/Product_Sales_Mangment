import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/Card';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';

const pricingPlans = [
    {
        name: "Starter",
        desc: "Perfect for small shops just getting started.",
        priceMonthly: 0,
        priceYearly: 0,
        features: [
            "Up to 100 bills/month",
            "Basic Inventory Management",
            "Single User",
            "Email Support",
            "Basic Reports"
        ],
        missing: ["Multi-store support", "Advanced Analytics", "Priority Support"],
        cta: "Start for Free",
        popular: false
    },
    {
        name: "Pro",
        desc: "For growing businesses that need more power.",
        priceMonthly: 999,
        priceYearly: 799,
        features: [
            "Unlimited bills",
            "Advanced Inventory & Alerts",
            "Up to 5 Users",
            "Priority Chat Support",
            "Advanced Analytics & Export",
            "GST Invoicing",
            "Customer Loyalty Program"
        ],
        missing: [],
        cta: "Start 14-Day Trial",
        popular: true
    },
    {
        name: "Enterprise",
        desc: "Custom solutions for large retail chains.",
        priceMonthly: 2499,
        priceYearly: 1999,
        features: [
            "Everything in Pro",
            "Unlimited Users & Stores",
            "Dedicated Account Manager",
            "Custom API Access",
            "White-labeling Options",
            "SLA Guarantee"
        ],
        missing: [],
        cta: "Contact Sales",
        popular: false
    }
];

const PricingPage = () => {
    const [isYearly, setIsYearly] = useState(true);

    return (
        <div className="pt-24 pb-20 overflow-hidden">
            {/* Header */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6"
                >
                    Simple, transparent pricing
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-xl text-muted-foreground max-w-3xl mx-auto mb-10"
                >
                    Choose the plan that's right for your business. No hidden fees. Cancel anytime.
                </motion.p>

                {/* Toggle */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex justify-center items-center space-x-4 mb-16"
                >
                    <span className={cn("text-lg font-medium transition-colors", !isYearly ? "text-foreground" : "text-muted-foreground")}>Monthly</span>
                    <button
                        onClick={() => setIsYearly(!isYearly)}
                        className="relative w-16 h-8 rounded-full bg-primary/20 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    >
                        <motion.div
                            className="absolute top-1 left-1 w-6 h-6 rounded-full bg-primary shadow-sm"
                            animate={{ x: isYearly ? 32 : 0 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                    </button>
                    <span className={cn("text-lg font-medium transition-colors", isYearly ? "text-foreground" : "text-muted-foreground")}>
                        Yearly <span className="text-xs font-bold text-green-600 bg-green-100 border border-green-200 px-2 py-0.5 rounded-full ml-1">Save 20%</span>
                    </span>
                </motion.div>
            </div>

            {/* Pricing Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid md:grid-cols-3 gap-8">
                    {pricingPlans.map((plan, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className={cn("relative", plan.popular && "md:-mt-8 md:mb-8")}
                        >
                            {plan.popular && (
                                <div className="absolute top-0 inset-x-0 -mt-3 flex justify-center z-10">
                                    <div className="bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider py-1 px-4 rounded-full shadow-lg">
                                        Most Popular
                                    </div>
                                </div>
                            )}
                            <Card className={cn(
                                "h-full flex flex-col transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 relative overflow-hidden",
                                plan.popular ? "border-primary/50 shadow-xl bg-card" : "border-border/50 bg-card/50 backdrop-blur-sm"
                            )}>
                                {plan.popular && <div className="absolute inset-0 bg-primary/5 pointer-events-none"></div>}
                                <CardHeader className="text-center pb-2">
                                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                                    <CardDescription>{plan.desc}</CardDescription>
                                </CardHeader>
                                <CardContent className="flex-grow text-center">
                                    <div className="my-6">
                                        <span className="text-4xl font-extrabold">
                                            ₹{isYearly ? plan.priceYearly : plan.priceMonthly}
                                        </span>
                                        <span className="text-muted-foreground">/month</span>
                                        {isYearly && plan.priceMonthly > 0 && (
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Billed ₹{plan.priceYearly * 12} yearly
                                            </p>
                                        )}
                                    </div>
                                    <div className="space-y-4 text-left">
                                        {plan.features.map((feature, i) => (
                                            <div key={i} className="flex items-center text-sm">
                                                <Check className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                                                <span>{feature}</span>
                                            </div>
                                        ))}
                                        {plan.missing.map((feature, i) => (
                                            <div key={i} className="flex items-center text-sm text-muted-foreground/50">
                                                <X className="h-4 w-4 mr-3 flex-shrink-0" />
                                                <span>{feature}</span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Link to="/register" className="w-full">
                                        <Button
                                            variant={plan.popular ? "default" : "outline"}
                                            className={cn("w-full py-6 font-bold", plan.popular && "shadow-lg shadow-primary/20")}
                                        >
                                            {plan.cta}
                                        </Button>
                                    </Link>
                                </CardFooter>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* FAQ */}
            <div className="max-w-3xl mx-auto px-4 mt-32">
                <h2 className="text-2xl font-bold text-center mb-12">Frequently Asked Questions</h2>
                <div className="space-y-6">
                    {[
                        { q: "Can I cancel anytime?", a: "Yes, you can cancel your subscription at any time. There are no lock-in contracts." },
                        { q: "Do you offer a free trial?", a: "We offer a 14-day free trial on our Pro plan, and a forever-free Starter plan." },
                        { q: "Is my data secure?", a: "Absolutely. We use industry-standard 256-bit encryption and automatic daily backups." }
                    ].map((faq, idx) => (
                        <div key={idx} className="border-b border-border pb-6">
                            <h3 className="text-lg font-medium mb-2">{faq.q}</h3>
                            <p className="text-muted-foreground">{faq.a}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PricingPage;
