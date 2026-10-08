export interface ItemModifier {
    text: string;
    tradeId: string | null;
    value: number | null;
}

export interface ParsedItem {
    itemClass: string;
    rarity: string;
    name: string;
    baseType: string;
    itemLevel?: number;
    implicits: ItemModifier[];
    explicits: ItemModifier[];
    isCorrupted: boolean;
    rawText: string;
}