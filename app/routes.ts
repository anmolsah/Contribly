import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("auth", "routes/auth.tsx"),
  route("submit", "routes/submit.tsx"),
  route("dashboard", "routes/dashboard.tsx"),
  route("hackathon/:id", "routes/hackathon.$id.tsx"),
] satisfies RouteConfig;
