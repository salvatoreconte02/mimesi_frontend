import { GROUP_COLORS } from '../dental/VisualOdontogram'; 
import logoImg from '../../assets/mimesilogo.jpg';

// Componente Checkbox SI/NO stilizzato come nel modulo cartaceo
const CheckboxField = ({ label, checked }) => (
  <div className="flex items-center gap-1 text-[9px]">
    <span className="text-neutral-600">{label}</span>
    <div className="flex gap-0.5">
      <span className={`w-4 h-4 border border-neutral-400 flex items-center justify-center text-[7px] font-bold ${checked ? 'bg-neutral-800 text-white' : 'bg-white text-neutral-400'}`}>
        SI
      </span>
      <span className={`w-4 h-4 border border-neutral-400 flex items-center justify-center text-[7px] font-bold ${!checked ? 'bg-neutral-800 text-white' : 'bg-white text-neutral-400'}`}>
        NO
      </span>
    </div>
  </div>
);

// Componente per campo con sottolineatura
const UnderlineField = ({ label, value, width = 'flex-1' }) => (
  <div className={`flex items-baseline gap-1 ${width}`}>
    <span className="text-[9px] text-neutral-600 whitespace-nowrap">{label}</span>
    <div className="flex-1 border-b border-neutral-400 min-h-[14px] px-1">
      <span className="text-[10px] font-medium text-neutral-800">{value || ''}</span>
    </div>
  </div>
);

// Componente Odontogramma Numerico (stile modulo cartaceo)
const NumericOdontogram = ({ elements = [] }) => {
  const selectedTeeth = elements.flatMap(el => el.teeth || []);
  
  const upperRight = ['18', '17', '16', '15', '14', '13', '12', '11'];
  const upperLeft = ['21', '22', '23', '24', '25', '26', '27', '28'];
  const lowerRight = ['48', '47', '46', '45', '44', '43', '42', '41'];
  const lowerLeft = ['31', '32', '33', '34', '35', '36', '37', '38'];

  const ToothNumber = ({ num }) => {
    const isSelected = selectedTeeth.includes(num);
    return (
      <span className={`w-5 h-5 flex items-center justify-center text-[9px] font-mono ${
        isSelected 
          ? 'bg-neutral-800 text-white rounded-full font-bold' 
          : 'text-neutral-500'
      }`}>
        {num}
      </span>
    );
  };

  return (
    <div className="border border-neutral-300 p-2 bg-white">
      <div className="flex justify-center gap-0">
        <div className="flex">
          {upperRight.map(n => <ToothNumber key={n} num={n} />)}
        </div>
        <div className="w-px bg-neutral-400 mx-1" />
        <div className="flex">
          {upperLeft.map(n => <ToothNumber key={n} num={n} />)}
        </div>
      </div>
      <div className="h-px bg-neutral-400 my-1" />
      <div className="flex justify-center gap-0">
        <div className="flex">
          {lowerRight.map(n => <ToothNumber key={n} num={n} />)}
        </div>
        <div className="w-px bg-neutral-400 mx-1" />
        <div className="flex">
          {lowerLeft.map(n => <ToothNumber key={n} num={n} />)}
        </div>
      </div>
    </div>
  );
};

// Componente Header riutilizzabile per tutte le pagine
const PageHeader = () => (
  <div className="flex items-stretch h-16 border-b-2 border-neutral-300">
    <div className="flex items-center px-6 bg-white flex-1">
      <div className="flex items-center gap-2">
        <img src={logoImg} alt="Mimesi Logo" className="w-9 h-9 object-contain rounded-lg" />
        <span className="text-xl font-bold text-[#2D5BA6] tracking-tight">MIMESI</span>
      </div>
    </div>
    <div className="w-48 bg-gradient-to-r from-[#3B82F6] to-[#1E40AF]" />
  </div>
);

// Prezzi base per materiale (stessa logica di StepQuote)
const BASE_PRICES = { 
  'zirconio': 120, 
  'disilicato': 140, 
  'metallo_ceramica': 100, 
  'pmma': 50, 
  'resina': 40 
};
const SHIPMENT_COST = 8;

