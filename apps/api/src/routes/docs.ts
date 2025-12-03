import { Hono } from "hono";
import { openApiSpec } from "@budget/schemas";

const SWAGGER_UI_VERSION = "5.9.0";

/**
 * Serves OpenAPI documentation endpoints:
 * - GET /docs - Swagger UI
 * - GET /docs/openapi.json - Raw OpenAPI spec (JSON)
 * - GET /docs/openapi.yaml - Raw OpenAPI spec (YAML)
 */
export const docs = new Hono();

// Serve the raw OpenAPI spec as JSON
docs.get("/docs/openapi.json", (c) => {
  return c.json(openApiSpec);
});

// Serve Swagger UI
docs.get("/docs", (c) => {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BudgetWise API Documentation</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@${SWAGGER_UI_VERSION}/swagger-ui.css">
  <style>
    body { margin: 0; padding: 0; }
    .swagger-ui .topbar { display: none; }
    .swagger-ui .info { margin: 20px 0; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@${SWAGGER_UI_VERSION}/swagger-ui-bundle.js"></script>
  <script>
    window.onload = function() {
      SwaggerUIBundle({
        url: '/docs/openapi.json',
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIBundle.SwaggerUIStandalonePreset
        ],
        layout: "BaseLayout",
        // Send cookies with requests (for session-based auth)
        withCredentials: true,
        requestInterceptor: function(req) {
          req.credentials = 'include';
          return req;
        }
      });
    }
  </script>
</body>
</html>`;
  return c.html(html);
});

// Root redirect to docs
docs.get("/", (c) => {
  return c.redirect("/docs");
});