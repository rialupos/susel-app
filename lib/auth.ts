import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const usuario = await prisma.usuario.findUnique({
          where: { email: credentials.email },
        });
        if (!usuario || !usuario.ativo) return null;
        const senhaCorreta = await bcrypt.compare(
          credentials.password,
          usuario.senhaHash
        );
        if (!senhaCorreta) return null;
        return {
          id: usuario.id,
          name: usuario.nome,
          email: usuario.email,
          perfil: usuario.perfil,
          secretaria: usuario.secretaria,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.perfil = (user as any).perfil;
        token.secretaria = (user as any).secretaria;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id;
        (session.user as any).perfil = token.perfil;
        (session.user as any).secretaria = token.secretaria;
      }
      return session;
    },
  },
};