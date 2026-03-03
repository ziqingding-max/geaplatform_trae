import { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Upload, Image, FileText, X, Settings, Download, Copy, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCopilotChat } from '@/hooks/useCopilot';
import { CopilotFileUpload } from './CopilotFileUpload';
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
}

export function CopilotChatPanel({ onClose, className, position }: CopilotChatPanelProps) {
  const { messages, isLoading, error, sendMessage, clearHistory } = useCopilotChat();
  const [inputMessage, setInputMessage] = useState('');
  const [attachments, setAttachments] = useState<Array<{
    type: 'image' | 'file';
    url: string;
    name: string;
    mimeType?: string;
  }>>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // 建议操作
  const suggestedActions = [
    { title: '查看今日数据', action: 'view_today_data' },
    { title: '导出报表', action: 'export_report' },
    { title: '查看待办事项', action: 'view_todos' },
  ];

  // 滚动到底部
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // 处理文件上传
  const handleFileUpload = (files: File[]) => {
    const newAttachments = files.map(file => ({
      type: file.type.startsWith('image/') ? 'image' as const : 'file' as const,
      url: URL.createObjectURL(file),
      name: file.name,
      mimeType: file.type,
    }));
    setAttachments(prev => [...prev, ...newAttachments]);
  };

  // 移除附件
  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  // 发送消息
  const handleSendMessage = async () => {
    if (!inputMessage.trim() && attachments.length === 0) return;

    try {
      setIsTyping(true);
      await sendMessage({
        message: inputMessage,
        attachments: attachments.length > 0 ? attachments : undefined,
      });
      
      setInputMessage('');
      setAttachments([]);
    } catch (error) {
      console.error('Failed to send message:', error);
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
      await clearHistory();
    }
  };

  // 导出对话
  const handleExportConversation = () => {
    const conversationText = messages.map(msg => 
      `${msg.role.toUpperCase()}: ${msg.content}`
    ).join('\n\n');
    
    const blob = new Blob([conversationText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `copilot-conversation-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 复制消息
  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  // 聚焦输入框
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // 快捷键支持
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'f') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  return (
    <div 
      className={cn(
        "bg-white rounded-lg shadow-xl border w-96 h-[600px] flex flex-col",
        className
      )}
      style={position ? { position: 'absolute', left: position.x, top: position.y } : {}}
    >
      {/* 头部 */}
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-bold">AI</span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Copilot 助手</h3>
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
                  message.role === 'user' 
                    ? "bg-blue-500 text-white" 
                    : message.role === 'assistant'
                    ? "bg-gray-100 text-gray-900"
                    : "bg-yellow-100 text-yellow-800"
                )}>
                  <div className="flex items-start gap-2">
                    {message.role === 'assistant' && (
                      <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs">AI</span>
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="whitespace-pre-wrap">{message.content}</div>
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
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg p-3 max-w-[80%]">
                  <CopilotTypingIndicator />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* 建议操作 */}
      {suggestedActions.length > 0 && (
        <CopilotSuggestedActions
          shortcuts={suggestedActions}
          onExecute={(action, params) => {
            console.log('执行操作:', action, params);
          }}
          className="border-t"
        />
      )}

      {/* 输入区域 */}
      <div className="border-t p-4">
        {/* 附件预览 */}
        {attachments.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {attachments.map((attachment, index) => (
              <div key={index} className="flex items-center gap-2 p-2 bg-gray-100 rounded-lg">
                {attachment.type === 'image' ? 
                  <Image className="w-4 h-4" /> : 
                  <FileText className="w-4 h-4" />
                }
                <span className="text-sm text-gray-700">{attachment.name}</span>
                <button
                  onClick={() => removeAttachment(index)}
                  className="p-1 hover:bg-gray-200 rounded"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-end gap-2">
          <div className="flex gap-2">
            <CopilotFileUpload
              onFileSelect={handleFileUpload}
              accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
              maxSize={10 * 1024 * 1024} // 10MB
            >
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="上传文件">
                <Upload className="w-5 h-5 text-gray-600" />
              </button>
            </CopilotFileUpload>
          </div>
          
          <div className="flex-1">
            <textarea
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="输入消息或上传文件..."
              className="w-full p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={2}
              disabled={isLoading}
            />
          </div>
          
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() && attachments.length === 0 || isLoading}
            className={cn(
              "p-3 rounded-lg transition-colors",
              (!inputMessage.trim() && attachments.length === 0) || isLoading
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-blue-500 text-white hover:bg-blue-600"
            )}
            title="发送消息 (Enter)"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>

        {error && (
          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}