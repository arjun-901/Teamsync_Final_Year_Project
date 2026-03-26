import InfoPageShell from "@/components/company/info-page-shell";

const AboutUs = () => {
  return (
    <InfoPageShell
      title="About Us"
      intro="Team Sync is built to help teams manage projects, tasks, meetings, and communication from one focused workspace. The goal is simple: reduce confusion, improve visibility, and make collaboration feel smooth."
      sections={[
        {
          title: "What Team Sync does",
          body: [
            "Team Sync brings together workspace management, project tracking, task execution, and team coordination in one place. Instead of switching between disconnected tools, teams can work from a single shared system.",
            "The platform is especially useful for student teams, startup groups, and collaborative project environments that need structure without too much complexity.",
          ],
        },
        {
          title: "Why it was created",
          body: [
            "Many teams struggle with scattered updates, unclear ownership, and missed follow-ups. Team Sync was created to solve that by giving every team a clear place to plan, assign, and track work.",
            "The product focuses on practical execution so teams can spend less time managing tools and more time actually building.",
          ],
        },
        {
          title: "Our approach",
          body: [
            "We care about clean design, simple workflows, and features that support real teamwork. Every screen is meant to make priorities easier to understand and actions easier to take.",
          ],
        },
      ]}
    />
  );
};

export default AboutUs;
