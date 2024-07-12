import React from 'react';

const DocsTickerRegional: React.FC = () => {
    return (
        <div className='DocsTickerRegional'>
            <h1>Regional &#40;Brazil&#41;</h1>
            <ul>
                <li>IPCA.SA: Brazilian Broad Consumer Price Index</li>
                <li>SELIC.SA: Brazilian base interest rate</li>
                <li>IMAB.SA: Brazilian Market Index for inflation-linked bonds</li>
                <li>NTN-B/YYYY.SA: Brazilian Treasury Inflation-Protected Securities &#40;maturity year&#41;</li>
            </ul>
            <p>The Regional ticker category provides access to country-specific financial instruments and economic indicators. In this case, the platform offers several Brazilian-specific tickers:</p>
            <ul>
                <li><strong>IPCA.SA:</strong> Represents the Broad Consumer Price Index &#40;Índice Nacional de Preços ao Consumidor Amplo&#41; in Brazil. This index measures Brazilian inflation and is crucial for various financial calculations and investment strategies in the Brazilian market.</li>
                <li><strong>SELIC.SA:</strong> Represents the Brazilian base interest rate &#40;Sistema Especial de Liquidação e Custódia&#41;. This rate is set by the Central Bank of Brazil and significantly influences the Brazilian financial market and economy.</li>
                <li><strong>IMAB.SA:</strong> Represents the Market Index for inflation-linked bonds &#40;Índice de Mercado ANBIMA&#41; in Brazil. This index tracks the performance of Brazilian government bonds that are linked to inflation.</li>
                <li><strong>NTN-B/YYYY.SA:</strong> Represents Brazilian Treasury Inflation-Protected Securities &#40;Notas do Tesouro Nacional - Série B&#41; with a specific maturity year. Users can replace &#123;YYYY&#125; with the desired maturity year to simulate investments in these inflation-protected government bonds.</li>
            </ul>
            <p>These regional tickers allow users to create more accurate and relevant simulations for the Brazilian market, incorporating key economic indicators and country-specific financial instruments.</p>
        </div>
    );
};

export default DocsTickerRegional;