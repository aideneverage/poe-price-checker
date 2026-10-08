// src/renderer/src/App.tsx
import { useEffect, useState } from 'react';
import { parsePoeItem } from './utils/itemParser';
import { ParsedItem } from './types';

interface InteractiveMod {
  originalIndex: string;
  text: string;
  tradeId: string;
  originalValue: number | null;
  searchValue: number | null;
  isSelected: boolean;
  isImplicit: boolean;
}

function App() {
  const [itemData, setItemData] = useState<ParsedItem | null>(null);
  const [prices, setPrices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchMods, setSearchMods] = useState<InteractiveMod[]>([]);

useEffect(() => {
  window.api.onItemCopied((text: string) => {
    const parsed = parsePoeItem(text);
    if (parsed) {
      setItemData(parsed);
      setPrices([]);
      
      // Combine implicits and explicits into a single checklist
      const interactiveList: InteractiveMod[] = [];
      
      const processMods = (mods: any[], isImplicit: boolean) => {
        mods.forEach((mod, i) => {
          if (mod.tradeId) {
            interactiveList.push({
              originalIndex: `${isImplicit ? 'imp' : 'exp'}-${i}`,
              text: mod.text,
              tradeId: mod.tradeId,
              originalValue: mod.value,
              // Default the search value to 10% lower to find similar items easily
              searchValue: mod.value ? Math.floor(mod.value * 0.9) : null,
              isSelected: true, // Default to checked
              isImplicit
            });
          }
        });
      };

      processMods(parsed.implicits, true);
      processMods(parsed.explicits, false);
      setSearchMods(interactiveList);
    }
  });
}, []);

  const checkPrice = async () => {
  if (!itemData) return;
  setLoading(true);

  // Filter to only checked mods and map them to the format the backend expects
  const activeFilters = searchMods
    .filter(mod => mod.isSelected)
    .map(mod => ({
      text: mod.text,
      tradeId: mod.tradeId,
      value: mod.searchValue
    }));

  // Override the explicits array with our custom filters
  const searchPayload = {
    ...itemData,
    explicits: activeFilters
  };

  const result = await window.api.queryTradeApi(searchPayload);
  if (result && result.prices) {
    setPrices(result.prices);
  }
  setLoading(false);
};
const toggleMod = (index: string, checked: boolean) => {
  setSearchMods(prev => prev.map(mod => 
    mod.originalIndex === index ? { ...mod, isSelected: checked } : mod
  ));
};

const changeModValue = (index: string, val: number) => {
  setSearchMods(prev => prev.map(mod => 
    mod.originalIndex === index ? { ...mod, searchValue: val } : mod
  ));
};

  if (!itemData) {
    return <div style={{ padding: '20px', color: '#e0e0e0', background: 'rgba(20, 20, 24, 0.95)', height: '100vh' }}>Awaiting Item...</div>;
  }

return (
    <div style={{ background: '#141418', color: '#e0e0e0', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* --- DRAG HANDLE --- */}
      <div style={{ 
        WebkitAppRegion: 'drag',
        background: '#222', 
        padding: '8px 15px', 
        borderBottom: '1px solid #c8a356',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        cursor: 'grab' 
      } as any}>
        <span style={{ color: '#c8a356', fontSize: '14px', fontWeight: 'bold' }}>PoE Price Checker</span>
        <span style={{ color: '#666', fontSize: '12px' }}>(Drag here)</span>
      </div>

      {/* --- MAIN CONTENT AREA --- */}
      <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
        
        {/* 1. Item Name and Base Type */}
        <h2 style={{ color: itemData.rarity === 'Unique' ? '#af6025' : '#ffff00', marginTop: 0 }}>
          {itemData.name && <div>{itemData.name}</div>}
          <div>{itemData.baseType}</div>
        </h2>
        
        {/* 2. THE NEW INTERACTIVE MODIFIERS */}
        <div style={{ marginTop: '15px', marginBottom: '15px' }}>
          {searchMods.map((mod) => (
            <div key={mod.originalIndex} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', opacity: mod.isSelected ? 1 : 0.4 }}>
              
              <input 
                type="checkbox" 
                checked={mod.isSelected} 
                onChange={(e) => toggleMod(mod.originalIndex, e.target.checked)}
                style={{ marginRight: '10px', cursor: 'pointer' }}
              />
              
              <div style={{ flex: 1, color: mod.isImplicit ? '#c8a356' : '#8888ff', fontSize: '13px' }}>
                {mod.text}
              </div>

              {mod.originalValue !== null && mod.searchValue !== null && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input 
                    type="range"
                    min={Math.max(1, Math.floor(mod.originalValue * 0.5))}
                    max={Math.ceil(mod.originalValue * 1.2)}
                    value={mod.searchValue}
                    onChange={(e) => changeModValue(mod.originalIndex, parseInt(e.target.value))}
                    disabled={!mod.isSelected}
                    style={{ width: '80px', cursor: 'ew-resize' }}
                  />
                  <input 
                    type="number" 
                    value={mod.searchValue}
                    onChange={(e) => changeModValue(mod.originalIndex, parseInt(e.target.value))}
                    disabled={!mod.isSelected}
                    style={{ 
                      width: '50px', background: '#222', color: 'white', 
                      border: '1px solid #444', textAlign: 'center', padding: '2px' 
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 3. The Check Price Button */}
        <button 
          onClick={checkPrice} 
          disabled={loading}
          style={{ 
            WebkitAppRegion: 'no-drag',
            padding: '8px 16px', 
            background: '#333', 
            color: 'white', 
            border: '1px solid #c8a356', 
            cursor: 'pointer', 
            marginBottom: '15px',
            width: '100%' // Makes the button span the full width for a cleaner UI
          } as any}
        >
          {loading ? 'Searching...' : 'Check Market Price'}
        </button>

        {/* 4. The Prices Display Block */}
        {prices.length > 0 && (
          <div style={{ background: '#000', padding: '10px', borderRadius: '4px', marginBottom: '15px' }}>
            <h3 style={{ marginTop: 0, color: '#c8a356' }}>Cheapest Listings:</h3>
            {prices.map((p, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #333', padding: '4px 0' }}>
                <span>{p.amount} {p.currency}</span>
                <span style={{ color: '#888' }}>{p.accountName}</span>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

export default App;