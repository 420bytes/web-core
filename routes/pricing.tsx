// Copyright 2023-2024 the Deno authors. All rights reserved. MIT license.
import { defineRoute } from '$fresh/server.ts';
import Head from '@/components/Head.tsx';
import { PremiumBadge } from '@/components/PremiumBadge.tsx';
import type { State } from '@/plugins/session.ts';
import { formatCurrency } from '@/utils/display.ts';
import { assertIsPrice, isStripeEnabled, stripe } from '@/utils/stripe.ts';
import Stripe from 'stripe';
import IconCheckCircle from 'tabler_icons_tsx/circle-check.tsx';

const CARD_STYLES =
  'shadow-md flex flex-col flex-1 space-y-8 p-8 ring-1 ring-gray-300 ring-opacity-50 rounded-xl dark:bg-gray-700 bg-gradient-to-r';
const CHECK_STYLES = 'w-6 h-6 text-primary shrink-0 inline-block mr-2';

function FreePlanCard() {
  return (
    <div class={CARD_STYLES}>
      <div class='flex-1 space-y-4'>
        <div>
          <h2 class='text-xl font-bold'>Free</h2>
          <p class='text-gray-500'>
            Discover and share your favorite Deno projects.
          </p>
        </div>
        <p>
          <span class='text-4xl font-bold'>Free</span>
        </p>
        <p>
          <IconCheckCircle class={CHECK_STYLES} />
          Share
        </p>
        <p>
          <IconCheckCircle class={CHECK_STYLES} />
          Comment
        </p>
        <p>
          <IconCheckCircle class={CHECK_STYLES} />
          Vote
        </p>
      </div>

      <div class='text-center'>
        <a href='/account/manage' class='block w-full button-styles rounded-md'>
          Manage
        </a>
      </div>
    </div>
  );
}

interface PremiumCardPlanProps {
  product: Stripe.Product;
  isSubscribed?: boolean;
}

function PremiumPlanCard(props: PremiumCardPlanProps) {
  assertIsPrice(props.product.default_price);
  return (
    <div class={CARD_STYLES + ' border-primary border'}>
      <div class='flex-1 space-y-4'>
        <div>
          <h2 class='text-xl font-bold'>{props.product.name}</h2>
          <p class='text-gray-500'>{props.product.description}</p>
        </div>
        <p>
          <span class='text-4xl font-bold'>
            {formatCurrency(
              props.product.default_price.unit_amount! / 100,
              props.product.default_price?.currency,
            )}
          </span>
          <span>/ {props.product.default_price.recurring?.interval}</span>
        </p>
        <p>
          <IconCheckCircle class={CHECK_STYLES} />
          Your comments appear first
        </p>
        <p>
          <IconCheckCircle class={CHECK_STYLES} />
          Downvoting
        </p>
        <p>
          <IconCheckCircle class={CHECK_STYLES} />
          Official pro user badge <PremiumBadge class='inline w-5 h-5' />
        </p>
      </div>

      <div class='text-center'>
        {props.isSubscribed
          ? (
            <a
              class='block w-full button-styles rounded-md'
              href='/account/manage'
            >
              Manage
            </a>
          )
          : (
            <a
              class='block w-full button-styles rounded-md'
              href='/account/upgrade'
            >
              Upgrade
            </a>
          )}
      </div>
    </div>
  );
}

function EnterprisePricingCard() {
  return (
    <div class={CARD_STYLES}>
      <div class='flex-1 space-y-4'>
        <div>
          <h2 class='text-xl font-bold'>Enterprise</h2>
          <p class='text-gray-500'>Make the Deno Hunt experience yours.</p>
        </div>
        <p>
          <span class='text-4xl font-bold'>Contact us</span>
        </p>
        <p>
          <IconCheckCircle class={CHECK_STYLES} />
          Advanced reporting
        </p>
        <p>
          <IconCheckCircle class={CHECK_STYLES} />
          Direct line to{' '}
          <a href='/users/lambtron' class='text-secondary'>
            Andy
          </a>{' '}
          and{' '}
          <a href='/users/iuioiua' class='text-secondary'>
            Asher
          </a>
        </p>
        <p>
          <IconCheckCircle class={CHECK_STYLES} />
          Complimentary Deno merch
        </p>
      </div>

      <div class='text-center'>
        <a
          href='mailto:andy@deno.com'
          class='block w-full button-styles rounded-md'
        >
          Contact us
        </a>
      </div>
    </div>
  );
}

export default defineRoute<State>(async (_req, ctx) => {
  if (!isStripeEnabled()) return await ctx.renderNotFound();

  const { data } = await stripe.products.list({
    expand: ['data.default_price'],
    active: true,
  });

  if (data.length === 0) {
    throw new Error(
      'No Stripe products have been found. Please see https://github.com/denoland/saaskit#set-up-stripe-optional to set up Stripe locally and create a Stripe product.',
    );
  }

  return (
    <>
      <Head title='Pricing' href={ctx.url.href} />
      <main class='flex flex-col justify-center flex-1 w-full max-w-5xl px-4 mx-auto'>
        <div class='mb-8 text-center'>
          <h1 class='heading-styles'>Pricing</h1>
          <p class='text-gray-500'>Choose the plan that suites you</p>
        </div>
        <div class='flex flex-col md:flex-row gap-4'>
          <FreePlanCard />
          <PremiumPlanCard
            product={data[0]}
            isSubscribed={ctx.state.sessionUser?.isSubscribed}
          />
          <EnterprisePricingCard />
        </div>
      </main>
    </>
  );
});
