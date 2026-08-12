import type { MockPackage } from '../utils/excalidraw-parser';

export const loadMockPackages = async (baseUrl: string = '/data/library'): Promise<MockPackage[]> => {
  const packages: MockPackage[] = [];
  
  let libraryFiles: string[] = [];
  try {
    const indexRes = await fetch(`${baseUrl}/index.json`);
    if (indexRes.ok) {
      libraryFiles = await indexRes.json();
    } else {
      console.warn(`[MyLibraryPlugin] No index.json found at ${baseUrl}. Skipping dynamic loading.`);
      return packages;
    }
  } catch (err) {
    console.error(`[MyLibraryPlugin] Failed to fetch index.json from ${baseUrl}:`, err);
    return packages;
  }

  for (const file of libraryFiles) {
    const url = `${baseUrl}/${file}.json`;
    try {
      const res = await fetch(url);
      if (res.ok) {
        const pkg = await res.json();
        packages.push(pkg as MockPackage);
      } else {
        console.error(`[MyLibraryPlugin] Failed to fetch library file: ${url} - Status: ${res.status}`);
      }
    } catch (err) {
      console.error(`[MyLibraryPlugin] Error loading library file ${url}:`, err);
    }
  }
  
  return packages;
};
