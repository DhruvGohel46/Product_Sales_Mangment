import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    LayoutDashboard, ShoppingBag, Users, Settings, LogOut,
    Bell, Search, ChevronDown, Store, CreditCard, TrendingUp,
    Package, Activity
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { api } from '../services/api';
import { cn } from '../lib/utils';

const Sidebar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <div className="hidden md:flex flex-col w-64 bg-card border-r border-border h-screen fixed left-0 top-0">
            <div className="p-6 flex items-center space-x-2 border-b border-border/50">
                <div className="bg-primary text-primary-foreground p-1.5 rounded-md">
                    <Store className="h-5 w-5" />
                </div>
                <span className="text-xl font-bold">ReBill</span>
            </div>

            <div className="flex-grow py-6 px-3 space-y-1">
                {[
                    { icon: LayoutDashboard, label: 'Overview', active: true },
                    { icon: ShoppingBag, label: 'Orders', active: false },
                    { icon: Package, label: 'Inventory', active: false },
                    { icon: Users, label: 'Customers', active: false },
                    { icon: Activity, label: 'Reports', active: false },
                    { icon: Settings, label: 'Settings', active: false },
                ].map((item, idx) => (
                    <button
                        key={idx}
                        className={cn(
                            "w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                            item.active
                                ? "bg-primary/10 text-primary"
                                : "text-muted-foreground hover:bg-accent hover:text-foreground"
                        )}
                    >
                        <item.icon className="h-5 w-5" />
                        <span>{item.label}</span>
                    </button>
                ))}
            </div>

            <div className="p-4 border-t border-border/50">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
                >
                    <LogOut className="h-5 w-5" />
                    <span>Log Out</span>
                </button>
            </div>
        </div>
    );
};

const DashboardPage = () => {
    const [stats, setStats] = useState(null);
    const [shops, setShops] = useState([]);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [statsData, shopsData] = await Promise.all([
                    api.stats.get(),
                    api.shops.list()
                ]);
                setStats(statsData);
                setShops(shopsData);
                const userData = JSON.parse(localStorage.getItem('user'));
                if (userData) setUser(userData);
            } catch (error) {
                console.error("Failed to load dashboard data", error);
            }
        };
        loadData();
    }, []);

    return (
        <div className="min-h-screen bg-muted/20">
            <Sidebar />

            <div className="md:ml-64 p-8">
                {/* Top Bar */}
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold">Dashboard</h1>
                        <p className="text-muted-foreground">Welcome back, {user?.name || 'Owner'}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="relative hidden md:block">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="pl-9 pr-4 py-2 rounded-full border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary w-64"
                            />
                        </div>
                        <Button variant="outline" size="icon" className="rounded-full">
                            <Bell className="h-4 w-4" />
                        </Button>
                        <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                            {user?.name?.[0] || 'U'}
                        </div>
                    </div>
                </header>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                            <span className="text-green-600 font-bold bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded text-xs">
                                +{stats?.growth}%
                            </span>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">₹{stats?.totalSales.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">from last month</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.totalBills}</div>
                            <p className="text-xs text-muted-foreground">+180 from last month</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Stores</CardTitle>
                            <Store className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{shops.length}</div>
                            <p className="text-xs text-muted-foreground">All systems operational</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {/* Main Chart Area (Mock) */}
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle>Overview</CardTitle>
                            <CardDescription>Monthly revenue overview.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px] w-full bg-muted/30 rounded-lg flex items-end justify-between p-4 space-x-2">
                                {[35, 45, 30, 60, 55, 70, 65, 80, 75, 90, 85, 95].map((h, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ height: 0 }}
                                        animate={{ height: `${h}%` }}
                                        transition={{ delay: i * 0.05, duration: 0.5 }}
                                        className="w-full bg-primary/80 rounded-t-sm hover:bg-primary transition-colors"
                                    ></motion.div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Right Column */}
                    <div className="space-y-8">
                        {/* Shop Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Your Shops</CardTitle>
                                <CardDescription>Manage your store locations.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {shops.map(shop => (
                                    <div key={shop.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                                        <div className="flex items-center space-x-3">
                                            <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                                                <Store className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="font-medium">{shop.name}</p>
                                                <p className="text-xs text-muted-foreground">{shop.city}</p>
                                            </div>
                                        </div>
                                        <span className={cn(
                                            "h-2.5 w-2.5 rounded-full",
                                            shop.status === 'active' ? "bg-green-500" : "bg-gray-300"
                                        )}></span>
                                    </div>
                                ))}
                                <Button variant="outline" className="w-full">Add New Shop</Button>
                            </CardContent>
                        </Card>

                        {/* Subscription */}
                        <Card className="bg-primary text-primary-foreground border-none">
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <CreditCard className="h-5 w-5" />
                                    <span>Pro Plan</span>
                                </CardTitle>
                                <CardDescription className="text-primary-foreground/80">
                                    Your subscription is active.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="text-sm opacity-90 mb-4">
                                    Next billing date: <strong>March 1, 2026</strong>
                                </div>
                                <Button variant="secondary" className="w-full">Manage Subscription</Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
