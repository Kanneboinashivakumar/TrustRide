import type { Variants, Transition } from 'framer-motion';

/* ──────────────────────────────────────────────────
   Shared Transitions
   ────────────────────────────────────────────────── */

export const springTransition: Transition = {
  type: 'spring',
  stiffness: 300,
  damping: 30,
};

export const smoothTransition: Transition = {
  duration: 0.3,
  ease: [0, 0, 0.2, 1],
};

export const slowTransition: Transition = {
  duration: 0.5,
  ease: [0, 0, 0.2, 1],
};

export const smoothSpring: Transition = {
  type: 'spring',
  stiffness: 100,
  damping: 20,
};

export const editorialEase: Transition = {
  duration: 0.7,
  ease: [0.25, 0.1, 0.25, 1],
};

/* ──────────────────────────────────────────────────
   Page Transitions
   ────────────────────────────────────────────────── */

export const pageVariants: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: smoothTransition },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
};

/* ──────────────────────────────────────────────────
   Fade Variants
   ────────────────────────────────────────────────── */

export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: smoothTransition },
  exit: { opacity: 0 },
};

export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: smoothTransition },
  exit: { opacity: 0, y: 8 },
};

export const fadeUp = fadeInUp;

export const fadeInDown: Variants = {
  initial: { opacity: 0, y: -16 },
  animate: { opacity: 1, y: 0, transition: smoothTransition },
};

export const fadeInLeft: Variants = {
  initial: { opacity: 0, x: -16 },
  animate: { opacity: 1, x: 0, transition: smoothTransition },
};

export const fadeInRight: Variants = {
  initial: { opacity: 0, x: 16 },
  animate: { opacity: 1, x: 0, transition: smoothTransition },
};

/* ──────────────────────────────────────────────────
   Scale Variants
   ────────────────────────────────────────────────── */

export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1, transition: springTransition },
  exit: { opacity: 0, scale: 0.95 },
};

/* ──────────────────────────────────────────────────
   Stagger Variants
   ────────────────────────────────────────────────── */

export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

export const staggerItem: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: editorialEase },
};

export const staggerFadeItem: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: smoothTransition },
};

/* ──────────────────────────────────────────────────
   Editorial Scroll Reveal (Landing Page)
   ────────────────────────────────────────────────── */

export const scrollReveal: Variants = {
  initial: { opacity: 0, y: 60 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.25, 0.1, 0.25, 1] },
  },
};

export const editorialReveal: Variants = {
  initial: { opacity: 0, y: 80 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: [0.25, 0.1, 0.25, 1] },
  },
};

export const editorialStaggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.15,
    },
  },
};

export const editorialStaggerItem: Variants = {
  initial: { opacity: 0, y: 40 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] },
  },
};

/* ──────────────────────────────────────────────────
   Hero Entrance (Landing Page)
   ────────────────────────────────────────────────── */

export const heroEntrance: Variants = {
  initial: { opacity: 0, y: 40 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
  },
};

export const heroStagger: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.2,
    },
  },
};

export const heroItem: Variants = {
  initial: { opacity: 0, y: 30 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  },
};

/* ──────────────────────────────────────────────────
   Slide Variants (for drawers, panels)
   ────────────────────────────────────────────────── */

export const slideInRight: Variants = {
  initial: { x: '100%' },
  animate: { x: 0, transition: springTransition },
  exit: { x: '100%', transition: { duration: 0.2 } },
};

export const slideInLeft: Variants = {
  initial: { x: '-100%' },
  animate: { x: 0, transition: springTransition },
  exit: { x: '-100%', transition: { duration: 0.2 } },
};

export const slideInUp: Variants = {
  initial: { y: '100%' },
  animate: { y: 0, transition: springTransition },
  exit: { x: 0, y: '100%', transition: { duration: 0.2 } },
};

/* ──────────────────────────────────────────────────
   Modal / Dialog Variants
   ────────────────────────────────────────────────── */

export const modalOverlay: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

export const modalContent: Variants = {
  initial: { opacity: 0, scale: 0.96, y: 8 },
  animate: { opacity: 1, scale: 1, y: 0, transition: springTransition },
  exit: { opacity: 0, scale: 0.96, y: 8, transition: { duration: 0.15 } },
};

/* ──────────────────────────────────────────────────
   Pipeline Animation Variants
   ────────────────────────────────────────────────── */

export const pipelineStage: Variants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: {
      delay: i * 0.15,
      duration: 0.4,
      ease: [0, 0, 0.2, 1],
    },
  }),
};

export const pipelineConnector: Variants = {
  initial: { scaleX: 0 },
  animate: (i: number) => ({
    scaleX: 1,
    transition: {
      delay: i * 0.15 + 0.1,
      duration: 0.3,
      ease: [0, 0, 0.2, 1],
    },
  }),
};

/* ──────────────────────────────────────────────────
   Pulse / Status Variants
   ────────────────────────────────────────────────── */

export const pulseVariant: Variants = {
  animate: {
    scale: [1, 1.05, 1],
    opacity: [1, 0.7, 1],
    transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
  },
};

/* ──────────────────────────────────────────────────
   List Animation
   ────────────────────────────────────────────────── */

export const listContainer: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { staggerChildren: 0.04 },
  },
};

export const listItem: Variants = {
  initial: { opacity: 0, x: -8 },
  animate: { opacity: 1, x: 0, transition: smoothTransition },
};

/* ──────────────────────────────────────────────────
   Card Hover
   ────────────────────────────────────────────────── */

export const cardHover = {
  rest: { scale: 1, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  hover: {
    scale: 1.01,
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    transition: { duration: 0.2 },
  },
};

/* ──────────────────────────────────────────────────
   Scroll Reveal Directional
   ────────────────────────────────────────────────── */

export const scrollRevealLeft: Variants = {
  initial: { opacity: 0, x: -40 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] },
  },
};

export const scrollRevealRight: Variants = {
  initial: { opacity: 0, x: 40 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] },
  },
};
