#!/usr/bin/env node

import { program } from "commander";
import { logger, setupLoggers } from "./logger";
import * as tools from "./tools";
import { loadConfig } from "./util";

program
  .command("build [source]")
  .description("Transforms lexicon files into svelte files. ")
  .option("--config <config>", "specifies config file")
  .option("--authors <authorSource>", "sets authors source directory")
  .option("--dest <dest>", "sets destination directory")
  .option("--assetDest <assetDest>", "sets authors destination directory")
  .option("--app <app>", "sets app name")
  .option("--domain <domain>", "sets domain")
  .action(build);

async function build(source: string, options: any) {
  const config = options.config ? loadConfig(options.config) : null;
  if (!config) {
    logger.error("Config file could not be found.");
    process.exit(1);
  }
  if (source) {
    config.source = source;
  }
  tools.build({ ...config, ...options });
}

setupLoggers();
program.parse(process.argv);
