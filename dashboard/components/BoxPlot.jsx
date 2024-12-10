import React from 'react';
import { scaleBand, scaleLinear } from '@visx/scale';
import { Group } from '@visx/group';
import { Line, Bar } from '@visx/shape';
import { Text } from '@visx/text';
import { Tooltip, useTooltip } from '@visx/tooltip';
import { localPoint } from '@visx/event';
import { useParentSize } from '@visx/responsive';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { format } from 'd3-format';

const pctFormat = format('.0%')
export const BoxPlot = ({ xAxisTitle, yAxisTitle, data, minWidth, minHeight }) => {
  const { parentRef, width, height } = useParentSize({ debounceTime: 150 });
  const margin = { top: 20, right: 20, bottom: 50, left: 50 };
  const xMax = width - margin.left - margin.right;
  const yMax = height - margin.top - margin.bottom;
  const xScale = scaleBand({
    domain: data.map((_, i) => i.toString()),
    range: [0, xMax],
    padding: 0.4,
  });

  const yScale = scaleLinear({
    domain: [Math.min(...data.map(d => d.min)), Math.max(...data.map(d => d.max))],
    range: [yMax, 0],
  });
  
  const {
    tooltipData,
    tooltipLeft,
    tooltipTop,
    showTooltip,
    hideTooltip,
  } = useTooltip();

  const handleMouseOver = (event, datum) => {
    const coords = localPoint(event.target.ownerSVGElement, event);
    const dataIndex = data.findIndex(d => d === datum);
    const barWidth = xScale.bandwidth();
    const xModifier = dataIndex === data.length - 1 ? -1 * barWidth : barWidth;
    showTooltip({
      tooltipData: datum,
      tooltipLeft:  xScale(data.findIndex(d => d=== datum).toString()) + xModifier,
      tooltipTop: coords?.y,
    });
  };
  
  return (
    <div ref={parentRef} style={{minHeight, minWidth, width: "100%", height: "100%"}}>
      <svg width={width} height={height}>
        <Group left={margin.left} top={margin.top}>
          {data.map((d, i) => {
            const x = xScale(i.toString());
            const boxWidth = xScale.bandwidth();
            const medianY = yScale(d.median);
            const q1Y = yScale(d.q1);
            const q3Y = yScale(d.q3);
            const lowerFenceY = yScale(d.lowerFence);
            const upperFenceY = yScale(d.upperfence);
            const meanY = yScale(d.mean);

            return (
              <Group key={`boxplot-${i}`}>
                {/* Vertical whiskers */}
                <Line
                  from={{ x: x + boxWidth / 2, y: yScale(d.min) }}
                  to={{ x: x + boxWidth / 2, y: lowerFenceY }}
                  stroke={d.color}
                />
                <Line
                  from={{ x: x + boxWidth / 2, y: upperFenceY }}
                  to={{ x: x + boxWidth / 2, y: yScale(d.max) }}
                  stroke={d.color}
                />
                {/* T-lines */}
                <Line
                  from={{ x: x + boxWidth / 4, y: lowerFenceY }}
                  to={{ x: x + (boxWidth * 3) / 4, y: lowerFenceY }}
                  stroke={d.color}
                />
                <Line
                  from={{ x: x + boxWidth / 4, y: upperFenceY }}
                  to={{ x: x + (boxWidth * 3) / 4, y: upperFenceY }}
                  stroke={d.color}
                />
                {/* Box */}
                <Bar
                  x={x}
                  y={q3Y}
                  width={boxWidth}
                  height={q1Y - q3Y}
                  fill={d.color}
                  opacity={0.3}
                  // onMouseOver={(e) => handleMouseOver(e, d)}
                  // onMouseOut={hideTooltip}
                />
                {/* Median line */}
                <Line
                  from={{ x, y: medianY }}
                  to={{ x: x + boxWidth, y: medianY }}
                  stroke={d.color}
                  strokeWidth={2}
                />
                {/* Mean dashed line */}
                <Line
                  from={{ x, y: meanY }}
                  to={{ x: x + boxWidth, y: meanY }}
                  stroke={d.color}
                  strokeDasharray="4,2"
                />
                <Bar
                  x={x}
                  y={0}
                  width={boxWidth}
                  height={yMax}
                  opacity={0}
                  onMouseOver={(e) => handleMouseOver(e, d)}
                  onMouseOut={hideTooltip}
                />
              </Group>
            );
          })}
          <AxisBottom scale={xScale} top={yMax} tickFormat={v => `${data[v].aggCol} (${data[v].count})`}/>
          <AxisLeft scale={yScale} tickFormat={pctFormat}/>
        </Group>
      </svg>
      {tooltipData && (
        <Tooltip left={tooltipLeft} top={tooltipTop}>
          <div>
            <table className="table table-zebra table-xs">
              <tr>
                <td>Minimum</td>
                <td>{tooltipData.min}</td>
              </tr>
              <tr>
                <td>Lower Fence</td>
                <td>{tooltipData.lowerfence}</td>
              </tr>
              <tr>
                <td>1st Quartile</td>
                <td>{tooltipData.q1}</td>

              </tr>
              <tr>
                <td>Median</td>
                <td>{tooltipData.median}</td>
              </tr>
              <tr>
                <td>Mean</td>
                <td>{tooltipData.mean}</td>
              </tr>
              <tr>
                <td>3rd Quartile</td>
                <td>{tooltipData.q3}</td>
              </tr>
              <tr>
                <td>Upper Fence</td>
                <td>{tooltipData.upperfence}</td>
              </tr>
              <tr>
                <td>Max</td>
                <td>{tooltipData.max}</td>
              </tr>
            </table>
          </div>
        </Tooltip>
      )}
    </div>
  );
};

export default BoxPlot;
