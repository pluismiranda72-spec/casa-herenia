import BlockDatesAdminClient from "./BlockDatesAdminClient";
import { getManualBlockBookings } from "@/app/actions/blockDatesAdmin";

export default async function Page({
  params: _params,
}: {
  params: { locale: string };
}) {
  const initialBlocks = await getManualBlockBookings();
  return <BlockDatesAdminClient initialBlocks={initialBlocks} />;
}
