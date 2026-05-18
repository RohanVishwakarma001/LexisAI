import React from 'react';
import { BarChart, PieChart, TrendingUp, Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

export default function AIAnalyticsInsights() {
  return (
    <div className="space-y-lg max-w-container-max mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-md">
        <div>
          <h1 className="font-headline-lg text-on-surface">Analytics & Insights</h1>
          <p className="font-body-md text-on-surface-variant">Firm-wide performance metrics and AI predictive analysis.</p>
        </div>
        <Button variant="outline" leftIcon={<Download size={18} />}>Export Report</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
        {/* Billable Hours Chart (Mock) */}
        <Card className="h-[400px] flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-sm">
              <BarChart size={20} className="text-primary" />
              Billable Hours Trend
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex items-center justify-center bg-surface-container-lowest m-md rounded-lg border border-outline-variant/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent"></div>
            <div className="flex items-end gap-2 h-3/4 w-full px-lg justify-around z-10">
              {[40, 60, 30, 80, 50, 90, 75].map((h, i) => (
                <div key={i} className="w-8 bg-primary rounded-t-sm" style={{ height: `${h}%` }}></div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Case Success Predictor (Mock) */}
        <Card className="h-[400px] flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-sm">
              <TrendingUp size={20} className="text-secondary" />
              Win Probability Predictor
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col items-center justify-center bg-surface-container-lowest m-md rounded-lg border border-outline-variant/20">
            <div className="relative w-48 h-48">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="96" cy="96" r="80" fill="transparent" stroke="currentColor" strokeWidth="16" className="text-surface-container-highest" />
                <circle cx="96" cy="96" r="80" fill="transparent" stroke="currentColor" strokeWidth="16" strokeDasharray="502" strokeDashoffset="125" className="text-secondary" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-display text-[48px] text-secondary">75%</span>
                <span className="font-label-sm text-on-surface-variant uppercase">Average</span>
              </div>
            </div>
            <p className="font-body-md text-on-surface-variant text-center mt-md max-w-xs">
              Based on historical data and current AI modeling across 240 similar cases.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
