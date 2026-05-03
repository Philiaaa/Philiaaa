import { InspectionStatus, INSPECTION_STATUS_LABELS } from "@/types";

const STATUS_COLORS: Record<InspectionStatus, string> = {
  PENDING: "bg-gray-100 text-gray-700",
  ASSIGNED: "bg-blue-100 text-blue-700",
  IN_PROGRESS: "bg-yellow-100 text-yellow-700",
  COMPLETED: "bg-green-100 text-green-700",
};

export default function StatusBadge({ status }: { status: string }) {
  const s = status as InspectionStatus;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[s] ?? "bg-gray-100 text-gray-700"}`}>
      {INSPECTION_STATUS_LABELS[s] ?? status}
    </span>
  );
}
