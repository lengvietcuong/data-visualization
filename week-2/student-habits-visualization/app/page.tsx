"use client";

import { useEffect, useState } from "react";
import Papa from "papaparse";
import Head from "next/head";

import ExamScoreDistributionChart from "./components/charts/ExamScoreDistributionChart";
import StudyHabitsImpactMatrix from "./components/charts/StudyHabitsImpactMatrix";
import ScreenTimePerformanceChart from "./components/charts/ScreenTimePerformanceChart";
import DemographicsPerformanceChart from "./components/charts/DemographicsPerformanceChart";
import PartTimeJobImpactChart from "./components/charts/PartTimeJobImpactChart";

export type Gender = "Female" | "Male" | "Other";
export type DietQuality = "Fair" | "Good" | "Poor";
export type ParentalEducationLevel =
  | "Master"
  | "High School"
  | "Bachelor"
  | "None"
  | string;
export type InternetQuality = "Average" | "Poor" | "Good";
export type YesNo = "Yes" | "No";

export interface StudentData {
  student_id: string;
  age: number | null;
  gender: Gender | null;
  study_hours_per_day: number | null;
  social_media_hours: number | null;
  netflix_hours: number | null;
  part_time_job: YesNo | null;
  attendance_percentage: number | null;
  sleep_hours: number | null;
  diet_quality: DietQuality | null;
  exercise_frequency: number | null;
  parental_education_level: ParentalEducationLevel | null;
  internet_quality: InternetQuality | null;
  mental_health_rating: number | null;
  extracurricular_participation: YesNo | null;
  exam_score: number | null;
  age_group?: string;
  performance_quartile?: string;
}

function isValidGender(value: unknown): value is Gender {
  return value === "Female" || value === "Male" || value === "Other";
}

function isValidDietQuality(value: unknown): value is DietQuality {
  return value === "Fair" || value === "Good" || value === "Poor";
}

function isValidInternetQuality(value: unknown): value is InternetQuality {
  return value === "Average" || value === "Poor" || value === "Good";
}

/**
 * Fetches the student data CSV file from the public directory.
 * @returns {Promise<string>} A promise that resolves to the CSV file content.
 */
async function fetchStudentCSVFile(): Promise<string> {
  const response = await fetch("/data/student_habits_performance.csv");
  if (!response.ok) {
    throw new Error(
      `Failed to fetch CSV: ${response.status} ${response.statusText}`
    );
  }
  return response.text();
}

/**
 * Parses and processes the student CSV data into StudentData[].
 * @param {string} csvText - Raw CSV text to parse
 * @returns {StudentData[]} Array of processed student data.
 */
function parseStudentData(csvText: string): StudentData[] {
  const result = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: true,
    transformHeader: (header) => header.toLowerCase().replace(/ /g, "_").trim(),
  });

  const parsedData = result.data as Partial<StudentData>[];

  const allExamScores = parsedData
    .map((row) => row.exam_score)
    .filter(
      (score) => typeof score === "number" && !Number.isNaN(score)
    ) as number[];

  const validData = parsedData
    .filter(
      (row) =>
        row &&
        typeof row === "object" &&
        row.student_id != null &&
        row.student_id !== ""
    )
    .map((row): StudentData => {
      const standardizeYesNo = (value: unknown): YesNo | null => {
        if (typeof value === "boolean") return value ? "Yes" : "No";
        if (typeof value === "string") {
          const lowerVal = value.toLowerCase();
          if (lowerVal === "yes") return "Yes";
          if (lowerVal === "no") return "No";
        }
        return null;
      };

      const parental_education_level_raw = row.parental_education_level;
      let parental_education_level_processed: ParentalEducationLevel | null;
      if (
        ["Master", "High School", "Bachelor", "None"].includes(
          parental_education_level_raw as string
        )
      ) {
        parental_education_level_processed =
          parental_education_level_raw as ParentalEducationLevel;
      } else if (
        typeof parental_education_level_raw === "string" &&
        parental_education_level_raw.trim() !== ""
      ) {
        parental_education_level_processed = parental_education_level_raw;
      } else {
        parental_education_level_processed = null;
      }

      const processedRow: StudentData = {
        student_id: String(row.student_id),
        age:
          typeof row.age === "number" && !Number.isNaN(row.age)
            ? row.age
            : null,
        gender: isValidGender(row.gender) ? row.gender : null,
        study_hours_per_day:
          typeof row.study_hours_per_day === "number" &&
          !Number.isNaN(row.study_hours_per_day)
            ? row.study_hours_per_day
            : null,
        social_media_hours:
          typeof row.social_media_hours === "number" &&
          !Number.isNaN(row.social_media_hours)
            ? row.social_media_hours
            : null,
        netflix_hours:
          typeof row.netflix_hours === "number" &&
          !Number.isNaN(row.netflix_hours)
            ? row.netflix_hours
            : null,
        part_time_job: standardizeYesNo(row.part_time_job),
        attendance_percentage:
          typeof row.attendance_percentage === "number" &&
          !Number.isNaN(row.attendance_percentage)
            ? row.attendance_percentage
            : null,
        sleep_hours:
          typeof row.sleep_hours === "number" && !Number.isNaN(row.sleep_hours)
            ? row.sleep_hours
            : null,
        diet_quality: isValidDietQuality(row.diet_quality)
          ? row.diet_quality
          : null,
        exercise_frequency:
          typeof row.exercise_frequency === "number" &&
          !Number.isNaN(row.exercise_frequency)
            ? row.exercise_frequency
            : null,
        parental_education_level: parental_education_level_processed,
        internet_quality: isValidInternetQuality(row.internet_quality)
          ? row.internet_quality
          : null,
        mental_health_rating:
          typeof row.mental_health_rating === "number" &&
          !Number.isNaN(row.mental_health_rating)
            ? row.mental_health_rating
            : null,
        extracurricular_participation: standardizeYesNo(
          row.extracurricular_participation
        ),
        exam_score:
          typeof row.exam_score === "number" && !Number.isNaN(row.exam_score)
            ? row.exam_score
            : null,
      };

      processedRow.age_group = getAgeGroup(processedRow.age);
      if (typeof processedRow.exam_score === "number") {
        processedRow.performance_quartile = getPerformanceQuartile(
          processedRow.exam_score,
          allExamScores
        );
      } else {
        processedRow.performance_quartile = "N/A";
      }
      return processedRow;
    });

  return validData;
}

