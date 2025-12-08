import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, FileText, CheckCircle, 
  Clock, AlertCircle, ChevronRight, Calendar 
} from 'lucide-react';
import Card from '../../components/ui/Card'; 

// DATI MOCK (Aggiornati a 4 casi attivi per allinearsi alla Dashboard)
const MOCK_LAVORAZIONI = [
  // --- CASI ATTIVI (4 Totali) ---
  { id: 'LAV-2024-105', paziente: 'Mario Rossi', tipo: 'Corona Singola (Zirconio)', data: '2024-02-12', stato: 'working', progress: 65, statusLabel: 'In Ceramizzazione' },
  { id: 'LAV-2024-102', paziente: 'Luigi Bianchi', tipo: 'Ponte 3 Elementi', data: '2024-02-10', stato: 'warning', progress: 80, statusLabel: 'In Prova' },
  { id: 'LAV-2024-110', paziente: 'Francesca Neri', tipo: 'Allineatore Trasparente', data: '2024-02-14', stato: 'working', progress: 30, statusLabel: 'Modellazione' }, // <--- 4° CASO AGGIUNTO
  { id: 'LAV-2024-099', paziente: 'Giuseppe Verdi', tipo: 'Protesi Totale', data: '2024-01-28', stato: 'pending', progress: 10, statusLabel: 'Da Firmare' },

  // --- CASI COMPLETATI ---
  { id: 'LAV-2024-085', paziente: 'Anna Neri', tipo: 'Faccetta E-max', data: '2024-01-15', stato: 'completed', progress: 100, statusLabel: 'Consegnato' },
  { id: 'LAV-2024-082', paziente: 'Marco Gialli', tipo: 'Bite Notturno', data: '2024-01-10', stato: 'completed', progress: 100, statusLabel: 'Consegnato' },
  { id: 'LAV-2023-150', paziente: 'Sofia Blu', tipo: 'Impianto Singolo', data: '2023-12-20', stato: 'completed', progress: 100, statusLabel: 'Consegnato' },
];

export default function LavorazioniDottore() {
  const [filter, setFilter] = useState('tutti');
  const [search, setSearch] = useState('');

  // Logica di filtro CORRETTA
  const filteredList = MOCK_LAVORAZIONI.filter(item => {
    const matchesSearch = item.paziente.toLowerCase().includes(search.toLowerCase()) || item.id.toLowerCase().includes(search.toLowerCase());
    
    if (filter === 'tutti') return matchesSearch;
    
    // ORA "ATTIVI" INCLUDE ANCHE "PENDING" (Il caso al 10%)
    if (filter === 'attivi') {
        return matchesSearch && (item.stato === 'working' || item.stato === 'warning' || item.stato === 'pending');
    }
    
    if (filter === 'completati') return matchesSearch && item.stato === 'completed';
    
    return matchesSearch;
  });

  return (
    <div className="p-8 max-w-[1400px] mx-auto min-h-screen">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-800">Archivio Lavorazioni</h1>
          <p className="text-neutral-500">Consulta lo storico e lo stato di tutte le tue prescrizioni</p>
        </div>
      </div>

      {/* TOOLBAR */}
      <Card className="mb-8 !p-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
            <input 
              type="text" 
              placeholder="Cerca paziente o ID..." 
              className="w-full pl-10 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex p-1 bg-neutral-100 rounded-xl w-full md:w-auto">
            {['tutti', 'attivi', 'completati'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex-1 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  filter === f ? 'bg-white text-primary shadow-sm' : 'text-neutral-500 hover:text-neutral-700'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
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
                  item.stato === 'pending' ? 'bg-neutral-100 text-neutral-500' : // Grigio per pending
                  'bg-primary/10 text-primary'
                }`}>
                  {item.stato === 'completed' ? <CheckCircle size={20} /> : 
                   item.stato === 'warning' ? <AlertCircle size={20} /> : 
                   item.stato === 'pending' ? <FileText size={20} /> : <Clock size={20} />}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 text-center md:text-left">
                  <h4 className="font-bold text-neutral-800">{item.paziente}</h4>
                  <div className="flex items-center justify-center md:justify-start gap-2 text-xs text-neutral-500">
                    <span className="font-mono bg-neutral-50 px-1.5 py-0.5 rounded border">{item.id}</span>
                    <span>• {item.tipo}</span>
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
                  ) : (
                    // Barra Percentuale per Working e Pending
                    <div className="flex flex-col items-end w-full">
                       <span className="text-[10px] font-bold text-primary mb-1">{item.progress}%</span>
                       <div className="w-full h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${item.progress < 20 ? 'bg-neutral-400' : 'bg-primary'}`} 
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