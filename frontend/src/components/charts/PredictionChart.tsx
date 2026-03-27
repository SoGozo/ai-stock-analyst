import {
  ResponsiveContainer, AreaChart, Area, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine,
} from "recharts";
import type { PredictionResult } from "../../api/ml.api";
import type { OHLCVBar } from "../../api/stock.api";
import { format } from "date-fns";

interface Props {
  history: OHLCVBar[];
  prediction: PredictionResult;
}

export function PredictionChart({ history, prediction }: Props) {
  const sorted = [...history].sort((a, b) => a.date.localeCompare(b.date));
  const actualSlice = sorted.slice(-60);

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
    try { return format(new Date(d + "T00:00:00"), "MMM d"); }
    catch { return d; }
  };

  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={combined} margin={{ top: 4, right: 8, left: 4, bottom: 4 }}>
        <defs>
          <linearGradient id="ciLight" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#888" stopOpacity={0.08} />
            <stop offset="100%" stopColor="#888" stopOpacity={0.01} />
          </linearGradient>
        </defs>

        <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />

        <XAxis
          dataKey="date"
          tickFormatter={formatDate}
          tick={{ fontSize: 10, fill: "#bbb" }}
          interval={12}
          axisLine={{ stroke: "#e8e8e8" }}
          tickLine={false}
        />
        <YAxis
          orientation="right"
          domain={["auto", "auto"]}
          tick={{ fontSize: 10, fill: "#bbb" }}
          tickFormatter={(v) => `$${v.toFixed(0)}`}
          axisLine={{ stroke: "#e8e8e8" }}
          tickLine={false}
          width={54}
        />

        <Tooltip
          contentStyle={{
            background: "#fff",
            border: "1px solid #e8e8e8",
            borderRadius: 8,
            fontSize: 12,
            fontFamily: "Inter, sans-serif",
          }}
          labelStyle={{ color: "#aaa", fontSize: 11 }}
          formatter={(value, name) => {
            if (value === undefined || value === null) return ["—", String(name)];
            const labels: Record<string, string> = {
              actual: "Actual", predicted: "Forecast",
              upper: "Upper CI", lower: "Lower CI",
            };
            return [`$${Number(value).toFixed(2)}`, labels[String(name)] ?? String(name)];
          }}
        />

        {splitDate && (
          <ReferenceLine
            x={splitDate}
            stroke="#e8e8e8"
            strokeDasharray="4 4"
            label={{ value: "Today", fill: "#bbb", fontSize: 10, position: "insideTopLeft" }}
          />
        )}

        <Area type="monotone" dataKey="upper" fill="url(#ciLight)" stroke="#ccc" strokeWidth={0.5} dot={false} />
        <Area type="monotone" dataKey="lower" fill="#fff"           stroke="#ccc" strokeWidth={0.5} dot={false} />
        <Line type="monotone" dataKey="actual"    stroke="#111" strokeWidth={1.5} dot={false} name="actual" />
        <Line type="monotone" dataKey="predicted" stroke="#888" strokeWidth={1.5} strokeDasharray="5 3" dot={false} name="predicted" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
