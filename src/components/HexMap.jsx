import { useState, useEffect, useRef } from 'react';
import { MAP_W, MAP_H, HEX_R, hexCenter, hexPoints, hexId, colRowFromId, pixelToHex } from '../lib/hexMath';

const TIER_COLORS = ['#454455', '#7B9EC9', '#C9923A', '#4a9c6e'];

function drawHexPath(ctx, cx, cy, r) {
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i;
    i === 0
      ? ctx.moveTo(cx + r * Math.cos(a), cy + r * Math.sin(a))
      : ctx.lineTo(cx + r * Math.cos(a), cy + r * Math.sin(a));
  }
  ctx.closePath();
}

function PartyMarker({ marker }) {
  const { col, row } = colRowFromId(marker.hexId);
  const [cx, cy] = hexCenter(col, row);
  const r = HEX_R * 0.46;
  return (
    <g pointerEvents="none">
      <circle cx={cx} cy={cy} r={r + 4} fill="rgba(0,0,0,0.45)" />
      <circle cx={cx} cy={cy} r={r + 1} fill={marker.color} opacity="0.18" />
      <circle cx={cx} cy={cy} r={r}
        fill={marker.color} stroke="rgba(255,255,255,0.75)" strokeWidth="1.8" />
      <text x={cx} y={cy + 0.5} textAnchor="middle" dominantBaseline="middle"
        fill="rgba(0,0,0,0.82)" fontSize={r * 0.88}
        fontFamily="Cinzel, serif" fontWeight="700"
        style={{ userSelect: 'none' }}>
        {marker.name.charAt(0)}
      </text>
    </g>
  );
}

