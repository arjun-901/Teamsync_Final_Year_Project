import LegalPageShell from "@/components/legal/legal-page-shell";

const privacySections = [
  {
    title: "Information We Collect",
    body: [
      "We collect information you provide directly, such as your name, email address, workspace details, task content, project information, and messages created inside Team Sync.",
      "We may also collect technical data such as browser type, device information, IP address, and usage logs to keep the service secure and improve performance.",
    ],
  },
  {
    title: "How We Use Information",
    body: [
      "We use personal information to create accounts, authenticate users, deliver collaboration features, manage workspaces, send important service-related notifications, and support day-to-day product functionality.",
      "Information may also be used to troubleshoot issues, detect abuse, analyze product usage, and improve reliability, security, and user experience.",
    ],
  },
  {
    title: "How We Share Information",
    body: [
      "We do not sell your personal information. Information may be shared with trusted service providers who help us host, secure, or support the platform, but only for legitimate business purposes and under appropriate safeguards.",
      "Information may also be disclosed if required by law, to protect rights and safety, or as part of a merger, acquisition, or business transfer.",
    ],
  },
  {
    title: "Data Retention",
    body: [
      "We keep information for as long as necessary to provide the service, meet legal obligations, resolve disputes, and enforce our agreements.",
      "Workspace administrators may remove content or accounts from their workspace, and some backup or archived records may remain for a limited time where required for security or compliance reasons.",
    ],
  },
  {
    title: "Your Choices",
    body: [
      "You can review or update certain account information through your workspace or profile settings where available. You may also choose to stop using the service at any time.",
      "If you want to request deletion of your account data or have a privacy question, you should contact the relevant workspace administrator or support channel provided for Team Sync.",
    ],
  },
  {
    title: "Security",
    body: [
      "We use reasonable administrative, technical, and organizational measures to protect personal information. However, no method of transmission or storage is completely secure, so we cannot guarantee absolute security.",
    ],
  },
  {
    title: "Policy Updates",
    body: [
      "We may update this Privacy Policy from time to time to reflect product changes, legal obligations, or operational needs. When that happens, we will revise the last updated date on this page.",
    ],
  },
];

const PrivacyPolicy = () => {
  return (
    <LegalPageShell
      title="Privacy Policy"
      lastUpdated="March 26, 2026"
      intro="This policy explains what information Team Sync collects, how it is used, and the choices available to users and workspace administrators."
      sections={privacySections}
    />
  );
};

export default PrivacyPolicy;
