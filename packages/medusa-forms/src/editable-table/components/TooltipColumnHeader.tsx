import { InformationCircleSolid } from '@medusajs/icons';
import { Tooltip } from '@medusajs/ui';

interface TooltipColumnHeaderProps {
  children: React.ReactNode;
  columnKey: string;
  columnName: string;
  getTooltipContent?: (columnKey: string, columnName: string) => string | React.ReactNode | null;
}

export const TooltipColumnHeader = ({
  children,
  columnKey,
  columnName,
  getTooltipContent,
}: TooltipColumnHeaderProps) => {
  if (!getTooltipContent) {
    return <>{children}</>;
  }

  const tooltipContent = getTooltipContent(columnKey, columnName);

  if (!tooltipContent) {
    return <>{children}</>;
  }

  return (
    <div className="flex items-center gap-1 w-full">
      {children}
      <Tooltip content={tooltipContent} maxWidth={300}>
        <InformationCircleSolid className="w-4 h-4 text-ui-fg-base opacity-60 hover:opacity-100 transition-opacity cursor-help" />
      </Tooltip>
    </div>
  );
};
