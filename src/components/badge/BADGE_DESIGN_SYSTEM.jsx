# 7% Badge Visual Design System

Premium, prestige-driven badge aesthetics for the 7% platform.

---

## 1. Icon Style Guide

### Icon Philosophy
- **Minimal, modern, clean geometry** — no cartoon, no illustrative styles
- **Strong silhouette clarity** at 16px–48px (critical for mobile)
- **Simple, symbolic shapes** — flame, crown, shield, lightning, trophy, star, dumbbell, fork, medal, lock
- **Flat with subtle depth** — no thin lines that disappear, no noisy detail
- **Monochrome-first** — must work as pure silhouettes, enhanced with rarity colors

### Icon Naming Convention
Format: `badge_[category]_[symbol].svg`

Examples:
- `badge_streak_flame.svg` — Streak/discipline icon
- `badge_workout_dumbbell.svg` — Workout achievement
- `badge_nutrition_plate.svg` — Meal logging
- `badge_leaderboard_trophy.svg` — Ranking achievement
- `badge_membership_star.svg` — Subscription status
- `badge_identity_shield.svg` — Identity/discipline mark
- `badge_seasonal_snowflake.svg` — Limited time

### Icon Sizing Rules

| Use Case | Size | Notes |
|----------|------|-------|
| Leaderboard row (mini) | 16px | Line weight: 2px |
| Badge list card | 32px | Line weight: 2px |
| Profile featured | 48px | Line weight: 2.5px |
| Badge unlock modal | 80px | Line weight: 3px |

### Icon Padding & Safe Zone

- **Icon safe zone**: 2px minimum padding inside container
- **Container size** = Icon size + 4px padding (both sides)
- Example: 32px icon → 40px container (8px total padding)
- Ensure icon center-aligns in container

### Stroke & Fill Rules

- **Stroke-based icons preferred** (outline style)
- Line weight: 2-3px depending on size
- Fill for very small icons (16px) to maintain clarity
- No gradients on icons themselves (applied at badge container level)

---

## 2. Rarity Visual System

### Rarity Tiers & Styling

#### **Common**
- **Color**: Neutral gray
- **Border**: `1px solid rgba(113, 113, 122, 0.4)` (zinc-600/40%)
- **Background**: `rgba(39, 39, 42, 0.6)` (zinc-900/60%)
- **Shadow**: None (minimal)
- **Accent**: None
- **Feel**: Understated, simple entry-level achievement
- **Animation**: None

#### **Uncommon**
- **Color**: Slate/blue accent
- **Border**: `1.5px solid rgba(71, 85, 105, 0.5)` (slate-600/50%)
- **Background**: `rgba(30, 41, 59, 0.7)` (slate-900/70%)
- **Shadow**: `0 4px 12px rgba(71, 85, 105, 0.15)` (subtle)
- **Accent**: Light slate highlight on top-left
- **Feel**: Noticeable achievement, early progress
- **Animation**: Subtle hover scale (1.02)

#### **Rare**
- **Color**: Purple accent
- **Border**: `1.5px solid rgba(126, 34, 206, 0.4)` (purple-600/40%)
- **Background**: `rgba(43, 10, 65, 0.8)` (purple-900/80%)
- **Shadow**: `0 8px 24px rgba(126, 34, 206, 0.2)` (moderate)
- **Accent**: Subtle purple gradient overlay (top)
- **Feel**: Meaningful milestone, discipline evident
- **Animation**: Hover glow + scale (1.03)

#### **Elite**
- **Color**: Gold/amber accent (prestige)
- **Border**: `2px solid rgba(217, 119, 6, 0.6)` (amber-600/60%)
- **Background**: `rgba(78, 22, 0, 0.9)` (amber-950/90%)
- **Shadow**: `0 12px 32px rgba(217, 119, 6, 0.25)` (strong)
- **Accent**: Gold gradient overlay + subtle inner glow
- **Feel**: Premium, rare achievement, prestige
- **Animation**: Hover glow + subtle rotation (0.5deg) + scale (1.04)
- **Extra**: Checkmark or star on corner for "elite" mark

#### **Legendary**
- **Color**: Gold + light shimmer
- **Border**: `2.5px solid rgba(251, 191, 36, 0.7)` (amber-400/70%)
- **Background**: `rgba(78, 22, 0, 1)` (amber-950)
- **Shadow**: `0 16px 48px rgba(251, 191, 36, 0.3)` (premium glow)
- **Accent**: Gold gradient + animated shimmer effect
- **Feel**: Ultra-rare, legendary status, ultimate achievement
- **Animation**: Continuous subtle shimmer (opacity: 0.8 → 1.0), hover glow intensifies
- **Extra**: Crown or flame icon overlay, animated halo

### Premium Styling Rules

✅ **DO**:
- Use dark backgrounds (zinc-950 / slate-950 / amber-950)
- Restrained, sophisticated accent colors
- Subtle shadows and glows (avoid harsh light)
- Consistent border thickness by rarity
- Smooth transitions (200-300ms)
- Icons that "pop" against background

