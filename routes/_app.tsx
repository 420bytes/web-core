// Copyright 2023-2024 the Deno authors. All rights reserved. MIT license.
import { defineApp } from '$fresh/server.ts';
import Footer from '@/components/Footer.tsx';
import Header from '@/components/Header.tsx';
import type { State } from '@/plugins/session.ts';

export default defineApp<State>((_, ctx) => {
  if (ctx.url.pathname.startsWith('/kv-')) {
    return <ctx.Component />;
  }
  return (
    <html lang='en'>
      <head>
        <meta charset='utf-8' />
        <meta name='viewport' content='width=device-width, initial-scale=1.0' />
        <link rel='stylesheet' href='/styles.css' />
      </head>
      <body>
        <div class='dark:bg-gray-900'>
          <div class='flex flex-col w-full min-h-screen mx-auto max-w-7xl dark:text-white'>
            <Header url={ctx.url} sessionUser={ctx.state?.sessionUser} />
            <ctx.Component />
            <Footer />
          </div>
        </div>
        <script async src='//cdn.iframe.ly/embed.js'></script>
      </body>
    </html>
  );
});
