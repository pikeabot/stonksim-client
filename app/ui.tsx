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
  const [buyPrice, setBuyPrice] = useState(0);
  const [sellPrice, setSellPrice] = useState(0);
  const [currTradeProfit, setCurrTradeProfit] = useState(0);
  const [profit, setProfit] = useState(0);
  const [isLong, setIsLong] = useState(false);
  const [isShort, setIsShort] = useState(false);
  const [numOfTrades, setNumOfTrades] = useState(0);
  const [numWins, setNumWins] = useState(0);
  const [winPercent, setWinPercent] = useState(0.0);


  function buy(): void {
    // currently not in a trade -go long
    if (isLong === false && isShort === false) {
        setIsLong(true);
        setBuyPrice(data[dayIndex]["close"]);
        setNumOfTrades(numOfTrades+1);
    }
    // closing out a short position
    else if (isLong === false && isShort === true) {
        let currProfit = sellPrice - data[dayIndex]["close"];
        let nw = numWins;
        updateWinRate(currProfit);
        setCurrTradeProfit(currProfit);
        setProfit(profit + currProfit);
        setIsShort(false);
        setBuyPrice(0);
        setSellPrice(0);
    }
  };

  function sell(): void {
        // currently not in a trade - go short
    if (isLong === false && isShort === false) {
        setIsShort(true);
        setSellPrice(data[dayIndex]["close"]);
        setNumOfTrades(numOfTrades+1);
    }
    // closing out a long position
    else if (isLong === true && isShort === false) {
        let currProfit = data[dayIndex]["close"] - buyPrice;
        updateWinRate(currProfit);
        setCurrTradeProfit(currProfit);
        setProfit(profit + currProfit);
        setIsLong(false);
        setBuyPrice(0);
        setSellPrice(0);
    }
  };

  function updateWinRate(currProfit: number): void {
    let nw = numWins;
    if (currProfit > 0) {
            nw = nw + 1
            setNumWins(nw);
        }
           let wp =( nw/numOfTrades*100).toFixed(1);
            setWinPercent(wp);
  };

  function updateProfit(): void {
    let currProfit = 0;
    setDayIndex((i) => Math.min(data.length - 1, i + 1));
    if (isLong === true) {
        currProfit = data[dayIndex+1]["close"] - buyPrice;
    } else if (isShort === true) {
        currProfit = sellPrice - data[dayIndex+1]["close"];
    }
    setCurrTradeProfit(currProfit);
  };

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
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: "20px",
          padding: "20px",
        }}
      >
      {/* Left: Chart */}
      <div
        ref={chartRef}
        style={{
          width: 900,
          height: 500,
          border: "1px solid #ddd",
        }}
      />
            {/* Right: Buttons */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          minWidth: "120px",
        }}
      >
      <span>OVERALL PROFIT: ${(profit).toFixed(2)}</span>
      <span>NUMBER OF TRADES: {numOfTrades}</span>
      <span>WINS %: {winPercent}%</span>
      <span>CURRENT TRADE PROFIT: ${(currTradeProfit).toFixed(2)}</span>
      <span>BUY PRICE: ${buyPrice}</span>
      <button className={styles.navButton}
      onClick={() => buy() }>
          BUY
        </button>
        <span>SELL PRICE: ${sellPrice}</span>
        <button className={styles.navButton} onClick={() => sell()}>
         SELL
        </button>
        <span>
          {getTimeString(data[dayIndex]["time"])}
        </span>

        <button
        className={styles.navButton}
          disabled={dayIndex === data.length - 1}
          onClick={() => updateProfit()}
        >
          Next Day
        </button>


      </div>
    </div>
  );

}