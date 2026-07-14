/**
 * Utility functions for LifeOS
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Merge Tailwind classes safely */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format currency in INR */
export function formatCurrency(amount: number | string, compact = false): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '₹0';

  if (compact) {
    if (Math.abs(num) >= 10000000) return `₹${(num / 10000000).toFixed(1)}Cr`;
    if (Math.abs(num) >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
    if (Math.abs(num) >= 1000) return `₹${(num / 1000).toFixed(1)}K`;
  }

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(num);
}

/** Format a date string */
export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/** Format relative date */
export function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return formatDate(dateStr);
}

/** Calculate progress percentage */
export function calcProgress(current: number, target: number): number {
  if (target <= 0) return 0;
  return Math.min(Math.round((current / target) * 100), 100);
}

/** Truncate text */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/** Get greeting based on time */
export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

/** Mood emoji mapping */
export const moodEmojis: Record<string, string> = {
  amazing: '🔥',
  good: '😊',
  okay: '😐',
  bad: '😔',
  terrible: '😢',
};

/** Priority colors */
export const priorityColors: Record<string, string> = {
  low: '#64748b',
  medium: '#f59e0b',
  high: '#f97316',
  critical: '#f43f5e',
};
