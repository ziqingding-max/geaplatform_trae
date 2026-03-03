import { useState, useEffect } from 'react';
import { X, Settings, Palette, Keyboard, Bell, Shield, Globe, Save, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCopilot } from '@/hooks/useCopilot';

interface CopilotSettingsProps {
  onClose: () => void;
  className?: string;
}

interface SettingsSection {
  id: string;
  title: string;
  icon: any;
  component: React.ComponentType<any>;
}

export function CopilotSettings({ onClose, className }: CopilotSettingsProps) {
  const { userConfig, updateConfig, isLoading } = useCopilot();
  const [activeSection, setActiveSection] = useState('appearance');
  const [hasChanges, setHasChanges] = useState(false);
  const [localSettings, setLocalSettings] = useState<any>({});

  // 初始化本地设置
  useEffect(() => {
    if (userConfig) {
      setLocalSettings({
        theme: userConfig.theme,
        language: userConfig.language,
        position: userConfig.position,
        enabledFeatures: userConfig.enabledFeatures || [],
        disabledPredictions: userConfig.disabledPredictions || [],
        preferences: userConfig.preferences || {},
        hotkeys: userConfig.hotkeys || {},
      });
    }
  }, [userConfig]);

  // 设置变更处理
  const handleSettingChange = (key: string, value: any) => {
    setLocalSettings(prev => ({
      ...prev,
      [key]: value,
    }));
    setHasChanges(true);
  };

  // 保存设置
  const handleSave = async () => {
    try {
      await updateConfig(localSettings);
      setHasChanges(false);
      // 显示成功提示
    } catch (error) {
      console.error('Failed to save settings:', error);
      // 显示错误提示
    }
  };

  // 重置设置
  const handleReset = () => {
    if (userConfig) {
      setLocalSettings({
        theme: userConfig.theme,
        language: userConfig.language,
        position: userConfig.position,
        enabledFeatures: userConfig.enabledFeatures || [],
        disabledPredictions: userConfig.disabledPredictions || [],
        preferences: userConfig.preferences || {},
        hotkeys: userConfig.hotkeys || {},
      });
      setHasChanges(false);
    }
  };

  // 设置部分定义
  const sections: SettingsSection[] = [
    {
      id: 'appearance',
      title: '外观设置',
      icon: Palette,
      component: AppearanceSettings,
    },
    {
      id: 'hotkeys',
      title: '快捷键',
      icon: Keyboard,
      component: HotkeySettings,
    },
    {
      id: 'notifications',
      title: '通知设置',
      icon: Bell,
      component: NotificationSettings,
    },
    {
      id: 'features',
      title: '功能设置',
      icon: Shield,
      component: FeatureSettings,
    },
    {
      id: 'language',
      title: '语言设置',
      icon: Globe,
      component: LanguageSettings,
    },
  ];

  const ActiveComponent = sections.find(s => s.id === activeSection)?.component;

  return (
    <div className={cn("fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50", className)}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] flex">
        {/* 侧边栏 */}
        <div className="w-64 bg-gray-50 p-4 border-r">
          <div className="flex items-center gap-2 mb-6">
            <Settings className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Copilot 设置</h2>
          </div>

          <nav className="space-y-1">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors",
                    activeSection === section.id
                      ? "bg-blue-100 text-blue-700 border border-blue-200"
                      : "text-gray-600 hover:bg-gray-100"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{section.title}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* 主内容区 */}
        <div className="flex-1 flex flex-col">
          {/* 头部 */}
          <div className="flex items-center justify-between p-4 border-b">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {sections.find(s => s.id === activeSection)?.title}
              </h3>
              <p className="text-sm text-gray-500">自定义您的 Copilot 体验</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 设置内容 */}
          <div className="flex-1 overflow-y-auto p-6">
            {ActiveComponent && (
              <ActiveComponent
                settings={localSettings}
                onChange={handleSettingChange}
              />
            )}
          </div>

          {/* 底部操作 */}
          <div className="flex items-center justify-between p-4 border-t bg-gray-50">
            <button
              onClick={handleReset}
              disabled={!hasChanges || isLoading}
              className={cn(
                "flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors",
                "text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              <RefreshCw className="w-4 h-4" />
              重置
            </button>

            <div className="flex items-center gap-3">
              {hasChanges && (
                <span className="text-sm text-orange-600">有未保存的更改</span>
              )}
              <button
                onClick={handleSave}
                disabled={!hasChanges || isLoading}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
                  hasChanges
                    ? "bg-blue-500 text-white hover:bg-blue-600"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                )}
              >
                <Save className="w-4 h-4" />
                {isLoading ? '保存中...' : '保存'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 外观设置组件
function AppearanceSettings({ settings, onChange }: { settings: any; onChange: (key: string, value: any) => void }) {
  const themes = [
    { id: 'auto', name: '自动', description: '跟随系统主题' },
    { id: 'light', name: '浅色', description: '明亮的界面' },
    { id: 'dark', name: '深色', description: '暗色主题' },
  ];

  const positions = [
    { id: 'bottom-right', name: '右下角', description: '屏幕右下角' },
    { id: 'bottom-left', name: '左下角', description: '屏幕左下角' },
    { id: 'top-right', name: '右上角', description: '屏幕右上角' },
    { id: 'top-left', name: '左上角', description: '屏幕左上角' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-3">主题设置</h4>
        <div className="space-y-2">
          {themes.map((theme) => (
            <label key={theme.id} className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="theme"
                value={theme.id}
                checked={settings.theme === theme.id}
                onChange={(e) => onChange('theme', e.target.value)}
                className="text-blue-500"
              />
              <div>
                <div className="font-medium text-gray-900">{theme.name}</div>
                <div className="text-sm text-gray-500">{theme.description}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-3">悬浮球位置</h4>
        <div className="grid grid-cols-2 gap-3">
          {positions.map((position) => (
            <label key={position.id} className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="position"
                value={position.id}
                checked={settings.position === position.id}
                onChange={(e) => onChange('position', e.target.value)}
                className="text-blue-500"
              />
              <span className="text-sm">{position.name}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

// 快捷键设置组件
function HotkeySettings({ settings, onChange }: { settings: any; onChange: (key: string, value: any) => void }) {
  const hotkeyOptions = [
    { key: 'toggleCopilot', label: '显示/隐藏 Copilot', defaultValue: 'ctrl+shift+c' },
    { key: 'quickActions', label: '显示快捷操作', defaultValue: 'ctrl+shift+a' },
    { key: 'focusInput', label: '聚焦输入框', defaultValue: 'ctrl+shift+f' },
    { key: 'exportData', label: '导出数据', defaultValue: 'ctrl+shift+e' },
  ];

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600 mb-4">
        自定义 Copilot 的快捷键设置
      </div>
      
      {hotkeyOptions.map((option) => (
        <div key={option.key} className="flex items-center justify-between p-3 border rounded-lg">
          <label className="text-sm font-medium text-gray-900">{option.label}</label>
          <input
            type="text"
            value={settings.hotkeys?.[option.key] || option.defaultValue}
            onChange={(e) => onChange(`hotkeys.${option.key}`, e.target.value)}
            className="px-3 py-1 border rounded text-sm font-mono w-32"
            placeholder={option.defaultValue}
          />
        </div>
      ))}
    </div>
  );
}

// 通知设置组件
function NotificationSettings({ settings, onChange }: { settings: any; onChange: (key: string, value: any) => void }) {
  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600 mb-4">
        配置 Copilot 的通知和提醒设置
      </div>
      
      <label className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
        <div>
          <div className="font-medium text-gray-900">启用预测通知</div>
          <div className="text-sm text-gray-500">显示智能预测和警告</div>
        </div>
        <input
          type="checkbox"
          checked={settings.preferences?.enablePredictions !== false}
          onChange={(e) => onChange('preferences.enablePredictions', e.target.checked)}
          className="text-blue-500"
        />
      </label>

      <label className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
        <div>
          <div className="font-medium text-gray-900">声音提醒</div>
          <div className="text-sm text-gray-500">新消息时播放声音</div>
        </div>
        <input
          type="checkbox"
          checked={settings.preferences?.enableSound !== false}
          onChange={(e) => onChange('preferences.enableSound', e.target.checked)}
          className="text-blue-500"
        />
      </label>

      <label className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
        <div>
          <div className="font-medium text-gray-900">桌面通知</div>
          <div className="text-sm text-gray-500">显示系统通知</div>
        </div>
        <input
          type="checkbox"
          checked={settings.preferences?.enableDesktopNotifications !== false}
          onChange={(e) => onChange('preferences.enableDesktopNotifications', e.target.checked)}
          className="text-blue-500"
        />
      </label>
    </div>
  );
}

// 功能设置组件
function FeatureSettings({ settings, onChange }: { settings: any; onChange: (key: string, value: any) => void }) {
  const features = [
    { key: 'chat', label: '聊天功能', description: '启用与 Copilot 的对话功能' },
    { key: 'predictions', label: '智能预测', description: '显示智能预测和建议' },
    { key: 'shortcuts', label: '快捷操作', description: '显示快捷操作按钮' },
    { key: 'fileUpload', label: '文件上传', description: '支持文件上传和分析' },
    { key: 'real_time', label: '实时更新', description: '实时更新数据和预测' },
  ];

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600 mb-4">
        启用或禁用 Copilot 的各项功能
      </div>
      
      {features.map((feature) => (
        <label key={feature.key} className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
          <div>
            <div className="font-medium text-gray-900">{feature.label}</div>
            <div className="text-sm text-gray-500">{feature.description}</div>
          </div>
          <input
            type="checkbox"
            checked={settings.enabledFeatures?.includes(feature.key) !== false}
            onChange={(e) => {
              const enabledFeatures = settings.enabledFeatures || [];
              if (e.target.checked) {
                onChange('enabledFeatures', [...enabledFeatures, feature.key]);
              } else {
                onChange('enabledFeatures', enabledFeatures.filter((f: string) => f !== feature.key));
              }
            }}
            className="text-blue-500"
          />
        </label>
      ))}
    </div>
  );
}

// 语言设置组件
function LanguageSettings({ settings, onChange }: { settings: any; onChange: (key: string, value: any) => void }) {
  const languages = [
    { code: 'zh', name: '中文', nativeName: '中文' },
    { code: 'en', name: 'English', nativeName: 'English' },
  ];

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600 mb-4">
        选择 Copilot 的显示语言
      </div>
      
      <div className="space-y-2">
        {languages.map((lang) => (
          <label key={lang.code} className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              name="language"
              value={lang.code}
              checked={settings.language === lang.code}
              onChange={(e) => onChange('language', e.target.value)}
              className="text-blue-500"
            />
            <div>
              <div className="font-medium text-gray-900">{lang.name}</div>
              <div className="text-sm text-gray-500">{lang.nativeName}</div>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}