# ToA Map Tool — Project Concept

## Overview
Web app for running Tomb of Annihilation exploration at table.
Two views, one shared persistent state.
No auth. Session-based player identity.

---

## Routes
- `/gm` — GM view, full access
- `/player` — Player view, fog of war

---

## Tech Stack

### Phase 1 — Local dev
- React frontend (single app, two routes)
- localStorage for persistence between refreshes
- No backend, no sync — GM and player views in separate tabs, no live updates yet
- Goal: get all base features working and feeling right

### Phase 2 — Production
- Vercel deployment (serverless)
- Supabase swapped in as state layer (Postgres + real-time subscriptions)
- Component logic unchanged — only data layer swaps out
- Supabase setup steps documented below for when ready

---

## Hex Grid (SOLVED — exact parameters below)

### Source files
- Player base map: untagged Chult map (GM has separate non-tagged version for players)
- GM reference: `ToATagged.png` (2362×3168 px)
- Grid numbering source: `just_numbers.png` (4476×6000 px)
- Both align at corners; uniform scale factor between them

### Grid format
- Hex ID format: `CCRR` (column-row), e.g. `4729` = col 47, row 29
- Columns: 01–72, Rows: 01–85
- Flat lattice: odd columns offset DOWN by half a row (staggered hex columns)
- 1 hex = 12 miles (per map legend)

### Exact lattice math (in just_numbers.png 4476×6000 coordinate space)
Derived by least-squares fit against all 6,111 OCR'd grid labels — mean error 0.86px:
```
x(col)      = 194.172 + (col - 1) × 57.514
y(col, row) = 193.980 + (row - 1) × 66.756 + (col is odd ? 33.545 : 0)
```

### Converting to map coordinates
To position hexes over the 2362×3168 tagged map (or any same-aspect map):
```
sx = mapWidth  / 4476    // = 0.52770 for the 2362px map
sy = mapHeight / 6000    // = 0.52800 for the 3168px map
hexCenterX = x(col) × sx
hexCenterY = y(col, row) × sy
```
For any other untagged player map export, same formula with that map's dimensions
(as long as it shares the same crop/aspect as the grid overlay).

### Reverse lookup (pixel → hex, for click handling)
```
col ≈ round((X / sx - 194.172) / 57.514 + 1)
row ≈ round((Y / sy - 193.980 - (col odd ? 33.545 : 0)) / 66.756 + 1)
// then check the 3×3 neighborhood of (col, row) for the true nearest center
```

### In-app grid
- Render clickable hex polygons at computed centers over the map image
- Hex pixel size: width ≈ 57.5×sx, height ≈ 66.8×sy
- GM loads this as starting point, edits hex info over time

---

## GM Side

### Hex Grid
- Full grid visible, all hexes always shown
- Color tag per hex (GM assigned, custom color picker, no presets)
- Click hex → side panel opens

### Side Panel (per hex)
- Hex ID (auto, CCRR format, e.g. 4729)
- **Assign location dropdown** — pick from module location list (see Location Assignment below)
- Hex name (editable text field, auto-filled when location assigned)
- Region color tag (editable)
- Markdown content area (paste module text, renders live) — this replaces GM's separate markdown book
- GM private note (editable, NEVER synced to players)
- GM shareable note (editable, synced to players when hex is revealed)
- Player notes section (read only, shown per player who wrote)
- Reveal tier toggle:
  - Hidden (hex not visible to players)
  - Hex visible (players see hex exists, no name)
  - Name visible (players see hex + name)
  - Full description (players see everything GM has unlocked)

### Location Assignment (GM workflow)
- App ships with the module location list loaded (from List_of_Locations.md)
- GM clicks hex → side panel → "Assign location" dropdown → picks name
- Assigning sets hex name + creates the content slot for that location
- "Unassigned locations" list visible somewhere in GM UI — shows what's left to place
- Locations can be unassigned/reassigned anytime
- Some entries are regions/rivers spanning multiple hexes (Bay of Chult, Mistcliff, River Soshenstar, valleys) — allow assigning same location to multiple hexes, OR assign to one label hex; GM's choice

