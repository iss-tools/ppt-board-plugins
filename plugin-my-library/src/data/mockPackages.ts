/// <reference types="vite/client" />
import type { MockPackage } from '../utils/excalidraw-parser';

// Use Vite's import.meta.glob to dynamically import all JSON files in the library directory
const libraryModules = import.meta.glob('./library/*.json');

export const loadMockPackages = async (): Promise<MockPackage[]> => {
  const packages: MockPackage[] = [];
  
  for (const path in libraryModules) {
    try {
      const module = await libraryModules[path]();
      const pkg = (module as any).default || module;
      packages.push(pkg as MockPackage);
    } catch (err) {
      console.error(`Failed to load mock package from ${path}:`, err);
    }
  }
  
  return packages;
};
