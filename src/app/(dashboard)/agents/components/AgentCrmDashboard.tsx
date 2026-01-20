"use client";

import * as React from "react";
import { Download, Calendar, Plus, ChevronDown } from "lucide-react";
import { Label, Pie, PieChart } from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

const stats = [
  { label: "Total Customers", value: "1890", delta: "+10.4% from last month" },
  { label: "Total Deals", value: "1,02,890", delta: "-0.8% from last month" },
  { label: "Total Revenue", value: "$435,578", delta: "+20.1% from last month" },
];

const leadSources = [
  { label: "SOCIAL", value: 275, color: "bg-gray-900" },
  { label: "EMAIL", value: 200, color: "bg-gray-400" },
  { label: "CALL", value: 287, color: "bg-gray-700" },
  { label: "OTHERS", value: 173, color: "bg-gray-300" },
];

const chartData = [
  { browser: "chrome", visitors: 275, fill: "var(--color-chrome)" },
  { browser: "safari", visitors: 200, fill: "var(--color-safari)" },
  { browser: "firefox", visitors: 287, fill: "var(--color-firefox)" },
  { browser: "edge", visitors: 173, fill: "var(--color-edge)" },
  { browser: "other", visitors: 190, fill: "var(--color-other)" },
];

const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  chrome: {
    label: "Chrome",
    color: "#93c5fd",
  },
  safari: {
    label: "Safari",
    color: "#3b82f6",
  },
  firefox: {
    label: "Firefox",
    color: "#2563eb",
  },
  edge: {
    label: "Edge",
    color: "#1d4ed8",
  },
  other: {
    label: "Other",
    color: "#1e40af",
  },
} satisfies ChartConfig;

const tasks = [
  {
    title: "Follow up with Acme Inc.",
    description: "Send proposal and schedule meeting",
    level: "High",
    due: "Due Today",
    color: "bg-red-100 text-red-600",
  },
  {
    title: "Prepare quarterly report",
    description: "Compile sales data and forecasts",
    level: "Medium",
    due: "Due Tomorrow",
    color: "bg-amber-100 text-amber-600",
  },
  {
    title: "Update customer profiles",
    description: "Verify contact information and preferences",
    level: "Low",
    due: "Due Oct 15",
    color: "bg-emerald-100 text-emerald-600",
  },
];

const pipeline = [
  { label: "Lead", deals: "235 deals", amount: "$420,500", percent: 38 },
  { label: "Qualified", deals: "146 deals", amount: "$267,800", percent: 24 },
  { label: "Proposal", deals: "84 deals", amount: "$192,400", percent: 18 },
  { label: "Negotiation", deals: "52 deals", amount: "$129,600", percent: 12 },
  { label: "Closed Won", deals: "36 deals", amount: "$87,200", percent: 8 },
];

const leads = [
  { status: "Success", email: "ken99@yahoo.com", amount: "$316.00" },
  { status: "Success", email: "abe45@gmail.com", amount: "$242.00" },
  { status: "Processing", email: "monserrat44@gmail.com", amount: "$837.00" },
  { status: "Success", email: "silas22@gmail.com", amount: "$874.00" },
  { status: "Failed", email: "carmella@hotmail.com", amount: "$721.00" },
];

