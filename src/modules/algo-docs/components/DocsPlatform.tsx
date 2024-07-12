import React from 'react';
import { Link } from 'react-router-dom';

const DocsPlatform: React.FC = () => {
    return (
        <div className='DocsPlatform'>
                <h1>InvestTester</h1>
                <p>This documentation describes this trading simulation platform designed for backtesting investment strategies, portfolio management, and algorithmic trading. The platform consists of several key components:</p>
                <ul>
                    <li><strong><Link to='?doc=ticker-overview'>Tickers:</Link></strong> A flexible system for representing various financial instruments, including stocks, indices, currencies, and custom assets.</li>
                    <li><strong><Link to='?doc=portfolio'>Portfolio Simulation:</Link></strong> A simulation environment for creating and testing custom portfolio allocations over specified time periods.</li>
                    <li><strong><Link to='?doc=algo-trading'>Algo Trading Simulation:</Link></strong> An advanced platform for writing, testing, and simulating custom trading algorithms using JavaScript.</li>
                    <li><strong><Link to='?doc=results'>Results Analysis:</Link></strong> A detailed breakdown of simulation outcomes, providing comprehensive performance metrics and event logs.</li>
                </ul>
                <p>This platform enables users to:</p>
                <ul>
                    <li>Backtest investment strategies using historical data</li>
                    <li>Analyze asset allocation effectiveness</li>
                    <li>Implement and test complex trading algorithms</li>
                    <li>Simulate multi-asset portfolios with various rebalancing strategies</li>
                    <li>Evaluate performance using a wide range of metrics</li>
                </ul>
                <p>The following sections provide detailed information on each component of the platform, including available features, input parameters, and output formats.</p>
        </div>
    );
};

export default DocsPlatform;