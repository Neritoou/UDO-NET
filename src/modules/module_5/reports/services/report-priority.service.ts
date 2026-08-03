import { Report } from "@/lib/types/report";
import { createClient } from "@/lib/db/server"; 

export function calculateReportScore(report: Report): number {
  let score = 0;

  if (report.target_type === "user") {
    score += 20;
  } else if (report.target_type === "community") {
    score += 15;
  } else if (report.target_type === "post") {
    score += 10;
  } else {
    score += 5;
  }

  const highSeverityReasons = ["terrorism", "suicide", "sexual", "harassment"];
  
  if (highSeverityReasons.includes(report.reason.toLowerCase())) {
    score += 30;
  } else {
    score += 10;
  }

  return score;
}

export async function getPrioritizedReports(): Promise<Report[]> {
  const supabase = await createClient();
  const { data: reports, error } = await supabase
    .from("reports")
    .select("*")
    .eq("status", "pending");

  if (error) throw new Error(`Failed to fetch reports: ${error.message}`);

  return (reports as Report[]).sort((a, b) => 
    calculateReportScore(b) - calculateReportScore(a)
  );
}