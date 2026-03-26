import InfoPageShell from "@/components/company/info-page-shell";

const ContactUs = () => {
  return (
    <InfoPageShell
      title="Contact Us"
      intro="Need help, want to share feedback, or have a question about Team Sync? Reach out through the details below and we will be happy to connect."
      sections={[
        {
          title: "General inquiries",
          body: [
            "For general product questions, feature suggestions, or collaboration-related discussions, you can contact the Team Sync team by email at support@teamsync.app.",
          ],
        },
        {
          title: "Project support",
          body: [
            "If you are facing issues related to login, workspace access, invites, or project activity, include a short description of the problem and your workspace details so support can help faster.",
          ],
        },
        {
          title: "Response time",
          body: [
            "We aim to respond as quickly as possible on working days. For the fastest help, include your name, your workspace or project name, and the issue you are facing.",
          ],
        },
      ]}
    />
  );
};

export default ContactUs;
