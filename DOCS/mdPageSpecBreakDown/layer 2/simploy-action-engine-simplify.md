# Simploy — Action Engine Simplification
> Apply these changes to `components/simulator/ActionEngine.tsx` only.
> Reference: the uploaded screenshot showing the clean 4-item version.

---

## What to remove

- The 3-tab header (This Quarter / This Year / 3-Year Plan) — remove entirely
- The `AnimatePresence` and tab switching logic — remove entirely
- The urgency tag chips (Immediate / Q2 2025 etc.) — remove entirely
- The `URGENCY_TABS` data object — remove entirely

---

## What to keep

- Card wrapper and padding
- The header title and subtitle
- The 4 action rows (Hire / Upskill / Internal Mobility / Automate)
- The Deploy Action Engine button

---

## New component

Replace the entire return with this simplified version:

```tsx
const ACTIONS = [
  {
    id:       "hire",
    icon:     UserPlus,
    iconBg:   "#FFF0F8",
    iconColor:"#E8197A",
    title:    "Hire",
    detail:   "Need 1,200 software engineers by 2030",
  },
  {
    id:       "upskill",
    icon:     GraduationCap,
    iconBg:   "#EEEDFE",
    iconColor:"#7F77DD",
    title:    "Upskill",
    detail:   "Retrain 800 analysts into AI specialists",
  },
  {
    id:       "mobility",
    icon:     ArrowLeftRight,
    iconBg:   "#FAEEDA",
    iconColor:"#BA7517",
    title:    "Internal Mobility",
    detail:   "Move employees from low demand functions",
  },
  {
    id:       "automate",
    icon:     Bot,
    iconBg:   "#E0F9FF",
    iconColor:"#06B6D4",
    title:    "Automate",
    detail:   "Automate 15% of repetitive HR tasks",
  },
];

return (
  <div className="bg-white rounded-2xl border border-[--border] p-5 flex flex-col gap-4">

    {/* Header */}
    <div>
      <p className="text-base font-semibold text-[--text-primary] leading-snug">
        Action Engine:<br />Recommended Interventions
      </p>
      <p className="text-xs text-[--text-muted] mt-1 leading-relaxed">
        Automated recommendations based on detected {new Date().getFullYear() + 6} gaps.
      </p>
    </div>

    {/* Action list */}
    <div className="flex flex-col gap-4">
      {ACTIONS.map(action => (
        <div key={action.id} className="flex items-start gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: action.iconBg }}
          >
            <action.icon size={15} style={{ color: action.iconColor }} />
          </div>
          <div>
            <p className="text-sm font-semibold text-[--text-primary]">{action.title}</p>
            <p className="text-xs text-[--text-muted] mt-0.5 leading-relaxed">{action.detail}</p>
          </div>
        </div>
      ))}
    </div>

    {/* Deploy button */}
    <button
      onClick={onDeploy}
      className="w-full bg-[--pink] hover:bg-[--pink-hover] text-white font-medium
        py-3 rounded-full text-sm transition-colors flex items-center justify-center gap-2 mt-auto"
    >
      <Zap size={14} fill="white" />
      Deploy Action Engine
    </button>

  </div>
);
```

---

## Deploy button behavior (keep as is)

On click: show the existing success toast —
```
✓ Action plan created · 4 tasks added to your pipeline
```
No other changes to the toast logic.

---

## Imports

Keep only what's needed:
```ts
import { UserPlus, GraduationCap, ArrowLeftRight, Bot, Zap } from "lucide-react";
```

Remove imports that were only used by the tab system:
```ts
// Remove these:
import { Award, ClipboardList } from "lucide-react";
```
