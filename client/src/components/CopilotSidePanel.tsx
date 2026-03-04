import { useState, useEffect } from 'react';
import { Bot, X, MessageCircle, Settings, HelpCircle, Keyboard, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCopilot } from '@/hooks/useCopilot';
import { CopilotChatPanel } from './CopilotChatPanel';
import { CopilotSettings } from './CopilotSettings';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const PANEL_WIDTH = 380;
const MINIMIZED_WIDTH = 60;

export function CopilotSidePanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'settings' | 'help' | 'shortcuts'>('chat');
  const { context, predictions, shortcuts, isLoading, initialize } = useCopilot();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        setIsOpen(!isOpen);
        if (!isOpen) setIsMinimized(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const getNotificationCount = (): number => {
    return predictions.filter(p => !p.isDismissed).length;
  };

  const hasImportantNotifications = (): boolean => {
    return predictions.some(p => p.severity === 'high' || p.severity === 'critical');
  };

  const togglePanel = () => {
    setIsOpen(!isOpen);
    if (!isOpen) setIsMinimized(false);
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const HelpContent = () => (
    <div className="space-y-4 p-4">
      <div className="space-y-2">
        <h3 className="font-semibold text-lg">使用帮助</h3>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>• 点击右侧按钮或使用快捷键 Ctrl+Shift+C 打开</p>
          <p>• 支持文件上传和智能分析</p>
          <p>• 点击快捷操作快速导航</p>
          <p>• 按 ESC 键最小化面板</p>
        </div>
      </div>
    </div>
  );

  const ShortcutsContent = () => (
    <div className="space-y-4 p-4">
      <div className="space-y-2">
        <h3 className="font-semibold text-lg">快捷键列表</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">打开/关闭 Copilot:</span>
            <kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl+Shift+C</kbd>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">聚焦输入框:</span>
            <kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl+Shift+F</kbd>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">快捷操作:</span>
            <kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl+Shift+A</kbd>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">最小化面板:</span>
            <kbd className="px-2 py-1 bg-muted rounded text-xs">ESC</kbd>
          </div>
        </div>
      </div>
    </div>
  );

  if (!isOpen) {
    return (
      <button
        onClick={togglePanel}
        className={cn(
          "fixed right-0 top-1/2 -translate-y-1/2 w-12 h-20 rounded-l-lg shadow-lg",
          "bg-gradient-to-b from-blue-500 to-purple-600 text-white",
          "flex items-center justify-center cursor-pointer transition-all duration-300",
          "hover:w-14 hover:from-blue-600 hover:to-purple-700 z-40"
        )}
        title="打开 Copilot (Ctrl+Shift+C)"
      >
        <div className="flex flex-col items-center gap-1">
          <Bot className="w-5 h-5" />
          {getNotificationCount() > 0 && (
            <div className="absolute -top-1 -left-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
              {getNotificationCount() > 9 ? '9+' : getNotificationCount()}
            </div>
          )}
          {hasImportantNotifications() && (
            <div className="absolute inset-0 rounded-l-lg bg-red-500 opacity-20 animate-pulse" />
          )}
        </div>
      </button>
    );
  }

  return (
    <div
      className={cn(
        "fixed top-0 right-0 h-full bg-background border-l shadow-xl z-40 transition-all duration-300 flex flex-col",
        isMinimized ? "w-16" : `w-[${PANEL_WIDTH}px]`
      )}
      style={{ width: isMinimized ? MINIMIZED_WIDTH : PANEL_WIDTH }}
    >
      {isMinimized ? (
        <div className="flex flex-col h-full items-center py-4 gap-4">
          <button
            onClick={toggleMinimize}
            className="p-2 hover:bg-muted rounded-md transition-colors"
            title="展开面板"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="flex-1 flex flex-col gap-3">
            <button
              onClick={() => { setActiveTab('chat'); setIsMinimized(false); }}
              className={cn(
                "p-2 rounded-md transition-colors",
                activeTab === 'chat' ? "bg-primary text-primary-foreground" : "hover:bg-muted"
              )}
              title="聊天"
            >
              <MessageCircle className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => { setActiveTab('settings'); setIsMinimized(false); }}
              className={cn(
                "p-2 rounded-md transition-colors",
                activeTab === 'settings' ? "bg-primary text-primary-foreground" : "hover:bg-muted"
              )}
              title="设置"
            >
              <Settings className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => { setActiveTab('help'); setIsMinimized(false); }}
              className={cn(
                "p-2 rounded-md transition-colors",
                activeTab === 'help' ? "bg-primary text-primary-foreground" : "hover:bg-muted"
              )}
              title="帮助"
            >
              <HelpCircle className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => { setActiveTab('shortcuts'); setIsMinimized(false); }}
              className={cn(
                "p-2 rounded-md transition-colors",
                activeTab === 'shortcuts' ? "bg-primary text-primary-foreground" : "hover:bg-muted"
              )}
              title="快捷键"
            >
              <Keyboard className="w-5 h-5" />
            </button>
          </div>
          
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-muted rounded-md transition-colors text-muted-foreground"
            title="关闭"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between p-4 border-b flex-shrink-0">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-primary" />
              <span className="font-semibold">Copilot 智能助手</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={toggleMinimize}
                className="p-1.5 hover:bg-muted rounded-md transition-colors"
                title="最小化"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-muted rounded-md transition-colors"
                title="关闭"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="w-full grid grid-cols-4 px-4 pt-2 flex-shrink-0">
              <TabsTrigger value="chat" className="flex items-center gap-1">
                <MessageCircle className="w-4 h-4" />
                <span className="text-xs">聊天</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-1">
                <Settings className="w-4 h-4" />
                <span className="text-xs">设置</span>
              </TabsTrigger>
              <TabsTrigger value="help" className="flex items-center gap-1">
                <HelpCircle className="w-4 h-4" />
                <span className="text-xs">帮助</span>
              </TabsTrigger>
              <TabsTrigger value="shortcuts" className="flex items-center gap-1">
                <Keyboard className="w-4 h-4" />
                <span className="text-xs">快捷键</span>
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-hidden">
              <TabsContent value="chat" className="h-full p-0 m-0">
                <CopilotChatPanel
                  onClose={() => setIsMinimized(true)}
                  embedded={true}
                />
              </TabsContent>

              <TabsContent value="settings" className="h-full overflow-auto p-4 m-0">
                <CopilotSettings onClose={() => {}} />
              </TabsContent>

              <TabsContent value="help" className="h-full overflow-auto p-4 m-0">
                <HelpContent />
              </TabsContent>

              <TabsContent value="shortcuts" className="h-full overflow-auto p-4 m-0">
                <ShortcutsContent />
              </TabsContent>
            </div>
          </Tabs>
        </>
      )}
    </div>
  );
}
