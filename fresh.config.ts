// Copyright 2023-2024 the Deno authors. All rights reserved. MIT license.
import tailwindPlugin from '$fresh/plugins/tailwind.ts';
import { FreshConfig } from '$fresh/src/server/types.ts';
import { InjectCSSPlugin } from '$inject-css/index.ts';
import errorHandling from '@/plugins/error_handling.ts';
import kvOAuthPlugin from '@/plugins/kv_oauth.ts';
import securityHeaders from '@/plugins/security_headers.ts';
import sessionPlugin from '@/plugins/session.ts';
import welcomePlugin from '@/plugins/welcome.ts';
import { kvInsightsPlugin } from 'https://deno.land/x/deno_kv_insights@v0.8.4-beta/mod.ts';
import { ga4Plugin } from 'https://deno.land/x/fresh_ga4@0.0.4/mod.ts';

export default {
  plugins: [
    ga4Plugin(),
    welcomePlugin,
    kvOAuthPlugin,
    sessionPlugin,
    tailwindPlugin(),
    InjectCSSPlugin(),
    kvInsightsPlugin(),
    errorHandling,
    securityHeaders,
  ],
} satisfies FreshConfig;
