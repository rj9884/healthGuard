import { Badge } from "@/components/ui/badge";

export function SeverityBadge({ severity }: { severity: number }) {
  if (severity >= 8) {
    return <Badge variant="danger">{severity}/10 severe</Badge>;
  }
  if (severity >= 5) {
    return <Badge variant="warning">{severity}/10 moderate</Badge>;
  }
  return <Badge variant="success">{severity}/10 mild</Badge>;
}
