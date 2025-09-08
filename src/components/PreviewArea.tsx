import React from 'react';

interface PreviewAreaProps {
  imageUrl: string | null;
  padding: number;
  inset: number;
  borderRadius: number;
  shadow: number;
  background: string;
  aspectRatio: string;
  showWatermark: boolean;
  zoom: number;
}

export const PreviewArea: React.FC<PreviewAreaProps> = ({
  imageUrl,
  padding,
  inset,
  borderRadius,
  shadow,
  background,
  aspectRatio,
  showWatermark,
  zoom
}) => {
  const getAspectRatioStyle = () => {
    switch (aspectRatio) {
      case '16:9': return 'aspect-[16/9]';
      case '4:3': return 'aspect-[4/3]';
      case '3:2': return 'aspect-[3/2]';
      case '1:1': return 'aspect-square';
      default: return '';
    }
  };

  const shadowStyle = {
    boxShadow: `0 ${shadow * 0.5}px ${shadow * 1.5}px rgba(0, 0, 0, ${shadow * 0.01})`
  };

  const paddingStyle = {
    padding: `${padding}px`
  };

  const borderRadiusStyle = {
    borderRadius: `${borderRadius}px`
  };

  const insetStyle = {
    background: `linear-gradient(${background}) padding-box, ${background} border-box`,
    border: `${inset}px solid transparent`
  };

  const getBalancedStyle = () => {
    // if (!balance) return {};
    
    return {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    };
  };

  const zoomStyle = {
    transform: `scale(${zoom / 100})`,
    transformOrigin: 'center center'
  };
  
  return (
    <div id="preview-area" className="flex-1 flex items-center justify-center p-8 overflow-hidden">
       <div 
        className="transition-transform duration-200 ease-in-out"
        style={zoomStyle}
      >    
      <div
        className={`relative max-w-2xl w-full ${getAspectRatioStyle()}`}
        style={{
          background,
          ...paddingStyle,
          ...borderRadiusStyle,
          ...shadowStyle,
          ...getBalancedStyle()
        }}
      >
        {imageUrl ? (
          <div className="relative w-full h-full">
            <img
              src={imageUrl}
              alt="Preview"
              className="w-full h-full object-cover bg-white"
              style={{
                ...borderRadiusStyle,
                border: inset > 0 ? `${inset}px solid rgba(255, 255, 255, 0.2)` : 'none'
              }}
            />
            {showWatermark && (
              <div className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded text-sm">
                Image Editor
              </div>
            )}
          </div>
        ) : (
          <div 
            className="w-full h-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center"
            style={borderRadiusStyle}
          >
            <p className="text-gray-500">Upload an image to preview</p>
          </div>
        )}
      </div>
    </div>
    </div>
  );
};