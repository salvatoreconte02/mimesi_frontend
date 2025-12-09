import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, FileText, CheckCircle, Clock, 
  AlertCircle, ChevronRight, Calendar, AlertTriangle 
} from 'lucide-react';
import Card from '../../components/ui/Card'; 

export default function LavorazioniAdmin() {
  const [filter, setFilter] = useState('tutti');
  const [search, setSearch] = useState('');
  const [lavorazioni, setLavorazioni] = useState([]);

  // Carica lavorazioni dal localStorage
  useEffect(() => {
    const stored = localStorage.getItem('mimesi_all_lavorazioni');
    if (stored) {
      setLavorazioni(JSON.parse(stored));
    }
  }, []);

  // Logica filtro ADMIN: attive, in prova, completate, da valutare
  const filteredList = lavorazioni.filter(item => {
    const matchesSearch = 
      item.paziente.toLowerCase().includes(search.toLowerCase()) || 
      item.id.toLowerCase().includes(search.toLowerCase()) ||
      item.dottore?.toLowerCase().includes(search.toLowerCase());
    
    if (filter === 'tutti') return matchesSearch;
    
    if (filter === 'da_valutare') {
      return matchesSearch && item.stato === 'pending';
    }
    
    if (filter === 'attivi') {
      return matchesSearch && (item.stato === 'working');
    }
    
    if (filter === 'in_prova') {
      return matchesSearch && item.stato === 'warning';
    }
    
    if (filter === 'completati') {
      return matchesSearch && item.stato === 'completed';
    }
    
    return matchesSearch;
  });

  return (
    <div className="p-8 max-w-[1400px] mx-auto min-h-screen">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-800">Gestione Lavorazioni</h1>
          <p className="text-neutral-500">Monitora tutte le prescrizioni del laboratorio</p>
        </div>
        <div className="flex gap-2">
          <span className="px-3 py-1.5 bg-white border rounded-lg text-sm">
            <span className="font-bold text-primary">{lavorazioni.length}</span> Totali
          </span>
        </div>
      </div>

      {/* TOOLBAR */}
      <Card className="mb-8 !p-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
            <input 
              type="text" 
              placeholder="Cerca paziente, ID o dottore..." 
              className="w-full pl-10 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex p-1 bg-neutral-100 rounded-xl w-full md:w-auto overflow-x-auto">
            {[
              { id: 'tutti', label: 'Tutti' },
              { id: 'da_valutare', label: 'Da Valutare' },
              { id: 'attivi', label: 'Attivi' },
              { id: 'in_prova', label: 'In Prova' },
              { id: 'completati', label: 'Completati' }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  filter === f.id ? 'bg-white text-primary shadow-sm' : 'text-neutral-500 hover:text-neutral-700'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* LISTA LAVORAZIONI */}
      <div className="space-y-3">
        {filteredList.length > 0 ? (
          filteredList.map((item, index) => (
            <motion.div 
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className="group bg-white rounded-xl p-4 border border-neutral-100 hover:border-primary/30 hover:shadow-md transition-all cursor-pointer flex flex-col md:flex-row items-center gap-4">
                
                {/* Icona Stato */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  item.stato === 'completed' ? 'bg-success/10 text-success' :
                  item.stato === 'warning' ? 'bg-warning/10 text-warning' :
                  item.stato === 'pending' ? 'bg-orange-100 text-orange-500' :
                  'bg-primary/10 text-primary'
                }`}>
                  {item.stato === 'completed' ? <CheckCircle size={20} /> : 
                   item.stato === 'warning' ? <AlertCircle size={20} /> : 
                   item.stato === 'pending' ? <AlertTriangle size={20} /> : 
                   <Clock size={20} />}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 text-center md:text-left">
                  <h4 className="font-bold text-neutral-800">{item.paziente}</h4>
                  <div className="flex items-center justify-center md:justify-start gap-2 text-xs text-neutral-500 flex-wrap">
                    <span className="font-mono bg-neutral-50 px-1.5 py-0.5 rounded border">{item.id}</span>
                    <span>• {item.tipo}</span>
                    {item.dottore && <span>• Dr. {item.dottore}</span>}
                  </div>
                </div>

                {/* Data */}
                <div className="text-sm text-neutral-500 flex items-center gap-1 shrink-0">
                  <Calendar size={14} /> {item.data}
                </div>

                {/* Stato / Progresso */}
                <div className="w-full md:w-32 shrink-0 flex justify-end">
                  {item.stato === 'completed' ? (
                     <span className="inline-block px-3 py-1 bg-success/10 text-success text-xs font-bold rounded-full">
                       Completato
                     </span>
                  ) : item.stato === 'warning' ? (
                     <span className="inline-block px-3 py-1 bg-warning text-white text-xs font-bold rounded-full shadow-sm animate-pulse">
                       {item.statusLabel}
                     </span>
                  ) : item.stato === 'pending' ? (
                     <span className="inline-block px-3 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-full border border-orange-200">
                       Da Valutare
                     </span>
                  ) : (
                    // Barra Percentuale per Working
                    <div className="flex flex-col items-end w-full">
                       <span className="text-[10px] font-bold text-primary mb-1">{item.progress}%</span>
                       <div className="w-full h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary" 
                            style={{ width: `${item.progress}%` }} 
                          />
                       </div>
                    </div>
                  )}
                </div>

                <ChevronRight className="text-neutral-300 group-hover:text-primary transition-colors" size={20} />
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-12 text-neutral-400">
            <FileText className="mx-auto mb-2 opacity-20" size={48} />
            <p>Nessuna lavorazione trovata.</p>
          </div>
        )}
      </div>
    </div>
  );
}