import React from 'react';
import { X, Moon, Sun, Type, Layout, Palette } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';

const SettingsModal = ({ onClose }) => {
  const {
    theme,
    accentColor,
    fontSize,
    sidebarPosition,
    toggleTheme,
    changeAccentColor,
    changeFontSize,
    changeSidebarPosition
  } = useTheme();

  const accentColors = [
    { name: 'WhatsApp Green', value: '#25D366' },
    { name: 'Blue', value: '#0088CC' },
    { name: 'Purple', value: '#7C3AED' },
    { name: 'Pink', value: '#EC4899' },
    { name: 'Orange', value: '#F97316' },
  ];

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className={`max-w-2xl max-h-[80vh] overflow-y-auto ${
        theme === 'dark'
          ? 'bg-[#202C33] text-[#E9EDEF] border-[#2A3942]'
          : 'bg-white text-[#111B21]'
      }`}>
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">Pengaturan</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Theme Toggle */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              {theme === 'dark' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              <Label className="text-lg font-medium">Tema</Label>
            </div>
            <RadioGroup value={theme} onValueChange={toggleTheme}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="light" id="light" />
                <Label htmlFor="light" className="cursor-pointer">Terang</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="dark" id="dark" />
                <Label htmlFor="dark" className="cursor-pointer">Gelap</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Accent Color */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              <Label className="text-lg font-medium">Warna Aksen</Label>
            </div>
            <div className="grid grid-cols-5 gap-3">
              {accentColors.map((color) => (
                <button
                  key={color.value}
                  onClick={() => changeAccentColor(color.value)}
                  className={`h-12 rounded-lg transition-all hover:scale-105 ${
                    accentColor === color.value
                      ? 'ring-2 ring-offset-2 ring-offset-background'
                      : ''
                  }`}
                  style={{ 
                    backgroundColor: color.value,
                    ringColor: color.value
                  }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          {/* Font Size */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Type className="h-5 w-5" />
              <Label className="text-lg font-medium">Ukuran Teks</Label>
            </div>
            <RadioGroup value={fontSize} onValueChange={changeFontSize}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="small" id="small" />
                <Label htmlFor="small" className="cursor-pointer text-sm">Kecil</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="medium" id="medium" />
                <Label htmlFor="medium" className="cursor-pointer text-base">Sedang</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="large" id="large" />
                <Label htmlFor="large" className="cursor-pointer text-lg">Besar</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Sidebar Position */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Layout className="h-5 w-5" />
              <Label className="text-lg font-medium">Posisi Sidebar</Label>
            </div>
            <RadioGroup value={sidebarPosition} onValueChange={changeSidebarPosition}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="left" id="left" />
                <Label htmlFor="left" className="cursor-pointer">Kiri</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="right" id="right" />
                <Label htmlFor="right" className="cursor-pointer">Kanan</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Info */}
          <div className={`mt-6 p-4 rounded-lg ${
            theme === 'dark' ? 'bg-[#2A3942]' : 'bg-gray-100'
          }`}>
            <p className={`text-sm ${
              theme === 'dark' ? 'text-[#8696A0]' : 'text-gray-600'
            }`}>
              💡 Pengaturan akan tersimpan secara otomatis
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsModal;