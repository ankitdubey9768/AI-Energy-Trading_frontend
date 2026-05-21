import React, { useState, useEffect } from 'react';
import BidWorkspace from '../components/BidWorkspace';
import RiskPanel from '../components/RiskPanel';
import ForecastingChart from '../components/ForecastingChart';
import PostMarketAnalysis from '../components/PostMarketAnalysis';
import ArbitrageWidget from '../components/ArbitrageWidget';
import BecknWidget from '../components/BecknWidget';
import PendingBidsModal from '../components/PendingBidsModal';
import TraderBidsStatusModal from '../components/TraderBidsStatusModal';

const Dashboard = ({ role }: { role: string }) => {
  const [view, setView] = useState<'live' | 'analysis'>('live');
  const [market, setMarket] = useState('DAM');
  const [strategy, setStrategy] = useState('Balanced');
  const [forecastData, setForecastData] = useState<any[]>([]);
  const [bids, setBids] = useState<any[]>([]);
  const [initialBids, setInitialBids] = useState<any[]>([]);
  const [riskMetrics, setRiskMetrics] = useState(null);
  const [filterViolations, setFilterViolations] = useState(false);
  const [isPendingModalOpen, setIsPendingModalOpen] = useState(false);
  const [isTraderStatusOpen, setIsTraderStatusOpen] = useState(false);

  useEffect(() => {
    fetchForecast();
  }, [market]); // re-fetch when market changes

  useEffect(() => {
    if (forecastData && forecastData.length > 0) {
      fetchRecommendations();
    }
  }, [strategy, forecastData]);

  useEffect(() => {
    if (bids && bids.length > 0) {
      fetchRisk();
    }
  }, [bids]);

  const fetchForecast = async () => {
    try {
      const res = await fetch(`http://localhost:8081/api/forecast?market=${market}&date=2026-04-05`);
      if (res.ok) {
        const data = await res.json();
        setForecastData(data.forecast);
      }
    } catch (e) { console.error('Forecast API error', e); }
  };

  const fetchRecommendations = async () => {
    try {
      const res = await fetch('http://localhost:8081/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ forecast_data: forecastData, strategy })
      });
      if (res.ok) {
        const data = await res.json();
        setBids(data.recommendations);
        setInitialBids(JSON.parse(JSON.stringify(data.recommendations)));
      }
    } catch (e) { console.error('Recommend API error', e); }
  };

  const fetchRisk = async () => {
    try {
      const res = await fetch('http://localhost:8081/api/risk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bids })
      });
      if (res.ok) {
        const data = await res.json();
        setRiskMetrics(data);
      }
    } catch (e) { console.error('Risk API error', e); }
  };

  const strategies = ['Conservative', 'Balanced', 'Aggressive'];
  const markets = ['DAM', 'RTM', 'TAM'];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
        <div className="strategy-toggle" style={{ transform: 'scale(1.15)' }}>
          <button className={`strategy-btn ${view === 'live' ? 'active' : ''}`} onClick={() => setView('live')}>
            Live Trading Desks
          </button>
          <button className={`strategy-btn ${view === 'analysis' ? 'active' : ''}`} onClick={() => setView('analysis')}>
            Post-Market Analysis
          </button>
        </div>

        {role === 'Manager' && (
          <button
            style={{ marginLeft: '2rem', background: 'var(--accent-purple)', color: 'white', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
            onClick={() => setIsPendingModalOpen(true)}
          >
            Review Pending Bids
          </button>
        )}

        {role === 'Trader' && (
          <button
            style={{ marginLeft: '2rem', background: 'rgba(34, 211, 238, 0.2)', border: '1px solid var(--accent-cyan)', color: 'var(--accent-cyan)', padding: '0.8rem 1.5rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
            onClick={() => setIsTraderStatusOpen(true)}
          >
            📋 View My Bid Status
          </button>
        )}
      </div>

      <PendingBidsModal
        isOpen={isPendingModalOpen}
        onClose={() => setIsPendingModalOpen(false)}
        onImportBids={(importedBids) => setBids(importedBids)}
      />

      <TraderBidsStatusModal
        isOpen={isTraderStatusOpen}
        onClose={() => setIsTraderStatusOpen(false)}
      />

      {view === 'analysis' && <PostMarketAnalysis />}

      {view === 'live' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div className="strategy-toggle">
              {markets.map(m => (
                <button
                  key={m}
                  className={`strategy-btn ${market === m ? 'active' : ''}`}
                  onClick={() => setMarket(m)}
                >
                  {m} Segment
                </button>
              ))}
            </div>

            <div className="strategy-toggle">
              {strategies.map(s => (
                <button
                  key={s}
                  className={`strategy-btn ${strategy === s ? 'active' : ''}`}
                  onClick={() => setStrategy(s)}
                >
                  {s} Strategy
                </button>
              ))}
            </div>
          </div>

          <div className="dashboard-grid">
            <div className="main-panel">
              <ForecastingChart forecastData={forecastData} bids={bids} />
              <div className="glass-panel">
                <BidWorkspace bids={bids} setBids={setBids} forecastData={forecastData} market={market} filterViolations={filterViolations} setFilterViolations={setFilterViolations} initialBids={initialBids} />
              </div>
            </div>
            <div className="side-panel">
              <RiskPanel metrics={riskMetrics} bids={bids} role={role} filterViolations={filterViolations} setFilterViolations={setFilterViolations} />
              <ArbitrageWidget />
              <BecknWidget />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
