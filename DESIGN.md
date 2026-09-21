# DESIGN.md — ClausePilot Design System
*Derived from the Genesis & Editorial Precision design specifications on DesignMD.ai & Refero Styles*

## 1. Design Philosophy & Mood
- **Quietly Confident Editorial Precision**: Professional, modern, and serious without being sterile. Inspired by modern legaltech platforms (Harvey, Robin AI, Ironclad) and developer tools (Linear, Resend, Vercel).
- **Anti-AI Design Rules**:
  - NO tacky neon gradients (`from-sky-500 to-indigo-600` on every heading or border).
  - NO generic blurry cyan glowing cards (`shadow-sky-500/20`).
  - NO loud oversized badge pills.
  - High information density balanced by disciplined breathing room (4px grid).
  - Restraint: Accent colors (indigo, emerald, amber, rose) are reserved strictly for semantic states and interactive primary focus, never sprayed as generic decoration.

## 2. Color Palette (Obsidian & Editorial Zinc)
- **Background Primary**: `#090A0C` (Deep warm obsidian)
- **Background Secondary / Sidebar / Header**: `#0E1013` (Slightly elevated obsidian)
- **Surface / Card / Panel**: `#14161A` (Gallery frame card surface)
- **Surface Elevated / Hover**: `#1B1E24` (Subtle hover lift surface)
- **Surface Popover / Modal**: `#16181D` (Focused drawer / modal background)
- **Hairline Borders**: `#23262E` (Subtle, crisp 1px borders)
- **Border Hover / Focus**: `#363B47` (Brightened crisp border)
- **Text Primary**: `#F4F5F7` (Off-white, 95% opacity — never pure #FFF)
- **Text Secondary**: `#9CA3AF` (Muted editorial gray for descriptions & metadata)
- **Text Tertiary / Subtle**: `#64748B` (Overlines, timestamps, table headers)
- **Primary Accent**: `#4F46E5` / `#6366F1` (Indigo — used with restraint for primary CTA & active tab)
- **Semantic Accents (with micro status dots)**:
  - Success / Active / High Confidence: `#10B981` (Emerald)
  - Warning / Attention Flag / Medium Confidence: `#F59E0B` (Amber)
  - Danger / Consequence / Overdue: `#EF4444` (Rose / Crimson)
  - Party / Neutral Information: `#38BDF8` (Sky / Cyan) or `#A855F7` (Purple)

## 3. Typography
- **Headings & Display**: `Plus Jakarta Sans` / `Inter`, tight letter spacing (`tracking-[-0.03em]`), medium to bold weights (`font-semibold` to `font-extrabold`).
- **Body & UI**: `Inter`, clean line-height (`leading-relaxed`), tracking `-0.01em`.
- **Code & Metadata**: `JetBrains Mono`, `tabular-nums` for currencies, clause numbers, dates, and confidence scores.
- **Scale**:
  - Display: 48px–56px (`text-4xl sm:text-5xl font-extrabold tracking-tight`)
  - Title: 24px–28px (`text-2xl font-bold tracking-tight`)
  - Subhead: 18px–20px (`text-lg font-semibold`)
  - Body: 14px–15px (`text-sm leading-relaxed`)
  - Small / Table UI: 12px–13px (`text-xs`)
  - Micro / Tag: 11px uppercase (`text-[11px] font-medium tracking-wider uppercase`)

## 4. Components & Elevation
- **Primary Buttons**: Crisp solid white button with dark text (`bg-white text-neutral-950 hover:bg-neutral-200 font-medium px-4 py-2 rounded-lg shadow-sm transition-all active:scale-[0.99]`), or filled indigo button (`bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-sm`).
- **Secondary / Outline Buttons**: Subtle flat surface with hairline border (`bg-[#16181D] hover:bg-[#1E2129] border border-[#262A34] text-neutral-200 font-medium px-3.5 py-2 rounded-lg`).
- **Cards**: Surface `#14161A` with 1px border `#23262E`. On hover: border `#343844` with subtle -1px vertical lift.
- **Segmented Controls / Tabs**: Contained pill dock with smooth background indicator (`bg-[#0E1013] border border-[#23262E] p-1 rounded-xl`), active tab uses `bg-[#1E2128] text-white shadow-sm border border-[#2E333F]`.
- **Status Chips**: Pill shape with a 6px semantic colored dot (`w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5`) and subdued neutral pill background (`bg-neutral-900 border border-neutral-800 text-neutral-300`).
- **Inputs & Dropdowns**: Surface background `#101216`, 1px border `#252830`, focus ring `ring-1 ring-indigo-500/50 border-indigo-500/80`.
- **Modals & Drawers**: Deep backdrop blur (`backdrop-blur-md bg-black/60`), modal card `#14161A`, border `#2A2E38`.

## 5. Spacing System
- Base grid: 4px
- Section padding: 32px to 64px
- Container max width: 1280px (`max-w-7xl`)
