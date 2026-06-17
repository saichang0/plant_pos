import { redirect } from "next/navigation";

/// `/dashboard` is now a redirect into the default landing page (sales).
/// The overview report lives at `/dashboard/reports/overview`.
export default function DashboardIndex() {
  redirect("/dashboard/sales");
}
