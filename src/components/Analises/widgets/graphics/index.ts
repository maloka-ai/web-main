import { default as Line } from './LineGraph';
import { default as KPI } from './KPIGraph';
import { default as Pie } from './PieGraph';
import { default as Bar } from './BarGraph';


export const GRAPH_ALL_LABEL = "TODOS"

const Graphics = { Line, KPI, Pie, Bar };

export default Graphics;