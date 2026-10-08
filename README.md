# PoE Price Checker

A lightweight desktop overlay for **Path of Exile** that parses item information from the game's clipboard and searches the Path of Exile Trade API for comparable listings.

The goal is to make checking the market value of an item quick and convenient without manually recreating a trade search every time.

## Features

- **Clipboard-based item detection**
  - Copy an item in Path of Exile using the game's standard item-copy functionality.
  - The overlay automatically detects and parses the copied item.

- **Item parsing**
  - Extracts:
    - Item class
    - Rarity
    - Item name
    - Base type
    - Item level
    - Corrupted status
    - Implicit modifiers
    - Explicit modifiers

- **Modifier matching**
  - Matches parsed item modifiers against Path of Exile's Trade API stat definitions.
  - Automatically associates recognized modifiers with their corresponding Trade API stat IDs.
  - Extracts numerical modifier values when applicable.

- **Interactive trade search**
  - Select which modifiers should be included in the price search.
  - Adjust individual modifier values before searching.
  - Modifier values default to approximately 90% of the item's original value to help find comparable listings.

- **Price results**
  - Displays the cheapest returned listings.
  - Shows listing price, currency, and seller account name.

- **Desktop overlay**
  - Built with Electron and React.
  - Designed to remain as a compact overlay while playing Path of Exile.
  - The window can be repositioned using the built-in drag bar.

## How It Works

The application follows a simple pipeline:

```text
Path of Exile
      │
      │ Copy Item
      ▼
System Clipboard
      │
      ▼
Item Parser
      │
      ├── Item Information
      ├── Implicit Modifiers
      └── Explicit Modifiers
              │
              ▼
       Stat Matcher
              │
              ▼
      Trade API Stat IDs
              │
              ▼
       User Filters
              │
              ▼
      Trade API Search
              │
              ▼
       Price Listings
```

### 1. Copy an Item

The application listens for copied item text. When an item is copied from Path of Exile, the clipboard text is passed to the item parser.

The parser first verifies that the clipboard contents contain:

```text
Item Class:
```

This prevents unrelated clipboard contents from being interpreted as items.

### 2. Parse the Item

`itemParser.ts` separates the clipboard text into logical sections and extracts information such as rarity, name, base type, item level, and corruption status.

Modifiers are separated into:

- Implicit modifiers
- Explicit modifiers
- Enchants

Utility sections such as requirements, sockets, and item level information are ignored when searching for modifiers.

### 3. Match Modifiers to Trade API Stats

`statMatcher.ts` uses the game's Trade API stat definitions stored in `stats.json`.

For example, a modifier such as:

```text
+120 to maximum Life
```

can be matched against a Trade API definition such as:

```text
# to maximum Life
```

The `#` is converted into a numeric capture group so that both the modifier's Trade API ID and numerical value can be extracted.

### 4. Configure the Search

Recognized modifiers appear in the overlay as selectable filters.

Each modifier can be:

- Enabled or disabled
- Adjusted using a slider
- Adjusted manually using a numerical input

By default, numerical search values are set to approximately 90% of the item's actual modifier value. This makes it easier to search for similar items rather than requiring an exact match.

### 5. Search the Market

When **Check Market Price** is pressed, the selected modifiers are sent to the application's backend, which queries the Path of Exile Trade API.

The returned listings are then displayed in the overlay.

## Project Structure

A simplified view of the project structure:

```text
src/
├── main/
│   └── ...
│
├── renderer/
│   └── src/
│       ├── App.tsx
│       ├── types.ts
│       │
│       └── utils/
│           ├── itemParser.ts
│           └── statMatcher.ts
│
└── ...
```

### Important Files

| File | Purpose |
|---|---|
| `App.tsx` | Main React UI and application state |
| `itemParser.ts` | Parses Path of Exile clipboard item data |
| `statMatcher.ts` | Matches item modifiers to Trade API stat IDs |
| `stats.json` | Trade API modifier/stat definitions |
| `types.ts` | TypeScript interfaces used throughout the application |

## Tech Stack

- **React** — User interface
- **TypeScript** — Application logic and type safety
- **Electron** — Desktop application and overlay
- **Node.js** — Backend/API communication
- **Path of Exile Trade API** — Market data
- **Vite** — Frontend development/build tooling

## Getting Started

### Prerequisites

You will need:

- [Node.js](https://nodejs.org/)
- npm
- Path of Exile
- An internet connection for Trade API requests

### Installation

Clone the repository:

```bash
git clone <repository-url>
cd <repository-directory>
```

Install dependencies:

```bash
npm install
```

### Development

Start the application in development mode:

```bash
npm run dev
```

The exact command may vary depending on the Electron/Vite configuration.

### Building

To create a production build:

```bash
npm run build
```

## Usage

1. Launch the price checker.
2. Launch Path of Exile.
3. Hover over an item you want to evaluate.
4. Copy the item using Path of Exile's item-copy functionality.
5. The overlay will automatically parse the copied item.
6. Review the detected modifiers.
7. Enable or disable modifiers as needed.
8. Adjust modifier values if you want a broader or narrower search.
9. Click **Check Market Price**.
10. Review the returned listings.

## Example

For an item with modifiers such as:

```text
+120 to maximum Life
+45% to Fire Resistance
+32% to Cold Resistance
```

the overlay can turn the recognized modifiers into Trade API filters.

The user can then choose which modifiers matter for the comparison:

```text
☑ +120 to maximum Life       [slider] [108]
☑ +45% to Fire Resistance    [slider] [40]
☐ +32% to Cold Resistance    [disabled]
```

The resulting search focuses on items with the selected characteristics rather than simply searching for the exact item.

## Design Goals

The project is designed around three main goals:

### Speed

Checking an item's approximate market value should take only a few seconds.

### Flexibility

Users should be able to decide which modifiers matter when comparing an item against the market.

### Simplicity

The overlay should provide useful pricing information without requiring the user to leave the game and manually recreate a trade search.

## Current Limitations

The project is still under development. Some Path of Exile item types and modifier formats may not be recognized correctly.

Current limitations include:

- Not every possible modifier is guaranteed to match the Trade API stat database.
- Some special item modifiers may require additional parsing logic.
- Price results depend on the listings returned by the Path of Exile Trade API.
- The current price display focuses on returned listing prices rather than providing a complete statistical valuation.
- The application currently relies on clipboard item text rather than directly reading game memory or game files.

## Future Improvements

Potential improvements include:

- Better support for additional modifier types
- More robust handling of special and influenced items
- Improved price estimation using multiple listings
- Filtering outliers and unrealistic listings
- Support for additional item properties
- Improved overlay styling
- Hotkeys for opening/refreshing the price checker
- More advanced search controls
- Caching Trade API data where appropriate
- Improved error handling and API rate-limit handling
- Cluster Jewel Calculator

## Disclaimer

This project is an independent community project and is not affiliated with or endorsed by Grinding Gear Games.

The application uses publicly available Path of Exile item and trade information and does not modify game files or interact directly with the game's memory.

