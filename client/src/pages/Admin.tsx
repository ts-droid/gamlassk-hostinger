import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Redirect } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import NewsManagement from "@/components/admin/NewsManagement";
import MembershipManagement from "@/components/admin/MembershipManagement";
import RoleManagement from "@/components/admin/RoleManagement";
import UserManagement from "@/components/admin/UserManagement";
import MemberRegistry from "@/pages/admin/MemberRegistry";
import GalleryManagement from "@/components/admin/GalleryManagement";
import EventsManagement from "@/components/admin/EventsManagement";
import CMSDashboard from "@/components/admin/CMSDashboard";
import DocumentManagement from "@/components/admin/DocumentManagement";
import PaymentVerification from "@/components/admin/PaymentVerification";
import { PageHero, SiteFooter, SiteHeader } from "@/components/SiteChrome";

function normalizePermissions(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string");
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.filter((item): item is string => typeof item === "string");
      }
    } catch {
      return value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }

  return [];
}

export default function Admin() {
  const { user, isLoading } = useAuth();
  const { data: rolesData } = trpc.roles.list.useQuery();
  const [userRole, setUserRole] = useState<any>(null);
  const [userPermissions, setUserPermissions] = useState<string[]>([]);

  useEffect(() => {
    if (user?.roleId && rolesData) {
      const role = rolesData.find(r => r.id === user.roleId);
      if (role) {
        setUserRole(role);
        setUserPermissions(normalizePermissions(role.permissions));
      }
    }
  }, [user, rolesData]);

  const hasPermission = (permission: string) => {
    return userPermissions.includes('manage_all') || userPermissions.includes(permission);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Laddar...</div>;
  }

  if (!user || user.role !== "admin") {
    return <Redirect to="/" />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SiteHeader />
      <PageHero
        title="Administratörspanel"
        description={`Välkommen ${user.name}. Här hanterar du innehåll, medlemmar, roller och dokument.`}
      />

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="news" className="w-full">
          <TabsList className="flex flex-wrap gap-2 h-auto w-full max-w-5xl">
            {hasPermission('manage_news') && <TabsTrigger value="news" className="flex-shrink-0">Nyheter</TabsTrigger>}
            {hasPermission('manage_members') && <TabsTrigger value="memberships" className="flex-shrink-0">Medlemsansökningar</TabsTrigger>}
            {hasPermission('view_members') && <TabsTrigger value="members" className="flex-shrink-0">Medlemsregister</TabsTrigger>}
            {hasPermission('manage_news') && <TabsTrigger value="gallery" className="flex-shrink-0">Bildgalleri</TabsTrigger>}
            {hasPermission('manage_news') && <TabsTrigger value="events" className="flex-shrink-0">Evenemang</TabsTrigger>}
            {hasPermission('manage_all') && <TabsTrigger value="cms" className="flex-shrink-0">CMS</TabsTrigger>}
            {hasPermission('manage_all') && <TabsTrigger value="documents" className="flex-shrink-0">Dokument</TabsTrigger>}
            {hasPermission('manage_all') && <TabsTrigger value="payments" className="flex-shrink-0">Betalningar</TabsTrigger>}
            {hasPermission('manage_roles') && <TabsTrigger value="roles" className="flex-shrink-0">Roller</TabsTrigger>}
            {hasPermission('manage_users') && <TabsTrigger value="users" className="flex-shrink-0">Användare</TabsTrigger>}
          </TabsList>

          <TabsContent value="news" className="mt-6">
            <NewsManagement />
          </TabsContent>

          <TabsContent value="memberships" className="mt-6">
            <MembershipManagement />
          </TabsContent>

          <TabsContent value="roles" className="mt-6">
            <RoleManagement />
          </TabsContent>

          <TabsContent value="users" className="mt-6">
            <UserManagement />
          </TabsContent>

          <TabsContent value="members" className="mt-6">
            <MemberRegistry />
          </TabsContent>

          <TabsContent value="gallery" className="mt-6">
            <GalleryManagement />
          </TabsContent>

          <TabsContent value="events" className="mt-6">
            <EventsManagement />
          </TabsContent>

          <TabsContent value="cms" className="mt-6">
            <CMSDashboard />
          </TabsContent>

          <TabsContent value="documents" className="mt-6">
            <DocumentManagement />
          </TabsContent>

          <TabsContent value="payments" className="mt-6">
            <PaymentVerification />
          </TabsContent>
        </Tabs>
      </main>
      <SiteFooter />
    </div>
  );
}
