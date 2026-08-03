"use client";

import type { TargetType } from '@/lib/types/report'
import React, { useState, useTransition } from "react";
import ReportViewer from "./ReportViewer"
import type { Report } from '@/lib/types/report'
import { moderateReportAction } from "../actions/moderate-report.action";

interface ReportsPanelProps {
  initialReports: Report[];
  reportedPosts: Record<string, { id: string; content: string }>;
}

export default function ReportsPanel({ initialReports, reportedPosts }: ReportsPanelProps) {
  const [reports, setReports] = useState<Report[]>(initialReports);
  const [selected, setSelected] = useState<Report | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleAction = async (action: "approve" | "reject", targetId: string, targetType: string) => {
    startTransition(async () => {
      try {
        await moderateReportAction(targetId, targetType as TargetType, action);
        setReports((prev) => prev.filter((r) => r.target_id !== targetId));
      } catch {
      }
    });
  };

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-candal text-2xl text-[#1E3B70]">Reportes pendientes</h2>
      </div>

      <div className="space-y-2">
        {isPending && <div className="text-sm text-gray-500">Procesando...</div>}
        {!isPending && reports.length === 0 && <div className="text-sm text-gray-500">No hay reportes pendientes.</div>}

        {reports.map((r) => (
          <div key={r.id} className="flex items-center justify-between rounded-lg border p-3 hover:bg-[#F7FBFF]">
            <div>
              <div className="text-sm font-bold text-[#1E3B70]">{r.reason}</div>
              <div className="text-xs text-gray-600">
                {r.target_type} • {r.target_id}
                {r.reason === 'profanity' ? (
                  <span className="block text-gray-800 mt-1">{r.description}</span>
                ) : (
                  reportedPosts[r.target_id] && (
                    <span className="block text-gray-800 mt-1">Contenido: "{reportedPosts[r.target_id].content}"</span>
                  )
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelected(r)}
                className="rounded-full bg-[#6ABAF4] px-3 py-1 text-white text-sm"
              >
                Ver
              </button>
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <ReportViewer
          report={selected}
          onClose={() => setSelected(null)}
          onAction={handleAction}
        />
      )}
    </div>
  );
}