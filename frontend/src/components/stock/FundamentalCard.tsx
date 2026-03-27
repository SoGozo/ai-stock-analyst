import { Fundamentals } from "../../api/stock.api";

interface Props {
  data: Fundamentals;
}

function Metric({ label, value }: { label: string; value: string | undefined }) {
  const formatted = !value || value === "None" || value === "-" ? "—" : value;
  return (
    <div className="bg-gray-900/60 rounded-lg p-3 border border-gray-800">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-sm font-semibold text-gray-100 tabular-nums">{formatted}</p>
    </div>
  );
}

function formatLargeNum(val: string | undefined) {
  const n = parseFloat(val ?? "");
  if (isNaN(n)) return val;
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  return `$${n.toFixed(2)}`;
}

function formatPercent(val: string | undefined) {
  const n = parseFloat(val ?? "");
  if (isNaN(n)) return val;
  return `${(n * 100).toFixed(2)}%`;
}

export function FundamentalCard({ data }: Props) {
  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        <Metric label="Market Cap" value={formatLargeNum(data.marketCap)} />
        <Metric label="P/E Ratio" value={data.peRatio} />
        <Metric label="Forward P/E" value={data.forwardPE} />
        <Metric label="EPS (TTM)" value={data.eps ? `$${data.eps}` : undefined} />
        <Metric label="Dividend Yield" value={formatPercent(data.dividendYield)} />
        <Metric label="Beta" value={data.beta} />
        <Metric label="52W High" value={data.week52High ? `$${data.week52High}` : undefined} />
        <Metric label="52W Low" value={data.week52Low ? `$${data.week52Low}` : undefined} />
        <Metric label="ROE" value={formatPercent(data.returnOnEquity)} />
        <Metric label="Profit Margin" value={formatPercent(data.profitMargin)} />
        <Metric label="Price/Book" value={data.priceToBook} />
        <Metric label="Analyst Target" value={data.analystTargetPrice ? `$${data.analystTargetPrice}` : undefined} />
      </div>

      {data.description && (
        <div className="mt-4">
          <p className="text-xs text-gray-400 leading-relaxed line-clamp-4">{data.description}</p>
        </div>
      )}

      <div className="flex flex-wrap gap-2 mt-3">
        {data.sector && (
          <span className="px-2 py-0.5 rounded-full text-xs bg-blue-950 text-blue-300 border border-blue-800">
            {data.sector}
          </span>
        )}
        {data.industry && (
          <span className="px-2 py-0.5 rounded-full text-xs bg-gray-800 text-gray-400 border border-gray-700">
            {data.industry}
          </span>
        )}
        {data.exchange && (
          <span className="px-2 py-0.5 rounded-full text-xs bg-gray-800 text-gray-400 border border-gray-700">
            {data.exchange}
          </span>
        )}
      </div>
    </div>
  );
}
