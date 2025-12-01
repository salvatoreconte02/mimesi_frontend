import { motion } from 'framer-motion';

export default function Button({ children, variant = 'primary', onClick, className }) {
  const styles = {
    primary: 'bg-primary text-white shadow-lg hover:bg-primary-hover',
    gradient: 'bg-mimesi-gradient text-white shadow-lg',
    secondary: 'bg-secondary-lighter text-primary hover:bg-secondary-light hover:text-white',
    ghost: 'text-neutral-600 hover:bg-neutral-100',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -1 }}
      whileTap={{ scale: 0.95 }}
      className={`${styles[variant]} px-5 py-2.5 rounded-xl font-medium transition-all ${className || ''}`}
      onClick={onClick}
    >
      {children}
    </motion.button>
  );
}