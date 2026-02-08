import React from 'react';
import { DashboardOverviewResponse, SpecialtyAnalysis } from '../types/dashboard';
import { formatCurrency, formatNumber } from '../utils/formatters';

interface ClinicalOverviewProps {
  overview: DashboardOverviewResponse | null;
  specialties: SpecialtyAnalysis[];
}

const ClinicalOverview: React.FC<ClinicalOverviewProps> = ({ overview, specialties }) => {
  if (!overview) {
    return (
      <section className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900">Clinical Overview</h3>
        <p className="mt-2 text-sm text-gray-500">
          No clinical data available. Please upload claims data first.
        </p>
      </section>
    );
  }

  return (
    <section className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900">Clinical Overview</h3>
      <p className="mt-1 text-sm text-gray-500">
        Summary of claims data and specialty distribution
      </p>

      {/* Overview Metrics */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded p-4">
          <div className="text-xs text-blue-600">Total Claims</div>
          <div className="text-2xl font-bold text-blue-700">{formatNumber(overview.totalClaims)}</div>
        </div>
        <div className="bg-green-50 rounded p-4">
          <div className="text-xs text-green-600">Total Amount</div>
          <div className="text-2xl font-bold text-green-700">{formatCurrency(overview.totalAmount)}</div>
        </div>
        <div className="bg-purple-50 rounded p-4">
          <div className="text-xs text-purple-600">Average Claim</div>
          <div className="text-2xl font-bold text-purple-700">{formatCurrency(overview.avgAmount)}</div>
        </div>
        <div className="bg-orange-50 rounded p-4">
          <div className="text-xs text-orange-600">Top Specialty</div>
          <div className="text-lg font-bold text-orange-700">{overview.topSpecialty.name}</div>
          <div className="text-xs text-orange-500">{formatNumber(overview.topSpecialty.claimCount)} claims</div>
        </div>
      </div>

      {/* Date Range */}
      {overview.dateRange.start && overview.dateRange.end && (
        <div className="mt-4 text-sm text-gray-600">
          <strong>Data Period:</strong> {overview.dateRange.start} to {overview.dateRange.end}
        </div>
      )}

      {/* Top Specialties */}
      {specialties && specialties.length > 0 && (
        <div className="mt-6">
          <h4 className="text-md font-medium text-gray-900">Top Specialties</h4>
          <div className="mt-2 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Specialty
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Claims
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Amount
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avg Amount
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    %
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {specialties.slice(0, 8).map((specialty, idx) => (
                  <tr key={idx}>
                    <td className="px-4 py-2 text-sm text-gray-900">{specialty.name}</td>
                    <td className="px-4 py-2 text-sm text-gray-900 text-right">{formatNumber(specialty.claims)}</td>
                    <td className="px-4 py-2 text-sm text-gray-900 text-right">{formatCurrency(specialty.totalAmount)}</td>
                    <td className="px-4 py-2 text-sm text-gray-900 text-right">{formatCurrency(specialty.avgAmount)}</td>
                    <td className="px-4 py-2 text-sm text-gray-500 text-right">{specialty.percentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
};

export default ClinicalOverview;
