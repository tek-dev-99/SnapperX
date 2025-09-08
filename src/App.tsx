import React, { useState, useEffect } from 'react';
import { ImageUpload } from './components/ImageUpload';
import { PreviewArea } from './components/PreviewArea';
import { StyleControls } from './components/StyleControls';
import html2canvas from 'html2canvas';

function App() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [padding, setPadding] = useState(40);
  const [inset, setInset] = useState(0);
  const [borderRadius, setBorderRadius] = useState(12);
  const [shadow, setShadow] = useState(20);
  const [background, setBackground] = useState('linear-gradient(135deg, #667eea 0%, #764ba2 100%)');
  const [aspectRatio, setAspectRatio] = useState('auto');
  const [showWatermark, setShowWatermark] = useState(false);
  const [redactEmails, setRedactEmails] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [showSaveAsMenu, setShowSaveAsMenu] = useState(false);
  const [recentScreenshots, setRecentScreenshots] = useState<any[]>([]);
  const [galleryThumbnails, setGalleryThumbnails] = useState<{[id: string]: string}>({});
  const [currentScreenshotId, setCurrentScreenshotId] = useState<string | null>(null);

  // Fetch recent screenshots on mount
  useEffect(() => {
    async function fetchScreenshotsAndThumbnails() {
      if (typeof window !== 'undefined' && window.electronAPI && window.electronAPI.getRecentScreenshots) {
        const list = await window.electronAPI.getRecentScreenshots();
        setRecentScreenshots(list || []);
        // Load thumbnails for each screenshot
        const thumbs: {[id: string]: string} = {};
        for (const shot of list || []) {
          if (window.electronAPI && window.electronAPI.loadScreenshot) {
            try {
              const buffer = await window.electronAPI.loadScreenshot(shot.path);
              const blob = new Blob([buffer], { type: 'image/png' });
              thumbs[shot.id] = URL.createObjectURL(blob);
            } catch {
              thumbs[shot.id] = '';
            }
          } else {
            thumbs[shot.id] = '';
          }
        }
        setGalleryThumbnails(thumbs);
      }
    }
    fetchScreenshotsAndThumbnails();
    // Listen for new screenshot saved
    if (typeof window !== 'undefined' && window.electronAPI && window.electronAPI.onScreenshotSaved) {
      window.electronAPI.onScreenshotSaved(async (screenshotInfo) => {
        setRecentScreenshots((prev) => {
          const updated = [screenshotInfo, ...prev.filter(s => s.id !== screenshotInfo.id)].slice(0, 5);
          return updated;
        });
        // Load the new screenshot thumbnail
        if (window.electronAPI && window.electronAPI.loadScreenshot) {
          try {
            const buffer = await window.electronAPI.loadScreenshot(screenshotInfo.path);
            const blob = new Blob([buffer], { type: 'image/png' });
            setGalleryThumbnails((prev) => ({ ...prev, [screenshotInfo.id]: URL.createObjectURL(blob) }));
          } catch {
            setGalleryThumbnails((prev) => ({ ...prev, [screenshotInfo.id]: '' }));
          }
        } else {
          setGalleryThumbnails((prev) => ({ ...prev, [screenshotInfo.id]: '' }));
        }
        // Load the new screenshot in editor
        loadScreenshot(screenshotInfo.path, screenshotInfo.id);
      });
    }
  }, []);

  // Helper to load screenshot from disk
  const loadScreenshot = async (path: string, id: string) => {
    if (window.electronAPI && window.electronAPI.loadScreenshot) {
      try {
        const buffer = await window.electronAPI.loadScreenshot(path);
        const blob = new Blob([buffer], { type: 'image/png' });
        const url = URL.createObjectURL(blob);
        setImageUrl(url);
        setCurrentScreenshotId(id);
      } catch (error) {
        alert('Failed to load screenshot.');
      }
    }
  };

  useEffect(() => {
    if (window.electronAPI && window.electronAPI.onScreenshotTaken) {
      window.electronAPI.onScreenshotTaken((buffer: ArrayBuffer) => {
        const blob = new Blob([buffer], { type: 'image/png' });
        const url = URL.createObjectURL(blob);
        setImageUrl(url);
        setCurrentScreenshotId(null); // Not from gallery
      });
    }
  }, []);


  
  const handleZoomChange = (newZoom: number) => {
    setZoom(Math.max(25, Math.min(200, newZoom)));
  };

  const zoomOptions = [25, 50, 75, 100, 125, 150, 200];

  const handleQuickZoom = (zoomLevel: number) => {
    setZoom(zoomLevel);
  };
  


  const handleImageUpload = (url: string) => {
    setImageUrl(url);
  };

  const handleExport = async (format: string) => {
    const previewElement = document.getElementById('preview-area');
    if (!previewElement) return;

    try {
      const canvas = await html2canvas(previewElement, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        allowTaint: true
      });

      if (format === 'png') {
        const link = document.createElement('a');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        link.download = `screenshot_${timestamp}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      }
      setShowSaveAsMenu(false);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    }
  };

  const toggleSaveAsMenu = () => {
    setShowSaveAsMenu(!showSaveAsMenu);
  };

  const ZoomMenu = () => (
    <div className="absolute bottom-full left-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg py-2 min-w-32">
      <div className="px-3 py-2 text-sm font-medium text-gray-700 border-b border-gray-100">
        Zoom Level
      </div>
      {zoomOptions.map((zoomLevel) => (
        <button
          key={zoomLevel}
          onClick={() => handleQuickZoom(zoomLevel)}
          className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${
            zoom === zoomLevel ? 'text-blue-600 bg-blue-50' : 'text-gray-700'
          }`}
        >
          {zoomLevel}%
        </button>
      ))}
    </div>
  );


  const handleCopyToClipboard = async () => {
    const previewElement = document.getElementById('preview-area');
    if (!previewElement) return;

    try {
      const canvas = await html2canvas(previewElement, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        allowTaint: true
      });

      canvas.toBlob(async (blob) => {
        if (blob) {
          try {
            await navigator.clipboard.write([
              new ClipboardItem({ 'image/png': blob })
            ]);
            alert('Image copied to clipboard!');
          } catch (error) {
            console.error('Copy failed:', error);
          }
        }
      });
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col lg:flex-row overflow-hidden">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-800">Image Editor</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Ready to edit screenshot</span>
            </div>
          </div>
        </div>

        {/* Recent Screenshots Gallery */}
        {recentScreenshots.length > 0 && (
          <div className="bg-white border-b border-gray-100 px-6 py-2 flex space-x-2 overflow-x-auto">
            {recentScreenshots.map((shot) => (
              <button
                key={shot.id}
                className={`border rounded-lg p-1 transition-all ${currentScreenshotId === shot.id ? 'border-blue-500 ring-2 ring-blue-300' : 'border-gray-200 hover:border-blue-400'}`}
                title={shot.timestamp}
                onClick={() => loadScreenshot(shot.path, shot.id)}
              >
                <img
                  src={galleryThumbnails[shot.id] || ''}
                  alt={shot.timestamp}
                  className="w-16 h-16 object-cover rounded"
                  style={{ opacity: currentScreenshotId === shot.id ? 1 : 0.7 }}
                />
              </button>
            ))}
          </div>
        )}

        {/* Preview Area */}
        <div className="flex-1 bg-gray-50">
          {!imageUrl ? (
            <ImageUpload onImageUpload={handleImageUpload} hasImage={!!imageUrl} />
          ) : (
            <PreviewArea
              imageUrl={imageUrl}
              padding={padding}
              inset={inset}
              borderRadius={borderRadius}
              shadow={shadow}
              background={background}
              aspectRatio={aspectRatio}
              showWatermark={showWatermark}
              zoom={zoom}
            />
          )}
        </div>

        <div className="bg-white border-t border-gray-200 px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleCopyToClipboard}
                className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm"
              >
                <span>Copy ⌘C</span>
              </button>
              
              <button
                onClick={() => handleExport('png')}
                className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm"
              >
                <span>Save ⌘S</span>
              </button>
              
              <button
              onClick={() => handleExport('png')}
               className="flex items-center space-x-2 bg-gray-50 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors text-sm">
                <span>Save As...</span>
              </button>
              
              <div className="relative flex items-center space-x-2">
                <button
                  onClick={() => handleZoomChange(zoom - 25)}
                  className="text-sm text-gray-500 hover:text-gray-700 px-2 py-1 rounded"
                  disabled={zoom <= 25}
                >
                  −
                </button>
                <div className="relative">
                  <button
                    onClick={() => setShowSaveAsMenu(false)}
                    className="text-sm text-gray-500 hover:text-gray-700 px-2 py-1 rounded min-w-16 text-center"
                  >
                    {zoom}%
                  </button>
                </div>
                <button
                  onClick={() => handleZoomChange(zoom + 25)}
                  className="text-sm text-gray-500 hover:text-gray-700 px-2 py-1 rounded"
                  disabled={zoom >= 200}
                >
                  +
                </button>
              </div>
            </div>
            
            {/* <div className="text-sm text-gray-500">
              Double-click to background = Copy and Close
            </div> */}
          </div>
        </div>
      </div>


      

      {/* Sidebar */}
      <StyleControls
        padding={padding}
        inset={inset}
        borderRadius={borderRadius}
        shadow={shadow}
        background={background}
        aspectRatio={aspectRatio}
        showWatermark={showWatermark}
        redactEmails={redactEmails}
        onPaddingChange={setPadding}
        onInsetChange={setInset}
        onBorderRadiusChange={setBorderRadius}
        onShadowChange={setShadow}
        onBackgroundChange={setBackground}
        onAspectRatioChange={setAspectRatio}
        onWatermarkToggle={setShowWatermark}
        onEmailRedactionToggle={setRedactEmails}
        onExport={handleExport}
        onCopyToClipboard={handleCopyToClipboard}
      />
    </div>
  );
}

export default App;