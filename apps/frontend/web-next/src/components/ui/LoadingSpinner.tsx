/**
 * Loading spinner component for consistent loading states.
 * Used across auth redirects and data loading scenarios.
 */

interface LoadingSpinnerProps {
  /** Optional message to display below the spinner */
  message?: string;
  /** Whether to display full screen centered */
  fullScreen?: boolean;
}

export default function LoadingSpinner({ 
  message = "Loading...", 
  fullScreen = true 
}: LoadingSpinnerProps) {
  const content = (
    <div className="flex flex-col items-center gap-3">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-600 border-t-transparent" />
      <span className="text-green-700 text-sm">{message}</span>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        {content}
      </div>
    );
  }

  return content;
}
