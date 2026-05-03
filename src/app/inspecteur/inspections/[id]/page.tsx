"use client";

import { useEffect, useState, use, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import StatusBadge from "@/components/StatusBadge";
import TypeBadge from "@/components/TypeBadge";
import { DEFAULT_ROOMS, ROOM_CONDITION_LABELS, ROOM_CONDITION_COLORS } from "@/types";

type Photo = { id: string; url: string; caption: string | null };
type Room = {
  id: string;
  name: string;
  condition: string | null;
  notes: string | null;
  photos: Photo[];
};
type Inspection = {
  id: string;
  type: string;
  status: string;
  scheduledAt: string | null;
  notes: string | null;
  unit: { number: string; floor: number | null; property: { name: string; address: string } };
  rooms: Room[];
};

const CONDITIONS = ["BON", "ACCEPTABLE", "MAUVAIS", "CRITIQUE"] as const;

export default function InspecteurInspectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [activeRoom, setActiveRoom] = useState<Room | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [saving, setSaving] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [customRoomName, setCustomRoomName] = useState("");
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch(`/api/inspections/${id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) { router.push("/inspecteur"); return; }
        setInspection(data);
        if (data.status === "ASSIGNED") {
          fetch(`/api/inspections/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "IN_PROGRESS" }),
          }).then((r) => r.json()).then(setInspection);
        }
      });
  }, [id, router]);

  async function addRoom(name: string) {
    if (!name.trim()) return;
    setSaving(true);
    const res = await fetch(`/api/inspections/${id}/rooms`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim() }),
    });
    if (res.ok) {
      const room: Room = await res.json();
      setInspection((prev) => prev ? { ...prev, rooms: [...prev.rooms, room] } : prev);
      setActiveRoom(room);
    }
    setSaving(false);
    setShowAddRoom(false);
    setCustomRoomName("");
  }

  async function updateRoom(roomId: string, condition: string | null, notes: string | null) {
    const res = await fetch(`/api/inspections/${id}/rooms`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomId, condition, notes }),
    });
    if (res.ok) {
      const updated: Room = await res.json();
      setInspection((prev) =>
        prev
          ? { ...prev, rooms: prev.rooms.map((r) => (r.id === roomId ? updated : r)) }
          : prev
      );
      setActiveRoom(updated);
    }
  }

  async function uploadPhoto(file: File) {
    if (!activeRoom) return;
    setUploadingPhoto(true);
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`/api/rooms/${activeRoom.id}/photos`, {
      method: "POST",
      body: formData,
    });
    if (res.ok) {
      const photo: Photo = await res.json();
      const updatedRoom = { ...activeRoom, photos: [...activeRoom.photos, photo] };
      setActiveRoom(updatedRoom);
      setInspection((prev) =>
        prev
          ? { ...prev, rooms: prev.rooms.map((r) => (r.id === activeRoom.id ? updatedRoom : r)) }
          : prev
      );
    }
    setUploadingPhoto(false);
  }

  async function completeInspection() {
    setCompleting(true);
    const res = await fetch(`/api/inspections/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "COMPLETED" }),
    });
    if (res.ok) {
      router.push("/inspecteur");
    }
    setCompleting(false);
  }

  if (!inspection) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Chargement...</p>
      </div>
    );
  }

  const isCompleted = inspection.status === "COMPLETED";
  const existingRoomNames = inspection.rooms.map((r) => r.name);
  const suggestedRooms = DEFAULT_ROOMS.filter((r) => !existingRoomNames.includes(r));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={lightbox} alt="" className="max-w-full max-h-full rounded-lg object-contain" />
        </div>
      )}

      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/inspecteur" className="text-gray-500 hover:text-gray-900 shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 text-sm truncate">
              {inspection.unit.property.name} — Unité {inspection.unit.number}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <TypeBadge type={inspection.type} />
              <StatusBadge status={inspection.status} />
            </div>
          </div>
        </div>
      </header>

      {/* Room detail panel */}
      {activeRoom && !isCompleted && (
        <div className="fixed inset-0 bg-gray-50 z-20 overflow-y-auto">
          <div className="max-w-xl mx-auto">
            {/* Room header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10 px-4 py-3 flex items-center gap-3">
              <button
                onClick={() => setActiveRoom(null)}
                className="text-gray-500 hover:text-gray-900 shrink-0"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h2 className="font-semibold text-gray-900">{activeRoom.name}</h2>
            </div>

            <div className="px-4 py-6 space-y-4">
              {/* Condition */}
              <div className="bg-white rounded-xl border border-gray-100 p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3">État de la pièce</h3>
                <div className="grid grid-cols-2 gap-2">
                  {CONDITIONS.map((c) => (
                    <button
                      key={c}
                      onClick={() => updateRoom(activeRoom.id, c, activeRoom.notes)}
                      className={`py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                        activeRoom.condition === c
                          ? ROOM_CONDITION_COLORS[c] + " border-transparent"
                          : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      {ROOM_CONDITION_LABELS[c]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="bg-white rounded-xl border border-gray-100 p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Notes</h3>
                <textarea
                  rows={3}
                  defaultValue={activeRoom.notes ?? ""}
                  onBlur={(e) => updateRoom(activeRoom.id, activeRoom.condition, e.target.value || null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Décrire l'état, les dommages, remarques..."
                />
              </div>

              {/* Photos */}
              <div className="bg-white rounded-xl border border-gray-100 p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3">
                  Photos ({activeRoom.photos.length})
                </h3>

                {activeRoom.photos.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {activeRoom.photos.map((photo) => (
                      <button
                        key={photo.id}
                        onClick={() => setLightbox(photo.url)}
                        className="aspect-square"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={photo.url}
                          alt={photo.caption ?? ""}
                          className="w-full h-full object-cover rounded-lg border border-gray-200"
                        />
                      </button>
                    ))}
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) uploadPhoto(file);
                    e.target.value = "";
                  }}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingPhoto}
                  className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {uploadingPhoto ? (
                    "Envoi en cours..."
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Prendre une photo
                    </>
                  )}
                </button>
              </div>

              <button
                onClick={() => setActiveRoom(null)}
                className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
              >
                Terminer cette pièce
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-xl mx-auto px-4 py-6 space-y-4">
        {/* Info */}
        {inspection.notes && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-800">
            <p className="font-medium mb-0.5">Instructions du gestionnaire</p>
            <p>{inspection.notes}</p>
          </div>
        )}

        {/* Rooms done */}
        {inspection.rooms.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <h2 className="font-medium text-gray-900 text-sm mb-3">
              Pièces inspectées ({inspection.rooms.length})
            </h2>
            <div className="space-y-2">
              {inspection.rooms.map((room) => (
                <button
                  key={room.id}
                  onClick={() => !isCompleted && setActiveRoom(room)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors text-left ${
                    isCompleted
                      ? "border-gray-100 bg-gray-50 cursor-default"
                      : "border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        room.condition === "BON"
                          ? "bg-green-500"
                          : room.condition === "ACCEPTABLE"
                          ? "bg-yellow-500"
                          : room.condition === "MAUVAIS"
                          ? "bg-orange-500"
                          : room.condition === "CRITIQUE"
                          ? "bg-red-500"
                          : "bg-gray-300"
                      }`}
                    />
                    <span className="text-sm font-medium text-gray-900">{room.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {room.photos.length > 0 && (
                      <span className="text-xs text-gray-500">{room.photos.length} photo(s)</span>
                    )}
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
                    {!isCompleted && (
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Add room */}
        {!isCompleted && (
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <h2 className="font-medium text-gray-900 text-sm mb-3">Ajouter une pièce</h2>

            {suggestedRooms.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {suggestedRooms.map((name) => (
                  <button
                    key={name}
                    onClick={() => addRoom(name)}
                    disabled={saving}
                    className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-blue-100 hover:text-blue-700 transition-colors disabled:opacity-50"
                  >
                    + {name}
                  </button>
                ))}
              </div>
            )}

            {showAddRoom ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customRoomName}
                  onChange={(e) => setCustomRoomName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addRoom(customRoomName)}
                  placeholder="Nom de la pièce..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
                <button
                  onClick={() => addRoom(customRoomName)}
                  disabled={!customRoomName.trim() || saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm disabled:opacity-50 hover:bg-blue-700 transition-colors"
                >
                  OK
                </button>
                <button
                  onClick={() => { setShowAddRoom(false); setCustomRoomName(""); }}
                  className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAddRoom(true)}
                className="w-full py-2 border border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors"
              >
                + Autre pièce (personnalisé)
              </button>
            )}
          </div>
        )}

        {/* Complete button */}
        {!isCompleted && inspection.rooms.length > 0 && (
          <button
            onClick={completeInspection}
            disabled={completing}
            className="w-full py-3.5 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            {completing ? "Envoi en cours..." : "Marquer l'inspection comme complétée"}
          </button>
        )}

        {isCompleted && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
            <p className="text-green-700 font-medium">Inspection complétée</p>
            <p className="text-green-600 text-sm mt-0.5">Le rapport a été soumis au gestionnaire</p>
          </div>
        )}
      </main>
    </div>
  );
}
