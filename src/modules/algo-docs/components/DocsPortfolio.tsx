import React from 'react';

const DocsPortfolio: React.FC = () => {
    return (
        <div className='DocsPortfolio'>
            <h1>Portfolio</h1>
            <p>The Portfolio tool is a sophisticated simulation environment that allows users to create and test custom portfolio allocations over specified time periods. It provides a way to backtest investment strategies, analyze asset allocation effectiveness, and understand the potential performance of a multi-asset portfolio.</p>
            <h2>Fields:</h2>
            <ul>
                <li><strong>Tickers + Percent</strong> - An array of asset tickers that will compose the portfolio. Users can include any combination of the ticker types described in the Tickers section.</li>
                <li><strong>Balance</strong> - The initial cash balance of the portfolio in the base currency. This represents the starting investment amount for the simulation.</li>
                <li><strong>Deposits</strong> - A fixed amount that will be added to the portfolio on a monthly basis, simulating regular contributions to the investment portfolio.</li>
                <li><strong>Date</strong> - A tuple representing the start and end dates for the simulation. This defines the historical period over which the portfolio performance will be evaluated.</li>
                <li><strong>Rebalance</strong> - When set to true, the portfolio will automatically rebalance on a monthly basis to maintain the specified asset allocation percentages. This simulates a disciplined rebalancing strategy.</li>
                <li><strong>Download</strong> - If true, allows the user to download the detailed simulation results as a JSON file for further analysis or record-keeping.</li>
            </ul>
            <p>The Portfolio tool uses these inputs to simulate the performance of the specified portfolio over time, taking into account the initial balance, regular deposits, asset allocation, and rebalancing strategy. It provides a powerful way for users to test and refine their investment strategies based on historical data.</p>
        </div>
    );
};

export default DocsPortfolio;