import { useState, useEffect, useCallback, useRef } from 'react';
import { MessageCircle, X, Settings, Keyboard, HelpCircle, ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCopilot } from '@/hooks/useCopilot';
import { CopilotChatPanel } from './CopilotChatPanel';
import { CopilotPredictions } from './CopilotPredictions';
import { CopilotQuickActions } from './CopilotQuickActions';
import { CopilotSettings } from './CopilotSettings';

interface Position {
  x: number;
  y: number;
}

interface DragState {
  isDragging: boolean;
  dragStart: Position | null;
  initialPosition: Position | null;
}

export function CopilotSmartAssistant() {
  const [position, setPosition] = useState<Position>({ x: 20, y: 20 });
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    dragStart: null,
    initialPosition: null,
  });

  const floatingRef = useRef<HTMLDivElement>(null);
  const { context, predictions, shortcuts, isLoading, initialize } = useCopilot();

  // 初始化
  useEffect(() => {
    initialize();
  }, [initialize]);

  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Shift + C 打开/关闭
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        setIsOpen(!isOpen);
      }

      // ESC 关闭面板
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }

      // 快捷键处理
      if (isOpen) {
        shortcuts.forEach(shortcut => {
          if (shortcut.hotkey && matchesHotkey(e, shortcut.hotkey)) {
            e.preventDefault();
            handleQuickAction(shortcut);
          }
        });
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, shortcuts]);

  // 拖拽处理
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (showSettings) return; // 设置模式下禁用拖拽
    
    setDragState({
      isDragging: true,
      dragStart: { x: e.clientX, y: e.clientY },
      initialPosition: { ...position },
    });
  }, [position, showSettings]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragState.isDragging || !dragState.dragStart || !dragState.initialPosition) return;

    const deltaX = e.clientX - dragState.dragStart.x;
    const deltaY = e.clientY - dragState.dragStart.y;

    setPosition({
      x: Math.max(10, Math.min(window.innerWidth - 60, dragState.initialPosition.x + deltaX)),
      y: Math.max(10, Math.min(window.innerHeight - 60, dragState.initialPosition.y + deltaY)),
    });
  }, [dragState]);

  const handleMouseUp = useCallback(() => {
    setDragState({
      isDragging: false,
      dragStart: null,
      initialPosition: null,
    });
  }, []);

  useEffect(() => {
    if (dragState.isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [dragState.isDragging, handleMouseMove, handleMouseUp]);

  // 快速操作处理
  const handleQuickAction = useCallback(async (shortcut: any) => {
    try {
      await executeQuickAction(shortcut);
    } catch (error) {
      console.error('Quick action failed:', error);
    }
  }, []);

  // 切换展开状态
  const toggleExpanded = useCallback(() => {
    setIsExpanded(!isExpanded);
  }, [isExpanded]);

  // 切换主面板
  const toggleMainPanel = useCallback(() => {
    setIsOpen(!isOpen);
    setIsExpanded(false); // 关闭时重置展开状态
  }, [isOpen]);

  // 快捷键匹配
  const matchesHotkey = (e: KeyboardEvent, hotkey: string): boolean => {
    const parts = hotkey.toLowerCase().split('+');
    const key = parts[parts.length - 1];
    const modifiers = parts.slice(0, -1);

    if (e.key.toLowerCase() !== key) return false;

    const requiredModifiers = {
      ctrl: e.ctrlKey,
      cmd: e.metaKey,
      shift: e.shiftKey,
      alt: e.altKey,
    };

    return modifiers.every(mod => requiredModifiers[mod as keyof typeof requiredModifiers]);
  };

  // 执行快速操作
  const executeQuickAction = async (shortcut: any) => {
    // 这里可以集成具体的业务逻辑
    console.log('Executing quick action:', shortcut);
    // 例如：导航到特定页面、打开模态框、执行API调用等
  };

  // 重要通知检测
  const hasImportantNotifications = (): boolean => {
    return predictions.some(p => p.severity === 'high' || p.severity === 'critical');
  };

  // 获取通知数量
  const getNotificationCount = (): number => {
    return predictions.filter(p => !p.isDismissed).length;
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {/* 预测卡片 */}
      {predictions.length > 0 && (
        <CopilotPredictions 
          predictions={predictions}
          onAction={handleQuickAction}
          className="pointer-events-auto"
        />
      )}

      {/* 快捷操作面板 */}
      {isExpanded && (
        <CopilotQuickActions
          shortcuts={shortcuts}
          onExecute={handleQuickAction}
          className="pointer-events-auto"
        />
      )}

      {/* 设置面板 */}
      {showSettings && (
        <CopilotSettings
          onClose={() => setShowSettings(false)}
          className="pointer-events-auto"
        />
      )}

      {/* 主聊天面板 */}
      {isOpen && (
        <CopilotChatPanel
          context={context}
          shortcuts={shortcuts}
          onClose={() => setIsOpen(false)}
          className="pointer-events-auto"
        />
      )}

      {/* 悬浮球和控制按钮 */}
      <div className="absolute pointer-events-auto" style={{ right: position.x, bottom: position.y }}>
        {/* 展开/收起按钮 */}
        <div className="flex items-center gap-2 mb-2">
          <button
            onClick={toggleExpanded}
            className={cn(
              "w-8 h-8 rounded-full bg-white shadow-lg border flex items-center justify-center",
              "hover:bg-gray-50 transition-all duration-200",
              isExpanded ? "rotate-180" : ""
            )}
            title={isExpanded ? "收起快捷操作" : "展开快捷操作"}
          >
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>

          {/* 设置按钮 */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={cn(
              "w-8 h-8 rounded-full bg-white shadow-lg border flex items-center justify-center",
              "hover:bg-gray-50 transition-all duration-200",
              showSettings ? "bg-blue-50 border-blue-200" : ""
            )}
            title="设置"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* 帮助按钮 */}
          <button
            onClick={() => {/* 显示帮助 */}}
            className="w-8 h-8 rounded-full bg-white shadow-lg border flex items-center justify-center hover:bg-gray-50 transition-all duration-200"
            title="帮助"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* 快捷键提示 */}
          <button
            onClick={() => {/* 显示快捷键 */}}
            className="w-8 h-8 rounded-full bg-white shadow-lg border flex items-center justify-center hover:bg-gray-50 transition-all duration-200"
            title="快捷键"
          >
            <Keyboard className="w-4 h-4" />
          </button>
        </div>

        {/* 主悬浮球 */}
        <div
          ref={floatingRef}
          onMouseDown={handleMouseDown}
          className={cn(
            "w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-purple-600",
            "shadow-lg cursor-pointer transition-all duration-300 hover:scale-110",
            "flex items-center justify-center text-white relative",
            dragState.isDragging && "scale-110 shadow-xl cursor-grabbing"
          )}
          onClick={toggleMainPanel}
        >
          <MessageCircle className="w-6 h-6" />
          
          {/* 通知徽章 */}
          {getNotificationCount() > 0 && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
              {getNotificationCount() > 9 ? '9+' : getNotificationCount()}
            </div>
          )}

          {/* 脉冲动画 */}
          {hasImportantNotifications() && (
            <div className="absolute inset-0 rounded-full bg-red-500 opacity-30 animate-ping" />
          )}
        </div>
      </div>
    </div>
  );
}