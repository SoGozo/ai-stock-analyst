import { RadialBarChart, RadialBar, ResponsiveContainer } from "recharts";
import { SentimentResult } from "../../api/stock.api";

interface Props {
  sentiment: SentimentResult;
}

export function SentimentGauge({ sentiment }: Props) {
  const { score, label, breakdown, articlesAnalyzed } = sentiment;

  // score is -1 to +1; map to 0–100 for gauge fill
  const normalized = Math.round((score + 1) * 50);

  const color = label === "Bullish" ? "#22c55e" : label === "Bearish" ? "#ef4444" : "#f59e0b";

  const data = [{ value: normalized, fill: color }];

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative h-36 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            innerRadius="70%"
            outerRadius="100%"
            data={data}
            startAngle={180}
            endAngle={0}
            barSize={16}
          >
            <RadialBar dataKey="value" cornerRadius={8} background={{ fill: "#1f2937" }} />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-3">
          <span className="text-2xl font-bold" style={{ color }}>
            {label}
          </span>
          <span className="text-xs text-gray-500">score: {score.toFixed(3)}</span>
        </div>
      </div>

      <div className="w-full grid grid-cols-3 gap-2 text-center text-xs">
        <div className="bg-green-950/40 rounded-lg p-2">
          <p className="text-green-400 font-semibold">{(breakdown.positive * 100).toFixed(1)}%</p>
          <p className="text-gray-500 mt-0.5">Positive</p>
        </div>
        <div className="bg-gray-800/60 rounded-lg p-2">
          <p className="text-gray-300 font-semibold">{(breakdown.neutral * 100).toFixed(1)}%</p>
          <p className="text-gray-500 mt-0.5">Neutral</p>
        </div>
        <div className="bg-red-950/40 rounded-lg p-2">
          <p className="text-red-400 font-semibold">{(breakdown.negative * 100).toFixed(1)}%</p>
          <p className="text-gray-500 mt-0.5">Negative</p>
        </div>
      </div>

      <p className="text-xs text-gray-600">{articlesAnalyzed} articles analyzed via FinBERT</p>
    </div>
  );
}
