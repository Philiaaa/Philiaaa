"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import StatusBadge from "@/components/StatusBadge";
import TypeBadge from "@/components/TypeBadge";
import { ROOM_CONDITION_LABELS, ROOM_CONDITION_COLORS } from "@/types";

type Photo = { id: string; url: string; caption: string | null };
type Room = {
  id: string;
  name: string;
  condition: string | null;
  notes: string | null;
  photos: Photo[];
};
type Inspector = { id: string; name: string; email: string };
type Inspection = {
  id: string;
  type: string;
  status: string;
  scheduledAt: string | null;
  completedAt: string | null;
  notes: string | null;
  unit: { number: string; floor: number | null; property: { name: string; address: string; city: string } };
  inspector: Inspector | null;
  rooms: Room[];
};

type UserOption = { id: string; name: string; email: string };

export default function InspectionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [inspectors, setInspectors] = useState<UserOption[]>([]);
  const [selectedInspector, setSelectedInspector] = useState("");
  const [saving, setSaving] = useState(false);
  const [lightbox, setLightbox] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch(`/api/inspections/${id}`).then((r) => (r.ok ? r.json() : null)),
      fetch("/api/users").then((r) => (r.ok ? r.json() : [])),
    ]).then(([insp, users]) => {
      if (!insp) { router.push("/gestionnaire"); return; }
      setInspection(insp);
      setSelectedInspector(insp.inspector?.id ?? "");
      setInspectors(users);
    });
  }, [id, router]);

  async function saveAssignment() {
    setSaving(true);
    const res = await fetch(`/api/inspections/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inspectorId: selectedInspector || null }),
    });
    if (res.ok) setInspection(await res.json());
    setSaving(false);
  }

  if (!inspection) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Chargement...</p>
      </div>
    );
  }

  const conditionCounts = inspection.rooms.reduce<Record<string, number>>((acc, r) => {
    if (r.condition) acc[r.condition] = (acc[r.condition] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={lightbox} alt="Photo" className="max-w-full max-h-full rounded-lg object-contain" />
        </div>
      )}

      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/gestionnaire" className="text-gray-500 hover:text-gray-900">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="flex-1">
            <h1 className="font-semibold text-gray-900 text-sm">
              {inspection.unit.property.name} — Unité {inspection.unit.number}
            </h1>
            <div className="flex items-center gap-2 mt-0.5">
              <TypeBadge type={inspection.type} />
              <StatusBadge status={inspection.status} />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        {/* Info card */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Adresse</p>
            <p className="text-gray-900">{inspection.unit.property.address}</p>
            <p className="text-gray-500 text-xs">{inspection.unit.property.city}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Date prévue</p>
            <p className="text-gray-900">
              {inspection.scheduledAt
                ? new Date(inspection.scheduledAt).toLocaleDateString("fr-CA", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                : "Non planifiée"}
            </p>
          </div>
          {inspection.completedAt && (
            <div className="col-span-2">
              <p className="text-xs text-gray-500 mb-0.5">Complétée le</p>
              <p className="text-gray-900">
                {new Date(inspection.completedAt).toLocaleDateString("fr-CA", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          )}
          {inspection.notes && (
            <div className="col-span-2">
              <p className="text-xs text-gray-500 mb-0.5">Notes</p>
              <p className="text-gray-700">{inspection.notes}</p>
            </div>
          )}
        </div>

        {/* Assignment */}
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <h2 className="font-medium text-gray-900 text-sm mb-3">Assignation</h2>
          <div className="flex gap-2">
            <select
              value={selectedInspector}
              onChange={(e) => setSelectedInspector(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Aucun inspecteur</option>
              {inspectors.map((i) => (
                <option key={i.id} value={i.id}>{i.name}</option>
              ))}
            </select>
            <button
              onClick={saveAssignment}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {saving ? "..." : "Sauvegarder"}
            </button>
          </div>
        </div>

        {/* Room summary */}
        {inspection.rooms.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <h2 className="font-medium text-gray-900 text-sm mb-3">
              Résumé — {inspection.rooms.length} pièce(s) inspectée(s)
            </h2>
            {Object.keys(conditionCounts).length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {Object.entries(conditionCounts).map(([cond, count]) => (
                  <span
                    key={cond}
                    className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      ROOM_CONDITION_COLORS[cond as keyof typeof ROOM_CONDITION_COLORS] ?? "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {ROOM_CONDITION_LABELS[cond as keyof typeof ROOM_CONDITION_LABELS] ?? cond}: {count}
                  </span>
                ))}
              </div>
            )}
            <div className="space-y-3">
              {inspection.rooms.map((room) => (
                <div key={room.id} className="border border-gray-100 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-sm text-gray-900">{room.name}</p>
                    {room.condition && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          ROOM_CONDITION_COLORS[room.condition as keyof typeof ROOM_CONDITION_COLORS] ??
                          "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {ROOM_CONDITION_LABELS[room.condition as keyof typeof ROOM_CONDITION_LABELS] ?? room.condition}
                      </span>
                    )}
                  </div>
                  {room.notes && (
                    <p className="text-xs text-gray-600 mb-2">{room.notes}</p>
                  )}
                  {room.photos.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {room.photos.map((photo) => (
                        <button
                          key={photo.id}
                          onClick={() => setLightbox(photo.url)}
                          className="relative"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={photo.url}
                            alt={photo.caption ?? room.name}
                            className="w-16 h-16 object-cover rounded-lg border border-gray-200 hover:border-blue-400 transition-colors"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {inspection.rooms.length === 0 && inspection.status !== "COMPLETED" && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
            L&apos;inspecteur n&apos;a pas encore commencé le rapport.
          </div>
        )}
      </main>
    </div>
  );
}
