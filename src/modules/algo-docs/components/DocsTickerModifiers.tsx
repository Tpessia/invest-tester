import React from 'react';

const DocsTickerModifiers: React.FC = () => {
    return (
        <div className='DocsTickerModifiers'>
            <h1>Modifiers &#40;Currency, Rate&#41;</h1>
            <p><strong>Currency format:</strong> &#91;TICKER&#93;:&#91;CURRENCY&#93;</p>
            <p><strong>Rate format:</strong> &#91;TICKER&#93;&#91;RATE&#93;</p>
            <p><strong>Examples:</strong></p>
            <ul>
                <li>AAPL:BRL &#40;Apple stock in Brazilian Reais&#41;</li>
                <li>PETR4.SA100 &#40;Petrobras stock with rate 100&#41;</li>
            </ul>
            <p>Modifiers allow users to adjust the behavior of standard tickers, providing additional flexibility in asset representation.</p>
            <h2>Currency Modifier:</h2>
            <p>The currency modifier enables users to convert asset prices to a different currency. This is particularly useful for creating multi-currency portfolios or for users who want to view all assets in their local currency.</p>
            <p>Example: AAPL:BRL will display the price of Apple stock converted to Brazilian Reais.</p>
            <h2>Rate Modifier:</h2>
            <p>The rate modifier applies a multiplication factor to the asset&apos;s value. This can be used to adjust for different lot sizes, create leveraged positions, or implement custom scaling factors.</p>
            <p>Example: PETR4.SA*100 will multiply the price of Petrobras stock by 100, which could be used to represent 100 shares as a single unit.</p>
        </div>
    );
};

export default DocsTickerModifiers;