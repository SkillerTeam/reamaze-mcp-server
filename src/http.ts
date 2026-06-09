#!/usr/bin/env node

// Remote entrypoint: exposes the Reamaze MCP server over the MCP "Streamable
// HTTP" transport so it can be hosted (e.g. on Railway) and reached by Claude
// Code (`--transport http`), claude.ai custom connectors, or other agents.
//
// Security: every request must carry `Authorization: Bearer <MCP_AUTH_TOKEN>`.
// The process refuses to start if MCP_AUTH_TOKEN is unset, so we never expose
// the Reamaze credentials behind an unauthenticated endpoint.

import express, { type Request, type Response } from "express";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createServer } from "./server.js";

const PORT = Number(process.env.PORT) || 3000;
const AUTH_TOKEN = process.env.MCP_AUTH_TOKEN;

if (!AUTH_TOKEN) {
  console.error(
    "FATAL: MCP_AUTH_TOKEN is not set. Refusing to start an unauthenticated MCP endpoint."
  );
  process.exit(1);
}

/** Constant-time-ish comparison of the Authorization header against the token. */
function isAuthorized(req: Request): boolean {
  const provided = req.headers.authorization ?? "";
  const expected = `Bearer ${AUTH_TOKEN}`;
  if (provided.length !== expected.length) return false;
  let mismatch = 0;
  for (let i = 0; i < provided.length; i++) {
    mismatch |= provided.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return mismatch === 0;
}

const app = express();
app.use(express.json({ limit: "4mb" }));

// Lightweight health check (used by Railway's healthcheckPath).
app.get("/healthz", (_req: Request, res: Response) => {
  res.status(200).send("ok");
});

// MCP endpoint. Stateless mode: a fresh server + transport per request, which
// is the pattern recommended by the MCP SDK for horizontally-scalable servers.
app.post("/mcp", async (req: Request, res: Response) => {
  if (!isAuthorized(req)) {
    res.status(401).json({
      jsonrpc: "2.0",
      error: { code: -32001, message: "Unauthorized" },
      id: null,
    });
    return;
  }

  try {
    const server = createServer();
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });
    res.on("close", () => {
      void transport.close();
      void server.close();
    });
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  } catch (error) {
    console.error("Error handling MCP request:", error);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: "2.0",
        error: { code: -32603, message: "Internal server error" },
        id: null,
      });
    }
  }
});

// Stateless mode does not support server-initiated SSE (GET) or session teardown (DELETE).
const methodNotAllowed = (_req: Request, res: Response) => {
  res.status(405).json({
    jsonrpc: "2.0",
    error: { code: -32000, message: "Method not allowed." },
    id: null,
  });
};
app.get("/mcp", methodNotAllowed);
app.delete("/mcp", methodNotAllowed);

app.listen(PORT, () => {
  console.error(`Reamaze MCP server running on HTTP :${PORT} (POST /mcp)`);
});
