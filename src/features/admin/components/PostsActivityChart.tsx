import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface ChartDataPoint {
  date: string;
  posts: number;
}

interface PostsActivityChartProps {
  data: ChartDataPoint[];
}

export function PostsActivityChart({ data }: PostsActivityChartProps) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="postsGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#F15B29" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#F15B29" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 12, fill: "#9ca3af" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 12, fill: "#9ca3af" }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{
            borderRadius: "16px",
            border: "1px solid #f3f4f6",
            fontSize: "13px",
            boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
          }}
          labelStyle={{ fontWeight: 700, color: "#111827" }}
        />
        <Area
          type="monotone"
          dataKey="posts"
          name="Bài viết"
          stroke="#F15B29"
          strokeWidth={2.5}
          fill="url(#postsGradient)"
          dot={{ fill: "#F15B29", strokeWidth: 0, r: 4 }}
          activeDot={{ r: 6, fill: "#F15B29", strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
