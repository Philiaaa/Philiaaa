"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import StatusBadge from "@/components/StatusBadge";
import TypeBadge from "@/components/TypeBadge";
import { INSPECTION_TYPE_LABELS } from "@/types";

type Inspection = {
  id: string;
  type: string;
  status: string;
  scheduledAt: string | null;
  completedAt: string | null;
  unit: { number: string; property: { name: string; address: string } };
  inspector: { id: string; name: string } | null;
  rooms: { id: string }[];
};

type User = { id: string; name: string; email: string; role: string };

export default function GestionnairePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((u) => {
        if (!u || u.role !== "MANAGER") {
          router.push("/");
          return;
        }
        setUser(u);
        return fetch("/api/inspections");
      })
      .then((r) => (r && r.ok ? r.json() : []))
      .then((data) => {
        setInspections(data);
        setLoading(false);
      });
  }, [router]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  }

  const filtered =
    filter === "ALL"
      ? inspections
      : inspections.filter((i) => i.status === filter);

  const counts = {
    ALL: inspections.length,
    PENDING: inspections.filter((i) => i.status === "PENDING").length,
    ASSIGNED: inspections.filter((i) => i.status === "ASSIGNED").length,
    IN_PROGRESS: inspections.filter((i) => i.status === "IN_PROGRESS").length,
    COMPLETED: inspections.filter((i) => i.status === "COMPLETED").length,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">Gestion Vaillère</p>
              <p className="text-xs text-gray-500">{user?.name}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            Déconnexion
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: "En attente", count: counts.PENDING, color: "text-gray-700", bg: "bg-white" },
            { label: "Assignées", count: counts.ASSIGNED, color: "text-blue-700", bg: "bg-blue-50" },
            { label: "En cours", count: counts.IN_PROGRESS, color: "text-yellow-700", bg: "bg-yellow-50" },
            { label: "Complétées", count: counts.COMPLETED, color: "text-green-700", bg: "bg-green-50" },
          ].map((s) => (
            <div key={s.label} className={`${s.bg} rounded-xl border border-gray-100 p-4`}>
              <p className={`text-2xl font-bold ${s.color}`}>{s.count}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold text-gray-900">Inspections</h1>
          <Link
            href="/gestionnaire/inspections/nouvelle"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nouvelle inspection
          </Link>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {[
            { key: "ALL", label: "Toutes" },
            { key: "PENDING", label: "En attente" },
            { key: "ASSIGNED", label: "Assignées" },
            { key: "IN_PROGRESS", label: "En cours" },
            { key: "COMPLETED", label: "Complétées" },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                filter === f.key
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {f.label} ({counts[f.key as keyof typeof counts] ?? 0})
            </button>
          ))}
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
            <p className="text-gray-500">Aucune inspection</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((inspection) => (
              <Link
                key={inspection.id}
                href={`/gestionnaire/inspections/${inspection.id}`}
                className="block bg-white rounded-xl border border-gray-100 p-4 hover:border-blue-200 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <TypeBadge type={inspection.type} />
                      <StatusBadge status={inspection.status} />
                    </div>
                    <p className="font-medium text-gray-900 text-sm">
                      {inspection.unit.property.name} — Unité {inspection.unit.number}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {inspection.unit.property.address}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    {inspection.scheduledAt && (
                      <p className="text-xs text-gray-500">
                        {new Date(inspection.scheduledAt).toLocaleDateString("fr-CA", {
                          day: "numeric",
                          month: "short",
                        })}
                      </p>
                    )}
                    {inspection.inspector ? (
                      <p className="text-xs text-blue-600 mt-0.5">{inspection.inspector.name}</p>
                    ) : (
                      <p className="text-xs text-orange-500 mt-0.5">Non assigné</p>
                    )}
                    {inspection.rooms.length > 0 && (
                      <p className="text-xs text-gray-400 mt-0.5">{inspection.rooms.length} pièce(s)</p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
