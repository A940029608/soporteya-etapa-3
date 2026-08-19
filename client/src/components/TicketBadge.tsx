import { statusTone } from "@/lib/tickets";

export function TicketBadge({ status }: { status: keyof typeof statusTone }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusTone[status]}`}>
      <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

