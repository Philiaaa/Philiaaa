"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { INSPECTION_TYPE_LABELS } from "@/types";

type Property = {
  id: string;
  name: string;
  address: string;
  units: { id: string; number: string; floor: number | null }[];
};

type Inspector = { id: string; name: string; email: string };

export default function NouvelleInspectionPage() {
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [inspectors, setInspectors] = useState<Inspector[]>([]);
  const [form, setForm] = useState({
    type: "ROUTINE",
    propertyId: "",
    unitId: "",
    inspectorId: "",
    scheduledAt: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([fetch("/api/properties"), fetch("/api/users")]).then(
      async ([pRes, uRes]) => {
        if (pRes.ok) setProperties(await pRes.json());
        if (uRes.ok) setInspectors(await uRes.json());
      }
    );
  }, []);

  const selectedProperty = properties.find((p) => p.id === form.propertyId);

  function update(field: string, value: string) {
    setForm((f) => {
      const next = { ...f, [field]: value };
      if (field === "propertyId") next.unitId = "";
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.unitId) { setError("Veuillez sélectionner une unité"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/inspections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: form.type,
          unitId: form.unitId,
          inspectorId: form.inspectorId || null,
          scheduledAt: form.scheduledAt || null,
          notes: form.notes || null,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error || "Erreur lors de la création");
        return;
      }
      const created = await res.json();
      router.push(`/gestionnaire/inspections/${created.id}`);
    } catch {
      setError("Erreur réseau");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/gestionnaire" className="text-gray-500 hover:text-gray-900">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="font-semibold text-gray-900">Nouvelle inspection</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type */}
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <h2 className="font-medium text-gray-900 mb-3 text-sm">Type d&apos;inspection</h2>
            <div className="grid grid-cols-2 gap-2">
              {(["ENTREE", "SORTIE", "ROUTINE", "URGENCE"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => update("type", t)}
                  className={`px-3 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                    form.type === t
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {INSPECTION_TYPE_LABELS[t]}
                </button>
              ))}
            </div>
          </div>

          {/* Property & Unit */}
          <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-3">
            <h2 className="font-medium text-gray-900 text-sm">Logement</h2>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Immeuble</label>
              <select
                value={form.propertyId}
                onChange={(e) => update("propertyId", e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Sélectionner un immeuble</option>
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — {p.address}
                  </option>
                ))}
              </select>
            </div>
            {selectedProperty && (
              <div>
                <label className="block text-xs text-gray-600 mb-1">Unité</label>
                <select
                  value={form.unitId}
                  onChange={(e) => update("unitId", e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Sélectionner une unité</option>
                  {selectedProperty.units
                    .sort((a, b) => a.number.localeCompare(b.number))
                    .map((u) => (
                      <option key={u.id} value={u.id}>
                        Unité {u.number}
                        {u.floor !== null ? ` — ${u.floor}e étage` : ""}
                      </option>
                    ))}
                </select>
              </div>
            )}
          </div>

          {/* Assignment & date */}
          <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-3">
            <h2 className="font-medium text-gray-900 text-sm">Planification</h2>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Inspecteur (optionnel)</label>
              <select
                value={form.inspectorId}
                onChange={(e) => update("inspectorId", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Aucun — assigner plus tard</option>
                {inspectors.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Date prévue (optionnel)</label>
              <input
                type="date"
                value={form.scheduledAt}
                onChange={(e) => update("scheduledAt", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <h2 className="font-medium text-gray-900 text-sm mb-2">Notes (optionnel)</h2>
            <textarea
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Instructions particulières pour l'inspecteur..."
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2.5 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? "Création en cours..." : "Créer l'inspection"}
          </button>
        </form>
      </main>
    </div>
  );
}
