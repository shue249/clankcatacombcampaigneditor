# Clank! Catacombs — Solo Campaign Builder
## Product Requirements Document (PRD)

**Version:** 1.1 
**Status:** Draft

---

## 1. Overview

### 1.1 Product Summary

The **Clank! Catacombs Campaign Editor** is a web platform for designing campaigns for Clank! Catacomb solo plays. It provides an interactive web UI flow to easily create new campaigns, edit existing campaigns, export/import campaigns from other users, and run the campaigns. This does not replace Direwolf digital companion app. This is meant to expand the companion app, allowing fans to create new campaigns and share with community.

---

### 1.2 Goals

1. Make it easy to create new solo campaigns without coding knowledge, allowing for visual drag and drop
2. Allows easy run of the campaigns
3. Ensure campaigns are shareable: exportable as JSON, importable by other players.

### 1.3 Out of Scope (v1.1)

- Multiplayer or co-op campaign support
- Integration with the official Direwolf app
- Monetisation / campaign marketplace

---

## 2. Users

### 2.1 User Roles

| Role | Description |
|---|---|
| **Campaign Author** | Designs campaigns using the Editor. May be the same person as the player. Needs to understand the game's mechanics but does not need to be technical. |
| **Solo Player** | Runs a campaign using the Play mode during a game session. Needs the app open on a phone, tablet, or laptop at the table. |

### 2.2 Key User Journeys

**Journey 1 — Author creates a new campaign**
1. Click on New Campaign button, goes into Creator mode
2. Set campaign metadata (name, description (optional), introduction story text, starting map setup, starting artifacts and token setup, tile deck setup, starting clank area setup, rage track setup, chapter start instructions)
3. Allows creation of chapters. For each chapter: user can create events which are "MAIN-QUEST", "SIDE-QUEST", "ROUND-END". These can be inter-linked to each other as preconditions. All creation and linking should be easily done via UI drag and drop
4. There is a fixed event "ESCAPE", where each chapter only has 1 and only 1 such event. 
5. Preview the chapter flow (event order diagram)
6. Save the campaign as local store. At least 1 leaf MAIN-QUEST event must be linked to ESCAPE before save is permitted. Event loop back is NOT permitted. ESCAPE does not connect to any events.
7. Goes back to List mode, sees the new campaign created

**Journey 2 — Author sees all existing campaigns**
1. In List mode, see a list of existing campaigns
2. Each campaign shows the Name, description, author, number of chapters

**Journey 3 — Author edits an existing campaign**
1. In List mode, see a list of existing campaigns
2. Click on Edit button beside the campaign
3. Open in Creator mode → make changes to any details of the campaign
4. Save and overwrite the existing campaign. 
5. Goes back to List mode, sees the details of campaign updated

**Journey 4 — Author exports existing campaign**
1. In List mode, see a list of existing campaigns
2. Click on Export button beside the campaign
3. Saves the exported json file containing structure of campaign

**Journey 5 — Author imports campaign from json file**
1. Click on Import button
2. Open local file selector to select the json file
3. Save as new campaign into local storage
4. Goes back to List mode, sees the imported campaign

**Journey 6 — Player runs a campaign**
1. In List mode, see a list of existing campaigns
2. Follow chapter setup instructions in this order, introduction story text -> starting map setup -> starting artifacts and token setup -> tile deck setup -> starting clank area setup -> rage track setup -> set aside cards and tokens -> chapter start instructions
3. During play: tap buttons as quests and sub-quests completed
4. App fires quests and sub-qesusts in response, shows flavor text, presents choices, tracks state
5. During End turn: events fire based on conditions, App fires events in response, shows instructions text
6. At chapter end: enter score → receive grade → advance to next chapter

---

## 3. Platform Architecture

### 3.1 Data Model

**Campaign** (a campaign which contains a list of chapters):

```
Campaign
├── name
├── description
├── author
└── chapters[]
```
**Chapter** (a single session of gameplay within a campaign):

