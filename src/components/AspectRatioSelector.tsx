import React from 'react';

interface AspectRatioSelectorProps {
  selectedRatio: string;
  onRatioChange: (ratio: string) => void;
}

const ratios = [
  { name: 'Auto', value: 'auto' },
  { name: '4:3', value: '4:3' },
  { name: '3:2', value: '3:2' },
  { name: '16:9', value: '16:9' },
  { name: '1:1', value: '1:1' }
];

const socialPresets = [
  { name: 'Twitter', value: '16:9' },
  { name: 'Facebook', value: '16:9' },
  { name: 'Instagram', value: '1:1' },
  { name: 'LinkedIn', value: '16:9' },
  { name: 'YouTube', value: '16:9' },
  { name: 'Pinterest', value: '3:2' },
  { name: 'Reddit', value: '16:9' },
  { name: 'Snapchat', value: '16:9' }
];

export const AspectRatioSelector: React.FC<AspectRatioSelectorProps> = ({
  selectedRatio,
  onRatioChange
}) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">Ratio / Size</label>
        <div className="flex gap-2 flex-wrap">
          {ratios.map((ratio) => (
            <button
              key={ratio.value}
              onClick={() => onRatioChange(ratio.value)}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                selectedRatio === ratio.value
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {ratio.name}
            </button>
          ))}
        </div>
      </div>
      
      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">Social Media</label>
        <div className="grid grid-cols-4 gap-2">
          {socialPresets.map((preset) => (
            <button
              key={preset.name}
              onClick={() => onRatioChange(preset.value)}
              className="px-3 py-2 text-sm rounded-md bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors text-left"
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};