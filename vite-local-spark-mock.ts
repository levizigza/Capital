import type { IncomingMessage, ServerResponse } from "node:http";
import type { Plugin, ViteDevServer } from "vite";

const kvStore = new Map<string, string>();

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
    req.on("error", reject);
  });
}

function sendJson(res: ServerResponse, status: number, data: unknown): void {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(data));
}

function handleKvRequest(
  req: IncomingMessage,
  res: ServerResponse,
  urlPath: string
): boolean {
  if (urlPath === "/_spark/kv" && req.method === "GET") {
    sendJson(res, 200, [...kvStore.keys()]);
    return true;
  }

  const keyPrefix = "/_spark/kv/";
  if (!urlPath.startsWith(keyPrefix)) {
    return false;
  }

  const key = decodeURIComponent(urlPath.slice(keyPrefix.length));
  if (!key) {
    return false;
  }

  if (req.method === "GET") {
    const value = kvStore.get(key);
    if (value === undefined) {
      res.statusCode = 404;
      res.end();
      return true;
    }
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/plain");
    res.end(value);
    return true;
  }

  if (req.method === "POST") {
    void readBody(req).then((body) => {
      kvStore.set(key, body);
      res.statusCode = 200;
      res.end();
    });
    return true;
  }

  if (req.method === "DELETE") {
    kvStore.delete(key);
    res.statusCode = 200;
    res.end();
    return true;
  }

  return false;
}

/**
 * Mock GitHub Spark runtime endpoints for local development.
 * Also removes Spark's proxy rules so they cannot forward requests
 * to api.github.com (which fails without auth) or interfere with
 * the WebSocket upgrade used by HMR.
 *
 * Skipped when running inside the Spark workbench (SPARK_WORKBENCH_ID is set).
 */
export function localSparkMockPlugin(): Plugin {
  const isWorkbench = !!process.env.SPARK_WORKBENCH_ID;

  return {
    name: "local-spark-mock",
    apply: "serve",
    enforce: "pre",

    // Strip the Spark proxy rules out of the merged config before Vite
    // creates the http-proxy instances.  This prevents:
    //  - 401 errors when requests leak through to api.github.com
    //  - http-proxy from adding its own 'upgrade' listener that can
    //    race with Vite's HMR WebSocket handler
    configResolved(resolved) {
      if (isWorkbench) return;

      const proxy = resolved.server.proxy;
      if (proxy) {
        for (const key of Object.keys(proxy)) {
          if (key.includes("_spark")) {
            delete proxy[key];
          }
        }
      }
    },

    configureServer(server: ViteDevServer) {
      if (isWorkbench) return;

      server.middlewares.use(async (req, res, next) => {
        const urlPath = (req.url ?? "").split("?")[0];
        if (!urlPath.startsWith("/_spark/")) {
          next();
          return;
        }

        try {
          if (urlPath === "/_spark/loaded" && req.method === "POST") {
            await readBody(req);
            res.statusCode = 204;
            res.end();
            return;
          }

          if (urlPath === "/_spark/user" && req.method === "GET") {
            sendJson(res, 200, {
              id: 1,
              login: "local-dev",
              email: "dev@localhost",
              isOwner: true,
            });
            return;
          }

          if (handleKvRequest(req, res, urlPath)) {
            return;
          }

          sendJson(res, 404, { error: "Unknown Spark endpoint" });
        } catch (error) {
          sendJson(res, 500, { error: String(error) });
        }
      });
    },
  };
}
