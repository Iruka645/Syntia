import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import LoginPage from "./(auth)/login/page";
import CharacterSelection from "./characters/page";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/characters");
  }

  return <LoginPage />;
}
