# InvestTester

InvestTester is a web application that simulates investment portfolios and algorithmic trading strategies. It allows users to select a group of assets and simulate the results for a chosen date range via portfolio simulation or algo trading.

## Platform

### Portfolio

![Portfolio](https://raw.githubusercontent.com/Tpessia/invest-tester/main/docs/portfolio.jpg)

1. Insert the initial balance amount (and optionally the monthly deposits)
2. Select the date range to run the simulation
3. Select the group of assets and the percentage each represent on the portfolio
4. Press Start
5. Check the results on the Results Panel

### AlgoTrading

![AlgoTrading](https://raw.githubusercontent.com/Tpessia/invest-tester/main/docs/algo-trading.jpg)

1. Select the assets to simulate
2. Insert the initial balance amount
3. Select the date range to run the simulation
4. Check "Leverage" if you'd like to enable short selling
5. Create you algo trading code
6. Press Start
7. Check the results on the Results Panel

## Docker

```
npm run init
npm run docker:build
npm run docker:run
```

Then access http://localhost:80/

> Run on Linux or [GitBash](https://git-scm.com/downloads)