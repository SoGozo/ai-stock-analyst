import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Area,
  AreaChart,
  ReferenceLine,
} from "recharts";
import { OHLCVBar, PredictionResult } from "../../api/stock.api";
import { format } from "date-fns";

interface Props {
  history: OHLCVBar[];
  prediction: PredictionResult;
}

export function PredictionChart({ history, prediction }: Props) {
  // Last 90 actual bars + all predicted bars
  const actualSlice = history.slice(0, 90).reverse();

  const actualData = actualSlice.map((bar) => ({
    date: bar.date,
    actual: bar.close,
    predicted: undefined as number | undefined,
    lower: undefined as number | undefined,
    upper: undefined as number | undefined,
  }));

  const predData = prediction.predictions.map((p) => ({
    date: p.date,
    actual: undefined as number | undefined,
    predicted: p.price,
    lower: p.lower,
    upper: p.upper,
  }));

  const combined = [...actualData, ...predData];
  const splitDate = predData[0]?.date;

  const formatDate = (d: string) => {
    try {
      return format(new Date(d), "MMM d");
    } catch {
      return d;
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-gray-500">
          MAPE: <span className="text-gray-300">{prediction.mape.toFixed(2)}%</span>
          &nbsp;&nbsp;RMSE: <span className="text-gray-300">{prediction.rmse.toFixed(2)}</span>
          &nbsp;&nbsp;Confidence: <span className="text-green-400">{prediction.confidence}%</span>
        </p>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1">
            <span className="w-3 h-0.5 bg-blue-400 inline-block" /> Actual
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-0.5 bg-orange-400 inline-block border-dashed border-b" /> Predicted
          </span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={320}>
        <AreaChart data={combined} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
          <defs>
            <linearGradient id="predGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f97316" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
          <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 11, fill: "#6b7280" }} interval={14} />
          <YAxis
            domain={["auto", "auto"]}
            tick={{ fontSize: 11, fill: "#6b7280" }}
            tickFormatter={(v) => `$${v.toFixed(0)}`}
          />
          <Tooltip
            contentStyle={{ background: "#111827", border: "1px solid #374151", borderRadius: 8 }}
            labelStyle={{ color: "#9ca3af", fontSize: 12 }}
            formatter={(value: number, name: string) => [`$${value?.toFixed(2)}`, name]}
          />
          {splitDate && (
            <ReferenceLine x={splitDate} stroke="#374151" strokeDasharray="4 4" label={{ value: "Today", fill: "#6b7280", fontSize: 11 }} />
          )}
          <Area type="monotone" dataKey="upper" fill="transparent" stroke="transparent" />
          <Area type="monotone" dataKey="lower" fill="url(#predGrad)" stroke="transparent" />
          <Line type="monotone" dataKey="actual" stroke="#60a5fa" strokeWidth={1.5} dot={false} name="Actual" />
          <Line type="monotone" dataKey="predicted" stroke="#fb923c" strokeWidth={1.5} strokeDasharray="5 3" dot={false} name="Predicted" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
