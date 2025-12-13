import { motion } from 'framer-motion';

/**
 * Widget SEMPLICE per mostrare statistiche delle lavorazioni
 * Riceve il count dall'esterno invece di calcolarlo internamente
 */
export default function StatusWorkWidget({
  // Conteggio da mostrare (ricevuto dall'esterno)
  count = 0,
  // Icona da mostrare (componente Lucide)
  icon: Icon,
  // Label principale
  label,
  // Classi Tailwind per i colori
  colorClasses = {
    bg: 'bg-blue-100',
    text: 'text-blue-600',
    hoverBg: 'group-hover:bg-blue-600',
    hoverBorder: 'hover:border-blue-300',
    badge: 'bg-blue-50 text-blue-600'
  },
  // Callback quando si clicca il widget
  onClick,
  // Badge da mostrare (null, 'action', 'active', o stringa custom)
  badge = null
}) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      onClick={onClick}
      // AGGIUNTO: h-full, flex, flex-col, justify-between
      // Questo forza il widget a occupare tutta l'altezza della cella della griglia
      className={`bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm cursor-pointer ${colorClasses.hoverBorder} group transition-all h-full flex flex-col justify-between`}
    >
      <div className="flex justify-between items-start mb-2">
        <div className={`w-12 h-12 rounded-xl ${colorClasses.bg} ${colorClasses.text} flex items-center justify-center ${colorClasses.hoverBg} group-hover:text-white transition-colors`}>
          <Icon size={24} />
        </div>
        {badge && count > 0 && (
          <span className={`flex items-center text-xs font-bold ${colorClasses.badge} px-2 py-1 rounded-full ${
            badge === 'action' ? 'animate-pulse' : ''
          }`}>
            {badge === 'action' ? 'Azione Richiesta' : 
             badge === 'active' ? 'Attive' : badge}
          </span>
        )}
      </div>
      
      <div>
        <h3 className="text-4xl font-bold text-neutral-800 mb-1">{count}</h3>
        <p className="text-sm text-neutral-500 font-medium">{label}</p>
      </div>
    </motion.div>
  );
}

// Preset di colori predefiniti (INVARIATI)
export const COLOR_PRESETS = {
  blue: {
    bg: 'bg-blue-100',
    text: 'text-blue-600',
    hoverBg: 'group-hover:bg-blue-600',
    hoverBorder: 'hover:border-blue-300',
    badge: 'bg-blue-50 text-blue-600'
  },
  orange: {
    bg: 'bg-orange-100',
    text: 'text-orange-600',
    hoverBg: 'group-hover:bg-orange-500',
    hoverBorder: 'hover:border-orange-300',
    badge: 'bg-orange-50 text-orange-600'
  },
  primary: {
    bg: 'bg-primary/10',
    text: 'text-primary',
    hoverBg: 'group-hover:bg-primary',
    hoverBorder: 'hover:border-primary/30',
    badge: 'bg-primary/5 text-primary'
  },
  success: {
    bg: 'bg-success/10',
    text: 'text-success',
    hoverBg: 'group-hover:bg-success',
    hoverBorder: 'hover:border-success/30',
    badge: 'bg-success/5 text-success'
  },
  green: {
    bg: 'bg-green-100',
    text: 'text-green-600',
    hoverBg: 'group-hover:bg-green-600',
    hoverBorder: 'hover:border-green-300',
    badge: 'bg-green-50 text-green-600'
  }
};