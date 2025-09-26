import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    JWT_SECRET: z.string(),
    NODE_ENV: z
      .enum(['development', 'test', 'production'])
      .default('development'),
    NEXTAUTH_SECRET:
      process.env.NODE_ENV === 'production'
        ? z.string()
        : z.string().optional(),
    NEXTAUTH_URL: z.preprocess(
      // This makes Vercel deployments not fail if you don't set NEXTAUTH_URL
      // Since NextAuth.js automatically uses the VERCEL_URL if present.
      (str) => process.env.VERCEL_URL ?? str,
      // VERCEL_URL doesn't include `https` so it cant be validated as a URL
      process.env.VERCEL ? z.string() : z.string().url()
    ),
    PUBLIC_URL: z.string().url(),

    CLOUDFARE_TOKEN_VALUE:z.string(),
    CLOUDFLARE_R2_ACCESS_KEY:z.string(),
    CLOUDFLARE_R2_SECRET_KEY:z.string(),
    CLOUDFLARE_ACCOUNT_ID:z.string(),
    CLOUDFLARE_R2_BUCKET_NAME:z.string(),

    GOOGLE_CLIENT_ID: z.string(),
    GOOGLE_CLIENT_SECRET: z.string(),


    NM_EMAIL: z.string(),
    NM_PASS: z.string(),
    RAZORPAY_KEY_ID: z.string(),
    RAZORPAY_KEY_SECRET: z.string(),
    //   UPSTASH_REDIS_URL: z.string().url(),
    //   UPSTASH_REDIS_TOKEN: z.string(),

    //   RAZORPAY_KEY_SECRET: z.string(),
  },

  // shared: {
  //   NEXT_PUBLIC_RAZORPAY_KEY_ID: z.string(),
  //   NEXT_PUBLIC_SJCET_PAYMENT_LINK: z.string().url(),
  // },

  // /**
  //  * Specify your client-side environment variables schema here. This way you can ensure the app
  //  * isn't built with invalid env vars. To expose them to the client, prefix them with
  //  * `NEXT_PUBLIC_`.
  //  */
  client: {
    NEXT_PUBLIC_WEBSITE_URL: z.string().url(),
    // NEXT_PUBLIC_CLIENTVAR: z.string(),
    NEXT_PUBLIC_JWT_SECRET: z.string(),
    NEXT_PUBLIC_RAZORPAY_KEY_ID: z.string()
  },

  // /**
  //  * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
  //  * middlewares) or client-side so we need to destruct manually.
  //  */
  runtimeEnv: {
    NEXT_PUBLIC_WEBSITE_URL: process.env.NEXT_PUBLIC_WEBSITE_URL,
    PUBLIC_URL: process.env.PUBLIC_URL,
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXT_PUBLIC_JWT_SECRET: process.env.JWT_SECRET,
    RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
    RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
    NEXT_PUBLIC_RAZORPAY_KEY_ID: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,

    JWT_SECRET: process.env.JWT_SECRET,

    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,

    NM_EMAIL: process.env.NM_EMAIL,
    NM_PASS: process.env.NM_PASS,

    CLOUDFARE_TOKEN_VALUE:process.env.CLOUDFARE_TOKEN_VALUE,
    CLOUDFLARE_R2_ACCESS_KEY:process.env.CLOUDFLARE_R2_ACCESS_KEY,
    CLOUDFLARE_R2_SECRET_KEY:process.env.CLOUDFLARE_R2_SECRET_KEY,
    CLOUDFLARE_ACCOUNT_ID:process.env.CLOUDFLARE_ACCOUNT_ID,
    CLOUDFLARE_R2_BUCKET_NAME: process.env.CLOUDFLARE_R2_BUCKET_NAME,
    //   UPSTASH_REDIS_URL: process.env.UPSTASH_REDIS_URL,
    //   UPSTASH_REDIS_TOKEN: process.env.UPSTASH_REDIS_TOKEN,

    // NEXT_PUBLIC_RAZORPAY_KEY_ID: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    //   RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,

    //   NEXT_PUBLIC_SJCET_PAYMENT_LINK: process.env.NEXT_PUBLIC_SJCET_PAYMENT_LINK,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  // skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  // emptyStringAsUndefined: true,
});
