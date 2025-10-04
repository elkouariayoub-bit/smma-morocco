import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export const revalidate = 3600; // Revalidate hourly

export default async function AnalyticsPage() {
		const supabase = createServerComponentClient({ cookies });
		const { data } = await supabase
				.from('analytics_snapshots')
				.select('impressions, likes, comments');
    
		const totals = (data || []).reduce((acc, r) => ({
				impressions: acc.impressions + (r.impressions ?? 0),
				likes: acc.likes + (r.likes ?? 0),
				comments: acc.comments + (r.comments ?? 0),
		}), { impressions: 0, likes: 0, comments: 0 });
    
		const metrics = [
				{ label: 'Impressions', v: totals.impressions },
				{ label: 'Likes', v: totals.likes },
				{ label: 'Comments', v: totals.comments }
		];

	return (
		<div className="grid md:grid-cols-3 gap-4">
			{metrics.map((m) => (
				<Card key={m.label}>
						<CardHeader>
								<CardTitle className="text-base font-medium text-gray-600">{m.label}</CardTitle>
						</CardHeader>
						<CardContent>
								<div className="text-3xl font-bold">{m.v.toLocaleString()}</div>
						</CardContent>
				</Card>
			))}
		</div>
	);
}
