import DashboardToolbar from "@/components/dashboard/Toolbar";
import StatCard from "@/components/dashboard/StatCard";
import AreaPanel from "@/components/dashboard/AreaPanel";
import BarPanel from "@/components/dashboard/BarPanel";

// Mock mini-trend data
const trend = (n = 10) =>
  Array.from({ length: n }, (_, i) => ({ v: 80 + Math.sin(i / 1.5) * 20 + Math.random() * 10 }));

export default function DashboardPage() {
  return (
    <main className="p-6 space-y-6">
      <DashboardToolbar />

      {/* KPI Row */}
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="New Subscriptions"
          value="4,682"
          sublabel="Since Last week"
          delta="Details · 15.54% ▲"
          data={trend()}
        />
        <StatCard
          title="New Orders"
          value="1,226"
          sublabel="Since Last week"
          delta="Details · 40.2% ▼"
          data={trend()}
        />
        <StatCard
          title="Avg Order Revenue"
          value="1,080"
          sublabel="Since Last week"
          delta="Details · 10.8% ▲"
          data={trend()}
        />
        <StatCard
          title="Total Revenue"
          value="$15,231.89"
          sublabel="+20.1% from last month"
          data={trend()}
        />
      </section>

      {/* Charts Row */}
      <section className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <AreaPanel />
        </div>
        <div className="lg:col-span-1">
          <BarPanel />
        </div>
      </section>
    </main>
  );
}
