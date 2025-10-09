import { PrismaAdapter } from "@auth/prisma-adapter"
import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { prisma } from "@/lib/db"

const handler = NextAuth({
    adapter: PrismaAdapter(prisma),
    callbacks: {
      async jwt({ token, user }) {
        // When user first signs in
        if (user) {
          token.id = user.id; // attach user.id to the token
        }
        return token;
      },
      async session({ session, token }) {
        // Make user ID available in the session
        if (token) {
          session.user.id = token.id as string;
        }
        return session;
      },
    },
    // Configure one or more authentication providers
    providers: [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      }),
      // ...add more providers here
    ],
    session: {
      strategy: 'jwt'
    }
})

export { handler as GET, handler as POST }