const BidWorkspace = ({ bids, setBids, forecastData, market, filterViolations, setFilterViolations, initialBids }: { bids: any[], setBids: any, forecastData: any[], market: string, filterViolations?: boolean, setFilterViolations?: any, initialBids?: any[] }) => {
  const handleBidChange = (originalIndex: number, field: string, value: any) => {
    const newBids = [...bids];
    newBids[originalIndex][field] = value;
    
    // Automatically trigger 'Manual Override' reason if a user manipulates numeric fields
    if ((field === 'volume_mw' || field === 'bid_price') && newBids[originalIndex].reason !== 'Manual Override') {
        newBids[originalIndex].reason = 'Manual Override';
    }
    
    // When reverting to 'Auto' (None), perfectly restore the specific block's pristine AI predicted values
    if (field === 'reason' && value === 'None' && initialBids && initialBids[originalIndex]) {
        newBids[originalIndex].volume_mw = initialBids[originalIndex].volume_mw;
        newBids[originalIndex].bid_price = initialBids[originalIndex].bid_price;
    }
    
    setBids(newBids);
  };

  const exportToCSV = () => {
    if (!bids || bids.length === 0) return;
    
    let csvContent = "Block,Time,Raw Demand (MW),AI Base Price,Bid Volume (MW),Bid Price (INR/MWh),Action,Market,Override Reason\n";
    
    bids.forEach((bid) => {
      const fcast = forecastData.find(f => f.block === bid.block);
      const predicted = fcast ? fcast.predicted_price : '-';
      const rawDemand = fcast ? fcast.raw_demand : '-';
      const actionStr = market === 'RTM' ? 'SELL' : 'BUY';
      const reasonStr = bid.reason || 'Auto';
      
      const row = [
        bid.block,
        formatTime(bid.block),
        rawDemand,
        predicted,
        bid.volume_mw,
        bid.bid_price,
        actionStr,
        market,
        `"${reasonStr}"`
      ].join(',');
      
      csvContent += row + "\n";
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Bidding_Strategy_${market}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatTime = (blockNum: number) => {
    const startMins = (blockNum - 1) * 15;
    const endMins = blockNum * 15;
    
    const format = (mins: number) => {
      const h = Math.floor(mins / 60);
      const m = mins % 60;
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    };
    
    return `${format(startMins)} - ${format(endMins)}`;
  };

  if (!bids || bids.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <h3 style={{ color: 'var(--text-secondary)' }}>Awaiting AI Recommendations...</h3>
      </div>
    );
  }

  return (
    <div>
      <h2>Bid Preparation Workspace</h2>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
          Review and override AI recommendations. Manual overrides require a reason code.
        </p>
        <div style={{ display: 'flex', gap: '1rem' }}>
          {filterViolations && setFilterViolations && (
            <button 
              onClick={() => setFilterViolations(false)}
              style={{ background: 'var(--danger)', color: 'white', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
              ✕ Clear Violation Filters
            </button>
          )}
          <button 
            onClick={exportToCSV}
            style={{ background: 'var(--success)', color: 'white', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            ⬇️ Export as CSV
          </button>
        </div>
      </div>

      <div className="bids-table-container">
        <table className="bids-table">
          <thead>
            <tr>
              <th>Time Block</th>
              <th>AI Forecast (INR)</th>
              <th>Bid Volume (MW)</th>
              <th>Bid Price (INR)</th>
              <th>Market Segment</th>
              <th>Reason Code</th>
            </tr>
          </thead>
          <tbody>
            {bids.map((bid, originalIndex) => ({ ...bid, originalIndex }))
               .filter(bid => !filterViolations || bid.volume_mw > 125 || bid.bid_price > 10)
               .map((bid) => {
              const i = bid.originalIndex;
              const fcast = forecastData.find(f => f.block === bid.block);
              const predicted = fcast ? fcast.predicted_price : '-';
              const isVolViolation = bid.volume_mw > 125; // Adjusted to match the newly simulated 125 MW physical transformer limit
              const isPriceViolation = bid.bid_price > 10;

              return (
                <tr key={i} id={`block-row-${bid.block}`}>
                  <td>
                    <strong>Block {bid.block}</strong> <br/>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{formatTime(bid.block)}</span>
                  </td>
                  <td>{predicted}</td>
                  <td>
                    <input 
                      type="number" 
                      className={isVolViolation ? 'violation' : ''}
                      value={bid.volume_mw === '' ? '' : bid.volume_mw} 
                      onChange={(e) => handleBidChange(i, 'volume_mw', e.target.value === '' ? '' : Number(e.target.value))}
                    />
                  </td>
                  <td>
                    <input 
                      type="number" 
                      className={isPriceViolation ? 'violation' : ''}
                      value={bid.bid_price === '' ? '' : bid.bid_price} 
                      onChange={(e) => handleBidChange(i, 'bid_price', e.target.value === '' ? '' : Number(e.target.value))}
                    />
                  </td>
                  <td>
                    <span 
                      style={{ background: 'rgba(34, 211, 238, 0.1)', color: 'var(--accent-cyan)', padding: '0.2rem 0.5rem', border: '1px solid rgba(34, 211, 238, 0.3)', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}
                    >
                      {market}
                    </span>
                  </td>
                  <td>
                    <select 
                      style={{ background: 'rgba(0,0,0,0.2)', color: 'white', padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '4px' }}
                      value={bid.reason || 'None'}
                      onChange={(e) => handleBidChange(i, 'reason', e.target.value)}
                    >
                      <option value="None">Auto</option>
                      <option value="Risk Adjustment">Risk Adjustment</option>
                      <option value="Weather Change">Weather Change</option>
                      <option value="Manual Override">Manual Override</option>
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BidWorkspace;
