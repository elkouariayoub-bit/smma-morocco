import type { Metadata } from "next";
import TeamManagementPreview from "@/components/Team";

export const metadata: Metadata = {
  title: "Team | SMMA Morocco",
};

export default function TeamPage() {
  return <TeamManagementPreview />;
}
