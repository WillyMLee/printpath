const SESSION_COOKIE = "printpath_session";
const SESSION_SECONDS = 8 * 60 * 60;
const MAX_LOGIN_BODY = 4_096;
const MAX_AI_BODY = 8_192;
const MAX_IDEA_LENGTH = 2_000;

type WorkerEnv = Env & {
  AUTH_USERNAME?: string;
  AUTH_PASSWORD?: string;
  SESSION_SECRET?: string;
  OPENAI_API_KEY?: string;
};

type SessionPayload = {
  sub: string;
  exp: number;
};

type OpenAIResponse = {
  output?: Array<{
    type?: string;
    content?: Array<{ type?: string; text?: string }>;
  }>;
};

function json(data: unknown, status = 200, headers?: HeadersInit): Response {
  const responseHeaders = new Headers(headers);
  responseHeaders.set("Content-Type", "application/json; charset=utf-8");
  responseHeaders.set("Cache-Control", "no-store");
  responseHeaders.set("X-Content-Type-Options", "nosniff");
  return new Response(JSON.stringify(data), { status, headers: responseHeaders });
}

function clientIp(request: Request): string {
  return request.headers.get("CF-Connecting-IP") || "unknown";
}

function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("Origin");
  return !origin || origin === new URL(request.url).origin;
}

function readCookie(request: Request, name: string): string | undefined {
  const cookie = request.headers.get("Cookie");
  if (!cookie) return undefined;
  for (const part of cookie.split(";")) {
    const [key, ...value] = part.trim().split("=");
    if (key === name) return value.join("=");
  }
  return undefined;
}

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlDecode(value: string): Uint8Array<ArrayBuffer> | undefined {
  try {
    const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    const binary = atob(padded);
    const bytes = new Uint8Array(new ArrayBuffer(binary.length));
    for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
    return bytes;
  } catch {
    return undefined;
  }
}

async function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

async function constantTimeMatch(provided: string, expected: string, secret: string): Promise<boolean> {
  const key = await hmacKey(secret);
  const encoder = new TextEncoder();
  const expectedSignature = await crypto.subtle.sign("HMAC", key, encoder.encode(`credential:${expected}`));
  return crypto.subtle.verify("HMAC", key, expectedSignature, encoder.encode(`credential:${provided}`));
}

async function createSession(username: string, secret: string): Promise<string> {
  const payload: SessionPayload = {
    sub: username,
    exp: Math.floor(Date.now() / 1_000) + SESSION_SECONDS,
  };
  const encodedPayload = base64UrlEncode(new TextEncoder().encode(JSON.stringify(payload)));
  const signature = await crypto.subtle.sign("HMAC", await hmacKey(secret), new TextEncoder().encode(encodedPayload));
  return `${encodedPayload}.${base64UrlEncode(new Uint8Array(signature))}`;
}

async function verifySession(request: Request, env: WorkerEnv): Promise<SessionPayload | undefined> {
  if (!env.SESSION_SECRET || !env.AUTH_USERNAME) return undefined;
  const token = readCookie(request, SESSION_COOKIE);
  if (!token) return undefined;
  const [encodedPayload, encodedSignature, extra] = token.split(".");
  if (!encodedPayload || !encodedSignature || extra) return undefined;
  const signature = base64UrlDecode(encodedSignature);
  if (!signature) return undefined;
  const valid = await crypto.subtle.verify(
    "HMAC",
    await hmacKey(env.SESSION_SECRET),
    signature,
    new TextEncoder().encode(encodedPayload),
  );
  if (!valid) return undefined;
  const payloadBytes = base64UrlDecode(encodedPayload);
  if (!payloadBytes) return undefined;
  try {
    const payload = JSON.parse(new TextDecoder().decode(payloadBytes)) as Partial<SessionPayload>;
    if (typeof payload.sub !== "string" || typeof payload.exp !== "number") return undefined;
    if (payload.sub !== env.AUTH_USERNAME || payload.exp <= Math.floor(Date.now() / 1_000)) return undefined;
    return { sub: payload.sub, exp: payload.exp };
  } catch {
    return undefined;
  }
}

async function readJsonBody(request: Request, maxBytes: number): Promise<unknown> {
  const declaredSize = Number(request.headers.get("Content-Length") || 0);
  if (declaredSize > maxBytes) throw new Error("BODY_TOO_LARGE");
  const text = await request.text();
  if (new TextEncoder().encode(text).byteLength > maxBytes) throw new Error("BODY_TOO_LARGE");
  return JSON.parse(text) as unknown;
}

function extractOutputText(response: OpenAIResponse): string | undefined {
  const text = response.output
    ?.flatMap((item) => item.type === "message" ? item.content || [] : [])
    .filter((item) => item.type === "output_text" && typeof item.text === "string")
    .map((item) => item.text?.trim())
    .filter((item): item is string => Boolean(item))
    .join("\n\n");
  return text || undefined;
}

