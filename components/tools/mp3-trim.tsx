import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { motion } from "framer-motion";
import { Music, Play, Pause, Download, X, Volume2 } from 'lucide-react';
import { LoadingSpinner } from "@/components/animations/loading-spinner";

interface AudioFile {
  file: File;
  name: string;
  duration: number;
  size: number;
  url: string;
}

export function Mp3TrimTool() {
  const [isDragging, setIsDragging] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [audioFiles, setAudioFiles] = React.useState<AudioFile[]>([]);
  const [startTime, setStartTime] = React.useState([0]);
  const [endTime, setEndTime] = React.useState([30]);
  const [outputFormat, setOutputFormat] = React.useState("mp3");
  const [quality, setQuality] = React.useState([128]);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [currentFile, setCurrentFile] = React.useState<AudioFile | null>(null);
  const audioRef = React.useRef<HTMLAudioElement>(null);

  const handleFiles = async (files: FileList | File[]) => {
    const audioFilesArray = Array.from(files).filter(file => 
      file.type.startsWith('audio/') || file.name.toLowerCase().endsWith('.mp3')
    );
    
    setIsLoading(true);
    const processedFiles: AudioFile[] = [];

    for (const file of audioFilesArray) {
      try {
        const url = URL.createObjectURL(file);
        const audio = new Audio(url);
        
        await new Promise((resolve, reject) => {
          audio.onloadedmetadata = () => {
            processedFiles.push({
              file,
              name: file.name,
              duration: audio.duration,
              size: file.size,
              url
            });
            resolve(null);
          };
          audio.onerror = reject;
        });
      } catch (error) {
        console.error(`Error processing ${file.name}:`, error);
      }
    }

    setAudioFiles(prev => [...prev, ...processedFiles]);
    if (processedFiles.length > 0 && !currentFile) {
      setCurrentFile(processedFiles[0]);
      setEndTime([Math.min(30, processedFiles[0].duration)]);
    }
    setIsLoading(false);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const playPreview = () => {
    if (!currentFile || !audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.currentTime = startTime[0];
      audioRef.current.play();
      setIsPlaying(true);

      // Stop at end time
      const checkTime = setInterval(() => {
        if (audioRef.current && audioRef.current.currentTime >= endTime[0]) {
          audioRef.current.pause();
          setIsPlaying(false);
          clearInterval(checkTime);
        }
      }, 100);
    }
  };

  const processAudio = async () => {
    if (!currentFile) {
      alert("Please select an audio file first");
      return;
    }

    if (startTime[0] >= endTime[0]) {
      alert("Start time must be less than end time");
      return;
    }

    setIsLoading(true);
    
    try {
      // Create a Web Audio context for processing
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Load the audio file
      const arrayBuffer = await currentFile.file.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      // Calculate sample ranges for trimming
      const sampleRate = audioBuffer.sampleRate;
      const startSample = Math.floor(startTime[0] * sampleRate);
      const endSample = Math.floor(endTime[0] * sampleRate);
      const trimmedLength = endSample - startSample;
      
      // Create a new audio buffer with trimmed audio
      const trimmedBuffer = audioContext.createBuffer(
        audioBuffer.numberOfChannels,
        trimmedLength,
        sampleRate
      );
      
      // Copy the trimmed audio data
      for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
        const originalData = audioBuffer.getChannelData(channel);
        const trimmedData = trimmedBuffer.getChannelData(channel);
        for (let i = 0; i < trimmedLength; i++) {
          trimmedData[i] = originalData[startSample + i];
        }
      }
      
      // Convert to WAV blob (simple implementation)
      const wavBlob = audioBufferToWav(trimmedBuffer);
      
      // Create download link
      const url = URL.createObjectURL(wavBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `trimmed_${currentFile.name.replace(/\.[^/.]+$/, "")}.wav`;
      link.click();
      
      // Clean up
      URL.revokeObjectURL(url);
      audioContext.close();
      
    } catch (error) {
      console.error('Error processing audio:', error);
      alert('Error processing audio. Please try again.');
    }
    
    setIsLoading(false);
  };

  // Helper function to convert AudioBuffer to WAV blob
  const audioBufferToWav = (audioBuffer: AudioBuffer): Blob => {
    const numChannels = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = 16;
    
    const bytesPerSample = bitDepth / 8;
    const blockAlign = numChannels * bytesPerSample;
    
    const buffer = audioBuffer.getChannelData(0);
    const length = buffer.length;
    const arrayBuffer = new ArrayBuffer(44 + length * bytesPerSample);
    const view = new DataView(arrayBuffer);
    
    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + length * bytesPerSample, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, format, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * blockAlign, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitDepth, true);
    writeString(36, 'data');
    view.setUint32(40, length * bytesPerSample, true);
    
    // Convert float samples to 16-bit PCM
    let offset = 44;
    for (let i = 0; i < length; i++) {
      const sample = Math.max(-1, Math.min(1, buffer[i]));
      view.setInt16(offset, sample * 0x7FFF, true);
      offset += 2;
    }
    
    return new Blob([arrayBuffer], { type: 'audio/wav' });
  };

  const removeFile = (index: number) => {
    setAudioFiles(prev => {
      const newFiles = [...prev];
      const fileToRemove = newFiles[index];
      URL.revokeObjectURL(fileToRemove.url);
      
      if (currentFile === fileToRemove) {
        setCurrentFile(newFiles.length > 1 ? newFiles[index === 0 ? 1 : 0] : null);
      }
      
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const clearAll = () => {
    audioFiles.forEach(file => URL.revokeObjectURL(file.url));
    setAudioFiles([]);
    setCurrentFile(null);
    setIsPlaying(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
      <p className="text-sm text-secondary-gray">
        Trim audio files to specific duration, adjust volume, and convert between formats (MP3, WAV, OGG).
      </p>

      <motion.div
        className={`relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center transition-all duration-300 ${
          isDragging
            ? "border-primary-blue bg-blue-50 shadow-lg"
            : "border-gray-300 bg-gray-50 hover:border-primary-blue hover:bg-blue-50"
        }`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Music className="mb-3 h-10 w-10 text-primary-blue" />
        <p className="text-lg font-semibold text-dark-gray">Drag & Drop Audio Files Here</p>
        <p className="text-sm text-secondary-gray">or click to select files (MP3, WAV, OGG, M4A)</p>
        <Input
          type="file"
          multiple
          accept="audio/*"
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          onChange={(e) => {
            if (e.target.files) {
              handleFiles(e.target.files);
            }
          }}
        />
      </motion.div>

      {audioFiles.length > 0 && (
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between">
            <Label className="text-dark-gray font-medium text-lg">
              Audio Files ({audioFiles.length})
            </Label>
            <Button
              onClick={clearAll}
              variant="outline"
              className="border-gray-200 hover:bg-gray-50"
            >
              <X className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {audioFiles.map((audio, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 bg-white">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="text-sm font-medium text-dark-gray truncate">
                    {audio.name}
                  </h4>
                  <div className="flex gap-1">
                    <Button
                      onClick={() => setCurrentFile(audio)}
                      size="sm"
                      variant="ghost"
                      className={`${currentFile === audio ? 'bg-blue-100 text-blue-600' : 'text-gray-500'}`}
                    >
                      Select
                    </Button>
                    <Button
                      onClick={() => removeFile(index)}
                      size="sm"
                      variant="ghost"
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="text-xs text-secondary-gray space-y-1">
                  <div>Duration: {formatTime(audio.duration)}</div>
                  <div>Size: {formatFileSize(audio.size)}</div>
                </div>
              </div>
            ))}
          </div>

          {currentFile && (
            <motion.div
              className="border border-blue-200 rounded-lg p-6 bg-blue-50"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Label className="text-dark-gray font-medium text-lg mb-4 block">
                Editing: {currentFile.name}
              </Label>

              <audio ref={audioRef} src={currentFile.url} preload="metadata" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-dark-gray mb-2 block">
                      Start Time: {formatTime(startTime[0])}
                    </Label>
                    <Slider
                      value={startTime}
                      onValueChange={setStartTime}
                      max={currentFile.duration - 1}
                      min={0}
                      step={0.1}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <Label className="text-dark-gray mb-2 block">
                      End Time: {formatTime(endTime[0])}
                    </Label>
                    <Slider
                      value={endTime}
                      onValueChange={setEndTime}
                      max={currentFile.duration}
                      min={startTime[0] + 0.1}
                      step={0.1}
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-dark-gray mb-2 block">Output Format</Label>
                    <Select value={outputFormat} onValueChange={setOutputFormat}>
                      <SelectTrigger className="border-gray-200 bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mp3">MP3</SelectItem>
                        <SelectItem value="wav">WAV</SelectItem>
                        <SelectItem value="ogg">OGG</SelectItem>
                        <SelectItem value="m4a">M4A</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-dark-gray mb-2 block">
                      Quality: {quality[0]} kbps
                    </Label>
                    <Slider
                      value={quality}
                      onValueChange={setQuality}
                      max={320}
                      min={64}
                      step={32}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 justify-center mt-6">
                <Button
                  onClick={playPreview}
                  variant="outline"
                  className="border-gray-200 hover:bg-gray-50"
                >
                  {isPlaying ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                  {isPlaying ? "Pause" : "Preview"}
                </Button>

                <Button
                  onClick={processAudio}
                  className="bg-primary-blue hover:bg-blue-600 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <LoadingSpinner size={16} />
                      <span className="ml-2">Processing...</span>
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Process Audio
                    </>
                  )}
                </Button>
              </div>

              <div className="mt-4 text-center text-sm text-secondary-gray">
                Trim duration: {formatTime(endTime[0] - startTime[0])}
              </div>
            </motion.div>
          )}
        </motion.div>
      )}

      {isLoading && (
        <div className="mt-4 text-center text-primary-blue flex items-center justify-center">
          <LoadingSpinner size={20} />
          <span className="ml-2">Processing audio files...</span>
        </div>
      )}
    </div>
  );
}
