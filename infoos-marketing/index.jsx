/**
 * ============================================================================= 
 * INFOOS MARKETING LANDING PAGE - Modern Restaurant POS Marketing
 * =============================================================================
 * 
 * Inspired by modern SaaS landing pages with:
 * - Hero section with gradient backgrounds
 * - Feature highlights with icons
 * - Pricing tiers
 * - Testimonials
 * - Statistics showcase
 * - Call-to-action sections
 * =============================================================================
 */

import React, { useState, useEffect } from 'react';
import './styles.css';

const InfoosMarketing = () => {
    const [activeTab, setActiveTab] = useState('features');
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="marketing-landing">
            {/* Navigation Header */}
            <header className={`nav-header ${scrolled ? 'scrolled' : ''}`}>
                <div className="nav-container">
                    <div className="nav-brand">
                        <div className="brand-logo">
                            <span className="brand-text">InfoOS</span>
                            <span className="brand-tag">POS</span>
                        </div>
                    </div>
                    <nav className="nav-menu">
                        <a href="#features" className="nav-link">Features</a>
                        <a href="#pricing" className="nav-link">Pricing</a>
                        <a href="#testimonials" className="nav-link">Testimonials</a>
                        <button className="nav-cta">Get Started Free</button>
                    </nav>
                </div>
            </header>

            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-background">
                    <div className="hero-gradient"></div>
                    <div className="hero-pattern"></div>
                </div>
                <div className="hero-container">
                    <div className="hero-content">
                        <div className="hero-badge">
                            <span className="badge-text">🚀 New: AI-Powered Inventory</span>
                        </div>
                        <h1 className="hero-title">
                            The Smart POS System for
                            <span className="title-highlight"> Modern Restaurants</span>
                        </h1>
                        <p className="hero-description">
                            Streamline your restaurant operations with intelligent inventory management, 
                            real-time analytics, and seamless customer experience. 
                            Join 1,000+ restaurants already growing with InfoOS.
                        </p>
                        <div className="hero-actions">
                            <button className="btn-primary">
                                Start Free Trial
                                <span className="btn-arrow">→</span>
                            </button>
                            <button className="btn-secondary">
                                <span className="play-icon">▶</span>
                                Watch Demo
                            </button>
                        </div>
                        <div className="hero-stats">
                            <div className="stat-item">
                                <span className="stat-number">1,000+</span>
                                <span className="stat-label">Restaurants</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-number">50K+</span>
                                <span className="stat-label">Daily Orders</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-number">4.9★</span>
                                <span className="stat-label">User Rating</span>
                            </div>
                        </div>
                    </div>
                    <div className="hero-visual">
                        <div className="hero-dashboard">
                            <div className="dashboard-header">
                                <div className="header-controls">
                                    <div className="control-dots">
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>
                                    <span className="dashboard-title">InfoOS Dashboard</span>
                                </div>
                            </div>
                            <div className="dashboard-content">
                                <div className="dashboard-stats">
                                    <div className="stat-card">
                                        <div className="stat-icon">💰</div>
                                        <div className="stat-info">
                                            <span className="stat-value">$12,450</span>
                                            <span className="stat-change">+12.5%</span>
                                        </div>
                                    </div>
                                    <div className="stat-card">
                                        <div className="stat-icon">📊</div>
                                        <div className="stat-info">
                                            <span className="stat-value">342</span>
                                            <span className="stat-change">+8.2%</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="dashboard-chart">
                                    <div className="chart-bars">
                                        <div className="bar" style={{height: '60%'}}></div>
                                        <div className="bar" style={{height: '80%'}}></div>
                                        <div className="bar" style={{height: '45%'}}></div>
                                        <div className="bar" style={{height: '90%'}}></div>
                                        <div className="bar" style={{height: '70%'}}></div>
                                        <div className="bar" style={{height: '85%'}}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="features-section">
                <div className="section-container">
                    <div className="section-header">
                        <div className="section-badge">
                            <span>✨ Features</span>
                        </div>
                        <h2 className="section-title">
                            Everything You Need to
                            <span className="title-highlight"> Grow Your Business</span>
                        </h2>
                        <p className="section-description">
                            Powerful tools designed specifically for restaurant success
                        </p>
                    </div>

                    <div className="features-tabs">
                        <div className="tab-nav">
                            {['POS System', 'Inventory', 'Expenses', 'Analytics', 'Staff'].map((tab) => (
                                <button
                                    key={tab}
                                    className={`tab-btn ${activeTab === tab.toLowerCase().replace(' ', '') ? 'active' : ''}`}
                                    onClick={() => setActiveTab(tab.toLowerCase().replace(' ', ''))}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        <div className="tab-content">
                            {activeTab === 'possystem' && (
                                <div className="feature-grid">
                                    <div className="feature-card">
                                        <div className="feature-icon">🎯</div>
                                        <h3>Lightning Fast Orders</h3>
                                        <p>Process orders in seconds with intuitive interface and smart suggestions</p>
                                    </div>
                                    <div className="feature-card">
                                        <div className="feature-icon">📱</div>
                                        <h3>Mobile Ready</h3>
                                        <p>Take orders anywhere with tablet and mobile optimization</p>
                                    </div>
                                    <div className="feature-card">
                                        <div className="feature-icon">🍽️</div>
                                        <h3>Menu Management</h3>
                                        <p>Easy menu updates with real-time synchronization across all devices</p>
                                    </div>
                                </div>
                            )}
                            
                            {activeTab === 'inventory' && (
                                <div className="feature-grid">
                                    <div className="feature-card">
                                        <div className="feature-icon">📦</div>
                                        <h3>Smart Tracking</h3>
                                        <p>AI-powered inventory tracking with automatic reorder alerts</p>
                                    </div>
                                    <div className="feature-card">
                                        <div className="feature-icon">🤖</div>
                                        <h3>Predictive Analytics</h3>
                                        <p>Forecast demand and reduce waste with intelligent insights</p>
                                    </div>
                                    <div className="feature-card">
                                        <div className="feature-icon">📉</div>
                                        <h3>Cost Control</h3>
                                        <p>Monitor food costs and optimize pricing strategies</p>
                                    </div>
                                </div>
                            )}
                            
                            {activeTab === 'expenses' && (
                                <div className="feature-grid">
                                    <div className="feature-card">
                                        <div className="feature-icon">💸</div>
                                        <h3>Expense Tracking</h3>
                                        <p>Record business expenses and purchases with a single-entry simplified form</p>
                                    </div>
                                    <div className="feature-card">
                                        <div className="feature-icon">📁</div>
                                        <h3>Digital Receipts</h3>
                                        <p>Keep track of all your supplier payments and utility bills in one place</p>
                                    </div>
                                    <div className="feature-card">
                                        <div className="feature-icon">⚖️</div>
                                        <h3>Net Profit calculation</h3>
                                        <p>Automatically deduct expenses from sales to see your true business performance</p>
                                    </div>
                                </div>
                            )}
                            
                            {activeTab === 'analytics' && (
                                <div className="feature-grid">
                                    <div className="feature-card">
                                        <div className="feature-icon">📈</div>
                                        <h3>Real-time Reports</h3>
                                        <p>Live dashboard with sales, revenue, and performance metrics</p>
                                    </div>
                                    <div className="feature-card">
                                        <div className="feature-icon">🎨</div>
                                        <h3>Custom Insights</h3>
                                        <p>Tailored analytics for your specific restaurant type</p>
                                    </div>
                                    <div className="feature-card">
                                        <div className="feature-icon">📊</div>
                                        <h3>Export Data</h3>
                                        <p>Export reports in multiple formats for accounting and analysis</p>
                                    </div>
                                </div>
                            )}
                            
                            {activeTab === 'staff' && (
                                <div className="feature-grid">
                                    <div className="feature-card">
                                        <div className="feature-icon">👥</div>
                                        <h3>Team Management</h3>
                                        <p>Manage staff schedules, roles, and permissions</p>
                                    </div>
                                    <div className="feature-card">
                                        <div className="feature-icon">⏰</div>
                                        <h3>Time Tracking</h3>
                                        <p>Automated time tracking and payroll integration</p>
                                    </div>
                                    <div className="feature-card">
                                        <div className="feature-icon">🏆</div>
                                        <h3>Performance</h3>
                                        <p>Track staff performance and identify training opportunities</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="benefits-section">
                <div className="section-container">
                    <div className="benefits-grid">
                        <div className="benefit-content">
                            <div className="section-badge">
                                <span>🎯 Benefits</span>
                            </div>
                            <h2 className="section-title">
                                Why Choose
                                <span className="title-highlight"> InfoOS POS?</span>
                            </h2>
                            <div className="benefits-list">
                                <div className="benefit-item">
                                    <div className="benefit-number">01</div>
                                    <div className="benefit-text">
                                        <h4>Increase Revenue</h4>
                                        <p>Average 23% revenue increase within 3 months</p>
                                    </div>
                                </div>
                                <div className="benefit-item">
                                    <div className="benefit-number">02</div>
                                    <div className="benefit-text">
                                        <h4>Reduce Waste</h4>
                                        <p>Cut food waste by up to 40% with smart inventory</p>
                                    </div>
                                </div>
                                <div className="benefit-item">
                                    <div className="benefit-number">03</div>
                                    <div className="benefit-text">
                                        <h4>Save Time</h4>
                                        <p>Automate daily tasks and save 15+ hours per week</p>
                                    </div>
                                </div>
                                <div className="benefit-item">
                                    <div className="benefit-number">04</div>
                                    <div className="benefit-text">
                                        <h4>Happy Customers</h4>
                                        <p>Improve service speed and customer satisfaction</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="benefit-visual">
                            <div className="benefit-image">
                                <div className="image-overlay"></div>
                                <div className="image-content">
                                    <div className="floating-card">
                                        <span className="card-icon">📊</span>
                                        <span className="card-text">+23% Revenue</span>
                                    </div>
                                    <div className="floating-card" style={{top: '60%', left: '10%'}}>
                                        <span className="card-icon">⚡</span>
                                        <span className="card-text">2x Faster Service</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="pricing-section">
                <div className="section-container">
                    <div className="section-header">
                        <div className="section-badge">
                            <span>💰 Pricing</span>
                        </div>
                        <h2 className="section-title">
                            Simple, Transparent
                            <span className="title-highlight"> Pricing Plans</span>
                        </h2>
                        <p className="section-description">
                            Choose the perfect plan for your restaurant size
                        </p>
                    </div>

                    <div className="pricing-grid">
                        <div className="pricing-card basic">
                            <div className="pricing-header">
                                <h3>Basic</h3>
                                <div className="price">
                                    <span className="currency">$</span>
                                    <span className="amount">49</span>
                                    <span className="period">/month</span>
                                </div>
                                <p className="pricing-desc">Perfect for small cafes</p>
                            </div>
                            <div className="pricing-features">
                                <div className="feature-item">
                                    <span className="check">✓</span>
                                    <span>Up to 3 devices</span>
                                </div>
                                <div className="feature-item">
                                    <span className="check">✓</span>
                                    <span>Basic inventory</span>
                                </div>
                                <div className="feature-item">
                                    <span className="check">✓</span>
                                    <span>Daily reports</span>
                                </div>
                                <div className="feature-item">
                                    <span className="check">✓</span>
                                    <span>Email support</span>
                                </div>
                            </div>
                            <button className="pricing-btn">Start Free Trial</button>
                        </div>

                        <div className="pricing-card pro featured">
                            <div className="popular-badge">Most Popular</div>
                            <div className="pricing-header">
                                <h3>Professional</h3>
                                <div className="price">
                                    <span className="currency">$</span>
                                    <span className="amount">99</span>
                                    <span className="period">/month</span>
                                </div>
                                <p className="pricing-desc">Ideal for restaurants</p>
                            </div>
                            <div className="pricing-features">
                                <div className="feature-item">
                                    <span className="check">✓</span>
                                    <span>Up to 10 devices</span>
                                </div>
                                <div className="feature-item">
                                    <span className="check">✓</span>
                                    <span>Advanced inventory</span>
                                </div>
                                <div className="feature-item">
                                    <span className="check">✓</span>
                                    <span>Real-time analytics</span>
                                </div>
                                <div className="feature-item">
                                    <span className="check">✓</span>
                                    <span>Priority support</span>
                                </div>
                                <div className="feature-item">
                                    <span className="check">✓</span>
                                    <span>Staff management</span>
                                </div>
                            </div>
                            <button className="pricing-btn">Start Free Trial</button>
                        </div>

                        <div className="pricing-card enterprise">
                            <div className="pricing-header">
                                <h3>Enterprise</h3>
                                <div className="price">
                                    <span className="currency">$</span>
                                    <span className="amount">199</span>
                                    <span className="period">/month</span>
                                </div>
                                <p className="pricing-desc">For restaurant chains</p>
                            </div>
                            <div className="pricing-features">
                                <div className="feature-item">
                                    <span className="check">✓</span>
                                    <span>Unlimited devices</span>
                                </div>
                                <div className="feature-item">
                                    <span className="check">✓</span>
                                    <span>AI-powered insights</span>
                                </div>
                                <div className="feature-item">
                                    <span className="check">✓</span>
                                    <span>Custom reports</span>
                                </div>
                                <div className="feature-item">
                                    <span className="check">✓</span>
                                    <span>24/7 phone support</span>
                                </div>
                                <div className="feature-item">
                                    <span className="check">✓</span>
                                    <span>API access</span>
                                </div>
                            </div>
                            <button className="pricing-btn">Contact Sales</button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section id="testimonials" className="testimonials-section">
                <div className="section-container">
                    <div className="section-header">
                        <div className="section-badge">
                            <span>💬 Testimonials</span>
                        </div>
                        <h2 className="section-title">
                            Loved by
                            <span className="title-highlight"> Restaurant Owners</span>
                        </h2>
                        <p className="section-description">
                            See what our customers have to say about InfoOS
                        </p>
                    </div>

                    <div className="testimonials-grid">
                        <div className="testimonial-card">
                            <div className="testimonial-content">
                                <div className="rating">
                                    <span className="star">★</span>
                                    <span className="star">★</span>
                                    <span className="star">★</span>
                                    <span className="star">★</span>
                                    <span className="star">★</span>
                                </div>
                                <p className="testimonial-text">
                                    "InfoOS transformed our restaurant operations. We've increased revenue by 30% 
                                    and cut food waste significantly. The best investment we've made!"
                                </p>
                                <div className="testimonial-author">
                                    <div className="author-avatar">JD</div>
                                    <div className="author-info">
                                        <h4>John Davis</h4>
                                        <p>Bella Vista Restaurant</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="testimonial-card">
                            <div className="testimonial-content">
                                <div className="rating">
                                    <span className="star">★</span>
                                    <span className="star">★</span>
                                    <span className="star">★</span>
                                    <span className="star">★</span>
                                    <span className="star">★</span>
                                </div>
                                <p className="testimonial-text">
                                    "The inventory management is incredible. We save hours each day and the 
                                    analytics help us make smarter business decisions. Highly recommend!"
                                </p>
                                <div className="testimonial-author">
                                    <div className="author-avatar">SC</div>
                                    <div className="author-info">
                                        <h4>Sarah Chen</h4>
                                        <p>Urban Bistro</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="testimonial-card">
                            <div className="testimonial-content">
                                <div className="rating">
                                    <span className="star">★</span>
                                    <span className="star">★</span>
                                    <span className="star">★</span>
                                    <span className="star">★</span>
                                    <span className="star">★</span>
                                </div>
                                <p className="testimonial-text">
                                    "Simple, powerful, and affordable. InfoOS has everything we need 
                                    without the complexity of other systems. Our staff loves it!"
                                </p>
                                <div className="testimonial-author">
                                    <div className="author-avatar">MR</div>
                                    <div className="author-info">
                                        <h4>Mike Rodriguez</h4>
                                        <p>Taco Paradise</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="cta-background">
                    <div className="cta-gradient"></div>
                </div>
                <div className="section-container">
                    <div className="cta-content">
                        <h2 className="cta-title">
                            Ready to Transform
                            <span className="title-highlight"> Your Restaurant?</span>
                        </h2>
                        <p className="cta-description">
                            Join 1,000+ restaurants already using InfoOS to grow their business
                        </p>
                        <div className="cta-actions">
                            <button className="btn-primary large">
                                Start Your Free Trial
                                <span className="btn-arrow">→</span>
                            </button>
                            <div className="cta-info">
                                <span className="info-text">✓ No credit card required</span>
                                <span className="info-text">✓ 14-day free trial</span>
                                <span className="info-text">✓ Cancel anytime</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="footer">
                <div className="footer-container">
                    <div className="footer-content">
                        <div className="footer-brand">
                            <div className="brand-logo">
                                <span className="brand-text">InfoOS</span>
                                <span className="brand-tag">POS</span>
                            </div>
                            <p className="footer-desc">
                                The modern POS system for growing restaurants
                            </p>
                            <div className="social-links">
                                <a href="#" className="social-link">f</a>
                                <a href="#" className="social-link">t</a>
                                <a href="#" className="social-link">in</a>
                                <a href="#" className="social-link">ig</a>
                            </div>
                        </div>

                        <div className="footer-links">
                            <div className="link-group">
                                <h4>Product</h4>
                                <a href="#">Features</a>
                                <a href="#">Pricing</a>
                                <a href="#">Integrations</a>
                                <a href="#">API</a>
                            </div>
                            <div className="link-group">
                                <h4>Company</h4>
                                <a href="#">About</a>
                                <a href="#">Blog</a>
                                <a href="#">Careers</a>
                                <a href="#">Contact</a>
                            </div>
                            <div className="link-group">
                                <h4>Support</h4>
                                <a href="#">Help Center</a>
                                <a href="#">Documentation</a>
                                <a href="#">Status</a>
                                <a href="#">Community</a>
                            </div>
                        </div>
                    </div>

                    <div className="footer-bottom">
                        <p>&copy; 2024 InfoOS POS. All rights reserved.</p>
                        <div className="legal-links">
                            <a href="#">Privacy Policy</a>
                            <a href="#">Terms of Service</a>
                            <a href="#">Cookie Policy</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default InfoosMarketing;
