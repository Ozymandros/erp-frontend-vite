---
applyTo: "src/components/**/*.tsx"
---

# Component Instructions

## UI Stack

- **Radix UI** - Use Radix primitives for dialogs, dropdowns, selects, etc. (see `src/components/ui/`)
- **Tailwind CSS** - Use Tailwind for styling. Prefer utility classes over custom CSS.
- **@radix-ui/themes** - Theme and layout primitives

## Patterns

- Functional components only. Use TypeScript interfaces for props.
- Extract reusable UI to `src/components/ui/`
- Use `import.meta.env` for environment variables (never `process.env`)
- Use `react-router-dom` `<Link>` and `useNavigate` for navigation (not Next.js)

## Performance

- Use `React.lazy()` for heavy components. Wrap in `<Suspense>`.
- Import icons directly: `lucide-react/dist/esm/icons/check` (avoid barrel imports)
- Use functional setState: `setItems(curr => [...curr, newItem])`
- Derive state during render; avoid `useEffect` for syncing props to state

## Never

- Never use Next.js components (`next/link`, `next/image`)
- Never use `&&` for conditional render when value can be 0/NaN - use ternary
- Never mutate props or state - use immutable patterns
