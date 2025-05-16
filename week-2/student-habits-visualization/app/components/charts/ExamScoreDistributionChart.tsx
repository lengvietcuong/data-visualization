"use client";

import { ResponsiveBar } from "@nivo/bar";
import type { StudentData } from "../../page";

interface ExamScoreDistributionChartProps {
  data: StudentData[];
}

const ExamScoreDistributionChart = ({
  data,
}: ExamScoreDistributionChartProps) => {
  const scores = data
    .map((d) => d.exam_score)
    .filter((score) => score !== null && score !== undefined) as number[];

  if (scores.length === 0) {
    return (
      <div className="text-center text-gray-500">
        No exam score data available.
      </div>
    );
  }

  const binSize = 10;
  const numBins = Math.ceil(100 / binSize);
  const bins: { id: string; value: number }[] = Array(numBins)
    .fill(null)
    .map((_, i) => {
      const binStart = i * binSize;
      const binEnd = Math.min((i + 1) * binSize, 100);
      return {
        id: `${binStart}-${binEnd}`,
        value: 0,
      };
    });

  for (const score of scores) {
    if (score === 100) {
      bins[numBins - 1].value++;
    } else {
      const binIndex = Math.floor(score / binSize);
      if (binIndex >= 0 && binIndex < numBins) {
        bins[binIndex].value++;
      }
    }
  }

  const themeColors = {
    highlight: "#2563EB",
  };

  return (
    <div style={{ height: "350px" }}>
      <ResponsiveBar
        data={bins}
        keys={["value"]}
        indexBy="id"
        margin={{ top: 20, right: 20, bottom: 60, left: 50 }}
        padding={0.1}
        valueScale={{ type: "linear", min: 0, max: "auto" }}
        indexScale={{ type: "band", round: true }}
        colors={themeColors.highlight}
        borderColor={{ from: "color", modifiers: [["darker", 0.6]] }}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          legend: "Exam Score Bins",
          legendPosition: "middle",
          legendOffset: 40,
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          legend: "Frequency",
          legendPosition: "middle",
          legendOffset: -40,
          format: (value) => (Number.isInteger(value) ? String(value) : ""),
        }}
        enableLabel={false}
        animate={true}
        tooltip={({ id, value, indexValue, color }) => (
          <div
            style={{
              padding: "8px 12px",
              background: "white",
              color: "#333",
              border: `2px solid ${color}`,
              borderRadius: "3px",
              boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
            }}
          >
            <strong>Scores {indexValue}:</strong> {value}
          </div>
        )}
        theme={{
          axis: {
            domain: { line: { stroke: "#777", strokeWidth: 1 } },
            ticks: {
              text: { fill: "#333", fontSize: 11 },
            },
            legend: {
              text: { fill: "#333", fontSize: 12, fontWeight: "bold" },
            },
          },
          tooltip: {
            container: {
              background: "#fff",
              color: "#333",
              fontSize: "12px",
              boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
            },
          },
        }}
        motionConfig="wobbly"
        role="application"
        ariaLabel="Exam Score Distribution Histogram"
      />
    </div>
  );
};

export default ExamScoreDistributionChart;
