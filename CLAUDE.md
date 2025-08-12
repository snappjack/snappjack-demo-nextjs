# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SnappjackDemos is a Next.js project which is a collection of demos showing how to use the Snappjack SDK. It currently has a single demo which provides a dice game interface where users can interact directly via GUI, while AI agents can connect to live sessions through the Model Context Protocol (MCP).

## Development Commands

- **Development server**: `npm run dev` (uses Turbopack for fast development)
- **Build**: `npm run build`
- **Production server**: `npm start`
- **Linting**: `npm run lint`

## Architecture

### Core Components Structure

The app follows Next.js App Router structure with two main interface layers:

**Human Interface** (`/src/components/dice/`):
- `DiceGame.tsx` - Main game component managing state and Snappjack integration
- `DiceContainer.tsx` - Visual dice display
- `GameControls.tsx` - Roll, reset, keep/clear controls
- `GameStatus.tsx` - Current game state display
- `Die.tsx` - Individual die component

**Agent Interface** (`/src/components/snappjack/`):
- `ConnectionStatus.tsx` - Shows MCP connection state
- `AgentConfig.tsx` - Displays agent connection details
- `AvailableTools.tsx` - Lists tools exposed to agents

### Key Integration Points

**Snappjack SDK** (`/src/lib/snappjack.ts`):
- Provides MCP protocol implementation
- Handles agent connections and tool registration
- Manages bidirectional communication between web app and AI agents

**State Management**:
- Game state lives in `DiceGame.tsx` with `useRef` pattern to avoid stale closures in tool handlers
- `DiceState` interface provides structured data for agent interactions
- Tools expose `getCurrentDiceState()` function for real-time state access

**Tool Registration Pattern**:
The app registers tools that agents can call:
- `get_dice_state` - Returns current dice values and next actions
- `roll_dice` - Triggers dice roll with specified indices
- `reset_dice` - Resets game state
- Additional tools for keep/clear operations

### Type System

**Core Types** (`/src/types/dice.ts`):
- `GameState` - Internal React state structure
- `DiceState` - Agent-facing state representation
- Component prop interfaces for type safety

## Development Notes

- Uses TypeScript with strict mode enabled
- Path aliases: `@/*` maps to `./src/*`
- ESLint configured with Next.js and TypeScript rules
- Tailwind CSS for styling (v4)
- React 19 with Next.js 15.4.6

## Agent Development

When working with Snappjack integration:
- Tool handlers use `useCallback` to maintain stable references
- State access via `gameStateRef.current` prevents stale closure issues  
- All agent tools return `ToolResponse` format with content array
- MCP endpoint configuration handled in `ConnectionData` interface