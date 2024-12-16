"use client"
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
      Math.max(Math.max(...data.map((d) => d.max)), 1),
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
            const lowerFenceY = yScale(d.lowerfence);
            const upperFenceY = yScale(d.upperfence);
            const meanY = yScale(d.mean);

            return (
              <Group key={`boxplot-${i}`}>
                {/* Vertical whiskers */}
                <Line
                  from={{ x: x + boxWidth / 2, y: yScale(d.q1) }}
                  to={{ x: x + boxWidth / 2, y: lowerFenceY }}
                  stroke={d.color}
                  strokeWidth={3}
                />
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
                  id="upperfence-h"
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
                {d.outliers.map((outlier, j) => {
                  return (
                    <circle
                      key={`outlier-${i}-${j}`}
                      cx={x + boxWidth / 2}
                      cy={yScale(outlier)}
                      r={2}
                      opacity={0.5}
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
  "max",
  "upperfence",
  "q3",
  "mean",
  "median",
  "q1",
  "lowerfence",
  "min",
];

const CustomTooltip = ({ tooltipLeft, tooltipData, top, height, yScale }) => {
  const mappedLabels = useMemo(() => {
    let labels = [];
    for (const key of tooltipKeys) {
      const value = tooltipData[key];
      const yValue = yScale(value);
      let conflicts = labels.filter(
        (label) => Math.abs(label.yValue - yValue) < 20
      );
      if (conflicts.length > 2) {
        conflicts.forEach((c) => (c.displayValue = c.displayValue - 20));
        let conflictFlag = true;
        while (conflictFlag) {
          labels
            .sort((a, b) => a.displayValue - b.displayValue)
            .forEach((label, i) => {
              const next = labels[i + 1];
              const diff = next
                ? Math.abs(label.displayValue - next.displayValue)
                : 999;
              const nextDiffValue = next ? next.value !== label.value : false;
              const currShouldMove = next ? label.value > next.value : false;
              const indexToMove = currShouldMove ? i : i + 1;
              if (nextDiffValue && diff < 30) {
                labels[indexToMove].displayValue -= 15;
              } else if (diff < 20) {
                labels[indexToMove].displayValue -= 20;
              }
            });
          const displayValues = labels.map((label) => label.displayValue);
          const minDistance = Math.min(
            ...displayValues.map((v, i) =>
              Math.min(
                ...displayValues.map((v2, j) =>
                  i !== j ? Math.abs(v - v2) : 999
                )
              )
            )
          );
          conflictFlag = minDistance < 20;
        }
      }

      const [min, max] = [
        Math.min(...conflicts.map((label) => label.displayValue)),
        Math.max(...conflicts.map((label) => label.displayValue)),
      ];
      const displayValue = conflicts.length > 0 ? max + 20 : yValue;
      labels.push({ displayValue, value, yValue, key });
    }
    return labels;
  }, [tooltipData, yScale]);

  return (
    <Group
      left={tooltipLeft}
      top={top}
      height={height}
      style={{ pointerEvents: "none" }}
    >
      {mappedLabels.map((entry) => (
        <React.Fragment key={entry.key}>
          <line
            x1={5}
            y1={entry.yValue}
            x2={40}
            y2={entry.displayValue}
            stroke={tooltipData.color}
            strokeDasharray="4,2"
          />
          <rect
            x={40}
            y={entry.displayValue - 9}
            width={100}
            height={22}
            fill={tooltipData.color}
          />
          {/* <text x={35} y={mappedYValues[key] + 5} fontSize={10} stroke="white" strokeWidth={2}>
            {`${key.charAt(0).toUpperCase() + key.slice(1)}: ${pctFormat(tooltipData[key])}`}
          </text> */}
          <text
            x={45}
            y={entry.displayValue + 5}
            fontSize={10}
            fill="white"
            fontWeight={"bold"}
          >
            {`${
              entry.key.charAt(0).toUpperCase() + entry.key.slice(1)
            }: ${pctFormat(entry.value)}`}
          </text>
        </React.Fragment>
      ))}
    </Group>
  );
};

export default BoxPlot;
