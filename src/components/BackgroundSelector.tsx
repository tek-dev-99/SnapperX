import React from 'react';

interface BackgroundSelectorProps {
  selectedBackground: string;
  onBackgroundChange: (background: string) => void;
}

const backgrounds = [
  { name: 'Desktop', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { name: 'Cool', gradient: 'linear-gradient(135deg, #2196F3 0%, #00BCD4 100%)' },
  { name: 'Nice', gradient: 'linear-gradient(135deg, #E91E63 0%, #9C27B0 100%)' },
  { name: 'Morning', gradient: 'linear-gradient(135deg, #FF9800 0%, #FFC107 100%)' },
  { name: 'Bright', gradient: 'linear-gradient(135deg, #9C27B0 0%, #673AB7 100%)' },
  { name: 'Love', gradient: 'linear-gradient(135deg, #9C27B0 0%, #E91E63 100%)' },
  { name: 'Rain', gradient: 'linear-gradient(135deg, #00BCD4 0%, #8BC34A 100%)' },
  { name: 'Sky', gradient: 'linear-gradient(135deg, #03A9F4 0%, #00BCD4 100%)' },
  { name: 'None', gradient: 'transparent' },
  { name: 'Custom', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }
];

export const BackgroundSelector: React.FC<BackgroundSelectorProps> = ({
  selectedBackground,
  onBackgroundChange
}) => {
  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-gray-700">Background</label>
      <div className="grid grid-cols-5 gap-2">
        {backgrounds.map((bg) => (
          <div key={bg.name} className="text-center">
            <button
              onClick={() => onBackgroundChange(bg.gradient)}
              className={`w-12 h-12 rounded-lg border-2 transition-all ${selectedBackground === bg.gradient
                  ? 'border-blue-500 scale-105'
                  : 'border-gray-200 hover:border-gray-300'
                }`}
              style={{ background: bg.gradient }}
            />
            <p className="text-xs text-gray-600 mt-1">{bg.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
};