import { useState } from 'react';
import { 
  Search, Package, Plus, AlertTriangle, 
  Archive, CalendarClock, MoreVertical 
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { MOCK_WAREHOUSE } from '../../data/mockWarehouse';

export default function Magazzino() {
  const [filter, setFilter] = useState('tutti'); // tutti, critical, expiring
  const [search, setSearch] = useState('');
  
  // Statistiche rapide
  const totalItems = MOCK_WAREHOUSE.length;
  const lowStock = MOCK_WAREHOUSE.filter(i => i.quantita <= i.soglia).length;
  const expiring = MOCK_WAREHOUSE.filter(i => i.stato === 'expiring').length;

  const filteredItems = MOCK_WAREHOUSE.filter(item => {
    const matchesSearch = item.nome.toLowerCase().includes(search.toLowerCase()) || 
                          item.categoria.toLowerCase().includes(search.toLowerCase());
    
    if (filter === 'critical') return matchesSearch && (item.quantita <= item.soglia);
    if (filter === 'expiring') return matchesSearch && (item.stato === 'expiring');
    return matchesSearch;
  });

  return (
    <div className="p-8 max-w-[1600px] mx-auto min-h-screen space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-800 flex items-center gap-3">
            <Package className="text-primary" size={32}/> Magazzino & Materiali
          </h1>
          <p className="text-neutral-500 mt-1">Gestione scorte, lotti e riordini materiali.</p>
        </div>
        <Button>
           <Plus size={20} className="mr-2" /> Aggiungi Prodotto
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm flex items-center gap-4">
           <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Archive size={24}/>
           </div>
           <div>
              <p className="text-sm text-neutral-500 font-medium">Totale Articoli</p>
              <h4 className="text-2xl font-bold text-neutral-800">{totalItems}</h4>
           </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm flex items-center gap-4">
           <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
              <AlertTriangle size={24}/>
           </div>
           <div>
              <p className="text-sm text-neutral-500 font-medium">Sotto Soglia</p>
              <h4 className="text-2xl font-bold text-neutral-800">{lowStock}</h4>
           </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm flex items-center gap-4">
           <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <CalendarClock size={24}/>
           </div>
           <div>
              <p className="text-sm text-neutral-500 font-medium">In Scadenza</p>
              <h4 className="text-2xl font-bold text-neutral-800">{expiring}</h4>
           </div>
        </div>
      </div>

      {/* Main Content */}
      <Card className="!p-0 overflow-hidden min-h-[500px]">
        {/* Toolbar */}
        <div className="p-4 border-b border-neutral-100 flex flex-col md:flex-row gap-4 justify-between items-center bg-neutral-50/50">
           <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
              <input 
                type="text" 
                placeholder="Cerca per nome, categoria o lotto..." 
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
           </div>
           
           <div className="flex bg-white p-1 rounded-xl border border-neutral-200 shadow-sm">
              <button 
                onClick={() => setFilter('tutti')}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${filter === 'tutti' ? 'bg-neutral-100 text-neutral-800 font-bold' : 'text-neutral-500 hover:bg-neutral-50'}`}
              >
                Tutti
              </button>
              <button 
                onClick={() => setFilter('critical')}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${filter === 'critical' ? 'bg-orange-50 text-orange-700 font-bold' : 'text-neutral-500 hover:bg-neutral-50'}`}
              >
                <AlertTriangle size={14}/> Sotto Soglia
              </button>
              <button 
                onClick={() => setFilter('expiring')}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${filter === 'expiring' ? 'bg-red-50 text-red-700 font-bold' : 'text-neutral-500 hover:bg-neutral-50'}`}
              >
                <CalendarClock size={14}/> In Scadenza
              </button>
           </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-neutral-50 text-neutral-500 text-xs uppercase font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">Prodotto</th>
                <th className="px-6 py-4">Categoria</th>
                <th className="px-6 py-4">Lotto</th>
                <th className="px-6 py-4 text-center">Quantità</th>
                <th className="px-6 py-4 text-center">Stato</th>
                <th className="px-6 py-4">Scadenza</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredItems.map((item) => {
                const percentage = Math.min((item.quantita / (item.soglia * 2)) * 100, 100);
                const isCritical = item.quantita <= item.soglia;
                const isZero = item.quantita === 0;

                return (
                  <tr key={item.id} className="hover:bg-neutral-50/80 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="font-bold text-sm text-neutral-800">{item.nome}</p>
                      <p className="text-[10px] text-neutral-400">ID: #{item.id}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded bg-neutral-100 border border-neutral-200 text-xs font-medium text-neutral-600">
                        {item.categoria}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-600 font-mono">
                      {item.lotto}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className={`text-sm font-bold ${isCritical ? 'text-red-600' : 'text-neutral-800'}`}>
                          {item.quantita} <span className="text-[10px] text-neutral-400 font-normal">{item.unita}</span>
                        </span>
                        {/* Progress Bar Semplificata */}
                        <div className="w-16 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                           <div 
                             className={`h-full rounded-full ${isZero ? 'bg-transparent' : isCritical ? 'bg-red-500' : 'bg-green-500'}`} 
                             style={{ width: `${percentage}%` }}
                           />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                       {isZero ? (
                         <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 uppercase tracking-wide">Esaurito</span>
                       ) : isCritical ? (
                         <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-700 uppercase tracking-wide">Ordina</span>
                       ) : (
                         <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700 uppercase tracking-wide">Disp.</span>
                       )}
                    </td>
                    <td className="px-6 py-4">
                       {item.scadenza ? (
                         <div className={`flex items-center gap-2 text-sm ${item.stato === 'expiring' ? 'text-red-600 font-bold' : 'text-neutral-600'}`}>
                            {item.stato === 'expiring' && <AlertTriangle size={14} />}
                            {new Date(item.scadenza).toLocaleDateString()}
                         </div>
                       ) : <span className="text-xs text-neutral-400">-</span>}
                    </td>
                    <td className="px-6 py-4 text-right">
                       <button className="p-2 hover:bg-neutral-200 rounded-full text-neutral-400 transition-colors">
                          <MoreVertical size={16} />
                       </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredItems.length === 0 && (
             <div className="p-12 text-center text-neutral-400">
                <Package size={48} className="mx-auto mb-3 opacity-20"/>
                <p>Nessun prodotto trovato</p>
             </div>
          )}
        </div>
      </Card>
    </div>
  );
}