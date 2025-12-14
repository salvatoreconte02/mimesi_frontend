import { Package, AlertTriangle, ArrowRight, AlertCircle } from 'lucide-react';
import { MOCK_WAREHOUSE } from '../../data/mockWarehouse';

export default function MagazzinoWidget({ onNavigate }) {
  // Filtra solo gli elementi che richiedono attenzione (sotto soglia o in scadenza)
  const criticalItems = MOCK_WAREHOUSE.filter(item => 
    item.quantita <= item.soglia || item.stato === 'critical' || item.stato === 'expiring'
  ).slice(0, 4); // Mostra solo i primi 4 per il widget

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden h-full flex flex-col">
      <div className="px-5 py-4 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/50">
        <h3 className="font-bold text-neutral-800 flex items-center gap-2">
          <Package size={18} className="text-primary"/> Magazzino
        </h3>
        <button onClick={onNavigate} className="text-sm font-bold text-primary hover:underline flex items-center gap-1">
          Vedi tutto <ArrowRight size={16} />
        </button>
      </div>

      <div className="p-3 flex-1 overflow-y-auto custom-scrollbar">
        {criticalItems.length > 0 ? (
          <div className="space-y-2">
            {criticalItems.map((item) => {
              const isCritical = item.quantita === 0;
              const isExpiring = item.stato === 'expiring';
              
              return (
                <div key={item.id} className="flex items-center justify-between p-3 bg-white hover:bg-neutral-50 rounded-lg border border-neutral-100 shadow-sm transition-colors group">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 
                      ${isCritical ? 'bg-red-100 text-red-600' : isExpiring ? 'bg-orange-100 text-orange-600' : 'bg-yellow-100 text-yellow-600'}`}>
                      {isCritical ? <AlertCircle size={16}/> : <AlertTriangle size={16}/>}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-sm text-neutral-800 truncate">{item.nome}</h4>
                      <p className="text-[10px] text-neutral-500 truncate">
                        Soglia: {item.soglia} {item.unita}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right shrink-0">
                    <span className={`block text-lg font-bold leading-none 
                      ${item.quantita <= 1 ? 'text-red-600' : 'text-orange-500'}`}>
                      {item.quantita}
                    </span>
                    <span className="text-[9px] text-neutral-400 uppercase font-bold">{item.unita}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-neutral-400">
            <Package size={32} className="mb-2 text-green-500 opacity-50" />
            <p className="text-sm">Magazzino OK</p>
          </div>
        )}
      </div>
      
      {/* Alert Footer se ci sono troppi elementi critici */}
      {criticalItems.length > 0 && (
        <div className="px-4 py-2 bg-red-50 border-t border-red-100 text-[10px] text-red-600 font-medium text-center">
           Necessario riordino urgente per {criticalItems.length} articoli
        </div>
      )}
    </div>
  );
}