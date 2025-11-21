import React, { useState, useRef, useEffect } from 'react';
import { 
  UploadCloud, 
  Zap, 
  Copy, 
  Download, 
  Video as VideoIcon, 
  FileText, 
  AlertCircle 
} from 'lucide-react';
import { Button } from './components/Button';
import { ToggleGroup } from './components/ToggleGroup';
import { Tone, ScriptLength, Platform, GenerationOptions } from './types';
import { generateScriptFromVideo } from './services/geminiService';

const App: React.FC = () => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [generatedScript, setGeneratedScript] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [options, setOptions] = useState<GenerationOptions>({
    tone: Tone.MYSTERY,
    length: ScriptLength.MEDIUM,
    platform: Platform.TIKTOK
  });

  // Cleanup object URL on unmount
  useEffect(() => {
    return () => {
      if (videoUrl) URL.revokeObjectURL(videoUrl);
    };
  }, [videoUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        setError("File size exceeds 50MB limit for this demo.");
        return;
      }
      if (!file.type.startsWith('video/')) {
        setError("Please upload a valid video file.");
        return;
      }
      
      setVideoFile(file);
      setVideoUrl(URL.createObjectURL(file));
      setError(null);
      setGeneratedScript(""); // Clear previous script
    }
  };

  const handleGenerate = async () => {
    if (!videoFile) return;

    setIsGenerating(true);
    setError(null);

    try {
      const script = await generateScriptFromVideo(videoFile, options);
      setGeneratedScript(script);
    } catch (err: any) {
      setError(err.message || "Failed to generate script");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (generatedScript) {
      navigator.clipboard.writeText(generatedScript);
    }
  };

  const handleDownload = () => {
    if (generatedScript) {
      const blob = new Blob([generatedScript], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `irshad_script_${Date.now()}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const triggerFileInput = () => fileInputRef.current?.click();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-8 selection:bg-blue-500/30 selection:text-blue-200">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Header (Span full width) */}
        <div className="col-span-1 lg:col-span-12 mb-4 flex items-center justify-center lg:justify-start">
           <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
               <Zap className="text-white w-6 h-6" fill="currentColor" />
             </div>
             <h1 className="text-2xl font-bold tracking-tight text-white">
               IRSHAD <span className="text-blue-500">Script Studio</span>
             </h1>
           </div>
        </div>

        {/* Left Column: Inputs & Preview */}
        <div className="col-span-1 lg:col-span-7 flex flex-col gap-6">
          
          {/* Video Uploader / Preview Area */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl overflow-hidden relative group">
            {!videoUrl ? (
              <div 
                onClick={triggerFileInput}
                className="border-2 border-dashed border-slate-700 rounded-xl h-64 md:h-80 flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-blue-500 hover:bg-slate-800/50 transition-all group"
              >
                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                  <UploadCloud className="w-8 h-8 text-slate-400 group-hover:text-blue-400" />
                </div>
                <div className="text-center">
                  <p className="text-lg font-medium text-slate-300">Click to Upload Video</p>
                  <p className="text-sm text-slate-500 mt-1">MP4, MOV, WebM (Max 50MB)</p>
                </div>
              </div>
            ) : (
              <div className="relative rounded-xl overflow-hidden bg-black h-full min-h-[320px] flex items-center justify-center">
                <video 
                  src={videoUrl} 
                  className="max-h-[500px] w-full object-contain" 
                  controls 
                  playsInline
                />
                <button 
                  onClick={() => { setVideoFile(null); setVideoUrl(null); setGeneratedScript(""); }}
                  className="absolute top-4 right-4 bg-black/60 hover:bg-red-600/80 text-white p-2 rounded-full backdrop-blur-sm transition-all"
                  title="Remove Video"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </div>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="video/mp4,video/quicktime,video/webm" 
              className="hidden" 
            />
          </div>

          {/* Options Panel */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
              Configuration
            </h2>
            <div className="space-y-6">
              <ToggleGroup 
                label="Tone & Vibe" 
                options={Object.values(Tone)} 
                value={options.tone} 
                onChange={(val) => setOptions({...options, tone: val as Tone})} 
              />
              <ToggleGroup 
                label="Target Platform" 
                options={Object.values(Platform)} 
                value={options.platform} 
                onChange={(val) => setOptions({...options, platform: val as Platform})} 
              />
              <ToggleGroup 
                label="Script Length" 
                options={Object.values(ScriptLength)} 
                value={options.length} 
                onChange={(val) => setOptions({...options, length: val as ScriptLength})} 
              />
            </div>
          </div>

          {/* Generate Button */}
          <Button 
            variant="primary" 
            fullWidth 
            className="py-4 text-lg shadow-blue-500/20"
            disabled={!videoFile}
            onClick={handleGenerate}
            isLoading={isGenerating}
            icon={Zap}
          >
            {isGenerating ? 'Analyzing Visuals...' : 'Generate Viral Script'}
          </Button>

          {error && (
             <div className="bg-red-500/10 border border-red-500/20 text-red-200 p-4 rounded-xl flex items-start gap-3">
               <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
               <p className="text-sm">{error}</p>
             </div>
          )}

        </div>

        {/* Right Column: Output */}
        <div className="col-span-1 lg:col-span-5 flex flex-col h-full min-h-[500px]">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col h-full overflow-hidden">
            {/* Output Header */}
            <div className="bg-slate-800/50 border-b border-slate-700 p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-400" />
                <h3 className="font-semibold text-slate-200">Generated Script</h3>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={handleCopy}
                  disabled={!generatedScript}
                  className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors" 
                  title="Copy to Clipboard"
                >
                  <Copy className="w-5 h-5" />
                </button>
                <button 
                  onClick={handleDownload}
                  disabled={!generatedScript}
                  className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Download Text File"
                >
                  <Download className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Output Body */}
            <div className="flex-1 p-6 overflow-y-auto bg-[#0B1120] relative">
              {!generatedScript && !isGenerating && (
                <div className="h-full flex flex-col items-center justify-center text-slate-600 opacity-60">
                   <VideoIcon className="w-12 h-12 mb-4 stroke-1" />
                   <p>Upload a video to start generating</p>
                </div>
              )}

              {isGenerating && (
                <div className="space-y-4 animate-pulse">
                  <div className="h-8 bg-slate-800 rounded w-3/4 mb-6"></div>
                  <div className="h-4 bg-slate-800 rounded w-full"></div>
                  <div className="h-4 bg-slate-800 rounded w-5/6"></div>
                  <div className="h-4 bg-slate-800 rounded w-full"></div>
                  <div className="h-4 bg-slate-800 rounded w-4/5"></div>
                  <div className="h-4 bg-slate-800 rounded w-full"></div>
                </div>
              )}

              {generatedScript && (
                <div className="prose prose-invert max-w-none">
                  <div className="whitespace-pre-line text-lg leading-relaxed font-medium text-slate-200">
                    {generatedScript}
                  </div>
                </div>
              )}
            </div>
            
            {/* Footer Actions */}
            {generatedScript && (
              <div className="p-4 border-t border-slate-800 bg-slate-800/30 flex gap-3">
                 <Button variant="secondary" className="flex-1 text-sm py-2" onClick={handleCopy} icon={Copy}>
                   Copy Text
                 </Button>
                 <Button variant="outline" className="flex-1 text-sm py-2" onClick={handleDownload} icon={Download}>
                   Download
                 </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
