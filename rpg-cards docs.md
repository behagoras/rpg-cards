# RPG Cards Generator

Generate **print-ready** cards for spells, items, monsters and more, straight from your browser or from a local build. Cards are laid out on A4 (or Letter) pages for double-sided printing, so you get professional-looking fronts and backs with minimal effort. ([crobi.github.io](https://crobi.github.io/rpg-cards/))

---

## 🚀 Quick Links

|                    |                                                              |
| ------------------ | ------------------------------------------------------------ |
| **Source Code**    | https://github.com/crobi/rpg-cards                           |
| **Live Generator** | [https://rpg-cards.vercel.app](https://rpg-cards.vercel.app/) |
| **Full Docs**      | https://crobi.github.io/rpg-cards/                           |

---

## 🛤️ Two Ways to Use


There's 2 ways of consuming this project.

- Use the **Online UI Generator** for quick card creation (no install required).
- Clone and **Build Locally** if you want full customization, offline use, or to contribute.

### 1. Use the Hosted Generator (zero-install)

1. Open **[rpg-cards.vercel.app](https://rpg-cards.vercel.app/)**.
2. Click **“Load sample”** (or **“Load from file”** to import your own deck).
3. Add / edit cards in the UI.
4. Hit **“Generate”** – a new tab opens with a printable PDF-like page.
5. Print *double-sided, flip on long edge*, with **background graphics enabled**. ([rpg-cards.vercel.app](https://rpg-cards.vercel.app/))

Ideal for players, GMs and teachers who just need cards—no build tools required.


```json
{
  "count": 1,
  "color": "maroon",
  "title": "Burning Hands",
  "icon_front": "white-book-1",
  "icon_back": "robe",
  "card_level": "1",
  "contents": [
    "subtitle | 1st level evocation",
    "rule",
    "property | Casting time | 1 action",
    "property | Range | Self (15ft cone)",
    "property | Components | V,S",
    "rule",
    "fill | 2",
    "text | Each creature in a 15-foot cone must make a Dexterity saving throw. A creature takes <b>3d6 fire damage</b> on a failed save, or half as much damage on a successful one.",
    "text | The fire ignites any flammable objects in the area that aren't being worn or carried.",
    "fill | 3",
    "section | At higher levels",
    "text | +1d6 damage for each slot above 1st"
  ],
  "tags": ["spell", "mage"]
}
```

The same card inside the UI shows each field (Count, Tags, Color, Contents, etc.) in a form—you edit visually, the app rewrites the JSON behind the scenes.

## 📄 Card JSON Fields

| Field                                | Purpose                                              |
| ------------------------------------ | ---------------------------------------------------- |
| `count`                              | Number of copies (great for consumables).            |
| `color`, `color_front`, `color_back` | Border colour(s). Any CSS colour keyword or `#hex`.  |
| `icon`, `icon_front`, `icon_back`    | Icons names from **game-icons.net**; omit extension. |
| `card_level`                         | Level number displayed in top-right corner.           |
| `background_image`                   | URL for a back-side background.                      |
| `title`, `title_size`                | Main heading & optional per-card font size.          |
| `card_font_size`                     | Per-card body font size.                             |
| `contents`                           | Ordered list of card elements (see below).           |
| `tags`                               | Free-text labels for filtering / scripting.          |

---

## 🔧 Card Elements Cheat-Sheet

Each entry in `contents` is a **pipe-delimited string** following the next format:

```
"element | param1 | param2 | ..."
```

The available options are:

| Element                | Syntax                                             | Rendered Effect                                              | Typical Use                                           |
| ---------------------- | -------------------------------------------------- | ------------------------------------------------------------ | ----------------------------------------------------- |
| `subtitle`             | `subtitle | text | right_text`                     | Medium italic title with optional right-aligned text         | `subtitle | 1st level evocation`                      |
| `property`             | `property | Name | Value`                          | **Name** in bold with indented description                   | `property | Casting time | 1 action`                  |
| `description`          | `description | Name | Text`                        | Like `property` but no indent; good for long entries         | `description | Lore | This item has ancient origins…` |
| `text`                 | `text | Paragraph`                                 | Plain paragraph; supports inline HTML                        | `text | Each creature in a 15-foot cone…`             |
| `section`              | `section | Title | right_text`                     | Bold header with horizontal rule underneath                  | `section | At higher levels`                          |
| `rule` / `ruler`       | `rule` / `ruler`                                   | Horizontal divider (standard or thin)                        | `rule`                                                |
| `bullet`               | `bullet | Text`                                    | Line with bullet point (`•`)                                 | `bullet | Requires attunement`                        |
| `boxes`                | `boxes | count | size(em) | label`                 | A row of empty boxes                                         | `boxes | 3 | 1 | Charges`                             |
| `fill`                 | `fill | units`                                     | Flexible vertical space filler                               | `fill | 2`                                            |
| `dndstats`             | `dndstats | STR | DEX | CON | INT | WIS | CHA`     | D&D 5e ability scores in stat block format                   | `dndstats | 15 | 12 | 14 | 10 | 11 | 9`               |
| `swstats`              | `swstats | AGI | SMA | SPI | STR | ... | Loot`     | Savage Worlds stat block                                     | `swstats | d8 | d6 | … | 300 sp`                      |
| `picture`              | `picture | URL | height(px)`                       | Embedded image centered in the card                          | `picture | https://... | 120`                         |
| `center`               | `footer |text` / `justify | text`                 | Overrides text alignment (centered or justified with hyphens) | `footer |BOOM!`                                      |
| `footer`               | `footer | part1 | part2 | part3`                 | Footer text with multiple parts separated by bullet points     | `footer | Artificer | Alchemist Level 3 | Feature`    |
| `icon`                 | `icon | name | size | alignment`                   | Inline icon from game-icons.net                              | `icon | sword | 14pt | center`                        |
| **Extras, Pathfinder** | **PF2 extras** (`p2e_stats`, `p2e_activity`, etc.) | PF2-specific blocks, traits, icons, and layouts              | See *Pathfinder 2e* section below.                    |


> ℹ️ Need more examples? Hit **Load sample** in the UI—every card shows its raw `contents` string.

### Footer with Multiple Parts

The `footer` element supports multiple parameters separated by pipes. Each part will be displayed with bullet point separators (•) between them:

```json
"footer | Artificer | Alchemist Level 3 | Feature"
```

This renders as: **Artificer • Alchemist Level 3 • Feature**

The footer appears at the bottom of the card with a colored background matching the card's border color.

### Card Level Display

The `card_level` property displays a level number in the top-right corner of the card, next to the icon. This is useful for spells, character levels, or any other level-based content:

```json
"card_level": "3"
```

The level appears as a circular badge with:
- White text on a colored background (matching the card's border color)
- Bold, centered text
- Positioned in the top-right corner next to the icon
- Only displays if a value is provided

---

### Pathfinder 2e Extras

*Action icons* (`p2e-1-action`, `p2e-reaction`, …), `p2e_stats`, `p2e_activity`, trait wrappers (`p2e_start_trait_section`, `p2e_trait`, `p2e_end_trait_section`) and more.

Full list in the [official docs](https://crobi.github.io/rpg-cards/). ([crobi.github.io](https://crobi.github.io/rpg-cards/))

| Element                                                      | Purpose                       |
| ------------------------------------------------------------ | ----------------------------- |
| `p2e-1-action`, `p2e-2-actions`, `p2e-3-actions`, `p2e-free-action`, `p2e-reaction` | Action icons (front or back). |
| `p2e_stats`                                                  | STR                           |
| `p2e_activity`                                               | Name                          |
| `p2e_start_trait_section` … `p2e_trait`                      | Rarity                        |

---

## 🗺️ Layout & Printing

### Card Arrangement Options

| Mode                    | Result                                                      |
| ----------------------- | ----------------------------------------------------------- |
| `doublesided` (default) | Fronts on odd pages, backs on even pages.                   |
| `front_only`            | Only fronts—good for online reference.                      |
| `side_by_side`          | Front and back adjacent (same order).                       |
| `side_by_side_alt`      | Front/back adjacent, alternating order (cut stack restore). |

### Page & Card Sizes

| Page size        | Dimensions                       |
| ---------------- | -------------------------------- |
| **A4** (default) | 210 × 297 mm                     |
| **PA4**          | 210 × 280 mm                     |
| **US Letter**    | 8.5 × 11 in                      |
| **Custom**       | Enter width × height (mm or in). |

| Card size    | Dimensions                |
| ------------ | ------------------------- |
| **Poker**    | 2.5 × 3.5 in (63 × 88 mm) |
| **Bridge**   | 2.25 × 3.5 in             |
| **Tarot**    | 2.75 × 4.75 in            |
| **Mini**     | 1.75 × 2.5 in             |
| **Business** | 3.5 × 2 in                |
| **Custom**   | Any width × height.       |

### **Browser print tips**

- Enable **“Print background graphics”**.
- Use **100 % scale** (no “fit to page”).
- For double-sided, choose **flip on long edge**.
- Match the generator’s paper size to your printer. ([rpg-cards.vercel.app](https://rpg-cards.vercel.app/))
- **Background graphics:** ON
- **Scale:** 100 % (no “fit to page”)
- **Double-sided:** Flip on **long edge**
- **Paper size:** Matches generator setting
- **Margins:** Default or minimum
- **Cut guides:** Provided by the layout—no additional crop marks needed

---

## 🛠 Filter & Map Functionality (Javascript Macros)

In the **UI → Filter & Map** panel you can run JS snippets to transform every card before rendering:

```js
// Example 1: Tint all spells yellow
if (card_has_tag(card, "spell")) card.color = "yellow";

// Example 2: Remove monster cards
if (card_has_tag(card, "creature")) return false;

// Example 3: Buff all weapon dice by +1
if (card_has_tag(card, "weapon")) {
  card.contents = card.contents.map(line =>
    line.replace(/\| 1d(\d+) /, "| 1d$1+1 ")
  );
}
```

Any card returned as `false` is dropped; otherwise you can mutate its properties freely.

---

## 🏷 Special `<icon>` HTML Tag

Embed an inline icon anywhere in `text`, `subtitle`, etc. Rendering a vector icon from **game-icons.net** right inside your text.

| Attribute          | Description                                    |
| ------------------ | ---------------------------------------------- |
| `name` (required)  | Icon identifier (same as `icon` field).        |
| `size` (optional)  | Font-size for the icon (e.g. `14pt`, `1.2em`). |
| `class` (optional) | Add CSS classes for colour or alignment.       |

Example:

```html
Attack with <icon name="sword" size="14pt"> for +3.
```

---

## 🛠 Customisation Guide

| Task                            | How                                                          |
| ------------------------------- | ------------------------------------------------------------ |
| **Add custom icons**            | Place SVG/PNG in `resources/custom-icons/` → `npm run build`. |
| **Available custom icon packs** | D&D class glyphs, PF2e action icons, assorted weapons & equipment. |
| **Change fonts/colours**        | Edit **`css/cards.css`** (styling) or **`css/style.css`** (UI). |
| **Key CSS files**               | `css/cards.css`, `css/card-size.css`, `css/custom-icons.css`, `css/style.css`. |
| **Bulk edit decks**             | Use *Filter & Map* JS console (see above).                   |
| **Fork / contribute**           | Clone repo, create feature branch, open a PR.                |

---

## 🐞 Troubleshooting

- Ensure the deck has at least one card.
- Disable pop-up blockers (the PDF opens in a new tab).
- Refresh the page or clear cache.

- Enable *Print background graphics* in your browser.
- For local builds: run `npm run build` after adding icons.
- Check icon names (lower-case, hyphenated, no extension).

- Too many cards per page, or card size too large for chosen paper.
- Reduce rows/cols or switch to **Mini** size.
- Verify paper size in generator and print dialog match.

- Decks > 100 cards can be slow—generate in batches.
- Close other heavy tabs.
- Local build: run with `npm run build:prod` for minified assets.

---

## ⚙️ Local Development & Build Process

### Local Development

```bash
git clone https://github.com/crobi/rpg-cards.git
cd rpg-cards
npm install
npm start          # dev server + live-reload
# visit http://localhost:8080
```

### Build Process (`npm run build`)

| Stage      | What happens                                                 |
| ---------- | ------------------------------------------------------------ |
| **Icons**  | Downloads & optimises SVGs from **game-icons.net** and `resources/custom-icons/`. |
| **Fonts**  | Fetches **gameicons-font** + sub-sets Google Fonts (Noto Sans, Lora). |
| **Assets** | Bundles JS/CSS, hashes filenames, outputs to `dist/`.        |

`dist/` is what the Vercel demo hosts—copy it to any static server for your own deployment.

### Browser Requirements

- Chrome, Firefox, Edge, Safari (latest two versions).
- JavaScript enabled.
- Background-image printing supported (all modern browsers).
- **Not** recommended: Internet Explorer (layout bugs).

---


## ❓ FAQ

- Make sure pop-ups aren’t blocked (the PDF opens in a new tab).
- Re-run `npm run build` after adding icons.
- Check icon filenames (no extension, lowercase, hyphenated).

- Too many cards per page or too large a card size for the chosen paper.
- Reduce rows/cols or pick a smaller card preset.

Yes—enter width × height in mm or inches in **Menu ▸ Paper ▸ Custom**.

For more, browse [GitHub Issues](https://github.com/crobi/rpg-cards/issues) or the [official docs](https://crobi.github.io/rpg-cards/).
---

### 🤝 Credits & License

- **Author**: [crobi](https://github.com/crobi)
- **License**: MIT
- Icons © their respective artists, sourced from **game-icons.net** (CC BY 3.0).

> Happy card-crafting! 🎲