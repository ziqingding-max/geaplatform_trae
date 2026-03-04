import { useState, useEffect, useCallback } from 'react';
import { MessageCircle, X, Settings, Keyboard, HelpCircle, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCopilot } from '@/hooks/useCopilot';
import { CopilotChatPanel } from './CopilotChatPanel';
import { CopilotSettings } from './CopilotSettings';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function CopilotDrawer() {
  const [isOpen, setIsOpen] = useState(false);
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

  const HelpContent = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="font-semibold text-lg">使用帮助</h3>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>• 点击右侧Copilot图标或使用快捷键 Ctrl+Shift+C 打开</p>
          <p>• 支持文件上传和智能分析</p>
          <p>• 点击快捷操作快速导航</p>
          <p>• 按 ESC 键关闭面板</p>
        </div>
      </div>
    </div>
  );

  const ShortcutsContent = () => (
    <div className="space-y-4">
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
            <span className="text-sm text-muted-foreground">关闭面板:</span>
            <kbd className="px-2 py-1 bg-muted rounded text-xs">ESC</kbd>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* 触发按钮 - 固定在右下角 */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <button
            className={cn(
              "fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-purple-600",
              "shadow-lg cursor-pointer transition-all duration-300 hover:scale-110",
              "flex items-center justify-center text-white relative z-40"
            )}
          >
            <Bot className="w-6 h-6" />
            
            {getNotificationCount() > 0 && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                {getNotificationCount() > 9 ? '9+' : getNotificationCount()}
              </div>
            )}

            {hasImportantNotifications() && (
              <div className="absolute inset-0 rounded-full bg-red-500 opacity-30 animate-ping" />
            )}
          </button>
        </SheetTrigger>

        <SheetContent side="right" className="w-full sm:max-w-md p-0">
          <SheetHeader className="p-4 border-b">
            <div className="flex items-center justify-between">
              <SheetTitle className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-primary" />
                Copilot 智能助手
              </SheetTitle>
            </div>
          </SheetHeader>

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex-1">
            <TabsList className="w-full grid grid-cols-4 px-4 pt-2">
              <TabsTrigger value="chat" className="flex items-center gap-1">
                <MessageCircle className="w-4 h-4" />
                <span className="hidden sm:inline">聊天</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-1">
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">设置</span>
              </TabsTrigger>
              <TabsTrigger value="help" className="flex items-center gap-1">
                <HelpCircle className="w-4 h-4" />
                <span className="hidden sm:inline">帮助</span>
              </TabsTrigger>
              <TabsTrigger value="shortcuts" className="flex items-center gap-1">
                <Keyboard className="w-4 h-4" />
                <span className="hidden sm:inline">快捷键</span>
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-hidden">
              <TabsContent value="chat" className="h-[calc(100vh-140px)] p-0 m-0">
                <CopilotChatPanel
                  onClose={() => setIsOpen(false)}
                  embedded={true}
                />
              </TabsContent>

              <TabsContent value="settings" className="h-[calc(100vh-140px)] overflow-auto p-4 m-0">
                <CopilotSettings onClose={() => {}} />
              </TabsContent>

              <TabsContent value="help" className="h-[calc(100vh-140px)] overflow-auto p-4 m-0">
                <HelpContent />
              </TabsContent>

              <TabsContent value="shortcuts" className="h-[calc(100vh-140px)] overflow-auto p-4 m-0">
                <ShortcutsContent />
              </TabsContent>
            </div>
          </Tabs>
        </SheetContent>
      </Sheet>
    </>
  );
}
