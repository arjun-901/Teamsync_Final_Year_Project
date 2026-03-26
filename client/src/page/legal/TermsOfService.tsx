import LegalPageShell from "@/components/legal/legal-page-shell";

const termsSections = [
  {
    title: "Acceptance of Terms",
    body: [
      "By creating an account, accessing, or using Team Sync, you agree to follow these Terms of Service and all applicable laws. If you do not agree, please do not use the service.",
      "If you use Team Sync on behalf of a company, team, or organization, you confirm that you have authority to accept these terms for that entity.",
    ],
  },
  {
    title: "Use of the Service",
    body: [
      "Team Sync is provided to help teams manage workspaces, projects, tasks, meetings, and collaboration. You agree to use the platform only for lawful purposes and in a way that does not harm the service or other users.",
      "You must not attempt to gain unauthorized access, upload harmful code, disrupt system performance, or misuse invitations, roles, or communication features.",
    ],
  },
  {
    title: "Accounts and Security",
    body: [
      "You are responsible for maintaining the confidentiality of your account credentials and for activity that occurs under your account.",
      "If you believe your account has been accessed without permission, you should notify the workspace administrator or support team as soon as possible.",
    ],
  },
  {
    title: "Workspace Content",
    body: [
      "Your team retains ownership of the content you upload or create in Team Sync, including tasks, project details, comments, and files.",
      "You grant us a limited right to host, process, and display that content only as needed to operate, maintain, and improve the service.",
    ],
  },
  {
    title: "Availability and Changes",
    body: [
      "We may update, improve, suspend, or remove parts of the service from time to time. We aim to provide a reliable experience, but we do not guarantee uninterrupted or error-free availability at all times.",
      "We may also update these terms when the product or legal requirements change. Continued use after an update means you accept the revised terms.",
    ],
  },
  {
    title: "Termination",
    body: [
      "We may suspend or terminate access if these terms are violated, if misuse creates risk for the platform or other users, or if an account becomes inactive for an extended period.",
      "You may stop using Team Sync at any time. Provisions that reasonably should survive termination, such as ownership, disclaimers, and limitation of liability, will continue to apply.",
    ],
  },
  {
    title: "Disclaimer and Liability",
    body: [
      "Team Sync is provided on an as-is and as-available basis. To the fullest extent permitted by law, we disclaim warranties of merchantability, fitness for a particular purpose, and non-infringement.",
      "We are not liable for indirect, incidental, special, consequential, or punitive damages, or for loss of data, profits, or business opportunities resulting from use of the service.",
    ],
  },
];

const TermsOfService = () => {
  return (
    <LegalPageShell
      title="Terms of Service"
      lastUpdated="March 26, 2026"
      intro="These terms explain the rules for using Team Sync and the responsibilities shared between the platform, workspace owners, and members."
      sections={termsSections}
    />
  );
};

export default TermsOfService;
