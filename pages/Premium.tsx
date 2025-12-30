

import React, { useState, useEffect } from 'react';
import { getSpendingForecastAndSuggestions } from '../services/geminiService';
import { AIResponse, AIForecast, AISuggestion } from '../types';
import Card from '../components/Card';
import { useAppContext } from '../contexts/AppContext';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const ForecastCard: React.FC<{ forecast: AIForecast }> = ({ forecast }) => (
    <div className="bg-primary/5 p-4 rounded-lg">
        <p className="font-semibold text-lg">{forecast.category}</p>
        <p className="text-primary text-2xl font-bold my-1">{formatCurrency(forecast.predictedSpend)}</p>
        <p className="text-sm text-muted">
            Dự kiến từ {formatCurrency(forecast.confidenceInterval[0])} đến {formatCurrency(forecast.confidenceInterval[1])}
        </p>
    </div>
);

const SuggestionCard: React.FC<{ suggestion: AISuggestion }> = ({ suggestion }) => {
    const { t } = useAppContext();
    const priorityClasses = {
        high: 'border-danger text-danger',
        medium: 'border-warning text-warning',
        low: 'border-success text-success'
    };

    return (
        <div className={`border-l-4 ${priorityClasses[suggestion.priority]} bg-primary/5 p-4 rounded-r-lg`}>
            <h4 className="font-bold text-text">{t(suggestion.title)}</h4>
            <p className="text-muted mt-1">{t(suggestion.description)}</p>
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
        // Assuming the service now returns keys for translation
        const data = await getSpendingForecastAndSuggestions();
        setAiData(data);
        setError(null);
      } catch (err) {
        setError(t('premium.error'));
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [t]);
  
  const SparkleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mr-2 text-accent">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
    </svg>
  );

  return (
    <div>
      <div className="flex items-center mb-6">
        <SparkleIcon />
        <h2 className="text-3xl font-bold text-text">{t('premium.title')}</h2>
      </div>
      
      {isLoading && <div className="text-center p-8">
        <p className="text-lg">{t('premium.loading')}</p>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mt-4"></div>
      </div>}
      
      {error && <Card className="bg-danger/10 border border-danger text-danger">{error}</Card>}

      {aiData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
                <Card title={t('premium.forecastTitle')}>
                    <div className="space-y-4">
                        {aiData.forecasts.map(f => <ForecastCard key={f.category} forecast={f} />)}
                    </div>
                </Card>
            </div>
            <div>
                 <Card title={t('premium.assistantTitle')}>
                    <div className="bg-accent/10 p-4 rounded-lg mb-6 border border-accent/30">
                        <p className="text-accent">{t(aiData.summary)}</p>
                    </div>
                    <h3 className="text-xl font-semibold mb-4">{t('premium.suggestionsTitle')}</h3>
                    <div className="space-y-4">
                        {aiData.suggestions.map((s, i) => <SuggestionCard key={i} suggestion={s} />)}
                    </div>
                 </Card>
            </div>
        </div>
      )}
    </div>
  );
};

export default Premium;