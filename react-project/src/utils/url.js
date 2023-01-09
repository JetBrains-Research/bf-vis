export const generateBreadcrumb = (i, currentPath) => {
  return i < currentPath.split("/").length
    ? currentPath
        .split("/")
        .slice(0, i + 1)
        .join("/")
    : currentPath.split("/")[0];
};