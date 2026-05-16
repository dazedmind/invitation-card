import { motion, useInView, type Variant } from 'motion/react'
import { useRef } from 'react'

interface BlurTextProps {
  text: string
  delay?: number
  animateBy?: 'words' | 'characters'
  direction?: 'top' | 'bottom' | 'left' | 'right'
  className?: string
  variant?: {
    hidden: Variant
    visible: Variant
  }
}

export default function BlurText({
  text,
  delay = 0,
  animateBy = 'words',
  direction = 'bottom',
  className = '',
  variant,
}: BlurTextProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  const defaultVariants = {
    hidden: { 
      filter: 'blur(10px)', 
      opacity: 0,
      y: direction === 'bottom' ? 20 : direction === 'top' ? -20 : 0,
      x: direction === 'left' ? -20 : direction === 'right' ? 20 : 0,
    },
    visible: { 
      filter: 'blur(0px)', 
      opacity: 1,
      y: 0,
      x: 0,
    },
  }

  const combinedVariants = variant || defaultVariants

  const segments = animateBy === 'words' 
    ? text.split(' ')
    : text.split('')

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      transition={{ staggerChildren: 0.05, delayChildren: delay }}
      className={className}
    >
      {segments.map((segment, i) => (
        <motion.span
          key={`${segment}-${i}`}
          variants={combinedVariants}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="inline-block"
        >
          {segment}
          {animateBy === 'words' && i < segments.length - 1 && '\u00A0'}
        </motion.span>
      ))}
    </motion.div>
  )
}