// Draws the static hex layer to canvas — only called when hexData/mode changes
function redrawCanvas(canvas, hexData, mode) {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, MAP_W, MAP_H);

  const entries = Object.entries(hexData);

  if (mode === 'gm') {
    entries.forEach(([id, h]) => {
      if (!h.colorTag) return;
      const { col, row } = colRowFromId(id);
      const [cx, cy] = hexCenter(col, row);

      drawHexPath(ctx, cx, cy, HEX_R * 0.89);
      ctx.fillStyle = h.colorTag + '30';
      ctx.fill();
      ctx.strokeStyle = h.colorTag;
      ctx.lineWidth = 1.5;
      ctx.globalAlpha = 0.65;
      ctx.stroke();
      ctx.globalAlpha = 1;

      // Tier badge dot
      ctx.beginPath();
      ctx.arc(cx + HEX_R * 0.56, cy - HEX_R * 0.55, HEX_R * 0.19, 0, Math.PI * 2);
      ctx.fillStyle = TIER_COLORS[h.revealTier] || TIER_COLORS[0];
      ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.6)';
      ctx.lineWidth = 0.8;
      ctx.stroke();
    });
    return;
  }

  // ── Player mode ───────────────────────────────────────────────
  const tier1Plus = entries.filter(([, h]) => h.revealTier >= 1);
  const tier1Only = entries.filter(([, h]) => h.revealTier === 1);
  const tier2Plus = entries.filter(([, h]) => h.revealTier >= 2);

  // Build fog on a temp canvas using compositing
  const fog = document.createElement('canvas');
  fog.width = MAP_W; fog.height = MAP_H;
  const fc = fog.getContext('2d');

  // Dense fog everywhere
  fc.fillStyle = 'rgba(4,5,14,0.91)';
  fc.fillRect(0, 0, MAP_W, MAP_H);

  // Cut holes for tier1+ (map shows through)
  fc.globalCompositeOperation = 'destination-out';
  fc.fillStyle = '#000';
  tier1Plus.forEach(([id]) => {
    const { col, row } = colRowFromId(id);
    const [cx, cy] = hexCenter(col, row);
    drawHexPath(fc, cx, cy, HEX_R * 1.02);
    fc.fill();
  });

  // Light veil over tier1 hexes only
  fc.globalCompositeOperation = 'source-over';
  fc.fillStyle = 'rgba(4,5,14,0.52)';
  tier1Only.forEach(([id]) => {
    const { col, row } = colRowFromId(id);
    const [cx, cy] = hexCenter(col, row);
    drawHexPath(fc, cx, cy, HEX_R * 1.02);
    fc.fill();
  });

  // Composite fog onto main canvas
  ctx.drawImage(fog, 0, 0);

  // Tier1 subtle ring strokes
  ctx.strokeStyle = 'rgba(123,158,201,0.35)';
  ctx.lineWidth = 1;
  tier1Only.forEach(([id]) => {
    const { col, row } = colRowFromId(id);
    const [cx, cy] = hexCenter(col, row);
    drawHexPath(ctx, cx, cy, HEX_R * 0.9);
    ctx.stroke();
  });

  // Tier2+ colored fills + strokes
  tier2Plus.forEach(([id, h]) => {
    const { col, row } = colRowFromId(id);
    const [cx, cy] = hexCenter(col, row);
    const clr = h.colorTag || '#C9923A';

    drawHexPath(ctx, cx, cy, HEX_R * 0.91);
    ctx.fillStyle = clr + '22';
    ctx.fill();
    ctx.strokeStyle = clr;
    ctx.lineWidth = 1.8;
    ctx.stroke();
  });

  // Tier2+ name labels
  const fontSize = Math.min(HEX_R * 0.68, 13);
  ctx.font = `600 ${fontSize}px Cinzel, serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#fff';
  ctx.shadowColor = 'rgba(0,0,0,0.9)';
  ctx.shadowBlur = 2;
  tier2Plus.forEach(([id, h]) => {
    if (!h.name) return;
    const { col, row } = colRowFromId(id);
    const [cx, cy] = hexCenter(col, row);
    const label = h.name.length > 13 ? h.name.slice(0, 12) + '…' : h.name;
    ctx.fillText(label, cx, cy);
  });
  ctx.shadowBlur = 0;
}

export default function HexMap({ hexData, mode, onHexClick, onHexPaint, selectedHexId, partyMarkers, accentColor, movingMarkerId, multiSelectIds }) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [hoveredId, setHoveredId] = useState(null);
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const dragRef = useRef(null);
  const paintRef = useRef(null);
  const liveRef = useRef({ zoom: 1, pan: { x: 0, y: 0 } });
  liveRef.current = { zoom, pan };

  // Initial fit-contain zoom
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const z = Math.min(el.clientWidth / MAP_W, el.clientHeight / MAP_H) * 0.97;
    setZoom(z);
    setPan({ x: (el.clientWidth - MAP_W * z) / 2, y: (el.clientHeight - MAP_H * z) / 2 });
  }, []);

  // Wheel zoom
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = (e) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const mx = e.clientX - rect.left, my = e.clientY - rect.top;
      const { zoom: z, pan: p } = liveRef.current;
      const nz = Math.min(4, Math.max(0.14, z * (e.deltaY < 0 ? 1.13 : 1 / 1.13)));
      setZoom(nz);
      setPan({ x: mx - (mx - p.x) * (nz / z), y: my - (my - p.y) * (nz / z) });
    };
    el.addEventListener('wheel', handler, { passive: false });
    return () => el.removeEventListener('wheel', handler);
  }, []);

  // Redraw canvas only when hex data or mode changes — NOT on every interaction
  useEffect(() => {
    if (canvasRef.current) redrawCanvas(canvasRef.current, hexData, mode);
  }, [hexData, mode]);

  const getHexAt = (clientX, clientY) => {
    const { zoom: z, pan: p } = liveRef.current;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return null;
    return pixelToHex((clientX - rect.left - p.x) / z, (clientY - rect.top - p.y) / z);
  };

  const onMouseDown = (e) => {
    if (e.button === 1) {
      e.preventDefault(); // block browser autoscroll
      dragRef.current = { sx: e.clientX, sy: e.clientY, sp: { ...pan }, moved: false };
      return;
    }
    if (e.button !== 0) return;
    if (multiSelectIds != null) {
      const h = getHexAt(e.clientX, e.clientY);
      const startId = h ? hexId(h.col, h.row) : null;
      paintRef.current = { moved: false, startId, painted: new Set() };
      return;
    }
    dragRef.current = { sx: e.clientX, sy: e.clientY, sp: { ...pan }, moved: false };
  };

  const onMouseMove = (e) => {
    const { zoom: z, pan: p } = liveRef.current;
    const rect = containerRef.current?.getBoundingClientRect();

    // Pan always runs regardless of mode (middle-click drag)
    if (dragRef.current) {
      const dx = e.clientX - dragRef.current.sx, dy = e.clientY - dragRef.current.sy;
      if (Math.hypot(dx, dy) > 5) dragRef.current.moved = true;
      if (dragRef.current.moved) setPan({ x: dragRef.current.sp.x + dx, y: dragRef.current.sp.y + dy });
    }

    if (!rect) return;
    const h = pixelToHex((e.clientX - rect.left - p.x) / z, (e.clientY - rect.top - p.y) / z);
    const hid = h ? hexId(h.col, h.row) : null;
    setHoveredId(hid);

    if (multiSelectIds != null && paintRef.current && hid) {
      const pr = paintRef.current;
      if (!pr.moved && (e.movementX || e.movementY)) pr.moved = true;
      if (!pr.painted.has(hid)) {
        pr.painted.add(hid);
        onHexPaint && onHexPaint(hid);
      }
    }
  };

  const onMouseUp = (e) => {
    const wasPanning = dragRef.current?.moved;
    dragRef.current = null; // always release pan regardless of mode

    if (multiSelectIds != null) {
      const pr = paintRef.current;
      paintRef.current = null;
      if (pr && !pr.moved && pr.startId && pr.painted.size <= 1) {
        onHexClick(pr.startId, e.shiftKey);
      }
      return;
    }
    if (wasPanning) return;
    const h = getHexAt(e.clientX, e.clientY);
    if (h) onHexClick(hexId(h.col, h.row), e.shiftKey);
  };

  const onMouseLeave = () => {
    dragRef.current = null;
    paintRef.current = null;
    setHoveredId(null);
  };

  const accent = accentColor || '#7B9EC9';

  const resetView = () => {
    const el = containerRef.current;
    const z = Math.min(el.clientWidth / MAP_W, el.clientHeight / MAP_H) * 0.97;
    setZoom(z);
    setPan({ x: (el.clientWidth - MAP_W * z) / 2, y: (el.clientHeight - MAP_H * z) / 2 });
  };

  const cursor = movingMarkerId ? 'crosshair'
    : multiSelectIds != null ? 'crosshair'
    : dragRef.current?.moved ? 'grabbing'
    : 'grab';

  return (
    <div ref={containerRef}
      style={{ flex: 1, overflow: 'hidden', position: 'relative', background: '#06060e', cursor }}
      onMouseDown={onMouseDown} onMouseMove={onMouseMove}
      onMouseUp={onMouseUp} onMouseLeave={onMouseLeave}
    >
      {movingMarkerId && (
        <div style={{
          position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)',
          padding: '5px 14px', background: 'rgba(196,147,42,0.18)',
          border: '1px solid rgba(196,147,42,0.55)', borderRadius: 6,
          color: '#c4932a', fontSize: 11, fontFamily: 'Cinzel, serif',
          letterSpacing: '0.1em', zIndex: 50, pointerEvents: 'none',
        }}>
          CLICK HEX TO PLACE MARKER
        </div>
      )}

      {/* Pan/zoom wrapper */}
      <div style={{
        position: 'absolute',
        transform: `translate(${pan.x}px,${pan.y}px) scale(${zoom})`,
        transformOrigin: '0 0', willChange: 'transform',
        width: MAP_W, height: MAP_H,
      }}>
        {/* 1. Map image */}
        <img
          src={mode === 'gm' ? '/gm-map.jpg' : '/player-map.jpg'}
          width={MAP_W} height={MAP_H} draggable={false}
          style={{ display: 'block', userSelect: 'none' }} alt="Chult map"
        />

        {/* 2. Canvas — static hex layer, redraws only on hexData/mode change */}
        <canvas
          ref={canvasRef}
          width={MAP_W} height={MAP_H}
          style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
        />

        {/* 3. SVG — interactive layer only (hover, selected, multi-select, markers) */}
        <svg width={MAP_W} height={MAP_H} viewBox={`0 0 ${MAP_W} ${MAP_H}`}
          style={{ position: 'absolute', top: 0, left: 0 }}>

          {/* Hover highlight */}
          {hoveredId && hoveredId !== selectedHexId && (() => {
            const { col, row } = colRowFromId(hoveredId);
            const [cx, cy] = hexCenter(col, row);
            return <polygon
              points={hexPoints(cx, cy, HEX_R * 0.91)}
              fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.22)"
              strokeWidth="1" pointerEvents="none" />;
          })()}

          {/* Selected ring */}
          {selectedHexId && (() => {
            const { col, row } = colRowFromId(selectedHexId);
            const [cx, cy] = hexCenter(col, row);
            const clr = hexData[selectedHexId]?.colorTag || accent;
            return <g pointerEvents="none">
              <polygon points={hexPoints(cx, cy, HEX_R * 0.96)}
                fill={clr + '1a'} stroke={clr} strokeWidth="2.8" />
              <polygon points={hexPoints(cx, cy, HEX_R * 0.79)}
                fill="none" stroke={clr} strokeWidth="0.8" strokeOpacity="0.35" />
            </g>;
          })()}

          {/* Multi-select highlights */}
          {multiSelectIds && [...multiSelectIds].map(id => {
            const { col, row } = colRowFromId(id);
            const [cx, cy] = hexCenter(col, row);
            return (
              <polygon key={`ms-${id}`}
                points={hexPoints(cx, cy, HEX_R * 0.96)}
                fill="rgba(123,158,201,0.15)" stroke="#7B9EC9" strokeWidth="2"
                pointerEvents="none" />
            );
          })}

          {/* Party markers */}
          {partyMarkers.map(m => m.hexId
            ? <PartyMarker key={m.id} marker={m} />
            : null
          )}
        </svg>
      </div>

      {/* Zoom controls */}
      <div style={{ position: 'absolute', bottom: 16, left: 16, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {[['＋', () => setZoom(z => Math.min(4, z * 1.18))], ['－', () => setZoom(z => Math.max(0.14, z / 1.18))], ['⊙', resetView]].map(([l, fn], i) => (
          <button key={i} onClick={fn} style={{
            width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(8,8,18,0.9)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 4, color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: i === 2 ? 13 : 17,
          }}>{l}</button>
        ))}
      </div>

      {mode === 'player' && (
        <div style={{
          position: 'absolute', bottom: 16, right: 16,
          padding: '4px 10px', background: 'rgba(8,8,18,0.88)',
          border: '1px solid rgba(123,158,201,0.2)', borderRadius: 4,
          color: 'rgba(123,158,201,0.55)', fontSize: 10,
          fontFamily: 'Cinzel, serif', letterSpacing: '0.12em',
        }}>FOG OF WAR</div>
      )}
    </div>
  );
}
