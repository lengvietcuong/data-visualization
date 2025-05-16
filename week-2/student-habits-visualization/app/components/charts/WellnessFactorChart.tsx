"use client";

import { ResponsiveParallelCoordinates } from "@nivo/parallel-coordinates";
import type { StudentData, DietQuality } from "../../page";
import { scaleSequential } from "d3-scale";
import { interpolateBlues } from "d3-scale-chromatic";

interface WellnessFactorChartProps {
  data: StudentData[];
}

interface WellnessDataPoint {
  student_id: string;
  sleep_hours: number;
  diet_quality_numeric: number;
  exercise_frequency: number;
  mental_health_rating: number;
  exam_score: number;
}

const dietQualityToNumeric = (diet: DietQuality | null): number => {
  if (diet === "Poor") return 1;
  if (diet === "Fair") return 2;
  if (diet === "Good") return 3;
  return 0;
};

const WellnessFactorChart = ({ data }: WellnessFactorChartProps) => {
  if (!data || data.length === 0) {
    return (
      <div className="text-center text-gray-500">
        No data available for wellness factor analysis.
      </div>
    );
  }

  const chartData: WellnessDataPoint[] = data
    .map((d) => ({
      student_id: d.student_id,
      sleep_hours: d.sleep_hours ?? 0,
      diet_quality_numeric: dietQualityToNumeric(d.diet_quality),
      exercise_frequency: d.exercise_frequency ?? 0,
      mental_health_rating: d.mental_health_rating ?? 0,
      exam_score: d.exam_score ?? 0,
    }))
    .filter(
      (d) =>
        d.diet_quality_numeric > 0 &&
        d.sleep_hours >= 0 &&
        d.exercise_frequency >= 0 &&
        d.mental_health_rating >= 0
    );

  if (chartData.length === 0) {
    return (
      <div className="text-center text-gray-500">
        Insufficient valid data for wellness chart.
      </div>
    );
  }

  const variables = [
    {
      key: "sleep_hours",
      label: "Sleep (hrs)",
      type: "linear",
      min: 0,
      max: 10,
    },
    {
      key: "diet_quality_numeric",
      label: "Diet Quality",
      type: "linear",
      min: 1,
      max: 3,
      ticks: [
        { value: 1, label: "Poor" },
        { value: 2, label: "Fair" },
        { value: 3, label: "Good" },
      ],
    },
    {
      key: "exercise_frequency",
      label: "Exercise (days/wk)",
      type: "linear",
      min: 0,
      max: 7,
    },
    {
      key: "mental_health_rating",
      label: "Mental Health (1-10)",
      type: "linear",
      min: 1,
      max: 10,
    },
  ];

  const examScores = chartData.map((d) => d.exam_score);
  const minScore = Math.min(...examScores);
  const maxScore = Math.max(...examScores);

  const scoreColorScale = scaleSequential(interpolateBlues).domain([
    minScore,
    maxScore,
  ]);

  return (
    <div style={{ height: "350px" }}>
      <ResponsiveParallelCoordinates
        data={chartData}
        variables={variables.map((v) => ({
          id: v.key,
          label: v.label,
          value: v.key,
          type: v.type as "linear",
          min: v.min,
          max: v.max,
          ticksPosition: "before",
          legendPosition: "start",
          ...(v.key === "diet_quality_numeric" && {
            tickValues: v.ticks?.map((t) => t.value),
            format: (value: number) =>
              v.ticks?.find((t) => t.value === value)?.label || String(value),
          }),
        }))}
        margin={{ top: 30, right: 30, bottom: 50, left: 30 }}
        lineWidth={2}
        lineOpacity={0.6}
        curve="monotoneX"
        colors={(d: WellnessDataPoint) => scoreColorScale(d.exam_score)}
        theme={{
          axis: {
            domain: { line: { stroke: "#777", strokeWidth: 1 } },
            ticks: { text: { fill: "#333", fontSize: 10 } },
            legend: {
              text: {
                fill: "#333",
                fontSize: 11,
                fontWeight: "bold",
                textTransform: "capitalize",
              },
            },
          },
          grid: { line: { stroke: "#e5e7eb", strokeDasharray: "2 2" } },
          tooltip: {
            container: {
              background: "#ffffff",
              color: "#333",
              padding: "10px",
              borderRadius: "3px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            },
          },
        }}
        tooltipFormat={(value: number) => `${value.toFixed(1)}`}
        role="application"
        ariaLabel="Wellness Factor Parallel Coordinates Chart"
      />
      <div
        style={{
          textAlign: "center",
          fontSize: "12px",
          color: "#4b5563",
          marginTop: "8px",
        }}
      >
        Lines colored by Exam Score (Low: Lighter Blue, High: Darker Blue)
      </div>
    </div>
  );
};

export default WellnessFactorChart;
