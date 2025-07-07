'use client';

import ResumeGraphLine, { DataPoint } from "./ResumeGraphLine";
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
        />
      );
    default:
      return null;
  }
}