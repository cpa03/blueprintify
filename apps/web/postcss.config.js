export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    ...(process.env.NODE_ENV === "production"
      ? {
          cssnano: {
            preset: [
              "default",
              {
                discardComments: { removeAll: true },
                discardUnused: true,
                reduceIdents: false,
                zindex: false,
                mergeIdents: false,
                normalizeUnicode: false,
              },
            ],
          },
        }
      : {}),
  },
};
