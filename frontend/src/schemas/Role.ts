export const Role = {
    Manager: "manager",
    Editor: "editor",
    Viewer: "viewer",
} as const;

export type Role = typeof Role[keyof typeof Role];