import React, { useMemo } from "react";
import { scaleBand, scaleLinear } from "@visx/scale";
import { Group } from "@visx/group";
import { Line, Bar } from "@visx/shape";
import { Text } from "@visx/text";
import { Tooltip, useTooltip } from "@visx/tooltip";
import { localPoint } from "@visx/event";
import { useParentSize } from "@visx/responsive";
import { AxisBottom, AxisLeft } from "@visx/axis";
import { format } from "d3-format";
import { Grid } from "@visx/grid";

const pctFormat = format(".0%");
export const BoxPlot = ({
  xAxisTitle,
  yAxisTitle,
  data,
  minWidth,
  minHeight,
}) => {
  const { parentRef, width, height } = useParentSize({ debounceTime: 150 });
  const margin = { top: 20, right: 20, bottom: 100, left: 80 };
  const xMax = width - margin.left - margin.right;
  const yMax = height - margin.top - margin.bottom;
  const xScale = scaleBand({
    domain: data.map((_, i) => i.toString()),
    range: [0, xMax],
    padding: 0.4,
  });

  const yScale = scaleLinear({
    domain: [
      Math.min(...data.map((d) => d.min)),
      Math.max(...data.map((d) => d.max)),
    ],
    range: [yMax, 0],
  });

  const { tooltipData, tooltipLeft, tooltipTop, showTooltip, hideTooltip } =
    useTooltip();

  const handleMouseOver = (event, datum) => {
    const coords = localPoint(event.target.ownerSVGElement, event);
    const dataIndex = data.findIndex((d) => d === datum);
    const barWidth = xScale.bandwidth();
    showTooltip({
      tooltipData: datum,
      tooltipLeft:
        xScale(data.findIndex((d) => d === datum).toString()) + barWidth,
      tooltipTop: coords?.y,
    });
  };

  const dataJittered = useMemo(() => {
    const jitter = 50;
    return data.map((d) => ({
      outliers: d.outliers.map((outlier) => 
      [outlier, jitter * (Math.random() - 0.5)])
    }));
  }, [data])
  console.log("!!!", dataJittered)

  return (
    <div
      ref={parentRef}
      className="flex-grow"
      style={{ minHeight, minWidth, width: "100%", height: "100%" }}
    >
      <svg width={width} height={height}>
        <Group left={margin.left} top={margin.top}>
          <AxisBottom
            scale={xScale}
            top={yMax}
            tickFormat={(v) => `${data[v].aggCol} (${data[v].count})`}
            tickLabelProps={() => ({
              fontSize: 12,
              textAnchor: "middle",
              dy: "0.25em",
            })}
            label={xAxisTitle}
          />
          <AxisLeft
            scale={yScale}
            tickFormat={pctFormat}
            numTicks={5}
            hideAxisLine
            hideTicks
            left={10}
            tickLabelProps={() => ({
              fontSize: 12,
              textAnchor: "end",
              dx: "-0.25em",
              dy: "0.25em",
            })}
            label={yAxisTitle}
            labelProps={{
              fontSize: 20,
              fontWeight: "bold",
              textAnchor: "middle",
              angle: -90,
              dx: "-1em",
            }}
          />
          <Grid
            yScale={yScale}
            numTicksRows={5}
            xScale={xScale}
            numTicksColumns={0}
            width={xMax}
            height={yMax}
            strokeWidth={1}
          />
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
                {/* <Line
                  from={{ x: x + boxWidth / 2, y: yScale(d.q1) }}
                  to={{ x: x + boxWidth / 2, y: lowerFenceY }}
                  stroke={d.color}
                  strokeWidth={3}
                /> */}
                <Line
                  from={{ x: x + boxWidth / 2, y: Math.min(upperFenceY, yMax) }}
                  to={{ x: x + boxWidth / 2, y: yScale(d.q3) }}
                  stroke={d.color}
                  strokeWidth={3}
                />
                {/* T-lines */}
                <Line
                  from={{ x: x + boxWidth / 4, y: lowerFenceY }}
                  to={{ x: x + (boxWidth * 3) / 4, y: lowerFenceY }}
                  stroke={d.color}
                  strokeWidth={3}
                />
                <Line
                  from={{ x: x + boxWidth / 4, y: upperFenceY }}
                  to={{ x: x + (boxWidth * 3) / 4, y: upperFenceY }}
                  stroke={d.color}
                  strokeWidth={3}
                />
                <Bar
                  x={x}
                  y={q3Y}
                  width={boxWidth}
                  height={q1Y - q3Y}
                  fill={d.color}
                  fillOpacity={0.5}
                  stroke={d.color}
                  strokeWidth={4}
                />
                <Line
                  from={{ x, y: medianY }}
                  to={{ x: x + boxWidth, y: medianY }}
                  stroke={d.color}
                  strokeWidth={4}
                />
                {/* Mean dashed line */}
                <Line
                  from={{ x, y: meanY }}
                  to={{ x: x + boxWidth, y: meanY }}
                  stroke={d.color}
                  strokeDasharray="8,4"
                  strokeWidth={4}
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
                {/* Outliers */}
                {dataJittered[i].outliers.map((outlier) => {
                  const outlierY = yScale(outlier[0]);

                  return (
                    <circle
                      cx={x + boxWidth / 2 + outlier[1]}
                      cy={outlierY}
                      r={2}
                      fill={d.color}
                    />
                  );
                })}
              </Group>
            );
          })}
        </Group>
        {tooltipData && (
          <CustomTooltip
            tooltipLeft={tooltipLeft}
            tooltipData={tooltipData}
            top={margin.top}
            yScale={yScale}
            height={height}
          />
        )}
      </svg>
    </div>
  );
};

