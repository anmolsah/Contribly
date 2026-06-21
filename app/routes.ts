import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("auth", "routes/auth.tsx"),
  route("submit", "routes/submit.tsx"),
  route("dashboard", "routes/dashboard.tsx"),
  route("admin", "routes/admin.tsx"),
  route("hackathon/:id", "routes/hackathon.$id.tsx"),
  route("sitemap.xml", "routes/sitemap.xml.ts"),
] satisfies RouteConfig;
