import { Timeframe } from '../types/strategy';

export const TIMEFRAMES: { value: Timeframe; label: string; color: string }[] = [
  { value: "1m", label: "1 minute", color: "bg-red-100 text-red-800" },
  { value: "3m", label: "3 minutes", color: "bg-red-100 text-red-800" },
  { value: "5m", label: "5 minutes", color: "bg-orange-100 text-orange-800" },
  { value: "15m", label: "15 minutes", color: "bg-orange-100 text-orange-800" },
  { value: "30m", label: "30 minutes", color: "bg-yellow-100 text-yellow-800" },
  { value: "1h", label: "1 hour", color: "bg-green-100 text-green-800" },
  { value: "2h", label: "2 hours", color: "bg-green-100 text-green-800" },
  { value: "4h", label: "4 hours", color: "bg-blue-100 text-blue-800" },
  { value: "1d", label: "1 day", color: "bg-purple-100 text-purple-800" },
  { value: "1w", label: "1 week", color: "bg-indigo-100 text-indigo-800" }
];

export const getTimeframeColor = (timeframe: Timeframe): string => {
  return TIMEFRAMES.find(tf => tf.value === timeframe)?.color || "bg-gray-100 text-gray-800";
};

export const getTimeframeLabel = (timeframe: Timeframe): string => {
  return TIMEFRAMES.find(tf => tf.value === timeframe)?.label || timeframe;
};