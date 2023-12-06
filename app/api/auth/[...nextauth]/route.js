//CHECK OUT NEXTAUTH DOCUMENTATION FOR MORE INFO

import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';


import { connectToDB } from '@utils/databse';
import User from '@models/user';

//Check out nextauth documentation
const handler = NextAuth({
  // secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    //Get data of logged in user
    async session({ session }) {
      const sessionUser = await User.findOne({
        email: session.user.email,
      });

      session.user.id = sessionUser._id.toString();

      return session;
    },

    //sign in function doubles as user creation function
    async signIn({ profile }) {
      try {
        //serverless route
        await connectToDB();

        //check if user already exists
        const userExists = await User.findOne({
          email: profile.email,
        });

        //if not, create a new user
        if (!userExists) {
          await User.create({
            email: profile.email,
            username: profile.name
              .replace(' ', '')
              .toLowerCase(),
            image: profile.picture,
          });
        }
        return true;
      } catch (error) {
        console.log(error);
        return false;
      }
    },
  },
});

export { handler as GET, handler as POST };
