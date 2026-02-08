import React, { useState } from 'react';
import { apiService } from '../services/apiService';

const FileUpload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setUploadResult(null);
      setError(null);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.name.endsWith('.xlsx') || droppedFile.name.endsWith('.xls')) {
        setFile(droppedFile);
        setUploadResult(null);
        setError(null);
      } else {
        setError('Please upload an Excel file (.xlsx or .xls)');
      }
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    try {
      setUploading(true);
      setError(null);
      
      const result = await apiService.uploadFile(file);
      setUploadResult(result);
      
      // Clear file input
      setFile(null);
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
    } catch (e: any) {
      setError(e?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    setUploadResult(null);
    setError(null);
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="px-8 py-8 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/30 shadow-2xl">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Upload Claims Data
                </h1>
                <p className="text-blue-100 text-sm">
                  Upload Excel files for instant AI-powered fraud detection and analysis
                </p>
              </div>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="px-8 py-5 bg-gradient-to-r from-blue-50 to-indigo-50 border-t border-blue-100">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Processing Speed</p>
                  <p className="text-sm font-bold text-gray-900">Instant Analysis</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Supported Formats</p>
                  <p className="text-sm font-bold text-gray-900">.xlsx, .xls</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Security</p>
                  <p className="text-sm font-bold text-gray-900">Encrypted Upload</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Upload Area */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
          
          {/* Drag & Drop Zone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`
              relative border-3 border-dashed rounded-2xl p-12 text-center transition-all duration-200
              ${dragActive 
                ? 'border-blue-500 bg-blue-50' 
                : file 
                  ? 'border-green-300 bg-green-50' 
                  : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
              }
            `}
          >
            {!file ? (
              <>
                {/* Upload Icon */}
                <div className="mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                    <svg className="w-10 h-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {dragActive ? 'Drop your file here' : 'Upload Excel File'}
                </h3>
                <p className="text-gray-600 mb-6">
                  Drag and drop your file here, or click to browse
                </p>

                <label htmlFor="file-upload" className="cursor-pointer">
                  <span className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                    Choose File
                  </span>
                  <input
                    id="file-upload"
                    type="file"
                    accept=".xlsx,.xls"
                    className="sr-only"
                    onChange={handleFileSelect}
                  />
                </label>

                <p className="mt-4 text-sm text-gray-500">
                  Supported formats: <span className="font-semibold text-gray-700">.xlsx, .xls</span>
                </p>
              </>
            ) : (
              /* File Selected */
              <div className="space-y-6">
                <div className="flex items-center justify-center">
                  <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center">
                    <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>

                <div className="bg-white border-2 border-green-200 rounded-xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-lg font-bold text-gray-900 truncate">
                        {file.name}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Size: <span className="font-semibold text-gray-900">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Ready to Upload
                        </span>
                        <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                          Excel Format
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={clearFile}
                      className="flex-shrink-0 w-10 h-10 bg-red-50 hover:bg-red-100 rounded-xl flex items-center justify-center transition-colors"
                    >
                      <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Upload Button */}
                <div className="flex gap-3">
                  <button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {uploading ? (
                      <>
                        <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className="text-lg">Processing Claims...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <span className="text-lg">Upload & Analyze</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-6 bg-red-50 border-2 border-red-200 rounded-2xl p-6 animate-fade-in">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-red-900 mb-1">Upload Failed</h4>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
                <button
                  onClick={() => setError(null)}
                  className="flex-shrink-0 text-red-400 hover:text-red-600"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Success Message */}
          {uploadResult && (
            <div className="mt-6 bg-green-50 border-2 border-green-200 rounded-2xl p-6 animate-fade-in">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-green-900 mb-3">Upload Successful!</h4>
                  
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white rounded-xl p-3 border border-green-200">
                        <p className="text-xs text-gray-500 mb-1">Filename</p>
                        <p className="text-sm font-bold text-gray-900">{uploadResult.filename}</p>
                      </div>
                      <div className="bg-white rounded-xl p-3 border border-green-200">
                        <p className="text-xs text-gray-500 mb-1">Records Processed</p>
                        <p className="text-sm font-bold text-gray-900">{uploadResult.records_processed?.toLocaleString()}</p>
                      </div>
                    </div>

                    {uploadResult.fraud_summary && (
                      <div className="bg-white rounded-xl p-4 border border-green-200">
                        <p className="text-sm font-bold text-gray-900 mb-3">AI Fraud Analysis Results:</p>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                              <svg className="w-4 h-4 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Fraud Rate</p>
                              <p className="text-sm font-bold text-gray-900">{uploadResult.fraud_summary.fraud_rate}%</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                              <svg className="w-4 h-4 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Duplicates</p>
                              <p className="text-sm font-bold text-gray-900">{uploadResult.fraud_summary.duplicate_claims}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                              <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Suspicious Qty</p>
                              <p className="text-sm font-bold text-gray-900">{uploadResult.fraud_summary.suspicious_qty_claims}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                              <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Outliers</p>
                              <p className="text-sm font-bold text-gray-900">{uploadResult.fraud_summary.outlier_claims}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <p className="text-sm text-blue-800 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-semibold">Switch to the Dashboard tab to view detailed AI fraud analysis results.</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

       

      </div>
    </div>
  );
};

export default FileUpload;