export default function Home() {
  const [studentData, setStudentData] = useState<StudentData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadData() {
      try {
        const csvText = await fetchStudentCSVFile();
        const data = parseStudentData(csvText);
        setStudentData(data);
      } catch (exception) {
        const errorObject = exception as Error;
        setError(`Failed to load student data: ${errorObject.message}`);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white text-gray-800">
        Loading student data...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white text-red-600">
        Error: {error}
      </div>
    );
  }

  if (studentData.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white text-gray-800">
        No data available to display or data parsing failed silently. Check
        console for errors.
      </div>
    );
  }

  const themeColors = {
    main: "#3B82F6",
    accent: "#EF4444",
    highlight: "#2563EB",
  };

  return (
    <>
      <Head>
        <title>Student Habits Dashboard</title>
        <meta
          name="description"
          content="Visualization of student habits and performance"
        />
      </Head>
      <main className="min-h-screen bg-white text-gray-800 p-4 sm:p-8">
        <header className="mb-10 text-center">
          <h1
            className="text-4xl font-bold"
            style={{ color: themeColors.highlight }}
          >
            Student Habits and Academic Performance Dashboard
          </h1>
          <p className="text-lg text-gray-600 mt-2">
            Analyzing trends and correlations in student data. (Loaded:{" "}
            {studentData.length} records)
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-gray-100 p-4 rounded-lg shadow-lg">
            <h2
              className="text-xl font-semibold mb-3 text-center"
              style={{ color: themeColors.highlight }}
            >
              Exam Score Distribution
            </h2>
            <ExamScoreDistributionChart data={studentData} />
          </div>
          <div className="lg:col-span-2 bg-gray-100 p-4 rounded-lg shadow-lg">
            <h2
              className="text-xl font-semibold mb-3 text-center"
              style={{ color: themeColors.highlight }}
            >
              Study Habits Impact
            </h2>
            <StudyHabitsImpactMatrix data={studentData} />
          </div>
          <div className="lg:col-span-2 bg-gray-100 p-4 rounded-lg shadow-lg">
            <h2
              className="text-xl font-semibold mb-3 text-center"
              style={{ color: themeColors.highlight }}
            >
              Screen Time vs. Performance
            </h2>
            <ScreenTimePerformanceChart data={studentData} />
          </div>
          <div className="lg:col-span-1 bg-gray-100 p-4 rounded-lg shadow-lg">
            <h2
              className="text-xl font-semibold mb-3 text-center"
              style={{ color: themeColors.highlight }}
            >
              Part-time Job Impact
            </h2>
            <PartTimeJobImpactChart data={studentData} />
          </div>
          <div className="lg:col-span-2 bg-gray-100 p-4 rounded-lg shadow-lg">
            <h2
              className="text-xl font-semibold mb-3 text-center"
              style={{ color: themeColors.highlight }}
            >
              Performance by Demographics
            </h2>
            <DemographicsPerformanceChart data={studentData} />
          </div>
        </div>

        <footer className="mt-12 text-center text-gray-500">
          <p>
            Data sourced from student_habits_performance.csv. Visualizations
            powered by Nivo.
          </p>
        </footer>
      </main>
    </>
  );
}

// Helper function to create age groups
const getAgeGroup = (age: number | null | undefined): string => {
  if (age === null || age === undefined) return "Unknown";
  if (age < 18) return "<18";
  if (age >= 18 && age <= 20) return "18-20";
  if (age >= 21 && age <= 22) return "21-22";
  return "23+";
};

// Helper function to get performance quartiles
const getPerformanceQuartile = (score: number, allScores: number[]): string => {
  if (allScores.length === 0) return "N/A";
  const sortedScores = [...allScores].sort((a, b) => a - b);

  // Calculate quartiles more robustly
  const getQuartile = (arr: number[], q: number): number => {
    const pos = (arr.length - 1) * q;
    const base = Math.floor(pos);
    const rest = pos - base;
    if (arr[base + 1] !== undefined) {
      return arr[base] + rest * (arr[base + 1] - arr[base]);
    }
    return arr[base];
  };

  const q1 = getQuartile(sortedScores, 0.25);
  const q2 = getQuartile(sortedScores, 0.5);
  const q3 = getQuartile(sortedScores, 0.75);

  if (score <= q1) return "Q1 (Lowest)";
  if (score <= q2) return "Q2";
  if (score <= q3) return "Q3";
  return "Q4 (Highest)";
};
