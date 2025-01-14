import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Aside } from "./_components/aside";
import { Header } from "./_components/header";
import { AuthProvider } from "@/providers/auth-provider";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthProvider>
      <SidebarProvider>
        <Aside />
        <SidebarInset>
          <main className="w-full">
            <Header />
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </AuthProvider>
  );
}