```
Chapter
├── chapter_number
├── title
├── intro_text
├── starting_map[]
├── starting_artifacts
├── starting_tokens
├── tile_deck[]
├── player_clank
├── rival_clank
├── dragon_clank
├── ghost_clank
├── rage_track
├── set_aside_cards
├── set_aside_tokens
├── instructions
├── events[] (ordered list of Event Instances)
├── scoring[]
├── grades[]              (label, min, max — non-overlapping, 0–999)
├── outro_text_escaped              (text — shown when player selects "I Escaped"; score counts)
├── outro_text_knocked_out_saved    (text — shown when player selects "Knocked Out — Saved"; score counts)
└── outro_text_knocked_out_depths   (text — shown when player selects "Knocked Out — In the Depths"; score = 0)
```

**Event** (a configured event placed in a chapter):

```
Event
├── event_id                  (e.g. "EVT-001")
├── category                  (fixed to "MAIN-QUEST", "SIDE-QUEST", "ROUND-END", "ESCAPE")
├── required_event_ids[]      (list of event ids to be fulfiled before unlocking this event)
├── name                      (name of event to be shown during Play, in verb form, eg "Defeat Skeleton")
├── remainder_text            (reminders to be shown on screen if this event is in play)
├── count                     (number of times this event can be cleared)
└── event_completion_text[]   (texts to be shown upon each event completion)
```

### 3.2 Tech Stack (Recommended)

| Layer | Choice | Rationale |
|---|---|---|
| Frontend | React (SPA) | Component-based, suits both Creator and Player UIs |
| State management | Zustand or Redux | Campaign state needs to persist across Player session |
| Storage | Browser localStorage + JSON export | No backend required for v1.0; campaigns are files |
| Styling | Tailwind CSS | Rapid iteration; design system feasible |
| Event graph canvas | React Flow (@xyflow/react) | Node-based DAG editor — drag, connect, and position events visually |
| Drag-and-drop (toolbar) | dnd-kit | Drag event types from toolbar onto the React Flow canvas |
| Persistence | File download/upload (JSON) | Simple sharing model |

---

## 4. Creator Mode

### 4.1 Overview

The Creator is a structured form-based editor. It guides the author through building a campaign chapter by chapter. The central metaphor is a **chapter canvas** — a vertical timeline of event instances connected by trigger relationships.

### 4.2 Creator Navigation

```
Sidebar                      Main Area
─────────────────────        ─────────────────────────────────────
Campaign Overview            [Selected view renders here]
├── Chapter 1
├── Chapter 2
│   ├── Story
│   ├── Setup
│   ├── Events
│   └── Completion
├── Chapter 3
...
└── Save
```

### 4.3 Campaign Settings Screen

Fields:

| Field | Type | Notes |
|---|---|---|
| name | Text | Required |
| description | Textarea |
| author | Text | Optional |

### 4.4 Chapter Editor

Allows Adding new chapters, editing existing chapters and deleting chapters.
Each chapter has four tabs:

#### Tab 1: Story

Configures the story. Fields include:

| Field | Type | Description |
|---|---|---|
| chapter_number | Integer | Automatically increment |
| title | Text |
| intro_text | TextArea |

#### Tab 2: Setup

Configures the gameplay setup. Fields include:

| Field | Type | Description |
|---|---|---|
| starting_map | TextArea | Free-text description for now. Will become a structured map selection UI in a future version. |
| starting_artifacts | List |
| starting_tokens | List |
| tile_deck | List |
| player_clank | Integer |
| rival_clank | Integer |
| dragon_clank | Integer |
| ghost_clank | Integer |
| rage_track | Integer |
| set_aside_cards | List |
| set_aside_tokens | List |
| instructions | TextArea |

#### Tab 3: Events

Configures the chapter's event graph. Events are created by dragging from a toolbar onto a canvas, then connected by drawing edges between them to form a Directed Acyclic Graph (DAG). The graph represents the order and preconditions under which events unlock during play.

##### Canvas Layout

