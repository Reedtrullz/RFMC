# FMC-to-ND Visualization Notes for fmc.reidar.tech

## Overview

The **Navigation Display (ND)** is essentially the visual output of the FMC/FMGS. The FMC is where the pilot defines the route, procedures, performance and navigation assumptions; the ND shows what those choices mean spatially.

In the reference screenshot, the right display is an **Airbus-style Navigation Display in ARC/NAV mode**. The aircraft is at the bottom, the map is track-up, the green route line comes from the FMGS flight plan, and the labels on the left show optional layers such as airports, stations, terrain, traffic and ADF/VOR bearing-pointer selections.

## The Core Idea

The ND is affected by three different sources:

| Source                          | What it controls                                                                                                               |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| **FMC / MCDU / FMGS**           | Route, waypoints, legs, procedures, constraints, holds, fixes, active leg, missed approach, VNAV profile, top of climb/descent |
| **EFIS / ND control panel**     | ND mode, range, map overlays, weather radar, terrain, traffic, airports, waypoints, stations                                   |
| **Aircraft sensors / avionics** | Actual aircraft position, heading, track, wind, VOR/DME/ILS data, GPS/IRS position, TCAS traffic, radar, terrain database      |

For your app, do **not** think of the ND as “another FMC page.” Think of it as a **live graphical renderer** of the FMC state.

---

# FMC Settings That Should Visibly Change the ND

## 1. ORIGIN / DEST

When the user enters:

```text
ORIGIN: ENGM
DEST: ENBR
```

the ND should gain the departure and destination airports.

At first, before a route is built, you can show:

```text
ENGM ---------------- ENBR
```

or just airport symbols with no connected route yet.

Useful visual effect:

```text
[ENGM]                         [ENBR]
  departure airport              destination airport
```

This teaches the user that the FMC now knows the flight’s endpoints, but not yet the actual route.

---

## 2. Route Legs

When the user enters airways, fixes or direct waypoints on the FMC route page, the ND should draw them as connected segments.

Example FMC route:

```text
ENGM  TRIPO  RIGOL  SUMAK  ENBR
```

ND effect:

```text
ENGM ───── TRIPO ───── RIGOL ───── SUMAK ───── ENBR
```

On a Boeing-style ND, the active FMC route is normally magenta.

On an Airbus-style ND, the active flight plan is typically green.

For your app, I would use two visual styles:

| State                      | Boeing-style            | Airbus-style                    |
| -------------------------- | ----------------------- | ------------------------------- |
| Active route               | Magenta solid line      | Green solid line                |
| Modified / temporary route | White or dashed magenta | Yellow dashed line              |
| Discontinuity              | Broken line / gap       | “F-PLN DISCONTINUITY” gap       |
| Direct-to intercept        | Dashed intercept line   | Dashed temporary intercept line |

---

## 3. EXEC / INSERT

This is one of the most important concepts to visualize.

On Boeing:

1. User changes the route.
2. FMC shows a modified route.
3. ND can show the change as a dashed or alternate line.
4. User presses **EXEC**.
5. The modified route becomes the active route.

On Airbus:

1. User modifies the flight plan.
2. MCDU creates a **temporary flight plan**.
3. ND shows it as a **yellow dashed line**.
4. User presses **INSERT**.
5. It becomes the active green route.

This would be extremely useful in your app.

Example:

```text
Current active route:
A ───── B ───── C ───── D

User adds direct-to C:
A ───── B
 \
  \ - - - C ───── D
```

Before EXEC/INSERT, show the new path dashed.

After EXEC/INSERT, make it solid and remove the old segment.

---

## 4. SID Selection

When the user selects a departure runway and SID in the FMC, the ND should instantly show the departure procedure.

Example:

```text
RWY 19R
SID: TRIPO1A
```

ND effect:

```text
ENGM RWY19R → departure turn → altitude/speed constrained fixes → TRIPO
```

You can show:

```text
RW19R
  |
  | curved departure path
  |
TRIPO
```

