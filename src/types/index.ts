export type Role = "MANAGER" | "INSPECTOR";
export type InspectionType = "ENTREE" | "SORTIE" | "ROUTINE" | "URGENCE";
export type InspectionStatus = "PENDING" | "ASSIGNED" | "IN_PROGRESS" | "COMPLETED";
export type RoomCondition = "BON" | "ACCEPTABLE" | "MAUVAIS" | "CRITIQUE";

export const INSPECTION_TYPE_LABELS: Record<InspectionType, string> = {
  ENTREE: "Entrée",
  SORTIE: "Sortie",
  ROUTINE: "Routine",
  URGENCE: "Urgence",
};

export const INSPECTION_STATUS_LABELS: Record<InspectionStatus, string> = {
  PENDING: "En attente",
  ASSIGNED: "Assignée",
  IN_PROGRESS: "En cours",
  COMPLETED: "Complétée",
};

export const ROOM_CONDITION_LABELS: Record<RoomCondition, string> = {
  BON: "Bon",
  ACCEPTABLE: "Acceptable",
  MAUVAIS: "Mauvais",
  CRITIQUE: "Critique",
};

export const ROOM_CONDITION_COLORS: Record<RoomCondition, string> = {
  BON: "bg-green-100 text-green-800",
  ACCEPTABLE: "bg-yellow-100 text-yellow-800",
  MAUVAIS: "bg-orange-100 text-orange-800",
  CRITIQUE: "bg-red-100 text-red-800",
};

export const DEFAULT_ROOMS = [
  "Entrée",
  "Cuisine",
  "Salon",
  "Chambre principale",
  "Salle de bain",
  "Garde-robe",
  "Buanderie",
  "Balcon",
  "Sous-sol",
];
