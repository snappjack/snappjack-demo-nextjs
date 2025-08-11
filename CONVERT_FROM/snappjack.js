/**
 * Snappjack SDK
 * Enable your app for agents. In a snap.
 * 
 * The zero-pain way to enable your app for the AI era, letting users put their 
 * personal assistants to work directly within their live app session.
 * 
 * LOGGING CONFIGURATION:
 * By default, the SDK logs to console. For environments without console or custom 
 * logging needs, provide a logger object with log, warn, and error methods:
 * 
 * Example:
 *   const customLogger = {
 *     log: (...args) => myLogFunction('info', ...args),
 *     warn: (...args) => myLogFunction('warn', ...args),
 *     error: (...args) => myLogFunction('error', ...args)
 *   };
 *   
 *   const snappjack = new Snappjack({
 *     appId: 'my-app',
 *     userId: 'user-123',
 *     apiKey: 'wak_...',
 *     logger: customLogger  // Optional: custom logging
 *   });
 */

// Capture the SDK's origin at load time for cross-domain support
const SNAPPJACK_SDK_ORIGIN = (() => {
  if (typeof document !== 'undefined' && document.currentScript?.src) {
    return new URL(document.currentScript.src).origin;
  }
  // Fallback: try to find the script tag containing this SDK
  if (typeof document !== 'undefined') {
    const scripts = document.getElementsByTagName('script');
    for (let script of scripts) {
      if (script.src && script.src.includes('/sdk/snappjack.js')) {
        return new URL(script.src).origin;
      }
    }
  }
  return null;
})();

class Snappjack extends EventTarget {
  constructor(config) {
    super();
    this.config = config;
    this.ws = null;
    this.status = 'disconnected';
    this.tools = new Map();
    this.reconnectTimer = null;
    this.reconnectAttempts = 0;
    this.currentAgentSessionId = null;
    this.userApiKey = null;
    this.currentPort = null;
    this.routerPort = null;
    
    // Set up logging function
    this.logger = this.config.logger || this.defaultLogger;
    
    this.#validateConfig();
    this.#initializeTools();
  }

  /**
   * Default logger implementation using console
   */
  defaultLogger = {
    log: (...args) => {
      if (typeof console !== 'undefined' && console.log) {
        console.log(...args);
      }
    },
    warn: (...args) => {
      if (typeof console !== 'undefined' && console.warn) {
        console.warn(...args);
      }
    },
    error: (...args) => {
      if (typeof console !== 'undefined' && console.error) {
        console.error(...args);
      }
    }
  }

  #validateConfig() {
    this.logger.log('🔧 Snappjack: Validating config...');
    
    // Always auto-detect server URL - first try SDK origin, then fallback to window.location
    if (SNAPPJACK_SDK_ORIGIN) {
      // Convert HTTP/HTTPS origin to WebSocket URL
      const wsProtocol = SNAPPJACK_SDK_ORIGIN.startsWith('https') ? 'wss:' : 'ws:';
      this.config.serverUrl = SNAPPJACK_SDK_ORIGIN.replace(/^https?:/, wsProtocol);
      
      // Extract port from the SDK origin
      try {
        const url = new URL(SNAPPJACK_SDK_ORIGIN);
        this.currentPort = url.port || (url.protocol === 'https:' ? '443' : '80');
      } catch (e) {
        this.currentPort = '80';
      }
      
      this.logger.log(`🔧 Snappjack: Using SDK origin for server URL: ${this.config.serverUrl}`);
      this.logger.log(`🔧 Snappjack: SDK was loaded from: ${SNAPPJACK_SDK_ORIGIN}`);
    } else {
      // Fallback to using current page location
      const currentHost = window.location.hostname;
      const currentProtocol = window.location.protocol;
      let currentPort = window.location.port;

      this.logger.log(`🔧 Snappjack: SDK origin not detected, falling back to window.location`);
      this.logger.log(`🔧 Snappjack: Current host: ${currentHost}`);
      this.logger.log(`🔧 Snappjack: Current protocol: ${currentProtocol}`);
      this.logger.log(`🔧 Snappjack: Current port: ${currentPort}`);
      
      // Handle default ports for HTTPS/HTTP
      if (!currentPort) {
        currentPort = currentProtocol === 'https:' ? '443' : '80';
      }
      
      this.currentPort = currentPort;
      
      // Use WSS for HTTPS, WS for HTTP
      const wsProtocol = currentProtocol === 'https:' ? 'wss:' : 'ws:';
      
      // Don't include port in URL for standard ports (80/443)
      const includePort = currentPort !== '80' && currentPort !== '443';
      this.config.serverUrl = includePort ? 
        `${wsProtocol}//${currentHost}:${currentPort}` : 
        `${wsProtocol}//${currentHost}`;
      
      this.logger.log(`🔧 Snappjack: Auto-detected server URL from window.location: ${this.config.serverUrl}`);
      this.logger.log(`🔧 Snappjack: Current port detected: ${currentPort}, protocol: ${currentProtocol}, include port: ${includePort}`);
    }
    