### Pre-fill data (optional starting point)
36 of 48 locations were computationally mapped from the tagged map.
High-confidence ones can ship pre-assigned; GM verifies/adjusts in-app:
Fort Beluarian 4515, Hvalspyd 5221, Mezro 4729, Ataaz Muhahah 4632,
Firefinger 4230, Nangalore 4341, Ishau 5343, Hisari 5247, Yellyark 3327,
Camp Righteous 3429, Vorn 2928, Camp Vengeance 3131, Orolunga 2133,
Ataaz Yklwazi 2251, Needle's Bones 4837, Wreck of the Narwhal 5135,
Ataaz Kahakla 2440, Wreck of the Star Goddess 2545.
Flagged for manual verify: Port Castigliar (4927/4827), Kir Sabal (4638/4639),
Dungrunglung (4034/4035), Heart of Ubtao (3540/3440), Mbala (2733/2834).
Region/river label hexes: Bay of Chult 3915, Kitcher's Inlet 5128, River Tiryki 4126,
Nsi Wastes 4740, Refuge Bay 5540, River Olung 4240, Lake Luo 4547,
Valley of Embers 4249, River Soshenstar 3527, Mistcliff 2323, Aldani Basin 3136,
River Tath 2139, Valley of Lost Honor 2052.
Unmapped (GM assigns manually): Hrakhamar, Wyrmheart Mine, Omu, Shilku,
Shilku Bay, The Cauldron, Snapping Turtle Bay, Snout of Omgar, Valley of Dread,
Land of Ash and Smoke, Jahaka Anchorage, Jahaka Bay.

### Party Markers
- GM can create one or more party markers (default: one)
- Each marker has: name (e.g. "Party", "Group A"), color, current hex
- GM drags or clicks hex → assigns marker to that hex
- Marker visible on GM view always
- Marker visible on player view always (players can see where they are)
- Multiple markers supported — useful for west marches or split party
- GM can add/remove/rename markers anytime
- Party rations (built in, shared across all players)
- Custom trackers: GM can add/remove
  - Each tracker: name (editable), type (pip or progress bar)
  - Examples: Death Curse meter, exhaustion pips, etc.
  - GM chooses if tracker appears on player view or not

### Editing
- All hex fields editable inline
- Color tag changeable anytime
- Reveal tier changeable anytime
- Tracker add/remove/rename anytime

---

## Player Side

### On First Load
- Prompt for character name
- Stored in localStorage, no backend account

### Hex Grid
- Fog of war — hex visibility based on GM reveal tier:
  - Hidden → not shown
  - Hex visible → blank hex shown, not clickable
  - Name visible → hex shown with name, clickable
  - Full description → hex shown, full side panel content
- Click revealed hex → side panel opens

### Side Panel (per hex)
- GM unlocked content only (based on tier)
- GM shareable note (if set and hex revealed)
- Own personal note (editable, only they see it)
- Party note (shared, editable, all players see)

### Trackers
- Party rations (read only)
- Any GM-enabled trackers (read only)

---

## State & Sync

### Phase 1 — Local
- All state in React (useState, useReducer)
- localStorage for persistence across refreshes
- No live sync between tabs — GM and player views are independent in local dev
- Player name stored in localStorage

### Phase 2 — Supabase
- All state migrated to Supabase Postgres
- Supabase real-time subscriptions push GM changes live to all connected player views
- Player name stays in localStorage
- Player notes stored by player name + hex ID in Supabase

---

## Regions
- No presets
- GM manually selects hexes and assigns color tag
- Color = region marker, fully custom
- Can be changed at any time

---