This is one of the best places to teach the point of SIDs. The user sees that the FMC is not just storing text; it is loading a coded path from the nav database.

---

## 5. STAR and Approach Selection

Same idea for arrival.

If the user selects:

```text
STAR: RIGOL2B
APP: ILS 17
```

the ND should draw:

```text
RIGOL → arrival fixes → final approach intercept → runway
```

Before selecting the approach, the route may end near the airport.

After selecting the approach, the ND should extend all the way to the runway/final approach path.

This is a powerful learning moment.

```text
Before approach:
RIGOL ───── SUMAK ───── ENBR

After approach:
RIGOL ───── SUMAK ───── IF ───── FAF ───── RW17
```

---

## 6. Discontinuities

Discontinuities are hard to understand from the FMC alone. The ND makes them obvious.

FMC:

```text
TRIPO
RIGOL
---- DISCONTINUITY ----
SUMAK
ENBR
```

ND:

```text
TRIPO ───── RIGOL        SUMAK ───── ENBR
                  gap
```

In your app, a discontinuity should be very visible. Maybe show:

```text
ROUTE GAP
F-PLN DISCONTINUITY
```

Clicking the gap could highlight the corresponding FMC line.

That would be a great teaching feature.

---

## 7. Direct-To

A direct-to command should redraw the active leg.

Before:

```text
A ───── B ───── C ───── D
```

Aircraft is flying from A to B.

After direct-to C:

```text
Aircraft ───── C ───── D
```

The skipped waypoint B should either disappear from the active route or become visually inactive.

You can animate this in your app:

```text
Old route fades
New direct line appears
Active waypoint changes to C
```

---

## 8. Holds

When the user creates or selects a hold in the FMC, the ND should draw the racetrack pattern.

FMC:

```text
HOLD AT TRIPO
INBD CRS 193
RIGHT TURNS
LEG TIME 1.0
```

ND:

```text
          ______
         /      \
TRIPO > |        |
         \______/
```

This would be a very useful feature because holds are much easier to understand visually than as FMC text.

---

## 9. Altitude and Speed Constraints

The FMC stores constraints like:

```text
TRIPO   250/FL100
RIGOL   220/7000
SUMAK   180/3000
```

On the ND, these can appear next to waypoints.

Example:

```text
TRIPO
250/FL100
```

For Airbus, this is especially relevant with the **CSTR** pushbutton. If constraints are enabled, the ND shows altitude/speed constraints near waypoints. If CSTR is off, the route remains but the extra constraint text disappears.

For your app:

```text
CSTR OFF:
TRIPO

CSTR ON:
TRIPO
250/FL100
```

This teaches users what the CSTR overlay is for.

---

## 10. Performance Settings and VNAV Profile

Performance entries do not only affect speeds on the FMC. They also affect the vertical profile shown on the ND, especially on Boeing with VNAV/VSD concepts.

FMC entries that matter:

```text
CRZ ALT
COST INDEX
GROSS WEIGHT
RESERVES
STEP CLIMB
DESCENT SPEED
APPROACH SPEED
```

ND effects:

| FMC input            | ND effect                                         |
| -------------------- | ------------------------------------------------- |
| Cruise altitude      | Changes top of climb and top of descent           |
| Cost index           | Can affect climb/cruise/descent speed predictions |
| Altitude constraints | Adds level-off points or constraint markers       |
| Descent forecast     | Changes descent path prediction                   |
| Approach speed       | Affects deceleration point                        |

Useful symbols to render:

```text
T/C  = Top of Climb
T/D  = Top of Descent
DECEL = Deceleration point
E/D  = End of Descent
```

Example ND route:

```text
ENGM ─── T/C ───────────── T/D ─── DECEL ─── ENBR
```

This is exactly the type of thing that helps users understand why PERF INIT matters.

---

## 11. FIX INFO / Radial-Distance Rings

On Boeing, the FMC FIX page can create reference fixes. These can show on the ND as rings or radial lines.

Example FMC FIX:

