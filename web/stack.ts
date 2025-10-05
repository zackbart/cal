import { StackServerApp } from "@stackframe/stack";

export const stackServerApp = new StackServerApp({
  tokenStore: "nextjs-cookie",
  urls: {
    signIn: "/auth/sign-in",
    signUp: "/auth/sign-up",
    afterSignIn: "/dashboard",
    afterSignUp: "/dashboard",
  },
});
