'use client';

import ResumeGraphLine, { DataPoint } from "./ResumeGraphLine";
import ResumeGraphPie from "./ResumeGraphPie";
import ResumeKPI from "./ResumeKPI";

export default function RenderGraph({ graph, index }: { graph: any; index: number }) {
  switch (graph.type) {
    case 'kpi':
      return (
        <ResumeKPI
          key={index}
          titulo={graph.title}
          data={String(graph.data)}
          subtitulo={graph.subtitle}
          gain={graph.gain}
        />
      );
    case 'line':
      return (
        <ResumeGraphLine
          key={index}
          titulo={graph.title}
          subtitulo={graph.subtitle}
          valor={String(graph.value)}
          gain={graph.gain}
          data={graph.data as DataPoint[]}
          xLabelMap={graph.xLabelMap}
          hideXAxis={graph.hideXAxis}
          xAxisAngle={graph.xAxisAngle}
          secondData={graph.secondData as DataPoint[]}
          tooltipFormatter={graph.tooltipFormatter}
        />
      );
    case 'pie':
      return (
        <ResumeGraphPie
          key={index}
          titulo={graph.title}
          data={graph.data}
          subtitulo={graph.subtitle}
          valor={String(graph.value)}
          gain={graph.gain}
          tooltipFormatter={graph.tooltipFormatter}
        />
      );
    default:
      return null;
  }
}