```text
FIX: ENBR
RADIAL: 170
DIST: 10
```

ND effect:

```text
10 NM ring around ENBR
radial line extending from ENBR
```

Visually:

```text
          / radial 170
         /
      ( ENBR )
       10 NM ring
```

This would be an excellent advanced feature for your app.

---

## 12. Navaid Tuning

When the FMC or radio panel tunes VORs, DMEs, ILS or ADFs, the ND can show bearing pointers, identifiers, DME distances and raw-data needles.

Example:

```text
VOR L: TRF 113.85
ADF R: SND
ILS: 109.90 CRS 193
```

ND effect:

```text
ADF 1 SND
ADF 2 OFF
VOR/DME identifier and distance
ILS course line in APP/ILS mode
```

On your app, you could make this interactive:

```text
ADF 1 selector: OFF / ADF / VOR
ADF 2 selector: OFF / ADF / VOR
```

Then show or hide the bearing needles on the ND.

---

# ND Modes Worth Implementing

## Boeing 737-Style ND Modes

For a 737 FMC app, I would implement these:

| Mode        | What it shows                                            | Why it matters                 |
| ----------- | -------------------------------------------------------- | ------------------------------ |
| **MAP**     | Main FMC route, aircraft position, waypoints, active leg | Most common mode               |
| **MAP CTR** | Same as MAP, but aircraft centered in full compass rose  | Good for spatial awareness     |
| **PLAN**    | North-up static route review                             | Used with LEGS stepping        |
| **APP**     | Localizer/glideslope/raw approach data                   | Shows ILS/GLS approach concept |
| **VOR**     | Raw VOR course/deviation                                 | Shows conventional nav backup  |
| **VSD**     | Vertical route/profile view                              | Great for VNAV teaching        |

For your app, start with **MAP** and **PLAN** first. Those are the most directly connected to FMC learning.

### Boeing MAP Mode

Looks like:

```text
        HDG/TRK scale
             360
              |
      WPT1 ---+--- WPT2
              |
          aircraft
```

Shows:

```text
Active route
Active waypoint
Next waypoint distance/time
Heading/track
Map range rings
T/C, T/D, DECEL
Constraints
Weather/terrain/traffic if selected
```

### Boeing PLAN Mode

Looks like:

```text
North-up map
Selected waypoint centered
Aircraft may not be centered
Route review controlled from FMC LEGS page
```

This is ideal for your app because you can connect it directly to the FMC:

```text
FMC LEGS page line selected → ND centers that waypoint
Press STEP → ND moves to next waypoint
```

---

## Airbus A320neo-Style ND Modes

For Airbus, implement:

| Mode                          | What it shows                         | Why it matters                        |
| ----------------------------- | ------------------------------------- | ------------------------------------- |
| **ARC**                       | Forward 90-degree map view            | Most common operational ND view       |
| **ROSE NAV**                  | Centered compass rose with FMGS route | Good for full orientation             |
| **PLAN**                      | North-up route review                 | Used for checking flight plan changes |
| **ROSE ILS**                  | Raw ILS/xLS style approach view       | Shows final approach guidance         |
| **ROSE VOR**                  | Raw VOR navigation                    | Conventional nav                      |
| **TCAS / TERR / WX overlays** | Optional layers                       | Situational awareness                 |

Your screenshot is closest to **Airbus ARC/NAV**.

It shows:

```text
TRK 193 MAG       top center
range arc         curved scale
aircraft symbol   bottom center
green route       active FMGS route
waypoints         labels around route
RNP/ANP           lower right
FMC L             active FMGC/FMC source
ARPT/STA/TERR/TFC layer labels
ADF1/ADF2         bearing pointer sources
```

---

# The Most Important FMC-to-ND Mappings for Your App

This is the part I would build around.

