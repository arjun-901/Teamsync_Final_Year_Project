import Logo from "@/components/logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import useAuth from "@/hooks/api/use-auth";
import { AUTH_ROUTES, BASE_ROUTE } from "@/routes/common/routePaths";
import {
  ArrowRight,
  CalendarRange,
  CheckCircle2,
  LayoutDashboard,
  MessageSquareText,
  MoreVertical,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const featureItems = [
  {
    title: "Unified workspace control",
    description:
      "Bring projects, tasks, members, and delivery health into one clean operating layer.",
    icon: LayoutDashboard,
  },
  {
    title: "Fast team collaboration",
    description:
      "Keep discussions, updates, and coordination moving with built-in project communication.",
    icon: MessageSquareText,
  },
  {
    title: "Meeting-ready execution",
    description:
      "Plan reviews, standups, and working sessions without leaving the same workspace flow.",
    icon: CalendarRange,
  },
  {
    title: "Secure role-based access",
    description:
      "Control who can view, manage, or update work with clear workspace permissions.",
    icon: ShieldCheck,
  },
];

const stats = [
  { value: "Projects", label: "Organize work across teams" },
  { value: "Tasks", label: "Track priorities in real time" },
  { value: "Members", label: "Collaborate with the whole team" },
];

const testimonials = [
  {
    quote:
      "Team Sync gave our final-year project one place for tasks, meetings, and real ownership. We stopped chasing updates in chats.",
    name: "Aarav Sharma",
    role: "Project Lead",
  },
  {
    quote:
      "The dashboard makes it easy to see what is blocked, what is due next, and who needs support without digging through multiple tools.",
    name: "Riya Patel",
    role: "Frontend Developer",
  },
  {
    quote:
      "It feels simple for daily work but still gives enough structure for serious team execution.",
    name: "Kabir Mehta",
    role: "Product Coordinator",
  },
];

const Home = () => {
  const { data: authData, isLoading } = useAuth();
  const user = authData?.user;
  const currentWorkspace =
    typeof user?.currentWorkspace === "string"
      ? user.currentWorkspace
      : user?.currentWorkspace?._id;
  const dashboardPath = currentWorkspace
    ? `/workspace/${currentWorkspace}`
    : AUTH_ROUTES.SIGN_IN;

  return (
    <main className="min-h-svh bg-[radial-gradient(circle_at_top_left,_rgba(249,115,22,0.14),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(14,165,233,0.16),_transparent_30%),linear-gradient(180deg,#fffdf8_0%,#fff 42%,#f8fafc_100%)] text-slate-950">
      <section className="px-3 pb-8 pt-3 sm:px-6 sm:pb-12 sm:pt-4 md:px-10 lg:px-16">
        <div className="mx-auto flex min-h-svh max-w-7xl flex-col">
          <header className="flex items-center justify-between rounded-[20px] border border-orange-200/80 bg-slate-200/90 px-3 py-2 shadow-[0_20px_60px_rgba(15,23,42,0.08)] ring-1 ring-sky-200/70 backdrop-blur sm:rounded-[24px] sm:px-5 sm:py-2.5 md:bg-slate-200/80">
            <Logo
              url={BASE_ROUTE.HOME}
              className="flex items-center"
              imageClassName="h-8 w-auto object-contain sm:h-10"
            />

            <nav className="hidden flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-600 sm:text-sm md:flex">
              <Link
                to={BASE_ROUTE.ABOUT_US}
                className="transition-colors hover:text-slate-950"
              >
                About Us
              </Link>
              <Link
                to={BASE_ROUTE.CONTACT_US}
                className="transition-colors hover:text-slate-950"
              >
                Contact Us
              </Link>
              {user ? (
                <Link to={dashboardPath}>
                  <Button className="h-8 rounded-full bg-slate-950 px-4 text-xs text-white hover:bg-slate-800 sm:h-10 sm:px-5 sm:text-sm">
                    Go to dashboard
                  </Button>
                </Link>
              ) : (
                !isLoading && (
                  <>
                    <Link to={AUTH_ROUTES.SIGN_IN}>
                      <Button variant="ghost" className="h-8 rounded-full px-3 text-xs sm:h-10 sm:text-sm">
                        Sign in
                      </Button>
                    </Link>
                    <Link to={AUTH_ROUTES.SIGN_UP}>
                      <Button className="h-8 rounded-full bg-slate-950 px-4 text-xs text-white hover:bg-slate-800 sm:h-10 sm:px-5 sm:text-sm">
                        Get started
                      </Button>
                    </Link>
                  </>
                )
              )}
            </nav>

            <div className="flex items-center md:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="flex size-9 items-center justify-center rounded-full border-slate-300 bg-white shadow-sm"
                  >
                    <MoreVertical className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52 rounded-2xl p-2">
                  <DropdownMenuItem asChild>
                    <Link to={BASE_ROUTE.ABOUT_US}>About Us</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to={BASE_ROUTE.CONTACT_US}>Contact Us</Link>
                  </DropdownMenuItem>
                  {user ? (
                    <DropdownMenuItem asChild>
                      <Link to={dashboardPath}>Go to dashboard</Link>
                    </DropdownMenuItem>
                  ) : (
                    !isLoading && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link to={AUTH_ROUTES.SIGN_IN}>Sign in</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to={AUTH_ROUTES.SIGN_UP}>Get started</Link>
                        </DropdownMenuItem>
                      </>
                    )
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          <div className="flex flex-1 items-center py-8 sm:py-14">
            <div className="w-full space-y-6 text-center">
              <Badge className="mx-auto inline-flex rounded-full border border-orange-300/80 bg-orange-100 px-2.5 py-1 text-[11px] text-orange-700 hover:bg-orange-100 sm:px-4 sm:py-1.5 sm:text-sm">
                <Sparkles className="mr-1.5 size-3.5 sm:size-4" />
                Built for focused team execution
              </Badge>

              <div className="mx-auto max-w-full space-y-4">
                <h1 className="text-2xl text-center font-semibold leading-[1.08] tracking-tight sm:text-3xl md:text-4xl lg:text-5xl">
                  Manage projects, tasks, meetings, and momentum in one beautiful workspace.
                </h1>
                <p className="mx-auto max-w-3xl text-sm leading-6 text-slate-600 sm:text-base sm:leading-8">
                  Team Sync helps student teams and modern project groups stay aligned
                  with clear ownership, faster collaboration, and real-time visibility
                  into progress.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center">
                {user ? (
                  <>
                    <Link to={dashboardPath}>
                      <Button className="h-10 w-full rounded-full bg-slate-950 px-5 text-sm text-white hover:bg-slate-800 sm:h-11 sm:w-auto sm:px-6">
                        Open dashboard
                        <ArrowRight className="ml-2 size-4" />
                      </Button>
                    </Link>
                    <div className="flex min-h-10 items-center rounded-full border border-slate-200 bg-white px-4 text-xs text-slate-600 sm:min-h-11 sm:px-5 sm:text-sm">
                      Signed in as {user.name || user.email}
                    </div>
                  </>
                ) : (
                  !isLoading && (
                    <>
                      <Link to={AUTH_ROUTES.SIGN_UP}>
                        <Button className="h-10 w-full rounded-full bg-slate-950 px-5 text-sm text-white hover:bg-slate-800 sm:h-11 sm:w-auto sm:px-6">
                          Start for free
                          <ArrowRight className="ml-2 size-4" />
                        </Button>
                      </Link>
                      <Link to={AUTH_ROUTES.SIGN_IN}>
                        <Button
                          variant="outline"
                          className="h-10 w-full rounded-full border-slate-300 bg-white px-5 text-sm sm:h-11 sm:w-auto sm:px-6"
                        >
                          Sign in to workspace
                        </Button>
                      </Link>
                    </>
                  )
                )}
              </div>

              <div className="grid gap-3 pt-2 sm:grid-cols-2 lg:grid-cols-3">
                {stats.map((item, index) => (
                  <div
                    key={item.value}
                    className={cn(
                      "rounded-[20px] border bg-white/85 p-3 shadow-sm sm:rounded-[24px] sm:p-5",
                      index % 3 === 0 && "border-orange-200",
                      index % 3 === 1 && "border-sky-200",
                      index % 3 === 2 && "border-emerald-200"
                    )}
                  >
                    <p className="text-sm font-semibold text-slate-900 sm:text-lg">
                      {item.value}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm sm:leading-6">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="px-3 py-10 sm:px-6 sm:py-16 md:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-orange-600">
              Features
            </p>
            <h2 className="text-2xl font-semibold tracking-tight md:text-4xl">
              Everything your team needs to stay aligned and ship with confidence.
            </h2>
            <p className="text-sm leading-6 text-slate-600 sm:text-base sm:leading-7">
              Designed for collaborative workspaces that need visibility without
              complexity.
            </p>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {featureItems.map((feature, index) => {
              const Icon = feature.icon;

              return (
                <Card
                  key={feature.title}
                  className={cn(
                    "rounded-[22px] border bg-white/80 shadow-none transition-transform duration-300 hover:-translate-y-1 sm:rounded-[28px]",
                    index % 4 === 0 && "border-orange-200",
                    index % 4 === 1 && "border-sky-200",
                    index % 4 === 2 && "border-emerald-200",
                    index % 4 === 3 && "border-violet-200"
                  )}
                >
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-slate-950 text-white sm:size-12 sm:rounded-2xl">
                      <Icon className="size-4 sm:size-5" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-slate-900 sm:mt-5 sm:text-xl">
                      {feature.title}
                    </h3>
                    <p className="mt-2 text-xs leading-6 text-slate-600 sm:mt-3 sm:text-sm sm:leading-7">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-3 py-10 sm:px-6 sm:py-16 md:px-10 lg:px-16">
        <div className="mx-auto grid max-w-7xl gap-5 rounded-[26px] border border-sky-200 bg-[linear-gradient(135deg,#fff7ed_0%,#ffffff_55%,#eff6ff_100%)] p-5 shadow-sm sm:rounded-[36px] sm:p-8 lg:grid-cols-[0.9fr_1.1fr] lg:p-10">
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-700">
              Why teams choose us
            </p>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Turn scattered work into a clear system everyone can trust.
            </h2>
            <p className="text-sm leading-6 text-slate-600 sm:text-base sm:leading-7">
              Team Sync keeps planning, updates, and delivery insight close together
              so your team can spend less time coordinating and more time building.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              "Clean workspace dashboard",
              "Project-wise task tracking",
              "Invites and member management",
              "Meeting coordination in context",
            ].map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-white/80 bg-white/80 p-4 text-xs font-medium text-slate-700 shadow-sm sm:rounded-3xl sm:p-5 sm:text-sm"
              >
                <CheckCircle2 className="mb-2 size-4 text-emerald-500 sm:mb-3 sm:size-5" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="testimonials" className="px-3 py-10 sm:px-6 sm:py-16 md:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-orange-600">
              Testimonials
            </p>
            <h2 className="text-2xl font-semibold tracking-tight md:text-4xl">
              Teams love the clarity they get from one shared workspace.
            </h2>
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {testimonials.map((item, index) => (
              <Card
                key={item.name}
                className={cn(
                  "rounded-[22px] bg-slate-900 text-white shadow-none sm:rounded-[28px]",
                  index % 3 === 0 && "border-orange-300/60",
                  index % 3 === 1 && "border-sky-300/60",
                  index % 3 === 2 && "border-emerald-300/60"
                )}
              >
                <CardContent className="p-4 sm:p-6">
                  <p className="text-sm leading-7 text-slate-100 sm:text-base sm:leading-8">
                    &ldquo;{item.quote}&rdquo;
                  </p>
                  <div className="mt-6 sm:mt-8">
                    <p className="text-sm font-semibold sm:text-base">{item.name}</p>
                    <p className="text-xs text-slate-300 sm:text-sm">{item.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="px-3 pb-12 pt-4 sm:px-6 sm:pb-20 sm:pt-8 md:px-10 lg:px-16">
        <div className="mx-auto max-w-5xl rounded-[24px] border border-violet-300/40 bg-slate-950 px-5 py-8 text-center text-white shadow-[0_30px_90px_rgba(15,23,42,0.18)] sm:rounded-[36px] sm:px-8 sm:py-10 md:px-12 md:py-14">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-orange-300">
            Ready to start
          </p>
          <h2 className="mt-4 text-2xl font-semibold tracking-tight md:text-4xl">
            Build a more organized, more collaborative workspace with Team Sync.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base sm:leading-7">
            Launch your workspace, invite your team, and manage everything from one
            place.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            {user ? (
              <Link to={dashboardPath}>
                <Button className="h-10 rounded-full bg-white px-5 text-slate-950 hover:bg-slate-100 sm:h-12 sm:px-6">
                  Go to dashboard
                </Button>
              </Link>
            ) : (
              !isLoading && (
                <>
                  <Link to={AUTH_ROUTES.SIGN_UP}>
                    <Button className="h-10 rounded-full bg-white px-5 text-slate-950 hover:bg-slate-100 sm:h-12 sm:px-6">
                      Create account
                    </Button>
                  </Link>
                  <Link to={AUTH_ROUTES.SIGN_IN}>
                    <Button
                      variant="outline"
                      className="h-10 rounded-full border-white/20 bg-transparent px-5 text-white hover:bg-white/10 hover:text-white sm:h-12 sm:px-6"
                    >
                      Go to sign in
                    </Button>
                  </Link>
                </>
              )
            )}
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200/80 bg-white/70 px-3 py-4 backdrop-blur sm:px-6 sm:py-5 md:px-10 lg:px-16">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 text-center text-xs text-slate-600 sm:flex-row sm:gap-3 sm:text-left sm:text-sm">
          <p>© 2026 Team Sync. Built for organized teamwork.</p>
          <div className="flex items-center gap-4">
            <Link
              to={BASE_ROUTE.TERMS_OF_SERVICE}
              className="transition-colors hover:text-slate-950"
            >
              Terms
            </Link>
            <Link
              to={BASE_ROUTE.PRIVACY_POLICY}
              className="transition-colors hover:text-slate-950"
            >
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
};

export default Home;
