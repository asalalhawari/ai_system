import React, { useState } from 'react';
import { AIFraudCasesResponse } from '../types/dashboard';
import { formatCurrency } from '../utils/formatters';

interface FraudCasesProps {
  fraudCases: AIFraudCasesResponse | null;
}

const FraudCases: React.FC<FraudCasesProps> = ({ fraudCases }) => {
  const [selectedCase, setSelectedCase] = useState<number | null>(null);
  const [filterRisk, setFilterRisk] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  if (!fraudCases || !fraudCases.fraud_cases || fraudCases.fraud_cases.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-2xl mb-6">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">All Clear!</h3>
        <p className="text-gray-600 max-w-md mx-auto mb-6">
          No high-priority fraud cases detected. Your claims are looking healthy.
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 rounded-lg border border-green-200">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm font-semibold text-green-700">System Monitoring Active</span>
        </div>
      </div>
    );
  }

  // Risk categorization helper
  const getRiskLevel = (score: number): 'high' | 'medium' | 'low' => {
    if (score >= 0.7) return 'high';
    if (score >= 0.5) return 'medium';
    return 'low';
  };

  const getRiskConfig = (level: 'high' | 'medium' | 'low') => {
    const configs = {
      high: {
        color: 'red',
        bgClass: 'bg-red-50',
        borderClass: 'border-red-200',
        textClass: 'text-red-700',
        badgeClass: 'bg-red-100 text-red-700',
        gradientClass: 'from-red-500 to-orange-500',
        label: 'Critical',
        icon: (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        )
      },
      medium: {
        color: 'orange',
        bgClass: 'bg-orange-50',
        borderClass: 'border-orange-200',
        textClass: 'text-orange-700',
        badgeClass: 'bg-orange-100 text-orange-700',
        gradientClass: 'from-orange-500 to-yellow-500',
        label: 'Warning',
        icon: (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        )
      },
      low: {
        color: 'yellow',
        bgClass: 'bg-yellow-50',
        borderClass: 'border-yellow-200',
        textClass: 'text-yellow-700',
        badgeClass: 'bg-yellow-100 text-yellow-700',
        gradientClass: 'from-yellow-500 to-amber-500',
        label: 'Monitor',
        icon: (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        )
      }
    };
    return configs[level];
  };

  // Filter cases by risk level
  const filteredCases = fraudCases.fraud_cases.filter(c => {
    if (filterRisk === 'all') return true;
    return getRiskLevel(c.fraud_score) === filterRisk;
  });

  // Count by risk level
  const riskCounts = {
    high: fraudCases.fraud_cases.filter(c => getRiskLevel(c.fraud_score) === 'high').length,
    medium: fraudCases.fraud_cases.filter(c => getRiskLevel(c.fraud_score) === 'medium').length,
    low: fraudCases.fraud_cases.filter(c => getRiskLevel(c.fraud_score) === 'low').length,
  };

  return (
    <div className="space-y-6">
      
      {/* Summary Bar */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">
                Total Cases Analyzed
              </h3>
              <p className="text-xs text-gray-600 mt-0.5">
                AI-powered fraud detection results
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">{fraudCases.total_flagged}</p>
              <p className="text-xs text-gray-500">Flagged Cases</p>
            </div>
            <div className="w-px h-12 bg-gray-300"></div>
            <div className="text-right">
              <p className="text-2xl font-bold text-blue-600">{fraudCases.total_analyzed.toLocaleString()}</p>
              <p className="text-xs text-gray-500">Total Analyzed</p>
            </div>
            <div className="w-px h-12 bg-gray-300"></div>
            <div className="text-right">
              <p className="text-2xl font-bold text-purple-600">{((fraudCases.total_flagged / fraudCases.total_analyzed) * 100).toFixed(1)}%</p>
              <p className="text-xs text-gray-500">Detection Rate</p>
            </div>
            {filterRisk !== 'all' && (
              <>
                <div className="w-px h-12 bg-gray-300"></div>
                <button
                  onClick={() => setFilterRisk('all')}
                  className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 text-sm font-semibold rounded-lg border border-gray-300 hover:border-gray-400 transition-all duration-200"
                >
                  View All
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Filter Cards - Risk Levels Only */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* High Risk */}
        <div 
          onClick={() => setFilterRisk('high')}
          className={`cursor-pointer transition-all duration-200 ${
            filterRisk === 'high' ? 'ring-2 ring-red-500' : ''
          }`}
        >
          <div className="bg-white rounded-xl p-5 border-l-4 border-red-500 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <span className="text-xs font-semibold text-red-600 uppercase">Critical Risk</span>
            </div>
            <p className="text-2xl font-bold text-red-600 mb-1">{riskCounts.high}</p>
            <p className="text-xs text-gray-600">Immediate action required</p>
          </div>
        </div>

        {/* Medium Risk */}
        <div 
          onClick={() => setFilterRisk('medium')}
          className={`cursor-pointer transition-all duration-200 ${
            filterRisk === 'medium' ? 'ring-2 ring-orange-500' : ''
          }`}
        >
          <div className="bg-white rounded-xl p-5 border-l-4 border-orange-500 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-xs font-semibold text-orange-600 uppercase">Warning</span>
            </div>
            <p className="text-2xl font-bold text-orange-600 mb-1">{riskCounts.medium}</p>
            <p className="text-xs text-gray-600">Review within 48hrs</p>
          </div>
        </div>

        {/* Low Risk */}
        <div 
          onClick={() => setFilterRisk('low')}
          className={`cursor-pointer transition-all duration-200 ${
            filterRisk === 'low' ? 'ring-2 ring-yellow-500' : ''
          }`}
        >
          <div className="bg-white rounded-xl p-5 border-l-4 border-yellow-500 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-xs font-semibold text-yellow-600 uppercase">Monitor</span>
            </div>
            <p className="text-2xl font-bold text-yellow-600 mb-1">{riskCounts.low}</p>
            <p className="text-xs text-gray-600">Routine investigation</p>
          </div>
        </div>

      </div>

      {/* Active Filter Badge */}
      {filterRisk !== 'all' && (
        <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <span className="text-sm font-semibold text-blue-900">
            Filtering: {filterRisk.charAt(0).toUpperCase() + filterRisk.slice(1)} Risk Cases
          </span>
          <span className="text-sm text-blue-700">({filteredCases.length} results)</span>
          <button
            onClick={() => setFilterRisk('all')}
            className="ml-auto text-sm text-blue-700 hover:text-blue-900 font-semibold"
          >
            Clear Filter
          </button>
        </div>
      )}

      {/* Cases Grid - Master/Detail Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left: Cases List */}
        <div className="space-y-4 lg:max-h-[800px] lg:overflow-y-auto lg:pr-2">
          {filteredCases.map((fraudCase, idx) => {
            const riskLevel = getRiskLevel(fraudCase.fraud_score);
            const config = getRiskConfig(riskLevel);
            const isSelected = selectedCase === idx;

            return (
              <div
                key={idx}
                onClick={() => setSelectedCase(idx)}
                className={`cursor-pointer transition-all duration-200 ${
                  isSelected ? 'ring-2 ring-blue-500 shadow-lg' : 'hover:shadow-md'
                }`}
              >
                {/* Card Container */}
                <div className={`rounded-xl border-2 ${config.borderClass} bg-white overflow-hidden`}>
                  
                  {/* Header with Risk Score */}
                  <div className={`px-5 py-4 ${config.bgClass} border-b ${config.borderClass}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 ${config.badgeClass} rounded-lg flex items-center justify-center border ${config.borderClass}`}>
                          <svg className={`w-5 h-5 ${config.textClass}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            {config.icon}
                          </svg>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-gray-900 font-bold text-base">#{fraudCase.member_id}</span>
                            <span className={`px-2 py-0.5 ${config.badgeClass} rounded text-xs font-semibold border ${config.borderClass}`}>
                              {config.label}
                            </span>
                          </div>
                          <p className="text-gray-600 text-xs">{fraudCase.service_date}</p>
                        </div>
                      </div>
                      
                      {/* Risk Score Display */}
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${config.textClass} mb-0.5`}>
                          {(fraudCase.fraud_score * 100).toFixed(0)}%
                        </div>
                        <div className="text-xs text-gray-500 font-medium">Risk</div>
                      </div>
                    </div>

                    {/* Score Bar */}
                    <div className="mt-3 w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${config.textClass.replace('text', 'bg')} rounded-full transition-all duration-300`}
                        style={{ width: `${fraudCase.fraud_score * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-3">
                    
                    {/* Key Info Grid */}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-gray-500 mb-0.5">Specialty</p>
                        <p className="font-semibold text-gray-900">{fraudCase.specialty_name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-0.5">Amount</p>
                        <p className="font-bold text-gray-900">{formatCurrency(fraudCase.gross_claim_amount)}</p>
                      </div>
                      {fraudCase.treating_physician && (
                        <>
                          <div>
                            <p className="text-xs text-gray-500 mb-0.5">Physician</p>
                            <p className="font-semibold text-gray-900 truncate">Dr. {fraudCase.treating_physician}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-0.5">Quantity</p>
                            <p className="font-semibold text-gray-900">{fraudCase.quantity}</p>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Fraud Reason Badges */}
                    <div>
                      <p className="text-xs text-gray-500 font-medium mb-2">Detection Flags</p>
                      <div className="flex flex-wrap gap-1.5">
                        {fraudCase.fraud_reasons.map((reason, i) => (
                          <span 
                            key={i}
                            className={`px-2.5 py-1 ${config.badgeClass} rounded text-xs font-medium border ${config.borderClass}`}
                          >
                            {reason}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Action Required */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-xs font-semibold text-blue-900 mb-1">Recommended Action</p>
                      <p className="text-xs text-blue-700 leading-relaxed">{fraudCase.recommended_action}</p>
                    </div>

                    {/* View Details */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <span className="text-xs text-gray-500">
                        {isSelected ? 'Viewing details' : 'Click for details'}
                      </span>
                      <svg 
                        className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isSelected ? 'rotate-90' : ''}`} 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>

                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Selected Case Details Panel */}
        <div className="lg:sticky lg:top-4 lg:h-fit">
          {selectedCase !== null ? (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              
              {(() => {
                const fraudCase = filteredCases[selectedCase];
                const riskLevel = getRiskLevel(fraudCase.fraud_score);
                const config = getRiskConfig(riskLevel);

                return (
                  <>
                    {/* Header */}
                    <div className={`px-6 py-5 ${config.bgClass} border-b-2 ${config.borderClass}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 mb-1">Case Details</h3>
                          <p className="text-gray-600 text-sm">Member #{fraudCase.member_id}</p>
                        </div>
                        <button
                          onClick={() => setSelectedCase(null)}
                          className="w-9 h-9 bg-white hover:bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200 transition-colors"
                        >
                          <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Details Content */}
                    <div className="p-6 space-y-6 max-h-[700px] overflow-y-auto">
                      
                      {/* Risk Assessment */}
                      <div>
                        <h4 className="text-sm font-bold text-gray-900 mb-3">Risk Assessment</h4>
                        <div className={`${config.bgClass} border ${config.borderClass} rounded-lg p-4`}>
                          <div className="flex items-center justify-between mb-3">
                            <span className={`text-xl font-bold ${config.textClass}`}>
                              {(fraudCase.fraud_score * 100).toFixed(1)}%
                            </span>
                            <span className={`px-3 py-1 ${config.badgeClass} rounded text-sm font-semibold border ${config.borderClass}`}>
                              {config.label} Risk
                            </span>
                          </div>
                          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${config.textClass.replace('text', 'bg')} rounded-full transition-all duration-300`}
                              style={{ width: `${fraudCase.fraud_score * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>

                      {/* Claim Information */}
                      <div>
                        <h4 className="text-sm font-bold text-gray-900 mb-3">Claim Information</h4>
                        <div className="bg-gray-50 rounded-lg border border-gray-200 divide-y divide-gray-200">
                          <div className="p-4 grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Service Date</p>
                              <p className="text-sm font-semibold text-gray-900">{fraudCase.service_date}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Invoice Number</p>
                              <p className="text-sm font-semibold text-gray-900">{fraudCase.invoice_no}</p>
                            </div>
                          </div>
                          <div className="p-4 grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Claim Amount</p>
                              <p className="text-sm font-bold text-gray-900">{formatCurrency(fraudCase.gross_claim_amount)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Quantity</p>
                              <p className="text-sm font-semibold text-gray-900">{fraudCase.quantity}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Medical Details */}
                      <div>
                        <h4 className="text-sm font-bold text-gray-900 mb-3">Medical Details</h4>
                        <div className="bg-gray-50 rounded-lg border border-gray-200 divide-y divide-gray-200">
                          <div className="p-4">
                            <p className="text-xs text-gray-500 mb-1">Specialty</p>
                            <p className="text-sm font-semibold text-gray-900">{fraudCase.specialty_name}</p>
                          </div>
                          {fraudCase.treating_physician && (
                            <div className="p-4">
                              <p className="text-xs text-gray-500 mb-1">Treating Physician</p>
                              <p className="text-sm font-semibold text-gray-900">Dr. {fraudCase.treating_physician}</p>
                            </div>
                          )}
                          {fraudCase.primary_diag_code && (
                            <div className="p-4">
                              <p className="text-xs text-gray-500 mb-1">Primary Diagnosis</p>
                              <p className="text-sm font-semibold text-gray-900">{fraudCase.primary_diag_code}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Fraud Detection Flags */}
                      <div>
                        <h4 className="text-sm font-bold text-gray-900 mb-3">Detection Flags</h4>
                        <div className="space-y-2">
                          {fraudCase.fraud_reasons.map((reason, i) => (
                            <div 
                              key={i}
                              className={`flex items-center gap-3 p-3 ${config.bgClass} border ${config.borderClass} rounded-lg`}
                            >
                              <div className={`w-1.5 h-1.5 ${config.textClass.replace('text', 'bg')} rounded-full flex-shrink-0`}></div>
                              <p className="text-sm font-medium text-gray-900 flex-1">{reason}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Recommended Action */}
                      <div>
                        <h4 className="text-sm font-bold text-gray-900 mb-3">Recommended Action</h4>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <p className="text-sm text-gray-900 leading-relaxed">{fraudCase.recommended_action}</p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-200">
                        <button className={`px-4 py-2.5 ${config.textClass.replace('text', 'bg')} hover:opacity-90 text-white font-semibold rounded-lg shadow-sm hover:shadow transition-all duration-200 flex items-center justify-center gap-2`}>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                          <span className="text-sm">Block</span>
                        </button>
                        <button className="px-4 py-2.5 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-lg border border-gray-300 hover:border-gray-400 transition-all duration-200 flex items-center justify-center gap-2">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          <span className="text-sm">Investigate</span>
                        </button>
                      </div>

                    </div>
                  </>
                );
              })()}

            </div>
          ) : (
            // Empty State for Details Panel
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-12 text-center">
              <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-2">Select a Case</h3>
              <p className="text-sm text-gray-600 max-w-xs mx-auto">
                Click on any case to view detailed information
              </p>
            </div>
          )}
        </div>

      </div>

      {/* Bottom Action Guide */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h4 className="text-sm font-bold text-gray-900 mb-4">Action Priority Guidelines</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs mb-4">
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2.5 h-2.5 bg-red-500 rounded-full"></div>
              <span className="font-bold text-red-700">Critical (&gt;70%)</span>
            </div>
            <p className="text-gray-600 leading-relaxed">Immediate review and potential claim suspension required</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2.5 h-2.5 bg-orange-500 rounded-full"></div>
              <span className="font-bold text-orange-700">Warning (50-70%)</span>
            </div>
            <p className="text-gray-600 leading-relaxed">Should be audited within 48 hours for verification</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2.5 h-2.5 bg-yellow-500 rounded-full"></div>
              <span className="font-bold text-yellow-700">Monitor (&lt;50%)</span>
            </div>
            <p className="text-gray-600 leading-relaxed">Routine investigation and pattern monitoring</p>
          </div>
        </div>
        <div className="pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-700 leading-relaxed">
            <span className="font-bold">Detection Priority:</span> Duplicates → Block payment immediately • 
            Unusual Quantities → Verify medical necessity • 
            Outliers → Investigate provider billing patterns
          </p>
        </div>
      </div>

    </div>
  );
};

export default FraudCases;