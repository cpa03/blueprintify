export const ICONS = {
  check: {
    viewBox: "0 0 24 24",
    path: "M5 13l4 4L19 7",
  },
  close: {
    viewBox: "0 0 24 24",
    path: "M6 18L18 6M6 6l12 12",
  },
  chevronRight: {
    viewBox: "0 0 24 24",
    path: "M9 5l7 7-7 7",
  },
  edit: {
    viewBox: "0 0 24 24",
    path: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
  },
} as const;

export type IconName = keyof typeof ICONS;
