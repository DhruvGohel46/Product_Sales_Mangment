import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Monitor, CheckCircle2, AlertCircle, FileText, Smartphone } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';

const DownloadPage = () => {
    const [downloading, setDownloading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [complete, setComplete] = useState(false);

    const startDownload = () => {
        if (downloading || complete) return;
        setDownloading(true);

        // Simulate download
        let currentProgress = 0;
        const interval = setInterval(() => {
            currentProgress += Math.random() * 10;
            if (currentProgress >= 100) {
                currentProgress = 100;
                clearInterval(interval);
                setDownloading(false);
                setComplete(true);
            }
            setProgress(currentProgress);
        }, 200);
    };

    return (
        <div className="pt-24 pb-20 min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto text-center mb-16">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6"
                    >
                        Download ReBill POS
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-xl text-muted-foreground"
                    >
                        Get the latest version for Windows. Fast, secure, and auto-updating.
                    </motion.p>
                </div>

                <div className="grid md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
                    {/* Download Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Card className="border-primary/20 shadow-2xl overflow-hidden relative">
                            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Monitor className="h-6 w-6 text-primary" />
                                    <span>ReBill for Windows</span>
                                </CardTitle>
                                <CardDescription>Version 2.4.0 (Stable) • 64-bit</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">OS Requirement:</span>
                                        <span className="font-medium">Windows 10/11</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">File Size:</span>
                                        <span className="font-medium">145 MB</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">License:</span>
                                        <span className="font-medium">Proprietary</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    {!complete ? (
                                        <Button
                                            size="lg"
                                            className="w-full text-lg h-14 font-bold relative overflow-hidden"
                                            onClick={startDownload}
                                            disabled={downloading}
                                        >
                                            <span className="relative z-10 flex items-center">
                                                {downloading ? "Downloading..." : "Download Now"}
                                                {!downloading && <Download className="ml-2 h-5 w-5" />}
                                            </span>
                                            {downloading && (
                                                <motion.div
                                                    className="absolute inset-0 bg-primary/20 z-0"
                                                    style={{ width: `${progress}%` }}
                                                    transition={{ ease: "linear" }}
                                                />
                                            )}
                                        </Button>
                                    ) : (
                                        <Button size="lg" className="w-full text-lg h-14 font-bold bg-green-600 hover:bg-green-700">
                                            <CheckCircle2 className="mr-2 h-5 w-5" />
                                            Download Complete
                                        </Button>
                                    )}

                                    {downloading && (
                                        <div className="flex justify-between text-xs text-muted-foreground">
                                            <span>{Math.round(progress)}%</span>
                                            <span>{(145 * progress / 100).toFixed(1)} / 145 MB</span>
                                        </div>
                                    )}
                                </div>

                                {complete && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 p-3 rounded-md text-sm text-center"
                                    >
                                        The installer has been saved to your downloads folder.
                                    </motion.div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Release Notes */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="space-y-6"
                    >
                        <div>
                            <h3 className="text-xl font-bold mb-4 flex items-center">
                                <FileText className="mr-2 h-5 w-5 text-primary" />
                                What's New
                            </h3>
                            <ul className="space-y-3">
                                {[
                                    "Added support for multiple GST profiles",
                                    "Improved barcode scanning speed by 40%",
                                    "New dark mode theme for low-light environments",
                                    "Fixed issue with thermal printer scaling",
                                    "Automatic cloud sync optimization"
                                ].map((note, i) => (
                                    <li key={i} className="flex items-start">
                                        <div className="flex-shrink-0 h-1.5 w-1.5 mt-2 rounded-full bg-primary mr-3"></div>
                                        <span className="text-muted-foreground">{note}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="p-4 border border-yellow-200 bg-yellow-50 dark:bg-yellow-900/10 dark:border-yellow-900/30 rounded-lg">
                            <div className="flex items-start">
                                <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 mt-0.5 mr-3 flex-shrink-0" />
                                <div>
                                    <h4 className="font-semibold text-yellow-800 dark:text-yellow-400">System Requirements</h4>
                                    <p className="text-sm text-yellow-700 dark:text-yellow-500 mt-1">
                                        Requires Windows 10 (version 2004 or later) or Windows 11.
                                        Minimum 4GB RAM and 500MB disk space recommended.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-bold mb-2 flex items-center text-muted-foreground">
                                <Smartphone className="mr-2 h-5 w-5" />
                                Also available on mobile
                            </h3>
                            <div className="flex space-x-3">
                                <Button variant="outline" size="sm">iOS App Store</Button>
                                <Button variant="outline" size="sm">Google Play</Button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default DownloadPage;
