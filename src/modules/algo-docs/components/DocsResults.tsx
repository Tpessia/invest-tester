import React from 'react';

const DocsResults: React.FC = () => {
    return (
        <div className='DocsResult'>
            <h1>Results</h1>
            <p>The Results section provides a detailed breakdown of the simulation outcome, offering comprehensive performance metrics and a log of significant events during the simulation.</p>
            <h2>Metrics &#40;AlgoResult interface&#41;:</h2>
            <ul>
                <li><strong>summary: AlgoResultSummary</strong> - A concise overview of the simulation results, including:
                    <ul>
                        <li>initCash: number &#40;Initial cash balance&#41;</li>
                        <li>finalCash: number &#40;Final cash balance&#41;</li>
                        <li>totalVar: number &#40;Total return as a decimal&#41;</li>
                        <li>annualVar: number &#40;Annualized return as a decimal&#41;</li>
                        <li>high: number &#40;Highest portfolio value reached&#41;</li>
                        <li>low: number &#40;Lowest portfolio value reached&#41;</li>
                        <li>nTrades: number &#40;Total number of trades executed&#41;</li>
                    </ul>
                </li>
                <li><strong>performance: AlgoResultPerformance&#91;&#93;</strong> - An array of objects, each representing a data point in the simulation, including:
                    <ul>
                        <li>date: Date &#40;The date of the data point&#41;</li>
                        <li>value: number &#40;Portfolio value at this date&#41;</li>
                        <li>prevVariation: number &#40;Percentage change from the previous data point&#41;</li>
                        <li>initVariation: number &#40;Percentage change from the initial value&#41;</li>
                        <li>drawdown: number &#40;Current drawdown as a percentage of the peak value&#41;</li>
                    </ul>
                </li>
                <li><strong>portfolio: AssetPortfolio</strong> - Represents the final state of the portfolio, including cash balance and all asset positions.</li>
                <li><strong>portfolioHist: AssetPortfolio&#91;&#93;</strong> - An array of AssetPortfolio objects, representing the historical states of the portfolio throughout the simulation.</li>
                <li><strong>assetHist: Record&lt;string, AssetDataFlat&#91;&#93;&gt;</strong> - A record of historical data for each asset, keyed by asset ticker. Each value is an array of AssetDataFlat objects containing price and other relevant data for each simulation data point.</li>
                <li><strong>tradeHist: Record&lt;string, AssetTrade&#91;&#93;&gt;</strong> - A record of all trades executed during the simulation, keyed by date. Each value is an array of AssetTrade objects detailing the trades made on that date.</li>
            </ul>
            <h2>Messages Output:</h2>
            <p>An array of string messages logged during the simulation. These messages provide a narrative of the simulation&apos;s progress and include:</p>
            <ul>
                <li>Trading actions: Details of buy and sell orders executed by the algorithm.</li>
                <li>Cash injections or withdrawals: Records of any cash added to or removed from the portfolio.</li>
                <li>Rebalancing events: Notifications of portfolio rebalancing in the Portfolio simulation.</li>
                <li>Errors or warnings: Any issues encountered during the simulation execution.</li>
            </ul>
            <p>The combination of quantitative metrics and qualitative message logs provides users with a comprehensive understanding of their algorithm&apos;s performance and behavior throughout the simulated period. This data can be used for strategy refinement, performance analysis, and identifying areas for improvement in the trading algorithm or portfolio allocation.</p>
            <h2>Charts:</h2>
            <p>Several charts are generated at the end of the run to visually represent the performance and behavior of the algorithm. These charts include:</p>
            <ul>
                <li><strong>Performance Chart:</strong> Displays the portfolio value over time, providing a visual representation of the performance of the algorithm throughout the simulation.</li>
                <li><strong>Drawdown Chart:</strong> Shows the drawdown over time, indicating the percentage drop from the peak portfolio value, which helps in understanding the risk and volatility of the strategy.</li>
                <li><strong>Positions Chart:</strong> Illustrates the value of different asset positions over time, giving insights into how the portfolio's composition changed during the simulation.</li>
                <li><strong>Quantities Chart:</strong> Represents the quantities of each asset held in the portfolio over time, helping to analyze the trading behavior and asset allocation.</li>
                <li><strong>Prices Chart:</strong> Displays the prices of assets in the portfolio over time, providing a view of the market conditions and price movements that influenced the portfolio's performance.</li>
            </ul>
        </div>
    );
};

export default DocsResults;