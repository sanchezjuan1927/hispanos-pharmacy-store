import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  // A stray package-lock.json in the home directory made Turbopack infer the
  // wrong workspace root; pin it to this project.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
