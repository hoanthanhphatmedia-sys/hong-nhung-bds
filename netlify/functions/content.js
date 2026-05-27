const fs = require("fs");
const path = require("path");

function json(statusCode, data) {
  return {
    statusCode,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
    body: JSON.stringify(data),
  };
}

exports.handler = async function handler(event) {
  if (event.httpMethod !== "GET") {
    return json(405, { error: "Method not allowed" });
  }

  const expectedPassword = process.env.ADMIN_PASSWORD;
  if (!expectedPassword) {
    return json(500, { error: "Missing ADMIN_PASSWORD environment variable" });
  }

  if (event.headers["x-admin-password"] !== expectedPassword) {
    return json(401, { error: "Unauthorized" });
  }

  try {
    const root = process.cwd();
    const site = JSON.parse(fs.readFileSync(path.join(root, "content/site.json"), "utf8"));
    const projects = JSON.parse(fs.readFileSync(path.join(root, "content/projects.json"), "utf8"));
    return json(200, { site, projects });
  } catch (error) {
    return json(500, { error: error.message });
  }
};
