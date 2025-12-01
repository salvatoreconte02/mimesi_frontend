import { motion } from 'framer-motion';

export default function Card({ children, title, subtitle, className }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-2xl p-6 shadow-sm border border-neutral-100 hover:shadow-md transition-shadow ${className}`}
    >
      {title && <h3 className="text-lg font-bold text-primary mb-1">{title}</h3>}
      {subtitle && <p className="text-sm text-neutral-500 mb-4">{subtitle}</p>}
      {children}
    </motion.div>
  );
}