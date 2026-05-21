import React, { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

const ForecastingChart = ({ forecastData, bids }: { forecastData: any[], bids: any[] }) => {
  const [chartType, setChartType] = useState<'smooth' | 'stepped' | 'bar'>('smooth');

  if (!forecastData || forecastData.length === 0) return null;

  const labels = forecastData.map(d => {
    const startMins = (d.block - 1) * 15;
    const h = Math.floor(startMins / 60).toString().padStart(2, '0');
    const m = (startMins % 60).toString().padStart(2, '0');
    return `${h}:${m}`;
  });

  const aiPrices = forecastData.map(d => d.predicted_price);
  
  // Dynamic sync: if user modified the bid in Workspace, the chart renders the modified line!
  const activePrices = forecastData.map(d => {
    const manualBid = (bids || []).find((b: any) => b.block === d.block);
    return manualBid ? manualBid.bid_price : d.predicted_price;
  });

  const hasDiverged = (bids || []).length > 0 && activePrices.some((val, i) => val !== aiPrices[i]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        labels: { color: 'rgba(255, 255, 255, 0.7)' }
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        titleColor: '#fff',
        titleFont: { size: 14 },
        bodyFont: { size: 14 },
        borderColor: 'rgba(34, 211, 238, 0.3)',
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        callbacks: {
          label: function(context: any) {
            return `${context.dataset.label}: ₹${context.parsed.y.toFixed(2)}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(255,255,255,0.05)' },
        ticks: { color: 'rgba(255,255,255,0.5)', maxTicksLimit: 12 }
      },
      y: {
        grid: { color: 'rgba(255,255,255,0.05)' },
        ticks: { color: 'rgba(255,255,255,0.5)', callback: (val: any) => '₹' + Number(val).toFixed(2) }
      }
    }
  };

  const data = {
    labels,
    datasets: [
      {
        type: chartType === 'bar' ? 'bar' : 'line',
        fill: chartType !== 'bar',
        label: 'Active Bid Price',
        data: activePrices,
        borderColor: 'rgba(34, 211, 238, 1)',
        backgroundColor: chartType === 'bar' ? 'rgba(34, 211, 238, 0.4)' : 'rgba(34, 211, 238, 0.15)',
        tension: chartType === 'smooth' ? 0.4 : 0,
        stepped: chartType === 'stepped' ? 'middle' : false,
        pointRadius: 0,
        pointHoverRadius: 6,
        borderRadius: chartType === 'bar' ? 4 : 0,
      },
      ...(hasDiverged ? [{
        type: 'line' as const, // Always keep original baseline as a line comparison
        fill: false,
        label: 'Original AI Forecast',
        data: aiPrices,
        borderColor: 'rgba(192, 132, 252, 0.8)',
        borderDash: [5, 5],
        tension: chartType === 'smooth' ? 0.4 : 0,
        stepped: chartType === 'stepped' ? 'middle' : false,
        pointRadius: 0,
      }] : [])
    ],
  };

  return (
    <div className="glass-panel" style={{ marginBottom: '2rem', height: '420px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ color: 'var(--text-secondary)', margin: 0 }}>Market Price Prediction Curve</h3>
        <select 
          value={chartType} 
          onChange={(e) => setChartType(e.target.value as any)}
          style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer' }}
        >
          <option value="smooth">📈 Smooth Curve (Stock Classic)</option>
          <option value="stepped">🪜 Stepped Line (Energy Grid)</option>
          <option value="bar">📊 Bar Depth (Market Volumes)</option>
        </select>
      </div>
      <div style={{ height: '340px' }}>
        <Line options={options} data={data as any} />
      </div>
    </div>
  );
};

export default ForecastingChart;
