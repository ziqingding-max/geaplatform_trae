import { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Upload, Image, FileText, X, Settings, Download, Copy, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCopilotChat } from '@/hooks/useCopilotChat';
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
  metadata?: {
    taskType?: string;
    providerUsed?: string;
    modelUsed?: string;
    costEstimate?: number;
    processingTime?: number;
  };
  createdAt: Date;
}

interface CopilotChatPanelProps {
  context?: any;
  shortcuts?: any[];
  onClose: () => void;
  className?: string;
}

export function CopilotChatPanel({ context, shortcuts, onClose, className }: CopilotChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [attachments, setAttachments] = useState<Array<{
    type: 'image' | 'file';
    url: string;
    name: string;
    mimeType?: string;
  }>>([]);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { sendMessage, isLoading, error } = useCopilotChat();

  // 初始化聊天历史
  useEffect(() => {
    loadChatHistory();
  }, []);

  // 自动滚动到底部
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // 聚焦输入框
  useEffect(() => {
    if (!isLoading) {
      inputRef.current?.focus();
    }
  }, [isLoading]);

  // 加载聊天历史
  const loadChatHistory = async () => {
    try {
      // 这里可以从后端加载历史消息
      const history = await fetchChatHistory();
      setMessages(history);
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  };

  // 获取聊天历史
  const fetchChatHistory = async (): Promise<Message[]> => {
    // 实现获取历史消息的逻辑
    return [];
  };

  // 滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 发送消息
  const handleSendMessage = async () => {
    if (!inputValue.trim() && attachments.length === 0) return;
    if (isLoading) return;

    const userMessage: Message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      role: 'user',
      content: inputValue.trim(),
      attachments: attachments.length > 0 ? [...attachments] : undefined,
      createdAt: new Date(),
    };

    // 添加用户消息
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setAttachments([]);
    setIsTyping(true);

    try {
      // 发送消息到后端
      const response = await sendMessage({
        message: userMessage.content,
        attachments: userMessage.attachments,
        context,
      });

      // 添加AI响应
      const assistantMessage: Message = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        role: 'assistant',
        content: response.text,
        metadata: {
          taskType: response.taskType,
          providerUsed: response.providerUsed,
          modelUsed: response.modelUsed,
          costEstimate: response.costEstimate,
          processingTime: response.processingTime,
        },
        createdAt: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);

      // 处理建议操作
      if (response.suggestedActions && response.suggestedActions.length > 0) {
        // 可以在这里显示建议操作
      }

    } catch (error) {
      console.error('Failed to send message:', error);
      
      // 添加错误消息
      const errorMessage: Message = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        role: 'system',
        content: '抱歉，处理消息时出现错误。请稍后重试。',
        createdAt: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  // 处理文件上传
  const handleFileUpload = (files: Array<{
    type: 'image' | 'file';
    url: string;
    name: string;
    mimeType?: string;
  }>) => {
    setAttachments(prev => [...prev, ...files]);
    setShowFileUpload(false);
  };

  // 移除附件
  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  // 复制消息内容
  const copyMessage = (message: Message) => {
    navigator.clipboard.writeText(message.content);
    // 可以添加复制成功的提示
  };

  // 重新生成响应
  const regenerateResponse = (message: Message) => {
    // 实现重新生成逻辑
    console.log('Regenerating response for:', message);
  };

  // 导出对话
  const exportConversation = () => {
    const conversationText = messages
      .map(msg => `${msg.role.toUpperCase()}: ${msg.content}`)
      .join('\n\n');
    
    const blob = new Blob([conversationText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `copilot-conversation-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 清空对话
  const clearConversation = async () => {
    if (window.confirm('确定要清空当前对话吗？')) {
      setMessages([]);
      // 可以调用后端清空对话历史
    }
  };

  // 处理快捷键
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // 渲染消息
  const renderMessage = (message: Message) => {
    const isUser = message.role === 'user';
    const isSystem = message.role === 'system';

    return (
      <div
        key={message.id}
        className={cn(
          "flex mb-4",
          isUser ? "justify-end" : "justify-start",
          isSystem && "justify-center"
        )}
      >
        <div
          className={cn(
            "max-w-[80%] rounded-lg px-4 py-2",
            isUser
              ? "bg-blue-500 text-white"
              : isSystem
              ? "bg-gray-100 text-gray-600 text-sm"
              : "bg-gray-200 text-gray-800"
          )}
        >
          {/* 附件 */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="mb-2 space-y-2">
              {message.attachments.map((attachment, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-white/20 rounded">
                  {attachment.type === 'image' ? (
                    <Image className="w-4 h-4" />
                  ) : (
                    <FileText className="w-4 h-4" />
                  )}
                  <span className="text-sm truncate">{attachment.name}</span>
                </div>
              ))}
            </div>
          )}

          {/* 消息内容 */}
          <div className="whitespace-pre-wrap">{message.content}</div>

          {/* 元信息 */}
          {message.metadata && (
            <div className="mt-2 text-xs opacity-70">
              <div className="flex items-center gap-2 flex-wrap">
                {message.metadata.taskType && (
                  <span>任务: {message.metadata.taskType}</span>
                )}
                {message.metadata.providerUsed && (
                  <span>模型: {message.metadata.providerUsed}</span>
                )}
                {message.metadata.costEstimate && (
                  <span>成本: ¥{message.metadata.costEstimate.toFixed(4)}</span>
                )}
                {message.metadata.processingTime && (
                  <span>耗时: {(message.metadata.processingTime / 1000).toFixed(1)}s</span>
                )}
              </div>
            </div>
          )}

          {/* 时间戳 */}
          <div className="mt-1 text-xs opacity-50">
            {message.createdAt.toLocaleTimeString()}
          </div>

          {/* 操作按钮 */}
          {!isUser && !isSystem && (
            <div className="mt-2 flex items-center gap-1">
              <button
                onClick={() => copyMessage(message)}
                className="p-1 hover:bg-white/20 rounded"
                title="复制"
              >
                <Copy className="w-3 h-3" />
              </button>
              <button
                onClick={() => regenerateResponse(message)}
                className="p-1 hover:bg-white/20 rounded"
                title="重新生成"
              >
                <RefreshCw className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={cn("fixed bottom-20 right-5 w-96 h-[500px] bg-white rounded-lg shadow-2xl z-50 flex flex-col", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          <span className="font-semibold">GEA Copilot</span>
          {error && (
            <span className="text-xs bg-red-500 px-2 py-1 rounded">错误</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* 导出按钮 */}
          <button
            onClick={exportConversation}
            className="p-1 hover:bg-white/20 rounded"
            title="导出对话"
          >
            <Download className="w-4 h-4" />
          </button>
          
          {/* 清空按钮 */}
          <button
            onClick={clearConversation}
            className="p-1 hover:bg-white/20 rounded"
            title="清空对话"
          >
            <X className="w-4 h-4" />
          </button>
          
          {/* 设置按钮 */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={cn(
              "p-1 hover:bg-white/20 rounded",
              showSettings && "bg-white/20"
            )}
            title="设置"
          >
            <Settings className="w-4 h-4" />
          </button>
          
          {/* 关闭按钮 */}
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 设置面板 */}
      {showSettings && (
        <div className="p-4 border-b bg-gray-50">
          <div className="text-sm text-gray-600 mb-2">设置选项</div>
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input type="checkbox" defaultChecked />
              <span className="text-sm">显示成本信息</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" defaultChecked />
              <span className="text-sm">显示处理时间</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" />
              <span className="text-sm">自动保存对话</span>
            </label>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <MessageCircle className="w-12 h-12 mb-4 opacity-50" />
            <p className="text-center mb-2">开始与Copilot对话</p>
            <p className="text-center text-sm opacity-75">我可以帮您分析数据、解答问题</p>
          </div>
        ) : (
          <>
            {messages.map(renderMessage)}
            {isTyping && <CopilotTypingIndicator />}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* 建议操作 */}
      {shortcuts && shortcuts.length > 0 && (
        <CopilotSuggestedActions
          shortcuts={shortcuts}
          onExecute={(shortcut) => {
            setInputValue(prev => prev + ` ${shortcut.title}`);
          }}
        />
      )}

      {/* 附件预览 */}
      {attachments.length > 0 && (
        <div className="p-3 border-t bg-gray-50">
          <div className="text-sm text-gray-600 mb-2">附件</div>
          <div className="flex flex-wrap gap-2">
            {attachments.map((attachment, index) => (
              <div key={index} className="flex items-center gap-2 bg-white p-2 rounded border">
                {attachment.type === 'image' ? (
                  <Image className="w-4 h-4" />
                ) : (
                  <FileText className="w-4 h-4" />
                )}
                <span className="text-sm truncate max-w-32">{attachment.name}</span>
                <button
                  onClick={() => removeAttachment(index)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="border-t p-4">
        {/* 文件上传区域 */}
        {showFileUpload && (
          <div className="mb-3">
            <CopilotFileUpload
              onUpload={handleFileUpload}
              onClose={() => setShowFileUpload(false)}
            />
          </div>
        )}

        <div className="flex gap-2">
          {/* 附件按钮 */}
          <button
            onClick={() => setShowFileUpload(!showFileUpload)}
            className={cn(
              "p-2 hover:bg-gray-100 rounded-lg transition-colors",
              showFileUpload && "bg-blue-100 text-blue-600"
            )}
            title="添加附件"
          >
            <Upload className="w-4 h-4" />
          </button>

          {/* 输入框 */}
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入消息或拖拽文件到这里..."
            className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none max-h-32"
            rows={1}
            disabled={isLoading}
          />

          {/* 发送按钮 */}
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() && attachments.length === 0 || isLoading}
            className={cn(
              "px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600",
              "disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            )}
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* 输入提示 */}
        <div className="mt-2 text-xs text-gray-500 flex justify-between">
          <span>按 Enter 发送，Shift+Enter 换行</span>
          <span>支持文件上传和拖拽</span>
        </div>
      </div>
    </div>
  );
}