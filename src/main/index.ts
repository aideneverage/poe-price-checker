// src/main/index.ts
import { app, shell, BrowserWindow, globalShortcut, clipboard, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'

let mainWindow: BrowserWindow;

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 400,
    height: 600,
    show: false, // Keep hidden until hotkey is pressed
    frame: false, // Removes the Windows/Mac title bar
    transparent: true, // Makes the background transparent
    alwaysOnTop: true, // Overlays on top of the game
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  // Open Developer Tools automatically for debugging
  mainWindow.webContents.openDevTools({ mode: 'detach' });

  // Load the React app
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
  
  // Hide window when user clicks away to return to the game
  mainWindow.on('blur', () => {
    mainWindow.hide();
  });
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.poepricechecker')
  createWindow()

  // --- 1. HOTKEY & CLIPBOARD LISTENER ---
  globalShortcut.register('CommandOrControl+D', () => {
    const itemText = clipboard.readText();
    
    if (itemText && mainWindow) {
      // Send the raw text to the React frontend
      mainWindow.webContents.send('item-copied', itemText);
      
      // Move window to mouse cursor and show it
      const point = require('electron').screen.getCursorScreenPoint();
      mainWindow.setPosition(point.x, point.y);
      mainWindow.show();
    }
  })

  // --- 2. PATH OF EXILE TRADE API HANDLER ---
  ipcMain.handle('query-trade-api', async (_event, itemData) => {
    const LEAGUE = 'Standard'; // Can be made dynamic later
    const USER_AGENT = 'OAuth poe-price-checker/1.0.0 (contact: test@example.com)';

    const filters: any[] = [];
    
    // Build the stat filters
    itemData.explicits.forEach((mod: any) => {
      if (mod.tradeId) {
        filters.push({
          id: mod.tradeId,
          value: mod.value ? { min: mod.value } : undefined
        });
      }
    });

    const payload: any = {
      query: {
        status: { option: 'online' },
        stats: [{ type: 'and', filters: filters }]
      },
      sort: { price: 'asc' }
    };

    // Uniques need names; Rares just need base types
    if (itemData.rarity === 'Unique') {
      payload.query.name = itemData.name;
      payload.query.type = itemData.baseType;
    } else {
      payload.query.type = itemData.baseType;
    }

    try {
      // Step A: Search for the item
      const searchResponse = await fetch(`https://www.pathofexile.com/api/trade/search/${LEAGUE}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': USER_AGENT
        },
        body: JSON.stringify(payload)
      });

      if (!searchResponse.ok) throw new Error('Trade API Search Failed');
      const searchData = await searchResponse.json();

      if (!searchData.result || searchData.result.length === 0) {
        return { error: null, prices: [] };
      }

      // Step B: Fetch the actual prices for the top 10 cheapest listings
      const top10Ids = searchData.result.slice(0, 10).join(',');
      const fetchUrl = `https://www.pathofexile.com/api/trade/fetch/${top10Ids}?query=${searchData.id}`;

      const fetchResponse = await fetch(fetchUrl, {
        method: 'GET',
        headers: { 'User-Agent': USER_AGENT }
      });

      if (!fetchResponse.ok) throw new Error('Trade API Fetch Failed');
      const fetchData = await fetchResponse.json();

      // Clean up the data for React
      const prices = fetchData.result.map((listing: any) => ({
        accountName: listing.listing.account.lastCharacterName,
        amount: listing.listing.price.amount,
        currency: listing.listing.price.currency
      }));

      return { error: null, prices };

    } catch (error: any) {
      console.error(error);
      return { error: error.message, prices: [] };
    }
  });
})

app.on('will-quit', () => {
  // Ensure we release the keyboard hook when closing
  globalShortcut.unregisterAll()
})