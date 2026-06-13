import { supabase } from './supabase';

// ── Row → app-state mappers ───────────────────────────────────

export function hexFromRow(row) {
  return {
    name: row.name ?? '',
    location: row.location_key ?? null,
    colorTag: row.color_tag ?? null,
    revealTier: row.reveal_tier ?? 0,
    markdown: row.markdown ?? '',
    sharedNote: row.shared_note ?? '',
    gmNote: '',
  };
}

function markerFromRow(row) {
  return { id: row.id, name: row.name, color: row.color, hexId: row.hex_id };
}

function trackerFromRow(row) {
  return {
    id: row.id, name: row.name, type: row.type,
    current: row.current_value, max: row.max_value,
    visibleToPlayers: row.visible_to_players,
  };
}

// ── Paginated fetch (bypasses Supabase's 1000-row default limit) ─

async function fetchAll(table, order = null) {
  const PAGE = 1000;
  let rows = [];
  let from = 0;
  while (true) {
    let q = supabase.from(table).select('*').range(from, from + PAGE - 1);
    if (order) q = q.order(order);
    const { data, error } = await q;
    if (error) { console.error(`fetchAll ${table}`, error); break; }
    if (!data?.length) break;
    rows.push(...data);
    if (data.length < PAGE) break;
    from += PAGE;
  }
  return rows;
}

// ── Load all state from Supabase ──────────────────────────────

export async function loadAllState() {
  const { data: { session } } = await supabase.auth.getSession();
  const isGM = !!session;

  const [hexRows, gmRows, markerRows, trackerRows, pnoteRows, bnoteRows] = await Promise.all([
    fetchAll('hexes'),
    isGM ? fetchAll('gm_notes') : Promise.resolve([]),
    fetchAll('party_markers', 'sort_order'),
    fetchAll('trackers', 'sort_order'),
    fetchAll('player_notes'),
    fetchAll('party_notes'),
  ]);

  const hexes = {};
  for (const row of hexRows) hexes[row.hex_id] = hexFromRow(row);
  for (const row of gmRows) {
    if (hexes[row.hex_id]) hexes[row.hex_id].gmNote = row.note ?? '';
  }

  const playerNotes = {};
  for (const row of pnoteRows) {
    if (!playerNotes[row.hex_id]) playerNotes[row.hex_id] = {};
    playerNotes[row.hex_id][row.player_name] = row.note;
  }

  const partyNotes = {};
  for (const row of bnoteRows) partyNotes[row.hex_id] = row.note;

  return {
    hexes,
    partyMarkers: markerRows.map(markerFromRow),
    trackers: trackerRows.map(trackerFromRow),
    playerNotes,
    partyNotes,
  };
}

// ── Writes ────────────────────────────────────────────────────

export async function upsertHex(hexId, data) {
  const { error } = await supabase.from('hexes').upsert({
    hex_id: hexId,
    name: data.name ?? null,
    location_key: data.location ?? null,
    color_tag: data.colorTag ?? null,
    reveal_tier: data.revealTier ?? 0,
    markdown: data.markdown ?? null,
    shared_note: data.sharedNote ?? null,
  });
  if (error) console.error('upsertHex', error);

  if (data.gmNote !== undefined) {
    const { error: gnErr } = await supabase.from('gm_notes').upsert({
      hex_id: hexId,
      note: data.gmNote ?? '',
    });
    if (gnErr) console.error('upsertGmNote', gnErr);
  }
}

export async function upsertMarker(marker, sortOrder = 0) {
  const { error } = await supabase.from('party_markers').upsert({
    id: marker.id,
    name: marker.name,
    color: marker.color,
    hex_id: marker.hexId ?? null,
    sort_order: sortOrder,
  });
  if (error) console.error('upsertMarker', error);
}

export async function deleteMarker(markerId) {
  const { error } = await supabase.from('party_markers').delete().eq('id', markerId);
  if (error) console.error('deleteMarker', error);
}

export async function upsertTracker(tracker, sortOrder = 0) {
  const { error } = await supabase.from('trackers').upsert({
    id: tracker.id,
    name: tracker.name,
    type: tracker.type,
    current_value: tracker.current,
    max_value: tracker.max,
    visible_to_players: tracker.visibleToPlayers,
    sort_order: sortOrder,
  });
  if (error) console.error('upsertTracker', error);
}

export async function deleteTracker(trackerId) {
  const { error } = await supabase.from('trackers').delete().eq('id', trackerId);
  if (error) console.error('deleteTracker', error);
}

export async function upsertPlayerNote(hexId, playerName, note) {
  const { error } = await supabase.from('player_notes').upsert(
    { hex_id: hexId, player_name: playerName, note },
    { onConflict: 'hex_id,player_name' },
  );
  if (error) console.error('upsertPlayerNote', error);
}

export async function upsertPartyNote(hexId, note) {
  const { error } = await supabase.from('party_notes').upsert({ hex_id: hexId, note });
  if (error) console.error('upsertPartyNote', error);
}

export async function revealAllHexes(tier = 3) {
  const { error } = await supabase.rpc('reveal_all_hexes', { tier });
  if (error) console.error('revealAllHexes', error);
}

// ── Bulk import (JSON → Supabase) ─────────────────────────────

async function upsertChunked(table, rows, opts = {}) {
  const CHUNK = 400;
  for (let i = 0; i < rows.length; i += CHUNK) {
    const { error } = await supabase.from(table).upsert(rows.slice(i, i + CHUNK), opts);
    if (error) console.error(`upsertChunked ${table}`, error);
  }
}

export async function hydrateToSupabase(state) {
  const hexRows = Object.entries(state.hexes || {}).map(([hex_id, h]) => ({
    hex_id,
    name: h.name ?? null,
    location_key: h.location ?? null,
    color_tag: h.colorTag ?? null,
    reveal_tier: h.revealTier ?? 0,
    markdown: h.markdown ?? null,
    shared_note: h.sharedNote ?? null,
  }));

  const gmRows = Object.entries(state.hexes || {})
    .filter(([, h]) => h.gmNote)
    .map(([hex_id, h]) => ({ hex_id, note: h.gmNote }));

  const markerRows = (state.partyMarkers || []).map((m, i) => ({
    id: m.id, name: m.name, color: m.color,
    hex_id: m.hexId ?? null, sort_order: i,
  }));

  const trackerRows = (state.trackers || []).map((t, i) => ({
    id: t.id, name: t.name, type: t.type,
    current_value: t.current, max_value: t.max,
    visible_to_players: t.visibleToPlayers, sort_order: i,
  }));

  const pnoteRows = [];
  Object.entries(state.playerNotes || {}).forEach(([hex_id, players]) => {
    Object.entries(players || {}).forEach(([player_name, note]) => {
      if (note) pnoteRows.push({ hex_id, player_name, note });
    });
  });

  const bnoteRows = Object.entries(state.partyNotes || {})
    .filter(([, note]) => note)
    .map(([hex_id, note]) => ({ hex_id, note }));

  // Hexes must exist before FK-dependents (markers, notes)
  await upsertChunked('hexes', hexRows);
  await upsertChunked('gm_notes', gmRows);
  await Promise.all([
    upsertChunked('party_markers', markerRows),
    upsertChunked('trackers', trackerRows),
    upsertChunked('player_notes', pnoteRows, { onConflict: 'hex_id,player_name' }),
    upsertChunked('party_notes', bnoteRows),
  ]);
}
