import Logo from "@/components/logo";
import { AUTH_ROUTES, BASE_ROUTE } from "@/routes/common/routePaths";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

type LegalSection = {
  title: string;
  body: string[];
};

const LegalPageShell = (props: {
  title: string;
  lastUpdated: string;
  intro: string;
  sections: LegalSection[];
}) => {
  const { title, lastUpdated, intro, sections } = props;

  return (
    <main className="min-h-svh bg-slate-50 px-6 py-10 md:px-10">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 font-medium text-slate-900">
            <Logo url={BASE_ROUTE.HOME} />
            <Link to={BASE_ROUTE.HOME}>Team Sync.</Link>
          </div>
          <Link
            to={AUTH_ROUTES.SIGN_IN}
            className="text-sm text-slate-600 transition-colors hover:text-slate-900"
          >
            Back to sign in
          </Link>
        </div>

        <Card className="border-slate-200 shadow-none">
          <CardHeader className="space-y-3 border-b border-slate-100 pb-6">
            <p className="text-sm font-medium text-slate-500">
              Last updated {lastUpdated}
            </p>
            <CardTitle className="text-3xl leading-tight text-slate-950">
              {title}
            </CardTitle>
            <p className="max-w-3xl text-sm leading-6 text-slate-600">
              {intro}
            </p>
          </CardHeader>
          <CardContent className="space-y-8 p-6 md:p-8">
            {sections.map((section) => (
              <section key={section.title} className="space-y-3">
                <h2 className="text-lg font-semibold text-slate-900">
                  {section.title}
                </h2>
                <div className="space-y-3 text-sm leading-6 text-slate-600">
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

export default LegalPageShell;
