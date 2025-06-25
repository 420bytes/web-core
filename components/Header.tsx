// Copyright 2023-2024 the Deno authors. All rights reserved. MIT license.
import Button from '@/islands/Button.tsx';
import { SITE_NAME } from '@/utils/constants.ts';
import { User } from '@/utils/db.ts';
import { isStripeEnabled } from '@/utils/stripe.ts';
import IconMenu from 'tabler_icons_tsx/menu-2.tsx';
import IconX from 'tabler_icons_tsx/x.tsx';

export interface HeaderProps {
  /** Currently signed-in user */
  sessionUser?: User;
  /**
   * URL of the current page. This is used for highlighting the currently
   * active page in navigation.
   */
  url: URL;
}

export default function Header(props: HeaderProps) {
  return (
    <header class='flex-col site-bar-styles sm:flex-row'>
      <input
        type='checkbox'
        id='nav-toggle'
        class='hidden [:checked&+*>:last-child>*>:first-child]:hidden [:checked&+*>:last-child>*>:last-child]:block checked:siblings:last-child:flex'
      />

      <div class='flex items-center justify-between'>
        <a href='/' class='shrink-0'>
          <img
            width='128'
            height='42'
            src='/logo.svg'
            alt={SITE_NAME + ' logo'}
            class='w-[128x] h-[42px]'
          />
        </a>
        <div class='flex items-center gap-4'>
          <label
            tabIndex={0}
            class='sm:hidden'
            id='nav-toggle-label'
            htmlFor='nav-toggle'
          >
            <IconMenu class='w-6 h-6' />
            <IconX class='hidden w-6 h-6' />
          </label>
        </div>
      </div>
      <script>
        {`
          const navToggleLabel = document.getElementById('nav-toggle-label');
          navToggleLabel.addEventListener('keydown', () => {
            if (event.code === 'Space' || event.code === 'Enter') {
              navToggleLabel.click();
              event.preventDefault();
            }
          });
        `}
      </script>
      <nav class='hidden flex-col gap-x-4 divide-y divide-solid sm:flex sm:items-center sm:flex-row sm:divide-y-0'>
        <a
          href='/dashboard'
          class='link-styles data-[ancestor]:!text-primary data-[ancestor]:dark:!text-white nav-item'
        >
          Dashboard
        </a>
        <a
          href={props.sessionUser ? `/links/${props.sessionUser.login}` : '/links/public'}
          class='link-styles data-[current]:!text-primary data-[current]:dark:!text-white nav-item'
        >
          Links
        </a>
        {isStripeEnabled() && (
          <a
            href='/pricing'
            class='link-styles data-[current]:!text-primary data-[current]:dark:!text-white nav-item'
          >
            Pricing
          </a>
        )}
        {props.sessionUser
          ? (
            <a
              href='/account'
              class='link-styles data-[current]:!text-primary data-[current]:dark:!text-white nav-item'
            >
              Account
            </a>
          )
          : <Button href='/signin'>Sign in</Button>}
      </nav>
    </header>
  );
}
