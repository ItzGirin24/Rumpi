<<<<<<< HEAD
import Hero from "@/components/Hero";
import Products from "@/components/Products";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Hero />
      <Products />
      <Footer />
=======
import { useState, useRef, useEffect } from 'react';
import { ImageUploader } from '@/components/ImageUploader';
import { EditorToolbar } from '@/components/EditorToolbar';
import { EditorControls } from '@/components/EditorControls';
import { EnhanceHDDialog } from '@/components/EnhanceHDDialog';
import { GridGeneratorDialog } from '@/components/GridGeneratorDialog';
import { GridPreviewDialog } from '@/components/GridPreviewDialog';
import { BeforeAfterSlider } from '@/components/BeforeAfterSlider';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { removeBackground, loadImage, applyAdjustments, generateGrid, upscaleImage } from '@/lib/imageProcessing';
import { Sparkles } from 'lucide-react';

const Index = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isManualMode, setIsManualMode] = useState(false);
  const [drawingTool, setDrawingTool] = useState<'eraser' | 'pen' | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [canvasHistory, setCanvasHistory] = useState<ImageData[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [autoApplyTimer, setAutoApplyTimer] = useState<NodeJS.Timeout | null>(null);
  const [lastDrawingTime, setLastDrawingTime] = useState<number>(0);
  const originalCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [showEnhanceDialog, setShowEnhanceDialog] = useState(false);
  const [showGridDialog, setShowGridDialog] = useState(false);
  const [showGridPreview, setShowGridPreview] = useState(false);
  const [gridImages, setGridImages] = useState<string[]>([]);
  const [gridConfig, setGridConfig] = useState<{ rows: number; cols: number }>({ rows: 3, cols: 3 });
  const [beforeImage, setBeforeImage] = useState<string | null>(null);
  const [afterImage, setAfterImage] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const originalImageRef = useRef<HTMLImageElement | null>(null);
  const preEnhanceImageRef = useRef<HTMLImageElement | null>(null);

  const [adjustments, setAdjustments] = useState({
    exposure: 0,
    contrast: 0,
    brightness: 0,
    saturation: 0,
    highlights: 0,
    shadows: 0,
    temperature: 0,
    tint: 0,
    clarity: 0,
    vibrance: 0,
  });

  useEffect(() => {
    if (selectedImage && canvasRef.current && originalImageRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = originalImageRef.current.width;
      canvas.height = originalImageRef.current.height;
      ctx.drawImage(originalImageRef.current, 0, 0);

      applyAdjustments(canvas, adjustments);

      // Update after image for comparison immediately
      canvas.toBlob((blob) => {
        if (blob) {
          setAfterImage(URL.createObjectURL(blob));
        }
      }, 'image/png');
    }
  }, [adjustments, selectedImage]);

  const handleImageSelect = async (file: File) => {
    setSelectedImage(file);
    const img = await loadImage(file);
    originalImageRef.current = img;

    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      // Set initial before and after images from canvas
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          setBeforeImage(url);
          setAfterImage(url);
        }
      }, 'image/png');
    }

    toast.success('Gambar berhasil dimuat!');
  };

  const handleRemoveBackground = async () => {
    if (!selectedImage || !originalImageRef.current) {
      toast.error('Pilih gambar terlebih dahulu');
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    try {
      const blob = await removeBackground(
        originalImageRef.current,
        (prog) => setProgress(prog)
      );

      const url = URL.createObjectURL(blob);
      setProcessedImage(url);
      setAfterImage(url); // Update after image for comparison

      const img = await loadImage(blob);
      originalImageRef.current = img;

      if (canvasRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
      }
      
      toast.success('Background berhasil dihapus!');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Gagal menghapus background. Coba lagi.');
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const saveCanvasState = () => {
    if (!canvasRef.current) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);

    // Remove future history if we're not at the end
    const newHistory = canvasHistory.slice(0, historyIndex + 1);
    newHistory.push(imageData);

    // Limit history to 20 states
    if (newHistory.length > 20) {
      newHistory.shift();
    } else {
      setHistoryIndex(newHistory.length - 1);
    }

    setCanvasHistory(newHistory);
  };

  const handleUndo = () => {
    if (historyIndex > 0 && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) return;

      setHistoryIndex(historyIndex - 1);
      ctx.putImageData(canvasHistory[historyIndex - 1], 0, 0);

      // Update after image for comparison
      canvasRef.current.toBlob((blob) => {
        if (blob) {
          setAfterImage(URL.createObjectURL(blob));
        }
      }, 'image/png');

      toast.success('Undo berhasil');
    } else {
      toast.error('Tidak ada yang bisa di-undo');
    }
  };

  const handleRedo = () => {
    if (historyIndex < canvasHistory.length - 1 && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) return;

      setHistoryIndex(historyIndex + 1);
      ctx.putImageData(canvasHistory[historyIndex + 1], 0, 0);

      // Update after image for comparison
      canvasRef.current.toBlob((blob) => {
        if (blob) {
          setAfterImage(URL.createObjectURL(blob));
        }
      }, 'image/png');

      toast.success('Redo berhasil');
    } else {
      toast.error('Tidak ada yang bisa di-redo');
    }
  };

  const handleManualEdit = () => {
    setIsManualMode(!isManualMode);
    if (isManualMode) {
      setDrawingTool(null);
      setIsDrawing(false);

      // Clear any pending auto-apply timer
      if (autoApplyTimer) {
        clearTimeout(autoApplyTimer);
        setAutoApplyTimer(null);
      }
    } else {
      // Store original image for restoration when using pen tool
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          // Create a hidden canvas to store the original image
          const originalCanvas = document.createElement('canvas');
          originalCanvas.width = canvasRef.current.width;
          originalCanvas.height = canvasRef.current.height;
          const originalCtx = originalCanvas.getContext('2d');
          if (originalCtx) {
            originalCtx.drawImage(canvasRef.current, 0, 0);
            originalCanvasRef.current = originalCanvas;
          }

          // Initialize history with current state
          const imageData = ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
          setCanvasHistory([imageData]);
          setHistoryIndex(0);
        }
      }
    }
    toast.info(isManualMode ? 'Mode manual dinonaktifkan' : 'Mode manual diaktifkan');
  };

  const handleEraserTool = () => {
    if (!isManualMode) return;
    setDrawingTool('eraser');
    toast.info('Tool penghapus diaktifkan - klik dan geser untuk menghapus bagian gambar');
  };

  const handlePenTool = () => {
    if (!isManualMode) return;
    setDrawingTool('pen');
    toast.info('Tool pulpen diaktifkan - klik dan geser untuk mengembalikan bagian gambar');
  };

  const handleEnhanceHD = async (resolution: '2k' | '4k' | '8k') => {
    if (!canvasRef.current) {
      toast.error('Tidak ada gambar untuk ditingkatkan');
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    try {
      // Store the current image before enhancement for undo functionality
      if (canvasRef.current) {
        canvasRef.current.toBlob((blob) => {
          if (blob) {
            const img = new Image();
            img.onload = () => {
              preEnhanceImageRef.current = img;
            };
            img.src = URL.createObjectURL(blob);
          }
        });
      }

      const blob = await upscaleImage(
        canvasRef.current,
        resolution,
        (prog) => setProgress(prog)
      );

      const img = await loadImage(blob);
      originalImageRef.current = img;

      if (canvasRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        // Update after image for comparison
        canvas.toBlob((blob) => {
          if (blob) {
            setAfterImage(URL.createObjectURL(blob));
          }
        }, 'image/png');
      }

      toast.success(`Kualitas ditingkatkan ke ${resolution.toUpperCase()}!`, {
        description: `Resolusi: ${img.width}x${img.height}px • HD Enhanced`
      });
    } catch (error) {
      console.error('Error enhancing image:', error);
      toast.error('Gagal meningkatkan kualitas gambar');
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const handleGenerateGrid = async (rows: number, cols: number) => {
    if (!canvasRef.current) {
      toast.error('Tidak ada gambar untuk dibuat grid');
      return;
    }

    setIsProcessing(true);
    setGridConfig({ rows, cols });

    try {
      const blobs = await generateGrid(canvasRef.current, rows, cols);
      const urls = blobs.map(blob => URL.createObjectURL(blob));
      setGridImages(urls);
      setShowGridPreview(true);
      
      const totalParts = rows * cols;
      toast.success(`Grid ${rows}×${cols} berhasil dibuat!`, {
        description: `${totalParts} postingan Instagram siap diupload`
      });
    } catch (error) {
      console.error('Error generating grid:', error);
      toast.error('Gagal membuat grid');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadAllGrid = () => {
    gridImages.forEach((url, index) => {
      fetch(url)
        .then(res => res.blob())
        .then(blob => {
          const a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = `rumpi-grid-${gridConfig.rows}x${gridConfig.cols}-part-${String(index + 1).padStart(2, '0')}.png`;
          a.click();
        });
    });
    
    toast.success(`${gridImages.length} gambar berhasil diunduh!`);
  };

  const handleReset = () => {
    setAdjustments({
      exposure: 0,
      contrast: 0,
      brightness: 0,
      saturation: 0,
      highlights: 0,
      shadows: 0,
      temperature: 0,
      tint: 0,
      clarity: 0,
      vibrance: 0,
    });

    // Reset canvas to original image
    if (originalImageRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = originalImageRef.current.width;
      canvas.height = originalImageRef.current.height;
      ctx.drawImage(originalImageRef.current, 0, 0);

      // Update after image for comparison
      canvas.toBlob((blob) => {
        if (blob) {
          setAfterImage(URL.createObjectURL(blob));
        }
      }, 'image/png');
    }

    toast.success('Pengaturan Lightroom direset');
  };

  const handleUndoEnchant = () => {
    if (!preEnhanceImageRef.current || !canvasRef.current) {
      toast.error('Tidak ada enhancement untuk di-undo');
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Restore the image to pre-enhancement state
    canvas.width = preEnhanceImageRef.current.width;
    canvas.height = preEnhanceImageRef.current.height;
    ctx.drawImage(preEnhanceImageRef.current, 0, 0);

    // Update originalImageRef to the pre-enhanced state
    originalImageRef.current = preEnhanceImageRef.current;

    // Update after image for comparison
    canvas.toBlob((blob) => {
      if (blob) {
        setAfterImage(URL.createObjectURL(blob));
      }
    }, 'image/png');

    // Clear the pre-enhance reference
    preEnhanceImageRef.current = null;

    toast.success('Enhancement berhasil di-undo');
  };

  const handleDownload = () => {
    if (!canvasRef.current) {
      toast.error('Tidak ada gambar untuk diunduh');
      return;
    }

    canvasRef.current.toBlob((blob) => {
      if (!blob) return;
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rumpi-edited-${Date.now()}.png`;
      a.click();
      
      toast.success('Gambar berhasil diunduh!');
    }, 'image/png');
  };

  const handleAdjustmentChange = (key: string, value: number) => {
    setAdjustments((prev) => ({ ...prev, [key]: value }));
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isManualMode || !drawingTool || !canvasRef.current) return;

    setIsDrawing(true);
    setLastDrawingTime(Date.now());

    // Clear any existing auto-apply timer
    if (autoApplyTimer) {
      clearTimeout(autoApplyTimer);
      setAutoApplyTimer(null);
    }

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(x, y);

    if (drawingTool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = 20;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    } else if (drawingTool === 'pen') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.lineWidth = 20;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      // Use the original image data for restoration
      if (originalCanvasRef.current) {
        const originalCtx = originalCanvasRef.current.getContext('2d');
        if (originalCtx) {
          ctx.strokeStyle = 'rgba(0,0,0,0)'; // Transparent stroke
          ctx.globalCompositeOperation = 'source-over';
        }
      }
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !isManualMode || !drawingTool || !canvasRef.current) return;

    setLastDrawingTime(Date.now());

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const handleCanvasMouseUp = () => {
    if (isDrawing) {
      setIsDrawing(false);
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          ctx.globalCompositeOperation = 'source-over';
        }
      }

      // Set up auto-apply timer (2 seconds after last drawing activity)
      const timer = setTimeout(() => {
        if (Date.now() - lastDrawingTime >= 2000) {
          saveCanvasState();

          // Update after image for comparison
          if (canvasRef.current) {
            canvasRef.current.toBlob((blob) => {
              if (blob) {
                setAfterImage(URL.createObjectURL(blob));
              }
            }, 'image/png');
          }

          toast.success('Perubahan diterapkan');
          setAutoApplyTimer(null);
        }
      }, 2000);

      setAutoApplyTimer(timer);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-soft">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-3">
            <img src="/Rumpi Transparant.webp" alt="Rumpi Logo" className="w-6 h-6 sm:w-8 sm:h-8 object-contain" />
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">Rumpi</h1>
              <p className="text-xs text-muted-foreground">AI Photo Tools</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Editor Area */}
        <div className="flex-1 flex flex-col">
          {selectedImage && (
            <EditorToolbar
              onRemoveBackground={handleRemoveBackground}
              onManualEdit={handleManualEdit}
              onEraserTool={handleEraserTool}
              onPenTool={handlePenTool}
              onUndo={handleUndo}
              onRedo={handleRedo}
              onEnhanceHD={() => setShowEnhanceDialog(true)}
              onGridInstagram={() => setShowGridDialog(true)}
              onReset={handleReset}
              onUndoEnchant={handleUndoEnchant}
              onDownload={handleDownload}
              isProcessing={isProcessing}
              isManualMode={isManualMode}
            />
          )}

          <div className="flex-1 p-4 sm:p-6 bg-gradient-subtle">
            {!selectedImage ? (
              <ImageUploader onImageSelect={handleImageSelect} />
            ) : (
              <div className="space-y-4 sm:space-y-6">
                {/* Before/After Comparison */}
                {beforeImage && afterImage && (
                  <div className="w-full max-w-4xl mx-auto">
                    <BeforeAfterSlider beforeImage={beforeImage} afterImage={afterImage} />
                  </div>
                )}

                {/* Main Canvas */}
                <div className="relative w-full flex items-center justify-center">
                  <canvas
                    ref={canvasRef}
                    className={`max-w-full max-h-[50vh] sm:max-h-[60vh] object-contain rounded-xl shadow-strong ${
                      isManualMode ? 'cursor-crosshair' : ''
                    }`}
                    onMouseDown={handleCanvasMouseDown}
                    onMouseMove={handleCanvasMouseMove}
                    onMouseUp={handleCanvasMouseUp}
                    onMouseLeave={handleCanvasMouseUp}
                  />
                  {isProcessing && (
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-xl z-10">
                      <div className="bg-card p-4 sm:p-6 rounded-2xl shadow-strong max-w-sm w-full mx-4">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="animate-spin">
                            <Sparkles className="w-6 h-6 text-primary" />
                          </div>
                          <span className="font-semibold text-foreground">
                            Memproses gambar...
                          </span>
                        </div>
                        <Progress value={progress} className="h-2" />
                        <p className="text-sm text-muted-foreground mt-2 text-center">
                          {progress}%
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Controls Panel */}
        {selectedImage && (
          <div className="w-full lg:w-80 bg-editor-panel border-l border-border overflow-y-auto">
            <div className="p-4 sm:p-6">
              <EditorControls
                adjustments={adjustments}
                onAdjustmentChange={handleAdjustmentChange}
              />
            </div>
          </div>
        )}
      </div>

      {/* Dialogs */}
      <EnhanceHDDialog
        open={showEnhanceDialog}
        onOpenChange={setShowEnhanceDialog}
        onEnhance={handleEnhanceHD}
      />

      <GridGeneratorDialog
        open={showGridDialog}
        onOpenChange={setShowGridDialog}
        onGenerate={handleGenerateGrid}
        imageSrc={processedImage || (selectedImage ? URL.createObjectURL(selectedImage) : undefined)}
      />

      <GridPreviewDialog
        open={showGridPreview}
        onOpenChange={setShowGridPreview}
        gridImages={gridImages}
        rows={gridConfig.rows}
        cols={gridConfig.cols}
        onDownloadAll={handleDownloadAllGrid}
      />

      {/* Footer */}
      <footer className="bg-card border-t border-border py-3">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <p className="text-xs text-muted-foreground">
            Rumpi - AI Photo Tools • Gratis Selamanya
          </p>
        </div>
      </footer>
>>>>>>> 677dc3b87794334978817b9d4d315f91ccc2ac1b
    </div>
  );
};

export default Index;
