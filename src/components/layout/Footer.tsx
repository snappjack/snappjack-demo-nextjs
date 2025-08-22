export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-5 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <div className="text-sm text-gray-600">
            © {new Date().getFullYear()} Snappjack. All rights reserved.
          </div>
          
          <div className="flex items-center space-x-6 text-sm">
            <a
              href="mailto:hello@snappjack.com"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              hello@snappjack.com
            </a>
            <a
              href="https://github.com/snappjack/snappjack-demo-nextjs"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              GitHub
            </a>
            <a
              href="https://www.snappjack.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Snappjack.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}