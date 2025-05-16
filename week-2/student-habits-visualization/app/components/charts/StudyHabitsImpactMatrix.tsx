"use client";

import { ResponsiveScatterPlot } from "@nivo/scatterplot";
import type { StudentData } from "../../page";

interface StudyHabitsImpactMatrixProps {
  data: StudentData[];
}

interface CustomScatterPlotNodeData {
  id: string;
  x: number;
  y: number;
  quartile: string;
}

interface NivoScatterPlotNode {
  id: string;
  index: number;
  serieId: string | number;
  x: number;
  y: number;
  color: string;
  data: CustomScatterPlotNodeData;
}

interface SeriesData {
  id: string;
  data: CustomScatterPlotNodeData[];
}

const ScatterPlotWrapper = ({
  data,
  xVar,
  yVar,
  xLabel,
  yLabel,
  title,
}: {
  data: CustomScatterPlotNodeData[];
  xVar: string;
  yVar: string;
  xLabel: string;
  yLabel: string;
  title: string;
}) => {
  const themeColors = {
    quartileColors: {
      "Q1 (Lowest)": "#ef4444",
      Q2: "#f97316",
      Q3: "#22c55e",
      "Q4 (Highest)": "#3b82f6",
      "N/A": "#9ca3af",
    },
  };

  const series: SeriesData[] = Object.keys(themeColors.quartileColors).map(
    (quartile) => ({
      id: quartile,
      data: data.filter((d) => d.quartile === quartile),
    })
  );

  return (
    <div style={{ height: "330px", width: "100%" }} className="mb-4 md:mb-0">
      <h4 className="text-sm font-semibold text-center text-gray-700 mb-1">
        {title}
      </h4>
      <ResponsiveScatterPlot
        data={series}
        margin={{ top: 20, right: 20, bottom: 60, left: 70 }}
        xScale={{ type: "linear", min: "auto", max: "auto" }}
        yScale={{ type: "linear", min: 0, max: "auto" }}
        blendMode="multiply"
        colors={(serieObject: { serieId: string | number }) =>
          themeColors.quartileColors[
            serieObject.serieId as keyof typeof themeColors.quartileColors
          ] || themeColors.quartileColors["N/A"]
        }
        nodeSize={(datum) => {
          const quartile = (datum as { data?: { quartile?: string } }).data
            ?.quartile;
          if (quartile === "Q4 (Highest)") {
            return 10;
          }
          if (quartile === "Q1 (Lowest)") {
            return 6;
          }
          return 8;
        }}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          legend: xLabel,
          legendPosition: "middle",
          legendOffset: 46,
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          legend: yLabel,
          legendPosition: "middle",
          legendOffset: -60,
        }}
        tooltip={({
          node,
        }: {
          node: {
            data: CustomScatterPlotNodeData;
            color: string;
          };
        }) => {
          const { x, y, id, quartile } = node.data;
          return (
            <div
              style={{
                padding: "8px 12px",
                background: "white",
                color: "#333",
                border: `2px solid ${node.color}`,
                borderRadius: "3px",
                boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
              }}
            >
              <strong>ID:</strong> {id}
              <br />
              <strong>{xLabel}:</strong> {x}
              <br />
              <strong>{yLabel}:</strong> {y}
              <br />
              <strong>Quartile:</strong> {quartile}
            </div>
          );
        }}
        legends={[
          {
            anchor: "bottom-right",
            direction: "column",
            translateX: 110,
            itemWidth: 100,
            itemHeight: 18,
            itemsSpacing: 2,
            itemDirection: "left-to-right",
            symbolSize: 10,
            effects: [{ on: "hover", style: { itemOpacity: 1 } }],
            itemTextColor: "#333",
            data: Object.keys(themeColors.quartileColors).map((name) => ({
              id: name,
              label: name,
              color:
                themeColors.quartileColors[
                  name as keyof typeof themeColors.quartileColors
                ],
            })),
          },
        ]}
        theme={{
          axis: {
            domain: { line: { stroke: "#777", strokeWidth: 1 } },
            ticks: { text: { fill: "#333", fontSize: 10 } },
            legend: {
              text: { fill: "#333", fontSize: 11, fontWeight: "bold" },
            },
          },
          grid: { line: { stroke: "#e5e7eb", strokeDasharray: "2 2" } },
          legends: { text: { fill: "#333", fontSize: 10 } },
        }}
        role="application"
        ariaLabel={`Scatter plot of ${xLabel} vs ${yLabel}`}
      />
    </div>
  );
};

const StudyHabitsImpactMatrix = ({ data }: StudyHabitsImpactMatrixProps) => {
  if (!data || data.length === 0) {
    return (
      <div className="text-center text-gray-500">
        No data available for study habits matrix.
      </div>
    );
  }

  const processDataForPlot = (
    xVarKey: keyof StudentData,
    yVarKey: keyof StudentData
  ): CustomScatterPlotNodeData[] => {
    return data
      .map((d, index) => {
        const xValue = d[xVarKey];
        const yValue = d[yVarKey];
        return {
          id: d.student_id || `student-${index}`,
          x: typeof xValue === "number" && !Number.isNaN(xValue) ? xValue : 0,
          y: typeof yValue === "number" && !Number.isNaN(yValue) ? yValue : 0,
          quartile: d.performance_quartile || "N/A",
        };
      })
      .filter(
        (d) =>
          d.x !== null &&
          d.y !== null &&
          !Number.isNaN(d.x) &&
          !Number.isNaN(d.y)
      );
  };

  const plot1Data = processDataForPlot("study_hours_per_day", "exam_score");
  const plot2Data = processDataForPlot("attendance_percentage", "exam_score");
  const plot3Data = processDataForPlot(
    "study_hours_per_day",
    "attendance_percentage"
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-2 h-full">
      <ScatterPlotWrapper
        data={plot1Data}
        xVar="study_hours_per_day"
        yVar="exam_score"
        xLabel="Study Hours/Day"
        yLabel="Exam Score"
        title="Study Hours vs. Score"
      />
      <ScatterPlotWrapper
        data={plot2Data}
        xVar="attendance_percentage"
        yVar="exam_score"
        xLabel="Attendance %"
        yLabel="Exam Score"
        title="Attendance vs. Score"
      />
      <ScatterPlotWrapper
        data={plot3Data}
        xVar="study_hours_per_day"
        yVar="attendance_percentage"
        xLabel="Study Hours/Day"
        yLabel="Attendance %"
        title="Study Hours vs. Attendance"
      />
    </div>
  );
};

export default StudyHabitsImpactMatrix;
