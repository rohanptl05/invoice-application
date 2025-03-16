import NextAuth from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import connectDB from "@/db/connectDb";
import User from "@/models/User";

export const authOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account.provider === "github") {
        await connectDB();
        const existingUser = await User.findOne({ email: user.email });

        if (!existingUser) {
          // Create a new user with default values for required fields
          await User.create({
            name: user.name || "GitHub User",
            email: user.email,
            image: user.image || "",
            address: "N/A",
            phone: "N/A",
            company: "N/A",
            password: "N/A",
          });
          
        }
        return true;
      }
      return false;
    },

    async session({ session }) {
      if (session?.user?.email) {
        await connectDB();
        const dbUser = await User.findOne({ email: session.user.email });

        if (dbUser) {
          session.user.name = dbUser.name;
        }
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