export default function DocumentPreview({ data, quote, setQuote }) {
  const pageStyle = "w-[595px] h-[842px] bg-white shadow-xl mx-auto mb-8 relative text-neutral-800 flex flex-col overflow-hidden";

  // Valori sicuri
  const safeQuote = {
    total: quote?.total || 0,
    elementsTotal: quote?.elementsTotal || 0,
    shipmentTotal: quote?.shipmentTotal || 0,
    shipmentCount: quote?.shipmentCount || 1,
    elementCount: quote?.elementCount || 0,
    groupCount: quote?.groupCount || 0,
    groupPrices: quote?.groupPrices || []
  };

  const materialLabel = data?.technicalInfo?.material?.replace(/_/g, ' ') || 'N/D';
  const totalElements = (data?.elements || []).reduce((acc, el) => acc + (el.teeth?.length || 0), 0);

  // Data formattata
  const today = new Date();
  const formattedDate = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;

  // Calcola prezzi per la visualizzazione (se quote non ha groupPrices)
  const basePrice = BASE_PRICES[data?.technicalInfo?.material] || 100;
  const displayGroupPrices = safeQuote.groupPrices.length > 0 
    ? safeQuote.groupPrices 
    : (data?.elements || []).map((el, idx) => ({
        groupId: el.id || idx,
        groupIndex: el.groupIndex ?? idx,
        teeth: el.teeth || [],
        isBridge: el.isBridge,
        unitPrice: basePrice,
        elementCount: el.teeth?.length || 0
      }));

  // Calcola totali per visualizzazione
  const elementsTotal = displayGroupPrices.reduce((acc, g) => acc + (g.unitPrice * g.elementCount), 0);
  const shipmentCount = 1 + (data?.dates?.tryIn1 ? 1 : 0) + (data?.dates?.tryIn2 ? 1 : 0) + (data?.dates?.tryIn3 ? 1 : 0);
  const shipmentTotal = shipmentCount * SHIPMENT_COST;
  const grandTotal = safeQuote.total > 0 ? safeQuote.total : (elementsTotal + shipmentTotal);

  return (
    <div className="flex flex-col items-center">
      
      {/* ========== PAGINA 1: MPO - MODULO DI PRESCRIZIONE ODONTOIATRICO ========== */}
      <div className={pageStyle}>
        
        <PageHeader />

        {/* TITOLO */}
        <div className="text-center py-3 border-b border-neutral-200">
          <h1 className="text-lg font-bold text-neutral-800 tracking-wide">MODULO DI PRESCRIZIONE ODONTOIATRICO</h1>
          <p className="text-[8px] text-neutral-500 mt-0.5">Il seguente documento è conforme alla D.lva 2007/47/CE concernente i dispositivi medici</p>
        </div>

        {/* CORPO DEL MODULO */}
        <div className="flex-1 px-6 py-4 text-[10px] space-y-4">
          
          {/* Data */}
          <div className="flex justify-end">
            <div className="flex items-center gap-2">
              <span className="text-neutral-600">Data</span>
              <div className="flex gap-1">
                <span className="border border-neutral-400 px-2 py-0.5 bg-white font-mono text-[9px]">{today.getDate().toString().padStart(2, '0')}</span>
                <span>/</span>
                <span className="border border-neutral-400 px-2 py-0.5 bg-white font-mono text-[9px]">{(today.getMonth() + 1).toString().padStart(2, '0')}</span>
                <span>/</span>
                <span className="border border-neutral-400 px-2 py-0.5 bg-white font-mono text-[9px]">{today.getFullYear()}</span>
              </div>
            </div>
          </div>

          {/* STUDIO ODONTOIATRICO */}
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-[11px] uppercase">Studio Odontoiatrico</span>
            <div className="flex-1 border-b-2 border-neutral-400 px-2 py-1">
              <span className="font-medium">{data?.nomeStudio || `Studio Dr. ${data?.nomeDottore} ${data?.cognomeDottore}`}</span>
            </div>
          </div>

          {/* SEZIONE PAZIENTE */}
          <div className="border border-neutral-300 p-3 bg-neutral-50/50">
            <p className="text-center text-[10px] font-medium text-neutral-600 mb-3">Si richiede per il paziente</p>
            
            <div className="text-[8px] text-neutral-400 mb-1">*Campi obbligatori</div>
            
            <div className="flex gap-2 mb-2">
              <UnderlineField label="*Nome e Cognome" value={`${data?.nome || ''} ${data?.cognome || ''}`} />
            </div>
            
            <div className="flex items-center gap-4 mb-3">
              <UnderlineField label="Codice Paziente n." value={data?.codicePaziente} width="w-40" />
              <UnderlineField label="Età" value={data?.eta} width="w-16" />
              <div className="flex items-center gap-1 text-[9px]">
                <span className="text-neutral-600">Sesso</span>
                <span className={`w-5 h-5 border border-neutral-400 flex items-center justify-center text-[8px] font-bold ${data?.sesso === 'F' ? 'bg-neutral-800 text-white' : 'bg-white'}`}>F</span>
                <span className={`w-5 h-5 border border-neutral-400 flex items-center justify-center text-[8px] font-bold ${data?.sesso === 'M' ? 'bg-neutral-800 text-white' : 'bg-white'}`}>M</span>
              </div>
              <CheckboxField label="Bruxista" checked={data?.bruxismo} />
            </div>

            <div className="flex items-center justify-between flex-wrap gap-2">
              <CheckboxField label="Allergie accertate" checked={data?.allergie} />
              <CheckboxField label="Disfunzioni articolari" checked={data?.disfunzioni} />
              <CheckboxField label="Handicap psicomotori" checked={data?.handicap} />
              <CheckboxField label="Altri dispositivi presenti" checked={data?.dispositivi} />
            </div>
          </div>

          {/* DESCRIZIONE DISPOSITIVO */}
          <div>
            <p className="text-[9px] text-neutral-600 mb-2">
              La realizzazione di un dispositivo medico odontoiatrico su misura con le seguenti caratteristiche
            </p>
            
            <div className="mb-2">
              <span className="text-[9px] font-bold">*Descrizione e specifica</span>
            </div>
            <div className="border border-neutral-400 bg-white p-2 min-h-[60px]">
              <p className="text-[10px] text-neutral-700 leading-relaxed">
                {data?.technicalInfo?.description || 
                  `Dispositivo protesico fisso composto da ${totalElements} elemento/i.
Tipologia: ${(data?.elements || []).map(el => el.isBridge ? `Ponte (${el.teeth?.length} elem.)` : 'Corona singola').join(', ') || 'N/D'}`
                }
              </p>
            </div>
          </div>

          {/* ELEMENTI - Odontogramma */}
          <div className="space-y-3">
            <div>
              <span className="text-[9px] font-bold">*Elementi</span>
            </div>
            <NumericOdontogram elements={data?.elements} />
            
            <div className="flex gap-4 pt-2">
              <UnderlineField label="*Colore" value={data?.technicalInfo?.color} width="w-32" />
              <UnderlineField label="*Materiale" value={materialLabel} width="flex-1" />
            </div>
          </div>

          {/* MATERIALI ALLEGATI */}
          <div>
            <p className="text-center text-[10px] font-medium text-neutral-600 mb-2">Materiali allegati</p>
            <div className="flex gap-6">
              <UnderlineField label="Impronte rilevate in" value={data?.impressionParams?.material?.replace(/_/g, ' ')} />
              <UnderlineField label="Disinfettate in" value={data?.impressionParams?.disinfection?.replace(/_/g, ' ')} />
            </div>
          </div>

          {/* DATA CONSEGNA */}
          <div className="pt-2">
            <p className="text-[9px] font-medium text-neutral-600 mb-2">
              Data consegna dispositivo
              <span className="text-[8px] text-neutral-400 ml-2">da concordare con il laboratorio</span>
            </p>
            <div className="grid grid-cols-4 gap-4">
              <UnderlineField label="1° prova" value={data?.dates?.tryIn1 ? new Date(data.dates.tryIn1).toLocaleDateString() : ''} />
              <UnderlineField label="2° prova" value={data?.dates?.tryIn2 ? new Date(data.dates.tryIn2).toLocaleDateString() : ''} />
              <UnderlineField label="3° prova" value={data?.dates?.tryIn3 ? new Date(data.dates.tryIn3).toLocaleDateString() : ''} />
              <UnderlineField label="Finito" value={data?.dates?.delivery ? new Date(data.dates.delivery).toLocaleDateString() : ''} />
            </div>
          </div>
        </div>

        <div className="h-6 bg-gradient-to-r from-[#1E40AF] to-[#3B82F6]" />
        
        <div className="absolute bottom-8 left-0 right-0 text-center">
          <span className="text-[8px] text-neutral-400">Pagina 1 di 3 • Modulo di Prescrizione Odontoiatrico</span>
        </div>
      </div>

      {/* ========== PAGINA 2: PREVENTIVO ECONOMICO (OTTIMIZZATO) ========== */}
      <div className={pageStyle}>
        <PageHeader />

        {/* Titolo */}
        <div className="text-center py-3 border-b border-neutral-200">
          <h1 className="text-lg font-bold text-neutral-800 tracking-wide">PREVENTIVO ECONOMICO</h1>
          <p className="text-[8px] text-neutral-500 mt-0.5">Dettaglio costi lavorazione • Rif: {data?.id || 'BOZZA'}</p>
        </div>

        {/* Contenuto Preventivo */}
        <div className="flex-1 px-6 py-4 flex flex-col">
          
          {/* Info Cliente */}
          <div className="flex justify-between items-start mb-4 pb-3 border-b border-neutral-200">
            <div className="text-[10px]">
              <p className="text-neutral-500">Paziente</p>
              <p className="font-bold text-neutral-800">{data?.cognome} {data?.nome}</p>
              <p className="text-neutral-500 font-mono text-[9px]">{data?.codicePaziente}</p>
            </div>
            <div className="text-[10px] text-right">
              <p className="text-neutral-500">Medico Prescrittore</p>
              <p className="font-bold text-neutral-800">Dr. {data?.nomeDottore} {data?.cognomeDottore}</p>
              <p className="text-neutral-500">{data?.nomeStudio}</p>
            </div>
          </div>

          {/* Tabella Dettaglio Elementi */}
          <div className="mb-4">
            <h3 className="text-[11px] font-bold text-neutral-700 uppercase tracking-wider mb-2 flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-[#2D5BA6] text-white flex items-center justify-center text-[9px]">1</span>
              Dettaglio Elementi
            </h3>
            
            <table className="w-full text-[10px] border-collapse">
              <thead>
                <tr className="bg-neutral-100">
                  <th className="border border-neutral-300 px-2 py-1.5 text-left font-bold text-neutral-700">Gruppo</th>
                  <th className="border border-neutral-300 px-2 py-1.5 text-left font-bold text-neutral-700">Elementi</th>
                  <th className="border border-neutral-300 px-2 py-1.5 text-left font-bold text-neutral-700">Tipologia</th>
                  <th className="border border-neutral-300 px-2 py-1.5 text-center font-bold text-neutral-700">Quantità</th>
                  <th className="border border-neutral-300 px-2 py-1.5 text-right font-bold text-neutral-700">Prezzo/u</th>
                  <th className="border border-neutral-300 px-2 py-1.5 text-right font-bold text-neutral-700">Subtotale</th>
                </tr>
              </thead>
              <tbody>
                {displayGroupPrices.map((group, idx) => {
                  const subtotal = group.unitPrice * group.elementCount;
                  const style = GROUP_COLORS[(group.groupIndex ?? idx) % GROUP_COLORS.length];
                  return (
                    <tr key={group.groupId || idx} className="hover:bg-neutral-50">
                      <td className="border border-neutral-300 px-2 py-1.5">
                        <div className="flex items-center gap-1.5">
                          <div className={`w-4 h-4 rounded-full ${style.bg} ${style.text} flex items-center justify-center text-[8px] font-bold`}>
                            {idx + 1}
                          </div>
                          <span className="font-medium">G{idx + 1}</span>
                        </div>
                      </td>
                      <td className="border border-neutral-300 px-2 py-1.5 font-mono text-[9px]">
                        {group.teeth?.join('-') || '-'}
                      </td>
                      <td className="border border-neutral-300 px-2 py-1.5">
                        {group.isBridge ? 'Ponte' : 'Singolo'} • {materialLabel}
                      </td>
                      <td className="border border-neutral-300 px-2 py-1.5 text-center font-bold">
                        {group.elementCount}
                      </td>
                      <td className="border border-neutral-300 px-2 py-1.5 text-right font-mono">
                        € {group.unitPrice.toFixed(2)}
                      </td>
                      <td className="border border-neutral-300 px-2 py-1.5 text-right font-bold font-mono">
                        € {subtotal.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-neutral-50">
                  <td colSpan={3} className="border border-neutral-300 px-2 py-1.5 text-right font-medium text-neutral-600">
                    Subtotale Elementi
                  </td>
                  <td className="border border-neutral-300 px-2 py-1.5 text-center font-bold">
                    {totalElements}
                  </td>
                  <td className="border border-neutral-300 px-2 py-1.5"></td>
                  <td className="border border-neutral-300 px-2 py-1.5 text-right font-bold font-mono">
                    € {elementsTotal.toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Spedizioni */}
          <div className="mb-4">
            <h3 className="text-[11px] font-bold text-neutral-700 uppercase tracking-wider mb-2 flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-[#2D5BA6] text-white flex items-center justify-center text-[9px]">2</span>
              Logistica e Spedizioni
            </h3>
            
            <table className="w-full text-[10px] border-collapse">
              <tbody>
                <tr>
                  <td className="border border-neutral-300 px-2 py-1.5">
                    Spedizioni A/R
                    <span className="text-[9px] text-neutral-400 ml-2">
                      (1 consegna{data?.dates?.tryIn1 ? ' + prova 1' : ''}{data?.dates?.tryIn2 ? ' + prova 2' : ''}{data?.dates?.tryIn3 ? ' + prova 3' : ''})
                    </span>
                  </td>
                  <td className="border border-neutral-300 px-2 py-1.5 text-center w-20">
                    {shipmentCount}
                  </td>
                  <td className="border border-neutral-300 px-2 py-1.5 text-right w-24 font-mono">
                    € {SHIPMENT_COST.toFixed(2)}/cad
                  </td>
                  <td className="border border-neutral-300 px-2 py-1.5 text-right w-28 font-bold font-mono">
                    € {shipmentTotal.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Note */}
          <div className="mb-4 p-3 bg-neutral-50 border border-neutral-200 rounded">
            <h4 className="text-[9px] font-bold text-neutral-600 uppercase mb-1">Note</h4>
            <p className="text-[9px] text-neutral-500 leading-relaxed">
              Il presente preventivo ha validità 30 giorni dalla data di emissione. I prezzi indicati sono IVA esclusa. 
              Eventuali modifiche richieste dopo l'approvazione potrebbero comportare variazioni sui costi e tempi di consegna.
            </p>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* TOTALE FINALE - Sempre visibile in fondo */}
          <div className="bg-gradient-to-r from-[#1E40AF] to-[#3B82F6] rounded-lg p-4 text-white">
            <div className="flex justify-between items-center mb-3">
              <div>
                <p className="text-[10px] text-blue-100 uppercase font-bold tracking-wider">Totale Preventivo</p>
                <p className="text-3xl font-bold mt-0.5">€ {grandTotal.toFixed(2)}</p>
              </div>
              <div className="text-right">
                <div className="bg-white/20 rounded-lg px-3 py-1.5 backdrop-blur-sm">
                  <p className="text-[9px] text-blue-100">Elementi</p>
                  <p className="text-lg font-bold">{totalElements}</p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between text-[10px] pt-2 border-t border-white/20">
              <div className="flex gap-6">
                <div>
                  <span className="text-blue-200">Lavorazione</span>
                  <span className="font-bold ml-2">€ {elementsTotal.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-blue-200">Spedizioni</span>
                  <span className="font-bold ml-2">€ {shipmentTotal.toFixed(2)}</span>
                </div>
              </div>
              <div>
                <span className="text-blue-200">Data</span>
                <span className="font-bold ml-2">{formattedDate}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="h-6 bg-gradient-to-r from-[#1E40AF] to-[#3B82F6]" />
        
        <div className="absolute bottom-8 left-0 right-0 text-center">
          <span className="text-[8px] text-neutral-400">Pagina 2 di 3 • Preventivo Economico</span>
        </div>
      </div>

      {/* ========== PAGINA 3: DICHIARAZIONE DI PRESA VISIONE ========== */}
      <div className={pageStyle}>
        <PageHeader />

        {/* Titolo */}
        <div className="text-center py-3 border-b border-neutral-200">
          <h1 className="text-lg font-bold text-neutral-800 tracking-wide">DICHIARAZIONE DI PRESA VISIONE</h1>
          <p className="text-[8px] text-neutral-500 mt-0.5">Conferma ordine e accettazione condizioni</p>
        </div>

        {/* Contenuto Dichiarazione */}
        <div className="flex-1 px-8 py-6 flex flex-col">
          
          {/* Riferimento Documenti */}
          <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4 mb-6">
            <h3 className="text-[11px] font-bold text-neutral-700 uppercase tracking-wider mb-3">Documenti di Riferimento</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-[#2D5BA6] text-white flex items-center justify-center text-[10px] font-bold">1</div>
                <div>
                  <span className="text-[10px] font-medium text-neutral-800">Modulo di Prescrizione Odontoiatrico (MPO)</span>
                  <span className="text-[9px] text-neutral-500 ml-2">Pagina 1</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-[#2D5BA6] text-white flex items-center justify-center text-[10px] font-bold">2</div>
                <div>
                  <span className="text-[10px] font-medium text-neutral-800">Preventivo Economico</span>
                  <span className="text-[9px] text-neutral-500 ml-2">Pagina 2</span>
                </div>
              </div>
            </div>
          </div>

          {/* Riepilogo Ordine */}
          <div className="border border-neutral-200 rounded-lg p-4 mb-6">
            <h3 className="text-[11px] font-bold text-neutral-700 uppercase tracking-wider mb-3">Riepilogo Ordine</h3>
            <div className="grid grid-cols-2 gap-4 text-[10px]">
              <div>
                <span className="text-neutral-500">Riferimento:</span>
                <span className="font-mono font-bold ml-2">{data?.id || 'BOZZA'}</span>
              </div>
              <div>
                <span className="text-neutral-500">Data:</span>
                <span className="font-medium ml-2">{formattedDate}</span>
              </div>
              <div>
                <span className="text-neutral-500">Paziente:</span>
                <span className="font-medium ml-2">{data?.cognome} {data?.nome}</span>
              </div>
              <div>
                <span className="text-neutral-500">Elementi:</span>
                <span className="font-medium ml-2">{totalElements}</span>
              </div>
              <div>
                <span className="text-neutral-500">Materiale:</span>
                <span className="font-medium ml-2 capitalize">{materialLabel}</span>
              </div>
              <div>
                <span className="text-neutral-500">Consegna:</span>
                <span className="font-medium ml-2">{data?.dates?.delivery ? new Date(data.dates.delivery).toLocaleDateString() : '-'}</span>
              </div>
            </div>
            
            {/* Importo in evidenza */}
            <div className="mt-4 pt-3 border-t border-neutral-200 flex justify-between items-center">
              <span className="text-[10px] font-bold text-neutral-700 uppercase">Importo Totale</span>
              <span className="text-xl font-bold text-[#2D5BA6]">€ {grandTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Testo Dichiarazione */}
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-5 mb-8">
            <p className="text-[10px] text-blue-900 leading-relaxed text-justify">
              Il/La sottoscritto/a <strong>Dr./Dr.ssa {data?.nomeDottore} {data?.cognomeDottore}</strong>, 
              in qualità di medico prescrittore, dichiara di aver preso visione del <strong>Modulo di Prescrizione 
              Odontoiatrico (pag. 1)</strong> e del <strong>Preventivo Economico (pag. 2)</strong> relativi 
              alla lavorazione identificata con riferimento <strong>{data?.id || 'BOZZA'}</strong> per il 
              paziente <strong>{data?.cognome} {data?.nome}</strong>.
            </p>
            <p className="text-[10px] text-blue-900 leading-relaxed text-justify mt-3">
              Con la presente firma, si accettano integralmente le specifiche tecniche descritte e si autorizza 
              il laboratorio <strong>Mimesi Lab</strong> a procedere con la realizzazione del dispositivo medico 
              odontoiatrico secondo quanto indicato nella documentazione sopra citata.
            </p>
          </div>

          {/* Area Firma */}
          <div className="flex-1 flex flex-col justify-end">
            <div className="grid grid-cols-2 gap-8">
              <div>
                <p className="text-[9px] font-medium text-neutral-600 mb-2">Luogo e Data</p>
                <div className="border-b-2 border-neutral-300 h-10 flex items-end pb-1">
                  <span className="text-[10px] text-neutral-400">__________________, {formattedDate}</span>
                </div>
              </div>
              
              <div>
                <p className="text-[9px] font-medium text-neutral-600 mb-2">Firma del Medico Prescrittore</p>
                <div className="border-b-2 border-neutral-300 h-10 flex items-end justify-center pb-1">
                  <span className="text-[11px] text-neutral-500 italic font-medium">Dr. {data?.nomeDottore} {data?.cognomeDottore}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-dashed border-neutral-200">
              <p className="text-[8px] text-neutral-400 text-center leading-relaxed">
                La presente dichiarazione ha valore di conferma d'ordine. Una volta firmata, la lavorazione verrà 
                avviata secondo i tempi concordati. Per eventuali modifiche successive alla firma, contattare 
                tempestivamente il laboratorio.
              </p>
            </div>
          </div>
        </div>

        <div className="h-6 bg-gradient-to-r from-[#1E40AF] to-[#3B82F6]" />
        
        <div className="absolute bottom-8 left-0 right-0 text-center">
          <span className="text-[8px] text-neutral-400">Pagina 3 di 3 • Dichiarazione di Presa Visione e Accettazione</span>
        </div>
      </div>
    </div>
  );
}