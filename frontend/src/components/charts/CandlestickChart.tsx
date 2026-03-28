import { useEffect, useRef } from "react";
import { createChart, ColorType, CrosshairMode, CandlestickSeries } from "lightweight-charts";
import type { OHLCVBar } from "../../api/stock.api";

interface Props {
  data: OHLCVBar[];
  height?: number;
}

export function CandlestickChart({ data, height = 300 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !data.length) return;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "#ffffff" },
        textColor: "#aaa",
      },
      grid: {
        vertLines: { color: "#f5f5f5" },
        horzLines: { color: "#f5f5f5" },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: { color: "#bbb", width: 1, style: 3 },
        horzLine: { color: "#bbb", width: 1, style: 3 },
      },
      rightPriceScale: {
        borderColor: "#e8e8e8",
        textColor: "#aaa",
      },
      timeScale: {
        borderColor: "#e8e8e8",
        timeVisible: true,
        secondsVisible: false,
      },
      height,
      width: containerRef.current.clientWidth,
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#2d7a2d",
      downColor: "#b83232",
      borderUpColor: "#2d7a2d",
      borderDownColor: "#b83232",
      wickUpColor: "#2d7a2d",
      wickDownColor: "#b83232",
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

  return (
    <div ref={containerRef} style={{ height }}>
      <style>{`.tv-lightweight-charts a[href*="tradingview"] { display: none !important; }`}</style>
    </div>
  );
}
