export const STORAGE_KEYS = {
  pat: (projectName: string, userId: string) =>
    `${projectName}.${userId}.library.env.tools`,
};
