import { Button, Container, Text } from '@medusajs/ui';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  title: string;
  message: string;
  onRetry?: () => void;
  showRetry?: boolean;
}

export const ErrorState = ({ title, message, onRetry, showRetry = true }: ErrorStateProps) => {
  return (
    <div className="flex flex-col gap-4 bg-transparent">
      <Container className="divide-y p-0">
        <div className="flex flex-col items-center justify-center py-12 px-4">
          <div className="flex flex-col items-center justify-center text-center max-w-md">
            <div className="mb-4">
              <AlertCircle className="w-12 h-12 text-ui-fg-error mx-auto mb-3" />
              <Text className="text-ui-fg-subtle mb-2 text-lg">{title}</Text>
              <Text className="text-ui-fg-muted text-sm mb-6">{message}</Text>
            </div>

            {showRetry && (
              <Button
                size="small"
                variant="secondary"
                onClick={onRetry || (() => window.location.reload())}
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Retry
              </Button>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
};
