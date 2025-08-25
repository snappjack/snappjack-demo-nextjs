# Snappjack Demo Snapps

Interactive demo applications showcasing how to build Snapps - web apps that AI agents can use through the [Snappjack](https://www.snappjack.com) bridge and Model Context Protocol (MCP).

**Snapps** are Snappjack-enabled applications that provide dual interfaces: a traditional GUI for human users and MCP tools for AI agent interaction.

## ⚠️ Alpha Stage Notice

**IMPORTANT**: Snappjack is currently in alpha and is for experimentation only:
- Breaking changes may be released at any time
- The service may be temporarily unavailable or shut down
- APIs and SDKs are subject to change
- Not recommended for production use

This project uses the [Snappjack SDK](https://github.com/snappjack/snappjack-sdk-js) which is also open source and rapidly evolving. SDK issues should be filed at the [SDK repository](https://github.com/snappjack/snappjack-sdk-js).

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- Snappjack App ID and API key (request at [www.snappjack.com](https://www.snappjack.com) or email hello@snappjack.com)

### Installation & Running

```bash
# Clone the repository
git clone https://github.com/snappjack/snappjack-demo-nextjs.git
cd snappjack-demo-nextjs

# Install dependencies
npm install

# Create .env file with your credentials
cp .env.example .env
# Edit .env and add your Pipster and DrawIt credentials

# Run the development server
npm run dev
```

Open [http://localhost:3010](http://localhost:3010) to see the demo Snapps.

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx           # Home page
│   ├── layout.tsx         # Root layout with header/footer
│   ├── pipster/           # Pipster Snapp - Dice game
│   │   ├── hooks/
│   │   │   └── usePipster.ts         # Game state management
│   │   ├── lib/
│   │   │   └── createSnappjackTools.ts # MCP tool factory
│   │   ├── components/               # UI components
│   │   └── types/
│   └── drawit/            # DrawIt Snapp - Canvas drawing
│       ├── hooks/
│       │   ├── useDrawit.ts          # Drawing state management
│       │   ├── useFileOperations.ts  # Specialized functionality
│       │   └── useCanvasInteraction.ts
│       ├── lib/
│       │   ├── DrawingEngine.ts      # Business logic class
│       │   ├── createSnappjackTools.ts # MCP tool factory
│       │   ├── constants.ts          # App constants
│       │   ├── validation.ts         # Validation utilities
│       │   └── geometry.ts           # Utility functions
│       ├── components/               # UI components
│       └── types/
├── hooks/                 # Shared hooks
│   ├── useSnappjackConnection.ts     # Shared connection management
│   └── useSnappjackCredentials.ts    # Credential management
└── components/
    ├── layout/            # Shared layout components
    └── snappjack/         # Snappjack-specific UI components
        ├── SnappjackConnectionStatus.tsx
        ├── SnappjackAgentConfig.tsx
        ├── SnappjackAvailableTools.tsx
        └── SnappjackConnectionError.tsx
```

## 🏗️ Architecture Overview

### The Snapp Design Pattern

A **Snapp** (Snappjack-enabled app) implements a **dual-interface architecture** that serves both human users and AI agents:

- **Human Interface**: Traditional React components and UI interactions
- **Agent Interface**: MCP (Model Context Protocol) tools that provide the same functionality programmatically

### Core Architectural Layers

1. **Business Logic Layer**: Pure application logic independent of React or MCP
   - Contains core app functionality and business rules
   - Examples: `DrawingEngine.ts` for canvas operations, dice game logic for Pipster
   - No dependencies on React hooks or MCP protocol

2. **State Management Layer**: React hooks that manage UI state and provide clean APIs
   - App-specific hooks like `useDrawit()` and `usePipster()`
   - Uses `useRef` pattern to prevent stale closures in tool handlers
   - Provides stable API methods that work for both UI and agent interactions

3. **Tool Factory Layer**: Creates MCP tools from app APIs
   - Factory functions like `createSnappjackTools()` that generate agent tools
   - Separates MCP protocol concerns from React state management
   - Transforms app API calls into MCP-compliant tool responses

4. **Connection Layer**: Shared Snappjack WebSocket management
   - `useSnappjackConnection()` hook handles WebSocket lifecycle
   - `useSnappjackCredentials()` manages authentication
   - Shared across all Snapps for consistency

### Key Benefits of This Pattern

- **Separation of Concerns**: Business logic, React state, and MCP protocol are decoupled
- **Testability**: Each layer can be tested independently
- **Reusability**: Connection and credential management are shared across all Snapps
- **Consistency**: Same functionality accessible through both human and agent interfaces

## 🎯 Creating Your Own Snapp

Follow the **dual-interface architecture pattern** demonstrated in the Pipster and DrawIt examples:

### Step 1: Business Logic Layer (Recommended for Complex Apps)

Create pure business logic classes or functions that contain your app's core functionality without any React or MCP dependencies. See `DrawingEngine.ts` as an example of this pattern.

### Step 2: State Management Layer

Build an app-specific React hook that manages UI state and provides a clean API. Key patterns:
- Use `useState` for React state management
- Use `useRef` pattern to prevent stale closures in tool handlers  
- Provide stable API methods that work for both UI interactions and agent tool calls
- Examples: `useDrawit()` and `usePipster()` hooks

### Step 3: Tool Factory Layer

Create a factory function that generates MCP tools from your app API:
- Place in `lib/createSnappjackTools.ts` following the established pattern
- Transform app API methods into MCP-compliant tool definitions
- Handle input validation and error responses
- Ensure tool descriptions clearly explain functionality for AI agents

### Step 4: Page Component Integration  

Connect all layers in your page component:
- Use your app-specific hook for core functionality
- Use shared `useSnappjackCredentials` and `useSnappjackConnection` hooks
- Include standard Snappjack UI components for connection status and agent configuration
- Ensure the same functionality is accessible through both human GUI and agent tools

## 🤖 Using Claude Code to Build Snapps

[Claude Code](https://claude.ai/code) can help you rapidly prototype and build Snapps by referencing the existing implementations as examples.

### Creating a Snapp with Claude Code

When building a new Snapp, follow this approach:

1. **Reference Architecture**: Point to Pipster and DrawIt as examples of the dual-interface pattern
2. **Define Agent Tools**: List what actions agents need (add todo, mark complete, delete, etc.)
3. **Request Layer Structure**: Ask for business logic, state management, tool factory, and UI layers
4. **Specify Components**: Request use of existing Snappjack UI components for consistency

### Example Prompt for a Todo List Snapp

Here's a complete prompt you can use with Claude Code to create a new Todo List Snapp:

```
I want to create a Todo List Snapp following the architecture pattern used in Pipster and DrawIt. 

First, examine the existing Pipster and DrawIt implementations to understand the dual-interface architecture pattern, then create a new Todo List Snapp with these requirements:

**Human Interface:**
- Add new todos with text input and priority levels
- Mark todos as complete/incomplete with checkboxes
- Delete todos with delete buttons
- Filter todos by status (all, active, completed)
- Clear all completed todos
- Display todo count and completion stats

**Agent Tools (MCP interface):**
- `todolist_system_get` - Get system documentation and current state
- `todolist_todo_add` - Add new todo with text, priority (low/medium/high), and optional due date
- `todolist_todo_update` - Update existing todo (text, priority, due date, completion status)
- `todolist_todo_delete` - Delete todo by ID
- `todolist_todos_clear_completed` - Clear all completed todos
- `todolist_todos_get` - Get current todo list with filtering options

**Architecture Requirements:**
- Follow the same 4-layer pattern: business logic → state management → tool factory → UI integration
- Use the existing Snappjack UI components (SnappjackConnectionStatus, SnappjackAgentConfig, etc.)
- Place in `src/app/todolist/` following the established directory structure
- Create types in `types/todolist.ts`
- Use `useRef` pattern in hooks to prevent stale closures
- Set up environment variables for TODOLIST_SNAPP_ID and API key

**Implementation Details:**
- Todo items should have: id, text, completed boolean, priority, createdAt, completedAt, optional dueDate
- State should track: todos array, filter mode, and any UI state
- Tools should return structured data that agents can easily parse
- Include comprehensive system documentation in the tool factory

Please create all necessary files and ensure the Todo List Snapp follows the exact same patterns as Pipster and DrawIt for consistency.
```

## 🔧 Development Commands

```bash
npm run dev       # Start development server (port 3010)
npm run build     # Build for production
npm start         # Run production server
npm run lint      # Run ESLint
```

## 📚 Key Dependencies

- **Next.js 15**: React framework with App Router
- **@snappjack/sdk-js**: Official Snappjack SDK
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling

## 🔑 Environment Setup

### Required Environment Variables

Create a `.env` file in the project root with the following:

```bash
# Pipster app credentials
NEXT_PUBLIC_PIPSTER_SNAPP_ID="your-pipster-app-id"
PIPSTER_SNAPP_API_KEY="your-pipster-api-key"

# DrawIt app credentials  
NEXT_PUBLIC_DRAWIT_SNAPP_ID="your-drawit-app-id"
DRAWIT_SNAPP_API_KEY="your-drawit-api-key"
```

To get your App IDs and API keys:
- Visit [www.snappjack.com](https://www.snappjack.com) to request access
- Create separate Snapps named "Pipster" and "DrawIt"
- Or email hello@snappjack.com

The app uses these credentials to:
1. Authenticate with the Snappjack bridge server
2. Generate user-specific connection keys
3. Establish WebSocket connections for agent communication

## 🚢 Deployment

These Snapps can be deployed to any Node.js hosting platform:

- **Vercel**: Automatic deployments from GitHub
- **Netlify**: Static site hosting with serverless functions
- **Railway**: Simple container deployments
- **Self-hosted**: Run with Node.js anywhere

## 📖 Learn More

- [Snappjack Documentation](https://www.snappjack.com/docs)
- [Model Context Protocol](https://modelcontextprotocol.io)
- [Next.js Documentation](https://nextjs.org/docs)
- [Request API Access](https://www.snappjack.com)

## 🤝 Contributing

We welcome contributions! Feel free to:
- Add new demo Snapps
- Improve existing Snapps
- Enhance documentation
- Report issues

## 📄 License

MIT License - See LICENSE file for details

## 💬 Support

- Email: hello@snappjack.com
- GitHub Issues: [Report bugs here](https://github.com/snappjack/snappjack-demo-nextjs/issues)
- Website: [www.snappjack.com](https://www.snappjack.com)