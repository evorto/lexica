import * as filepath from "path";
import * as fs from "fs";
import * as yaml from "yaml";

export class LexicaError extends Error {}

export const check = (value, message) => {
  if (!value) {
    throw new LexicaError(message);
  }
};

export const loadYaml = (name: string, paths: string[]) => {
  for (const path of paths) {
    if (fs.existsSync(filepath.join(path, name + ".yaml"))) {
      return yaml.parse(fs.readFileSync(filepath.join(path, name + ".yaml"), "utf8"));
    }
    if (fs.existsSync(filepath.join(path, name + ".yml"))) {
      return yaml.parse(fs.readFileSync(filepath.join(path, name + ".yml"), "utf8"));
    }
  }
  return null;
};

export const loadConfig = (path: string) => {
  const config = yaml.parse(fs.readFileSync(path, "utf-8"));
  config.path = path;
  if (config.source) {
    config.source = filepath.join(filepath.dirname(path), config.source);
  }
  if (config.authors) {
    config.authors = filepath.join(filepath.dirname(path), config.authors);
  }
  if (config.dest) {
    config.dest = filepath.join(filepath.dirname(path), config.dest);
  }
  return config;
};

export const slugify = (input: string) => {
  return input
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
};
