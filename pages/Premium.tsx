import React, { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';
import { AIResponse, AIForecast, AISuggestion } from '../types';
import Card from '../components/Card';
import { useAppContext } from '../contexts/AppContext';

// --- ICON COMPONENTS (Đồng nhất với các trang khác) ---
const SparkleIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
  </svg>
);

const ForecastCard: React.FC<{ forecast: AIForecast }> = ({ forecast }) => {
  const { formatCurrency } = useAppContext();

  return (
    <div className="group bg-gradient-to-br from-gray-50/80 to-white/80 dark:from-gray-800/30 dark:to-gray-900/30 p-5 rounded-xl border border-gray-200/50 dark:border-white/10 hover:border-primary/30 transition-all duration-300 hover:shadow-md">
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="font-semibold text-gray-800 dark:text-gray-100 text-lg">{forecast.category}</p>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Dự báo chi tiêu tháng tới</p>
        </div>
        <div className="p-2 bg-primary/10 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary dark:text-primary-light" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
      </div>
      
      <p className="text-primary dark:text-primary-light text-2xl font-bold my-2">
        {formatCurrency(forecast.predictedSpend)}
      </p>
      
      <div className="mt-4 pt-4 border-t border-gray-200/50 dark:border-white/10">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Dự kiến từ <span className="font-semibold text-gray-800 dark:text-gray-100">{formatCurrency(forecast.confidenceInterval[0])}</span> đến{' '}
          <span className="font-semibold text-gray-800 dark:text-gray-100">{formatCurrency(forecast.confidenceInterval[1])}</span>
        </p>
        <div className="w-full bg-gray-100 dark:bg-white/10 rounded-full h-2 mt-2 overflow-hidden">
          <div 
            className="h-2 rounded-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-700" 
            style={{ width: `${Math.min((forecast.predictedSpend / forecast.confidenceInterval[1]) * 100, 100)}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

const SuggestionCard: React.FC<{ suggestion: AISuggestion }> = ({ suggestion }) => {
  const { t } = useAppContext();

  const priorityConfig = {
    high: {
      borderColor: 'border-rose-200 dark:border-rose-800/30',
      textColor: 'text-rose-600 dark:text-rose-400',
      bgColor: 'from-rose-50/80 to-rose-100/50 dark:from-rose-900/20 dark:to-rose-800/10',
      iconColor: 'text-rose-600 dark:text-rose-400',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.502 0L4.196 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      )
    },
    medium: {
      borderColor: 'border-amber-200 dark:border-amber-800/30',
      textColor: 'text-amber-600 dark:text-amber-400',
      bgColor: 'from-amber-50/80 to-amber-100/50 dark:from-amber-900/20 dark:to-amber-800/10',
      iconColor: 'text-amber-600 dark:text-amber-400',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    low: {
      borderColor: 'border-emerald-200 dark:border-emerald-800/30',
      textColor: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'from-emerald-50/80 to-emerald-100/50 dark:from-emerald-900/20 dark:to-emerald-800/10',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  };

  const config = priorityConfig[suggestion.priority];

  return (
    <div className={`bg-gradient-to-br ${config.bgColor} border ${config.borderColor} p-5 rounded-xl transition-all duration-300 hover:shadow-md group`}>
      <div className="flex items-start gap-3">
        <div className={`p-2.5 ${config.bgColor.replace('from-', 'bg-').replace('to-', '')} rounded-lg border ${config.borderColor}`}>
          {config.icon}
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <h4 className={`font-bold text-lg ${config.textColor}`}>{t(suggestion.title)}</h4>
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${config.bgColor.replace('from-', 'bg-').replace('to-', '')} ${config.textColor} border ${config.borderColor}`}>
              {suggestion.priority === 'high' ? 'Ưu tiên cao' : 
               suggestion.priority === 'medium' ? 'Ưu tiên trung bình' : 
               'Ưu tiên thấp'}
            </span>
          </div>
          <p className="text-gray-700 dark:text-gray-300 mt-2 leading-relaxed">{t(suggestion.description)}</p>
          {suggestion.action && (
            <button className="mt-3 text-sm font-medium text-primary dark:text-primary-light hover:text-primary/80 flex items-center gap-1">
              <span>Xem chi tiết</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const Premium: React.FC = () => {
  const { t } = useAppContext();
  const [aiData, setAiData] = useState<AIResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const data = await apiService.getAIAnalysis();
        setAiData(data);
        setError(null);
      } catch (err) {
        console.error(err);
        setError(t('premium.error'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [t]);

  return (
    <div className="min-h-[80vh] flex flex-col animate-fade-in bg-gradient-to-b from-gray-50/50 to-transparent dark:from-gray-900/30 dark:to-transparent">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 rounded-2xl">
            <SparkleIcon className="h-8 w-8 text-primary dark:text-primary-light" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 tracking-tight">
              {t('premium.title') || 'Phân tích AI & Dự báo'}
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2 text-sm">
              Phân tích thông minh và dự báo tài chính từ AI
            </p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10 p-5 rounded-2xl border border-blue-200 dark:border-blue-800/30">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Phân tích AI</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">Nâng cao</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-800/10 p-5 rounded-2xl border border-purple-200 dark:border-purple-800/30">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Dự báo</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">Theo danh mục</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-900/20 dark:to-emerald-800/10 p-5 rounded-2xl border border-emerald-200 dark:border-emerald-800/30">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Gợi ý</p>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">Thông minh</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-primary to-primary/80 flex items-center justify-center mb-6 animate-pulse">
              <SparkleIcon className="h-10 w-10 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 animate-spin"></div>
          </div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-3">{t('premium.loading') || 'Đang phân tích dữ liệu...'}</h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm max-w-md text-center">
            AI đang phân tích chi tiêu và đưa ra dự báo thông minh cho bạn
          </p>
          <div className="w-48 h-2 bg-gray-100 dark:bg-white/10 rounded-full mt-6 overflow-hidden">
            <div className="h-2 rounded-full bg-gradient-to-r from-primary to-primary/80 animate-[loading_1.5s_ease-in-out_infinite]"></div>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <Card className="border border-rose-200 dark:border-rose-800/30 bg-gradient-to-br from-rose-50/80 to-rose-100/50 dark:from-rose-900/20 dark:to-rose-800/10 animate-fade-in-up">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-100 dark:bg-rose-900/30 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-rose-600 dark:text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.502 0L4.196 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-rose-800 dark:text-rose-300">Có lỗi xảy ra</h3>
              <p className="text-rose-700 dark:text-rose-400 text-sm mt-1">{error}</p>
            </div>
          </div>
        </Card>
      )}

      {/* AI Data Content */}
      {aiData && !isLoading && !error && (
        <div className="animate-fade-in-up">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Forecasts Column */}
            <div>
              <Card className="border border-gray-200 dark:border-white/10 overflow-hidden">
                <div className="p-5 border-b border-gray-100 dark:border-white/5 bg-gradient-to-r from-gray-50/50 to-white/50 dark:from-gray-800/30 dark:to-gray-900/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                        {t('premium.forecastTitle') || 'Dự báo chi tiêu'}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        Dự đoán chi tiêu tháng tới dựa trên lịch sử
                      </p>
                    </div>
                    <div className="p-2 bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 rounded-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary dark:text-primary-light" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="p-5">
                  <div className="space-y-4">
                    {aiData.forecasts.map((f) => (
                      <ForecastCard key={f.category} forecast={f} />
                    ))}
                  </div>
                </div>
              </Card>
            </div>

            {/* Assistant Column */}
            <div>
              <Card className="border border-gray-200 dark:border-white/10 overflow-hidden">
                <div className="p-5 border-b border-gray-100 dark:border-white/5 bg-gradient-to-r from-gray-50/50 to-white/50 dark:from-gray-800/30 dark:to-gray-900/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                        {t('premium.assistantTitle') || 'Trợ lý AI'}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        Phân tích và đề xuất từ AI
                      </p>
                    </div>
                    <div className="p-2 bg-gradient-to-br from-blue-500/10 to-blue-500/5 dark:from-blue-500/20 dark:to-blue-500/10 rounded-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="p-5">
                  {/* Summary Section */}
                  <div className="mb-6">
                    <h4 className="font-bold text-gray-800 dark:text-gray-100 mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                      Tổng quan phân tích
                    </h4>
                    <div className="bg-gradient-to-br from-blue-50/80 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10 p-5 rounded-xl border border-blue-200 dark:border-blue-800/30">
                      <p className="text-blue-800 dark:text-blue-300 leading-relaxed">{t(aiData.summary)}</p>
                    </div>
                  </div>

                  {/* Suggestions Section */}
                  <div>
                    <h4 className="font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      {t('premium.suggestionsTitle') || 'Đề xuất hành động'}
                    </h4>
                    <div className="space-y-4">
                      {aiData.suggestions.map((s, i) => (
                        <SuggestionCard key={i} suggestion={s} />
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Additional Insights */}
          <Card className="border border-gray-200 dark:border-white/10">
            <div className="p-5 border-b border-gray-100 dark:border-white/5">
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">Thông tin thêm</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Dữ liệu được cập nhật mỗi ngày</p>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-r from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary dark:text-primary-light" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="font-semibold text-gray-800 dark:text-gray-100">Cập nhật hàng ngày</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Dữ liệu được phân tích mỗi 24h</p>
                </div>
                
                <div className="text-center p-4">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 dark:from-emerald-500/20 dark:to-emerald-500/10 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="font-semibold text-gray-800 dark:text-gray-100">Độ chính xác cao</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Dựa trên thuật toán AI tiên tiến</p>
                </div>
                
                <div className="text-center p-4">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-r from-blue-500/10 to-blue-500/5 dark:from-blue-500/20 dark:to-blue-500/10 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="font-semibold text-gray-800 dark:text-gray-100">Phân tích thực tế</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Dựa trên chi tiêu thực tế của bạn</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Footer */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Phân tích được tạo vào {new Date().toLocaleDateString('vi-VN')} • Sử dụng công nghệ AI tiên tiến
        </p>
      </div>
    </div>
  );
};

export default Premium;