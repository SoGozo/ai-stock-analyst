import { useEffect, useRef } from "react";
import { createChart, ColorType, CrosshairMode } from "lightweight-charts";
import { OHLCVBar } from "../../api/stock.api";

interface Props {
  data: OHLCVBar[];
  height?: number;
}

export function CandlestickChart({ data, height = 380 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !data.length) return;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "#030712" },
        textColor: "#9ca3af",
      },
      grid: {
        vertLines: { color: "#111827" },
        horzLines: { color: "#111827" },
      },
      crosshair: { mode: CrosshairMode.Normal },
      rightPriceScale: { borderColor: "#1f2937" },
      timeScale: { borderColor: "#1f2937", timeVisible: true },
      height,
      width: containerRef.current.clientWidth,
    });

    const candleSeries = chart.addCandlestickSeries({
      upColor: "#22c55e",
      downColor: "#ef4444",
      borderUpColor: "#22c55e",
      borderDownColor: "#ef4444",
      wickUpColor: "#22c55e",
      wickDownColor: "#ef4444",
    });

    const sorted = [...data].sort((a, b) => a.date.localeCompare(b.date));
    candleSeries.setData(
      sorted.map((bar) => ({
        time: bar.date as `${number}-${number}-${number}`,
        open: bar.open,
        high: bar.high,
        low: bar.low,
        close: bar.close,
      }))
    );

    chart.timeScale().fitContent();

    const handleResize = () => {
      if (containerRef.current) {
        chart.applyOptions({ width: containerRef.current.clientWidth });
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, [data, height]);

  return <div ref={containerRef} style={{ height }} />;
}
