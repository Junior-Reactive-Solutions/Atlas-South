import { Pie } from '@visx/shape';
import { Group } from '@visx/group';

interface DeviceSlice {
  device: string;
  percentage: number;
}

const COLORS = ['#0062D6', '#002484', '#8AB4E8'];
const SIZE = 160;
const RADIUS = SIZE / 2;

/** Donut chart for the device breakdown — same Visx engine as TrafficAreaChart. */
export function DeviceDonutChart({ data }: { data: DeviceSlice[] }) {
  return (
    <div className="flex items-center gap-6">
      <svg width={SIZE} height={SIZE}>
        <Group top={RADIUS} left={RADIUS}>
          <Pie
            data={data}
            pieValue={(d) => d.percentage}
            outerRadius={RADIUS}
            innerRadius={RADIUS - 28}
            padAngle={0.02}
          >
            {(pie) =>
              pie.arcs.map((arc, i) => (
                <path key={data[i]?.device ?? i} d={pie.path(arc) ?? undefined} fill={COLORS[i % COLORS.length]} />
              ))
            }
          </Pie>
        </Group>
      </svg>
      <div className="space-y-2">
        {data.map((d, i) => (
          <div key={d.device} className="flex items-center gap-2 text-sm">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
            <span className="font-medium text-slate-900">{d.device}</span>
            <span className="text-slate-500">{d.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
