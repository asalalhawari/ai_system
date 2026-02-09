import React, { useState, useEffect } from 'react';
import { AIFraudCasesResponse } from '../types/dashboard';
import { formatCurrency } from '../utils/formatters';

interface FraudCasesProps {
  fraudCases: AIFraudCasesResponse | null;
}

const FraudCases: React.FC<FraudCasesProps> = ({ fraudCases }) => {
  const [selectedCase, setSelectedCase] = useState<number | null>(null);
  const [filterRisk, setFilterRisk] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(3);

  // Close modal on ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsModalOpen(false);
      }
    };
    if (isModalOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen]);

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filterRisk]);

  const openModal = (idx: number) => {
    setSelectedCase(idx);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedCase(null), 300);
  };

  if (!fraudCases || !fraudCases.fraud_cases || fraudCases.fraud_cases.length === 0) {
    return (
      <div className="text-center py-24">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl mb-8 border border-emerald-100 shadow-sm">
          <svg className="w-12 h-12 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-3xl font-bold text-gray-900 mb-4">All Clear!</h3>
        <p className="text-lg text-gray-600 max-w-lg mx-auto mb-10 leading-relaxed">
          No high-priority fraud cases detected. Your claims are looking healthy.
        </p>
        <div className="inline-flex items-center gap-4 px-6 py-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200 shadow-sm">
          <div className="relative">
            <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
            <div className="absolute inset-0 w-3 h-3 bg-emerald-400 rounded-full animate-ping"></div>
          </div>
          <span className="text-sm font-bold text-emerald-900">System Monitoring Active</span>
        </div>
      </div>
    );
  }

  const getRiskLevel = (score: number): 'high' | 'medium' | 'low' => {
    if (score >= 0.7) return 'high';
    if (score >= 0.5) return 'medium';
    return 'low';
  };

  const getRiskConfig = (level: 'high' | 'medium' | 'low') => {
    const configs = {
      high: {
        bgGradient: 'from-blue-700 via-blue-800 to-blue-900',
        cardBg: 'bg-white',
        borderClass: 'border-gray-200',
        textClass: 'text-gray-900',
        badgeClass: 'bg-blue-50 text-blue-900 border-blue-200',
        dotClass: 'bg-blue-800',
        ringClass: 'ring-blue-800',
        buttonClass: 'bg-blue-800 hover:bg-blue-900',
        label: 'Critical',
        priority: 'Immediate Action',
        icon: (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        )
      },
      medium: {
        bgGradient: 'from-blue-500 via-blue-600 to-blue-700',
        cardBg: 'bg-white',
        borderClass: 'border-gray-200',
        textClass: 'text-gray-900',
        badgeClass: 'bg-blue-50 text-blue-800 border-blue-200',
        dotClass: 'bg-blue-600',
        ringClass: 'ring-blue-600',
        buttonClass: 'bg-blue-600 hover:bg-blue-700',
        label: 'Warning',
        priority: 'Review Soon',
        icon: (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        )
      },
      low: {
        bgGradient: 'from-blue-400 via-blue-500 to-blue-600',
        cardBg: 'bg-white',
        borderClass: 'border-gray-200',
        textClass: 'text-gray-900',
        badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
        dotClass: 'bg-blue-500',
        ringClass: 'ring-blue-500',
        buttonClass: 'bg-blue-500 hover:bg-blue-600',
        label: 'Monitor',
        priority: 'Routine Check',
        icon: (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        )
      }
    };
    return configs[level];
  };

  const filteredCases = fraudCases.fraud_cases.filter(c => {
    if (filterRisk === 'all') return true;
    return getRiskLevel(c.fraud_score) === filterRisk;
  });

  const riskCounts = {
    high: fraudCases.fraud_cases.filter(c => getRiskLevel(c.fraud_score) === 'high').length,
    medium: fraudCases.fraud_cases.filter(c => getRiskLevel(c.fraud_score) === 'medium').length,
    low: fraudCases.fraud_cases.filter(c => getRiskLevel(c.fraud_score) === 'low').length,
  };

  // Pagination calculations
  const totalPages = Math.ceil(filteredCases.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentCases = filteredCases.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="space-y-6">
      
      {/* Compact Header with Inline Stats */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-md">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Fraud Detection System</h2>
              <p className="text-gray-500 text-sm">AI-powered risk assessment</p>
            </div>
          </div>

          {/* Inline Stats */}
          <div className="flex items-center gap-8">
            <div className="text-center">
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">Flagged</p>
              <p className="text-3xl font-bold text-gray-900">{fraudCases.total_flagged}</p>
            </div>
            <div className="h-12 w-px bg-gray-300"></div>
            <div className="text-center">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Analyzed</p>
              <p className="text-3xl font-bold text-gray-900">{fraudCases.total_analyzed.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Compact Filter Tabs */}
      <div className="flex items-center gap-3 bg-white rounded-2xl border border-gray-200 p-3 shadow-sm">
        <span className="text-sm font-bold text-gray-700 px-2">Filter:</span>
        
        <button
          onClick={() => setFilterRisk('all')}
          className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
            filterRisk === 'all'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-md'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All Cases ({fraudCases.fraud_cases.length})
        </button>

        <button
          onClick={() => setFilterRisk('high')}
          className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
            filterRisk === 'high'
              ? 'bg-blue-800 text-white shadow-md'
              : 'bg-blue-50 text-blue-900 hover:bg-blue-100 border border-blue-200'
          }`}
        >
          Critical ({riskCounts.high})
        </button>

        <button
          onClick={() => setFilterRisk('medium')}
          className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
            filterRisk === 'medium'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200'
          }`}
        >
          Warning ({riskCounts.medium})
        </button>

        <button
          onClick={() => setFilterRisk('low')}
          className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
            filterRisk === 'low'
              ? 'bg-blue-500 text-white shadow-md'
              : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
          }`}
        >
          Monitor ({riskCounts.low})
        </button>
      </div>

      {/* Pagination Controls - Top */}
      {filteredCases.length > 0 && (
        <div className="flex items-center justify-between bg-white rounded-2xl border border-gray-200 px-5 py-3 shadow-sm">
          <div className="flex items-center gap-3">
            <label className="text-sm font-bold text-gray-700">Rows:</label>
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-3 py-2 bg-white border-2 border-gray-300 rounded-lg text-sm font-bold text-gray-700 hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value={3}>3 rows</option>
              <option value={6}>6 rows</option>
              <option value={9}>9 rows</option>
              <option value={12}>12 rows</option>
            </select>
          </div>
          <div className="text-sm font-bold text-gray-700">
            Page {currentPage} of {totalPages}
          </div>
        </div>
      )}

      {/* Card Grid - 3 per row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {currentCases.map((fraudCase, idx) => {
          const riskLevel = getRiskLevel(fraudCase.fraud_score);
          const config = getRiskConfig(riskLevel);
          const originalIndex = startIndex + idx;

          return (
            <div
              key={originalIndex}
              className="group bg-white rounded-2xl border-2 border-gray-200 overflow-hidden hover:shadow-xl hover:border-blue-400 transition-all duration-300 hover:-translate-y-1"
            >
              {/* Card Header */}
              <div className={`bg-gradient-to-br ${config.bgGradient} p-5 relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full -ml-12 -mb-12"></div>
                
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 bg-white/25 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/40 shadow-lg">
                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          {config.icon}
                        </svg>
                      </div>
                      <div>
                        <p className="text-white/95 text-xs font-bold uppercase tracking-wider mb-1">{config.label}</p>
                        <p className="text-white text-lg font-bold">#{fraudCase.member_id}</p>
                      </div>
                    </div>
                    
                    <div className="bg-white/25 backdrop-blur-sm rounded-xl px-3 py-2 border border-white/40 shadow-md">
                      <div className="text-2xl font-bold text-white leading-none">
                        {(fraudCase.fraud_score * 100).toFixed(0)}%
                      </div>
                    </div>
                  </div>

                  <div className="w-full h-2 bg-white/25 rounded-full overflow-hidden backdrop-blur-sm shadow-inner">
                    <div 
                      className="h-full bg-white rounded-full transition-all duration-500 shadow-sm"
                      style={{ width: `${fraudCase.fraud_score * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 space-y-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="font-bold text-gray-900">{fraudCase.service_date}</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className={`${config.cardBg} rounded-xl p-3 border ${config.borderClass} shadow-sm`}>
                    <p className={`text-xs ${config.textClass} font-bold mb-1 uppercase tracking-wide opacity-75`}>Specialty</p>
                    <p className={`text-sm font-bold ${config.textClass} truncate`} title={fraudCase.specialty_name}>
                      {fraudCase.specialty_name}
                    </p>
                  </div>
                  <div className={`${config.cardBg} rounded-xl p-3 border ${config.borderClass} shadow-sm`}>
                    <p className={`text-xs ${config.textClass} font-bold mb-1 uppercase tracking-wide opacity-75`}>Amount</p>
                    <p className={`text-sm font-bold ${config.textClass}`}>{formatCurrency(fraudCase.gross_claim_amount)}</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2">Flags</p>
                  <div className="flex flex-wrap gap-2">
                    {fraudCase.fraud_reasons.slice(0, 2).map((reason, i) => (
                      <span 
                        key={i}
                        className={`px-2.5 py-1 ${config.badgeClass} rounded-lg text-xs font-bold border truncate max-w-full shadow-sm`}
                        title={reason}
                      >
                        {reason.length > 18 ? reason.substring(0, 18) + '...' : reason}
                      </span>
                    ))}
                    {fraudCase.fraud_reasons.length > 2 && (
                      <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-bold border border-gray-300 shadow-sm">
                        +{fraudCase.fraud_reasons.length - 2}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => openModal(originalIndex)}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-3 ${config.buttonClass} text-white font-bold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl`}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  View Details
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredCases.length === 0 && filterRisk !== 'all' && (
        <div className="text-center py-16 bg-white rounded-2xl border-2 border-gray-200 shadow-sm">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl mb-4 shadow-inner">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Cases Found</h3>
          <p className="text-gray-600 mb-6">No {filterRisk} risk cases match your filter.</p>
          <button
            onClick={() => setFilterRisk('all')}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold rounded-xl transition-all duration-200 shadow-lg"
          >
            View All Cases
          </button>
        </div>
      )}

      {/* Pagination - Bottom */}
      {filteredCases.length > 0 && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 bg-white rounded-2xl border border-gray-200 px-5 py-4 shadow-sm">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded-xl font-bold text-sm transition-all shadow-sm ${
              currentPage === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 border-2 border-gray-300 hover:bg-blue-50 hover:border-blue-500 hover:text-blue-700'
            }`}
          >
            Previous
          </button>

          <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
              const showPage =
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 1 && page <= currentPage + 1);

              if (!showPage) {
                if (page === currentPage - 2 || page === currentPage + 2) {
                  return (
                    <span key={page} className="px-2 text-gray-400 font-bold">...</span>
                  );
                }
                return null;
              }

              return (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`w-10 h-10 rounded-xl font-bold text-sm transition-all shadow-sm ${
                    currentPage === page
                      ? 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-lg'
                      : 'bg-white text-gray-700 border-2 border-gray-300 hover:bg-blue-50 hover:border-blue-500 hover:text-blue-700'
                  }`}
                >
                  {page}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 rounded-xl font-bold text-sm transition-all shadow-sm ${
              currentPage === totalPages
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 border-2 border-gray-300 hover:bg-blue-50 hover:border-blue-500 hover:text-blue-700'
            }`}
          >
            Next
          </button>
        </div>
      )}

      {/* Modal - Improved Design */}
      {isModalOpen && selectedCase !== null && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div 
            className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm transition-opacity duration-300"
            onClick={closeModal}
          ></div>
          
          <div className="flex min-h-screen items-center justify-center p-4">
            <div 
              className="relative bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-hidden transform transition-all duration-300 scale-100"
              onClick={(e) => e.stopPropagation()}
            >
              {(() => {
                const fraudCase = filteredCases[selectedCase];
                const riskLevel = getRiskLevel(fraudCase.fraud_score);
                const config = getRiskConfig(riskLevel);

                return (
                  <>
                    {/* Modal Header */}
                    <div className={`bg-gradient-to-br ${config.bgGradient} px-8 py-6 relative overflow-hidden`}>
                      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
                      <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full -ml-24 -mb-24"></div>
                      
                      <div className="relative z-10">
                        <div className="flex items-start justify-between mb-5">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <span className={`px-4 py-2 bg-white/30 backdrop-blur-sm rounded-xl text-sm font-bold text-white border border-white/50 shadow-md`}>
                                {config.label.toUpperCase()}
                              </span>
                              <div className="text-4xl font-bold text-white">
                                {(fraudCase.fraud_score * 100).toFixed(1)}%
                              </div>
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-1">Case Details</h3>
                            <p className="text-white/90 text-base font-semibold">Member #{fraudCase.member_id}</p>
                          </div>
                          <button
                            onClick={closeModal}
                            className="w-12 h-12 bg-white/25 hover:bg-white/35 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/40 transition-all duration-200 shadow-lg"
                          >
                            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full h-3 bg-white/30 rounded-full overflow-hidden shadow-inner">
                          <div 
                            className="h-full bg-white rounded-full transition-all duration-500 shadow-sm"
                            style={{ width: `${fraudCase.fraud_score * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    {/* Modal Content - Scrollable */}
                    <div className="p-8 space-y-6 max-h-[calc(95vh-300px)] overflow-y-auto">
                      
                      {/* Claim Information Grid */}
                      <div>
                        <h4 className="text-base font-bold text-gray-900 mb-4 uppercase tracking-wider flex items-center gap-3">
                          <div className={`w-1.5 h-5 bg-gradient-to-b ${config.bgGradient} rounded-full`}></div>
                          Claim Information
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-gray-50 rounded-xl p-5 border-2 border-gray-200">
                            <p className="text-xs text-gray-500 font-bold mb-2 uppercase tracking-wide">Service Date</p>
                            <p className="text-lg font-bold text-gray-900">{fraudCase.service_date}</p>
                          </div>
                          <div className="bg-gray-50 rounded-xl p-5 border-2 border-gray-200">
                            <p className="text-xs text-gray-500 font-bold mb-2 uppercase tracking-wide">Invoice Number</p>
                            <p className="text-lg font-bold text-gray-900">{fraudCase.invoice_no}</p>
                          </div>
                          <div className="bg-blue-50 rounded-xl p-5 border-2 border-blue-200">
                            <p className="text-xs text-blue-600 font-bold mb-2 uppercase tracking-wide">Claim Amount</p>
                            <p className="text-2xl font-bold text-blue-900">{formatCurrency(fraudCase.gross_claim_amount)}</p>
                          </div>
                          <div className="bg-blue-50 rounded-xl p-5 border-2 border-blue-200">
                            <p className="text-xs text-blue-600 font-bold mb-2 uppercase tracking-wide">Quantity</p>
                            <p className="text-2xl font-bold text-blue-900">{fraudCase.quantity}</p>
                          </div>
                        </div>
                      </div>

                      {/* Medical Details */}
                      <div>
                        <h4 className="text-base font-bold text-gray-900 mb-4 uppercase tracking-wider flex items-center gap-3">
                          <div className={`w-1.5 h-5 bg-gradient-to-b ${config.bgGradient} rounded-full`}></div>
                          Medical Details
                        </h4>
                        <div className="space-y-3">
                          <div className={`${config.cardBg} rounded-xl p-5 border-2 ${config.borderClass} shadow-sm`}>
                            <p className={`text-xs ${config.textClass} font-bold mb-2 uppercase tracking-wide`}>Specialty</p>
                            <p className={`text-lg font-bold ${config.textClass}`}>{fraudCase.specialty_name}</p>
                          </div>
                          {fraudCase.treating_physician && (
                            <div className={`${config.cardBg} rounded-xl p-5 border-2 ${config.borderClass} shadow-sm`}>
                              <p className={`text-xs ${config.textClass} font-bold mb-2 uppercase tracking-wide`}>Treating Physician</p>
                              <p className={`text-lg font-bold ${config.textClass}`}>Dr. {fraudCase.treating_physician}</p>
                            </div>
                          )}
                          {fraudCase.primary_diag_code && (
                            <div className={`${config.cardBg} rounded-xl p-5 border-2 ${config.borderClass} shadow-sm`}>
                              <p className={`text-xs ${config.textClass} font-bold mb-2 uppercase tracking-wide`}>Primary Diagnosis</p>
                              <p className={`text-lg font-bold ${config.textClass}`}>{fraudCase.primary_diag_code}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Detection Flags */}
                      <div>
                        <h4 className="text-base font-bold text-gray-900 mb-4 uppercase tracking-wider flex items-center gap-3">
                          <div className={`w-1.5 h-5 bg-gradient-to-b ${config.bgGradient} rounded-full`}></div>
                          Detection Flags ({fraudCase.fraud_reasons.length})
                        </h4>
                        <div className="grid grid-cols-1 gap-3">
                          {fraudCase.fraud_reasons.map((reason, i) => (
                            <div 
                              key={i}
                              className={`flex items-start gap-4 p-4 ${config.cardBg} border-2 ${config.borderClass} rounded-xl shadow-sm`}
                            >
                              <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br ${config.bgGradient} rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-md">
                                {i + 1}
                              </div>
                              <p className={`text-sm font-bold ${config.textClass} flex-1 pt-1`}>{reason}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Recommended Action */}
                      <div>
                        <h4 className="text-base font-bold text-gray-900 mb-4 uppercase tracking-wider flex items-center gap-3">
                          <div className={`w-1.5 h-5 bg-gradient-to-b ${config.bgGradient} rounded-full`}></div>
                          Recommended Action
                        </h4>
                        <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-6 shadow-sm">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <p className="text-base font-bold text-blue-900 leading-relaxed flex-1 pt-2">{fraudCase.recommended_action}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Modal Footer - Action Buttons */}
                    <div className="px-8 py-6 bg-gray-50 border-t-2 border-gray-200">
                      <div className="grid grid-cols-2 gap-4">
                        <button className={`px-8 py-4 bg-gradient-to-r ${config.bgGradient} hover:opacity-90 text-white font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl`}>
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                          <span>Block Claim</span>
                        </button>
                        <button className="px-8 py-4 bg-white hover:bg-gray-100 text-gray-700 font-bold rounded-xl border-2 border-gray-300 hover:border-gray-400 transition-all duration-200 flex items-center justify-center gap-3 shadow-sm">
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                          <span>Investigate</span>
                        </button>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FraudCases;