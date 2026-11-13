import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  /* config options here */
  trailingSlash: false,
  experimental: {
    optimizePackageImports: ["lucide-react", "katex"],
  },
  turbopack: {
    // Pin the workspace root to this project so file watching doesn't spill into
    // parent folders (which caused endless recompiles / auto-refresh).
    root: path.resolve(process.cwd()),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    return [
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      // NOTE: Do NOT add a www <-> non-www host redirect here when hosted on Vercel,
      // because Vercel's Edge Domain layer handles apex/www redirects before Next.js
      // and conflicting rules cause ERR_TOO_MANY_REDIRECTS.

      // 1. Common Root / Index Aliases -> /
      {
        source: "/home",
        destination: "/",
        permanent: true,
      },
      {
        source: "/index",
        destination: "/",
        permanent: true,
      },
      {
        source: "/index.html",
        destination: "/",
        permanent: true,
      },
      {
        source: "/index.php",
        destination: "/",
        permanent: true,
      },

      // 3. Auth & Account Aliases
      {
        source: "/signin",
        destination: "/login",
        permanent: true,
      },
      {
        source: "/sign-in",
        destination: "/login",
        permanent: true,
      },
      {
        source: "/log-in",
        destination: "/login",
        permanent: true,
      },
      {
        source: "/auth/login",
        destination: "/login",
        permanent: true,
      },
      {
        source: "/signup",
        destination: "/register",
        permanent: true,
      },
      {
        source: "/sign-up",
        destination: "/register",
        permanent: true,
      },
      {
        source: "/join",
        destination: "/register",
        permanent: true,
      },
      {
        source: "/auth/register",
        destination: "/register",
        permanent: true,
      },

      // 4. Pricing & Subscription Aliases
      {
        source: "/plans",
        destination: "/pricing",
        permanent: true,
      },
      {
        source: "/subscribe",
        destination: "/pricing",
        permanent: true,
      },
      {
        source: "/subscription",
        destination: "/pricing",
        permanent: true,
      },
      {
        source: "/packages",
        destination: "/pricing",
        permanent: true,
      },

      // 5. Paper Maker & Question Bank Tool Aliases
      {
        source: "/generator",
        destination: "/select-questions",
        permanent: true,
      },
      {
        source: "/create-paper",
        destination: "/select-questions",
        permanent: true,
      },
      {
        source: "/make-paper",
        destination: "/select-questions",
        permanent: true,
      },
      {
        source: "/question-bank",
        destination: "/select-questions",
        permanent: true,
      },
      {
        source: "/questions",
        destination: "/select-questions",
        permanent: true,
      },
      {
        source: "/ai-paper",
        destination: "/quick-paper",
        permanent: true,
      },
      {
        source: "/ai-paper-maker",
        destination: "/quick-paper",
        permanent: true,
      },
      {
        source: "/instant-paper",
        destination: "/quick-paper",
        permanent: true,
      },
      {
        source: "/ocr-paper",
        destination: "/quick-paper",
        permanent: true,
      },
      {
        source: "/editor",
        destination: "/paper-editor",
        permanent: true,
      },
      {
        source: "/print-paper",
        destination: "/paper-editor",
        permanent: true,
      },
      {
        source: "/studio",
        destination: "/paper-editor",
        permanent: true,
      },

      // 6. Study Notes & Landing Hub Aliases
      {
        source: "/study-notes",
        destination: "/notes",
        permanent: true,
      },
      {
        source: "/mcqs",
        destination: "/notes",
        permanent: true,
      },
      {
        source: "/solved-mcqs",
        destination: "/notes",
        permanent: true,
      },
      {
        source: "/chapter-notes",
        destination: "/notes",
        permanent: true,
      },
      {
        source: "/boards",
        destination: "/paper-maker",
        permanent: true,
      },
      {
        source: "/subjects",
        destination: "/paper-maker",
        permanent: true,
      },
      {
        source: "/paper-generator",
        destination: "/paper-maker",
        permanent: true,
      },
      {
        source: "/paper-makers",
        destination: "/paper-maker",
        permanent: true,
      },

      // 7. Admin Root Convenience Redirect
      {
        source: "/admin",
        destination: "/admin/questions",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
