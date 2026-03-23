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
        "shadow-none w-full border",
        tone === "success" && "border-emerald-200 bg-emerald-50/70",
        tone === "warning" && "border-amber-200 bg-amber-50/70",
        tone === "danger" && "border-rose-200 bg-rose-50/70"
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-1">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
        </div>
        {Icon ? <Icon strokeWidth={2.2} className="h-4 w-4 text-muted-foreground" /> : null}
      </CardHeader>
      <CardContent className="w-full">
        <div className="text-3xl font-bold">
          {isLoading ? <Loader className="w-6 h-6 animate-spin" /> : value}
        </div>
        {subtitle ? (
          <p className="mt-2 text-xs text-muted-foreground">{subtitle}</p>
        ) : null}
      </CardContent>
    </Card>
  );
};

export default AnalyticsCard;
