import React from 'react';
import { Settings, X } from 'lucide-react';
import { Slider } from './Slider';
import { BackgroundSelector } from './BackgroundSelector';
import { AspectRatioSelector } from './AspectRatioSelector';
import { ExportControls } from './ExportControls';

interface StyleControlsProps {
  padding: number;
  inset: number;
  borderRadius: number;
  shadow: number;
  background: string;
  aspectRatio: string;
  showWatermark: boolean;
  redactEmails: boolean;
  onPaddingChange: (value: number) => void;
  onInsetChange: (value: number) => void;
  onBorderRadiusChange: (value: number) => void;
  onShadowChange: (value: number) => void;
  onBackgroundChange: (background: string) => void;
  onAspectRatioChange: (ratio: string) => void;
  onWatermarkToggle: (show: boolean) => void;
  onEmailRedactionToggle: (redact: boolean) => void;
  onExport: (format: string) => void;
  onCopyToClipboard: () => void;
}

export const StyleControls: React.FC<StyleControlsProps> = ({
  padding,
  inset,
  borderRadius,
  shadow,
  background,
  aspectRatio,
  showWatermark,
  redactEmails,
  onPaddingChange,
  onInsetChange,
  onBorderRadiusChange,
  onShadowChange,
  onBackgroundChange,
  onAspectRatioChange,
  onWatermarkToggle,
  onEmailRedactionToggle,
  onExport,
  onCopyToClipboard
}) => {
  return (
    <div className="w-100 bg-white border-l border-gray-200 p-6 overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Settings className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-800">Style Controls</h2>
        </div>
        <button className="p-1 hover:bg-gray-100 rounded">
          <X className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      <div className="space-y-6">
        <Slider
          label="Padding"
          value={padding}
          min={0}
          max={100}
          onChange={onPaddingChange}
          unit="px"
        />

        <div className="space-y-2">
          <Slider
            label="Inset"
            value={inset}
            min={0}
            max={20}
            onChange={onInsetChange}
            unit="px"
          />
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="balance"
              className="rounded border-gray-300"
            />
            <label htmlFor="balance" className="text-sm text-gray-600">Balance</label>
          </div>
        </div>

        <Slider
          label="Border Radius"
          value={borderRadius}
          min={0}
          max={50}
          onChange={onBorderRadiusChange}
          unit="px"
        />

        <Slider
          label="Shadow"
          value={shadow}
          min={0}
          max={100}
          onChange={onShadowChange}
        />

        <BackgroundSelector
          selectedBackground={background}
          onBackgroundChange={onBackgroundChange}
        />

        <AspectRatioSelector
          selectedRatio={aspectRatio}
          onRatioChange={onAspectRatioChange}
        />

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Redact email addresses</label>
            <input
              type="checkbox"
              checked={redactEmails}
              onChange={(e) => onEmailRedactionToggle(e.target.checked)}
              className="rounded border-gray-300"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Show watermark</label>
            <input
              type="checkbox"
              checked={showWatermark}
              onChange={(e) => onWatermarkToggle(e.target.checked)}
              className="rounded border-gray-300"
            />
          </div>
        </div>
{/* 
        <ExportControls
          onExport={onExport}
          onCopyToClipboard={onCopyToClipboard}
        /> */}
      </div>
    </div>
  );
};