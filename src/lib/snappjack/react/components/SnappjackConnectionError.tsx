import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface SnappjackConnectionErrorProps {
  error: {
    type: string;
    message: string;
    canResetCredentials: boolean;
  };
  onResetCredentials: () => void;
}

export function SnappjackConnectionError({ error, onResetCredentials }: SnappjackConnectionErrorProps) {
  return (
    <div className="bg-red-50 dark:bg-gray-800 border border-red-200 dark:border-red-500 rounded-lg p-4">
      <div className="flex items-start space-x-3">
        <ExclamationTriangleIcon className="w-6 h-6 text-red-500 dark:text-red-400" />
        <div className="flex-1">
          <h3 className="font-semibold text-red-800 dark:text-gray-100 mb-1">Connection Problem</h3>
          <p className="text-red-700 dark:text-gray-300 mb-3">{error.message}</p>
          {error.canResetCredentials ? (
            <div className="space-y-2">
              <p className="text-red-600 dark:text-gray-400 text-sm">
                Your credentials may be invalid. Try getting new credentials:
              </p>
              <button
                onClick={onResetCredentials}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
              >
                Get New Credentials
              </button>
            </div>
          ) : (
            <p className="text-red-600 dark:text-gray-400 text-sm">
              {error.type === 'server_unreachable'
                ? 'The server may be down. Please wait and the app will retry automatically.'
                : 'Please check your connection and try refreshing the page.'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}