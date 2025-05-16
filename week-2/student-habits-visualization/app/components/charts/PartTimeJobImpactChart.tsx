"use client";

import { ResponsiveBoxPlot, type BoxPlotTooltipProps } from "@nivo/boxplot";
import type { StudentData, YesNo } from "../../page";

interface PartTimeJobImpactChartProps {
  data: StudentData[];
}

interface ViolinDataPoint {
  group: YesNo | "Unknown";
  value: number; // exam_score
  [key: string]: string | number;
}

const PartTimeJobImpactChart = ({ data }: PartTimeJobImpactChartProps) => {
  if (!data || data.length === 0) {
    return (
      <div className="text-center text-gray-500">
        No data available for part-time job impact analysis.
      </div>
    );
  }

  const chartData: ViolinDataPoint[] = data
    .filter(
      (d) => typeof d.exam_score === "number" && !Number.isNaN(d.exam_score)
    )
    .map((d) => ({
      group: d.part_time_job || "Unknown",
      value: d.exam_score as number,
    }));

  if (chartData.length === 0) {
    return (
      <div className="text-center text-gray-500">
        No valid exam score data for part-time job analysis.
      </div>
    );
  }

  const themeColors = {
    yes: "#22c55e", // Green for Yes
    no: "#ef4444", // Red for No
    unknown: "#9ca3af", // Grey for Unknown
  };

  return (
    <div style={{ height: "350px" }}>
      <ResponsiveBoxPlot
        data={chartData}
        margin={{ top: 20, right: 30, bottom: 60, left: 60 }}
        groupBy="group" // Group by 'part_time_job' status
        value="value" // The exam_score
        valueScale={{ type: "linear", min: 0, max: 100 }} // Exam scores 0-100
        colors={(point: { group: string | number }) => {
          const key = String(point.group) as keyof typeof themeColors;
          return themeColors[key] || themeColors.unknown;
        }}
        borderWidth={2}
        borderColor={{ from: "color", modifiers: [["darker", 0.4]] }}
        enableGridX={false}
        enableGridY={true}
        axisTop={null}
        axisRight={null}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: "Has Part-time Job?",
          legendPosition: "middle",
          legendOffset: 40,
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: "Exam Score",
          legendPosition: "middle",
          legendOffset: -45,
        }}
        tooltip={(props: BoxPlotTooltipProps) => {
          console.log("BoxPlotTooltip props:", props);
          return (
            <span
              style={{
                fontSize: "12px",
                background: "#ffffff",
                color: "#333",
                padding: "3px 5px",
                borderRadius: "2px",
                boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
              }}
            >
              Tooltip{" "}
            </span>
          );
        }}
        theme={{
          axis: {
            domain: { line: { stroke: "#777" } },
            ticks: { text: { fill: "#333", fontSize: 11 } },
            legend: {
              text: { fill: "#333", fontSize: 12, fontWeight: "bold" },
            },
          },
          grid: { line: { stroke: "#e5e7eb", strokeDasharray: "2 2" } },
          tooltip: {
            container: {
              background: "#ffffff",
              color: "#333",
              fontSize: "12px",
              boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
            },
          },
          translation: { group: "placeholder", value: 0 },
        }}
        motionConfig="wobbly"
        role="application"
        ariaLabel="Part-time Job Impact on Exam Scores (Violin Plot)"
      />
    </div>
  );
};

export default PartTimeJobImpactChart;
