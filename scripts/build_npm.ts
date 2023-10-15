import { build, emptyDir } from "https://deno.land/x/dnt@0.36.0/mod.ts";
import { Input } from "https://deno.land/x/cliffy@v0.25.4/prompt/mod.ts";

await emptyDir("./npm");

const Version =
  Deno.args[0] ??
  (await Input.prompt({
    message: "Enter the version:",
  }));

await build({
  entryPoints: ["./mod.ts"],
  outDir: "./npm",
  shims: {
    // see JS docs for overview and more options
    deno: true,
  },
  package: {
    name: "@oridune/validator",
    version: Version,
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
  postBuild() {
    // steps to run after building and before running the tests
    Deno.copyFileSync("LICENSE", "npm/LICENSE");
    Deno.copyFileSync("README.md", "npm/README.md");
  },
});
