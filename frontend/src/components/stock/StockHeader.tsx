import { TrendingUp, TrendingDown } from "lucide-react";
import { Quote } from "../../api/stock.api";

interface Props {
  ticker: string;
  name?: string;
  quote: Quote;
}

export function StockHeader({ ticker, name, quote }: Props) {
  const isUp = quote.change >= 0;
  const changeColor = isUp ? "text-green-400" : "text-red-400";
  const Icon = isUp ? TrendingUp : TrendingDown;

  return (
    <div className="flex flex-col sm:flex-row sm:items-end gap-3">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold font-mono">{ticker}</h1>
          {name && <span className="text-gray-400 text-sm hidden sm:block">{name}</span>}
        </div>
        {name && <p className="text-gray-500 text-xs mt-0.5 sm:hidden">{name}</p>}
      </div>

      <div className="flex items-end gap-4">
        <span className="text-4xl font-semibold tabular-nums">${quote.price.toFixed(2)}</span>
        <div className={`flex items-center gap-1 pb-1 ${changeColor}`}>
          <Icon size={16} />
          <span className="font-medium tabular-nums">
            {isUp ? "+" : ""}
            {quote.change.toFixed(2)} ({quote.changePercent})
          </span>
        </div>
      </div>

      <div className="sm:ml-auto text-right text-xs text-gray-500">
        <p>Vol: {quote.volume.toLocaleString()}</p>
        <p>{quote.latestTradingDay}</p>
      </div>
    </div>
  );
}