export default function AgentCrmDashboard() {
  const totalVisitors = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.visitors, 0);
  }, []);

  return (
    <section className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#0b0f14] dark:text-slate-100">
      <div className="flex w-full flex-col gap-6 px-6 py-6">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 dark:border-slate-800 dark:bg-[#151515] dark:text-slate-200">
              ⌘
            </button>
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-500 dark:border-slate-800 dark:bg-[#151515] dark:text-slate-400">
              <span>Search...</span>
              <span className="rounded border border-slate-200 px-1.5 text-[10px] dark:border-slate-700">K</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
            <span className="text-xs">19 Dec 2025 - 15 Jan 2026</span>
            <button className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 dark:border-slate-800 dark:bg-[#151515] dark:text-slate-200">
              <Download className="h-4 w-4" />
              Download
            </button>
          </div>
        </header>

        <h1 className="text-2xl font-semibold">CRM Dashboard</h1>

        <section className="grid gap-4 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 text-slate-900 dark:border-slate-800 dark:bg-[#151515] dark:text-slate-100">
            <h2 className="text-sm font-semibold">Your target is incomplete</h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              You have completed <span className="font-medium text-orange-500">48%</span> of the
              given target, you can also check your status
            </p>
            <div className="mt-4 h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800">
              <div className="h-full w-[48%] rounded-full bg-slate-900 dark:bg-slate-200" />
            </div>
          </div>
          {stats.map((item) => (
            <div key={item.label} className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-[#151515]">
              <p className="text-xs text-slate-500 dark:text-slate-400">{item.label}</p>
              <div className="mt-2 text-2xl font-semibold">{item.value}</div>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{item.delta}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.2fr_1fr_1.2fr]">
          <Card className="border-slate-200 bg-white text-slate-900 shadow-none dark:border-slate-800 dark:bg-[#151515] dark:text-slate-100">
            <CardHeader className="items-center pb-0">
              <CardTitle>Pie Chart - Donut with Text</CardTitle>
              <CardDescription className="text-slate-500 dark:text-slate-400">January - June 2024</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
              <ChartContainer
                config={chartConfig}
                className="mx-auto h-[260px] w-full max-w-[260px]"
              >
                <PieChart>
                  <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                  <Pie
                    data={chartData}
                    dataKey="visitors"
                    nameKey="browser"
                    innerRadius={60}
                    strokeWidth={5}
                  >
                    <Label
                      content={({ viewBox }) => {
                        if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                          return (
                            <text
                              x={viewBox.cx}
                              y={viewBox.cy}
                              textAnchor="middle"
                              dominantBaseline="middle"
                            >
                              <tspan
                                x={viewBox.cx}
                                y={viewBox.cy}
                                className="fill-slate-900 text-3xl font-bold dark:fill-slate-100"
                              >
                                {totalVisitors.toLocaleString()}
                              </tspan>
                              <tspan
                                x={viewBox.cx}
                                y={(viewBox.cy || 0) + 24}
                                className="fill-slate-500 dark:fill-slate-400"
                              >
                                Visitors
                              </tspan>
                            </text>
                          );
                        }
                      }}
                    />
                  </Pie>
                </PieChart>
              </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col gap-2 text-sm">
              <div className="flex items-center gap-2 leading-none font-medium text-slate-900 dark:text-slate-100">
                Trending up by 5.2% this month
              </div>
              <div className="text-slate-500 leading-none dark:text-slate-400">
                Showing total visitors for the last 6 months
              </div>
            </CardFooter>
          </Card>

          <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-[#151515]">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold">Tasks</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Track and manage your upcoming tasks.</p>
              </div>
              <button className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-600 dark:border-slate-700 dark:text-slate-300">
                <Plus className="h-3 w-3" />
                Add Task
              </button>
            </div>
            <div className="mt-4 space-y-3">
              {tasks.map((task) => (
                <div key={task.title} className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
                  <div className="flex items-start gap-3">
                    <input type="checkbox" className="mt-1 h-4 w-4" />
                    <div>
                      <p className="text-sm font-semibold">{task.title}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{task.description}</p>
                      <div className="mt-2 flex items-center gap-2 text-xs">
                        <span className={`rounded-full px-2 py-0.5 ${task.color}`}>{task.level}</span>
                        <span className="text-slate-400 dark:text-slate-500">{task.due}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-[#151515]">
            <h3 className="text-sm font-semibold">Sales Pipeline</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Current deals in your sales pipeline.</p>
            <div className="mt-4 h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800">
              <div className="h-full w-[62%] rounded-full bg-slate-900 dark:bg-slate-200" />
            </div>
            <div className="mt-4 space-y-3">
              {pipeline.map((item) => (
                <div key={item.label} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-semibold">{item.label}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {item.deals} · {item.amount}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-20 rounded-full bg-slate-100 dark:bg-slate-800">
                      <div className="h-full rounded-full bg-slate-400 dark:bg-slate-600" style={{ width: `${item.percent}%` }} />
                    </div>
                    <span className="text-xs text-slate-400 dark:text-slate-500">{item.percent}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-[#151515]">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Leads</h3>
            <div className="flex items-center gap-2">
              <input
                placeholder="Filter leads..."
                className="h-8 rounded-md border border-slate-200 bg-transparent px-2 text-xs text-slate-600 placeholder:text-slate-400 dark:border-slate-700 dark:text-slate-300 dark:placeholder:text-slate-500"
              />
              <button className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-600 dark:border-slate-700 dark:text-slate-300">
                Columns
                <ChevronDown className="h-3 w-3" />
              </button>
            </div>
          </div>
          <div className="mt-4 overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.map((lead) => (
                  <TableRow key={lead.email}>
                    <TableCell>{lead.status}</TableCell>
                    <TableCell className="text-slate-500 dark:text-slate-400">{lead.email}</TableCell>
                    <TableCell>{lead.amount}</TableCell>
                    <TableCell className="text-right text-slate-400 dark:text-slate-500">Open menu</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="mt-2 text-xs text-slate-400 dark:text-slate-500">0 of 5 row(s) selected.</div>
        </section>
      </div>
    </section>
  );
}
