export interface IElectronAPI {
  onItemCopied: (callback: (text: string) => void) => void;
}

declare global {
  interface Window {
    api: IElectronAPI;
  }
}