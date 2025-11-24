"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LabelList,
  Cell,
  CartesianGrid,
  Legend,
  LegendProps,
} from "recharts";
import { useMemo } from "react";
import { BarDatum } from "@/utils/graphics";
import { formatLabelBar, formatNumber } from "@/utils/format";
import { GRAPH_ALL_LABEL } from ".";

export interface BarGraphProps {
  data: BarDatum[];
  xLabelMap?: Record<string, string>;
  hideXAxis?: boolean;
  xAxisAngle?: number;
  sampleLabel?: string;
  secondValueLabel?: string;
  tooltipFormatter?: (value: number, name?: string) => string;
  secondValueFormatter?: (value: number) => string;
  onBarSelected?: (name: string) => void;
  barColors?: string[];
  height?: number;
  legendTitle?: string;
  dataKey?: string;
}

const DEFAULT_COLORS = [
  "#CFE5A7",
  "#D7B79A",
  "#B894D6",
  "#DDD39B",
  "#9AB6D3",
  "#DFB1C8",
  "#BFE1B8",
  "#E6E29F",
  "#BFE2E6",
  "#C7857F",
];

function CustomTooltip({
  active,
  payload,
  label,
  total,
  sampleLabel,
  secondValueLabel,
  fmt,
  fmt2,
}: {
  active?: boolean;
  payload?: any[];
  label?: string;
  total: number;
  sampleLabel: string;
  secondValueLabel: string;
  fmt?: (v: number, name?: string) => string;
  fmt2?: (v: number) => string;
}) {
  if (!active || !payload || !payload.length) return null;
  const dp = payload[0]?.payload as BarDatum;
  const value = dp?.value ?? 0;
  const secondValue = dp?.secondValue;
  const percent = total > 0 ? (value / total) * 100 : 0;

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 8,
        padding: "10px 12px",
        boxShadow: "0 4px 12px rgba(0,0,0,.08)",
        color: "#374151",
        maxWidth: 260,
      }}
    >
      <div style={{ fontWeight: 700, color: "#16a34a", marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ marginBottom: 4 }}>
        <strong>{sampleLabel}:</strong>{" "}
        {fmt ? fmt(value, label) : formatNumber(value)}
      </div>
      <div style={{ marginBottom: 4 }}>
        <strong>Percentual:</strong> {percent.toFixed(1)}%
      </div>
      {secondValue != null && (
        <div>
          <strong>{secondValueLabel}:</strong>{" "}
          {fmt2 ? fmt2(secondValue) : formatNumber(secondValue)}
        </div>
      )}
    </div>
  );
}

function RightLegend({
  payload,
  title = "Título da legenda",
}: Partial<LegendProps> & { title?: string }) {
  return (
    <div style={{ paddingLeft: 12 }}>
      <div style={{ fontWeight: 700, color: "#4b4b4b", marginBottom: 8 }}>
        {title}
      </div>
      <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {(payload ?? []).map((entry: any, i: number) => (
          <li
            key={i}
            style={{ display: "flex", alignItems: "center", marginBottom: 6 }}
          >
            <span
              style={{
                width: 12,
                height: 12,
                borderRadius: 3,
                marginRight: 8,
                backgroundColor: entry.color,
                border: "1px solid rgba(0,0,0,.1)",
                display: "inline-block",
              }}
            />
            <span style={{ color: "#4b4b4b", fontSize: 12 }}>
              {entry.value}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function BarGraph({
  data,
  xLabelMap,
  hideXAxis,
  xAxisAngle,
  sampleLabel = "Clientes",
  secondValueLabel = "Ticket Médio",
  tooltipFormatter,
  secondValueFormatter,
  onBarSelected,
  barColors = DEFAULT_COLORS,
  height = 280,
  legendTitle = "Título da legenda",
  dataKey = "value",
}: BarGraphProps) {
  const total = useMemo(
    () => data.reduce((acc, d) => acc + (
      d.name!==GRAPH_ALL_LABEL? d.value : 0 || 0
    ), 0),
    [data],
  );

  const max_value = useMemo(
    () => data.reduce((mv, d) => d.value > mv ? d.value : mv, 0),
    [data],
  );

  const legendPayload = useMemo(
    () =>
      data.map((d, i) => ({
        id: d.name,
        type: "square" as import("recharts").LegendType,
        value: d.name,
        color: barColors[i % barColors.length],
      })),
    [data, barColors],
  );

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        margin={{ top: 20, bottom: 30, left: 10, right: 10 }}
      >
        <CartesianGrid
          horizontal
          vertical={false}
          stroke="#ded9c6"
          fill="#faf9f2"
        />

        <XAxis
          hide
          dataKey="name"
          interval={0}
          tickLine={false}
          axisLine={false}
          fontSize={12}
          tick={{ fill: "#6b7280" }}
          padding={{ left: 16, right: 16 }}
          tickFormatter={(name) => xLabelMap?.[name] ?? name}
          angle={xAxisAngle ?? 0}
          textAnchor={xAxisAngle ? "end" : "middle"}
        />
        <YAxis
          axisLine={{ stroke: "#ded9c6" }}
          domain={[0, Math.floor((max_value*1.1)/10)*10]}
        />

        <Tooltip
          cursor={{ fill: "rgba(0,0,0,0.04)" }}
          content={
            <CustomTooltip
              total={total}
              sampleLabel={sampleLabel}
              secondValueLabel={secondValueLabel}
              fmt={tooltipFormatter}
              fmt2={secondValueFormatter}
            />
          }
        />

        <Legend
          layout="vertical"
          align="right"
          verticalAlign="top"
          payload={legendPayload}
          content={<RightLegend title={legendTitle} />}
          wrapperStyle={{ right: 10 }} // aproxima da borda direita
        />

        <Bar
          dataKey="value"
          radius={[2, 2, 0, 0]}
          barSize={100}
          onClick={(_, index) => {
            const name = data[index]?.name;
            if (name) onBarSelected?.(name);
          }}
          style={{ cursor: onBarSelected ? "pointer" : "default" }}
        >
          {data.map((_, i) => (
            <Cell key={`cell-${i}`} fill={barColors[i % barColors.length]} />
          ))}
          <LabelList
            dataKey={dataKey}
            position="top"
            formatter={(v: unknown) => formatLabelBar(v)}
            style={{ fill: "#111827", fontWeight: 600, fontSize: 12 }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
