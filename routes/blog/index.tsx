// Copyright 2023-2024 the Deno authors. All rights reserved. MIT license.
import { defineRoute } from '$fresh/server.ts';
import GitHubAvatarImg from '@/components/GitHubAvatarImg.tsx';
import Head from '@/components/Head.tsx';
import { timeAgo } from '@/utils/display.ts';
import { getPosts, type Post } from '@/utils/posts.ts';

function PostCard(props: Post) {
  const publishDate = !props.publishedAt ? null : new Date(props.publishedAt);
  return (
    <div class='py-8'>
      <a class='sm:col-span-2' href={`/blog/${props.slug}`}>
        <h2 class='text-2xl font-bold'>{props.title}</h2>
        <p class='text-gray-500'>
          <GitHubAvatarImg login='moimikey' size={24} class='mr-2' />
          <a class='hover:underline' href={`/users/moimikey`}>
            moimikey
          </a>{' '}
          {publishDate && timeAgo(publishDate)}
        </p>
        <div class='mt-4'>{props.summary}</div>
      </a>
    </div>
  );
}

export default defineRoute(async (_req, ctx) => {
  const posts = await getPosts();

  return (
    <>
      <Head title='Blog' href={ctx.url.href} />
      <main class='flex flex-col justify-center w-full max-w-5xl p-0 mx-auto my-0'>
        <div class='mb-8 text-center'>
          <h1 class='heading-styles'>Blog</h1>
          <p class='text-gray-500'>
            Tidings by <a href='/users/moimikey'>@moimikey</a>
          </p>
        </div>
        <div class='flex flex-col md:flex-row columns-1 gap-4'>
          {posts.map((post: Post) => <PostCard key={post.slug} {...post} />)}
        </div>
      </main>
    </>
  );
});
