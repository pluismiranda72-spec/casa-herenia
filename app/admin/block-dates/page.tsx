import BlockDatesAdminClient from "./BlockDatesAdminClient";
import { getManualBlockBookings } from "@/app/actions/blockDatesAdmin";

export default async function BlockDatesAdminPage() {
  const initialBlocks = await getManualBlockBookings();
  return <BlockDatesAdminClient initialBlocks={initialBlocks} />;
}
