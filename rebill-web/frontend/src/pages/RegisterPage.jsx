import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Rocket, Mail, Lock, User, Loader2, ArrowRight, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/Card';
import { api } from '../services/api';

const RegisterPage = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await api.auth.register(formData);
            // In a real app, maybe auto-login or redirect to login. 
            // Here we'll redirect to login for flow demonstration.
            navigate('/login');
        } catch (err) {
            setError(err.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-primary/5 via-background to-background"></div>

            <div className="w-full max-w-5xl grid md:grid-cols-2 gap-8 items-center">
                {/* Left side - Marketing Copy */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    className="hidden md:block space-y-8 pr-8"
                >
                    <div className="inline-flex items-center px-3 py-1 rounded-full border border-primary/20 bg-primary/10 text-primary text-sm font-medium">
                        <span className="flex h-2 w-2 rounded-full bg-primary mr-2"></span>
                        Trusted by 10,000+ shops
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
                        Start managing your shop like a <span className="text-primary">pro</span>.
                    </h1>
                    <p className="text-lg text-muted-foreground">
                        Join thousands of business owners who rely on ReBill for inventory tracking, invoicing, and real-time analytics.
                    </p>

                    <div className="space-y-4">
                        {[
                            "14-day free trial, no credit card required",
                            "Instant setup - start selling in minutes",
                            "24/7 priority support included",
                            "Automatic daily backups"
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 + (i * 0.1) }}
                                className="flex items-center space-x-3"
                            >
                                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-500/10 flex items-center justify-center text-green-600">
                                    <Check className="h-3.5 w-3.5" />
                                </div>
                                <span className="text-foreground/80">{item}</span>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Right side - Form */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <Card className="border-border/50 shadow-2xl backdrop-blur-sm bg-card/50">
                        <CardHeader className="space-y-1">
                            <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
                            <CardDescription>
                                Enter your details to start your 14-day free trial
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <div className="relative">
                                        <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                        <Input
                                            type="text"
                                            name="name"
                                            placeholder="Full Name"
                                            className="pl-10"
                                            required
                                            value={formData.name}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                        <Input
                                            type="email"
                                            name="email"
                                            placeholder="name@example.com"
                                            className="pl-10"
                                            required
                                            value={formData.email}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                        <Input
                                            type="password"
                                            name="password"
                                            placeholder="Create a password"
                                            className="pl-10"
                                            required
                                            value={formData.password}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground ml-1">
                                        Must be at least 8 characters long
                                    </p>
                                </div>

                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="p-3 rounded-md bg-destructive/10 text-destructive text-sm font-medium text-center"
                                    >
                                        {error}
                                    </motion.div>
                                )}

                                <Button className="w-full font-bold h-11" type="submit" disabled={loading}>
                                    {loading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Creating account...
                                        </>
                                    ) : (
                                        <>
                                            Get Started <ArrowRight className="ml-2 h-4 w-4" />
                                        </>
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                        <CardFooter className="justify-center">
                            <p className="text-sm text-muted-foreground">
                                Already have an account?{' '}
                                <Link to="/login" className="font-semibold text-primary hover:underline">
                                    Sign in
                                </Link>
                            </p>
                        </CardFooter>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
};

export default RegisterPage;
