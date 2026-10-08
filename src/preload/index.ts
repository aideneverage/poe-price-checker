import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  onItemCopied: (callback: (text: string) => void) => 
    ipcRenderer.on('item-copied', (_event, value) => callback(value)),
  queryTradeApi: (itemData: any) => ipcRenderer.invoke('query-trade-api', itemData)
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}