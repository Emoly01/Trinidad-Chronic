import App from "@/components/App";
import { getData } from "@/lib/store";

// The chronicle is shared by everyone at the table and changes whenever
// anyone adds a session/quote/photo — never serve a stale build-time copy.
export const dynamic = "force-dynamic";

export default async function Home() {
  const data = await getData();
  return <App initialData={data} />;
}