    if (!this.config.appId) {
      throw new Error('App ID is required');
    }
    if (!this.config.userId) {
      throw new Error('User ID is required');
    }
    if (!this.config.apiKey) {
      throw new Error('API key is required');
    }

    // Set defaults
    this.config.autoReconnect = this.config.autoReconnect ?? true;
    this.config.reconnectInterval = this.config.reconnectInterval ?? 5000;
    this.config.maxReconnectAttempts = this.config.maxReconnectAttempts ?? 10;
  }


  #initializeTools() {
    if (this.config.tools) {
      this.config.tools.forEach(tool => {
        this.registerTool(tool);
      });
    }
  }

  /**
   * Register a tool that your app exposes to AI agents
   */
  registerTool(tool) {
    // Store both the tool definition and handler
    this.tools.set(tool.name, {
      ...tool,
      handler: tool.handler || null
    });
    
    // Auto-register tool handler if provided
    if (tool.handler && typeof tool.handler === 'function') {
      this.#onToolCall(tool.name, tool.handler);
    }
  }

  async connect() {
    this.logger.log('🔌 Snappjack: Starting connection...');
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.logger.log('🔌 Snappjack: Already connected, returning early');
      return;
    }

    // If we don't have a user API key, get one first using webapp API key
    if (!this.userApiKey) {
      this.logger.log('🔑 Snappjack: No user API key, generating one...');
      await this.#generateUserApiKey();
      
      // Wait for the key to be generated (it will be set via the event handler)
      if (!this.userApiKey) {
        throw new Error('Failed to authenticate: User API key generation failed');
      }
      this.logger.log(`🔑 Snappjack: User API key generated: ${this.userApiKey}`);
    } else {
      this.logger.log(`🔑 Snappjack: Using existing user API key: ${this.userApiKey}`);
    }

    return new Promise((resolve, reject) => {
      try {
        const wsUrl = this.#buildWebSocketUrl();
        this.logger.log(`🔗 Snappjack: Connecting to WebSocket URL: ${wsUrl}`);
        this.ws = new WebSocket(wsUrl);

        const connectTimeout = setTimeout(() => {
          if (this.ws) {
            this.ws.close();
          }
          reject(new Error('Connection timeout'));
        }, 10000);

        this.ws.onopen = async () => {
          this.logger.log('✅ Snappjack: WebSocket connection opened');
          clearTimeout(connectTimeout);
          await this.#handleOpen();
          resolve();
        };

        this.ws.onmessage = (event) => {
          this.logger.log(`📨 Snappjack: Received message:`, event.data);
          this.#handleMessage(event.data);
        };

        this.ws.onclose = (event) => {
          this.logger.log(`❌ Snappjack: WebSocket closed - Code: ${event.code}, Reason: ${event.reason}`);
          clearTimeout(connectTimeout);
          this.#handleClose(event.code, event.reason);
        };

        this.ws.onerror = (error) => {
          this.logger.error('❌ Snappjack: WebSocket error:', error);
          clearTimeout(connectTimeout);
          this.#handleError(error);
          reject(error);
        };

      } catch (error) {
        reject(error);
      }
    });
  }

  async disconnect() {
    this.#clearReconnectTimer();
    
    if (this.ws) {
      return new Promise((resolve) => {
        if (this.ws.readyState === WebSocket.OPEN) {
          this.ws.onclose = () => resolve();
          this.ws.close(1000, 'Client disconnect');
        } else {
          resolve();
        }
      });
    }
  }

  #buildWebSocketUrl() {
    this.logger.log('🏗️ Snappjack: Building WebSocket URL...');
    // Handle both ws:// and http:// URLs
    let baseUrl = this.config.serverUrl;
    this.logger.log(`🏗️ Snappjack: Original server URL: ${baseUrl}`);
    
    if (baseUrl.startsWith('http://')) {
      baseUrl = baseUrl.replace('http://', 'ws://');
      this.logger.log(`🏗️ Snappjack: Converted http to ws: ${baseUrl}`);
    } else if (baseUrl.startsWith('https://')) {
      baseUrl = baseUrl.replace('https://', 'wss://');
      this.logger.log(`🏗️ Snappjack: Converted https to wss: ${baseUrl}`);
    }
    
    // Ensure the URL ends without trailing slash for proper path construction
    if (baseUrl.endsWith('/')) {
      baseUrl = baseUrl.slice(0, -1);
      this.logger.log(`🏗️ Snappjack: Removed trailing slash: ${baseUrl}`);
    }
    
    // Use user API key if available, otherwise fall back to webapp API key
    const apiKey = this.userApiKey || this.config.apiKey;
    this.logger.log(`🏗️ Snappjack: Using API key: ${apiKey ? apiKey.substring(0, 8) + '...' : 'none'} (${this.userApiKey ? 'user' : 'webapp'} key)`);
    
    const wsUrl = `${baseUrl}/ws/${this.config.appId}/${this.config.userId}?apiKey=${apiKey}`;
    this.logger.log(`🏗️ Snappjack: Final WebSocket URL: ${wsUrl}`);
    return wsUrl;
  }

  async #handleOpen() {
    this.logger.log('🚀 Snappjack: Handling connection open...');
    this.reconnectAttempts = 0;
    this.#updateStatus('connected');
    this.logger.log('📊 Snappjack: Status updated to connected');
    
    // Send tools registration message to Snappjack
    this.logger.log('🛠️ Snappjack: Sending tools registration...');
    this.#sendToolsRegistration();
    
    // Emit user API key event if we have one (it was generated during connect)
    if (this.userApiKey) {
      this.logger.log('🔑 Snappjack: Emitting user-api-key-generated event');
      // Build MCP endpoint URL using the configured server URL
      const baseUrl = this.config.serverUrl
        .replace(/^ws:/, 'http:')
        .replace(/^wss:/, 'https:');
      const mcpEndpoint = `${baseUrl}/mcp/${this.config.appId}/${this.config.userId}`;
      
      const eventData = {
        userApiKey: this.userApiKey,
        appId: this.config.appId,
        userId: this.config.userId,
        mcpEndpoint: mcpEndpoint
      };
      this.logger.log('🔑 Snappjack: Event data:', eventData);
      this.#emit('user-api-key-generated', eventData);
    } else {
      this.logger.log('⚠️ Snappjack: No user API key available for event');
    }
    this.logger.log('✅ Snappjack: Connection handling complete');
  }

  #sendToolsRegistration() {
    try {
      const tools = this.getTools();
      this.logger.log(`🛠️ Snappjack: Registering ${tools.length} tools:`, tools.map(t => t.name));
      const message = {
        type: 'tools-registration',
        tools: tools
      };
      this.logger.log('🛠️ Snappjack: Tools registration message:', message);
      this.#sendMessage(message);
      this.logger.log('✅ Snappjack: Tools registration sent successfully');
    } catch (error) {
      this.logger.error('❌ Snappjack: Error sending tools registration:', error);
      this.#emit('error', error);
    }
  }

  #handleMessage(data) {
    try {
      this.logger.log(`📨 Snappjack: Parsing message: ${data}`);
      const message = JSON.parse(data);
      this.logger.log(`📨 Snappjack: Parsed message:`, message);
      
      // Handle router messages
      if (message.type === 'agent-connected') {
        this.logger.log('🤖 Snappjack: Handling agent-connected message');
        this.#handleAgentConnected(message);
      } else if (message.type === 'agent-disconnected') {
        this.logger.log('🤖 Snappjack: Handling agent-disconnected message');
        this.#handleAgentDisconnected(message);
      } else if (this.#isToolCallRequest(message)) {
        this.logger.log('🔧 Snappjack: Handling tool call request');
        this.#handleToolCall(message);
      } else {
        this.logger.log('💬 Snappjack: Handling generic message');
        // Emit generic message event
        this.#emit('message', message);
      }
    } catch (error) {
      this.logger.warn('❌ Snappjack: Received invalid JSON message:', error, 'Raw data:', data);
    }
  }

  #handleClose(code, _reason) {
    this.ws = null;
    this.currentAgentSessionId = null;
    this.#updateStatus('disconnected');

    // Attempt reconnection if enabled
    if (this.config.autoReconnect && this.#shouldReconnect(code)) {
      this.#scheduleReconnect();
    }
  }

  #handleError(error) {
    this.emit('error', error);
  }

  #handleAgentConnected(message) {
    this.logger.log(`🤖 Snappjack: Agent connected with session ID: ${message.agentSessionId}`);
    this.currentAgentSessionId = message.agentSessionId;
    this.#updateStatus('bridged');
    this.logger.log('📊 Snappjack: Status updated to bridged');
    this.#emit('agent-connected', { agentSessionId: message.agentSessionId });
  }

  #handleAgentDisconnected(message) {
    this.logger.log(`🤖 Snappjack: Agent disconnected with session ID: ${message.agentSessionId}`);
    if (this.currentAgentSessionId === message.agentSessionId) {
      this.logger.log('🤖 Snappjack: Current agent disconnected, updating status');
      this.currentAgentSessionId = null;
      this.#updateStatus('connected');
      this.logger.log('📊 Snappjack: Status updated to connected');
    } else {
      this.logger.log('🤖 Snappjack: Different agent disconnected, keeping current status');
    }
    this.#emit('agent-disconnected', { agentSessionId: message.agentSessionId });
  }

  async #handleToolCall(message) {
    // Store the agentSessionId for use in responses
    this.lastToolCallAgentSessionId = message.agentSessionId;
    
    // Find and call the registered tool handler directly
    const toolName = message.params.name;
    const tool = this.tools.get(toolName);
    
    if (tool && tool.handler) {
      try {
        const result = await tool.handler(message.params.arguments, message);
        this.#sendToolResponse(message.id, result);
      } catch (error) {
        this.#sendToolError(message.id, {
          code: -32603,
          message: error instanceof Error ? error.message : "Internal error",
          data: error instanceof Error ? error.message : String(error)
        });
      }
    } else {
      // Tool not found or no handler
      this.#sendToolError(message.id, {
        code: -32601,
        message: 'Method not found',
        data: `Tool '${toolName}' not found or no handler registered`
      });
    }
  }

  #isToolCallRequest(message) {
    return (
      message &&
      message.jsonrpc === '2.0' &&
      message.method === 'tools/call' &&
      message.params &&
      message.params.name &&
      message.agentSessionId
    );
  }

  #updateStatus(newStatus) {
    if (this.status !== newStatus) {
      this.logger.log(`📊 Snappjack: Status change: ${this.status} → ${newStatus}`);
      this.status = newStatus;
      this.#emit('status', newStatus);
      this.logger.log(`📊 Snappjack: Status event emitted: ${newStatus}`);
    } else {
      this.logger.log(`📊 Snappjack: Status unchanged: ${newStatus}`);
    }
  }

  #shouldReconnect(closeCode) {
    // Don't reconnect on normal closure or policy violations
    return closeCode !== 1000 && closeCode !== 1008 && 
           this.reconnectAttempts < this.config.maxReconnectAttempts;
  }

  #scheduleReconnect() {
    this.#clearReconnectTimer();
    
    const delay = Math.min(
      this.config.reconnectInterval * Math.pow(2, this.reconnectAttempts),
      30000 // Max 30 seconds
    );

    this.reconnectTimer = setTimeout(() => {
      this.reconnectAttempts++;
      this.connect().catch(() => {
        // Reconnection failed, will be handled by handleError
      });
    }, delay);
  }

  #clearReconnectTimer() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  #sendMessage(message) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      throw new Error('WebSocket is not connected');
    }
  }

  // Browser-compatible event handling
  on(event, listener) {
    this.addEventListener(event, listener);
    return this;
  }


  #emit(event, data) {
    this.dispatchEvent(new CustomEvent(event, { detail: data }));
  }

  // Public API methods

  getTools() {
    // Return tool definitions without handlers for registration
    return Array.from(this.tools.values()).map(tool => {
      const { handler, ...toolDef } = tool;
      return toolDef;
    });
  }



  #sendToolResponse(requestId, result) {
    try {
      const response = {
        jsonrpc: '2.0',
        id: requestId,
        result,
        agentSessionId: this.lastToolCallAgentSessionId
      };

      this.#sendMessage(response);
    } catch (error) {
      this.#emit('error', error);
    }
  }

  #sendToolError(requestId, error) {
    try {
      const errorResponse = {
        jsonrpc: '2.0',
        id: requestId,
        error,
        agentSessionId: this.lastToolCallAgentSessionId
      };

      this.#sendMessage(errorResponse);
    } catch (error) {
      this.#emit('error', error);
    }
  }



  // Private method to generate user API key for agent connections
  async #generateUserApiKey() {
    try {
      this.logger.log('🔑 Snappjack: Starting user API key generation...');
      // Use the HTTP port (3000) for API calls, not the WebSocket port (3001)
      let httpUrl = this.config.serverUrl;
      this.logger.log(`🔑 Snappjack: Original URL: ${httpUrl}`);
      
      if (httpUrl.startsWith('ws://')) {
        httpUrl = httpUrl.replace('ws://', 'http://');
        this.logger.log(`🔑 Snappjack: Converted to HTTP: ${httpUrl}`);
      } else if (httpUrl.startsWith('wss://')) {
        httpUrl = httpUrl.replace('wss://', 'https://');
        this.logger.log(`🔑 Snappjack: Converted to HTTPS: ${httpUrl}`);
      }
      
      // HTTP calls use the same port as WebSocket now
      
      // Build API endpoint URL
      const apiUrl = `${httpUrl}/api/user-key/${this.config.appId}/${this.config.userId}`;
      this.logger.log(`🔑 Snappjack: API URL: ${apiUrl}`);
      this.logger.log(`🔑 Snappjack: Using webapp API key: ${this.config.apiKey}`);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      this.logger.log(`🔑 Snappjack: API response status: ${response.status}`);
      
      if (!response.ok) {
        const responseText = await response.text();
        this.logger.error(`🔑 Snappjack: API error response: ${responseText}`);
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${responseText}`);
      }
      
      const data = await response.json();
      this.logger.log(`🔑 Snappjack: API response data:`, data);
      this.userApiKey = data.userApiKey;
      this.logger.log(`🔑 Snappjack: User API key stored: ${this.userApiKey}`);
      
      // Emit event with connection data
      this.#emit('user-api-key-generated', data);
    } catch (error) {
      this.logger.error('❌ Snappjack: Failed to generate user API key:', error);
      this.emit('error', new Error('Failed to generate user API key: ' + error.message));
    }
  }
  
  

  // Utility method for registering tool handlers
  #onToolCall(toolName, handler) {
    // Get existing tool or create a basic one
    const existingTool = this.tools.get(toolName);
    if (existingTool) {
      // Update existing tool with handler
      existingTool.handler = handler;
    } else {
      // Create a basic tool definition (this is mainly for backward compatibility)
      this.tools.set(toolName, {
        name: toolName,
        description: `Handler for ${toolName}`,
        inputSchema: { type: 'object' },
        handler: handler
      });
    }
  }
}

// Make it available globally for browser use
if (typeof window !== 'undefined') {
  window.Snappjack = Snappjack;
}

// Also support module exports for compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Snappjack;
}