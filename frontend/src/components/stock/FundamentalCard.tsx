import type { Fundamentals } from "../../api/ml.api";

interface Props {
  data: Fundamentals;
}

function Metric({ label, value }: { label: string; value: string | undefined }) {
  return (
    <div className="bg-gray-900/60 rounded-lg p-3 border border-gray-800">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-sm font-semibold text-gray-100 tabular-nums">{value ?? "—"}</p>
    </div>
  );
}

function fmtCap(n: number) {
  if (!n || isNaN(n)) return "—";
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  return `$${n.toFixed(0)}`;
}

function fmtPct(n: number) {
  if (n === undefined || n === null || isNaN(n)) return "—";
  return `${(n * 100).toFixed(2)}%`;
}

function fmtNum(n: number, prefix = "", decimals = 2) {
  if (n === undefined || n === null || isNaN(n)) return "—";
  return `${prefix}${n.toFixed(decimals)}`;
}

export function FundamentalCard({ data }: Props) {
  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        <Metric label="Market Cap" value={fmtCap(data.marketCap)} />
        <Metric label="P/E Ratio" value={fmtNum(data.peRatio)} />
        <Metric label="Forward P/E" value={fmtNum(data.forwardPE)} />
        <Metric label="EPS (TTM)" value={fmtNum(data.eps, "$")} />
        <Metric label="Dividend Yield" value={fmtPct(data.dividendYield)} />
        <Metric label="Beta" value={fmtNum(data.beta)} />
        <Metric label="52W High" value={fmtNum(data.week52High, "$")} />
        <Metric label="52W Low" value={fmtNum(data.week52Low, "$")} />
        <Metric label="ROE" value={fmtPct(data.returnOnEquity)} />
        <Metric label="Profit Margin" value={fmtPct(data.profitMargin)} />
        <Metric label="Price/Book" value={fmtNum(data.priceToBook)} />
        <Metric label="Analyst Target" value={fmtNum(data.analystTargetPrice, "$")} />
      </div>

      {data.description && (
        <p className="mt-4 text-xs text-gray-400 leading-relaxed line-clamp-4">
          {data.description}
        </p>
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
