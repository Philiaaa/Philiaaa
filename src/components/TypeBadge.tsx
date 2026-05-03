import { InspectionType, INSPECTION_TYPE_LABELS } from "@/types";

const TYPE_COLORS: Record<InspectionType, string> = {
  ENTREE: "bg-emerald-100 text-emerald-700",
  SORTIE: "bg-red-100 text-red-700",
  ROUTINE: "bg-purple-100 text-purple-700",
  URGENCE: "bg-orange-100 text-orange-700",
};

export default function TypeBadge({ type }: { type: string }) {
  const t = type as InspectionType;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${TYPE_COLORS[t] ?? "bg-gray-100 text-gray-700"}`}>
      {INSPECTION_TYPE_LABELS[t] ?? type}
    </span>
  );
}
