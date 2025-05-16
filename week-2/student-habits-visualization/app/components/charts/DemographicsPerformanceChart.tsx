"use client";

import { ResponsiveBar, type BarDatum, type ComputedDatum } from "@nivo/bar";
import type { StudentData, Gender } from "../../page";

const METRIC_KEY = "Average Exam Score";

interface DemographicsPerformanceChartProps {
  data: StudentData[];
}

interface BarChartData extends BarDatum {
  id: string;
  [METRIC_KEY]: number;
}

const themeColors = {
  main: "#3B82F6",
  accent: "#EF4444",
  highlight: "#2563EB",
  gender: {
    Female: "#EC4899", // Pink
    Male: "#3B82F6", // Blue
    Other: "#8B5CF6", // Purple
    Unknown: "#9CA3AF", // Gray
  },
  education: {
    None: "#6B7280", // Gray
    "High School": "#60A5FA", // Blue
    Bachelor: "#34D399", // Green
    Master: "#F472B6", // Pink
    Other: "#9CA3AF",
  } as Record<string, string>,
  ageGroup: {
    "<18": "#FBBF24", // Amber
    "18-20": "#F97316", // Orange
    "21-22": "#14B8A6", // Teal
    "23+": "#38BDF8", // Sky
    Unknown: "#9CA3AF",
  } as Record<string, string>,
};

// Helper function to calculate average score for a given grouping
const calculateAverageScores = (
  data: StudentData[],
  groupByKey: keyof StudentData,
  categories: readonly (string | undefined)[]
): BarChartData[] => {
  const groupScores: { [key: string]: { totalScore: number; count: number } } =
    {};

  for (const item of data) {
    const groupValue = String(item[groupByKey] || "Unknown");
    if (!groupScores[groupValue]) {
      groupScores[groupValue] = { totalScore: 0, count: 0 };
    }
    if (typeof item.exam_score === "number" && !Number.isNaN(item.exam_score)) {
      groupScores[groupValue].totalScore += item.exam_score;
      groupScores[groupValue].count++;
    }
  }

  return categories
    .map((category) => {
      const catStr = String(category || "Unknown");
      const group = groupScores[catStr];
      const averageScore =
        group && group.count > 0
          ? Number.parseFloat((group.totalScore / group.count).toFixed(1))
          : 0;
      return {
        id: catStr,
        [METRIC_KEY]: averageScore,
      };
    })
    .filter((d) => d.id !== "Unknown" || d[METRIC_KEY] > 0);
};

const SingleBarChart = ({
  chartData,
  title,
  indexBy,
  barColors,
}: {
  chartData: BarChartData[];
  title: string;
  indexBy: string;
  barColors?: Record<string, string>;
}) => (
  <div style={{ height: "300px", width: "100%" }} className="mb-6">
    <h4 className="text-md font-semibold text-center text-gray-700 mb-2">
      {title}
    </h4>
    <ResponsiveBar
      data={chartData}
      keys={[METRIC_KEY]}
      indexBy={indexBy}
      margin={{ top: 10, right: 10, bottom: 80, left: 50 }}
      padding={0.3}
      valueScale={{ type: "linear", min: 0, max: 100 }}
      indexScale={{ type: "band", round: true }}
      colors={
        barColors
          ? (bar: ComputedDatum<BarChartData>) =>
              barColors[bar.indexValue as string] || themeColors.highlight
          : themeColors.highlight
      }
      borderColor={{ from: "color", modifiers: [["darker", 0.6]] }}
      axisTop={null}
      axisRight={null}
      axisBottom={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: -35,
        legend: "",
        legendPosition: "middle",
        legendOffset: 45,
      }}
      axisLeft={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: METRIC_KEY,
        legendPosition: "middle",
        legendOffset: -40,
        format: (value) => `${value}`,
      }}
      labelSkipWidth={12}
      labelSkipHeight={12}
      labelTextColor={{ from: "color", modifiers: [["darker", 2]] }}
      enableLabel={true}
      label={(d: ComputedDatum<BarChartData>) => `${(d.value ?? 0).toFixed(1)}`}
      animate={true}
      theme={{
        axis: {
          domain: { line: { stroke: "#777" } },
          ticks: { text: { fill: "#333", fontSize: 9 } },
          legend: {
            text: { fill: "#333", fontSize: 11, fontWeight: "bold" },
          },
        },
        grid: { line: { stroke: "#e5e7eb", strokeDasharray: "2 2" } },
        tooltip: {
          container: {
            background: "#fff",
            color: "#333",
            fontSize: "12px",
            boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
          },
        },
        labels: { text: { fontSize: 9, fill: "#333", fontWeight: "bold" } },
      }}
      motionConfig="wobbly"
      role="application"
      ariaLabel={`Bar chart of ${METRIC_KEY} by ${title}`}
    />
  </div>
);

const DemographicsPerformanceChart = ({
  data,
}: DemographicsPerformanceChartProps) => {
  if (!data || data.length === 0) {
    return (
      <div className="text-center text-gray-500">
        No data for demographics analysis.
      </div>
    );
  }

  // Define ordered categories for each demographic factor
  const ageGroupCategories = ["<18", "18-20", "21-22", "23+", "Unknown"];
  const genderCategories: ReadonlyArray<Gender | "Unknown"> = [
    "Female",
    "Male",
    "Other",
    "Unknown",
  ];
  const educationCategories = ["None", "High School", "Bachelor", "Master"];

  const ageGroupData = calculateAverageScores(
    data,
    "age_group",
    ageGroupCategories
  );
  const genderData = calculateAverageScores(
    data,
    "gender",
    genderCategories as string[]
  );
  const educationData = calculateAverageScores(
    data,
    "parental_education_level",
    educationCategories
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-x-2 gap-y-4 h-full">
      <SingleBarChart
        chartData={ageGroupData}
        title="By Age Group"
        indexBy="id"
        barColors={themeColors.ageGroup}
      />
      <SingleBarChart
        chartData={genderData}
        title="By Gender"
        indexBy="id"
        barColors={themeColors.gender}
      />
      <SingleBarChart
        chartData={educationData}
        title="By Parental Education"
        indexBy="id"
        barColors={themeColors.education}
      />
    </div>
  );
};

export default DemographicsPerformanceChart;
