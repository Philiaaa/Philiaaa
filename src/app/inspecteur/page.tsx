"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import StatusBadge from "@/components/StatusBadge";
import TypeBadge from "@/components/TypeBadge";

type Inspection = {
  id: string;
  type: string;
  status: string;
  scheduledAt: string | null;
  unit: { number: string; property: { name: string; address: string } };
  rooms: { id: string }[];
};

type User = { id: string; name: string; role: string };

export default function InspecteurPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((u) => {
        if (!u || u.role !== "INSPECTOR") {
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

  const todo = inspections.filter(
    (i) => i.status === "ASSIGNED" || i.status === "IN_PROGRESS"
  );
  const done = inspections.filter((i) => i.status === "COMPLETED");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <p className="font-semibold text-gray-900 text-sm">Mes inspections</p>
            <p className="text-xs text-gray-500">{user?.name}</p>
          </div>
          <button
            onClick={logout}
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            Déconnexion
          </button>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 py-6 space-y-6">
        {/* À faire */}
        <section>
          <h2 className="text-sm font-semibold text-gray-700 mb-3">
            À compléter ({todo.length})
          </h2>
          {todo.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
              <p className="text-gray-500 text-sm">Aucune inspection assignée</p>
            </div>
          ) : (
            <div className="space-y-2">
              {todo.map((inspection) => (
                <Link
                  key={inspection.id}
                  href={`/inspecteur/inspections/${inspection.id}`}
                  className="block bg-white rounded-xl border border-gray-100 p-4 hover:border-blue-200 transition-all active:scale-[0.99]"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <TypeBadge type={inspection.type} />
                        <StatusBadge status={inspection.status} />
                      </div>
                      <p className="font-medium text-gray-900 text-sm">
                        {inspection.unit.property.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        Unité {inspection.unit.number} — {inspection.unit.property.address}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      {inspection.scheduledAt && (
                        <p className="text-xs font-medium text-blue-600">
                          {new Date(inspection.scheduledAt).toLocaleDateString("fr-CA", {
                            day: "numeric",
                            month: "short",
                          })}
                        </p>
                      )}
                      {inspection.rooms.length > 0 && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          {inspection.rooms.length} pièce(s)
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Complétées */}
        {done.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-gray-700 mb-3">
              Complétées ({done.length})
            </h2>
            <div className="space-y-2">
              {done.map((inspection) => (
                <Link
                  key={inspection.id}
                  href={`/inspecteur/inspections/${inspection.id}`}
                  className="block bg-white rounded-xl border border-gray-100 p-4 opacity-70 hover:opacity-100 transition-opacity"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <TypeBadge type={inspection.type} />
                        <StatusBadge status={inspection.status} />
                      </div>
                      <p className="font-medium text-gray-900 text-sm">
                        {inspection.unit.property.name} — Unité {inspection.unit.number}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
