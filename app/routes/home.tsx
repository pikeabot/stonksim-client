import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";
import DailyChart from "../ui";
import {candlesJson} from "../data/qqq";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

const candles: Candle[] = candlesJson;
// const candles: Candle[] = [
//   {
//     time: { year: 2018, month: 9, day: 22 },
//     open: 100,
//     high: 102,
//     low: 99,
//     close: 101,
//     volume: 12000,
//   },
//   {
//     time: { year: 2018, month: 9, day: 23 },
//     open: 103,
//     high: 104,
//     low: 100,
//     close: 101,
//     volume: 10000,
//   },
//     {
//     time: { year: 2018, month: 9, day: 24 },
//     open: 99,
//     high: 99.2,
//     low: 90,
//     close: 92,
//     volume: 15000,
//   },
//     {
//     time: { year: 2018, month: 9, day: 25 },
//     open: 93,
//     high: 95,
//     low: 88,
//     close: 94,
//     volume: 13000,
//   },
//   // More minute candles...
// ];

export default function Home() {
  return (
    <div style={{ padding: 20 }}>
      <DailyChart data={candles}/>
    </div>
  );
}
