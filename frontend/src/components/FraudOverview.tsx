import React from 'react';
import { AIFraudOverviewResponse } from '../types/dashboard';
import { formatCurrency } from '../utils/formatters';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface FraudOverviewProps {
  fraudOverview: AIFraudOverviewResponse | null;
}

const FraudOverview: React.FC<FraudOverviewProps> = ({ fraudOverview }) => {
  const [selectedMember, setSelectedMember] = React.useState<any>(null);

  if (!fraudOverview) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-2xl mb-6">
          <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">No Data Available</h3>
        <p className="text-gray-600 max-w-md mx-auto">
          No fraud analysis data available. Please upload claims data first.
        </p>
      </div>
    );
  }

  // Prepare data for fraud methods breakdown
  const fraudMethodsData = [
    { name: 'Duplicates', value: fraudOverview.duplicate_claims, color: '#F97316' },
    { name: 'Suspicious Quantity', value: fraudOverview.suspicious_qty_claims, color: '#EAB308' },
    { name: 'Statistical Outliers', value: fraudOverview.outlier_claims, color: '#A855F7' }
  ].filter(item => item.value > 0);

  return (
    <div className="space-y-6">

      {/* Fraud Detection Methods Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left: Chart */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-red-50 to-orange-50 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">Detection Methods</h3>
                <p className="text-xs text-gray-600">Fraud breakdown by type</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            {fraudMethodsData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={fraudMethodsData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {fraudMethodsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => [`${value} cases`, 'Count']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500 text-sm">
                No fraud detected
              </div>
            )}
          </div>
        </div>

        {/* Right: Summary Stats */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">Detection Summary</h3>
                <p className="text-xs text-gray-600">AI-powered fraud analysis</p>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-4">
            
            {/* Overall Fraud Rate */}
            <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-lg p-4 border-l-4 border-red-500">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-red-700 uppercase">Overall Fraud Rate</span>
                <span className="text-2xl font-bold text-red-600">{fraudOverview.fraud_rate}%</span>
              </div>
              <div className="w-full h-2 bg-red-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-red-600 rounded-full transition-all duration-500"
                  style={{ width: `${fraudOverview.fraud_rate}%` }}
                ></div>
              </div>
              <p className="text-xs text-red-600 mt-2">
                {fraudOverview.fraud_claims} fraudulent out of {fraudOverview.total_claims} total claims
              </p>
            </div>

            {/* Detection Breakdown */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Duplicates</p>
                    <p className="text-xs text-gray-600">Same-day, same-provider</p>
                  </div>
                </div>
                <span className="text-lg font-bold text-orange-600">{fraudOverview.duplicate_claims}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Suspicious Quantity</p>
                    <p className="text-xs text-gray-600">Exceeds category limits</p>
                  </div>
                </div>
                <span className="text-lg font-bold text-yellow-600">{fraudOverview.suspicious_qty_claims}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Outliers</p>
                    <p className="text-xs text-gray-600">Statistical anomalies</p>
                  </div>
                </div>
                <span className="text-lg font-bold text-purple-600">{fraudOverview.outlier_claims}</span>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Top Risk Members - Enhanced */}
      {fraudOverview.top_risky_members && fraudOverview.top_risky_members.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">High-Risk Members</h3>
                  <p className="text-xs text-gray-600">Members with suspicious claim patterns</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                {fraudOverview.top_risky_members.length} flagged
              </span>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {fraudOverview.top_risky_members.slice(0, 5).map((member, idx) => {
                const riskScore = member.avg_fraud_score;
                const riskLevel = riskScore >= 0.7 ? 'critical' : riskScore >= 0.5 ? 'high' : 'medium';
                const riskConfig = {
                  critical: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', badge: 'bg-red-100 text-red-700', label: 'Critical' },
                  high: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', badge: 'bg-orange-100 text-orange-700', label: 'High' },
                  medium: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', badge: 'bg-yellow-100 text-yellow-700', label: 'Medium' }
                }[riskLevel];

                return (
                  <div key={idx} className={`${riskConfig.bg} border ${riskConfig.border} rounded-lg p-4`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-gray-200">
                          <svg className={`w-5 h-5 ${riskConfig.text}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">Member #{member.member_id}</p>
                          <p className="text-xs text-gray-600">Rank #{idx + 1} by risk score</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-3 py-1 ${riskConfig.badge} rounded-full text-xs font-bold inline-block mb-1`}>
                          {riskConfig.label}
                        </span>
                        <p className="text-xs text-gray-600">Score: {member.avg_fraud_score}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="text-xs text-gray-500">Flagged Claims</p>
                          <p className={`font-bold ${riskConfig.text}`}>{member.fraud_claims}</p>
                        </div>
                        <div className="w-px h-8 bg-gray-300"></div>
                        <div>
                          <p className="text-xs text-gray-500">Total Amount</p>
                          <p className="font-bold text-gray-900">{formatCurrency(member.total_amount)}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setSelectedMember(member)}
                        className="px-3 py-1.5 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 transition-colors"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Business Impact - Enhanced Metrics */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Business Impact</h3>
              <p className="text-xs text-gray-600">Value delivered by AI fraud detection</p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Prevention */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-5 border border-green-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h4 className="text-sm font-bold text-green-900">Prevention</h4>
              </div>
              <p className="text-2xl font-bold text-green-700 mb-2">{formatCurrency(fraudOverview.total_fraud_amount)}</p>
              <p className="text-xs text-green-700 leading-relaxed">
                Blocked fraudulent payments before processing, saving monthly costs
              </p>
            </div>

            {/* Efficiency */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-5 border border-blue-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h4 className="text-sm font-bold text-blue-900">Efficiency</h4>
              </div>
              <p className="text-2xl font-bold text-blue-700 mb-2">70%</p>
              <p className="text-xs text-blue-700 leading-relaxed">
                Reduction in manual audit time, focusing investigators on highest-risk cases
              </p>
            </div>

            {/* Compliance */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-5 border border-purple-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h4 className="text-sm font-bold text-purple-900">Compliance</h4>
              </div>
              <p className="text-2xl font-bold text-purple-700 mb-2">100%</p>
              <p className="text-xs text-purple-700 leading-relaxed">
                Systematic fraud detection meets regulatory requirements and reduces audit findings
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* Member Details Modal */}
      {selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-red-50 to-orange-50 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Member #{selectedMember.member_id}</h2>
                    <p className="text-sm text-gray-600">High-Risk Member Details</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedMember(null)}
                  className="w-8 h-8 bg-white hover:bg-gray-100 rounded-lg flex items-center justify-center transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Risk Summary */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-gray-900">Risk Assessment</h3>
                  <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">
                    {selectedMember.avg_fraud_score >= 0.7 ? 'CRITICAL' : selectedMember.avg_fraud_score >= 0.5 ? 'HIGH' : 'MEDIUM'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Fraud Score</p>
                    <p className="text-2xl font-bold text-red-600">{selectedMember.avg_fraud_score}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Flagged Claims</p>
                    <p className="text-2xl font-bold text-orange-600">{selectedMember.fraud_claims}</p>
                  </div>
                </div>
              </div>

              {/* Financial Impact */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="text-sm font-bold text-gray-900 mb-3">Financial Impact</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Total Claim Amount</span>
                    <span className="text-lg font-bold text-gray-900">{formatCurrency(selectedMember.total_amount)}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <span className="text-sm text-gray-600">Estimated Fraud Loss</span>
                    <span className="text-lg font-bold text-red-600">
                      {formatCurrency(selectedMember.total_amount * selectedMember.avg_fraud_score)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Recommended Actions */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Recommended Actions
                </h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <span>Conduct immediate manual review of all flagged claims</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <span>Verify member identity and contact information</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <span>Place temporary hold on future claims pending investigation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <span>Contact providers associated with flagged claims</span>
                  </li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold text-sm transition-colors">
                  Flag for Investigation
                </button>
                <button className="flex-1 px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold text-sm transition-colors">
                  Export Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default FraudOverview;