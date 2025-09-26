import { Button } from "@/components/ui/button";
import { getServerAuthSession } from "@/server/auth";
import Link from "next/link";
import Sidebar from "./sidebar";

export default async function AdminLayout({
  children,
}: {
    children: React.ReactNode;
    }) {

    const session = await getServerAuthSession()
    if(!session?.user ||session?.user.role !== "ADMIN"){
        return <div className="flex items-center flex-col gap-2 justify-center h-screen">
            <h1 className="text-3xl font-bold text-gray-800">Access Denied</h1>
            <p className="mt-4 text-gray-600">You do not have permission to view this page.</p>
            <Link className="mt-6 bg-green-500 text-black rounded-full px-5 py-2 rounded-4xl" href="/">Go to Home</Link>
        </div>
    }
    return <div className="flex min-h-screen">
        <Sidebar user={session} >   {children}</Sidebar>
    </div>;
}