import Logo from "@/components/logo";
import { AUTH_ROUTES, BASE_ROUTE } from "@/routes/common/routePaths";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

const InfoPageShell = (props: {
  title: string;
  intro: string;
  sections: { title: string; body: string[] }[];
}) => {
  const { title, intro, sections } = props;

  return (
    <main className="min-h-svh bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_100%)] px-4 py-8 sm:px-6 md:px-10">
      <div className="mx-auto max-w-4xl space-y-6">
        <header className="flex items-center justify-between rounded-[24px] border border-slate-200 bg-white px-4 py-3 shadow-sm sm:px-5">
          <Logo
            url={BASE_ROUTE.HOME}
            className="flex items-center"
            imageClassName="h-11 w-auto object-contain"
          />
          <Link
            to={AUTH_ROUTES.SIGN_IN}
            className="text-sm text-slate-600 transition-colors hover:text-slate-950"
          >
            Sign in
          </Link>
        </header>

        <Card className="rounded-[30px] border-slate-200 shadow-none">
          <CardHeader className="space-y-3 border-b border-slate-100 pb-6">
            <CardTitle className="text-3xl text-slate-950 sm:text-4xl">
              {title}
            </CardTitle>
            <p className="max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
              {intro}
            </p>
          </CardHeader>
          <CardContent className="space-y-8 p-6 sm:p-8">
            {sections.map((section) => (
              <section key={section.title} className="space-y-3">
                <h2 className="text-lg font-semibold text-slate-900">
                  {section.title}
                </h2>
                <div className="space-y-3 text-sm leading-7 text-slate-600 sm:text-base">
                  {section.body.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </section>
            ))}
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default InfoPageShell;
