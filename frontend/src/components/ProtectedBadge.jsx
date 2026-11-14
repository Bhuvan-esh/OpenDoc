
import { ShieldCheck } from "lucide-react";

export default function ProtectedBadge() {
  return (
    <span className="protected-badge">
      <ShieldCheck size={14} />
      Code preserved
    </span>
  );
}
