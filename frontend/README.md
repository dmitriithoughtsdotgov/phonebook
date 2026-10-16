# Phonebook – frontend

Next.js 15 (App Router) UI of the phone book. Setup, architecture and the authentication flow are
described in the [main README](../README.md).

```bash
cp .env.example .env.local   # then set NEXTAUTH_SECRET
npm install
npm run dev                  # http://localhost:3000
npm test                     # Vitest unit tests
npm run lint && npx tsc --noEmit
```
