import { chromium } from "playwright-core";
import { getHeadersWithAuth } from "../browser/cdp.helpers.js";
import {
  killExistingChromeOnPort,
  launchOpenClawChrome,
  stopOpenClawChrome,
  getChromeWebSocketUrl,
} from "../browser/chrome.js";
import { resolveBrowserConfig, resolveProfile } from "../browser/config.js";
import { loadConfig } from "../config/io.js";

export async function loginDeepseekWeb(params: {
  onProgress: (msg: string) => void;
  openUrl: (url: string) => Promise<boolean>;
}) {
  const rootConfig = loadConfig();
  const browserConfig = resolveBrowserConfig(rootConfig.browser, rootConfig);
  const profile = resolveProfile(browserConfig, browserConfig.defaultProfile);
  if (!profile) {
    throw new Error(`Could not resolve browser profile '${browserConfig.defaultProfile}'`);
  }

  type RunningLike = { cdpPort: number; proc?: unknown };
  let running: RunningLike | null = null;
  let didLaunch = false;

  if (browserConfig.attachOnly) {
    // Attach to existing Chrome (e.g. from start-chrome-debug.sh) - same browser, same user-data, reuse logged-in session
    params.onProgress("Connecting to existing Chrome (attach mode)...");
    running = { cdpPort: profile.cdpPort };
    // Do NOT kill: user may have already logged in via start-chrome-debug.sh
  } else {
    // Launch our own Chrome: close any existing on this port first to avoid port conflict
    await killExistingChromeOnPort(profile.cdpPort, params.onProgress);
    params.onProgress("Launching browser...");
    running = await launchOpenClawChrome(browserConfig, profile);
    didLaunch = true;
  }

  try {
    const cdpUrl =
      browserConfig.attachOnly ? profile.cdpUrl : `http://127.0.0.1:${running.cdpPort}`;
    let wsUrl: string | null = null;

    // Retry finding the WS URL as Chrome might take a second to populate it
    params.onProgress("Waiting for browser debugger...");
    for (let i = 0; i < 10; i++) {
      wsUrl = await getChromeWebSocketUrl(cdpUrl, 2000);
      if (wsUrl) {
        break;
      }
      await new Promise((r) => setTimeout(r, 500));
    }

    if (!wsUrl) {
      throw new Error(`Failed to resolve Chrome WebSocket URL from ${cdpUrl} after retries.`);
    }

    params.onProgress("Connecting to browser...");
    const browser = await chromium.connectOverCDP(wsUrl, {
      headers: getHeadersWithAuth(wsUrl),
    });
    const context = browser.contexts()[0];
    const page = context.pages()[0] || (await context.newPage());

    await page.goto("https://chat.deepseek.com");
    const userAgent = await page.evaluate(() => navigator.userAgent);

    params.onProgress(
      "Please login to DeepSeek in the opened browser window. The session token will be captured automatically once you are logged in.",
    );

    return await new Promise<{ cookie: string; bearer: string; userAgent: string }>(
      (resolve, reject) => {
        let capturedBearer: string | undefined;
        let resolved = false;
        let checkInterval: ReturnType<typeof setInterval> | undefined;

        const timeout = setTimeout(() => {
          if (!resolved) {
            if (checkInterval) clearInterval(checkInterval);
            reject(new Error("Login timed out (5 minutes)."));
          }
        }, 300000);

        const tryResolve = async () => {
          // Bearer is required for DeepSeek API (create_pow_challenge, chat). Do not resolve without it.
          if (!capturedBearer || resolved) {
            return;
          }

          try {
            // Get all cookies for the domain
            const cookies = await context.cookies([
              "https://chat.deepseek.com",
              "https://deepseek.com",
            ]);
            if (cookies.length === 0) {
              return;
            }

            const cookieString = cookies.map((c) => `${c.name}=${c.value}`).join("; ");

            // d_id is preferred, but ds_session_id is an extremely strong signal of an active session
            const hasDeviceId = cookieString.includes("d_id=");
            const hasSessionId = cookieString.includes("ds_session_id=");
            const hasSessionInfo =
              cookieString.includes("HWSID=") || cookieString.includes("uuid=");

            if (hasDeviceId || hasSessionId || hasSessionInfo || cookies.length > 3) {
              resolved = true;
              clearTimeout(timeout);
              if (checkInterval) clearInterval(checkInterval);
              console.log(
                `[DeepSeek] Credentials captured (d_id: ${hasDeviceId}, ds_session_id: ${hasSessionId})`,
              );
              resolve({
                cookie: cookieString,
                bearer: capturedBearer,
                userAgent,
              });
            }
          } catch (e: unknown) {
            console.error(`[DeepSeek] Failed to fetch cookies: ${String(e)}`);
          }
        };

        page.on("request", async (request) => {
          const url = request.url();
          if (url.includes("/api/v0/")) {
            const headers = request.headers();
            const auth = headers["authorization"];

            if (auth?.startsWith("Bearer ")) {
              if (!capturedBearer) {
                console.log(`[DeepSeek Research] Captured Bearer Token.`);
                capturedBearer = auth.slice(7);
              }
              await tryResolve();
            }

            if (url.includes("/api/v0/chat/completion")) {
              console.log(`[DeepSeek Research] Completion Request Headers Check:`, {
                hasAuth: !!auth,
              });
            }
          }
        });

        page.on("response", async (response) => {
          const url = response.url();
          // users/current returns token in data.biz_data.token - same as openclawWeComzh flow
          if (url.includes("/api/v0/users/current") && response.ok()) {
            try {
              const body = (await response.json()) as Record<string, unknown>;
              const bizData = body?.data as Record<string, unknown> | undefined;
              const tokenFromResponse =
                (bizData?.biz_data as Record<string, unknown> | undefined)?.token;
              if (typeof tokenFromResponse === "string" && tokenFromResponse.length > 0) {
                if (!capturedBearer) {
                  console.log(`[DeepSeek] Captured token from users/current response`);
                  capturedBearer = tokenFromResponse;
                }
                await tryResolve();
              }
            } catch {
              // ignore
            }
          }
        });

        page.on("close", () => {
          if (checkInterval) clearInterval(checkInterval);
          reject(new Error("Browser window closed before login was captured."));
        });

        // Periodic check: cookies may already exist (user logged in), even without new API requests
        checkInterval = setInterval(tryResolve, 2000);
      },
    );
  } finally {
    if (didLaunch && running && "proc" in running) {
      await stopOpenClawChrome(running);
    }
  }
}
