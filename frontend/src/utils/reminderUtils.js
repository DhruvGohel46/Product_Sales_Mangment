/**
 * =============================================================================
 * REMINDER UTILITIES — reminderUtils.js
 * =============================================================================
 *
 * Utility functions and constants for the Smart Reminder System.
 * Handles time formatting, ID generation, reminder state logic, and mock data.
 * =============================================================================
 */
import { getLocalDateString } from './api';

// ─── Constants ───────────────────────────────────────────────────────────────

export const REMINDER_CATEGORIES = [
  { id: 'inventory', label: 'Inventory', icon: '📦', color: '#0ea5e9' },
  { id: 'staff', label: 'Staff', icon: '👤', color: '#8b5cf6' },
  { id: 'payment', label: 'Payments', icon: '💰', color: '#22c55e' },
  { id: 'tax', label: 'Tax / GST', icon: '🧾', color: '#f59e0b' },
  { id: 'tasks', label: 'Daily Tasks', icon: '✅', color: '#06b6d4' },
  { id: 'promo', label: 'Promotions', icon: '🎉', color: '#ec4899' },
  { id: 'custom', label: 'Custom', icon: '📌', color: '#64748b' },
];

export const PRIORITY_LEVELS = [
  { id: 'low', label: 'Low', color: '#64748b', bgLight: 'rgba(100,116,139,0.10)', bgDark: 'rgba(100,116,139,0.15)' },
  { id: 'medium', label: 'Medium', color: '#FF8A3D', bgLight: 'rgba(255,138,61,0.10)', bgDark: 'rgba(255,138,61,0.15)' },
  { id: 'high', label: 'High', color: '#f87171', bgLight: 'rgba(248,113,113,0.10)', bgDark: 'rgba(248,113,113,0.18)' },
];

export const REPEAT_TYPES = [
  { id: 'once', label: 'One-time' },
  { id: 'daily', label: 'Daily' },
  { id: 'weekly', label: 'Weekly' },
  { id: 'monthly', label: 'Monthly' },
  { id: 'custom', label: 'Custom' },
];

export const SNOOZE_OPTIONS = [
  { label: '10 minutes', minutes: 10 },
  { label: '30 minutes', minutes: 30 },
  { label: '1 hour', minutes: 60 },
];

const STORAGE_KEY = 'rebill_reminders';
const DISMISSED_SUGGESTIONS_KEY = 'rebill_dismissed_suggestions';

// ─── ID Generation ───────────────────────────────────────────────────────────

export function generateId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// ─── Storage ─────────────────────────────────────────────────────────────────

export function loadReminders() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveReminders(reminders) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));
  } catch (e) {
    console.error('Failed to save reminders:', e);
  }
}

export function loadDismissedSuggestions() {
  try {
    const data = localStorage.getItem(DISMISSED_SUGGESTIONS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveDismissedSuggestions(ids) {
  try {
    localStorage.setItem(DISMISSED_SUGGESTIONS_KEY, JSON.stringify(ids));
  } catch (e) {
    console.error('Failed to save dismissed suggestions:', e);
  }
}

// ─── Smart Time Formatting ──────────────────────────────────────────────────

export function formatSmartTime(dateStr, timeStr, repeatType) {
  if (!dateStr && !timeStr) return '';

  // Recurring labels
  if (repeatType === 'daily' && timeStr) {
    return `Every day at ${formatTime12h(timeStr)}`;
  }
  if (repeatType === 'weekly' && dateStr) {
    const day = new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long' });
    return `Every ${day}${timeStr ? ' at ' + formatTime12h(timeStr) : ''}`;
  }
  if (repeatType === 'monthly' && dateStr) {
    const d = new Date(dateStr + 'T00:00:00').getDate();
    const suffix = getOrdinalSuffix(d);
    return `Every month on the ${d}${suffix}${timeStr ? ' at ' + formatTime12h(timeStr) : ''}`;
  }

  // One-time / custom labels
  if (!dateStr) return timeStr ? `At ${formatTime12h(timeStr)}` : '';

  const now = new Date();
  const target = new Date(dateStr + 'T00:00:00');

  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const targetStart = new Date(target.getFullYear(), target.getMonth(), target.getDate());
  const diffDays = Math.round((targetStart - todayStart) / (1000 * 60 * 60 * 24));

  const timePart = timeStr ? ` at ${formatTime12h(timeStr)}` : '';

  if (diffDays === 0) return `Today${timePart}`;
  if (diffDays === 1) return `Tomorrow${timePart}`;
  if (diffDays === -1) return `Yesterday${timePart}`;
  if (diffDays > 1 && diffDays <= 7) return `In ${diffDays} days${timePart}`;
  if (diffDays < -1 && diffDays >= -7) return `${Math.abs(diffDays)} days ago${timePart}`;

  // Beyond a week — show date
  const formatted = target.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return `${formatted}${timePart}`;
}

function formatTime12h(timeStr) {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
}

function getOrdinalSuffix(n) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}

// ─── Reminder State Helpers ─────────────────────────────────────────────────

export function isOverdue(reminder) {
  if (reminder.status !== 'active') return false;
  if (!reminder.date) return false;

  const now = new Date();
  const target = buildDateFromReminder(reminder);
  return target < now;
}

export function isDueNow(reminder, windowMs = 30000) {
  if (reminder.status !== 'active') return false;
  if (!reminder.date || !reminder.time) return false;

  // Check snooze
  if (reminder.snoozeUntil && new Date(reminder.snoozeUntil) > new Date()) return false;

  const now = new Date();
  const target = buildDateFromReminder(reminder);
  const diff = target.getTime() - now.getTime();

  return diff >= -windowMs && diff <= windowMs;
}

export function buildDateFromReminder(reminder) {
  const [h = 0, m = 0] = (reminder.time || '00:00').split(':').map(Number);
  const target = new Date(reminder.date + 'T00:00:00');
  target.setHours(h, m, 0, 0);
  return target;
}

export function getNextOccurrence(reminder) {
  const current = buildDateFromReminder(reminder);
  const now = new Date();

  switch (reminder.repeatType) {
    case 'daily': {
      const next = new Date(current);
      while (next <= now) next.setDate(next.getDate() + 1);
      return next;
    }
    case 'weekly': {
      const next = new Date(current);
      while (next <= now) next.setDate(next.getDate() + 7);
      return next;
    }
    case 'monthly': {
      const next = new Date(current);
      while (next <= now) next.setMonth(next.getMonth() + 1);
      return next;
    }
    default:
      return current;
  }
}

export function resetRecurringReminder(reminder) {
  if (reminder.repeatType === 'once') return { ...reminder, status: 'completed' };

  const next = getNextOccurrence(reminder);
  return {
    ...reminder,
    date: getLocalDateString(next),
    status: 'active',
    snoozeUntil: null,
  };
}

// ─── Categorization Helpers ─────────────────────────────────────────────────

export function categorizeReminders(reminders) {
  const now = new Date();
  const todayStr = getLocalDateString(now);
  const tomorrowDate = new Date(now);
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrowStr = getLocalDateString(tomorrowDate);

  const today = [];
  const upcoming = [];
  const recurring = [];
  const completed = [];

  reminders.forEach((r) => {
    if (r.status === 'completed') {
      completed.push(r);
      return;
    }

    if (r.repeatType && r.repeatType !== 'once') {
      recurring.push(r);
    }

    if (r.date === todayStr) {
      today.push(r);
    } else if (r.date > todayStr) {
      upcoming.push(r);
    } else {
      // Overdue — show in Today
      today.push(r);
    }
  });

  // Sort: overdue first, then by time
  today.sort((a, b) => {
    const aOverdue = isOverdue(a) ? 0 : 1;
    const bOverdue = isOverdue(b) ? 0 : 1;
    if (aOverdue !== bOverdue) return aOverdue - bOverdue;
    return (a.time || '').localeCompare(b.time || '');
  });

  upcoming.sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  completed.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));

  return { today, upcoming, recurring, completed };
}

