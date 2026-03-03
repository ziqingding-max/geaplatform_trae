import { useState } from 'react';
import { Zap, TrendingUp, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SuggestedAction {
  label: string;
  action: string;
  params?: Record<string, any>;
}

interface CopilotSuggestedActionsProps {
  shortcuts: Array<{
    title: string;
    action: string;
    params?: Record<string, any>;
  }>;
  onExecute: (action: string, params?: Record<string, any>) => void;
  className?: string;
}

export function CopilotSuggestedActions({ 
  shortcuts, 
  onExecute, 
  className 
}: CopilotSuggestedActionsProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!shortcuts || shortcuts.length === 0) {
    return null;
  }

  const getIcon = (action: string) => {
    if (action.includes('search')) return <Zap className="w-4 h-4" />;
    if (action.includes('export')) return <FileText className="w-4 h-4" />;
    return <TrendingUp className="w-4 h-4" />;
  };

  return (
    <div className={cn("p-3 border-t bg-gray-50", className)}>
      <div className="text-xs text-gray-600 mb-2">建议操作</div>
      <div className="flex flex-wrap gap-2">
        {shortcuts.map((shortcut, index) => (
          <button
            key={index}
            onClick={() => onExecute(shortcut.action, shortcut.params)}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 text-xs rounded-full border transition-all duration-200",
              "bg-white text-gray-700 border-gray-200 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700",
              hoveredIndex === index && "bg-blue-50 border-blue-300 text-blue-700 shadow-sm"
            )}
          >
            {getIcon(shortcut.action)}
            <span>{shortcut.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
}