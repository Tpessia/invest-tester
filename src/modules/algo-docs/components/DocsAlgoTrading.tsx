import React from 'react';

const DocsAlgoTrading: React.FC = () => {
    return (
        <div className='DocsAlgoTrading'>
            <h1>Algo Trading</h1>
            <p>The Algo Trading tool is an advanced platform that enables users to write, test, and simulate custom trading algorithms using JavaScript. It provides a flexible, event-driven environment where users can implement complex trading strategies and backtest them against historical market data.</p>
            <h2>Fields:</h2>
            <ul>
                <li><strong>Tickers</strong> - An array of asset tickers that the algorithm will trade. These can include any of the ticker types described in the Tickers section.</li>
                <li><strong>Balance</strong> - The initial cash balance available for trading, denominated in the base currency. This represents the starting capital for the trading algorithm.</li>
                <li><strong>Date</strong> - A tuple of start and end dates defining the historical period over which the algorithm will be simulated.</li>
                <li><strong>Leverage</strong> - When set to true, enables leveraged trading, allowing the algorithm to take positions larger than the available cash balance. This should be used cautiously as it increases both potential returns and risks.</li>
                <li><strong>Init. Margin</strong> - The initial margin requirement, represented as a decimal between 0 and 1. This is only applicable when Leverage is enabled. It defines the proportion of the position value that must be covered by available cash.</li>
                <li><strong>Min. Margin</strong> - The minimum margin requirement, also represented as a decimal between 0 and 1. This is the threshold below which a margin call would be triggered. Only applicable when Leverage is enabled.</li>
                <li><strong>Code</strong> - The JavaScript code that defines the trading algorithm. This is where users implement their trading logic, using the provided AlgoWorkspace environment.</li>
            </ul>
            <h2>Code &#40;AlgoWorkspace&#41;:</h2>
            <p>The AlgoWorkspace provides an event-driven environment for algorithm execution. It offers a set of events, properties, and methods that allow users to interact with the simulation environment and implement their trading logic.</p>
            <h3>Available events:</h3>
            <ul>
                <li><code>this.on&#40;&apos;start&apos;, async &#40;next, timeseries&#41; =&gt; &#123; ... &#125;&#41;</code> - Triggered at the start of the simulation. The timeseries parameter provides access to the entire historical dataset for all assets.</li>
                <li><code>this.on&#40;&apos;data&apos;, async &#40;next&#41; =&gt; &#123; ... &#125;&#41;</code> - Triggered for each data point &#40;typically each trading day&#41; in the simulation. This is where the main trading logic is typically implemented.</li>
                <li><code>this.on&#40;&apos;end&apos;, async &#40;next, result&#41; =&gt; &#123; ... &#125;&#41;</code> - Triggered at the end of the simulation. The result parameter provides access to the final simulation results.</li>
                <li><code>this.on&#40;&apos;error&apos;, async &#40;next, errors&#41; =&gt; &#123; ... &#125;&#41;</code> - Triggered when an error occurs during the simulation. The errors parameter contains details about the encountered error&#40;s&#41;.</li>
            </ul>
            <h3>Properties and methods:</h3>
            <ul>
                <li><code>this.date</code> - The current date in the simulation.</li>
                <li><code>this.assets</code> - An array containing the current price and other relevant data for each asset being traded.</li>
                <li><code>this.portfolio</code> - Represents the current state of the portfolio, including cash balance and asset positions.</li>
                <li><code>this.index</code> - The current iteration index in the simulation.</li>
                <li><code>this.length</code> - The total number of iterations in the simulation.</li>
                <li><code>this.inputs</code> - Contains the initial input parameters for the simulation.</li>
                <li><code>this.state</code> - A user-defined object for storing custom state data throughout the simulation.</li>
                <li><code>this.buy&#40;assetCode: string, quantity: number&#41;: void</code> - Executes a buy order for the specified asset and quantity.</li>
                <li><code>this.sell&#40;assetCode: string, quantity: number&#41;: void</code> - Executes a sell order for the specified asset and quantity.</li>
                <li><code>this.print&#40;...msgs: string&#91;&#93;&#41;: void</code> - Logs messages to the simulation output.</li>
                <li><code>this.injectCash&#40;amount: number&#41;: void</code> - Adds the specified amount of cash to the portfolio.</li>
                <li><code>this.loadScript&#40;path: string&#41;: Promise&lt;HTMLScriptElement&gt;</code> - Loads an external JavaScript file, allowing the use of additional libraries or modules.</li>
                <li><code>this.download&#40;obj: any, name?: string&#41;: void</code> - Generates a downloadable file containing the specified object data.</li>
            </ul>
            <p>These tools and methods provide a comprehensive environment for implementing and testing complex trading strategies. Users can access market data, manage a portfolio, execute trades, and analyze results all within the AlgoWorkspace.</p>
        </div>
    );
};

export default DocsAlgoTrading;