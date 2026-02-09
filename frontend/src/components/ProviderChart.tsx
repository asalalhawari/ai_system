import React, { useEffect, useState } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Cell,
    PieChart,
    Pie
} from 'recharts';
import apiService from '../services/apiService';
import { ProviderAnalysis } from '../types/dashboard';
import { formatCurrency, formatNumber } from '../utils/formatters';
import { CHART_COLORS, RANK_COLORS } from '../constants/colors';

const LoadingState: React.FC = () => (
    <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
            <div className="relative inline-block">
                <div className="w-20 h-20 border-4 border-gray-100 rounded-full absolute inset-0"></div>
                <div className="w-20 h-20 border-4 border-transparent border-t-blue-600 border-r-indigo-600 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </div>
                </div>
            </div>
            <p className="mt-6 text-gray-700 font-semibold">Loading Provider Analytics</p>
            <p className="mt-2 text-sm text-gray-500">Processing healthcare data...</p>
        </div>
    </div>
);

const ErrorState: React.FC<{ message: string; onRetry: () => void }> = ({ message, onRetry }) => (
    <div className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-2xl p-8 shadow-lg">
        <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
            </div>
            <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-1">Error Loading Data</h3>
                <p className="text-red-800 mb-4">{message}</p>
                <button
                    onClick={onRetry}
                    className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                    Try Again
                </button>
            </div>
        </div>
    </div>
);

const EmptyState: React.FC = () => (
    <div className="bg-gradient-to-br from-gray-50 to-blue-50 border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center">
        <div className="inline-block mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-300 to-gray-400 rounded-2xl flex items-center justify-center">
                <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
            </div>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">No Provider Data Available</h3>
        <p className="text-gray-600 mb-1">Upload claims data to see detailed provider analytics</p>
        <p className="text-sm text-gray-500">Charts and statistics will appear once data is processed</p>
    </div>
);

interface CustomTooltipProps {
    active?: boolean;
    payload?: Array<{
        payload: ProviderAnalysis;
    }>;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-5 min-w-[280px]">
                <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-200">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-medium">Provider</p>
                        <p className="font-bold text-gray-900">{data.name}</p>
                    </div>
                </div>
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            Claims
                        </span>
                        <span className="font-bold text-blue-600">{formatNumber(data.claims)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            Total Amount
                        </span>
                        <span className="font-bold text-green-600">{formatCurrency(data.totalAmount)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 flex items-center gap-2">
                            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                            Average/Claim
                        </span>
                        <span className="font-bold text-purple-600">{formatCurrency(data.avgAmount)}</span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <span className="text-sm text-gray-600 flex items-center gap-2">
                            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                            Market Share
                        </span>
                        <span className="font-bold text-orange-600">{data.percentage.toFixed(1)}%</span>
                    </div>
                </div>
            </div>
        );
    }
    return null;
};

