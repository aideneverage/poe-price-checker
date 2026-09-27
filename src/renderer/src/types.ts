export interface ParsedItem {
    itemClass: string;
    rarity: string;
    name: string;
    baseType: string;
    itemLevel?: number;
    implicits: string[];
    explicits: string[];
    isCorrupted: boolean;
    rawText: string;
}