❌ **DON'T**:
- Oversaturated neon colors
- Noisy gradient backgrounds
- Thick glowing halos (except Legendary)
- Blurry drop shadows
- Inconsistent styling across rarity tiers
- Animation on every hover (only meaningful ones)

---

## 3. Badge Shape & Layout

### Container Shape

**Primary shape: Rounded square with soft corners**
- Border radius: `12px` (small cards), `16px` (medium), `20px` (large)
- Aspect ratio: Square or slight rectangle (1:1.1)
- Must accommodate 32–80px icons

### Border & Shadow Specifications

| Rarity | Border Thickness | Shadow Elevation |
|--------|------------------|------------------|
| Common | 1px | 0–2px |
| Uncommon | 1.5px | 4px |
| Rare | 1.5px | 8px |
| Elite | 2px | 12px |
| Legendary | 2.5px | 16px |

### Icon Positioning

- Icon always **center-aligned** within container
- For card layout: Icon above text
- Icon sits in transparent zone (no separate background)
- Padding from icon to edge: 6–12px (depends on size)

### Badge Text Layout

**Standard Badge Card (Medium)**:
```
┌─────────────────┐
│                 │
│      Icon       │  48px icon
│                 │
├─────────────────┤
│    Badge Name   │  Bold, 13px
│   Rarity Tier   │  Small caps, 10px, dimmed
└─────────────────┘
```

- **Name**: Bold, `font-semibold`, size varies (12–16px)
- **Rarity label**: Small caps, `font-medium`, gray text, 10px
- **Description** (optional): Lighter text, 11px, max 2 lines

### Standard Badge Sizes

| Size | Icon | Card | Use Case |
|------|------|------|----------|
| **Small** | 16px | 40×40px | Leaderboard row, mini badges |
| **Medium** | 32px | 100×120px | Badge list, profile collection |
| **Large** | 48px | 140×180px | Badge unlock modal |
| **XL** | 80px | 200×240px | Achievement showcase, detail modal |

---

## 4. Badge UI Presentation Components

### Earned Badge Card

```jsx
<EarnedBadgeCard
  badge={badgeObject}
  userBadge={userBadgeObject}
  onFeature={handleFeature}
  size="medium"
/>
```

**Shows**:
- Icon (centered, with rarity glow)
- Name (bold)
- Rarity tier (small caps)
- Earned date ("Earned Feb 18, 2026")
- Optional: Points reward ("+50 pts")
- Action: Feature/Unfeature button
- Hover: Subtle glow intensifies, card lifts (2–4px)

### Locked Badge Card

```jsx
<LockedBadgeCard
  badge={badgeObject}
  progress={progressObject}
/>
```

**Shows**:
- Icon (greyed out, 40% opacity)
- Name (dimmed)
- Lock icon overlay (small, top-right)
- "Unlock Requirement" text
- Progress bar if applicable ("4 of 7 days")
- Hover: Progress tooltip
- No interaction (read-only)

### Featured Badges (Profile)

**On Profile Page**:
- Show up to 3 featured badges in a row
- Large presentation (48px icons, 140px cards)
- Prominent placement below profile stats

**On Leaderboard Row** (Pro/Elite only):
- Show 3 featured badges as 16px mini icons
- Right side of username row
- Hover tooltip: Badge name + date earned

---

## 5. Badge Unlock Animation (Premium Modal)

### Unlock Modal Flow

1. **Trigger**: Badge earned
2. **Animation**: Fade in + scale (0.8 → 1.0) over 400ms
3. **Modal displays**:
   - Large icon (80px) with rarity-specific glow
   - "Badge Unlocked" label (gold, 12px caps)
   - Badge name (large, bold)
   - Description + points reward
   - Optional: Confetti for Legendary only
4. **Buttons**:
   - "Feature Badge" (primary)
   - "View Collection" (secondary)
   - "Close" (X button, top-right)
5. **Duration**: 6 seconds (auto-close) or manual close
6. **Icon animation**: Subtle rotation + scale pulse (starts at 0.9, pulses to 1.1 every 800ms for 3 seconds)

### Glow Effect by Rarity

- **Common**: No glow
- **Uncommon**: Soft slate glow (10px blur, low opacity)
- **Rare**: Purple glow (12px blur)
- **Elite**: Gold glow (14px blur, warm tone)
- **Legendary**: Intense gold glow + animated shimmer (2s loop)

---

## 6. Badge Icon Set (Library)

### Streak / Discipline Category

| Badge | Icon | Description |
|-------|------|-------------|
| Day 1 | 🔥 (flame) | Single flame, clean |
| Streak 7 | ⛓️ (chain) | 3 links, interlocked |
| Streak 14 | 🛡️ (shield) | Rounded shield outline |
| Streak 30+ | ⚡ (lightning) | Bolt with clean angles |
| Streak 90+ | 👑 (crown) | Simplified crown shape |

### Workout Category

