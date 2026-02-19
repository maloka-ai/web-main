"use client";

import { BarDatum, DataPoint, GraphData } from "@/utils/graphics";
import Graphics from "./graphics";
import { GraphType } from "@/utils/enums";

interface RenderGraphicProps {
  graph: GraphData;
}

export default function RenderGraphic({ graph }: RenderGraphicProps) {
  switch (graph.type) {
    case GraphType.KPI:
      return <Graphics.KPI data={String(graph.data)} />;
    case GraphType.LINE:
      return (
        <Graphics.Line
          data={graph.data as DataPoint[]}
          xLabelMap={graph.xLabelMap}
          hideXAxis={graph.hideXAxis}
          xAxisAngle={graph.xAxisAngle}
          secondData={graph.secondData as DataPoint[]}
          tooltipFormatter={graph.tooltipFormatter}
          xTicks={graph.xTicks}
        />
      );
    case GraphType.MULTI_LINE:
      return (
        <Graphics.MultiLine
          data={graph.data as Record<string, DataPoint[]>}
          colors={graph.colors}
          xLabelMap={graph.xLabelMap}
          hideXAxis={graph.hideXAxis}
          xAxisAngle={graph.xAxisAngle}
          tooltipFormatter={graph.tooltipFormatter}
          xTicks={graph.xTicks}
        />
      );
    case GraphType.PIE:
      return (
        <Graphics.Pie
          data={graph.data as DataPoint[]}
          tooltipFormatter={graph.tooltipFormatter}
        />
      );
    case GraphType.BAR:
      return (
        <Graphics.Bar
          data={graph.data as BarDatum[]}
          xLabelMap={graph.xLabelMap}
          legendTitle={graph.legendTitle}
          sampleLabel={graph.sampleLabel}
          secondValueLabel={graph.secondValueLabel}
          tooltipFormatter={graph.tooltipFormatter}
          secondValueFormatter={graph.secondValueFormatter}
          xAxisAngle={graph.xAxisAngle}
          height={graph.height}
          onBarSelected={graph.onBarSelected}
          dataKey={graph.dataKey}
          hideLegend={graph.hideLegend}
          hideYAxis={graph.hideYAxis}
        />
      );
    default:
      return null;
  }
}