const ProviderChart: React.FC = () => {
    const [data, setData] = useState<ProviderAnalysis[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [limit, setLimit] = useState<number>(20);
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);
            const providers = await apiService.getProvidersData(
                limit,
                startDate || undefined,
                endDate || undefined
            );
            setData(providers);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to load provider data';
            setError(errorMessage);
            console.error('Error loading provider data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [limit, startDate, endDate]);

    // Calculate summary stats
    const totalClaims = data.reduce((sum, p) => sum + p.claims, 0);
    const totalAmount = data.reduce((sum, p) => sum + p.totalAmount, 0);
    const avgClaimValue = totalClaims > 0 ? totalAmount / totalClaims : 0;

    return (
        <div className="space-y-6">
            {/* Compact Filter Section */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4">
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 text-gray-700">
                        <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                        </svg>
                        <span className="text-sm font-semibold">Filters:</span>
                    </div>

                    <div className="flex-1 flex flex-wrap items-center gap-3">
                        <div className="relative min-w-[180px]">
                            <select
                                value={limit}
                                onChange={(e) => setLimit(Number(e.target.value))}
                                disabled={loading}
                                className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm font-medium text-gray-700 transition-all hover:border-blue-400 disabled:opacity-50 disabled:cursor-not-allowed appearance-none"
                            >
                                <option value={5}>Top 5</option>
                                <option value={10}>Top 10</option>
                                <option value={15}>Top 15</option>
                                <option value={20}>Top 20</option>
                                <option value={30}>Top 30</option>
                                <option value={50}>Top 50</option>
                            </select>
                            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>

                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            disabled={loading}
                            placeholder="Start Date"
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium text-gray-700 transition-all hover:border-blue-400 disabled:opacity-50 disabled:cursor-not-allowed min-w-[150px]"
                        />

                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            disabled={loading}
                            placeholder="End Date"
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium text-gray-700 transition-all hover:border-blue-400 disabled:opacity-50 disabled:cursor-not-allowed min-w-[150px]"
                        />

                        {(startDate || endDate || limit !== 20) && (
                            <button
                                onClick={() => {
                                    setStartDate('');
                                    setEndDate('');
                                    setLimit(20);
                                }}
                                disabled={loading}
                                className="ml-auto px-4 py-2 text-sm font-semibold text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Clear
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {loading ? (
                <LoadingState />
            ) : error ? (
                <ErrorState message={error} onRetry={loadData} />
            ) : data.length === 0 ? (
                <EmptyState />
            ) : (
                <>
                    {/* Summary Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow duration-200">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full">Total</span>
                            </div>
                            <p className="text-sm text-gray-600 font-medium mb-1">Total Claims</p>
                            <p className="text-3xl font-bold text-gray-900">{formatNumber(totalClaims)}</p>
                        </div>

                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow duration-200">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full">Amount</span>
                            </div>
                            <p className="text-sm text-gray-600 font-medium mb-1">Total Value</p>
                            <p className="text-3xl font-bold text-gray-900">{formatCurrency(totalAmount)}</p>
                        </div>

                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow duration-200">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                </div>
                                <span className="px-3 py-1 bg-purple-50 text-purple-700 text-xs font-bold rounded-full">Average</span>
                            </div>
                            <p className="text-sm text-gray-600 font-medium mb-1">Avg per Claim</p>
                            <p className="text-3xl font-bold text-gray-900">{formatCurrency(avgClaimValue)}</p>
                        </div>
                    </div>

                    {/* View Toggle */}
                    <div className="flex justify-end">
                        <div className="inline-flex rounded-xl shadow-sm border border-gray-200 bg-white p-1">
                            <button
                                onClick={() => setViewMode('chart')}
                                className={`px-5 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center gap-2 ${
                                    viewMode === 'chart'
                                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                                        : 'text-gray-600 hover:bg-gray-50'
                                }`}
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                                Chart View
                            </button>
                            <button
                                onClick={() => setViewMode('table')}
                                className={`px-5 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center gap-2 ${
                                    viewMode === 'table'
                                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                                        : 'text-gray-600 hover:bg-gray-50'
                                }`}
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                Table View
                            </button>
                        </div>
                    </div>

                    {/* Chart View */}
                    {viewMode === 'chart' && (
                        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-5 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">Provider Claims Distribution</h3>
                                        <p className="text-sm text-gray-600 mt-1">
                                            Showing top {data.length} providers ranked by claims volume
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm border border-gray-200">
                                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                        <span className="text-sm font-semibold text-gray-700">Live Data</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6">
                                <ResponsiveContainer width="100%" height={500}>
                                    <BarChart
                                        data={data}
                                        layout="vertical"
                                        margin={{ top: 5, right: 30, left: 150, bottom: 5 }}
                                    >
                                        <defs>
                                            {CHART_COLORS.map((color, index) => (
                                                <linearGradient key={index} id={`gradient-${index}`} x1="0" y1="0" x2="1" y2="0">
                                                    <stop offset="0%" stopColor={color} stopOpacity={0.8}/>
                                                    <stop offset="100%" stopColor={color} stopOpacity={1}/>
                                                </linearGradient>
                                            ))}
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                        <XAxis
                                            type="number"
                                            stroke="#6b7280"
                                            style={{ fontSize: '13px', fontWeight: 500 }}
                                        />
                                        <YAxis
                                            type="category"
                                            dataKey="name"
                                            stroke="#6b7280"
                                            width={140}
                                            style={{ fontSize: '13px', fontWeight: 500 }}
                                            interval={0}
                                        />
                                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }} />
                                        <Legend 
                                            wrapperStyle={{ paddingTop: '20px' }}
                                            iconType="circle"
                                        />
                                        <Bar
                                            dataKey="claims"
                                            name="Number of Claims"
                                            radius={[0, 8, 8, 0]}
                                        >
                                            {data.map((entry, index) => (
                                                <Cell 
                                                    key={`cell-${index}`} 
                                                    fill={`url(#gradient-${index % CHART_COLORS.length})`}
                                                />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>

                                <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>Hover over bars for detailed provider metrics</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Table View */}
                    {viewMode === 'table' && (
                        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-5 border-b border-gray-200">
                                <h4 className="text-xl font-bold text-gray-900">Provider Performance Details</h4>
                                <p className="text-sm text-gray-600 mt-1">Comprehensive breakdown of provider metrics</p>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                                Rank
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                                Provider Code
                                            </th>
                                            <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                                                Claims
                                            </th>
                                            <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                                                Total Amount
                                            </th>
                                            <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                                                Avg per Claim
                                            </th>
                                            <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                                                Market Share
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-100">
                                        {data.map((provider, index) => (
                                            <tr
                                                key={index}
                                                className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-150"
                                            >
                                                <td className="px-6 py-5 whitespace-nowrap">
                                                    <div className="flex items-center gap-3">
                                                        <span className={`inline-flex items-center justify-center w-10 h-10 rounded-xl text-sm font-bold shadow-md ${
                                                            index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-500 text-white' :
                                                            index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-white' :
                                                            index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-500 text-white' :
                                                            'bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-700'
                                                        }`}>
                                                            {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 whitespace-nowrap">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center shadow-md">
                                                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                            </svg>
                                                        </div>
                                                        <span className="text-sm font-bold text-gray-900">{provider.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 whitespace-nowrap text-right">
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 text-sm font-bold rounded-lg">
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                        </svg>
                                                        {formatNumber(provider.claims)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5 whitespace-nowrap text-right">
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 text-sm font-bold rounded-lg">
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        {formatCurrency(provider.totalAmount)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5 whitespace-nowrap text-right">
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-700 text-sm font-bold rounded-lg">
                                                        {formatCurrency(provider.avgAmount)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5 whitespace-nowrap text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                            <div 
                                                                className={`h-full rounded-full ${
                                                                    provider.percentage > 10 ? 'bg-gradient-to-r from-red-500 to-orange-500' :
                                                                    provider.percentage > 5 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                                                                    'bg-gradient-to-r from-green-500 to-emerald-500'
                                                                }`}
                                                                style={{ width: `${Math.min(provider.percentage * 5, 100)}%` }}
                                                            ></div>
                                                        </div>
                                                        <span className={`inline-flex items-center px-3 py-1.5 text-xs font-bold rounded-lg ${
                                                            provider.percentage > 10 ? 'bg-red-100 text-red-700' :
                                                            provider.percentage > 5 ? 'bg-yellow-100 text-yellow-700' :
                                                            'bg-green-100 text-green-700'
                                                        }`}>
                                                            {provider.percentage.toFixed(1)}%
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">
                                        Showing <span className="font-bold text-gray-900">{data.length}</span> providers
                                    </span>
                                    <span className="text-gray-500">
                                        Total claims: <span className="font-bold text-gray-900">{formatNumber(totalClaims)}</span>
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default ProviderChart;