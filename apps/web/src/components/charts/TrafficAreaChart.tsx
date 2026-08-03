import { useMemo, useState } from 'react';
import { AreaClosed, LinePath, Line, Bar } from '@visx/shape';
import { scaleLinear, scalePoint } from '@visx/scale';
import { LinearGradient } from '@visx/gradient';
import { curveMonotoneX } from '@visx/curve';
import { localPoint } from '@visx/event';
import { useTooltip, useTooltipInPortal, defaultStyles } from '@visx/tooltip';

interface DataPoint {
  date: string;
  views: number;
}

const HEIGHT = 220;
const MARGIN = { top: 16, right: 16, bottom: 24, left: 16 };

/**
 * Line/area traffic chart — Visx-based (the same rendering engine Bklit UI's chart
 * components use), styled with our own brand tokens rather than adopting Bklit's
 * shadcn/ui distribution, which would introduce a second, parallel component
 * convention alongside this project's existing design system.
 */
export function TrafficAreaChart({ data }: { data: DataPoint[] }) {
  const [width, setWidth] = useState(600);
  const { tooltipData, tooltipLeft, tooltipTop, showTooltip, hideTooltip } = useTooltip<DataPoint>();
  const { containerRef, TooltipInPortal } = useTooltipInPortal({ scroll: true });

  const innerWidth = width - MARGIN.left - MARGIN.right;
  const innerHeight = HEIGHT - MARGIN.top - MARGIN.bottom;

  const xScale = useMemo(
    () =>
      scalePoint({
        domain: data.map((d) => d.date),
        range: [0, innerWidth],
        padding: 0.5,
      }),
    [data, innerWidth],
  );

  const yScale = useMemo(() => {
    const maxViews = Math.max(...data.map((d) => d.views), 1);
    return scaleLinear({
      domain: [0, maxViews * 1.1],
      range: [innerHeight, 0],
    });
  }, [data, innerHeight]);

  const handlePointerMove = (event: React.PointerEvent<SVGRectElement>) => {
    const point = localPoint(event) ?? { x: 0, y: 0 };
    const x = point.x - MARGIN.left;
    const step = innerWidth / (data.length - 1 || 1);
    const index = Math.max(0, Math.min(data.length - 1, Math.round(x / step)));
    const d = data[index];
    if (!d) return;
    showTooltip({
      tooltipData: d,
      tooltipLeft: (xScale(d.date) ?? 0) + MARGIN.left,
      tooltipTop: yScale(d.views) + MARGIN.top,
    });
  };

  return (
    <div ref={containerRef} className="relative">
      <svg
        width="100%"
        height={HEIGHT}
        viewBox={`0 0 ${width} ${HEIGHT}`}
        ref={(el) => {
          if (el && el.clientWidth && el.clientWidth !== width) setWidth(el.clientWidth);
        }}
      >
        <LinearGradient id="traffic-gradient" from="#0062D6" fromOpacity={0.35} to="#0062D6" toOpacity={0} />
        <g transform={`translate(${MARGIN.left}, ${MARGIN.top})`}>
          <AreaClosed<DataPoint>
            data={data}
            x={(d) => xScale(d.date) ?? 0}
            y={(d) => yScale(d.views)}
            yScale={yScale}
            fill="url(#traffic-gradient)"
            curve={curveMonotoneX}
          />
          <Line
            from={{ x: 0, y: innerHeight }}
            to={{ x: innerWidth, y: innerHeight }}
            stroke="#DCE3F0"
            strokeWidth={1}
          />
          <LinePath<DataPoint>
            data={data}
            x={(d) => xScale(d.date) ?? 0}
            y={(d) => yScale(d.views)}
            stroke="#0062D6"
            strokeWidth={2}
            curve={curveMonotoneX}
          />
          {tooltipData && (
            <Line
              from={{ x: (xScale(tooltipData.date) ?? 0), y: 0 }}
              to={{ x: (xScale(tooltipData.date) ?? 0), y: innerHeight }}
              stroke="#002484"
              strokeWidth={1}
              strokeDasharray="4,4"
              pointerEvents="none"
            />
          )}
          <Bar
            x={0}
            y={0}
            width={innerWidth}
            height={innerHeight}
            fill="transparent"
            onPointerMove={handlePointerMove}
            onPointerLeave={() => hideTooltip()}
          />
        </g>
      </svg>
      {tooltipData && (
        <TooltipInPortal
          left={tooltipLeft}
          top={tooltipTop}
          style={{ ...defaultStyles, background: '#002484', color: 'white', padding: '6px 10px', borderRadius: 6 }}
        >
          <strong>{tooltipData.views}</strong> views
          <div style={{ opacity: 0.7, fontSize: 11 }}>{tooltipData.date}</div>
        </TooltipInPortal>
      )}
    </div>
  );
}
