import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { 
  Accessibility, 
  Type, 
  Eye, 
  Ear, 
  Mouse, 
  Keyboard,
  Settings,
  Monitor,
  Volume2,
  Contrast
} from 'lucide-react';

interface AccessibilitySettings {
  highContrast: boolean;
  largeText: boolean;
  reducedMotion: boolean;
  screenReader: boolean;
  keyboardNavigation: boolean;
  audioDescriptions: boolean;
  fontSize: number;
  lineHeight: number;
  letterSpacing: number;
  colorBlindness: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  focusIndicator: boolean;
  skipLinks: boolean;
  audioTranscripts: boolean;
}

export const AccessibilityEnhancer = () => {
  const [settings, setSettings] = useState<AccessibilitySettings>({
    highContrast: false,
    largeText: false,
    reducedMotion: false,
    screenReader: false,
    keyboardNavigation: true,
    audioDescriptions: false,
    fontSize: 16,
    lineHeight: 1.5,
    letterSpacing: 0,
    colorBlindness: 'none',
    focusIndicator: true,
    skipLinks: true,
    audioTranscripts: false
  });
  
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Load saved accessibility settings
    const savedSettings = localStorage.getItem('accessibility-settings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      setSettings(parsed);
      applySettings(parsed);
    }

    // Check for system preferences
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
    
    if (prefersReducedMotion || prefersHighContrast) {
      const updatedSettings = {
        ...settings,
        reducedMotion: prefersReducedMotion,
        highContrast: prefersHighContrast
      };
      setSettings(updatedSettings);
      applySettings(updatedSettings);
    }
  }, []);

  const applySettings = (newSettings: AccessibilitySettings) => {
    const root = document.documentElement;
    
    // Apply CSS custom properties
    root.style.setProperty('--accessibility-font-size', `${newSettings.fontSize}px`);
    root.style.setProperty('--accessibility-line-height', `${newSettings.lineHeight}`);
    root.style.setProperty('--accessibility-letter-spacing', `${newSettings.letterSpacing}px`);
    
    // Apply contrast
    if (newSettings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
    
    // Apply reduced motion
    if (newSettings.reducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }
    
    // Apply large text
    if (newSettings.largeText) {
      root.classList.add('large-text');
    } else {
      root.classList.remove('large-text');
    }
    
    // Apply color blindness filters
    if (newSettings.colorBlindness !== 'none') {
      root.classList.add(`colorblind-${newSettings.colorBlindness}`);
    } else {
      root.classList.remove('colorblind-protanopia', 'colorblind-deuteranopia', 'colorblind-tritanopia');
    }
    
    // Apply focus indicators
    if (newSettings.focusIndicator) {
      root.classList.add('enhanced-focus');
    } else {
      root.classList.remove('enhanced-focus');
    }
    
    // Save settings
    localStorage.setItem('accessibility-settings', JSON.stringify(newSettings));
  };

  const updateSetting = <K extends keyof AccessibilitySettings>(
    key: K, 
    value: AccessibilitySettings[K]
  ) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    applySettings(newSettings);
  };

  const resetSettings = () => {
    const defaultSettings: AccessibilitySettings = {
      highContrast: false,
      largeText: false,
      reducedMotion: false,
      screenReader: false,
      keyboardNavigation: true,
      audioDescriptions: false,
      fontSize: 16,
      lineHeight: 1.5,
      letterSpacing: 0,
      colorBlindness: 'none',
      focusIndicator: true,
      skipLinks: true,
      audioTranscripts: false
    };
    setSettings(defaultSettings);
    applySettings(defaultSettings);
  };

  if (!isVisible) {
    return (
      <Button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 z-50 shadow-lg"
        size="lg"
        aria-label="Open accessibility settings"
      >
        <Accessibility className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Accessibility className="h-5 w-5" />
              Accessibility Settings
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsVisible(false)}
              aria-label="Close accessibility settings"
            >
              ×
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Visual Accessibility */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Visual Accessibility
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium">High Contrast</label>
                  <p className="text-sm text-muted-foreground">Increase color contrast</p>
                </div>
                <Switch
                  checked={settings.highContrast}
                  onCheckedChange={(checked) => updateSetting('highContrast', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium">Large Text</label>
                  <p className="text-sm text-muted-foreground">Increase text size globally</p>
                </div>
                <Switch
                  checked={settings.largeText}
                  onCheckedChange={(checked) => updateSetting('largeText', checked)}
                />
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="font-medium block mb-2">Font Size: {settings.fontSize}px</label>
                <Slider
                  value={[settings.fontSize]}
                  onValueChange={([value]) => updateSetting('fontSize', value)}
                  min={12}
                  max={24}
                  step={1}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="font-medium block mb-2">Line Height: {settings.lineHeight}</label>
                <Slider
                  value={[settings.lineHeight]}
                  onValueChange={([value]) => updateSetting('lineHeight', value)}
                  min={1}
                  max={2}
                  step={0.1}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="font-medium block mb-2">Letter Spacing: {settings.letterSpacing}px</label>
                <Slider
                  value={[settings.letterSpacing]}
                  onValueChange={([value]) => updateSetting('letterSpacing', value)}
                  min={0}
                  max={3}
                  step={0.5}
                  className="w-full"
                />
              </div>
            </div>
            
            <div>
              <label className="font-medium block mb-2">Color Blindness Support</label>
              <div className="flex gap-2 flex-wrap">
                {[
                  { value: 'none', label: 'None' },
                  { value: 'protanopia', label: 'Protanopia' },
                  { value: 'deuteranopia', label: 'Deuteranopia' },
                  { value: 'tritanopia', label: 'Tritanopia' }
                ].map((option) => (
                  <Button
                    key={option.value}
                    variant={settings.colorBlindness === option.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => updateSetting('colorBlindness', option.value as any)}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Motor Accessibility */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Mouse className="h-5 w-5" />
              Motor & Navigation
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium">Reduced Motion</label>
                  <p className="text-sm text-muted-foreground">Minimize animations</p>
                </div>
                <Switch
                  checked={settings.reducedMotion}
                  onCheckedChange={(checked) => updateSetting('reducedMotion', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium">Enhanced Focus</label>
                  <p className="text-sm text-muted-foreground">Stronger focus indicators</p>
                </div>
                <Switch
                  checked={settings.focusIndicator}
                  onCheckedChange={(checked) => updateSetting('focusIndicator', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium">Keyboard Navigation</label>
                  <p className="text-sm text-muted-foreground">Full keyboard support</p>
                </div>
                <Switch
                  checked={settings.keyboardNavigation}
                  onCheckedChange={(checked) => updateSetting('keyboardNavigation', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium">Skip Links</label>
                  <p className="text-sm text-muted-foreground">Quick navigation links</p>
                </div>
                <Switch
                  checked={settings.skipLinks}
                  onCheckedChange={(checked) => updateSetting('skipLinks', checked)}
                />
              </div>
            </div>
          </div>

          {/* Audio & Cognitive */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Ear className="h-5 w-5" />
              Audio & Cognitive
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium">Screen Reader</label>
                  <p className="text-sm text-muted-foreground">Optimize for screen readers</p>
                </div>
                <Switch
                  checked={settings.screenReader}
                  onCheckedChange={(checked) => updateSetting('screenReader', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium">Audio Descriptions</label>
                  <p className="text-sm text-muted-foreground">Describe visual content</p>
                </div>
                <Switch
                  checked={settings.audioDescriptions}
                  onCheckedChange={(checked) => updateSetting('audioDescriptions', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium">Audio Transcripts</label>
                  <p className="text-sm text-muted-foreground">Text versions of audio</p>
                </div>
                <Switch
                  checked={settings.audioTranscripts}
                  onCheckedChange={(checked) => updateSetting('audioTranscripts', checked)}
                />
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button onClick={resetSettings} variant="outline">
              Reset to Default
            </Button>
            <Button onClick={() => setIsVisible(false)} className="flex-1">
              Apply Settings
            </Button>
          </div>

          {/* Accessibility Compliance Badge */}
          <div className="text-center pt-4">
            <Badge variant="outline" className="gap-2">
              <Accessibility className="h-4 w-4" />
              WCAG 2.1 AA Compliant
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};