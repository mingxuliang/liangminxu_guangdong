import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";
import AutoImport from "unplugin-auto-import/vite";
// import { readdyJsxRuntimeProxyPlugin } from "./vite.jsx-runtime-proxy";

const base = process.env.BASE_PATH || "/";
const isPreview = process.env.IS_PREVIEW ? true : false;
//const proxyPlugins = isPreview ? [readdyJsxRuntimeProxyPlugin()] : [];
// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const difyProxyTarget =
    env.DIFY_PROXY_TARGET || "https://api.dify.ai";
  const islideProxyTarget =
    env.ISLIDE_PROXY_TARGET || "https://islide.market.alicloudapi.com";
  const apiProxyTarget =
    env.VITE_API_PROXY_TARGET || "http://127.0.0.1:8787";

  return {
  define: {
    __BASE_PATH__: JSON.stringify(base),
    __IS_PREVIEW__: JSON.stringify(isPreview),
    __READDY_PROJECT_ID__: JSON.stringify(process.env.PROJECT_ID || ""),
    __READDY_VERSION_ID__: JSON.stringify(process.env.VERSION_ID || ""),
    __READDY_AI_DOMAIN__: JSON.stringify(process.env.READDY_AI_DOMAIN || ""),
  },
  plugins: [
    // ...proxyPlugins,
    react(),
    AutoImport({
      imports: [
        {
          react: [
            ["default", "React"],
            "useState",
            "useEffect",
            "useContext",
            "useReducer",
            "useCallback",
            "useMemo",
            "useRef",
            "useImperativeHandle",
            "useLayoutEffect",
            "useDebugValue",
            "useDeferredValue",
            "useId",
            "useInsertionEffect",
            "useSyncExternalStore",
            "useTransition",
            "startTransition",
            "lazy",
            "memo",
            "forwardRef",
            "createContext",
            "createElement",
            "cloneElement",
            "isValidElement",
          ],
        },
        {
          "react-router-dom": [
            "useNavigate",
            "useLocation",
            "useParams",
            "useSearchParams",
            "Link",
            "NavLink",
            "Navigate",
            "Outlet",
          ],
        },
        // React i18n
        {
          "react-i18next": ["useTranslation", "Trans"],
        },
      ],
      dts: true,
    }),
  ],
  base,
  build: {
    sourcemap: true,
    outDir: 'out',
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
    host: "0.0.0.0",
    proxy: {
      /** 知识萃取等本地 BFF：/api → Node server（见 server/index.mjs） */
      "/api": {
        target: apiProxyTarget,
        changeOrigin: true,
        /** 知识萃取 Step2/3 会长时间阻塞至 Dify 返回，避免开发代理过早断开导致前端报错、后端其实已成功 */
        timeout: 600_000,
        proxyTimeout: 600_000,
      },
      /** 本地开发绕过跨域；请求 /dify-api/v1/... 转发到 DIFY_PROXY_TARGET（如自建 http://81.70.78.132:8088） */
      "/dify-api": {
        target: difyProxyTarget,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/dify-api/, ""),
      },
      /** 阿里云市场 iSlide generate_ppt，避免浏览器直连跨域 */
      "/islide-api": {
        target: islideProxyTarget,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/islide-api/, ""),
      },
    },
  },
  };
});
