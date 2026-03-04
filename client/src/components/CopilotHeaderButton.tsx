import { useState, useEffect } from 'react';
import { Bot, X, MessageCircle, Settings, HelpCircle, Keyboard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCopilot } from '@/hooks/useCopilot';
import { CopilotChatPanel } from './CopilotChatPanel';
import { CopilotSettings } from './CopilotSettings';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function CopilotHeaderButton() {
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
          <p>• 点击顶部导航栏的Copilot图标或使用快捷键 Ctrl+Shift+C 打开</p>
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
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors",
            "hover:bg-muted hover:text-foreground text-muted-foreground",
            hasImportantNotifications() && "bg-red-50 text-red-600 hover:bg-red-100"
          )}
          title="Copilot 智能助手"
        >
          <div className="relative">
            <Bot className="w-4 h-4" />
            {getNotificationCount() > 0 && (
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold">
                {getNotificationCount() > 9 ? '9+' : getNotificationCount()}
              </div>
            )}
          </div>
          <span className="hidden md:block">Copilot</span>
        </button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-2xl w-[95vw] h-[85vh] p-0 flex flex-col">
        <DialogHeader className="p-4 border-b flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-primary" />
            Copilot 智能助手
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="w-full grid grid-cols-4 px-4 pt-2 flex-shrink-0">
            <TabsTrigger value="chat" className="flex items-center gap-1">
              <MessageCircle className="w-4 h-4" />
              <span>聊天</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-1">
              <Settings className="w-4 h-4" />
              <span>设置</span>
            </TabsTrigger>
            <TabsTrigger value="help" className="flex items-center gap-1">
              <HelpCircle className="w-4 h-4" />
              <span>帮助</span>
            </TabsTrigger>
            <TabsTrigger value="shortcuts" className="flex items-center gap-1">
              <Keyboard className="w-4 h-4" />
              <span>快捷键</span>
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-hidden">
            <TabsContent value="chat" className="h-full p-0 m-0">
              <CopilotChatPanel
                onClose={() => setIsOpen(false)}
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
      </DialogContent>
    </Dialog>
  );
}
