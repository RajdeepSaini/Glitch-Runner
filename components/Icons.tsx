
import React from 'react';

interface IconProps {
  className?: string;
  strokeWidth?: number;
}

export const TerminalIcon = ({ className, strokeWidth = 2 }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} className={className} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="4 17 10 11 4 5" />
    <line x1="12" y1="19" x2="20" y2="19" />
  </svg>
);

export const ChipIcon = ({ className, strokeWidth = 2 }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} className={className} strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="4" width="16" height="16" rx="2" ry="2" />
    <rect x="9" y="9" width="6" height="6" />
    <line x1="9" y1="1" x2="9" y2="4" />
    <line x1="15" y1="1" x2="15" y2="4" />
    <line x1="9" y1="20" x2="9" y2="23" />
    <line x1="15" y1="20" x2="15" y2="23" />
    <line x1="20" y1="9" x2="23" y2="9" />
    <line x1="20" y1="14" x2="23" y2="14" />
    <line x1="1" y1="9" x2="4" y2="9" />
    <line x1="1" y1="14" x2="4" y2="14" />
  </svg>
);

export const ShoppingBagIcon = ({ className, strokeWidth = 2 }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} className={className} strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
);

export const WifiIcon = ({ className, strokeWidth = 2 }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} className={className} strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12.55a11 11 0 0 1 14.08 0" />
    <path d="M1.42 9a16 16 0 0 1 21.16 0" />
    <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
    <line x1="12" y1="20" x2="12.01" y2="20" />
  </svg>
);

export const TrophyIcon = ({ className, strokeWidth = 2 }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} className={className} strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 21h8" />
    <path d="M12 17v4" />
    <path d="M7 4h10" />
    <path d="M17 4v8a5 5 0 0 1-10 0V4" />
    <path d="M5 9v6" />
    <path d="M19 9v6" />
  </svg>
);

export const BitIcon = ({ className, strokeWidth = 2 }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} className={className} strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
);

export const ActivityIcon = ({ className, strokeWidth = 2 }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} className={className} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);

export const UserIcon = ({ className, strokeWidth = 2 }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} className={className} strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

export const MonitorIcon = ({ className, strokeWidth = 2 }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} className={className} strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />
  </svg>
);

export const PaletteIcon = ({ className, strokeWidth = 2 }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} className={className} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="13.5" cy="6.5" r=".5" />
    <circle cx="17.5" cy="10.5" r=".5" />
    <circle cx="8.5" cy="7.5" r=".5" />
    <circle cx="6.5" cy="12.5" r=".5" />
    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
  </svg>
);

export const HeadphonesIcon = ({ className, strokeWidth = 2 }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} className={className} strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
    <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
  </svg>
);

export const ZapIcon = ({ className, strokeWidth = 2 }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} className={className} strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

export const FirstAidIcon = ({ className, strokeWidth = 2 }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} className={className} strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="4" width="16" height="16" rx="2" />
    <path d="M12 8v8" />
    <path d="M8 12h8" />
  </svg>
);

export const LockIcon = ({ className, strokeWidth = 2 }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} className={className} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

export const UnlockIcon = ({ className, strokeWidth = 2 }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} className={className} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 9.9-1" />
  </svg>
);

export const CheckIcon = ({ className, strokeWidth = 2 }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} className={className} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export const PlayIcon = ({ className, strokeWidth = 2 }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} className={className} strokeLinecap="round" strokeLinejoin="round">
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);

export const RefreshIcon = ({ className, strokeWidth = 2 }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} className={className} strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 4v6h-6" />
    <path d="M1 20v-6h6" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
);

export const HeartIcon = ({ className, strokeWidth = 2 }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} className={className} strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

export const FastForwardIcon = ({ className, strokeWidth = 2 }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} className={className} strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 19 22 12 13 5 13 19" />
    <polygon points="2 19 11 12 2 5 2 19" />
  </svg>
);

export const LeaderboardIcon = ({ className, strokeWidth = 2 }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} className={className} strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 20V10" />
    <path d="M12 20V4" />
    <path d="M6 20V14" />
  </svg>
);

// --- Custom Upgrade Icons ---

export const OverclockIcon = ({ className, strokeWidth = 2 }: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} className={className} strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" />
    </svg>
);

export const RootAccessIcon = ({ className, strokeWidth = 2 }: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} className={className} strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 12H22M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z" strokeDasharray="4 4" />
        <path d="M12 16L15 12L12 8M9 12H15" />
        <path d="M3 20L21 20" strokeWidth="1" />
    </svg>
);

export const LagSwitchIcon = ({ className, strokeWidth = 2 }: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} className={className} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6V12L16 14" />
        <path d="M12 2V4M12 20V22M2 12H4M20 12H22" strokeWidth="1"/>
    </svg>
);

export const MagnetIcon = ({ className, strokeWidth = 2 }: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} className={className} strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 10V5C6 3.34315 7.34315 2 9 2H15C16.6569 2 18 3.34315 18 5V10" />
        <path d="M6 10C6 13.3137 8.68629 16 12 16C15.3137 16 18 13.3137 18 10" />
        <path d="M4 10H8" /><path d="M16 10H20" />
        <path d="M8 21L12 17L16 21" />
    </svg>
);

export const ShieldIcon = ({ className, strokeWidth = 2 }: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} className={className} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22S20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" />
        <path d="M9 12L11 14L15 10" />
    </svg>
);

export const DebuggerIcon = ({ className, strokeWidth = 2 }: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} className={className} strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12H19M5 12H3" />
        <path d="M12 21V19M12 5V3" />
        <path d="M7 7L5 5M19 19L17 17M7 17L5 19M19 5L17 7" />
        <rect x="7" y="7" width="10" height="10" rx="2" />
        <path d="M9 12H15" />
    </svg>
);

export const PowerIcon = ({ className, strokeWidth = 2 }: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} className={className} strokeLinecap="round" strokeLinejoin="round">
        <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
        <line x1="12" y1="2" x2="12" y2="12" />
    </svg>
);
