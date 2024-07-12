import React from 'react';

const DocsTickerOverview: React.FC = () => {
    return (
        <div className='DocsTickerOverview'>
            <h1>Tickers</h1>
            <p>Tickers are unique identifiers used to represent financial instruments or assets in the simulation platform. They provide a standardized way to reference various types of assets, including stocks, indices, currencies, and custom instruments. The platform supports multiple ticker formats to accommodate different asset types and data sources, allowing users to create diverse and realistic portfolio simulations or trading algorithms.</p>
            <p>Tickers are fundamental to the platform as they allow users to specify which assets they want to include in their portfolios or trading strategies. The flexibility of the ticker system enables users to work with a wide range of financial instruments, from simple fixed-rate assets to complex international securities.</p>
            <ul>
                <li>Basic &#40;Fixed rate&#41;</li>
                <li>Yahoo</li>
                <li>Modifiers &#40;Currency, Rate&#41;</li>
                <li>Regional &#40;Brazil - IPCA.SA, SELIC.SA, IMAB.SA, NTN-B/YYYY.SA&#41;</li>
            </ul>

            <h2>Basic</h2>

            <h3>Fixed Rate</h3>
            <p><strong>Format:</strong> FIXED:&#91;RATE&#93;</p>
            <p><strong>Example:</strong> FIXED:0.05 &#40;5% fixed rate&#41;</p>
            <p>This ticker format is used to represent fixed-rate assets, which maintain a constant growth rate throughout the simulation. This is particularly useful for modeling stable investments like savings accounts, certificates of deposit, or simplified bond representations.</p>
            <p>The &#91;RATE&#93; component should be expressed as a decimal. For instance, FIXED:0.05 represents a 5% annual growth rate. These assets do not fluctuate in value based on market conditions but instead grow at the specified rate compounded over the simulation period.</p>
        </div>
    );
};

export default DocsTickerOverview;