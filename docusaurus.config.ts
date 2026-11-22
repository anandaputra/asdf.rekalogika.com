import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'asdf.rekalogika.com',
  tagline: 'asdf.rekalogika.com',
  favicon: 'img/logo.svg',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  url: 'https://asdf.rekalogika.com',
  baseUrl: '/',
  // Apache serves each page as <path>/index.html; use matching URLs to avoid redirects.
  trailingSlash: true,

  onBrokenLinks: 'throw',

  i18n: {
    defaultLocale: 'id',
    locales: ['id'],
  },

  presets: [
    [
      'classic',
      {
        // Blog-only mode: no docs, blog is served at the site root.
        docs: false,
        blog: {
          routeBasePath: '/',
          blogTitle: 'Blog',
          blogDescription: 'Tulisan di asdf.rekalogika.com',
          blogSidebarTitle: 'Tulisan terbaru',
          blogSidebarCount: 10,
          postsPerPage: 10,
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          // Useful options to enforce blogging best practices
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    colorMode: {
      defaultMode: 'light',
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'asdf.rekalogika.com',
      logo: {
        alt: 'Logo asdf.rekalogika.com',
        src: 'img/logo.svg',
      },
      items: [
        {to: '/archive', label: 'Arsip', position: 'left'},
        {to: '/tags', label: 'Tag', position: 'left'},
        {
          href: 'https://github.com/anandaputra/asdf.rekalogika.com',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Blog',
          items: [
            {label: 'Arsip', to: '/archive'},
            {label: 'Tag', to: '/tags'},
          ],
        },
        {
          title: 'Langganan',
          items: [
            {label: 'RSS', href: 'https://asdf.rekalogika.com/rss.xml'},
            {label: 'Atom', href: 'https://asdf.rekalogika.com/atom.xml'},
          ],
        },
        {
          title: 'Lainnya',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/anandaputra/asdf.rekalogika.com',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Rekalogika. Dibuat dengan Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
