export const BASE_PATH = "/builds";
export const PUBLIC_APP_URL = "https://palworld.iterationx.cloud/builds";

export function withBasePath(path: string) {
  if (path === BASE_PATH || path.startsWith(`${BASE_PATH}/`) || path.startsWith(`${BASE_PATH}?`)) return path;
  if (path === "/") return BASE_PATH;
  return `${BASE_PATH}${path.startsWith("/") ? path : `/${path}`}`;
}
