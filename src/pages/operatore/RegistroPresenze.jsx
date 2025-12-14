import { useState, useMemo } from 'react';
import { FileText, Download, Filter, Search, CheckCircle2, AlertCircle, Clock, CalendarOff } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

// Funzione per generare dati storici mockati
const generateHistoryData = () => {
  const data = [];
  const today = new Date();
  
  // Genera ultimi 30 giorni
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // Salta weekend
    if (date.getDay() === 0 || date.getDay() === 6) continue;

    const dateStr = date.toISOString().split('T')[0];
    const seed = date.getDate() + date.getMonth(); // Seed semplice per randomizzazione stabile
    
    let status = 'Presente';
    let entry = '08:55';
    let exit = '18:05';
    let hours = '8h 10m';
    let note = '';

    // Logica Random per simulare storico
    if (i === 0) {
       // Oggi (status pending o parziale)
       status = 'In Corso';
       exit = '--:--';
       hours = 'In calcolo';
    } else if (seed % 13 === 0) {
       status = 'Malattia';
       entry = '--:--';
       exit = '--:--';
       hours = '0h';
       note = 'Certificato inviato';
    } else if (seed % 7 === 0) {
       status = 'Ferie';
       entry = '--:--';
       exit = '--:--';
       hours = '0h';
       note = 'Piano Ferie Natale';
    } else if (seed % 5 === 0) {
       status = 'Permesso';
       entry = '09:00';
       exit = '13:00';
       hours = '4h 00m';
       note = 'Permesso medico';
    } else {
       // --- FIX ORARI VALIDI ---
       // Genera minuti base (es. 50 + variazione)
       const rawMinutes = 50 + (seed % 20); // Range teorico: 50 - 69
       let h = 8;
       let m = rawMinutes;

       // Se minuti > 59, incrementa ora e sottrai 60 minuti
       if (m >= 60) {
           h = 9;
           m -= 60;
       }

       // Formattazione con zero iniziale
       entry = `0${h}:${m.toString().padStart(2, '0')}`;
       
       // Uscita (18:00 - 18:29)
       const exitM = (seed % 30);
       exit = `18:${exitM.toString().padStart(2, '0')}`;
       
       hours = '8h 15m'; // Valore medio indicativo
    }

    data.push({
      id: i,
      date: date,
      dateStr: dateStr,
      status,
      entry,
      exit,
      hours,
      note
    });
  }
  return data;
};

export default function RegistroPresenze() {
  const [searchTerm, setSearchTerm] = useState('');
  const historyData = useMemo(() => generateHistoryData(), []);

  // Filtraggio
  const filteredData = historyData.filter(row => 
      row.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.note.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.dateStr.includes(searchTerm)
  );

  const getStatusStyle = (status) => {
      switch(status) {
          case 'Presente': return 'bg-green-100 text-green-700 border-green-200';
          case 'In Corso': return 'bg-blue-100 text-blue-700 border-blue-200 animate-pulse';
          case 'Ferie': return 'bg-purple-100 text-purple-700 border-purple-200';
          case 'Malattia': return 'bg-red-100 text-red-700 border-red-200';
          case 'Permesso': return 'bg-orange-100 text-orange-700 border-orange-200';
          default: return 'bg-neutral-100 text-neutral-600';
      }
  };

  const getStatusIcon = (status) => {
      switch(status) {
          case 'Presente': return <CheckCircle2 size={14} />;
          case 'In Corso': return <Clock size={14} />;
          case 'Ferie': return <CalendarOff size={14} />;
          case 'Malattia': return <AlertCircle size={14} />;
          case 'Permesso': return <Clock size={14} />;
          default: return null;
      }
  };

  return (
    <div className="p-8 max-w-[1200px] mx-auto min-h-screen space-y-6">
      
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
            <h1 className="text-2xl font-bold text-neutral-800 flex items-center gap-2">
                <FileText className="text-primary" size={28} /> Registro Presenze
            </h1>
            <p className="text-neutral-500 text-sm mt-1">
                Storico attività ultimi 30 giorni lavorativi
            </p>
        </div>
        <Button variant="secondary" className="flex items-center gap-2 text-sm">
            <Download size={16} /> Esporta Excel
        </Button>
      </div>

      <Card className="!p-0 overflow-hidden border border-neutral-200 shadow-sm">
        
        {/* Toolbar Filtri */}
        <div className="p-4 border-b border-neutral-200 bg-neutral-50 flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                <input 
                    type="text" 
                    placeholder="Cerca per stato o note..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                />
            </div>
            <div className="flex items-center gap-2 text-sm text-neutral-500">
                <Filter size={16} />
                <span>Visualizzati: <strong>{filteredData.length}</strong> record</span>
            </div>
        </div>

        {/* Tabella */}
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead className="bg-neutral-50 text-neutral-500 text-xs font-bold uppercase tracking-wider border-b border-neutral-200">
                    <tr>
                        <th className="p-4">Data</th>
                        <th className="p-4">Stato</th>
                        <th className="p-4 text-center">Entrata</th>
                        <th className="p-4 text-center">Uscita</th>
                        <th className="p-4 text-right">Totale Ore</th>
                        <th className="p-4">Note</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 bg-white">
                    {filteredData.map((row) => (
                        <tr key={row.id} className="hover:bg-neutral-50/80 transition-colors group">
                            <td className="p-4 text-sm font-medium text-neutral-800">
                                {/* Visualizzazione Data migliorata: es. "lun 24/11" */}
                                <span className="capitalize">
                                    {row.date.toLocaleDateString('it-IT', { weekday: 'short' })}
                                </span>{' '}
                                {row.date.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' })}
                            </td>
                            <td className="p-4">
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusStyle(row.status)}`}>
                                    {getStatusIcon(row.status)}
                                    {row.status}
                                </span>
                            </td>
                            <td className="p-4 text-center text-sm font-mono text-neutral-600">
                                {row.entry}
                            </td>
                            <td className="p-4 text-center text-sm font-mono text-neutral-600">
                                {row.exit}
                            </td>
                            <td className="p-4 text-right text-sm font-bold text-neutral-700">
                                {row.hours}
                            </td>
                            <td className="p-4 text-xs text-neutral-500 italic max-w-[200px] truncate">
                                {row.note || <span className="text-neutral-300">-</span>}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            
            {filteredData.length === 0 && (
                <div className="p-12 text-center text-neutral-400">
                    <p>Nessun record trovato per i filtri selezionati.</p>
                </div>
            )}
        </div>
      </Card>
    </div>
  );
}