## Out of Scope (for now)
- Omu grid (separate map layer)
- Tomb of the Nine Gods dungeon levels
- These can be added later as map layer tabs
- GM controls which layer is active, players follow

---

## Supabase Setup Steps

### 1. Create project
- Go to app.supabase.com
- New project → name it, pick nearest region, set strong DB password
- Wait ~2 min for init

### 2. Get API keys
- Dashboard → project → **Connect** dialog (top right)
- **Use new publishable key** (`sb_publishable_xxx`) — old `anon` keys deprecated end of 2026
- Copy: Project URL + Publishable key (client-side safe)
- Secret key only needed for server-side ops — not needed here

### 3. Install client
```bash
npm install @supabase/supabase-js
```

### 4. Create Supabase client file
`src/lib/supabase.js`
```js
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY
)
```

### 5. Vercel env vars
In Vercel project settings → Environment Variables:
```
VITE_SUPABASE_URL=https://<project>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxx
```
Also add to local `.env` file (git-ignored).

### 6. Create tables (SQL editor in Supabase dashboard)
Tables needed for this project:
```sql
-- Hex state (GM controlled)
CREATE TABLE hexes (
  id TEXT PRIMARY KEY,           -- e.g. "A1", "B3"
  name TEXT,
  color_tag TEXT,
  reveal_tier INT DEFAULT 0,     -- 0=hidden, 1=hex, 2=name, 3=full
  markdown_content TEXT,
  gm_private_note TEXT,
  gm_shared_note TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Player notes per hex
CREATE TABLE player_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hex_id TEXT REFERENCES hexes(id),
  player_name TEXT,
  note TEXT,
  is_party_note BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Party markers (GM controlled, visible to all)
CREATE TABLE party_markers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT DEFAULT 'Party',
  color TEXT DEFAULT '#FFD700',
  hex_id TEXT REFERENCES hexes(id),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Module locations (assignable to hexes)
CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE,
  hex_id TEXT REFERENCES hexes(id),   -- null = unassigned
  is_region BOOLEAN DEFAULT false     -- regions/rivers may span hexes
);

-- Trackers (rations + custom)
CREATE TABLE trackers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  type TEXT,                     -- 'progress' or 'pip'
  current_value INT DEFAULT 0,
  max_value INT DEFAULT 10,
  visible_to_players BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### 7. Enable Realtime on tables
Run in SQL editor:
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE hexes;
ALTER PUBLICATION supabase_realtime ADD TABLE player_notes;
ALTER PUBLICATION supabase_realtime ADD TABLE trackers;
ALTER PUBLICATION supabase_realtime ADD TABLE locations;
ALTER PUBLICATION supabase_realtime ADD TABLE party_markers;
```

### 8. Set RLS policies
For this app (no auth, trust-based) simplest policy:
```sql
-- Allow all reads and writes (adjust if you add auth later)
ALTER TABLE hexes ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE trackers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_hexes" ON hexes FOR SELECT USING (true);
CREATE POLICY "public_write_hexes" ON hexes FOR ALL USING (true);

CREATE POLICY "public_read_notes" ON player_notes FOR SELECT USING (true);
CREATE POLICY "public_write_notes" ON player_notes FOR ALL USING (true);

CREATE POLICY "public_read_trackers" ON trackers FOR SELECT USING (true);
CREATE POLICY "public_write_trackers" ON trackers FOR ALL USING (true);
```
> Note: Open RLS is fine for a private table-use app. If you ever expose this publicly, lock down gm_private_note reads with a GM secret or Supabase Auth.

### 9. Realtime subscription pattern in React
```js
useEffect(() => {
  const channel = supabase
    .channel('hex-updates')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'hexes'
    }, (payload) => {
      // update local state with payload.new
    })
    .subscribe()

  return () => supabase.removeChannel(channel) // cleanup on unmount
}, [])
```

---

## Open Questions Before Building
- None — grid solved, stack chosen, Supabase steps documented. Ready to build.
