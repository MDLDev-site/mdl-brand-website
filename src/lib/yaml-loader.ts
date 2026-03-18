import fs from 'node:fs/promises';
import path from 'node:path';
import yaml from 'js-yaml';

export async function loadYaml<T>(filePath: string): Promise<T> {
  const fullPath = path.join(process.cwd(), 'content', filePath);
  const content = await fs.readFile(fullPath, 'utf-8');
  return yaml.load(content) as T;
}