// ─── Mock Smart Suggestions ─────────────────────────────────────────────────

export function generateMockSuggestions(dismissedIds = []) {
  const allSuggestions = [
    {
      id: 'sug-low-stock-khari',
      icon: '📦',
      title: 'Khari Soda stock is low',
      description: 'Only 3 packets left. Set a restock reminder?',
      category: 'inventory',
      priority: 'high',
      preset: { title: 'Restock Khari Soda', category: 'inventory', priority: 'high', repeatType: 'once' },
    },
    {
      id: 'sug-salary-due',
      icon: '💰',
      title: 'Salary payment due in 3 days',
      description: 'Monthly staff salary payments are approaching.',
      category: 'payment',
      priority: 'medium',
      preset: { title: 'Process Staff Salaries', category: 'payment', priority: 'medium', repeatType: 'monthly' },
    },
    {
      id: 'sug-coca-cola-restock',
      icon: '🔄',
      title: 'Coca Cola restocked every 7 days',
      description: 'Create an auto-recurring restock reminder?',
      category: 'inventory',
      priority: 'medium',
      preset: { title: 'Restock Coca Cola', category: 'inventory', priority: 'medium', repeatType: 'weekly' },
    },
    {
      id: 'sug-gst-filing',
      icon: '🧾',
      title: 'GST filing deadline approaching',
      description: 'File your monthly GST return before the 20th.',
      category: 'tax',
      priority: 'high',
      preset: { title: 'File GST Return', category: 'tax', priority: 'high', repeatType: 'monthly' },
    },
    {
      id: 'sug-daily-opening',
      icon: '🏪',
      title: 'Set daily opening checklist',
      description: 'Never miss your morning setup routine.',
      category: 'tasks',
      priority: 'low',
      preset: { title: 'Morning Opening Checklist', category: 'tasks', priority: 'low', repeatType: 'daily' },
    },
    {
      id: 'sug-promo-weekend',
      icon: '🎉',
      title: 'Weekend promotion coming up',
      description: 'Plan your weekend special offers in advance.',
      category: 'promo',
      priority: 'low',
      preset: { title: 'Prepare Weekend Promotions', category: 'promo', priority: 'low', repeatType: 'weekly' },
    },
  ];

  return allSuggestions.filter((s) => !dismissedIds.includes(s.id));
}

// ─── Default New Reminder ────────────────────────────────────────────────────

export function createDefaultReminder(overrides = {}) {
  const now = new Date();
  return {
    id: generateId(),
    title: '',
    description: '',
    date: getLocalDateString(now),
    time: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
    repeatType: 'once',
    priority: 'medium',
    category: 'custom',
    status: 'active',
    snoozeUntil: null,
    createdAt: now.toISOString(),
    assignedTo: null,
    ...overrides,
  };
}
