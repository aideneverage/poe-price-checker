import { ParsedItem } from '../types';

export function parsePoeItem(clipboardText: string): ParsedItem | null {
    const cleanText = clipboardText.trim();

    // guard: ensure its actually a poe item
    if (!cleanText.includes('Item Class:')) {
        return null;
    }

    // split item into logical blocks
    // have regex handle line breaks
    const blocks = cleanText.split(/\r?\n--------\r?\n/).map(block => block.trim());

    // parse header (always block 0)
    const headerLines = blocks[0].split(/\r?\n/);
    const itemClassMatch = headerLines[0].match(/^Item Class:\s+(.+)$/);
    const rarityMatch = headerLines[1].match(/^Rarity:\s+(.+)$/);
    const itemClass = itemClassMatch ? itemClassMatch[1] : 'Unknown';
    const rarity = rarityMatch ? rarityMatch[1] : 'Normal';
    let name = '';
    let baseType = '';

    //rare and unique have distinct name and base type on separate lines
    if (rarity === 'Rare' || rarity === 'Unique') {
        name = headerLines[2] || '';
        baseType = headerLines[3] || '';
    } else {
        // magic and normal items combine name and base types to one line
        name = headerLines[2] || '';
        baseType = name;
    }

    // extract global properties using targeted regex on whole text
    const ilvlMatch = cleanText.match(/^Item Level:\s+(\d+)$/m);
    const itemLevel = ilvlMatch ? parseInt(ilvlMatch[1], 10) : undefined;
    const isCorrupted = /^Corrupted$/m.test(cleanText);

    // parse modifiers (implicits and explicits) from blocks
    const implicits: string[] = [];
    const explicits: string[] = [];

    // blocks to ignore when looking for explicit modifiers
    const ignoredBlockStarts = [
        'Requirements:',
        'Sockets:',
        'Item Level:',
        'Talisman Tier:',
        'Corrupted',
        'Unidentified'
    ];

    // iterate through all blocks after header
    for (let i = 1; i < blocks.length; i++) {
        const blockLines = blocks[i].split(/\r?\n/);
        const firstLine = blockLines[0];

        // skip utility blocks like requirements/sockets
        if (ignoredBlockStarts.some(ignored => firstLine.startsWith(ignored))) {
            continue;
        }

        // process lines in valid stat blocks
        blockLines.forEach(line => {
            // POE tags implicits and enchants at the end of the string
            const implicitMatch = line.match(/(.+?)\s+\(implicit\)$/);
            const enchantMatch = line.match(/(.+?)\s+\(enchant\)$/);

            if (implicitMatch) {
                implicits.push(implicitMatch[1]);
            } else if (enchantMatch) {
                implicits.push(enchantMatch[1]); // treat enchants like implicits    
            } else if (line.trim().length > 0) {
                // if its in a stat block and has no tag, its explicit
                explicits.push(line);
            }
        });
    }

    return {
        itemClass,
        rarity,
        name,
        baseType,
        itemLevel,
        implicits,
        explicits,
        isCorrupted,
        rawText: cleanText
    };

}