import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UploadCloud,
  FileText,
  PlayCircle,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ArrowRight,
} from 'lucide-react';
import { api } from '../services/api';

const PROGRESS_STAGES = [
  { id: 1, label: 'Uploading PDF document' },
  { id: 2, label: 'Extracting text layout (PyMuPDF)' },
  { id: 3, label: 'Detecting and segmenting clauses' },
  { id: 4, label: 'Identifying structured obligations' },
  { id: 5, label: 'Constructing obligation relationship graph' },
  { id: 6, label: 'Generating timeline & proactive reminders' },
];

export const UploadPage: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStage, setCurrentStage] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loadingDemo, setLoadingDemo] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    setErrorMessage(null);
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setErrorMessage('Only PDF documents are supported at this stage.');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setErrorMessage('File size exceeds the maximum limit of 20MB.');
      return;
    }
    setSelectedFile(file);
  };

  const processUpload = async (file: File) => {
    setIsProcessing(true);
    setErrorMessage(null);
    setCurrentStage(1);

    const timer1 = setTimeout(() => setCurrentStage(2), 600);
    const timer2 = setTimeout(() => setCurrentStage(3), 1200);
    const timer3 = setTimeout(() => setCurrentStage(4), 1800);
    const timer4 = setTimeout(() => setCurrentStage(5), 2400);
    const timer5 = setTimeout(() => setCurrentStage(6), 3000);

    try {
      const contract = await api.uploadContract(file);
      setCurrentStage(6);
      setTimeout(() => {
        navigate(`/contracts/${contract.id}`);
      }, 500);
    } catch (err: any) {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timer5);
      setIsProcessing(false);
      setCurrentStage(0);
      setErrorMessage(
        err.message ||
          "We couldn't extract text from this PDF. Please ensure the document has selectable text."
      );
    }
  };

  const handleStartUpload = () => {
    if (selectedFile) {
      processUpload(selectedFile);
    }
  };

  const handleLoadDemo = async () => {
    try {
      setLoadingDemo(true);
      setErrorMessage(null);
      const contract = await api.loadDemoContract();
      navigate(`/contracts/${contract.id}`);
    } catch (err: any) {
      setLoadingDemo(false);
      setErrorMessage('Failed to load demo agreement. Ensure backend server is running.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          Upload Contract
        </h1>
        <p className="text-obsidian-400 text-sm">
          Extract obligations, deadlines, and dependencies from your rental agreement or contract.
        </p>
      </div>

      {/* Try Demo Shortcut Card */}
      <div className="editorial-card p-4 sm:p-5 bg-obsidian-900 border border-obsidian-750 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-obsidian-800 border border-obsidian-700 flex items-center justify-center text-obsidian-300 flex-shrink-0">
            <PlayCircle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-white">No document to test with?</h3>
            <p className="text-[11px] text-obsidian-400">
              Load our bundled 12-clause <strong>Residential Rental Agreement</strong> instantly.
            </p>
          </div>
        </div>
        <button
          id="load-demo-btn"
          onClick={handleLoadDemo}
          disabled={loadingDemo || isProcessing}
          className="w-full sm:w-auto px-3.5 py-1.5 rounded-lg bg-white hover:bg-neutral-200 text-obsidian-950 text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-all flex-shrink-0 disabled:opacity-50"
        >
          {loadingDemo ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Loading...</span>
            </>
          ) : (
            <>
              <PlayCircle className="w-3.5 h-3.5 text-obsidian-950" />
              <span>Try Demo Agreement</span>
            </>
          )}
        </button>
      </div>

      {/* Drag & Drop Area */}
      {!isProcessing ? (
        <div className="space-y-6">
          <div
            id="dropzone"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer rounded-2xl border border-dashed p-10 text-center transition-all ${
              dragOver
                ? 'border-white bg-obsidian-800'
                : selectedFile
                ? 'border-emerald-500/60 bg-emerald-500/5'
                : 'border-obsidian-700 bg-obsidian-900/60 hover:border-obsidian-600 hover:bg-obsidian-850'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={handleFileChange}
            />

            <div className="w-12 h-12 rounded-xl bg-obsidian-850 border border-obsidian-750 mx-auto flex items-center justify-center mb-4 text-obsidian-300">
              {selectedFile ? (
                <FileText className="w-6 h-6 text-emerald-400" />
              ) : (
                <UploadCloud className="w-6 h-6" />
              )}
            </div>

            {selectedFile ? (
              <div>
                <p className="text-sm font-semibold text-white mb-1">{selectedFile.name}</p>
                <p className="text-xs text-obsidian-400 font-mono">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to analyze
                </p>
                <p className="text-xs text-emerald-400 mt-2 font-medium">
                  Click or drag another file to replace
                </p>
              </div>
            ) : (
              <div>
                <p className="text-sm font-medium text-obsidian-200 mb-1">
                  Drag and drop your PDF here, or <span className="text-white underline font-semibold">browse</span>
                </p>
                <p className="text-xs text-obsidian-500 mt-1">
                  PDF format with selectable text (up to 20MB)
                </p>
              </div>
            )}
          </div>

          {/* Error notice */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="leading-relaxed">{errorMessage}</div>
            </div>
          )}

          {/* Submit Button */}
          <button
            id="start-upload-btn"
            onClick={handleStartUpload}
            disabled={!selectedFile}
            className="w-full py-3 rounded-xl bg-white hover:bg-neutral-200 text-obsidian-950 font-semibold text-xs shadow-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            <span>Process & Extract Obligations</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        /* Progress Indicator */
        <div className="editorial-card p-6 sm:p-8 bg-obsidian-900 border border-obsidian-750 space-y-6">
          <div className="text-center">
            <Loader2 className="w-6 h-6 text-white animate-spin mx-auto mb-2" />
            <h3 className="text-sm font-bold text-white">Extracting Contract Intelligence</h3>
            <p className="text-xs text-obsidian-400 mt-0.5">
              Parsing clauses, extracting obligation schema, and building graph...
            </p>
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            {PROGRESS_STAGES.map((stage) => {
              const isDone = currentStage > stage.id;
              const isCurrent = currentStage === stage.id;

              return (
                <div
                  key={stage.id}
                  className={`p-2.5 rounded-lg border text-xs flex items-center justify-between transition-colors ${
                    isDone
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : isCurrent
                      ? 'bg-obsidian-800 border-obsidian-650 text-white font-medium'
                      : 'bg-obsidian-950 border-obsidian-800 text-obsidian-500'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-mono border border-current">
                      {stage.id}
                    </span>
                    <span>{stage.label}</span>
                  </div>

                  <div>
                    {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                    {isCurrent && <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
