// Copyright 2023-2024 the Deno authors. All rights reserved. MIT license.
import { defineRoute } from '$fresh/server.ts';
import { CSS, render } from '$gfm';
import GitHubAvatarImg from '@/components/GitHubAvatarImg.tsx';
import Head from '@/components/Head.tsx';
import { getPost } from '@/utils/posts.ts';

export default defineRoute(async (_req, ctx) => {
  const post = await getPost(ctx.params.slug);
  if (post === null) return await ctx.renderNotFound();
  const publishDate = !post.publishedAt ? null : new Date(post.publishedAt);
  const updatedAt = !post.updatedAt ? null : new Date(post.updatedAt);

  return (
    <>
      <Head title={post.title} href={ctx.url.href}>
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
      </Head>
      <main class='flex-1 p-4'>
        <h1 class='text-4xl font-bold text-primary'>{post.title}</h1>
        <div class='grid gap-2 grid-flow-col auto-cols-[minmax(0,_max-content)]'>
          <p class='self-center text-gray-500'>
            Posted By {''}
            <GitHubAvatarImg login='moimikey' size={24} class='mr-2' />
            <a class='hover:underline' href={`/users/moimikey`}>
              moimikey
            </a>{' '}
            {publishDate && `| ${publishDate}`}
            {updatedAt && `| ${updatedAt}`}
          </p>
        </div>
        <div
          class='mt-8 markdown-body !bg-transparent !dark:text-white'
          data-color-mode='light'
          dangerouslySetInnerHTML={{ __html: render(post.content) }}
        />
        <script
          src='https://giscus.app/client.js'
          data-repo='420bytes/web-core'
          data-repo-id='R_kgDOLLUbIw'
          data-category='Announcements'
          data-category-id='DIC_kwDOLLUbI84CdsJo'
          data-mapping='url'
          data-strict='1'
          data-reactions-enabled='1'
          data-emit-metadata='0'
          data-input-position='bottom'
          data-theme='preferred_color_scheme'
          data-lang='en'
          data-loading='lazy'
          crossorigin='anonymous'
          async
        >
        </script>
      </main>
    </>
  );
});
