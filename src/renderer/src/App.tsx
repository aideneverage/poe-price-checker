import { useEffect, useState } from 'react';
import { parsePoeItem } from './utils/itemParser';
import { ParsedItem } from './types';

function App() {
  const [itemData, setItemData] = useState<ParsedItem | null>(null);

  useEffect(() => {
    window.api.onItemCopied((text: string) => {
      const parsed = parsePoeItem(text);
      if (parsed) {
        setItemData(parsed);
      }
    });
  }, []);

  if (!itemData) {
  return (
    <div style={{ padding: '20px', color: '#e0e0e0', background: 'rgba(20, 20, 24, 0.95)', height: '100vh' }}>
      Awaiting Item... (Hover over an item, press Ctrl+C, then Ctrl+D)
    </div>
  );
}

  return (
    <div style={{ background: '#141418', color: '#e0e0e0', padding: '20px', height: '100vh' }}>
      <h2 style={{ color: itemData.rarity === 'Unique' ? '#af6025' : '#ffff00' }}>
        {itemData.name && <div>{itemData.name}</div>}
        <div>{itemData.baseType}</div>
      </h2>
      
      {itemData.itemLevel && <p>Item Level: {itemData.itemLevel}</p>}
      
      {itemData.implicits.length > 0 && (
        <div style={{ borderBottom: '1px solid #444', paddingBottom: '10px' }}>
          {itemData.implicits.map((mod, i) => (
            <div key={i} style={{ color: '#8888ff' }}>{mod}</div>
          ))}
        </div>
      )}

      <div style={{ paddingTop: '10px' }}>
        {itemData.explicits.map((mod, i) => (
          <div key={i} style={{ color: '#8888ff' }}>{mod}</div>
        ))}
      </div>
    </div>
  );
}

export default App;