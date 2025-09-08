import React from 'react';
import { Download, Copy, Share } from 'lucide-react';

interface ExportControlsProps {
  onExport: (format: string) => void;
  onCopyToClipboard: () => void;
}

export const ExportControls: React.FC<ExportControlsProps> = ({
  onExport,
  onCopyToClipboard
}) => {
  return (
    <div className="space-y-3">
      <div className="border-t pt-4">
        <div className="space-y-2">
          <button
            onClick={onCopyToClipboard}
            className="w-full flex items-center justify-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Copy className="w-4 h-4" />
            <span>Copy to Clipboard</span>
          </button>
          
          <button
            onClick={() => onExport('png')}
            className="w-full flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Save as PNG</span>
          </button>
          
          {/* <div className="flex space-x-2">
            <button
              onClick={() => onExport('jpg')}
              className="flex-1 flex items-center justify-center space-x-1 bg-gray-50 text-gray-600 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors text-sm"
            >
              <span>JPG</span>
            </button>
            <button
              onClick={() => onExport('svg')}
              className="flex-1 flex items-center justify-center space-x-1 bg-gray-50 text-gray-600 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors text-sm"
            >
              <span>SVG</span>
            </button>
            <button
              onClick={() => onExport('pdf')}
              className="flex-1 flex items-center justify-center space-x-1 bg-gray-50 text-gray-600 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors text-sm"
            >
              <span>PDF</span>
            </button>
          </div> */}
          
        </div>
      </div>
    </div>
  );
};