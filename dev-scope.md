# ToA Map Tool — Phase 1 Build Plan

## Context
Convert the working mock design (single HTML + inline Babel JSX) into a proper Vite + React app with localStorage persistence, React Router routes, and full GM/player functionality including tracker and party marker management. No backend. Supabase migration deferred to Phase 2.

Mock lives in `mock-design/toa-tool/`. New app scaffolds at the repo root.

---

## Project Structure

```
toa-map/
  package.json
  vite.config.js
  index.html
  public/
    gm-map.jpg          ← copy from mock-design/toa-tool/
    player-map.jpg      ← copy from mock-design/toa-tool/
  src/
    main.jsx            ← entry, ReactDOM.createRoot + BrowserRouter
    App.jsx             ← routes: / → /gm redirect, /gm, /player
    index.css           ← global styles from mock <style> block
    lib/
      hexMath.js        ← extracted from data.js (MAP_W/H, hexCenter, hexPoints, pixelToHex, etc.)
      locations.js      ← ALL_LOCATIONS list + pre-seeded hexes + trackers + markers
      storage.js        ← loadState() / saveState() localStorage helpers
      markdown.js       ← simple regex renderer (same as mock's renderMarkdown)
    hooks/
      useAppState.js    ← useReducer + localStorage sync, exports via context
    components/
      HexMap.jsx
      GMPanel.jsx
      PlayerPanel.jsx
      TopBar.jsx
      PlayerNamePrompt.jsx
      TrackerManager.jsx  ← GM tracker CRUD + value editing (floating panel)
      PartyManager.jsx    ← GM party marker add/remove/rename (floating panel)
    views/
      GMView.jsx
      PlayerView.jsx
```

---

## State Shape

```js
// localStorage key: 'toa-map-state'
{
  hexes: {
    [hexId]: {
      name: string,
      colorTag: string,
      revealTier: 0|1|2|3,
      location: string|null,
      markdown: string,
      gmNote: string,
      sharedNote: string,
    }
  },
  partyMarkers: [{ id, name, color, hexId }],
  trackers: [{ id, name, type: 'progress'|'pip', current, max, visibleToPlayers }],
  playerNotes: { [hexId]: { [playerName]: string } },
  partyNotes: { [hexId]: string },
}

// Separate localStorage key: 'toa-player-name'
```

---

## Routing

- React Router v6
- `/` → `<Navigate to="/gm" />`
- `/gm` → `<GMView />`
- `/player` → `<PlayerView />`
- TopBar has route-link mode toggle (replaces the tweaks-panel toggle from mock)

---

## Reducer Actions

```
UPDATE_HEX            { hexId, updates }
MOVE_PARTY_MARKER     { markerId, hexId }
ADD_PARTY_MARKER      { marker }
REMOVE_PARTY_MARKER   { markerId }
UPDATE_PARTY_MARKER   { markerId, updates }   ← rename/recolor
UPDATE_TRACKER        { trackerId, updates }   ← current value, name, visibility
ADD_TRACKER           { tracker }
REMOVE_TRACKER        { trackerId }
SET_PLAYER_NOTE       { hexId, playerName, note }
SET_PARTY_NOTE        { hexId, note }
```

---

## Component Conversions (from mock)

All mock components use `Object.assign(window, {...})` and `const { useState } = React`. Convert each to:
- ES module `export default`
- `import { useState } from 'react'`
- Import `hexMath`, `markdown` from lib instead of `window.*`

**HexMap.jsx** — minimal changes, just imports  
**GMPanel.jsx** — add "Party Markers" section at bottom (shows markers, "Move here" per marker); `onMoveMarker(markerId)` prop  
**PlayerPanel.jsx** — playerNotes + partyNotes from real state, with save callbacks  
**TopBar.jsx** — route-link toggle; "Trackers" + "Party" icon buttons (GM only) open floating managers  

---

## New Components

**PlayerNamePrompt** — modal on first `/player` load when no name in localStorage; blocking until name entered

**TrackerManager** — floating panel (GM only):
- List: name input, type toggle, max input, current +/− buttons, visibility toggle, delete
- "Add Tracker" at bottom

**PartyManager** — floating panel (GM only):
- List: color swatch, name input, current hex display, delete
- "Add Marker" at bottom
- "Move on map" button → sets `movingMarkerId` → next hex click places marker

---

## GMView Shape

```jsx
function GMView() {
  const { state, dispatch } = useAppState();
  const [selectedHexId, setSelectedHexId] = useState(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [showTrackers, setShowTrackers] = useState(false);
  const [showParty, setShowParty] = useState(false);
  const [movingMarkerId, setMovingMarkerId] = useState(null); // click-to-place
}
```

Hex click when `movingMarkerId` set → `MOVE_PARTY_MARKER` → clear `movingMarkerId`.

---

## PlayerView Shape

```jsx
function PlayerView() {
  const [playerName, setPlayerName] = useState(
    () => localStorage.getItem('toa-player-name') || ''
  );
  if (!playerName) return <PlayerNamePrompt onSubmit={name => { ... setPlayerName(name); }} />;
  ...
}
```

---

## useAppState Hook

```js
const STORAGE_KEY = 'toa-map-state';
const [state, dispatch] = useReducer(reducer, null, () => loadState() || initialData);
useEffect(() => saveState(state), [state]);
```

Exported via React context — both GMView and PlayerView share state in same tab (dev convenience; Supabase replaces in Phase 2).

---

## Dependencies

```json
"react": "^18",
"react-dom": "^18",
"react-router-dom": "^6",
"vite": "^5",
"@vitejs/plugin-react": "^4"
```

No markdown library — keep the regex renderer from the mock.

---

## Build Order

1. Scaffold Vite at repo root (`npm create vite@latest . -- --template react`)
2. Install `react-router-dom`
3. `lib/` files: hexMath, locations, storage, markdown
4. `hooks/useAppState.js` (reducer + context)
5. Convert components: HexMap → PlayerPanel → GMPanel → TopBar
6. New components: PlayerNamePrompt, TrackerManager, PartyManager
7. Wire GMView + PlayerView
8. Wire App.jsx routes + main.jsx
9. Copy map images to `public/`
10. Port global CSS from mock

---

## Verification

```bash
npm run dev
# /gm  → hex grid loads, click hex → GM panel opens, edits persist on refresh
# /player → name prompt → fog-of-war view, notes editable
# Add tracker in /gm → appears in TopBar
# Move party marker via GM panel → marker moves on map
```