```
┌──────────────────────────────────────────────────────────────────────┐
│  Toolbar:  [🔵 MAIN-QUEST]  [🟢 SIDE-QUEST]  [🟠 ROUND-END]        │
│            drag onto canvas to create                                │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   ┌──────────────────┐                                               │
│   │ 🔵 MAIN-QUEST    │                                               │
│   │ Defeat Skeleton  │────────────────────────┐                     │
│   └──────────────────┘                        │                     │
│                                               ▼                     │
│   ┌──────────────────┐          ┌──────────────────┐                │
│   │ 🟢 SIDE-QUEST    │──────▶   │ 🔵 MAIN-QUEST    │               │
│   │ Find the Relic   │          │ Open the Vault   │               │
│   └──────────────────┘          └────────┬─────────┘               │
│                                           │                         │
│   ┌──────────────────┐                   │                         │
│   │ 🟠 ROUND-END     │                   │                         │
│   │ Rage Increases   │                   │                         │
│   └──────────────────┘                   ▼                         │
│                               ┌───────────────────┐                │
│                               │ 🟩 ESCAPE         │                │
│                               │   (fixed — 1 per  │                │
│                               │    chapter)       │                │
│                               └───────────────────┘                │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

##### Toolbar

A fixed toolbar sits above the canvas. It contains three draggable event-type icons:

| Icon | Label | Colour |
|---|---|---|
| Drag handle | MAIN-QUEST | Blue |
| Drag handle | SIDE-QUEST | Green |
| Drag handle | ROUND-END | Orange |

ESCAPE is not in the toolbar — it is pre-placed on the canvas and cannot be added, moved to the toolbar, or deleted.

##### Event Nodes

Each event renders as a card on the canvas:

| Category | Colour | Border | Behaviour |
|---|---|---|---|
| MAIN-QUEST | Blue | Solid blue | Draggable, deletable |
| SIDE-QUEST | Green | Solid green | Draggable, deletable |
| ROUND-END | Orange | Solid orange | Draggable, deletable |
| ESCAPE | Green | Bold green | Fixed position, not deletable, no outgoing edges |

Each node displays:
- Category label (top, small)
- Event name (centre, prominent)
- Completion count badge if `count > 1` (e.g. `×3`)
- Input handle (top centre) — receives incoming edges
- Output handle (bottom centre) — source of outgoing edges (except ESCAPE)

##### Creating a New Event

1. Author drags an event icon from the toolbar and drops it anywhere on the canvas
2. The node appears at the drop position
3. An **Event Detail Popup** opens immediately over the canvas
4. Author fills in the fields and clicks **Save** — the node is labelled with the event name
5. Clicking **Cancel** removes the node

##### Event Detail Popup

Opens on create (drag-drop) and on edit (click an existing node). Contains:

| Field | Type | Description |
|---|---|---|
| name | Text (required) | Verb-form label shown during Play (e.g. "Defeat Skeleton") |
| remainder_text | Textarea | Reminder shown on the Play screen while event is active |
| count | Integer (min 1) | How many times the event must be completed; defaults to 1 |
| event_completion_text | List of Text (min 1) | At least 1 entry required. First entry shown on completion 1, second on completion 2, etc. If completions exceed the number of entries, the last entry is reused. |

`event_id` is auto-generated. `category` is fixed by the type dragged. `required_event_ids` is set by drawing edges on the canvas, not entered manually.

##### Connecting Events (Drawing Edges)

1. Hover over a node — the output handle highlights
2. Click and drag from the output handle toward another node's input handle
3. Release over the target node — a directed arrow is drawn from source → target
4. The arrow means: *target event is unlocked only after source event is completed*
5. Multiple incoming edges = all must be completed before the target unlocks (AND logic)
6. Clicking an existing edge and pressing Delete removes that connection

##### Canvas Rules and Validation

| Rule | Enforcement |
|---|---|
| No event loops (cycles) | Edge is rejected with an inline error if it would create a cycle |
| ESCAPE has no outgoing edges | Output handle on ESCAPE is disabled |
| ESCAPE cannot be deleted | Delete action is not available on the ESCAPE node |
| Exactly one ESCAPE per chapter | ESCAPE is pre-placed; toolbar does not offer it |
| Only MAIN-QUEST nodes may connect to ESCAPE | Edge is rejected with an inline error if a SIDE-QUEST or ROUND-END node tries to connect to ESCAPE |
| Save requires at least one MAIN-QUEST leaf connected to ESCAPE | Save button is disabled with tooltip until this condition is met |

##### Deleting an Event

Any event node except ESCAPE can be deleted. Deleting a node removes it and all edges connected to it — both incoming (events that were prerequisites) and outgoing (events it was unlocking). No orphaned edges are left on the canvas.

**Interaction:**
1. Click a node to select it — the node highlights with a selection border
2. Press the **Delete** key, or click the **✕** button that appears on the selected node
3. A confirmation prompt appears: *"Delete [event name]? This will also remove all connected edges."*
4. Confirm → node and all its edges are removed
5. Cancel → no change

**Behaviour on delete:**

| Scenario | Result |
|---|---|
| Deleted node had incoming edges | Those edges are removed; source nodes become unconnected leaf nodes |
| Deleted node had outgoing edges | Those edges are removed; target nodes lose that prerequisite |
| Deleted node was the only MAIN-QUEST leaf connected to ESCAPE | Save button becomes disabled until a new valid path to ESCAPE is established |
| ESCAPE node selected | Delete key and ✕ button are both disabled — ESCAPE cannot be deleted |

##### Additional Canvas Controls

- **Pan**: click and drag on empty canvas area
- **Zoom**: scroll wheel or pinch gesture
- **Edit node**: click node → Event Detail Popup opens pre-filled
- **Delete edge only**: click an edge → press Delete key to remove that connection without deleting either node
- **Mini-map**: small overview panel in bottom-right corner for large chapters
- **Auto-layout**: a toolbar button that arranges all nodes into a clean top-to-bottom DAG layout. Node positions are preserved exactly as the author left them at all other times — auto-layout is opt-in only.

Fields for each event include:

| Field | Type | Description |
|---|---|---|
| event_id | Integer | Automatically generated |
| category | Text | Fixed to "MAIN-QUEST", "SIDE-QUEST", "ROUND-END", "ESCAPE" |
| required_event_ids | List | Populated by drawn edges — all events that must complete before this one unlocks |
| name | Text | Shown on Play screen as the action button label |
| remainder_text | Text | Shown on Play screen while event is active but not yet completed |
| count | Integer | Number of completions required; defaults to 1 |
| event_completion_text | List | Text shown upon each completion step (one entry per count) |

#### Tab 4: Completion

Configures the completion of chapter. Fields include:

| Field | Type | Description |
|---|---|---|
| scoring | List | Scoring criteria |
| grades | List of Grade | Each grade entry has a label, a min score, and a max score (see format below) |
| outro_text_escaped | TextArea | Text shown when player selects "I Escaped" — score is calculated normally |
| outro_text_knocked_out_saved | TextArea | Text shown when player selects "Knocked Out — Saved" — score is calculated normally |
| outro_text_knocked_out_depths | TextArea | Text shown when player selects "Knocked Out — In the Depths" — score is forced to 0 |

##### Grade Format

Each entry in the `grades` list defines a distinct, non-overlapping score band:

| Field | Type | Description |
|---|---|---|
| label | Text | Grade label shown to player (e.g. "S", "A", "B", "C", "D") |
| min | Integer (0–999) | Minimum score for this grade (inclusive) |
| max | Integer (0–999) | Maximum score for this grade (inclusive) |

**Rules:**
- Score range is 0–999
- Ranges must not overlap across entries
- `min` must be ≤ `max` for each entry
- Ranges do not need to be contiguous — a score that falls in a gap is shown as "Ungraded"
- The app validates for overlaps on save and highlights conflicting rows

**Example:**

| Label | Min | Max |
|---|---|---|
| S | 200 | 999 |
| A | 150 | 199 |
| B | 100 | 149 |
| C | 50 | 99 |
| D | 0 | 49 |

---

At the end of a chapter the app presents three outcome options for the player to self-report:

```
┌──────────────────────────────────────────────────┐
│  How did this chapter end?                       │
│                                                  │
│  [ I Escaped ]                                   │
│  [ Knocked Out — Saved ]                         │
│  [ Knocked Out — In the Depths ]                 │
└──────────────────────────────────────────────────┘
```

The app does not detect or enforce the outcome — the player selects whichever applies. Outcome behaviour:

| Outcome | Outro text shown | Score |
|---|---|---|
| I Escaped | `outro_text_escaped` | Calculated from entered score |
| Knocked Out — Saved | `outro_text_knocked_out_saved` | Calculated from entered score |
| Knocked Out — In the Depths | `outro_text_knocked_out_depths` | Forced to 0 — scoring screen is skipped |

---

<IGNORE>
## 5. Player Mode

### 5.1 Overview

Player mode is the companion app experience. The player opens a campaign, selects a chapter, and the app guides them through the session in real time — presenting events, accepting input, tracking game state, and displaying flavor text.

The Player UI is optimised for **one-handed phone use at the table**. Large tap targets, minimal scrolling, high contrast, readable at arm's length.

### 5.2 Campaign Select Screen

Lists all available campaigns:

- Built-in: the official 6-chapter Direwolf campaign (pre-loaded)
- Custom: user-created or imported campaigns

Each campaign card shows: name, description, author, chapter count

Actions: Play / Edit (opens Creator) / Export JSON / Delete

### 5.3 Chapter Setup Screen

Before play begins, the app shows the setup checklist derived from the chapter's setup configuration:

```
CHAPTER 3 — THE LAIR
Setup Instructions

