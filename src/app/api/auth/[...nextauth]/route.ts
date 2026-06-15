import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"

const hasGoogleAuth =
  Boolean(process.env.GOOGLE_CLIENT_ID) && Boolean(process.env.GOOGLE_CLIENT_SECRET);

const handler = NextAuth({
  providers: hasGoogleAuth
    ? [
        GoogleProvider({
          clientId: process.env.GOOGLE_CLIENT_ID!,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
      ]
    : [],
})

export { handler as GET, handler as POST }