const tooltipKeys = [
  "min",
  "lowerfence",
  "q1",
  "median",
  "mean",
  "q3",
  "upperfence",
  "max",
];

const CustomTooltip = ({ tooltipLeft, tooltipData, top, height, yScale }) => {
  const mappedYValues = useMemo(() => {
    const valueCounts = {};
    const yValues = {};
    tooltipKeys.forEach((key) => {
      const value = tooltipData[key];
      const prevCount = valueCounts[value] || 0
      const dir = prevCount % 2 === 0 ? 1 : -1;
      const dist = prevCount % 2 === 0 ? 10 * dir * prevCount : 10 * dir * (prevCount - 1);
      yValues[key] = yScale(value) + (valueCounts[value] || 0) + dist;
      if (valueCounts[value]) {
        valueCounts[value] += 1;
      } else {
        valueCounts[value] = 1;
      }
    });
    return yValues;
  }, [tooltipData]);

  return (
    <Group left={tooltipLeft} top={top} height={height} style={{pointerEvents:"none"}}>
      {tooltipKeys.map((key) => (
        <React.Fragment key={key}>
          <line
            x1={0}
            y1={yScale(tooltipData[key])}
            x2={40}
            y2={mappedYValues[key]}
            stroke={tooltipData.color}
            strokeDasharray="4,2"
          />
          <rect
            x={40}
            y={mappedYValues[key] - 9}
            width={100}
            height={22}
            fill={tooltipData.color}
          />
          {/* <text x={35} y={mappedYValues[key] + 5} fontSize={10} stroke="white" strokeWidth={2}>
            {`${key.charAt(0).toUpperCase() + key.slice(1)}: ${pctFormat(tooltipData[key])}`}
          </text> */}
          <text x={45} y={mappedYValues[key] + 5} fontSize={10} fill="white" fontWeight={"bold"}>
            {`${key.charAt(0).toUpperCase() + key.slice(1)}: ${pctFormat(tooltipData[key])}`}
          </text>
        </React.Fragment>
      ))}
    </Group>
  );
};

export default BoxPlot;
