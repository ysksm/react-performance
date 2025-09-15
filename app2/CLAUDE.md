# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands

- **Development server**: `npm run dev` - Starts Vite development server with hot module replacement
- **Build**: `npm run build` - Runs TypeScript compiler then builds production bundle with Vite
- **Lint**: `npm run lint` - Runs ESLint on all files
- **Preview production build**: `npm run preview` - Preview the production build locally

## Project Architecture

This is a React + TypeScript application using Vite as the build tool and development server. The project has two main parts:

### Main Application (`/`)
- **Build Tool**: Vite with React plugin
- **Framework**: React 19 with TypeScript
- **Entry Point**: `src/main.tsx` renders the App component into `#root`
- **TypeScript Config**: Uses project references with separate configs for app (`tsconfig.app.json`) and node (`tsconfig.node.json`)

### Server Directory (`/server`)
- Contains a separate Bun-based server setup with its own dependencies
- Has specific Bun configuration - use `bun` commands instead of `npm` when working in the server directory
- Includes HTML imports and WebSocket support capabilities

## Development Notes

When working in the `/server` directory, follow the Bun conventions specified in `/server/CLAUDE.md`:
- Use `bun install` instead of `npm install`
- Use `bun run` instead of `npm run`
- Use `bun test` for testing
- Bun automatically loads .env files