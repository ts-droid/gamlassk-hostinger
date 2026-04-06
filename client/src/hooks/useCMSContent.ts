import { trpc } from "@/lib/trpc";
import { useMemo } from "react";

interface ContentSection {
  id: number;
  page: string;
  sectionKey: string;
  type: string;
  content: string | null;
  order: number;
  published: number;
}

export function useCMSContent(page: string) {
  // Cache CMS content for 5 minutes (300000ms) to reduce database queries
  const { data: contentData, isLoading } = trpc.cms.getPageContent.useQuery(
    { page },
    {
      staleTime: 5 * 60 * 1000, // 5 minutes - data is considered fresh
      gcTime: 10 * 60 * 1000, // 10 minutes - keep in cache (formerly cacheTime)
    }
  );

  const content = useMemo(() => {
    if (!contentData) return {};
    
    const contentMap: Record<string, string> = {};
    (contentData as ContentSection[]).forEach((section) => {
      if (section.published === 1) {
        contentMap[section.sectionKey] = section.content || "";
      }
    });
    
    return contentMap;
  }, [contentData]);

  const getContent = (key: string, defaultValue: string = "") => {
    return content[key] || defaultValue;
  };

  return {
    content,
    getContent,
    isLoading,
    sections: contentData as ContentSection[] || [],
  };
}

export function useSiteSettings() {
  // Cache site settings for 10 minutes since they rarely change
  const { data: settingsData, isLoading } = trpc.cms.getSettings.useQuery(
    undefined,
    {
      staleTime: 10 * 60 * 1000, // 10 minutes - data is considered fresh
      gcTime: 30 * 60 * 1000, // 30 minutes - keep in cache (formerly cacheTime)
    }
  );

  const settings = useMemo(() => {
    if (!settingsData) return {};
    
    const settingsMap: Record<string, string> = {};
    settingsData.forEach((setting) => {
      settingsMap[setting.key] = setting.value;
    });
    
    return settingsMap;
  }, [settingsData]);

  const getSetting = (key: string, defaultValue: string = "") => {
    return settings[key] || defaultValue;
  };

  return {
    settings,
    getSetting,
    isLoading,
  };
}

export function useSiteBranding() {
  const { getSetting, isLoading } = useSiteSettings();

  return {
    siteLogo: getSetting("site_header_logo", "/logo-wreath.png"),
    siteName: getSetting("site_name", "Föreningen Gamla SSK-are"),
    isLoading,
  };
}

export function useBoardMembers() {
  // Cache board members for 10 minutes since they rarely change
  const { data: membersData, isLoading } = trpc.cms.getBoardMembers.useQuery(
    undefined,
    {
      staleTime: 10 * 60 * 1000, // 10 minutes - data is considered fresh
      gcTime: 30 * 60 * 1000, // 30 minutes - keep in cache (formerly cacheTime)
    }
  );

  return {
    members: membersData || [],
    isLoading,
  };
}
