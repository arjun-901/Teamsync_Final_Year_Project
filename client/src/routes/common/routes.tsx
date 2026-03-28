import GoogleOAuthFailure from "@/page/auth/GoogleOAuthFailure";
import SignIn from "@/page/auth/Sign-in";
import SignUp from "@/page/auth/Sign-up";
import WorkspaceDashboard from "@/page/workspace/Dashboard";
import Profile from "@/page/workspace/Profile";
import Members from "@/page/workspace/Members";
import ProjectDetails from "@/page/workspace/ProjectDetails";
import ProjectChat from "@/page/workspace/ProjectChat";
import Settings from "@/page/workspace/Settings";
import Tasks from "@/page/workspace/Tasks";
import Meetings from "@/page/meetings";
import MeetingRoom from "@/page/meetings/[meetingId]";
import { AUTH_ROUTES, BASE_ROUTE, PROTECTED_ROUTES } from "./routePaths";
import InviteUser from "@/page/invite/InviteUser";
import ProjectInviteUser from "@/page/invite/ProjectInviteUser";
import TermsOfService from "@/page/legal/TermsOfService";
import PrivacyPolicy from "@/page/legal/PrivacyPolicy";
import Home from "@/page/home/Home";
import AboutUs from "@/page/company/AboutUs";
import ContactUs from "@/page/company/ContactUs";

export const authenticationRoutePaths = [
  { path: AUTH_ROUTES.SIGN_IN, element: <SignIn /> },
  { path: AUTH_ROUTES.SIGN_UP, element: <SignUp /> },
  { path: AUTH_ROUTES.GOOGLE_OAUTH_CALLBACK, element: <GoogleOAuthFailure /> },
];

export const protectedRoutePaths = [
  { path: PROTECTED_ROUTES.WORKSPACE, element: <WorkspaceDashboard /> },
  { path: PROTECTED_ROUTES.PROFILE, element: <Profile /> },
  { path: PROTECTED_ROUTES.TASKS, element: <Tasks /> },
  { path: PROTECTED_ROUTES.MEMBERS, element: <Members /> },
  { path: PROTECTED_ROUTES.SETTINGS, element: <Settings /> },
  { path: PROTECTED_ROUTES.PROJECT_DETAILS, element: <ProjectDetails /> },
  { path: PROTECTED_ROUTES.PROJECT_CHAT, element: <ProjectChat /> },
  { path: PROTECTED_ROUTES.MEETINGS, element: <Meetings /> },
  { path: PROTECTED_ROUTES.MEETING_ROOM, element: <MeetingRoom /> },
];

export const baseRoutePaths = [
  { path: BASE_ROUTE.HOME, element: <Home /> },
  { path: BASE_ROUTE.ABOUT_US, element: <AboutUs /> },
  { path: BASE_ROUTE.CONTACT_US, element: <ContactUs /> },
  { path: BASE_ROUTE.INVITE_URL, element: <InviteUser /> },
  { path: BASE_ROUTE.PROJECT_INVITE_URL, element: <ProjectInviteUser /> },
  { path: BASE_ROUTE.TERMS_OF_SERVICE, element: <TermsOfService /> },
  { path: BASE_ROUTE.PRIVACY_POLICY, element: <PrivacyPolicy /> },
];
