import { MongoDBAdapter } from "@auth/mongodb-adapter";
import NextAuth from "next-auth";
import Resend from "next-auth/providers/resend";
import clientPromise from "./db/client";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Resend],
  adapter: MongoDBAdapter(clientPromise),
});
