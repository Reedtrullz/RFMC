import { Children, type ReactNode } from 'react';
import type { AircraftType } from '@shared';

/* ═══════════════════════════════════════════════════════════════
   CockpitShell — Physical Boeing 737 NG flight deck panel frame

   Three flex sections stack naturally:
     1. Glareshield  — dark overhang, houses MCP in center cutout
     2. MainPanel    — Boeing-gray, 3-col grid for PFD/ND/EICAS
     3. Pedestal     — darker bay, houses CDU in centered cutout

   Usage:
     <CockpitShell aircraft="BOEING_737">
       <CockpitShell.Glareshield>
         <MCPInstrument />
       </CockpitShell.Glareshield>
       <CockpitShell.MainPanel>
         <PFD />
         <ND />
         <EICAS />
       </CockpitShell.MainPanel>
       <CockpitShell.Pedestal>
         <CDU />
       </CockpitShell.Pedestal>
     </CockpitShell>
   ═══════════════════════════════════════════════════════════════ */

/* ── Shell root ── */

interface CockpitShellProps {
  children: ReactNode;
  aircraft: AircraftType;
  className?: string;
}

export function CockpitShell({ children, aircraft, className = '' }: CockpitShellProps) {
  const isBoeing = aircraft === 'BOEING_737';

  return (
    <div
      className={`cockpit-shell ${isBoeing ? 'cockpit-shell--boeing' : 'cockpit-shell--airbus'} ${className}`}
      data-testid="cockpit-shell"
    >
      {children}
    </div>
  );
}

/* ── Glareshield section ── */

interface CockpitShellSectionProps {
  children: ReactNode;
}

function Glareshield({ children }: CockpitShellSectionProps) {
  return (
    <div className="cockpit-shell__glareshield">
      {/* Left annunciator lights */}
      <div className="cockpit-shell__annunciator--left">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="cockpit-shell__annunciator-light" />
        ))}
      </div>

      {/* Right annunciator lights */}
      <div className="cockpit-shell__annunciator--right">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="cockpit-shell__annunciator-light" />
        ))}
      </div>

      {/* MCP housing — recessed cutout centered in glareshield */}
      <div className="cockpit-shell__mcp-housing">{children}</div>
    </div>
  );
}

/* ── Main instrument panel section ── */

function MainPanel({ children }: CockpitShellSectionProps) {
  // Wrap each child in a cutout div so they sit in dark recessed panel holes
  const wrappedChildren = Children.map(children, (child, i) => (
    <div key={i} className="cockpit-shell__cutout">
      {child}
    </div>
  ));

  return (
    <div className="cockpit-shell__main-panel">
      <div className="cockpit-shell__instrument-grid">{wrappedChildren}</div>
    </div>
  );
}

/* ── Pedestal section ── */

function Pedestal({ children }: CockpitShellSectionProps) {
  return (
    <div className="cockpit-shell__pedestal">
      <div className="cockpit-shell__cdu-bay">{children}</div>
    </div>
  );
}

/* ── Attach sub-components ── */

CockpitShell.Glareshield = Glareshield;
CockpitShell.MainPanel = MainPanel;
CockpitShell.Pedestal = Pedestal;

export type { CockpitShellProps, CockpitShellSectionProps };
