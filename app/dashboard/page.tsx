import { auth } from "@/lib/auth";

export const metadata = {
  title: "Dashboard | Make It Possible",
};

export default async function DashboardPage() {
  const session = await auth();

  return (
    <div className="px-8 py-12">
      <div className="rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
        <h1 className="text-3xl font-semibold text-slate-900">Welcome back, {session?.user?.name ?? "Leader"}</h1>
        <p className="mt-3 text-slate-500">
          This is a protected area. Plug in your dashboards, AI copilots, and workflows here.
        </p>
        <form action="/api/auth/signout" method="post" className="mt-6">
          <button
            type="submit"
            className="rounded-xl bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Log out
          </button>
        </form>
      </div>
    </div>
  );
}
