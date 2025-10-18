import { motion } from 'framer-motion'

export type IllustrationType = 'savings' | 'budget' | 'achievement' | 'spending' | 'analytics' | 'progress'

interface PracticalIllustrationProps {
  type: IllustrationType
  className?: string
  size?: number
}

const illustrations = {
  savings: (size: number) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-emerald-500"
      aria-label="Savings illustration"
    >
      <motion.circle
        cx="50"
        cy="50"
        r="35"
        fill="currentColor"
        opacity="0.1"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5 }}
      />
      <motion.rect
        x="35"
        y="30"
        width="30"
        height="35"
        rx="3"
        fill="currentColor"
        opacity="0.2"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 0.2 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      />
      <motion.rect
        x="40"
        y="25"
        width="20"
        height="6"
        rx="3"
        fill="currentColor"
        opacity="0.3"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      />
      <motion.circle
        cx="50"
        cy="48"
        r="8"
        fill="currentColor"
        opacity="0.4"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      />
      <motion.path
        d="M 48 40 L 48 56"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.5"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.4, delay: 0.4 }}
      />
      <motion.path
        d="M 42 48 L 58 48"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.5"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.4, delay: 0.5 }}
      />
    </svg>
  ),

  budget: (size: number) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-blue-500"
      aria-label="Budget illustration"
    >
      <motion.circle
        cx="50"
        cy="50"
        r="30"
        fill="currentColor"
        opacity="0.1"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5 }}
      />
      <motion.path
        d="M 50 20 A 30 30 0 0 1 80 50"
        fill="currentColor"
        opacity="0.3"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      />
      <motion.path
        d="M 80 50 A 30 30 0 0 1 50 80"
        fill="currentColor"
        opacity="0.25"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      />
      <motion.path
        d="M 50 80 A 30 30 0 0 1 20 50"
        fill="currentColor"
        opacity="0.2"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      />
      <motion.path
        d="M 20 50 A 30 30 0 0 1 50 20"
        fill="currentColor"
        opacity="0.15"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.6, delay: 0.7 }}
      />
      <motion.circle
        cx="50"
        cy="50"
        r="15"
        fill="currentColor"
        opacity="0.4"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.4, delay: 0.9 }}
      />
    </svg>
  ),

  achievement: (size: number) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-amber-500"
      aria-label="Achievement illustration"
    >
      <motion.path
        d="M 50 20 L 40 50 L 10 50 L 35 68 L 25 95 L 50 75 L 75 95 L 65 68 L 90 50 L 60 50 Z"
        fill="currentColor"
        opacity="0.3"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ duration: 0.8, type: "spring" }}
      />
      <motion.circle
        cx="50"
        cy="50"
        r="15"
        fill="currentColor"
        opacity="0.4"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      />
      <motion.path
        d="M 43 50 L 47 55 L 57 43"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.6"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      />
    </svg>
  ),

  spending: (size: number) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-purple-500"
      aria-label="Spending illustration"
    >
      <motion.rect
        x="20"
        y="30"
        width="60"
        height="45"
        rx="4"
        fill="currentColor"
        opacity="0.15"
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 0.5 }}
      />
      <motion.rect
        x="20"
        y="40"
        width="60"
        height="8"
        fill="currentColor"
        opacity="0.3"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      />
      <motion.rect
        x="28"
        y="55"
        width="18"
        height="4"
        rx="2"
        fill="currentColor"
        opacity="0.25"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.4, delay: 0.4 }}
      />
      <motion.rect
        x="28"
        y="62"
        width="30"
        height="4"
        rx="2"
        fill="currentColor"
        opacity="0.2"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.4, delay: 0.5 }}
      />
      <motion.rect
        x="50"
        y="55"
        width="22"
        height="12"
        rx="3"
        fill="currentColor"
        opacity="0.35"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.4, delay: 0.6 }}
      />
    </svg>
  ),

  analytics: (size: number) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-indigo-500"
      aria-label="Analytics illustration"
    >
      <motion.rect
        x="20"
        y="60"
        width="12"
        height="25"
        rx="2"
        fill="currentColor"
        opacity="0.2"
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        style={{ transformOrigin: 'bottom' }}
      />
      <motion.rect
        x="36"
        y="50"
        width="12"
        height="35"
        rx="2"
        fill="currentColor"
        opacity="0.25"
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        style={{ transformOrigin: 'bottom' }}
      />
      <motion.rect
        x="52"
        y="35"
        width="12"
        height="50"
        rx="2"
        fill="currentColor"
        opacity="0.3"
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        style={{ transformOrigin: 'bottom' }}
      />
      <motion.rect
        x="68"
        y="25"
        width="12"
        height="60"
        rx="2"
        fill="currentColor"
        opacity="0.35"
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        style={{ transformOrigin: 'bottom' }}
      />
      <motion.polyline
        points="26,66 42,56 58,41 74,31"
        stroke="currentColor"
        strokeWidth="2.5"
        fill="none"
        opacity="0.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.8, delay: 0.5 }}
      />
    </svg>
  ),

  progress: (size: number) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-teal-500"
      aria-label="Progress illustration"
    >
      <motion.circle
        cx="50"
        cy="50"
        r="30"
        stroke="currentColor"
        strokeWidth="6"
        opacity="0.15"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1 }}
      />
      <motion.circle
        cx="50"
        cy="50"
        r="30"
        stroke="currentColor"
        strokeWidth="6"
        opacity="0.4"
        strokeLinecap="round"
        strokeDasharray="188.5"
        initial={{ strokeDashoffset: 188.5 }}
        animate={{ strokeDashoffset: 47 }}
        transition={{ duration: 1.5, delay: 0.3 }}
        style={{ transformOrigin: 'center', transform: 'rotate(-90deg)' }}
      />
      <motion.path
        d="M 43 50 L 48 55 L 60 40"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.5"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.6, delay: 1.2 }}
      />
    </svg>
  )
}

export function PracticalIllustration({ type, className = '', size = 80 }: PracticalIllustrationProps) {
  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      {illustrations[type](size)}
    </div>
  )
}
