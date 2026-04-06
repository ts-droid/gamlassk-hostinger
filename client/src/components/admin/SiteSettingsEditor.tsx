import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Save, Upload } from "lucide-react";
import { ImageUpload } from "@/components/ImageUpload";

export default function SiteSettingsEditor() {
  const [settings, setSettings] = useState<Record<string, string>>({
    site_logo: "",
    site_name: "Föreningen Gamla SSK-are",
    contact_email: "",
    contact_phone: "",
    contact_address: "",
  });

  const { data: settingsData, refetch } = trpc.cms.getSettings.useQuery();

  const updateSettingMutation = trpc.cms.updateSetting.useMutation({
    onSuccess: () => {
      toast.success("Inställning uppdaterad!");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Kunde inte uppdatera inställning");
    },
  });

  useEffect(() => {
    if (settingsData) {
      const settingsMap: Record<string, string> = {};
      settingsData.forEach((setting) => {
        settingsMap[setting.key] = setting.value;
      });
      setSettings((prev) => ({ ...prev, ...settingsMap }));
    }
  }, [settingsData]);

  const handleSave = (key: string, value: string, type: string = "text") => {
    updateSettingMutation.mutate({ key, value, type });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Webbplatslogotyp</CardTitle>
          <CardDescription>
            Ladda upp en ny logotyp för webbplatsen
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Nuvarande logotyp</Label>
            {settings.site_logo && (
              <div className="mt-2 inline-block">
                <div 
                  className="h-24 w-24 border rounded p-2"
                  style={{
                    backgroundImage: 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)',
                    backgroundSize: '20px 20px',
                    backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
                  }}
                >
                  <img
                    src={settings.site_logo}
                    alt="Site logo"
                    className="h-full w-full object-contain"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Rutnätsmönstret visar om bilden har transparent bakgrund</p>
              </div>
            )}
          </div>
          <div>
            <Label>Ladda upp ny logotyp</Label>
            <ImageUpload
              value={settings.site_logo}
              onChange={(url) => {
                setSettings({ ...settings, site_logo: url });
                handleSave("site_logo", url, "image");
              }}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Webbplatsinformation</CardTitle>
          <CardDescription>
            Grundläggande information om webbplatsen
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="site_name">Webbplatsnamn</Label>
            <div className="flex gap-2">
              <Input
                id="site_name"
                value={settings.site_name}
                onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
                placeholder="Föreningen Gamla SSK-are"
              />
              <Button onClick={() => handleSave("site_name", settings.site_name)}>
                <Save className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Kontaktinformation</CardTitle>
          <CardDescription>
            Kontaktuppgifter som visas på webbplatsen
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="contact_email">E-postadress</Label>
            <div className="flex gap-2">
              <Input
                id="contact_email"
                type="email"
                value={settings.contact_email}
                onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                placeholder="info@gamlassk.se"
              />
              <Button onClick={() => handleSave("contact_email", settings.contact_email)}>
                <Save className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="contact_phone">Telefonnummer</Label>
            <div className="flex gap-2">
              <Input
                id="contact_phone"
                type="tel"
                value={settings.contact_phone}
                onChange={(e) => setSettings({ ...settings, contact_phone: e.target.value })}
                placeholder="070-123 45 67"
              />
              <Button onClick={() => handleSave("contact_phone", settings.contact_phone)}>
                <Save className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="contact_address">Adress</Label>
            <div className="flex gap-2">
              <Input
                id="contact_address"
                value={settings.contact_address}
                onChange={(e) => setSettings({ ...settings, contact_address: e.target.value })}
                placeholder="Scaniarinken, Södertälje"
              />
              <Button onClick={() => handleSave("contact_address", settings.contact_address)}>
                <Save className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