□  Use fully pre-laid map (see app diagram)
□  Place Haunted Cave tile at centre — cannot be moved
□  Remove 4 black cubes from dragon bag
□  Add 1 ghost cube to Clank area
□  Set dragon rage to one above 2-player marker
□  Portal tile: remove from game entirely
□  Set aside: Skeleton, Skeleton Priest, Floating Skull, Spectral Rider
□  Starting deck: add Elven Sword

[Mark All Done]          [Begin Chapter]
```

Each line is a checkbox. `Begin Chapter` is only enabled when all are checked.

### 5.4 In-Play Screen

The main screen during a game session. Divided into three zones:

```
┌────────────────────────────────┐
│  CHAPTER 3 — THE LAIR          │
│  Turn 7                        │ ← Status bar
├────────────────────────────────┤
│                                │
│  [Active Event or Idle State]  │ ← Main content area (80% of screen)
│                                │
├────────────────────────────────┤
│  [Action Buttons]              │ ← Bottom action strip
└────────────────────────────────┘
```

#### Status Bar

Always visible. Shows:
- Chapter name + turn number
- Dragon rage level (visual track)
- Player HP (dot indicators)
- Active boss HP (if a boss is in play)
- Active countdown timer (if EVT-015 is active)

#### Idle State (Between Events)

When no event is firing, the main area shows the **Action Button Grid** — the actions the player can take that might trigger events:

```
┌──────────────────┐  ┌──────────────────┐
│  🗡  Defeat       │  │  🎒  Pick Up      │
│     Monster      │  │     Artifact     │
└──────────────────┘  └──────────────────┘
┌──────────────────┐  ┌──────────────────┐
│  🕌  Mark        │  │  📖  Use Library  │
│     Wayshrine    │  │     Lockpick     │
└──────────────────┘  └──────────────────┘
┌──────────────────┐  ┌──────────────────┐
│  🔮  Use Portal  │  │  🚪  Escape       │
│                  │  │  (locked)        │
└──────────────────┘  └──────────────────┘
┌──────────────────────────────────────────┐
│           End Turn →                     │
└──────────────────────────────────────────┘
```

- Buttons are greyed out / locked when not yet available (e.g. Escape locked until escape condition fires)
- The `End Turn` button is always available and triggers turn-end processing (recurring hazards, boss movement, etc.)

#### Active Event State

When an event fires, the main area shifts to the **Event Panel**:

```
┌────────────────────────────────────────┐
│  ⚔  GUARDIAN BLOCKER                   │
│  ─────────────────────────────────────│
│  A familiar skeleton stepped from the  │
│  shadows. "I've been promoted to Level │
│  One Skeleton! Ready for my first      │
│  real fight!"                          │
│                                        │
│  The Skeleton has been placed near     │
│  your tile. You cannot leave until     │
│  it is defeated.                       │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │  Skeleton  ❤ ❤ (2 swords)       │ │
│  └──────────────────────────────────┘ │
│                                        │
│         [Defeat Skeleton]              │
└────────────────────────────────────────┘
```

For choice events (STORY category):

```
┌────────────────────────────────────────┐
│  📖  STORY CHOICE                      │
│  ─────────────────────────────────────│
│  The old man's skin melted away to     │
│  bone. "Thanks for all the artifacts   │
│  — now you've served your purpose."    │
│  With a poof, he was gone.             │
│                                        │
│  Do you give the Monkey Idol?          │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │  ✓  Give it to the Wizard        │ │
│  │     − Monkey Idol (−5 VP)        │ │
│  │     + Librarian card             │ │
│  │     + Catacombs Map              │ │
│  └──────────────────────────────────┘ │
│  ┌──────────────────────────────────┐ │
│  │  ✗  Keep the Monkey Idol         │ │
│  │     + Monkey Idol (5 VP)         │ │
│  └──────────────────────────────────┘ │
└────────────────────────────────────────┘
```

#### Boss Tracker (persistent panel — shown when a boss is active)

When a roaming or stationary boss is in play, a persistent boss strip appears below the status bar:

```
┌────────────────────────────────────────┐
│  🦴 SKELETAL APE   ● ● ● (3 cubes)    │
│  Moves: 2 tiles this turn              │
│  Current position: Tile F              │
│  Your position: Tile D   (2 away)      │
│  [Deal 3 Swords]                       │
└────────────────────────────────────────┘
```

#### End Turn Processing

When the player taps `End Turn`, the app runs through:

1. Check all `recurring_hazard` events that fire this turn
2. Check all `timed_countdown` counters — decrement, warn, or fire consequence
3. Move any roaming boss (calculate tiles based on dungeon row)
4. Check `rage_escalation` thresholds
5. Apply `rival_escalation` actions if active
6. Show all results sequentially as a feed of mini-notifications
7. Return to idle state for the next turn

### 5.5 Extras Tracker

Accessible via a persistent bottom tab or slide-up panel. Shows:

```
EXTRAS
─────────────────────────────────────────
✓  Steal an Artifact                [Done]
○  Visit Two Libraries              [1/2]
   Reward: Chalice (major secret, 7 VP)
