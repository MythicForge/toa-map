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

// ── Load all state from Supabase ──────────────────────────────

export async function loadAllState() {
  const [hexRes, gmRes, markerRes, trackerRes, pnoteRes, bnoteRes] = await Promise.all([
    supabase.from('hexes').select('*'),
    supabase.from('gm_notes').select('*'),
    supabase.from('party_markers').select('*').order('sort_order'),
    supabase.from('trackers').select('*').order('sort_order'),
    supabase.from('player_notes').select('*'),
    supabase.from('party_notes').select('*'),
  ]);

  const hexes = {};
  for (const row of (hexRes.data || [])) hexes[row.hex_id] = hexFromRow(row);
  for (const row of (gmRes.data || [])) {
    if (hexes[row.hex_id]) hexes[row.hex_id].gmNote = row.note ?? '';
  }

  const playerNotes = {};
  for (const row of (pnoteRes.data || [])) {
    if (!playerNotes[row.hex_id]) playerNotes[row.hex_id] = {};
    playerNotes[row.hex_id][row.player_name] = row.note;
  }

  const partyNotes = {};
  for (const row of (bnoteRes.data || [])) partyNotes[row.hex_id] = row.note;

  return {
    hexes,
    partyMarkers: (markerRes.data || []).map(markerFromRow),
    trackers: (trackerRes.data || []).map(trackerFromRow),
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