async function handleLogin(request: Request, env: WorkerEnv): Promise<Response> {
  if (!isSameOrigin(request)) return json({ error: "Request origin was rejected." }, 403);
  const limit = await env.LOGIN_RATE_LIMITER.limit({ key: clientIp(request) });
  if (!limit.success) return json({ error: "Too many sign-in attempts. Try again in a minute." }, 429);
  if (!env.AUTH_USERNAME || !env.AUTH_PASSWORD || !env.SESSION_SECRET) {
    return json({ error: "Maker Mode is not configured yet." }, 503);
  }
  try {
    const body = await readJsonBody(request, MAX_LOGIN_BODY);
    if (!body || typeof body !== "object") return json({ error: "Invalid sign-in request." }, 400);
    const username = "username" in body && typeof body.username === "string" ? body.username : "";
    const password = "password" in body && typeof body.password === "string" ? body.password : "";
    if (username.length > 128 || password.length > 256) return json({ error: "Invalid username or password." }, 401);
    const [usernameMatches, passwordMatches] = await Promise.all([
      constantTimeMatch(username, env.AUTH_USERNAME, env.SESSION_SECRET),
      constantTimeMatch(password, env.AUTH_PASSWORD, env.SESSION_SECRET),
    ]);
    if (!usernameMatches || !passwordMatches) return json({ error: "Invalid username or password." }, 401);
    const session = await createSession(env.AUTH_USERNAME, env.SESSION_SECRET);
    return json(
      { authenticated: true, displayName: env.AUTH_USERNAME, aiConfigured: Boolean(env.OPENAI_API_KEY) },
      200,
      { "Set-Cookie": `${SESSION_COOKIE}=${session}; Path=/; Max-Age=${SESSION_SECONDS}; HttpOnly; Secure; SameSite=Strict` },
    );
  } catch (error) {
    if (error instanceof Error && error.message === "BODY_TOO_LARGE") return json({ error: "Sign-in request is too large." }, 413);
    return json({ error: "Invalid sign-in request." }, 400);
  }
}

async function handleAiDesign(request: Request, env: WorkerEnv): Promise<Response> {
  if (!isSameOrigin(request)) return json({ error: "Request origin was rejected." }, 403);
  const session = await verifySession(request, env);
  if (!session) return json({ error: "Maker Mode sign-in is required." }, 401);
  if (!env.OPENAI_API_KEY) return json({ error: "PrintPath AI is locked until an OpenAI API key is configured.", code: "AI_NOT_CONFIGURED" }, 503);
  const limit = await env.AI_RATE_LIMITER.limit({ key: `${session.sub}:${clientIp(request)}` });
  if (!limit.success) return json({ error: "AI limit reached. Try again in a minute." }, 429);

  let idea = "";
  try {
    const body = await readJsonBody(request, MAX_AI_BODY);
    if (body && typeof body === "object" && "idea" in body && typeof body.idea === "string") idea = body.idea.trim();
  } catch (error) {
    if (error instanceof Error && error.message === "BODY_TOO_LARGE") return json({ error: "Design request is too large." }, 413);
    return json({ error: "Invalid design request." }, 400);
  }
  if (!idea || idea.length > MAX_IDEA_LENGTH) return json({ error: `Describe the design in 1 to ${MAX_IDEA_LENGTH} characters.` }, 400);

  const openAIResponse = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: env.OPENAI_MODEL,
      store: false,
      max_output_tokens: 700,
      input: [
        {
          role: "developer",
          content: [{
            type: "input_text",
            text: "You are PrintPath's concise 3D-print design intake assistant. Convert the user's idea into a practical P1S design brief. Return: a short title, the likely object type, the 3-6 measurements still required, material/nozzle cautions, whether multiple parts or plates may be required, and the single best next question. Do not claim a model is printable or dimensionally verified before measurements and slicing.",
          }],
        },
        { role: "user", content: [{ type: "input_text", text: idea }] },
      ],
    }),
  });
  if (!openAIResponse.ok) {
    console.error(JSON.stringify({
      message: "OpenAI request failed",
      status: openAIResponse.status,
      requestId: openAIResponse.headers.get("x-request-id"),
    }));
    return json({ error: "PrintPath AI could not complete that request." }, 502);
  }
  const responseBody = await openAIResponse.json() as OpenAIResponse;
  const brief = extractOutputText(responseBody);
  if (!brief) return json({ error: "PrintPath AI returned an empty brief." }, 502);
  return json({ brief, model: env.OPENAI_MODEL });
}

async function handleApi(request: Request, env: WorkerEnv): Promise<Response> {
  const url = new URL(request.url);
  if (url.pathname === "/api/auth/session" && request.method === "GET") {
    const session = await verifySession(request, env);
    return json({
      authenticated: Boolean(session),
      displayName: session?.sub,
      aiConfigured: Boolean(env.OPENAI_API_KEY),
    });
  }
  if (url.pathname === "/api/auth/login" && request.method === "POST") return handleLogin(request, env);
  if (url.pathname === "/api/auth/logout" && request.method === "POST") {
    if (!isSameOrigin(request)) return json({ error: "Request origin was rejected." }, 403);
    return json(
      { authenticated: false, aiConfigured: Boolean(env.OPENAI_API_KEY) },
      200,
      { "Set-Cookie": `${SESSION_COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict` },
    );
  }
  if (url.pathname === "/api/ai/design" && request.method === "POST") return handleAiDesign(request, env);
  return json({ error: "Not found." }, 404);
}

export default {
  async fetch(request: Request, env: WorkerEnv): Promise<Response> {
    try {
      const url = new URL(request.url);
      if (url.pathname.startsWith("/api/")) return await handleApi(request, env);
      return env.ASSETS.fetch(request);
    } catch (error) {
      console.error(JSON.stringify({
        message: "Unhandled Worker error",
        error: error instanceof Error ? error.message : "Unknown error",
        path: new URL(request.url).pathname,
      }));
      return json({ error: "Internal server error." }, 500);
    }
  },
} satisfies ExportedHandler<WorkerEnv>;
