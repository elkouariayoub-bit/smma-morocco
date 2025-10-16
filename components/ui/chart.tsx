"use client"

import * as React from "react"
import { Legend, ResponsiveContainer, Tooltip } from "recharts"

type RechartsTooltipProps = React.ComponentProps<typeof Tooltip>
type RechartsLegendProps = React.ComponentProps<typeof Legend>
type TooltipPayloadItem = NonNullable<RechartsTooltipProps["payload"]>[number]
type LegendPayloadItem = NonNullable<RechartsLegendProps["payload"]>[number]

import { cn } from "@/lib/utils"

export type ChartConfig = Record<
  string,
  {
    label: string
    color?: string
  }
>

interface ChartContextValue {
  config: ChartConfig
}

const ChartContext = React.createContext<ChartContextValue | null>(null)

function useChartConfig() {
  const context = React.useContext(ChartContext)
  if (!context) {
    throw new Error("Chart components must be used within a <ChartContainer />")
  }
  return context.config
}

interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  config: ChartConfig
  children: React.ReactElement
}

export function ChartContainer({
  className,
  config,
  children,
  style,
  ...props
}: ChartContainerProps) {
  const colorVars = React.useMemo<React.CSSProperties>(() => {
    const vars: Record<string, string> = {
      "--color-desktop": "var(--chart-1)",
      "--color-mobile": "var(--chart-2)",
    }

    for (const [key, value] of Object.entries(config)) {
      if (value.color) {
        vars[`--color-${key}`] = value.color
      }
    }

    return vars as React.CSSProperties
  }, [config])

  return (
    <div
      className={cn("relative flex h-full w-full flex-col", className)}
      style={{ ...colorVars, ...style }}
      {...props}
    >
      <ChartContext.Provider value={{ config }}>
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </ChartContext.Provider>
    </div>
  )
}

export function ChartTooltip(props: RechartsTooltipProps) {
  return <Tooltip animationDuration={150} {...props} />
}

export interface ChartTooltipContentProps {
  active?: boolean
  payload?: RechartsTooltipProps["payload"]
  label?: string
  className?: string
  indicator?: "dot" | "line" | "square"
  labelFormatter?: (value: string) => string
  valueFormatter?: (value: number, name?: string) => string
}

export function ChartTooltipContent({
  active,
  payload,
  label,
  className,
  indicator = "line",
  labelFormatter,
  valueFormatter,
}: ChartTooltipContentProps) {
  const config = useChartConfig()

  const payloadItems = (payload ?? []) as TooltipPayloadItem[]

  if (!active || payloadItems.length === 0) {
    return null
  }

  const formattedLabel = label ? (labelFormatter ? labelFormatter(label) : label) : undefined

  return (
    <div
      className={cn(
        "min-w-[180px] rounded-lg border border-border bg-popover/95 p-3 text-sm shadow-md backdrop-blur",
        className,
      )}
    >
      {formattedLabel && (
        <div className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {formattedLabel}
        </div>
      )}
      <div className="space-y-1">
        {payloadItems.map((item) => {
          const key = typeof item.dataKey === "string" ? item.dataKey : String(item.dataKey)
          const chartMeta = config[key]
          const name = chartMeta?.label ?? item.name ?? key
          const color = chartMeta?.color ?? item.color ?? "var(--foreground)"
          const rawValue = typeof item.value === "number" ? item.value : Number(item.value ?? 0)
          const value = Number.isFinite(rawValue) ? rawValue : 0
          const formattedValue = valueFormatter ? valueFormatter(value, name) : value.toLocaleString()

          return (
            <div key={key} className="flex items-center justify-between gap-3 text-sm">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "inline-flex",
                    indicator === "dot" && "h-2 w-2 rounded-full",
                    indicator === "square" && "h-2.5 w-2.5 rounded-sm",
                    indicator === "line" && "h-2 w-4 rounded-full",
                  )}
                  style={{ backgroundColor: color }}
                />
                <span className="text-muted-foreground">{name}</span>
              </div>
              <span className="font-medium text-foreground">{formattedValue}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function ChartLegend({ wrapperStyle, iconType, verticalAlign, height, ...props }: RechartsLegendProps) {
  return (
    <Legend
      iconType={iconType ?? "circle"}
      verticalAlign={verticalAlign ?? "bottom"}
      height={height ?? 32}
      wrapperStyle={{ paddingTop: 16, ...wrapperStyle }}
      {...props}
    />
  )
}

export type ChartLegendContentProps = RechartsLegendProps

export function ChartLegendContent(props: ChartLegendContentProps) {
  const config = useChartConfig()

  const legendItems = (props.payload ?? []) as LegendPayloadItem[]

  if (legendItems.length === 0) {
    return null
  }

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
      {legendItems.map((item) => {
        const key = typeof item.dataKey === "string" ? item.dataKey : String(item.dataKey)
        const chartMeta = config[key]
        if (!chartMeta) {
          return null
        }

        return (
          <div key={key} className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: chartMeta.color ?? item.color }} />
            <span className="text-muted-foreground">{chartMeta.label}</span>
          </div>
        )
      })}
    </div>
  )
}
