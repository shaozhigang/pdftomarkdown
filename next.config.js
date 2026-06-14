const withNextIntl = require("next-intl/plugin")("./src/i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    // pdf.js v4 ships .mjs; ensure canvas (Node-only optional dep) is not bundled
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
    };
    return config;
  },
  async redirects() {
    return [
      { source: "/", destination: "/en", permanent: true },
      {
        source: "/pdf-to-markdown-for-obsidian",
        destination: "/en/pdf-to-markdown-for-obsidian",
        permanent: true,
      },
      {
        source: "/pdf-to-markdown-for-chatgpt",
        destination: "/en/pdf-to-markdown-for-chatgpt",
        permanent: true,
      },
      {
        source: "/pdf-table-to-markdown",
        destination: "/en/pdf-table-to-markdown",
        permanent: true,
      },
      {
        source: "/pdf-to-markdown-for-notion",
        destination: "/en/pdf-to-markdown-for-notion",
        permanent: true,
      },
      {
        source: "/pdf-to-markdown-python",
        destination: "/en/pdf-to-markdown-python",
        permanent: true,
      },
    ];
  },
};

module.exports = withNextIntl(nextConfig);
