import { useState, useCallback, useRef, DragEvent } from 'react';
import { Upload, File, Image, X, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onUpload: (files: Array<{
    type: 'image' | 'file';
    url: string;
    name: string;
    mimeType?: string;
  }>) => void;
  onClose: () => void;
  maxFileSize?: number;
  acceptedTypes?: string[];
  maxFiles?: number;
  className?: string;
}

interface UploadedFile {
  file: File;
  url: string;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  progress: number;
  error?: string;
}

export function CopilotFileUpload({ 
  onUpload, 
  onClose, 
  maxFileSize = 10 * 1024 * 1024, // 10MB
  acceptedTypes = ['image/*', 'application/pdf', 'text/*', '.doc', '.docx', '.xls', '.xlsx'],
  maxFiles = 5,
  className 
}: FileUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 验证文件类型
  const validateFileType = (file: File): boolean => {
    if (acceptedTypes.includes('*/*')) return true;
    
    return acceptedTypes.some(type => {
      if (type.startsWith('.')) {
        return file.name.toLowerCase().endsWith(type.toLowerCase());
      }
      if (type.endsWith('/*')) {
        return file.type.startsWith(type.replace('/*', ''));
      }
      return file.type === type;
    });
  };

  // 验证文件大小
  const validateFileSize = (file: File): boolean => {
    return file.size <= maxFileSize;
  };

  // 获取文件类型
  const getFileType = (file: File): 'image' | 'file' => {
    return file.type.startsWith('image/') ? 'image' : 'file';
  };

  // 获取文件图标
  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <Image className="w-6 h-6 text-blue-500" />;
    }
    
    const extension = file.name.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return <File className="w-6 h-6 text-red-500" />;
      case 'doc':
      case 'docx':
        return <File className="w-6 h-6 text-blue-600" />;
      case 'xls':
      case 'xlsx':
        return <File className="w-6 h-6 text-green-600" />;
      default:
        return <File className="w-6 h-6 text-gray-500" />;
    }
  };

  // 处理文件上传
  const handleFileUpload = async (files: FileList) => {
    const newFiles: UploadedFile[] = Array.from(files).map(file => ({
      file,
      url: URL.createObjectURL(file),
      status: 'pending' as const,
      progress: 0,
    }));

    // 验证文件数量
    if (uploadedFiles.length + newFiles.length > maxFiles) {
      alert(`最多只能上传 ${maxFiles} 个文件`);
      return;
    }

    // 验证文件类型和大小
    const validFiles = newFiles.filter(uploadedFile => {
      const { file } = uploadedFile;
      
      if (!validateFileType(file)) {
        uploadedFile.status = 'error';
        uploadedFile.error = '不支持的文件类型';
        return true; // 仍然显示错误文件
      }
      
      if (!validateFileSize(file)) {
        uploadedFile.status = 'error';
        uploadedFile.error = `文件大小超过 ${(maxFileSize / 1024 / 1024).toFixed(0)}MB 限制`;
        return true; // 仍然显示错误文件
      }
      
      return true;
    });

    setUploadedFiles(prev => [...prev, ...validFiles]);

    // 开始上传有效的文件
    validFiles.forEach(uploadFile);
  };

  // 上传单个文件
  const uploadFile = async (uploadedFile: UploadedFile) => {
    const { file } = uploadedFile;
    
    try {
      setUploadedFiles(prev => 
        prev.map(uf => 
          uf.file === file ? { ...uf, status: 'uploading' } : uf
        )
      );

      // 模拟上传进度
      const interval = setInterval(() => {
        setUploadedFiles(prev => 
          prev.map(uf => {
            if (uf.file === file && uf.status === 'uploading') {
              const newProgress = Math.min(uf.progress + 10, 90);
              return { ...uf, progress: newProgress };
            }
            return uf;
          })
        );
      }, 200);

      // 模拟上传完成
      setTimeout(() => {
        clearInterval(interval);
        
        setUploadedFiles(prev => 
          prev.map(uf => 
            uf.file === file 
              ? { ...uf, status: 'completed', progress: 100 } 
              : uf
          )
        );

        // 触发上传回调
        const result = {
          type: getFileType(file),
          url: uploadedFile.url,
          name: file.name,
          mimeType: file.type,
        };
        
        onUpload([result]);
      }, 2000);

    } catch (error) {
      setUploadedFiles(prev => 
        prev.map(uf => 
          uf.file === file 
            ? { 
                ...uf, 
                status: 'error', 
                error: error instanceof Error ? error.message : '上传失败' 
              } 
            : uf
        )
      );
    }
  };

  // 处理拖拽
  const handleDragEnter = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  };

  // 移除文件
  const removeFile = (fileToRemove: UploadedFile) => {
    setUploadedFiles(prev => prev.filter(uf => uf !== fileToRemove));
    URL.revokeObjectURL(fileToRemove.url);
  };

  // 获取进度条颜色
  const getProgressColor = (status: UploadedFile['status']) => {
    switch (status) {
      case 'uploading':
        return 'bg-blue-500';
      case 'completed':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-300';
    }
  };

  // 获取状态图标
  const getStatusIcon = (status: UploadedFile['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'uploading':
        return <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
      default:
        return null;
    }
  };

  return (
    <div className={cn("bg-white rounded-lg shadow-lg p-4 w-80", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Upload className="w-5 h-5 text-blue-500" />
          <h3 className="font-medium text-gray-900">文件上传</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* 拖拽区域 */}
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-6 mb-4 text-center transition-colors",
          isDragging 
            ? "border-blue-500 bg-blue-50" 
            : "border-gray-300 hover:border-gray-400"
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center gap-2">
          <Upload className="w-8 h-8 text-gray-400" />
          <div className="text-sm text-gray-600">
            <p className="font-medium">拖拽文件到这里</p>
            <p className="text-gray-500">或点击选择文件</p>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
          >
            选择文件
          </button>
        </div>
      </div>

      {/* 文件输入（隐藏） */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedTypes.join(',')}
        onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
        className="hidden"
      />

      {/* 文件列表 */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2 mb-4">
          <div className="text-sm font-medium text-gray-700">已选择的文件</div>
          {uploadedFiles.map((uploadedFile, index) => (
            <div
              key={index}
              className={cn(
                "flex items-center gap-3 p-3 bg-gray-50 rounded-lg border",
                uploadedFile.status === 'error' && "border-red-200 bg-red-50"
              )}
            >
              {/* 文件图标 */}
              <div className="flex-shrink-0">
                {getFileIcon(uploadedFile.file)}
              </div>

              {/* 文件信息 */}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {uploadedFile.file.name}
                </div>
                <div className="text-xs text-gray-500">
                  {(uploadedFile.file.size / 1024 / 1024).toFixed(2)} MB
                </div>
                
                {/* 进度条 */}
                {uploadedFile.status === 'uploading' && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-1">
                      <div
                        className={cn("h-1 rounded-full transition-all duration-300", getProgressColor(uploadedFile.status))}
                        style={{ width: `${uploadedFile.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* 错误信息 */}
                {uploadedFile.status === 'error' && uploadedFile.error && (
                  <div className="mt-1 text-xs text-red-600">
                    {uploadedFile.error}
                  </div>
                )}
              </div>

              {/* 状态图标 */}
              <div className="flex-shrink-0">
                {getStatusIcon(uploadedFile.status)}
              </div>

              {/* 移除按钮 */}
              {(uploadedFile.status === 'pending' || uploadedFile.status === 'error') && (
                <button
                  onClick={() => removeFile(uploadedFile)}
                  className="p-1 hover:bg-gray-200 rounded transition-colors"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 提示信息 */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>支持格式: {acceptedTypes.join(', ')}</p>
        <p>单个文件最大: {(maxFileSize / 1024 / 1024).toFixed(0)}MB</p>
        <p>最多 {maxFiles} 个文件</p>
      </div>
    </div>
  );
}