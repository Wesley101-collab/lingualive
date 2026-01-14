# Project Structure

## Directory Layout
```
/lingualive
  /frontend              # Next.js application
    /components          # React components with CSS modules
    /pages               # Next.js routes
    /pages/api           # API routes (summarize, format-caption, transcribe)
    /hooks               # Custom React hooks (useWebSocket, useAudioStream, etc.)
    /styles              # Page-level CSS modules and globals
    /utils               # Utility functions (constants, highlightKeywords)
    /uploads             # Temporary upload storage
  /backend               # Node.js WebSocket server
    /ws                  # WebSocket handlers (connection-manager, message-handler)
    /services            # External API integrations (speechmatics, translation)
    /utils               # Backend utilities (rate-limiter, message-validator)
    server.ts            # Entry point
  /shared                # Shared TypeScript types
    types.ts
  /certs                 # SSL certificates (if needed)
```

## File Naming Conventions
- **Components**: PascalCase (e.g., `LiveCaptionPanel.tsx`, `QRCodeShare.tsx`)
- **CSS Modules**: Match component name (e.g., `LiveCaptionPanel.module.css`)
- **Hooks**: camelCase with `use` prefix (e.g., `useWebSocket.ts`, `useAudioStream.ts`)
- **Utils**: camelCase (e.g., `highlightKeywords.ts`, `constants.ts`)
- **Services**: kebab-case (e.g., `speechmatics-service.ts`, `translation-service.ts`)
- **Pages**: lowercase (e.g., `speaker.tsx`, `viewer.tsx`, `history.tsx`)

## Module Organization
- Each component has its own `.tsx` file and optional `.module.css`
- Hooks are standalone files in `/hooks`
- API routes in `/pages/api` for server-side processing
- Shared types in `/shared/types.ts`

## Configuration Files
- `lingualive/.env` - API keys and environment variables
- `lingualive/.env.example` - Template for required env vars
- `lingualive/frontend/next.config.js` - Next.js configuration
- `lingualive/frontend/tsconfig.json` - Frontend TypeScript config
- `lingualive/backend/tsconfig.json` - Backend TypeScript config
- `.kiro/steering/*.md` - Kiro steering documents
- `.kiro/settings/mcp.json` - MCP server configuration
- `.kiro/agents/*.json` - Custom agent definitions
- `.kiro/hooks/hooks.json` - Automation hooks

## Documentation Structure
- `lingualive/README.md` - Main project documentation
- `lingualive/FEATURES.md` - Feature list and roadmap
- `DEVLOG.md` - Development log and decisions

## Asset Organization
- No external image assets - all icons are inline SVG
- Styles in CSS Modules co-located with components
- Global styles in `/frontend/styles/globals.css`

## Build Artifacts
- Frontend: `.next/` directory (gitignored)
- Backend: Runs directly with ts-node
- Node modules: `node_modules/` in both frontend and backend (gitignored)

## Environment-Specific Files
- `.env` - Local development (gitignored)
- `.env.example` - Template committed to repo
- `.env.local` - Next.js local overrides (gitignored)
