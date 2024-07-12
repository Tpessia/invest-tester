import React from 'react';

const DocsTickerYahoo: React.FC = () => {
    return (
        <div className='DocsTickerYahoo'>
            <h1>Yahoo</h1>
            <p><strong>Format:</strong> &#91;TICKER&#93;.&#91;EXCHANGE&#93;</p>
            <p><strong>Examples:</strong></p>
            <ul>
                <li>AAPL &#40;NASDAQ&#41;</li>
                <li>PETR4.SA &#40;São Paulo Stock Exchange&#41;</li>
                <li>EURUSD=X &#40;Currency pair&#41;</li>
            </ul>
            <p>The Yahoo ticker format aligns with the conventions used by Yahoo Finance, a widely-used financial data provider. This format allows users to access real-world market data for a vast array of financial instruments across global markets.</p>
            <p>Available Yahoo Exchanges: <a href='https://help.yahoo.com/kb/SLN2310.html#:~:text=Yahoo%20Finance%20Market%20Coverage%20and%20Data%20Delays' target='_blank'>https://help.yahoo.com/kb/SLN2310.html</a></p>
            <ul>
                <li>For U.S. stocks, the ticker is typically used without an exchange suffix &#40;e.g., AAPL for Apple Inc.&#41;.</li>
                <li>International stocks often include an exchange suffix &#40;e.g., PETR4.SA for Petrobras on the São Paulo Stock Exchange&#41;.</li>
                <li>Currency pairs use the &quot;=X&quot; suffix &#40;e.g., EURUSD=X for Euro to US Dollar exchange rate&#41;.</li>
                <li>Other instruments like ETFs, mutual funds, and indices can also be represented using their Yahoo Finance tickers.</li>
            </ul>
        </div>
    );
};

export default DocsTickerYahoo;