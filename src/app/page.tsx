'use client';

import Link from 'next/link';

export default function Home() {
  const handleEmailRequest = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const mailtoUrl = "mailto:hello@snappjack.com?subject=Request%20for%20Snappjack%20API%20Key&body=Hi%20Snappjack%20Team%2C%0A%0AI%20would%20like%20to%20request%20an%20API%20key%20to%20start%20building%20Snapps%20with%20Snappjack.%0A%0AName%3A%20%0ACompany%2FProject%3A%20%0AUse%20Case%3A%20%0A%0AThank%20you!";
    window.open(mailtoUrl, '_blank');
    return false;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-5 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Snappjack Demo Snapps
          </h1>
          <p className="text-2xl text-gray-700 mb-6">
            Build Snapps that AI agents can use
          </p>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Snappjack bridges AI agents to web applications through the Model Context Protocol (MCP), 
            enabling seamless interaction between humans and AI in real-time collaborative environments.
            <span className="block mt-4 font-medium text-purple-600">
              Snapps are web apps with dual interfaces: GUI for humans, MCP tools for AI agents.
            </span>
          </p>
        </div>
      </section>

      {/* Demo Showcase */}
      <section className="max-w-6xl mx-auto px-5 py-12">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
          Explore Our Demo Snapps
        </h2>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* Pipster Card */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            <div className="p-8">
              <div className="text-4xl mb-4">🎲</div>
              <h3 className="text-2xl font-bold mb-3 text-gray-800">Pipster</h3>
              <p className="text-gray-600 mb-6">
                A dice game where AI agents can roll, keep, and strategize alongside human players
              </p>
              
              <div className="space-y-2 mb-6">
                <div className="flex items-center text-sm text-gray-600">
                  <span className="mr-2">✓</span> Roll and keep dice
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <span className="mr-2">✓</span> Strategic decision making
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <span className="mr-2">✓</span> Real-time state synchronization
                </div>
              </div>
              
              <Link
                href="/pipster"
                className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-medium px-6 py-3 rounded-lg transition-colors"
              >
                Try Pipster →
              </Link>
            </div>
          </div>

          {/* DrawIt Card */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            <div className="p-8">
              <div className="text-4xl mb-4">🎨</div>
              <h3 className="text-2xl font-bold mb-3 text-gray-800">DrawIt</h3>
              <p className="text-gray-600 mb-6">
                A canvas app where AI agents can create visual content, draw shapes, and compose scenes
              </p>
              
              <div className="space-y-2 mb-6">
                <div className="flex items-center text-sm text-gray-600">
                  <span className="mr-2">✓</span> Draw shapes and text
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <span className="mr-2">✓</span> Manipulate objects
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <span className="mr-2">✓</span> Export canvas images
                </div>
              </div>
              
              <Link
                href="/drawit"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg transition-colors"
              >
                Try DrawIt →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How to Use a Snapp Section */}
      <section className="bg-gradient-to-r from-purple-50 to-blue-50 py-16">
        <div className="max-w-6xl mx-auto px-5">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-gray-800">
              How to Use a Snapp with AI Agents
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Snapps enable a revolutionary way of working where humans and AI agents collaborate in real-time
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="bg-purple-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <span className="text-2xl">👤</span>
              </div>
              <h3 className="font-bold text-lg mb-2">1. Use the GUI</h3>
              <p className="text-gray-600">
                Interact with the Snapp directly through its web interface. Roll dice in Pipster, 
                draw shapes in DrawIt - just like any regular web app.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="bg-purple-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <span className="text-2xl">🤖</span>
              </div>
              <h3 className="font-bold text-lg mb-2">2. Connect an AI Agent</h3>
              <p className="text-gray-600">
                Use an MCP-enabled AI like Claude Desktop. Copy the connection details from the Snapp's 
                "Agent Configuration" section and add them to your AI's MCP settings.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="bg-purple-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <span className="text-2xl">✨</span>
              </div>
              <h3 className="font-bold text-lg mb-2">3. Collaborate with AI</h3>
              <p className="text-gray-600">
                Ask the AI to interact with your Snapp. "Draw a house", "Roll until we get all sixes", 
                or any task the Snapp supports. The AI works alongside you in real-time.
              </p>
            </div>
          </div>

          <div className="mt-12 bg-white rounded-xl p-8 shadow-md">
            <div className="flex flex-col items-center justify-center min-h-[300px] text-center">
              <div className="bg-purple-100 rounded-full w-20 h-20 flex items-center justify-center mb-6">
                <span className="text-4xl">▶️</span>
              </div>
              <h3 className="font-bold text-2xl mb-3 text-gray-800">
                See Snapps in Action
              </h3>
              <p className="text-gray-600 max-w-2xl">
                Watch how AI agents interact with Snapps in real-time. See Claude draw pictures, 
                play dice games, and collaborate with humans through the Snappjack bridge.
              </p>
              <div className="mt-6 text-sm text-purple-600 font-medium">
                Video demo coming soon!
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Get Started Section */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto px-5">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-gray-800">
              Build Your Own Snapps
            </h2>
            <p className="text-lg text-gray-600">
              Clone this project and create your own AI-enabled Snapps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="text-center">
              <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-md">
                <span className="text-2xl font-bold text-purple-600">1</span>
              </div>
              <h3 className="font-semibold mb-2">Clone the Repository</h3>
              <p className="text-sm text-gray-600">
                Get the demo project from GitHub to start building
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-md">
                <span className="text-2xl font-bold text-purple-600">2</span>
              </div>
              <h3 className="font-semibold mb-2">Request API Key</h3>
              <p className="text-sm text-gray-600">
                Get your Snappjack API key to enable agent connections
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-md">
                <span className="text-2xl font-bold text-purple-600">3</span>
              </div>
              <h3 className="font-semibold mb-2">Build & Deploy</h3>
              <p className="text-sm text-gray-600">
                Create your Snapp and deploy it for agents to use
              </p>
            </div>
          </div>

          <div className="flex justify-center space-x-4">
            <a
              href="https://github.com/snappjack/snappjack-demo-nextjs"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center bg-gray-800 hover:bg-gray-900 text-white font-medium px-6 py-3 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              View on GitHub
            </a>
            
            <a
              href="#"
              onClick={handleEmailRequest}
              className="inline-flex items-center bg-purple-600 hover:bg-purple-700 text-white font-medium px-6 py-3 rounded-lg transition-colors"
            >
              Request API Key →
            </a>
          </div>
        </div>
      </section>

      {/* Early Access Notice */}
      <section className="max-w-6xl mx-auto px-5 py-12">
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-8 text-center border border-purple-200">
          <div className="text-2xl mb-3">🔒</div>
          <h3 className="text-xl font-bold mb-2 text-gray-800">
            Snappjack is in Restricted Early Access
          </h3>
          <p className="text-gray-600 mb-4">
            <a
              href="#"
              onClick={handleEmailRequest}
              className="text-purple-600 hover:text-purple-700 font-medium underline"
            >
              Request an API key
            </a>
            {' '}to start building your own AI-enabled Snapps.
          </p>
          <p className="text-sm text-gray-500">
            Join the community of developers building the future of human-AI collaboration
          </p>
        </div>
      </section>
    </div>
  );
}