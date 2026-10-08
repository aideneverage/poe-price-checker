import tradeStats from './stats.json';

interface MatchedStat {
    id: string;
    value?: number;
}

//Flattens the nested GGG stats JSON in a single array
const allStats = tradeStats.result.flatMap((category: any) => category.entries);

export function matchModifierToApiId(modifierText: string): MatchedStat | null {
  //Clean up the parsed string (e.g., remove "+", "-", and extra spaces)
  const cleanMod = modifierText.replace(/\+/g, '').trim();

  for (const stat of allStats) {
    //Convert GGG's format ("# to maximum Life") into a Regex ("^(\\d+) to maximum Life$")
    //We escape special regex characters in the stat text, then replace # with a capture group
    const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    let regexPattern = escapeRegex(stat.text);
    regexPattern = regexPattern.replace(/#/g, '(\\d+)');
    
    const regex = new RegExp(`^${regexPattern}$`, 'i');
    const match = cleanMod.match(regex);

    if (match) {
      return {
        id: stat.id,
        //If the regex captured a number (where the # was), parse it
        value: match[1] ? parseInt(match[1], 10) : undefined
      };
    }
  }

  return null; //Mod not found in dictionary
}
