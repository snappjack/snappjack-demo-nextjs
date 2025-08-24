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
echo "NEXT_PUBLIC_SNAPPJACK_SNAPP_ID=your-app-id" > .env
echo "SNAPPJACK_SNAPP_API_KEY=your-api-key" >> .env

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
│   │   │   ├── usePipster.ts    # Game logic
│   │   │   └── useSnappjack.ts  # Snappjack integration
│   │   └── components/
│   └── drawit/            # DrawIt Snapp - Canvas drawing
│       ├── hooks/
│       │   ├── useDrawit.ts     # Drawing logic
│       │   └── useSnappjack.ts  # Snappjack integration
│       └── components/
├── components/
│   ├── layout/            # Shared layout components
│   └── *.tsx              # Shared Snappjack UI components
└── contexts/
    └── SnappjackCredentialsContext.tsx  # API key management
```

## 🏗️ Architecture Overview

### Core Concepts

1. **Snappjack Hook Pattern**: Each Snapp uses a custom `useSnappjack` hook that:
   - Establishes WebSocket connection to Snappjack bridge
   - Registers tools that AI agents can call
   - Handles connection lifecycle and errors

2. **Tool Registration**: Tools are functions that agents can invoke. All tool definitions and responses must follow the [MCP Tools Specification](https://modelcontextprotocol.io/specification/2025-06-18/server/tools):
   ```typescript
   const tools = [
     {
       name: 'get_state',
       description: 'Get current app state',
       inputSchema: {
         type: 'object',
         properties: {}
       },
       handler: () => ({ 
         content: [{ 
           type: 'text',
           text: JSON.stringify(state) 
         }] 
       })
     }
   ];
   ```

3. **State Management**: Use `useRef` to avoid stale closures in tool handlers:
   ```typescript
   const stateRef = useRef(state);
   stateRef.current = state; // Keep ref updated
   
   // Tool handlers access current state via ref
   const handler = () => stateRef.current;
   ```

## 🎯 Creating Your Own Snapp

### Step 1: Create Your Snapp Logic Hook

Create a hook that manages your Snapp's state and functionality:

```typescript
// hooks/useMyApp.ts
export function useMyApp() {
  const [message, setMessage] = useState('Hello World');
  const messageRef = useRef(message);
  messageRef.current = message;

  const updateMessage = (text: string) => {
    setMessage(text);
  };

  const getCurrentState = () => ({
    message: messageRef.current,
    timestamp: new Date().toISOString()
  });

  return {
    message,
    updateMessage,
    getCurrentState
  };
}
```

### Step 2: Create Snappjack Integration Hook

Connect your Snapp to Snappjack by registering tools that follow the [MCP Tools Specification](https://modelcontextprotocol.io/specification/2025-06-18/server/tools):

```typescript
// hooks/useSnappjack.ts
import { useSnappjack as useSnappjackSDK } from '@snappjack/sdk-js';

export function useSnappjack({ getCurrentState, updateMessage }) {
  const tools = [
    {
      name: 'get_message',
      description: 'Get the current message',
      inputSchema: { 
        type: 'object', 
        properties: {},
        required: []
      },
      handler: async () => ({
        content: [{ 
          type: 'text',
          text: getCurrentState().message 
        }]
      })
    },
    {
      name: 'set_message',
      description: 'Set a new message',
      inputSchema: {
        type: 'object',
        properties: {
          text: { type: 'string', description: 'New message text' }
        },
        required: ['text']
      },
      handler: async (input) => {
        updateMessage(input.text);
        return { 
          content: [{ 
            type: 'text',
            text: `Message updated to: ${input.text}` 
          }] 
        };
      }
    }
  ];

  return useSnappjackSDK({
    snappId: 'my-hello-world',
    appName: 'Hello World App',
    tools
  });
}
```

**Note**: The `content` array in tool responses must follow MCP format with `type` and `text` properties.

### Step 3: Build Your UI Component

```typescript
// app/hello/page.tsx
'use client';

import { useMyApp } from './hooks/useMyApp';
import { useSnappjack } from './hooks/useSnappjack';

export default function HelloPage() {
  const { message, updateMessage, getCurrentState } = useMyApp();
  const { status, connectionData } = useSnappjack({
    getCurrentState,
    updateMessage
  });

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Hello World App</h1>
      <p className="text-xl mb-4">{message}</p>
      <input
        type="text"
        value={message}
        onChange={(e) => updateMessage(e.target.value)}
        className="border p-2 rounded"
      />
      {status === 'bridged' && (
        <p className="mt-4 text-green-600">✅ Agent connected!</p>
      )}
    </div>
  );
}
```

## 🤖 Using Claude Code to Build Snapps

[Claude Code](https://claude.ai/code) can help you rapidly prototype and build Snapps. Here's an example prompt to get started:

### Example Prompt for a Todo List Snapp

```
Create a new Snappjack-enabled todo list Snapp in the Next.js project. The Snapp should:

1. Allow users to add, complete, and delete todos through the UI
2. Expose these tools to AI agents:
   - get_todos: Return all todos with their status
   - add_todo: Add a new todo item
   - complete_todo: Mark a todo as complete
   - delete_todo: Remove a todo

Follow the existing pattern from the Pipster and DrawIt Snapps:
- Create the Snapp in src/app/todos/
- Use a useTodos hook for state management
- Use useSnappjack hook for agent integration
- Use useRef to avoid stale closures in tool handlers
- Include ConnectionStatus and AgentConfig components

The UI should be clean and simple with Tailwind CSS styling.
```

### Tips for Working with Claude Code

1. **Reference Existing Patterns**: Point Claude to existing Snapps (Pipster/DrawIt) as examples
2. **Be Specific About Tools**: Clearly describe what tools agents should have access to
3. **Request Error Handling**: Ask for proper error handling and connection management
4. **Iterate Quickly**: Start simple and add features incrementally

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
NEXT_PUBLIC_SNAPPJACK_SNAPP_ID=your-app-id
SNAPPJACK_SNAPP_API_KEY=your-api-key
```

To get your App ID and API key:
- Visit [www.snappjack.com](https://www.snappjack.com) to request access
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