import { useState, useEffect } from 'react';

export interface SymbolInfo {
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  status: string;
}

export const useSymbolData = (market: string, exchangeId?: string, region: string = 'COM') => {
  const [symbols, setSymbols] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSymbols();
  }, [market, exchangeId, region]);

  const loadSymbols = async () => {
    setLoading(true);
    setError(null);

    try {
      if (market === 'Crypto' && exchangeId) {
        // Try to fetch from actual Binance API
        const baseUrl = getApiBaseUrl(region);
        const response = await fetch(`${baseUrl}/api/v3/exchangeInfo`);
        
        if (response.ok) {
          const data = await response.json();
          const tradingSymbols = data.symbols
            .filter((s: any) => s.status === 'TRADING')
            .map((s: any) => s.symbol);
          
          setSymbols(tradingSymbols);
          setLoading(false);
          return;
        }
      }
      
      // Fallback to comprehensive mock data
      const comprehensiveSymbols = generateComprehensiveSymbols(market);
      setSymbols(comprehensiveSymbols);
      
    } catch (err) {
      console.error('Error loading symbols:', err);
      // Use comprehensive fallback
      const comprehensiveSymbols = generateComprehensiveSymbols(market);
      setSymbols(comprehensiveSymbols);
    } finally {
      setLoading(false);
    }
  };

  const getApiBaseUrl = (region: string) => {
    switch (region) {
      case 'US': return 'https://api.binance.us';
      case 'TESTNET': return 'https://testnet.binance.vision';
      default: return 'https://api.binance.com';
    }
  };

  const generateComprehensiveSymbols = (market: string): string[] => {
    if (market === 'Crypto') {
      const baseAssets = [
        // Major cryptocurrencies
        'BTC', 'ETH', 'BNB', 'ADA', 'SOL', 'XRP', 'DOT', 'AVAX', 'MATIC', 'LINK',
        'UNI', 'LTC', 'BCH', 'ATOM', 'FIL', 'TRX', 'ETC', 'XLM', 'VET', 'ICP',
        'THETA', 'ALGO', 'EGLD', 'AAVE', 'GRT', 'SAND', 'MANA', 'AXS', 'CHZ', 'ENJ',
        
        // Meme coins
        'DOGE', 'SHIB', 'PEPE', 'FLOKI', 'BONK', 'WIF', 'BOME', 'NEIRO', 'TURBO', 'BABYDOGE',
        
        // DeFi tokens
        'CAKE', 'SUSHI', 'CRV', 'BAL', 'YFI', 'COMP', 'MKR', 'SNX', 'REN', 'KNC',
        
        // Layer 1/2 tokens
        'NEAR', 'FTM', 'ONE', 'HBAR', 'FLOW', 'ROSE', 'CELO', 'KAVA', 'WAVES', 'ZIL',
        
        // Gaming/NFT tokens
        'IMX', 'GMT', 'APE', 'LOOKS', 'BLUR', 'MAGIC', 'TLM', 'SLP', 'ALICE', 'AUDIO',
        
        // Stablecoins
        'USDC', 'USDT', 'FDUSD', 'TUSD', 'BUSD', 'DAI', 'USDP', 'FRAX', 'LUSD', 'GUSD',
        
        // Wrapped tokens
        'WBTC', 'WETH', 'STETH', 'RETH', 'CBETH', 'ANKR', 'LDO', 'RPL', 'SWISE', 'FXS',
        
        // Additional popular tokens
        'BAT', 'ZEC', 'DASH', 'NEO', 'QTUM', 'ONT', 'ICX', 'HOT', 'IOST', 'CELR',
        'BAND', 'OCEAN', 'RSR', 'STORJ', 'REEF', 'DENT', 'KEY', 'OGN', 'NKN', 'WAN',
        'FET', 'CTSI', 'BAKE', 'HARD', 'DODO', 'TKO', 'BADGER', 'FARM', 'POLS', 'EPS',
        'JUV', 'PSG', 'CITY', 'OG', 'ATM', 'ASR', 'POR', 'SANTOS', 'BAR', 'LAZIO',
        'ALPINE', 'IBFK', 'NMR', 'REQ', 'VIB', 'SYS', 'NULS', 'STMX', 'DATA', 'CVC',
        'CTXC', 'PAX', 'TROY', 'WING', 'CREAM', 'PNT', 'DEGN', 'NBS', 'OOKI', 'CVP'
      ];

      const quoteAssets = [
        // Stablecoins (most common)
        'USDT', 'USDC', 'FDUSD', 'TUSD', 'BUSD', 'DAI', 'USDP',
        
        // Major crypto quotes
        'BTC', 'ETH', 'BNB',
        
        // Fiat currencies
        'EUR', 'GBP', 'AUD', 'BRL', 'TRY', 'RUB', 'UAH', 'PLN', 'RON', 'ZAR',
        'ARS', 'BIDR', 'IDRT', 'NGN', 'VAI', 'BVND', 'GYEN', 'UST'
      ];

      const symbols: string[] = [];

      baseAssets.forEach(base => {
        quoteAssets.forEach(quote => {
          if (base !== quote) {
            const symbol = `${base}${quote}`;
            
            // Add realistic trading pairs based on market patterns
            if (['USDT', 'USDC', 'FDUSD', 'TUSD', 'BUSD'].includes(quote)) {
              symbols.push(symbol); // All coins have major stablecoin pairs
            } else if (quote === 'BTC' && !['USDT', 'USDC', 'FDUSD', 'TUSD', 'BUSD', 'DAI'].includes(base)) {
              symbols.push(symbol); // Most altcoins have BTC pairs
            } else if (quote === 'ETH' && ['BNB', 'ADA', 'SOL', 'MATIC', 'LINK', 'UNI', 'AAVE', 'GRT', 'SAND', 'MANA'].includes(base)) {
              symbols.push(symbol); // Selected altcoins have ETH pairs
            } else if (quote === 'BNB' && ['ADA', 'SOL', 'MATIC', 'LINK', 'DOT', 'AVAX'].includes(base)) {
              symbols.push(symbol); // Some altcoins have BNB pairs
            } else if (['EUR', 'GBP', 'AUD', 'BRL', 'TRY'].includes(quote) && ['BTC', 'ETH', 'BNB', 'ADA', 'SOL', 'XRP', 'DOT'].includes(base)) {
              symbols.push(symbol); // Major coins have fiat pairs
            } else if (quote === 'ARS' && ['BTC', 'ETH', 'USDT', 'USDC', 'FDUSD'].includes(base)) {
              symbols.push(symbol); // Argentine peso pairs
            } else if (quote === 'DAI' && ['BTC', 'ETH', 'USDT', 'USDC'].includes(base)) {
              symbols.push(symbol); // DAI pairs
            }
          }
        });
      });

      return [...new Set(symbols)].sort(); // Remove duplicates and sort
    }

    // For other markets
    if (market === 'Indian Equity') {
      return [
        'RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'HINDUNILVR', 'ICICIBANK', 'KOTAKBANK',
        'BHARTIARTL', 'ITC', 'SBIN', 'BAJFINANCE', 'ASIANPAINT', 'MARUTI', 'AXISBANK',
        'LT', 'TITAN', 'NESTLEIND', 'ULTRACEMCO', 'DMART', 'BAJAJFINSV'
      ];
    }

    if (market === 'US Stocks') {
      return [
        'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'TSLA', 'META', 'AVGO', 'ORCL', 'COST',
        'NFLX', 'ADBE', 'PEP', 'TMUS', 'CSCO', 'ABT', 'CRM', 'ACN', 'INTC', 'AMD'
      ];
    }

    return [];
  };

  return { symbols, loading, error, refetch: loadSymbols };
};