"use client";

import React, { useEffect, useState } from "react";
import ReportViewer, { Report } from "./ReportViewer";

export default function ReportsPanel() {
  const [reports, setReports] = useState<Report[]>([]);
  const [selected, setSelected] = useState<Report | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/module_5/reports/list");
      if (!res.ok) throw new Error("Failed to fetch reports");
      const data: Report[] = await res.json();
      setReports(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleAction = async (action: "approve" | "reject", targetId: string, targetType: string) => {
    const endpoint = action === "approve" ? "/api/module_5/reports/approve" : "/api/module_5/reports/reject";
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ target_id: targetId, target_type: targetType }),
    });
    if (!res.ok) throw new Error("Action failed");
    // refrescar lista
    await fetchReports();
  };

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-candal text-2xl text-[#1E3B70]">Reportes pendientes</h2>
        <button onClick={fetchReports} className="text-sm text-[#4181E0]">Actualizar</button>
      </div>

      <div className="space-y-2">
        {loading && <div className="text-sm text-gray-500">Cargando...</div>}
        {!loading && reports.length === 0 && <div className="text-sm text-gray-500">No hay reportes pendientes.</div>}

        {reports.map((r) => (
          <div key={r.id} className="flex items-center justify-between rounded-lg border p-3 hover:bg-[#F7FBFF]">
            <div>
              <div className="text-sm font-bold text-[#1E3B70]">{r.reason}</div>
              <div className="text-xs text-gray-600">{r.target_type} • {r.target_id}</div>
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
