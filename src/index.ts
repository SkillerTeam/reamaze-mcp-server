#!/usr/bin/env node

// Local entrypoint: runs the Reamaze MCP server over stdio, which is how
// Claude Code launches it as a subprocess. For a hosted/remote deployment,
// use the HTTP entrypoint instead (`build/http.js` — see src/http.ts).

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createServer } from "./server.js";

async function main() {
  const transport = new StdioServerTransport();
  await createServer().connect(transport);
  console.error("Reamaze MCP server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
