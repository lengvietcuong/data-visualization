"use client";

import {
  ResponsiveScatterPlot,
  type ScatterPlotRawSerie,
} from "@nivo/scatterplot";
import type { StudentData, InternetQuality } from "../../page";

interface ScreenTimePerformanceChartProps {
  data: StudentData[];
}

interface BubbleChartNodeData {
  id: string;
  x: number; // social_media_hours
  y: number; // netflix_hours
  size: number; // exam_score
  internetQuality: InternetQuality | null | string; // string for 'N/A' or unexpected values
}

const ScreenTimePerformanceChart = ({
  data,
}: ScreenTimePerformanceChartProps) => {
  if (!data || data.length === 0) {
    return (
      <div className="text-center text-gray-500">
        No data available for screen time analysis.
      </div>
    );
  }

  const chartData: BubbleChartNodeData[] = data
    .map((d, index) => ({
      id: d.student_id || `student-${index}`,
      x:
        typeof d.social_media_hours === "number" &&
        !Number.isNaN(d.social_media_hours)
          ? d.social_media_hours
          : 0,
      y:
        typeof d.netflix_hours === "number" && !Number.isNaN(d.netflix_hours)
          ? d.netflix_hours
          : 0,
      size:
        typeof d.exam_score === "number" && !Number.isNaN(d.exam_score)
          ? Math.max(d.exam_score, 0)
          : 0,
      internetQuality: d.internet_quality || "N/A",
    }))
    .filter((d) => d.size > 0);

  const internetQualityCategories: (InternetQuality | string)[] = [
    "Good",
    "Average",
    "Poor",
    "N/A",
  ];
  const themeColors = {
    internetQuality: {
      Good: "#22c55e", // Green
      Average: "#f97316", // Orange
      Poor: "#ef4444", // Red
      "N/A": "#9ca3af", // Grey
    } as Record<InternetQuality | string, string>,
  };

  const series: ScatterPlotRawSerie<BubbleChartNodeData>[] =
    internetQualityCategories.map((quality) => ({
      id: quality,
      data: chartData.filter((d) => d.internetQuality === quality),
    }));

  return (
    <div style={{ height: "350px" }}>
      <ResponsiveScatterPlot
        data={series}
        margin={{ top: 20, right: 20, bottom: 60, left: 70 }}
        xScale={{ type: "linear", min: 0, max: "auto" }}
        xFormat={(value) => `${value.toFixed(1)}h`}
        yScale={{ type: "linear", min: 0, max: "auto" }}
        yFormat={(value) => `${value.toFixed(1)}h`}
        blendMode="multiply"
        colors={(serieObject: { serieId: string | number }) =>
          themeColors.internetQuality[
            serieObject.serieId as keyof typeof themeColors.internetQuality
          ] || themeColors.internetQuality["N/A"]
        }
        nodeSize={(node: { data: BubbleChartNodeData }) =>
          Math.max(node.data.size / 5, 5)
        }
        axisTop={null}
        axisRight={null}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: "Social Media Hours",
          legendPosition: "middle",
          legendOffset: 46,
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: "Netflix Hours",
          legendPosition: "middle",
          legendOffset: -60,
        }}
        tooltip={({ node }) => {
          const { x, y, size, internetQuality, id } = node.data;
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
              <strong>Social Media:</strong> {x.toFixed(1)}h<br />
              <strong>Netflix:</strong> {y.toFixed(1)}h<br />
              <strong>Exam Score (Size):</strong> {size}
              <br />
              <strong>Internet:</strong> {internetQuality}
            </div>
          );
        }}
        legends={[
          {
            anchor: "bottom-right",
            direction: "column",
            justify: false,
            translateX: 120,
            translateY: 0,
            itemsSpacing: 2,
            itemWidth: 100,
            itemHeight: 20,
            itemDirection: "left-to-right",
            itemTextColor: "#333",
            symbolSize: 12,
            symbolShape: "circle",
            effects: [{ on: "hover", style: { itemOpacity: 1 } }],
            data: internetQualityCategories.map((quality) => ({
              id: quality,
              label: quality,
              color: themeColors.internetQuality[quality],
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
          tooltip: { container: {} },
          grid: { line: { stroke: "#e5e7eb", strokeDasharray: "2 2" } },
          legends: { text: { fill: "#333", fontSize: 10 } },
        }}
        role="application"
        ariaLabel="Screen Time vs Performance Bubble Chart"
      />
    </div>
  );
};

export default ScreenTimePerformanceChart;
