import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import InviteAdminWrapper from "./InviteAdminWrapper";
import { redirect } from "next/navigation";
import AdminFormsWrapper from "./AdminFormsWrapper";

const DashboardPage = async () => {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/auth/login");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
  });

  if (!user?.emailVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600 font-semibold text-lg">Email not verified.</p>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gray-100 py-12 px-6">
      <div className="max-w-6xl mx-auto bg-white shadow-md rounded-lg p-8 space-y-6">
        <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>

        <div className="space-y-2">
          <p className="text-[#4a3b21]">
            Logged in as:{" "}
            <span className="font-medium text-[#5C4A2B]">{session.user.email}</span>
          </p>
          <p className="text-[#4a3b21]">
            Role:{" "}
            <span className="font-medium text-blue-700">{session.user.role}</span>
          </p>
        </div>

        {session.user.role === "SUPERADMIN" && (
          <div>
            <InviteAdminWrapper />
          </div>
        )}
      <div><AdminFormsWrapper /></div>

        <div className="pt-6">
          <Link href="/auth/signout">
            <button className="bg-[#5C4A2B] text-white px-4 py-2 rounded hover:bg-[#4a3b21] cursor-pointer">
              Logout
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
