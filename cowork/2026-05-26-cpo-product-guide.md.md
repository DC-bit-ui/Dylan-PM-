# Vibe-Coding Guide → AgriProve Frontend

Rules for prototyping standalone apps so they paste cleanly into `frontend/src/` later.

## Stack (match exactly)

- **React 18 + TypeScript** (no React 19, no JS).
- **Vite** for scaffolding (`pnpm create vite@latest my-app -- --template react-ts`).
  - **Do NOT use Next.js, Remix, Astro, or any SSR/file-based-routing framework.** The target is a Vite SPA.
- **Chakra UI v2** — `@chakra-ui/react@^2.5.5`, `@chakra-ui/icons`, `@emotion/react`, `@emotion/styled`, `framer-motion@^11`.
  - Do NOT use Chakra v3, MUI, Tailwind, shadcn, styled-components, or raw CSS modules.
- **React Hook Form + Zod** (`react-hook-form`, `zod`, `@hookform/resolvers`) for any form.
- **Apollo Client** shape for data (`useQuery`/`useMutation`) — even when mocking, write the hook signature so it swaps to a real GraphQL op later.
- **Font: Lato.** Add via `@fontsource/lato` in vibe projects; the repo self-hosts it.

## Conventions

- **PascalCase** component files (`MyCard.tsx`), **camelCase** variables, **UPPER_CASE** constants/env.
- One component per file, named export matching filename.
- **No hardcoded colors/spacing.** Use Chakra tokens (`gray.200`, `blue.500`, `4`, `space.4`). The repo's theme tokens (`system.type/900`, `background.subtle`, etc.) are project-specific — keep your vibe code on standard Chakra tokens so it maps over.
- Use Chakra primitives: `Box`, `Flex`, `Stack`, `HStack`, `VStack`, `Text`, `Heading`, `Button`, `Input`, `FormControl`. Avoid raw `<div>` / `<span>` for layout.
- Variants via Chakra props (`variant`, `size`, `colorScheme`) — not inline `sx` hacks.
- Light + dark mode safe: use semantic tokens or `useColorModeValue`, never literal hex.

## Data layer

- Hide data access behind hooks: `useFarms()`, `useCreateProject()`. Body can be `useState` + `setTimeout` mock now; swap to Apollo later without touching components.
- Type all data with explicit interfaces. Avoid `any`. Mirror likely GraphQL shape (nullable scalars, `__typename` optional).
- Keep app state in a single `ContextProvider` (matches `src/utils/ContextProvider.tsx`).

### If you need a local backend

If the prototype genuinely needs a server (auth-less mocks, file uploads, OpenAI proxy, etc.), use a tiny **Express** app in a sibling `server/` folder. Treat it as throwaway scaffolding — the production target is GraphQL.

- **Never call `fetch` directly from components.** Always go through a hook in `src/hooks/` (e.g. `useFarms()`), and have that hook call a thin client function in `src/services/` (e.g. `farmsClient.list()`).
- The component sees `{ data, loading, error }` — the same shape Apollo returns. When porting in, only the client function changes; the hook signature and the component stay identical.
- Keep REST endpoints **resource-shaped** (`GET /farms`, `GET /farms/:id`, `POST /farms`). Don't invent RPC-style endpoints that won't have a GraphQL analogue.
- Return JSON that matches your target GraphQL types exactly — same field names, same nullability. No snake_case → camelCase mapping in the client; do it on the server so the hook contract matches the eventual `useQuery` result.

```tsx
// src/services/farmsClient.ts — swap THIS file for a generated GraphQL op later
export const farmsClient = {
  list: (): Promise<Farm[]> => fetch('/api/farms').then(r => r.json()),
};

// src/hooks/useFarms.ts — this file stays the same when porting
export function useFarms() {
  const [data, setData] = useState<Farm[]>();
  const [loading, setLoading] = useState(true);
  useEffect(() => { farmsClient.list().then(setData).finally(() => setLoading(false)); }, []);
  return { data, loading };
}
```

## File layout (mirror the target)

```
src/
  components/   reusable UI
  pages/        route-level views
  hooks/        data + logic hooks
  utils/        helpers + ContextProvider.tsx
  types/        shared TS types
```

## Authentication

**Local (vibe-coding):** no auth. Don't add Supabase, Auth0, Clerk, NextAuth, or any login flow. If the prototype needs a "current user," hardcode one in the `ContextProvider`:

```tsx
const mockUser = { id: 'dev-user', email: 'dev@local', name: 'Dev User' };
```

Gate the rest of the app off `useCurrentUser()` from context — same hook name you'll keep after porting.

**When translated into the repo:** auth is handled by Apollo, not by your components.

- The repo's Apollo client (`src/utils/ApolloClientHelper.ts`) uses a `setContext` link that injects `Authorization: Bearer ${session.access_token}` from the Supabase session held in `ContextProvider`. Every GraphQL request is authed automatically.
- This means: **do not add auth headers, tokens, or login UI in your vibe code.** Just call your `useFarms()` / `useThing()` hook. After porting, swap the hook body to `useQuery(THING_QUERY)` and Apollo's auth link handles the rest.
- If your local Express server checks anything auth-shaped, do it in a single middleware that you'll delete on port-in — never sprinkle token logic through components or hooks.

## Forms (recipe)

```tsx
const schema = z.object({ name: z.string().min(1) });
type FormValues = z.infer<typeof schema>;

const { register, handleSubmit, formState } = useForm<FormValues>({
  resolver: zodResolver(schema),
});
```

Wrap fields in Chakra `FormControl` + `FormLabel` + `FormErrorMessage`.

## Don't do

- Don't import the AgriProve theme, `AG*` components, Mapbox, deck.gl, Supabase, or Mantine in vibe projects — they bloat the prototype and tie you to internals.
- Don't write `.css` files. Don't use Tailwind classes.
- Don't roll your own modal/dropdown/tooltip — use Chakra's.
- Don't commit secrets; use `VITE_*` env vars.

## Translation checklist (when porting in)

1. Drop components into `frontend/src/components/` or `pages/`.
2. Replace standard Chakra color tokens with repo semantic tokens (`gray.700` → `type.default`, etc.) where the design system has an equivalent.
3. Rename to `AG`-prefix only if the component is genuinely shared/reusable.
4. Replace mock hooks with real GraphQL ops; run `pnpm run generate` after adding queries.
5. Run `pnpm turbo typecheck --filter=agriprove-frontend` and fix.
