import { useState, useEffect } from 'react';

interface CopilotTypingIndicatorProps {
  className?: string;
}

export function CopilotTypingIndicator({ className }: CopilotTypingIndicatorProps) {
  const [dots, setDots] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => (prev >= 3 ? 1 : prev + 1));
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`flex items-center space-x-1 text-gray-500 ${className || ''}`}>
      <span>Copilot 正在思考</span>
      <span>{'.'.repeat(dots)}</span>
    </div>
  );
}