# FlightGuard AI — Design System

## 1. Design Philosophy

FlightGuard AI should look like a modern enterprise airline technology platform.

Design goals:

- Professional
- Calm
- Data-focused
- Trustworthy
- Accessible
- Responsive
- Operationally clear

Avoid:

- Excessive gradients
- Neon colors
- Decorative animations
- Overly rounded cards
- Dense dashboards without hierarchy
- Inconsistent spacing
- Low-contrast text

---

## 2. Production Color System

The FlightGuard AI color system is built around a distinct 5-color brand and functional palette:

| Role | Color Name | Hex Code | Purpose & Usage |
| :--- | :--- | :--- | :--- |
| **Primary / Navy Teal** | Dark blue-teal | `#244855` | Primary brand identity, navigation bar, primary buttons, headers, active states |
| **Accent / Alert Red** | Coral red | `#E64833` | Attention-grabbing accents, critical delay alerts, badges, high-impact CTA highlights |
| **Secondary / Brown** | Warm brown | `#874F41` | Secondary accents, earthy badges, subtle contrasts, metadata groupings |
| **Supporting / Teal Gray** | Soft teal | `#90AEAD` | Supporting UI elements, borders, pill backgrounds, icon badges, secondary stats |
| **Background Accent / Cream**| Warm cream | `#FBE9D0` | Warm background sections, card accents, subtle banner highlights, high-comfort surfaces |

### Brand Tokens

```text
Primary (Navy Teal):     #244855
Primary Hover:           #1D3B46
Primary Active:          #172F38
Primary Soft:            #EFF5F6
Primary Light:           #90AEAD
```

### Accent & Secondary Tokens

```text
Accent (Coral Red):      #E64833
Accent Hover:            #D43823
Accent Soft:             #FDF1EF
Secondary (Warm Brown):  #874F41
Secondary Hover:         #703F34
Secondary Soft:          #F7EFEA
Supporting (Soft Teal):  #90AEAD
Supporting Soft:         #F0F6F5
Cream (Warm Cream):      #FBE9D0
Cream Soft:              #FDF7EE
```

### Backgrounds & Surfaces

```text
App Background:          #F8FAFB
Surface:                 #FFFFFF
Surface Subtle:          #F8FAFC
Surface Warm:            #FDF7EE
Surface Cream:           #FBE9D0
```

### Text

```text
Text Primary:            #0F172A
Text Secondary:          #334155
Text Muted:              #64748B
Text Disabled:           #94A3B8
Text Inverse:            #FFFFFF
```

### Borders

```text
Border:                  #E2E8F0
Border Strong:           #CBD5E1
Border Focus:            #244855
Border Cream:            #F2D7B4
```

### Semantic & Delay-Risk Colors

```text
Success:                 #16A34A
Success Soft:            #F0FDF4

Warning:                 #EA580C
Warning Soft:            #FFF7ED

Danger / Alert:          #E64833
Danger Soft:             #FDF1EF

Info:                    #244855
Info Soft:               #EFF5F6

Low Risk:                #2E7D32 (BG: #E8F5E9)
Medium Risk:             #E65100 (BG: #FFF3E0)
High Risk:               #D84315 (BG: #FBE9E7)
Critical Risk:           #E64833 (BG: #FDF1EF)
```

Do not use color alone to communicate risk. Always include text, iconography, or a label.

---

## 3. Typography

Recommended font:

```text
Inter
```

Fallback:

```text
system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif
```

Scale:

```text
Display:    36px / 44px
H1:         30px / 38px
H2:         24px / 32px
H3:         20px / 28px
Body:       14px / 22px
Small:      13px / 20px
Caption:    12px / 18px
```

Use font weight intentionally:

```text
400 Regular
500 Medium
600 Semibold
700 Bold
```

Avoid excessive bold text.

---

## 4. Spacing

Use a 4px base spacing system.

```text
4px
8px
12px
16px
20px
24px
32px
40px
48px
64px
```

Prefer consistent spacing tokens rather than arbitrary values.

---

## 5. Border Radius

```text
Small:      6px
Medium:     8px
Large:      12px
XL:         16px
Pill:       999px
```

Default cards:

```text
12px
```

Buttons:

```text
8px
```

Avoid making every component pill-shaped.

---

## 6. Shadows

Use subtle elevation.

```text
Shadow XS:
0 1px 2px rgba(15, 23, 42, 0.05)

Shadow SM:
0 2px 8px rgba(15, 23, 42, 0.06)

Shadow MD:
0 8px 24px rgba(15, 23, 42, 0.08)
```

Prefer borders over heavy shadows.

---

## 7. Layout

Desktop application shell:

```text
┌──────────────────────────────────────────────┐
│ Top Bar                                      │
├──────────────┬───────────────────────────────┤
│ Sidebar      │ Main Content                  │
│              │                               │
│ Navigation   │ Page Header                   │
│              │ Content                       │
│              │                               │
└──────────────┴───────────────────────────────┘
```

