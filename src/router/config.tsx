import type { RouteObject } from "react-router-dom";
import { Navigate } from "react-router-dom";
import NotFound from "../pages/NotFound";
import Home from "../pages/home/page";
import AiCourse from "../pages/ai-course/page";
import CourseCreate from "../pages/course-create/page";
import MicroCourse from "../pages/micro-course/page";
import UserManagement from "../pages/system/users/page";
import KnowledgeExtraction from "../pages/knowledge-extraction/page";
import RequireAuth from "./RequireAuth";

const routes: RouteObject[] = [
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/dashboard",
    element: (
      <RequireAuth>
        <Navigate to="/ai-course" replace />
      </RequireAuth>
    ),
  },
  {
    path: "/ai-course",
    element: (
      <RequireAuth>
        <AiCourse />
      </RequireAuth>
    ),
  },
  {
    path: "/course/create",
    element: (
      <RequireAuth>
        <CourseCreate />
      </RequireAuth>
    ),
  },
  {
    path: "/micro-course",
    element: (
      <RequireAuth>
        <MicroCourse />
      </RequireAuth>
    ),
  },
  {
    path: "/knowledge-extraction",
    element: (
      <RequireAuth>
        <KnowledgeExtraction />
      </RequireAuth>
    ),
  },
  /** 常见误输入：下划线 → 连字符 */
  {
    path: "/knowledge_extraction",
    element: (
      <RequireAuth>
        <Navigate to="/knowledge-extraction" replace />
      </RequireAuth>
    ),
  },
  {
    path: "/system/users",
    element: (
      <RequireAuth>
        <UserManagement />
      </RequireAuth>
    ),
  },
  {
    path: "*",
    element: <NotFound />,
  },
];

export default routes;
