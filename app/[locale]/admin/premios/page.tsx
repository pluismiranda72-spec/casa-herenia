import PremiosAdminClient from "./PremiosAdminClient";
import { listAwards } from "@/app/actions/premiosAdmin";

export default async function PremiosPage({
  params: _params,
}: {
  params: { locale: string };
}) {
  const initialAwards = await listAwards();
  return <PremiosAdminClient initialAwards={initialAwards} />;
}

