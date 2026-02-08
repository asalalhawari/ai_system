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
    Cell
} from 'recharts';
import apiService from '../services/apiService';
import { ProviderAnalysis } from '../types/dashboard';
import { formatCurrency, formatNumber } from '../utils/formatters';
import { CHART_COLORS, RANK_COLORS } from '../constants/colors';

const LoadingState: React.FC = () => (
    <div className="flex justify-center items-center min-h-[300px]">
        <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            <p className="mt-3 text-gray-600">Loading provider data...</p>
        </div>
    </div>
);

const ErrorState: React.FC<{ message: string; onRetry: () => void }> = ({ message, onRetry }) => (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
            <span className="text-red-800">{message}</span>
            <button
                onClick={onRetry}
                className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
            >
                Retry
            </button>
        </div>
    </div>
);

const EmptyState: React.FC = () => (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
        <p className="text-gray-600">No provider data available</p>
        <p className="text-sm text-gray-500 mt-1">Upload claims data to see provider analysis</p>
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
            <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
                <p className="font-bold text-gray-800 mb-2">Provider: {data.name}</p>
                <div className="space-y-1 text-sm">
                    <p className="text-blue-600">
                        <span className="font-medium">Claims:</span> {formatNumber(data.claims)}
                    </p>
                    <p className="text-green-600">
                        <span className="font-medium">Total Amount:</span> {formatCurrency(data.totalAmount)}
                    </p>
                    <p className="text-purple-600">
                        <span className="font-medium">Avg per Claim:</span> {formatCurrency(data.avgAmount)}
                    </p>
                    <p className="text-orange-600">
                        <span className="font-medium">Percentage:</span> {data.percentage.toFixed(1)}%
                    </p>
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

    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-md p-6 border border-blue-100">
                <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">Filter Options</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Number of Providers
                        </label>
                        <select
                            value={limit}
                            onChange={(e) => setLimit(Number(e.target.value))}
                            disabled={loading}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm transition-all hover:border-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <option value={5}>Top 5</option>
                            <option value={10}>Top 10</option>
                            <option value={15}>Top 15</option>
                            <option value={20}>Top 20</option>
                            <option value={30}>Top 30</option>
                            <option value={50}>Top 50</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Start Date
                        </label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            disabled={loading}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all hover:border-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            End Date
                        </label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            disabled={loading}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all hover:border-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                    </div>
                </div>

                {(startDate || endDate || limit !== 20) && (
                    <div className="mt-4 flex justify-end">
                        <button
                            onClick={() => {
                                setStartDate('');
                                setEndDate('');
                                setLimit(20);
                            }}
                            disabled={loading}
                            className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Clear Filters
                        </button>
                    </div>
                )}
            </div>

            {loading ? (
                <LoadingState />
            ) : error ? (
                <ErrorState message={error} onRetry={loadData} />
            ) : data.length === 0 ? (
                <EmptyState />
            ) : (
                <>
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <div className="mb-4">
                            <h3 className="text-xl font-bold text-gray-800">Top Providers by Claims Volume</h3>
                            <p className="text-sm text-gray-600 mt-1">
                                Showing top {data.length} providers ranked by number of claims submitted
                            </p>
                        </div>

                        <ResponsiveContainer width="100%" height={500}>
                            <BarChart
                                data={data}
                                layout="vertical"
                                margin={{ top: 5, right: 30, left: 150, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis
                                    type="number"
                                    stroke="#666"
                                    style={{ fontSize: '12px' }}
                                />
                                <YAxis
                                    type="category"
                                    dataKey="name"
                                    stroke="#666"
                                    width={140}
                                    style={{ fontSize: '12px' }}
                                    interval={0}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                                <Bar
                                    dataKey="claims"
                                    name="Claims Count"
                                    radius={[0, 4, 4, 0]}
                                >
                                    {data.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>

                        <p className="text-xs text-gray-500 text-center mt-4">
                            Hover over bars to see detailed metrics for each provider
                        </p>
                    </div>

                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h4 className="text-lg font-semibold text-gray-800 mb-4">Provider Performance Details</h4>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Rank
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Provider Code
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Claims
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Total Amount
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Avg per Claim
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            % of Total
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {data.map((provider, index) => (
                                        <tr
                                            key={index}
                                            className="hover:bg-gray-50 transition-colors duration-150"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${index === 0 ? 'bg-yellow-100 text-yellow-800' :
                                                        index === 1 ? 'bg-gray-100 text-gray-800' :
                                                            index === 2 ? 'bg-orange-100 text-orange-800' :
                                                                'bg-blue-50 text-blue-700'
                                                    }`}>
                                                    {index + 1}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm font-medium text-gray-900">{provider.name}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <span className="text-sm font-semibold text-blue-600">
                                                    {formatNumber(provider.claims)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <span className="text-sm font-semibold text-green-600">
                                                    {formatCurrency(provider.totalAmount)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <span className="text-sm text-purple-600">
                                                    {formatCurrency(provider.avgAmount)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${provider.percentage > 10 ? RANK_COLORS.high :
                                                        provider.percentage > 5 ? RANK_COLORS.medium :
                                                            RANK_COLORS.low
                                                    }`}>
                                                    {provider.percentage.toFixed(1)}%
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default ProviderChart;