○  Acquire Spectral Rider         [Locked]
   Unlock: Talk to the Headless Rider
```

### 5.6 Chapter End — Scoring Screen

```
CHAPTER 2 COMPLETE
──────────────────────────────
Enter your final score:
  [      145      ]

Breakdown (optional):
  Artifacts    [ 32 ]
  Secrets      [ 28 ]
  Gold         [ 18 ]
  Prisoners    [ 17 ]
  Mastery (+20 if escaped)
  Other        [ 10 ]

  Grade:  A
──────────────────────────────
[Continue to Chapter 3]
```

The grade is computed from the score against the chapter's grade thresholds (configured by the author in Creator mode).

### 5.7 Campaign Progress Screen

Available between chapters and from the campaign select screen. Shows:

| Chapter | Title | Grade | Score | Outcome |
|---|---|---|---|---|
| 1 | The Wizard | A | 145 | Escaped |
| 2 | The Experiments | B+ | 130 | Escaped |
| 3 | The Lair | C | 61 | Knocked Out |
| 4 | *(locked)* | — | — | — |

Overall campaign grade shown after all chapters complete.

---

## 6. Sharing & Import/Export

### 6.1 Export

A campaign can be exported as a single `.json` file conforming to the campaign data model. The file includes:
- All campaign metadata (name, description, author)
- All chapter configurations (story, setup, scoring, grades, outro texts)
- All event instances with their full config (category, name, count, completion texts, edges)

### 6.2 Import

Any `.json` file can be selected for import. The app runs a validation pass before accepting it. If validation passes the campaign is added to the local list. If it fails, the import is rejected and all errors are shown to the user — no partial imports.

##### Validation Rules

| Rule | Error shown if violated |
|---|---|
| File is valid JSON | "File is not valid JSON" |
| `name` field present and non-empty | "Campaign name is missing" |
| `chapters` is a non-empty array | "Campaign has no chapters" |
| Each chapter has `chapter_number`, `title`, `events`, `outro_text_escaped`, `outro_text_knocked_out_saved`, `outro_text_knocked_out_depths` | "Chapter {n}: missing required field {field}" |
| Each event has `event_id`, `category`, `name`, `count` ≥ 1, `event_completion_text` with ≥ 1 entry | "Chapter {n}, Event {id}: missing or invalid field {field}" |
| Each event `category` is one of: `MAIN-QUEST`, `SIDE-QUEST`, `ROUND-END`, `ESCAPE` | "Chapter {n}, Event {id}: unknown category {value}" |
| Each chapter has exactly one `ESCAPE` event | "Chapter {n}: must have exactly one ESCAPE event" |
| No circular dependencies in `required_event_ids` | "Chapter {n}: circular dependency detected involving event {id}" |
| All `required_event_ids` reference valid event IDs within the same chapter | "Chapter {n}, Event {id}: references unknown event {ref_id}" |
| Grade ranges do not overlap (if grades defined) | "Chapter {n}: grade ranges overlap between {label1} and {label2}" |
| Grade `min` ≤ `max`, values within 0–999 (if grades defined) | "Chapter {n}, Grade {label}: invalid range {min}–{max}" |

##### Validation UX

```
┌────────────────────────────────────────────┐
│  Import Failed — 3 errors found            │
│                                            │
│  ✕  Chapter 2: must have exactly one       │
│     ESCAPE event                           │
│  ✕  Chapter 3, Event EVT-005: references   │
│     unknown event EVT-012                  │
│  ✕  Chapter 3: grade ranges overlap        │
│     between A and B                        │
│                                            │
│                          [OK]              │
└────────────────────────────────────────────┘
```

---

## 7. Non-Functional Requirements

| Requirement | Target |
|---|---|
| Mobile responsiveness | Player mode fully usable on 375px width (iPhone SE) |
| Offline support | Player mode must work without internet (localStorage + service worker) |
| Load time | Initial load < 2 seconds on 4G |
| Accessibility | WCAG AA for Player mode (readable at table distance, high contrast option) |
| Data persistence | Campaign progress auto-saved to localStorage after every action |
| Export fidelity | Imported campaign is byte-for-byte identical to exported one |

---

## 8. Future Considerations (Post v1.1)

| Feature | Notes |
|---|---|
| **Campaign Marketplace** | Browse and download community-created campaigns |
| **AI-Assisted Flavor Text** | Generate flavor text from a prompt using Claude API |
| **Difficulty Scaling** | Author sets per-chapter difficulty curves; Player selects overall difficulty |
| **Statistics Dashboard** | Track win/loss rates, grade history, most-used event types |

---

## 9. Open Questions

| # | Question | Owner | Status |
|---|---|---|---|
| 1 | Do ROUND-END events fire automatically every round unconditionally, or can they have `required_event_ids` that gate when they begin firing? | Product | Deferred — behaviour is configurable; firing logic for ROUND-END to be defined in a later version. |

---

*End of PRD v1.1*