| FMC/MCDU action                 | ND visual result                          |
| ------------------------------- | ----------------------------------------- |
| Enter origin/destination        | Airports appear                           |
| Enter route waypoint            | Waypoint appears and connects to route    |
| Select SID                      | Departure path appears                    |
| Select STAR                     | Arrival path appears                      |
| Select approach                 | Final approach path appears               |
| Create discontinuity            | Route line breaks                         |
| Clear discontinuity             | Route connects                            |
| Direct-to waypoint              | Active leg redraws direct to selected fix |
| Add hold                        | Racetrack hold appears                    |
| Modify route before EXEC/INSERT | Dashed temporary route appears            |
| Press EXEC/INSERT               | Temporary route becomes active            |
| Enter cruise altitude           | T/C and T/D move                          |
| Add altitude constraint         | Constraint appears at waypoint            |
| Select CSTR                     | Constraint labels show/hide               |
| Select ARPT/WPT/STA             | Map symbols appear/disappear              |
| Select TERR                     | Terrain overlay appears                   |
| Select WXR                      | Weather radar overlay appears             |
| Select TFC                      | Traffic symbols appear                    |
| Tune ILS                        | ILS course/deviation appears              |
| Select PLAN                     | Route review view appears                 |
| Press STEP on LEGS page         | ND centers next waypoint                  |

---

# Suggested Architecture for fmc.reidar.tech

I would structure it like this:

```ts
FmcState;
route;
activeLegIndex;
temporaryRoute;
discontinuities;
origin;
destination;
selectedRunway;
selectedSid;
selectedStar;
selectedApproach;
performance;
constraints;
holds;
fixes;
navaids;
rnpAnp;

NdState;
aircraftType: 'B737' | 'A320';
mode: 'MAP' | 'PLAN' | 'ARC' | 'ROSE_NAV' | 'APP' | 'VOR';
rangeNm: 5 | 10 | 20 | 40 | 80 | 160 | 320 | 640;
centered: boolean;
overlays: airports: boolean;
waypoints: boolean;
stations: boolean;
constraints: boolean;
terrain: boolean;
weather: boolean;
traffic: boolean;
data: boolean;
position: boolean;
```

Then the ND component becomes a renderer:

```tsx
<NavigationDisplay aircraft="A320" fmcState={fmcState} ndState={ndState} aircraftPosition={aircraftPosition} />
```

The FMC should not “draw” the ND directly.

The FMC should update shared flight-management state, and the ND should render that state.

That gives you a clean mental model:

```text
FMC input → flight management state → ND visualization
```

---

# Best MVP for Your App

## Phase 1: Basic Route Map

Implement:

```text
Origin
Destination
Waypoints
Active leg
Range selector
MAP/ARC mode
PLAN mode
```

This alone would make the FMC route pages much easier to understand.

## Phase 2: Modification Logic

Add:

```text
Temporary route
EXEC/INSERT behavior
Discontinuities
Direct-to
LEGS page stepping
```

This is probably the most educational part.

## Phase 3: Procedures

Add:

```text
SID
STAR
Approach
Runway symbol
Final approach course
Missed approach path
```

Now users can see why departure/arrival pages matter.

## Phase 4: Performance/VNAV

Add:

```text
T/C
T/D
DECEL
Altitude constraints
Speed constraints
VNAV path preview
```

This connects PERF INIT to something visual.

## Phase 5: Overlays

Add:

```text
TERR
WXR
TFC
ARPT
WPT
STA
DATA
POS
CSTR
ADF/VOR bearing pointers
```

These make the ND feel alive, but they should come after the route logic.

---

# The Teaching Angle

The biggest value is that every FMC entry gets a visual consequence.

For example:

```text
User enters CRZ ALT 350
→ T/C and T/D appear on ND

User selects ILS 17
→ final approach course appears

User creates DIRECT TO RIGOL
→ active route redraws

User modifies route but does not EXEC
→ dashed temporary line appears

User clears discontinuity
→ broken route becomes connected
```

That would turn your app from “FMC text trainer” into a real **flight-management visualizer**.

For your specific app, I would start with an **Airbus ARC-style ND like the screenshot** and a **Boeing MAP-style ND**, both driven by the same underlying route model. Then let users toggle aircraft style.
