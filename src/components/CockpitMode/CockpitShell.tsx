import type { ReactNode } from 'react';
import type { AircraftType } from '@shared';

interface CockpitShellProps {
  children: ReactNode;
  aircraft: AircraftType;
  className?: string;
}

/**
 * CockpitShell — Physical Boeing 737 NG / Airbus A320 flight deck panel frame.
 *
 * The shell IS a CSS grid with these areas:
 *   mcpslot  mcpslot  mcpslot   (row 2 — glareshield cutout)
 *   pfdslot  ndslot   eicasslot (row 3 — main panel cutouts)
 *   ped-l    cduslot  ped-r     (row 4 — pedestal bay)
 *
 * Physical frame sections (glareshield surface, panel surface, pedestal)
 * render as absolutely-positioned background layers (pointer-events: none).
 *
 * Children are instrument panels placed with cockpit-slot--* grid-area classes:
 *   cockpit-slot--mcp   → grid-area: mcpslot
 *   cockpit-slot--pfd   → grid-area: pfdslot
 *   cockpit-slot--nd    → grid-area: ndslot
 *   cockpit-slot--eicas → grid-area: eicasslot
 *   cockpit-slot--cdu   → grid-area: cduslot
 */
export function CockpitShell({ children, aircraft, className = '' }: CockpitShellProps) {
  const isBoeing = aircraft === 'BOEING_737';

  return (
    <div
      className={`cockpit-shell ${isBoeing ? 'cockpit-shell--boeing' : 'cockpit-shell--airbus'} ${className}`}
      data-testid="cockpit-shell"
    >
      {/* ── Background layers (pointer-events: none so instruments are interactive) ── */}

      {/* 1. Glareshield surface */}
      <div className="cockpit-shell__glareshield-surface">
        {/* Annunciator lights — left flank */}
        <div className="cockpit-shell__annunciator cockpit-shell__annunciator--left">
          <div className="cockpit-shell__annunciator-light" />
          <div className="cockpit-shell__annunciator-light" />
          <div className="cockpit-shell__annunciator-light" />
          <div className="cockpit-shell__annunciator-light" />
          <div className="cockpit-shell__annunciator-light" />
          <div className="cockpit-shell__annunciator-light" />
        </div>

        {/* Label stripes — left */}
        <div className="cockpit-shell__label-stripes cockpit-shell__label-stripes--left">
          <div className="cockpit-shell__label-stripe" />
          <div className="cockpit-shell__label-stripe" />
          <div className="cockpit-shell__label-stripe" />
        </div>

        {/* Label stripes — right */}
        <div className="cockpit-shell__label-stripes cockpit-shell__label-stripes--right">
          <div className="cockpit-shell__label-stripe" />
          <div className="cockpit-shell__label-stripe" />
          <div className="cockpit-shell__label-stripe" />
        </div>

        {/* Annunciator lights — right flank */}
        <div className="cockpit-shell__annunciator cockpit-shell__annunciator--right">
          <div className="cockpit-shell__annunciator-light" />
          <div className="cockpit-shell__annunciator-light" />
          <div className="cockpit-shell__annunciator-light" />
          <div className="cockpit-shell__annunciator-light" />
          <div className="cockpit-shell__annunciator-light" />
          <div className="cockpit-shell__annunciator-light" />
        </div>

        {/* Glareshield label */}
        <span className="cockpit-shell__panel-label" style={{ bottom: 4, left: '50%', transform: 'translateX(-50%)' }}>
          {isBoeing ? 'GLA RESHIELD' : 'GLA RESHIELD'}
        </span>
      </div>

      {/* 2. Main instrument panel surface */}
      <div className="cockpit-shell__panel-surface">
        <span className="cockpit-shell__panel-label" style={{ top: 3, left: '50%', transform: 'translateX(-50%)' }}>
          {isBoeing ? 'B737 NG · PRIMARY FLIGHT DISPLAYS' : 'A320 · PRIMARY FLIGHT DISPLAYS'}
        </span>
      </div>

      {/* 3. Pedestal surface */}
      <div className="cockpit-shell__pedestal-surface">
        <span className="cockpit-shell__panel-label" style={{ top: 3, left: '50%', transform: 'translateX(-50%)' }}>
          CONTROL STAND
        </span>
      </div>

      {/* ── Instrument cutouts (sit on the grid) ── */}

      {/* MCP cutout in the glareshield */}
      <div className="cockpit-shell__mcp-cutout" data-slot="mcpslot" />

      {/* Main panel instrument cutouts */}
      <div className="cockpit-shell__cutout cockpit-shell__cutout--pfd" data-slot="pfdslot" />
      <div className="cockpit-shell__cutout cockpit-shell__cutout--nd" data-slot="ndslot" />
      <div className="cockpit-shell__cutout cockpit-shell__cutout--eicas" data-slot="eicasslot" />

      {/* CDU bay in the pedestal */}
      <div className="cockpit-shell__cdu-bay" data-slot="cduslot" />

      {/* ── Rivet details ── */}

      {/* Glareshield rivets */}
      <Rivet top={8} left={12} />
      <Rivet top={8} right={12} />

      {/* Main panel corner rivets */}
      <Rivet top="calc(clamp(14px, 2vh, 28px) + clamp(140px, 19vh, 260px) + 6px)" left={10} />
      <Rivet top="calc(clamp(14px, 2vh, 28px) + clamp(140px, 19vh, 260px) + 6px)" right={10} />

      {/* ── Children: instruments positioned by grid-area classes ── */}
      {children}
    </div>
  );
}

/* ── Tiny rivet/screw detail ── */

function Rivet({
  top,
  right,
  bottom,
  left,
}: {
  top?: number | string;
  right?: number | string;
  bottom?: number | string;
  left?: number | string;
}) {
  return (
    <div
      className="cockpit-shell__rivet"
      style={{
        top: top != null ? top : undefined,
        right: right != null ? right : undefined,
        bottom: bottom != null ? bottom : undefined,
        left: left != null ? left : undefined,
      }}
    />
  );
}
