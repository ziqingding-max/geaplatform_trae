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

// 屏幕边缘检测常量
const EDGE_THRESHOLD = 20;
const FLOATING_BUTTON_SIZE = 56; // w-14 = 56px

export function CopilotSmartAssistant() {
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [isMounted, setIsMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    dragStart: null,
    initialPosition: null,
  });

  const floatingRef = useRef<HTMLDivElement>(null);
  const { context, predictions, shortcuts, isLoading, initialize } = useCopilot();

  // 初始化位置 - 只在客户端执行
  useEffect(() => {
    setIsMounted(true);
    const getInitialPosition = (): Position => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      return {
        x: Math.max(20, width - FLOATING_BUTTON_SIZE - 20),
        y: Math.max(20, height - FLOATING_BUTTON_SIZE - 100)
      };
    };
    setPosition(getInitialPosition());
  }, []);

  // 初始化Copilot
  useEffect(() => {
    if (isMounted) {
      initialize();
    }
  }, [isMounted, initialize]);

  // 响应式定位调整
  useEffect(() => {
    if (!isMounted) return;

    const handleResize = () => {
      setPosition(prev => {
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        return {
          x: Math.min(width - FLOATING_BUTTON_SIZE, Math.max(0, prev.x)),
          y: Math.min(height - FLOATING_BUTTON_SIZE, Math.max(0, prev.y))
        };
      });
    };

    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, [isMounted]);

  // 键盘快捷键
  useEffect(() => {
    if (!isMounted) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        setIsOpen(!isOpen);
      }

      if (e.key === 'Escape') {
        setIsOpen(false);
        setIsExpanded(false);
        setShowSettings(false);
        setShowHelp(false);
        setShowShortcuts(false);
      }

      shortcuts.forEach(shortcut => {
        if (shortcut.hotkey && matchesHotkey(e, shortcut.hotkey)) {
          e.preventDefault();
          executeQuickAction(shortcut);
        }
      });
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isMounted, isOpen, shortcuts]);

  // 拖拽功能
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setDragState({
      isDragging: true,
      dragStart: { x: e.clientX, y: e.clientY },
      initialPosition: { ...position }
    });
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragState.isDragging || !dragState.dragStart || !dragState.initialPosition) return;

    const deltaX = e.clientX - dragState.dragStart.x;
    const deltaY = e.clientY - dragState.dragStart.y;

    const newPosition = {
      x: dragState.initialPosition.x + deltaX,
      y: dragState.initialPosition.y + deltaY
    };

    const width = window.innerWidth;
    const height = window.innerHeight;

    let finalX = newPosition.x;
    let finalY = newPosition.y;

    if (newPosition.x < EDGE_THRESHOLD) {
      finalX = 0;
    } else if (newPosition.x > width - EDGE_THRESHOLD - FLOATING_BUTTON_SIZE) {
      finalX = width - FLOATING_BUTTON_SIZE;
    }

    if (newPosition.y < EDGE_THRESHOLD) {
      finalY = 0;
    } else if (newPosition.y > height - EDGE_THRESHOLD - FLOATING_BUTTON_SIZE) {
      finalY = height - FLOATING_BUTTON_SIZE;
    }

    setPosition({
      x: Math.max(0, Math.min(width - FLOATING_BUTTON_SIZE, finalX)),
      y: Math.max(0, Math.min(height - FLOATING_BUTTON_SIZE, finalY))
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
    setIsExpanded(false);
  }, [isOpen]);

  // 显示帮助信息
  const toggleHelp = useCallback(() => {
    setShowHelp(!showHelp);
    setShowShortcuts(false);
    setShowSettings(false);
  }, [showHelp]);

  // 显示快捷键
  const toggleShortcuts = useCallback(() => {
    setShowShortcuts(!showShortcuts);
    setShowHelp(false);
    setShowSettings(false);
  }, [showShortcuts]);

  // 显示设置
  const toggleSettings = useCallback(() => {
    setShowSettings(!showSettings);
    setShowHelp(false);
    setShowShortcuts(false);
  }, [showSettings]);

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
    console.log('Executing quick action:', shortcut);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 100));
      
      switch (shortcut.action) {
        case 'navigate_payroll':
          window.location.href = '/payroll';
          break;
        case 'navigate_leave':
          window.location.href = '/leave';
          break;
        case 'navigate_invoices':
          window.location.href = '/invoices';
          break;
        case 'export_current_data':
          console.log('Exporting data with format:', shortcut.params?.format);
          break;
        default:
          console.log('Unknown action:', shortcut.action);
      }
    } catch (error) {
      console.error('Error executing quick action:', error);
      throw new Error(`执行快捷操作失败: ${shortcut.title}`);
    }
  };

  // 重要通知检测
  const hasImportantNotifications = (): boolean => {
    return predictions.some(p => p.severity === 'high' || p.severity === 'critical');
  };

  // 获取通知数量
  const getNotificationCount = (): number => {
    return predictions.filter(p => !p.isDismissed).length;
  };

  // 计算面板位置 - 确保在可视区域内
  const getPanelPosition = (panelWidth: number, panelHeight: number, preferredPosition: 'top' | 'bottom' | 'left' | 'right' = 'top'): Position => {
    const spacing = 12;
    let x = position.x;
    let y = position.y;
    const width = window.innerWidth;
    const height = window.innerHeight;

    switch (preferredPosition) {
      case 'top':
        y = position.y - panelHeight - spacing;
        x = position.x;
        if (y < spacing) {
          y = position.y + FLOATING_BUTTON_SIZE + spacing;
        }
        break;
      case 'bottom':
        y = position.y + FLOATING_BUTTON_SIZE + spacing;
        x = position.x;
        if (y + panelHeight > height - spacing) {
          y = position.y - panelHeight - spacing;
        }
        break;
      case 'left':
        x = position.x - panelWidth - spacing;
        y = position.y;
        if (x < spacing) {
          x = position.x + FLOATING_BUTTON_SIZE + spacing;
        }
        break;
      case 'right':
        x = position.x + FLOATING_BUTTON_SIZE + spacing;
        y = position.y;
        if (x + panelWidth > width - spacing) {
          x = position.x - panelWidth - spacing;
        }
        break;
    }

    if (x + panelWidth > width - spacing) {
      x = width - panelWidth - spacing;
    }
    if (x < spacing) {
      x = spacing;
    }
    if (y + panelHeight > height - spacing) {
      y = height - panelHeight - spacing;
    }
    if (y < spacing) {
      y = spacing;
    }

    return { x, y };
  };

  if (!isMounted) {
    return null;
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {/* 帮助信息面板 */}
      {showHelp && (() => {
        const panelPos = getPanelPosition(320, 240, 'left');
        return (
          <div 
            className="pointer-events-auto bg-white rounded-lg shadow-xl border p-4 w-80"
            style={{
              position: 'fixed',
              left: panelPos.x,
              top: panelPos.y,
              zIndex: 60
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">使用帮助</h3>
              <button
                onClick={() => setShowHelp(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              <p>• 拖拽悬浮球可以调整位置</p>
              <p>• Ctrl+Shift+C 快速打开/关闭</p>
              <p>• ESC 键关闭所有面板</p>
              <p>• 支持文件上传和智能分析</p>
              <p>• 点击快捷操作快速导航</p>
            </div>
          </div>
        );
      })()}

      {/* 快捷键面板 */}
      {showShortcuts && (() => {
        const panelPos = getPanelPosition(320, 240, 'left');
        return (
          <div 
            className="pointer-events-auto bg-white rounded-lg shadow-xl border p-4 w-80"
            style={{
              position: 'fixed',
              left: panelPos.x,
              top: panelPos.y,
              zIndex: 60
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">快捷键列表</h3>
              <button
                onClick={() => setShowShortcuts(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">打开/关闭 Copilot:</span>
                <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Ctrl+Shift+C</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">聚焦输入框:</span>
                <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Ctrl+Shift+F</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">快捷操作:</span>
                <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Ctrl+Shift+A</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">关闭所有面板:</span>
                <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">ESC</kbd>
              </div>
            </div>
          </div>
        );
      })()}

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
      {showSettings && (() => {
        const panelPos = getPanelPosition(320, 400, 'left');
        return (
          <div
            style={{
              position: 'fixed',
              left: panelPos.x,
              top: panelPos.y,
              zIndex: 60
            }}
          >
            <CopilotSettings
              onClose={() => setShowSettings(false)}
              className="pointer-events-auto"
            />
          </div>
        );
      })()}

      {/* 主聊天面板 */}
      {isOpen && (() => {
        const panelPos = getPanelPosition(384, 600, 'top');
        return (
          <div 
            className="pointer-events-auto"
            style={{
              position: 'fixed',
              left: panelPos.x,
              top: panelPos.y,
              zIndex: 60
            }}
          >
            <CopilotChatPanel
              context={context}
              shortcuts={shortcuts}
              onClose={() => setIsOpen(false)}
              className="mb-4"
            />
          </div>
        );
      })()}

      {/* 悬浮球和控制按钮 */}
      <div 
        className="absolute pointer-events-auto" 
        style={{ 
          left: position.x, 
          top: position.y,
          zIndex: 55 
        }}
      >
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
            onClick={toggleSettings}
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
            onClick={toggleHelp}
            className={cn(
              "w-8 h-8 rounded-full bg-white shadow-lg border flex items-center justify-center",
              "hover:bg-gray-50 transition-all duration-200",
              showHelp ? "bg-green-50 border-green-200" : ""
            )}
            title="帮助"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* 快捷键提示 */}
          <button
            onClick={toggleShortcuts}
            className={cn(
              "w-8 h-8 rounded-full bg-white shadow-lg border flex items-center justify-center",
              "hover:bg-gray-50 transition-all duration-200",
              showShortcuts ? "bg-purple-50 border-purple-200" : ""
            )}
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
