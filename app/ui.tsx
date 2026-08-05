import React, { useEffect, useMemo, useRef, useState } from "react";
import { AreaSeries, createChart, ColorType, CandlestickSeries, HistogramSeries } from 'lightweight-charts';
import styles from './ui.module.css';

import type {
  CandlestickData,
  HistogramData,
  Time,
} from "lightweight-charts";

export interface Candle {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface Props {
  data: Candle[];
  height?: number;
}

const WINDOW_SIZE = 20;


function getTimeString(t) {
//     const t = candles[dayIndex]["time"];
    const m = t["month"].toString() ?? "";
    const d = t["day"].toString();
    const y = t["year"].toString();
    return m + "-" + d + "-" + y;
};

export default function DailyChart({
  data,
  height = 700,
}: Props) {
  const chartRef = useRef<HTMLDivElement>(null);

  const chart = useRef<ReturnType<typeof createChart>>();
  const candleSeries = useRef<any>();
  const volumeSeries = useRef<any>();

  const [dayIndex, setDayIndex] = useState(WINDOW_SIZE);

  useEffect(() => {
    if (!chartRef.current) return;

    chart.current = createChart(chartRef.current, {
      width: 900,
      height: 500,
      layout: {
        background: {
          type: ColorType.Solid,
          color: "#ffffff",
        },
        textColor: "#222",
      },
      grid: {
        vertLines: {
          color: "#eee",
        },
        horzLines: {
          color: "#eee",
        },
      },
      rightPriceScale: {
        scaleMargins: {
          top: 0.05,
          bottom: 0.30,
        },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
      },
    });

    candleSeries.current = chart.current.addSeries(CandlestickSeries, {
    upColor: '#26a69a', downColor: '#ef5350', borderVisible: false,
    wickUpColor: '#26a69a', wickDownColor: '#ef5350',
});

    volumeSeries.current = chart.current.addSeries(HistogramSeries,{
      priceScaleId: "",
      priceFormat: {
        type: "volume",
      },
    });

    volumeSeries.current.priceScale().applyOptions({
      scaleMargins: {
        top: 0.75,
        bottom: 0,
      },
    });

    const resize = () => {
      chart.current?.applyOptions({
        width: chartRef.current!.clientWidth,
      });
    };

    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
      chart.current?.remove();
    };
  }, [height]);

  useEffect(() => {
    if (!candleSeries.current) return;

    const candles = data.slice(dayIndex-WINDOW_SIZE, dayIndex+1) ?? [];

    const candleData: CandlestickData[] = candles.map((c) => ({
      time: c.time,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
    }));

    const volumeData: HistogramData[] = candles.map((c) => ({
      time: c.time,
      value: c.volume,
      color:
        c.close >= c.open
          ? "#26a69a"
          : "#ef5350",
    }));

    candleSeries.current.setData(candleData);
    volumeSeries.current.setData(volumeData);

    chart.current?.timeScale().fitContent();
  }, [dayIndex]);

  return (
    <div>
      <div
        style={{
          display: "flex",
          gap: 12,
          marginBottom: 12,
          alignItems: "center",
        }}
      >
        <span>
          {getTimeString(data[dayIndex]["time"])}
        </span>

        <button
        className={styles.navButton}
          disabled={dayIndex === data.length - 1}
          onClick={() =>
            setDayIndex((i) =>
              Math.min(data.length - 1, i + 1)
            )
          }
        >
          Next Day
        </button>
      </div>
      <div
        ref={chartRef}
        style={{
          width: "100%",
          height,
        }}
      />
    </div>
  );
}