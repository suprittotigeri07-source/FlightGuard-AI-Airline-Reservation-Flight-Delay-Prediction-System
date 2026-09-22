# FlightGuard AI — Frontend Development Rules

1. Use React + TypeScript + Vite + Tailwind CSS.
2. Structure UI by feature modules in `frontend/src/features/`.
3. Use semantic colors: Primary `#4F46E5`, Hover `#4338CA`, Background `#F8FAFC`, Surface `#FFFFFF`, Text Primary `#0F172A`, Text Secondary `#334155`, Muted `#64748B`, Border `#E2E8F0`, Success `#16A34A`, Warning `#D97706`, Danger `#DC2626`, Info `#0284C7`.
4. Implement Loading (skeletons), Empty, Error (actionable retry), and Success feedback states on every screen.
5. All interactive elements must have unique, descriptive IDs and satisfy WCAG 2.2 AA accessibility requirements.
