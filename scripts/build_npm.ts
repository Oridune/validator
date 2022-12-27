import { build, emptyDir } from "https://deno.land/x/dnt@0.32.1/mod.ts";

await emptyDir("./npm");

await build({
  entryPoints: ["./mod.ts"],
  outDir: "./npm",
  shims: {
    deno: true,
  },
  package: {
    name: "@oridune/validator",
    version: Deno.args[0],
    description:
      "A powerful typescript compatible/zod alternative schema validator.",
    repository: {
      type: "git",
      url: "git+https://github.com/Oridune/validator.git",
    },
    keywords: ["oridune", "schema", "validator", "zod-like"],
    author: "Saif Ali Khan",
    license: "MIT",
    bugs: {
      url: "https://github.com/Oridune/validator/issues",
    },
    homepage: "https://github.com/Oridune/validator#readme",
  },
});

// post build steps
Deno.copyFileSync("LICENSE", "npm/LICENSE");
Deno.copyFileSync("README.md", "npm/README.md");
