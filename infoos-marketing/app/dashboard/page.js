"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import styles from "./Dashboard.module.css";
import { Layout, LogOut, BarChart3, Package, Receipt, Settings } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
      </div>
    );
  }

  if (!session) return null;

  const quickActions = [
    { icon: Receipt, label: "Billing", desc: "Create and manage invoices" },
    { icon: BarChart3, label: "Analytics", desc: "View your sales data" },
    { icon: Package, label: "Inventory", desc: "Track your stock levels" },
    { icon: Settings, label: "Settings", desc: "Configure your store" },
  ];

  return (
    <div className={styles.container}>
      <nav className={styles.sidebar}>
        <Link href="/" className={styles.logo}>
          <Layout size={24} className={styles.logoIcon} />
          <span>InfoOS</span>
        </Link>
        <div className={styles.userInfo}>
          <div className={styles.avatar}>{session.user.name?.charAt(0) || "U"}</div>
          <div>
            <div className={styles.userName}>{session.user.name}</div>
            <div className={styles.userEmail}>{session.user.email}</div>
          </div>
        </div>
        <button onClick={() => signOut({ callbackUrl: "/" })} className={styles.logoutBtn}>
          <LogOut size={16} />
          Sign Out
        </button>
      </nav>

      <main className={styles.main}>
        <div className={styles.header}>
          <h1>Welcome back, <span className="text-gradient">{session.user.name}</span></h1>
          <p className={styles.subtitle}>Here's your store overview.</p>
        </div>

        <div className={styles.actions}>
          {quickActions.map((action, i) => (
            <motion.div
              key={action.label}
              className={styles.actionItem}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.08 }}
            >
              <div className={styles.actionIcon}>
                <action.icon size={24} />
              </div>
              <h3>{action.label}</h3>
              <p>{action.desc}</p>
            </motion.div>
          ))}
        </div>

        <div className={styles.notice}>
          <p>🖥️ These features are available in the <strong>InfoOS Desktop App</strong>. <Link href="/#pricing">Download now</Link> to get started.</p>
        </div>
      </main>
    </div>
  );
}