Recommended desktop sidebar:

```text
Width: 240px
```

Collapsed:

```text
Width: 72px
```

Main content:

```text
max-width: 1440px
padding: 24px–32px
```

---

## 8. Navigation

Operations navigation:

```text
Overview
Flights
Reservations
Delay Predictions
Passengers
Analytics
```

Admin navigation:

```text
Overview
Users
Airlines
Airports
Aircraft
Flights
Reservations
Audit Logs
Settings
```

Passenger navigation:

```text
Search Flights
My Reservations
Trip History
Profile
```

Use clear active-state styling.

---

## 9. Buttons

Primary:

- Royal blue background
- White text
- Medium emphasis

Secondary:

- White/surface background
- Strong border
- Primary text

Danger:

- Red semantic styling
- Use only for destructive operations

Every button must have:

- Hover state
- Focus state
- Disabled state
- Loading state when asynchronous

Never use a disabled-looking button for an action that is actually available.

---

## 10. Forms

Forms must have:

- Visible labels
- Helpful placeholders only when useful
- Validation messages
- Required-field indicators
- Keyboard accessibility
- Clear focus states

Example:

```text
Departure Airport *
[ Bengaluru (BLR)             ]

Destination Airport *
[ Delhi (DEL)                 ]

Departure Date *
[ 25 Sep 2026                 ]
```

Do not use placeholder text as the only label.

---

## 11. Tables

Tables are important for operations users.

Required behavior:

- Sortable where useful
- Search/filter
- Pagination for large datasets
- Responsive handling
- Clear column labels
- Row hover state
- Empty state
- Loading state
- Error state

Example:

```text
Flight   Route      Departure   Status     Risk
AI245    BLR-DEL    06:30       Scheduled  HIGH
6E302    DEL-BOM    08:15       Delayed    MEDIUM
UK812    BOM-BLR    10:40       On Time    LOW
```

---

## 12. Dashboard Cards

Use cards for high-level KPIs:

```text
Total Flights
On-Time Flights
Delayed Flights
High-Risk Flights
Affected Reservations
```

Cards should show:

- Metric
- Label
- Optional trend
- Accessible semantic meaning

Avoid dashboards containing dozens of KPI cards.

---

## 13. Delay Prediction UX

A prediction must be understandable.

Example:

```text
HIGH RISK

82%
Delay Probability

Expected delay
74 minutes

Why?
• Previous aircraft delay
• Airport congestion
• Historical route pattern
```

Never present ML predictions as guaranteed outcomes.

Use language such as:

- Predicted
- Estimated
- Probability
- Risk

---

## 14. Loading States

Use:

- Skeletons for page-level content
- Inline spinners for actions
- Disabled submit buttons during submission

Never leave a blank screen while data loads.

---

## 15. Empty States

Every data-heavy page needs a meaningful empty state.

Example:

```text
No high-risk flights

There are currently no flights requiring
operational attention.

[View all flights]
```

---

## 16. Error States

Errors must be actionable.

Bad:

```text
Something went wrong.
```

Better:

```text
Unable to load flights.

Please try again. If the problem continues,
contact your administrator.

[Retry]
```

Do not expose technical stack traces to users.

---

## 17. Responsive Design

Breakpoints:

```text
Mobile:   < 640px
Tablet:   640px–1023px
Desktop:  ≥ 1024px
Wide:     ≥ 1440px
```

Requirements:

- Tables must remain usable on mobile
- Sidebar becomes a drawer on mobile
- Filters stack vertically
- Cards become one-column layouts
- Touch targets should be sufficiently large
- No horizontal page overflow

---

## 18. Accessibility

Target:

**WCAG 2.2 AA**

Requirements:

- Keyboard navigation
- Visible focus
- Semantic HTML
- Accessible form labels
- ARIA only when necessary
- Sufficient color contrast
- No color-only status communication
- Screen-reader-friendly feedback
- Reduced-motion support

---

## 19. UX Rules

1. One primary action per page section.
2. Destructive actions require confirmation.
3. Preserve user input when validation fails.
4. Never silently discard form data.
5. Show success feedback after important mutations.
6. Confirm cancellation/deletion.
7. Keep navigation predictable.
8. Keep terminology consistent: Flight, Reservation, Passenger, Prediction, Operations Agent.
9. Avoid unnecessary modal dialogs.
10. Do not hide critical operational information behind excessive interactions.

---

## 20. Design Tokens

The frontend should centralize colors, spacing, typography, radius, and shadows.

Do not hardcode random colors throughout components.

Example semantic tokens:

```text
--color-primary
--color-primary-hover
--color-background
--color-surface
--color-text-primary
--color-text-secondary
--color-text-muted
--color-border
--color-success
--color-warning
--color-danger
--color-info
```

The design system is the source of truth for visual decisions.
