import { createRequestHandler } from "@remix-run/express";
import express from "express";
import { AppDataSource } from './app/data-source.js';

const viteDevServer =
  process.env.NODE_ENV === "production"
    ? null
    : await import("vite").then((vite) =>
      vite.createServer({
        server: { middlewareMode: true },
      })
    );

const app = express();
app.use(
  viteDevServer
    ? viteDevServer.middlewares
    : express.static("build/client")
);

const build = viteDevServer
  ? () => viteDevServer.ssrLoadModule("virtual:remix/server-build")
  : await import("./build/server/index.js");

app.all("*", createRequestHandler({ build }));

await AppDataSource.initialize();

app.listen(3005, () => {
  console.log("App listening on http://localhost:3005");
});
