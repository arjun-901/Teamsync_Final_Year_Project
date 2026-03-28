import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon, Loader } from "lucide-react";
import { cn } from "@/lib/utils";

const AnalyticsCard = (props: {
  title: string;
  value: number;
  isLoading: boolean;
  subtitle?: string;
  icon?: LucideIcon;
  tone?: "default" | "success" | "warning" | "danger";
}) => {
  const {
    title,
    value,
    isLoading,
    subtitle,
    icon: Icon,
    tone = "default",
  } = props;

  return (
    <Card
      className={cn(
        "w-full rounded-xl border shadow-none transition-all duration-200 hover:scale-[1.02] hover:shadow-lg",
        "bg-white",
        tone === "default" && "border-slate-200",
        tone === "success" && "border-emerald-300",
        tone === "warning" && "border-amber-300",
        tone === "danger" && "border-rose-300"
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 px-3.5 pb-1 pt-2.5">
        <div className="flex items-center gap-1">
          <CardTitle className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
            {title}
          </CardTitle>
        </div>
        {Icon ? (
          <Icon
            strokeWidth={2.2}
            className="h-3 w-3 text-muted-foreground"
          />
        ) : null}
      </CardHeader>
      <CardContent className="w-full px-3.5 pb-2.5 pt-0">
        <div className="text-xl font-semibold leading-none text-slate-900">
          {isLoading ? <Loader className="h-4 w-4 animate-spin" /> : value}
        </div>
        {subtitle ? (
          <p className="mt-1 text-[11px] text-muted-foreground">{subtitle}</p>
        ) : null}
      </CardContent>
    </Card>
  );
};

export default AnalyticsCard;
