import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Percent,
  BarChart3,
  Activity,
  Globe,
  AlertTriangle,
  RefreshCw,
  Eye,
  EyeOff
} from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area } from 'recharts';

interface MarketData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  sector: string;
}

interface EconomicIndicator {
  name: string;
  value: number;
  change: number;
  period: string;
  description: string;
  impact: 'positive' | 'negative' | 'neutral';
}

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  publishedAt: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  relevance: number;
  tags: string[];
}

export const RealTimeMarketData = () => {
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [economicIndicators, setEconomicIndicators] = useState<EconomicIndicator[]>([]);
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [selectedTab, setSelectedTab] = useState('markets');
  const [isLive, setIsLive] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMarketData();
    
    const interval = setInterval(() => {
      if (isLive) {
        updateMarketData();
      }
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [isLive]);

  const loadMarketData = async () => {
    try {
      // Simulate real-time market data
      const mockMarketData: MarketData[] = [
        {
          symbol: 'SPY',
          name: 'SPDR S&P 500 ETF',
          price: 428.50,
          change: 2.15,
          changePercent: 0.50,
          volume: 45000000,
          marketCap: 400000000000,
          sector: 'ETF'
        },
        {
          symbol: 'XLF',
          name: 'Financial Select Sector SPDR Fund',
          price: 34.82,
          change: -0.23,
          changePercent: -0.66,
          volume: 12000000,
          marketCap: 15000000000,
          sector: 'Financial'
        },
        {
          symbol: 'KBE',
          name: 'SPDR S&P Bank ETF',
          price: 45.67,
          change: 1.12,
          changePercent: 2.51,
          volume: 8500000,
          marketCap: 2500000000,
          sector: 'Banking'
        },
        {
          symbol: 'KBWB',
          name: 'Invesco KBW Bank ETF',
          price: 52.33,
          change: -0.78,
          changePercent: -1.47,
          volume: 3200000,
          marketCap: 1800000000,
          sector: 'Banking'
        }
      ];

      const mockEconomicIndicators: EconomicIndicator[] = [
        {
          name: 'Federal Funds Rate',
          value: 5.25,
          change: 0.25,
          period: 'Current',
          description: 'Federal Reserve\'s target interest rate',
          impact: 'negative'
        },
        {
          name: 'Unemployment Rate',
          value: 3.7,
          change: -0.1,
          period: 'Monthly',
          description: 'Current unemployment rate',
          impact: 'positive'
        },
        {
          name: 'GDP Growth',
          value: 2.1,
          change: 0.3,
          period: 'Quarterly',
          description: 'Gross Domestic Product growth rate',
          impact: 'positive'
        },
        {
          name: 'Inflation Rate (CPI)',
          value: 3.2,
          change: -0.2,
          period: 'Monthly',
          description: 'Consumer Price Index year-over-year',
          impact: 'positive'
        },
        {
          name: '10-Year Treasury Yield',
          value: 4.45,
          change: 0.08,
          period: 'Current',
          description: '10-year U.S. Treasury bond yield',
          impact: 'neutral'
        }
      ];

      const mockNews: NewsItem[] = [
        {
          id: '1',
          title: 'Federal Reserve Signals Potential Rate Pause',
          summary: 'Fed officials indicate they may pause rate hikes if inflation continues to moderate.',
          source: 'Reuters',
          publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          sentiment: 'positive',
          relevance: 95,
          tags: ['Federal Reserve', 'Interest Rates', 'Banking']
        },
        {
          id: '2',
          title: 'Regional Banks Report Strong Q3 Earnings',
          summary: 'Several regional banks exceed earnings expectations, driven by improved net interest margins.',
          source: 'Financial Times',
          publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          sentiment: 'positive',
          relevance: 88,
          tags: ['Earnings', 'Regional Banks', 'Net Interest Margin']
        },
        {
          id: '3',
          title: 'New Banking Regulations Under Review',
          summary: 'Regulators propose new capital requirements for mid-size banks following recent stress tests.',
          source: 'Wall Street Journal',
          publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          sentiment: 'negative',
          relevance: 82,
          tags: ['Regulation', 'Capital Requirements', 'Stress Tests']
        }
      ];

      setMarketData(mockMarketData);
      setEconomicIndicators(mockEconomicIndicators);
      setNewsItems(mockNews);
      setLastUpdate(new Date());

    } catch (error) {
      console.error('Error loading market data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateMarketData = () => {
    setMarketData(prev => prev.map(stock => ({
      ...stock,
      price: stock.price + (Math.random() - 0.5) * 2,
      change: stock.change + (Math.random() - 0.5) * 0.5,
      changePercent: stock.changePercent + (Math.random() - 0.5) * 0.2
    })));
    setLastUpdate(new Date());
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const formatNumber = (num: number) => {
    if (num >= 1e9) {
      return `${(num / 1e9).toFixed(1)}B`;
    } else if (num >= 1e6) {
      return `${(num / 1e6).toFixed(1)}M`;
    } else if (num >= 1e3) {
      return `${(num / 1e3).toFixed(1)}K`;
    }
    return num.toString();
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600';
      case 'negative': return 'text-red-600';
      default: return 'text-muted-foreground';
    }
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'positive': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'negative': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <Activity className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-6 w-6" />
                Real-Time Market Intelligence
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Last updated: {lastUpdate.toLocaleTimeString()}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsLive(!isLive)}
                className="flex items-center gap-2"
              >
                {isLive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                {isLive ? 'Live' : 'Paused'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={updateMarketData}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="markets">Market Data</TabsTrigger>
          <TabsTrigger value="indicators">Economic Indicators</TabsTrigger>
          <TabsTrigger value="news">Financial News</TabsTrigger>
        </TabsList>

        <TabsContent value="markets" className="space-y-6">
          {/* Key Market Indices */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {marketData.map((stock) => (
              <Card key={stock.symbol} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-semibold">{stock.symbol}</h4>
                      <p className="text-xs text-muted-foreground">{stock.sector}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {isLive && <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse" />}
                      Live
                    </Badge>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-2xl font-bold">{formatCurrency(stock.price)}</p>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium flex items-center gap-1 ${
                        stock.change >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {stock.change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {formatCurrency(Math.abs(stock.change))}
                      </span>
                      <span className={`text-sm ${
                        stock.changePercent >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatPercent(stock.changePercent)}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Vol: {formatNumber(stock.volume)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Market Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Market Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={marketData.map((stock, index) => ({
                    name: stock.symbol,
                    value: stock.price,
                    change: stock.changePercent
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => [
                        name === 'value' ? formatCurrency(Number(value)) : formatPercent(Number(value)),
                        name === 'value' ? 'Price' : 'Change %'
                      ]}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#3B82F6" 
                      fill="#3B82F6" 
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="indicators" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {economicIndicators.map((indicator, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="font-semibold">{indicator.name}</h4>
                      <p className="text-sm text-muted-foreground">{indicator.description}</p>
                    </div>
                    {getImpactIcon(indicator.impact)}
                  </div>
                  
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-3xl font-bold">
                        {indicator.name.includes('Rate') || indicator.name.includes('Growth') 
                          ? `${indicator.value}%` 
                          : indicator.value}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-sm font-medium flex items-center gap-1 ${
                          indicator.change >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {indicator.change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                          {Math.abs(indicator.change)}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {indicator.period}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Economic Impact Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Economic Impact on Banking Sector
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg">
                  <h5 className="font-medium text-yellow-800">Rising Interest Rates</h5>
                  <p className="text-sm text-yellow-700 mt-1">
                    Current Fed funds rate of 5.25% benefits net interest margins but may increase credit risk.
                  </p>
                </div>
                
                <div className="p-4 bg-green-50 border-l-4 border-green-400 rounded-lg">
                  <h5 className="font-medium text-green-800">Strong Employment</h5>
                  <p className="text-sm text-green-700 mt-1">
                    Low unemployment at 3.7% supports consumer spending and reduces default risk.
                  </p>
                </div>
                
                <div className="p-4 bg-blue-50 border-l-4 border-blue-400 rounded-lg">
                  <h5 className="font-medium text-blue-800">Moderate GDP Growth</h5>
                  <p className="text-sm text-blue-700 mt-1">
                    GDP growth of 2.1% indicates stable economic conditions for lending activities.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="news" className="space-y-6">
          <div className="space-y-4">
            {newsItems.map((news) => (
              <Card key={news.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold">{news.title}</h4>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getSentimentColor(news.sentiment)}`}
                          >
                            {news.sentiment}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {news.relevance}% relevant
                          </Badge>
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-3">{news.summary}</p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>{news.source}</span>
                          <span>{formatTimeAgo(news.publishedAt)}</span>
                        </div>
                        
                        <div className="flex gap-1">
                          {news.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* News Sentiment Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Market Sentiment Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">
                    {newsItems.filter(n => n.sentiment === 'positive').length}
                  </p>
                  <p className="text-sm text-green-700">Positive</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-600">
                    {newsItems.filter(n => n.sentiment === 'neutral').length}
                  </p>
                  <p className="text-sm text-gray-700">Neutral</p>
                </div>
                <div className="p-4 bg-red-50 rounded-lg">
                  <p className="text-2xl font-bold text-red-600">
                    {newsItems.filter(n => n.sentiment === 'negative').length}
                  </p>
                  <p className="text-sm text-red-700">Negative</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};