| Badge | Icon | Description |
|-------|------|-------------|
| First Workout | 💪 (dumbbell) | Single dumbbell, clean |
| Workout 10 | 🏋️ (barbell) | Barbell with weight plates |
| Workout 25 | ⏱️ (stopwatch) | Analog stopwatch face |
| Cardio King | 🏃 (runner silhouette) | Minimalist runner outline |

### Nutrition Category

| Badge | Icon | Description |
|-------|------|-------------|
| First Meal | 🍽️ (plate + fork) | Centered plate, fork top-left |
| Meals 7 | 🎯 (target) | Concentric circles |
| Calorie Precision | 📊 (chart) | Simple bar chart |
| Protein Master | 🥚 (egg) | Oval shape, clean |

### Leaderboard Category

| Badge | Icon | Description |
|-------|------|-------------|
| Top 50 | 🏅 (medal) | Medal with ribbon |
| Top 10 | 🏆 (trophy) | Trophy cup outline |
| Podium | 🥇 (1st place) | "1" in circle |
| Champion | 👑🌟 (crown + star fusion) | Hybrid symbol |

### Membership Category

| Badge | Icon | Description |
|-------|------|-------------|
| Pro | ⭐ (star) | 5-point star, filled |
| Elite | 💎 (gem) | Diamond outline |
| Founder | 🏗️ (shield + crest) | Prestige shield |

### Identity Category

| Badge | Icon | Description |
|-------|------|-------------|
| 7% Initiate | 7️⃣ (7 emblem) | Stylized "7" |
| Discipline | 🎖️ (ribbon badge) | Discipline mark |
| The 7% | ✦ (multi-point star) | Ornate star |

### Seasonal Category

| Badge | Icon | Description |
|-------|------|-------------|
| Winter Warrior | ❄️ (snowflake) | 6-pointed snowflake |
| Spring Momentum | 🌱 (sprout) | Minimal sprout outline |
| Summer Grind | ☀️ (sun) | Minimalist sun |

---

## 7. Color Tokens

```javascript
const BADGE_COLORS = {
  // Rarity backgrounds
  common: 'bg-zinc-900/60 border-zinc-600/40',
  uncommon: 'bg-slate-900/70 border-slate-600/50',
  rare: 'bg-purple-950/80 border-purple-600/40',
  elite: 'bg-amber-950/90 border-amber-600/60',
  legendary: 'bg-amber-950 border-amber-400/70',

  // Text colors for labels
  commonText: 'text-zinc-400',
  uncommonText: 'text-slate-400',
  rareText: 'text-purple-400',
  eliteText: 'text-amber-400',
  legendaryText: 'text-amber-300',

  // Shadows
  commonShadow: 'shadow-none',
  uncommonShadow: 'shadow-md shadow-slate-600/15',
  rareShadow: 'shadow-lg shadow-purple-600/20',
  eliteShadow: 'shadow-xl shadow-amber-600/25',
  legendaryShadow: 'shadow-2xl shadow-amber-400/30',
};
```

---

## 8. Implementation Checklist

- [ ] Icon SVG library created and optimized
- [ ] Design tokens (colors, sizes, shadows) defined in JS
- [ ] EarnedBadgeCard component updated
- [ ] LockedBadgeCard component created
- [ ] BadgePremiumUnlock modal implemented
- [ ] Animations (hover, glow, shimmer) added
- [ ] Featured badges display on profile
- [ ] Leaderboard mini badges displayed
- [ ] Mobile responsive (16px icons readable)
- [ ] Dark mode verified
- [ ] Accessibility: ARIA labels on icons, sufficient contrast
- [ ] Performance: Icon lazy loading, animation optimization

---

## 9. Visual Reference

```
COMMON BADGE              UNCOMMON BADGE            RARE BADGE
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│                 │      │                 │      │                 │
│    [🔥]         │      │   [⛓️]          │      │   [🛡️]          │
│                 │      │                 │      │                 │
│   Day 1         │      │  Streak 7       │      │  Streak 14      │
│  Common         │      │  Uncommon       │      │  Rare           │
└─────────────────┘      └─────────────────┘      └─────────────────┘
  Gray, minimal            Slate, subtle glow     Purple, stronger glow


ELITE BADGE               LEGENDARY BADGE
┌─────────────────┐      ┌─────────────────┐
│                 │      │                 │
│   [⚡]          │      │   [👑]          │✨
│                 │      │                 │
│  Streak 30+     │      │  Streak 90+     │
│  Elite          │      │  Legendary      │
└─────────────────┘      └─────────────────┘
  Gold prestige          Gold + shimmer
```

---

## 10. Premium Unlock Modal Example

```
╔═════════════════════════════════════╗
║                                     ║
║     ✨ BADGE UNLOCKED ✨           ║
║                                     ║
║           [80px Icon]               ║
║         (with glow effect)          ║
║                                     ║
║       Streak 7 Mastery              ║
║   Keep your daily habit going       ║
║                                     ║
║          +50 Points                 ║
║                                     ║
║    [Feature Badge]  [View All]      ║
║                                     ║
╚═════════════════════════════════════╝
```

Glow color matches badge rarity. Icon rotates slightly. Auto-closes in 6s or on manual close.