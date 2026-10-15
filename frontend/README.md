This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `src/app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to load [Geist](https://vercel.com/font).

## Agentic Commerce configuration

The frontend uses the FastAPI service at `http://127.0.0.1:8000` by default. Set `NEXT_PUBLIC_API_URL` to the API origin before starting or building the app when using another environment.

JWT access tokens are stored in `localStorage` under `access_token` to remain compatible with the existing backend. Any script running in the page can read this token, so a cross-site scripting (XSS) flaw could expose a user's account. Keep dependencies current, avoid rendering untrusted HTML, and use a strict Content Security Policy. A future backend change should move authentication to secure, `HttpOnly`, `SameSite` cookies so JavaScript cannot read the token.

The backend currently has no profile update, password reset, email verification, delivery details, or payment gateway support. Checkout records the order and updates stock; orders remain pending. Order listing and owner-scoped order details are available at `GET /orders` and `GET /orders/{id}`.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
- [Next.js GitHub repository](https://github.com/vercel/next.js) - feedback and contributions are welcome.

## Deploy on Vercel

The easiest way to deploy this app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app).

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
