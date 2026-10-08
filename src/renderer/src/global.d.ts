export interface IElectronAPI {
  onItemCopied: (callback: (text: string) => void) => void;
  queryTradeApi: (itemData: any) => Promise<any>;
}

declare global {
  interface Window {
    api: IElectronAPI;
  }
}