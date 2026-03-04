import { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Upload, Image, FileText, X, Settings, Download, Copy, RefreshCw, Paperclip } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCopilotChat } from '@/hooks/useCopilot';
import { CopilotTypingIndicator } from './CopilotTypingIndicator';
import { CopilotSuggestedActions } from './CopilotSuggestedActions';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  attachments?: Array<{
    type: 'image' | 'file';
    url: string;
    name: string;
    mimeType?: string;
  }>;
  metadata?: any;
  createdAt: Date;
}

interface CopilotChatPanelProps {
  onClose: () => void;
  className?: string;
  position?: { x: number; y: number };
  embedded?: boolean;
}

// XSS防护函数
function sanitizeContent(content: string): string {
  return content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/data:text\/html/gi, '')
    .trim();
}

// 安全的消息内容渲染组件
function SafeMessageContent({ content }: { content: string }) {
  const sanitizedContent = sanitizeContent(content);
  
  return (
    <div className="whitespace-pre-wrap">
      {sanitizedContent}
    </div>
  );
}

export function CopilotChatPanel({ onClose, className, position, embedded = false }: CopilotChatPanelProps) {
  const { messages, isLoading, error, sendMessage, clearHistory } = useCopilotChat();
  const [inputValue, setInputValue] = useState('');
  const [attachments, setAttachments] = useState<Array<{ type: 'image' | 'file'; url: string; name: string; mimeType?: string }>>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 滚动到底部
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // 聚焦输入框
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'F') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 发送消息
  const handleSendMessage = async () => {
    if (!inputValue.trim() && attachments.length === 0) return;

    // 输入验证
    if (inputValue.length > 5000) {
      alert('消息内容过长，请控制在5000字符以内');
      return;
    }

    try {
      setIsTyping(true);
      const sanitizedInput = sanitizeContent(inputValue);
      await sendMessage(sanitizedInput, attachments);
      setInputValue('');
      setAttachments([]);
    } catch (error) {
      console.error('发送消息失败:', error);
      alert('发送消息失败，请稍后重试');
    } finally {
      setIsTyping(false);
    }
  };

  // 处理键盘事件
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // 清空对话
  const handleClearHistory = async () => {
    if (confirm('确定要清空对话历史吗？')) {
      try {
        await clearHistory();
      } catch (error) {
        console.error('清空历史失败:', error);
        alert('清空历史失败，请稍后重试');
      }
    }
  };

  // 导出对话
  const handleExportConversation = () => {
    try {
      const conversationText = messages.map(msg => 
        `${msg.role.toUpperCase()}: ${sanitizeContent(msg.content)}`
      ).join('\n\n');
      
      const blob = new Blob([conversationText], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `copilot-conversation-${new Date().toISOString().slice(0, 10)}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('导出对话失败:', error);
      alert('导出对话失败，请稍后重试');
    }
  };

  // 复制消息
  const handleCopyMessage = async (content: string) => {
    try {
      const sanitizedContent = sanitizeContent(content);
      await navigator.clipboard.writeText(sanitizedContent);
      alert('消息已复制到剪贴板');
    } catch (error) {
      console.error('复制消息失败:', error);
      alert('复制消息失败，请手动复制');
    }
  };

  // 处理文件上传
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const validFiles: Array<{ type: 'image' | 'file'; url: string; name: string; mimeType?: string }> = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // 文件大小限制：10MB
      if (file.size > 10 * 1024 * 1024) {
        alert(`文件 ${file.name} 超过10MB限制，已跳过`);
        continue;
      }
      
      // 文件类型验证
      const allowedTypes = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'application/pdf', 'text/plain', 'text/csv',
        'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ];
      
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      const isAllowed = allowedTypes.includes(file.type) || 
        ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf', 'txt', 'csv', 'xls', 'xlsx'].includes(fileExt || '');
      
      if (!isAllowed) {
        alert(`文件 ${file.name} 类型不支持，已跳过`);
        continue;
      }
      
      validFiles.push({
        type: file.type.startsWith('image/') ? 'image' : 'file',
        url: URL.createObjectURL(file),
        name: file.name,
        mimeType: file.type
      });
    }

    setAttachments(prev => [...prev, ...validFiles]);
    
    // 重置 input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div 
      className={cn(
        embedded 
          ? "flex flex-col h-full" 
          : "bg-white rounded-lg shadow-xl border w-96 h-[600px] flex flex-col",
        className
      )}
      style={position && !embedded ? { position: 'absolute', left: position.x, top: position.y } : {}}
    >
      {!embedded && (
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">AI</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">欢迎使用 Copilot 助手</h3>
              <p className="text-xs text-gray-600">智能企业助手</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportConversation}
              className="p-2 hover:bg-white/50 rounded-lg transition-colors"
              title="导出对话"
            >
              <Download className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={handleClearHistory}
              className="p-2 hover:bg-white/50 rounded-lg transition-colors"
              title="清空历史"
            >
              <RefreshCw className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/50 rounded-lg transition-colors"
              title="关闭"
            >
              <X className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
      )}

      {/* 消息区域 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-blue-600 text-2xl">🤖</span>
            </div>
            <h3 className="font-medium mb-2">欢迎使用 Copilot 助手</h3>
            <p className="text-sm text-center mb-4">我可以帮助您分析数据、解答问题、处理文件等。</p>
            <div className="text-xs text-gray-400">快捷键: Ctrl+Shift+F 聚焦输入框</div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div key={message.id} className={cn("flex", message.role === 'user' ? 'justify-end' : 'justify-start')}>
                <div className={cn(
                  "max-w-[80%] rounded-lg p-3",
                  message.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-900'
                )}>
                  {message.role === 'assistant' && (
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">AI</span>
                      </div>
                      <span className="text-xs opacity-70">Copilot</span>
                    </div>
                  )}
                  <div className="flex-1">
                    <SafeMessageContent content={message.content} />
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="mt-2 space-y-2">
                        {message.attachments.map((attachment, idx) => (
                          <div key={idx} className="flex items-center gap-2 p-2 bg-white/20 rounded">
                            {attachment.type === 'image' ? 
                              <Image className="w-4 h-4" /> : 
                              <FileText className="w-4 h-4" />
                            }
                            <span className="text-sm">{attachment.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs opacity-70">
                        {new Date(message.createdAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <button
                        onClick={() => handleCopyMessage(message.content)}
                        className="p-1 hover:bg-white/20 rounded transition-colors"
                        title="复制消息"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
        {isTyping && <CopilotTypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="px-4 py-2 bg-red-50 border-t border-red-200">
          <p className="text-sm text-red-600">发送消息失败，请稍后重试</p>
        </div>
      )}

      {/* 输入区域 */}
      <div className="border-t p-4">
        {/* 附件预览 */}
        {attachments.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {attachments.map((attachment, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-gray-100 rounded-lg p-2">
                {attachment.type === 'image' ? 
                  <Image className="w-4 h-4" /> : 
                  <FileText className="w-4 h-4" />
                }
                <span className="text-sm">{attachment.name}</span>
                <button
                  onClick={() => setAttachments(prev => prev.filter((_, i) => i !== idx))}
                  className="p-1 hover:bg-gray-200 rounded"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
        
        <div className="flex items-end gap-2">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,.pdf,.txt,.csv,.xls,.xlsx,.doc,.docx"
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
            title="上传文件"
            disabled={isLoading}
          >
            <Paperclip className="w-5 h-5" />
          </button>
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入消息... (Shift+Enter 换行)"
            className="flex-1 resize-none border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 max-h-32"
            rows={1}
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || (!inputValue.trim() && attachments.length === 0)}
            className={cn(
              "p-2 rounded-lg transition-colors",
              isLoading || (!inputValue.trim() && attachments.length === 0)
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-blue-500 text-white hover:bg-blue-600"
            )}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        
        <div className="mt-2 text-xs text-gray-500 flex justify-between">
          <span>快捷键: Ctrl+Shift+F 聚焦输入框</span>
          <span>Shift+Enter 换行</span>
        </div>
      </div>
    </div>
  );
}