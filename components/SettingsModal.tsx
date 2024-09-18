import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Check } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStore } from "@/store/useStore";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { settings, setSettings } = useStore();
  const [isUrlValid, setIsUrlValid] = useState(false);
  const [isApiKeyValid, setIsApiKeyValid] = useState(false);
  const [indexes, setIndexes] = useState<string[]>([]);
  const [embedders, setEmbedders] = useState<string[]>([]);
  const [attributes, setAttributes] = useState<string[]>([]);

  useEffect(() => {
    console.log("Settings updated:", settings);
    localStorage.setItem("searchSettings", JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    const checkHealth = async () => {
      if (settings.url) {
        try {
          const response = await fetch(`${settings.url}/health`);
          setIsUrlValid(response.ok);
        } catch {
          setIsUrlValid(false);
        }
      } else {
        setIsUrlValid(false);
      }
    };

    checkHealth();
  }, [settings.url]);

  useEffect(() => {
    const checkApiKeyAndFetchIndexes = async () => {
      if (settings.url && settings.apiKey) {
        try {
          const response = await fetch(`${settings.url}/indexes`, {
            headers: {
              Authorization: `Bearer ${settings.apiKey}`,
            },
          });
          if (response.ok) {
            const data = await response.json();
            setIsApiKeyValid(true);
            setIndexes(data.results.map((index: { uid: string }) => index.uid));
          } else {
            setIsApiKeyValid(false);
            setIndexes([]);
          }
        } catch {
          setIsApiKeyValid(false);
          setIndexes([]);
        }
      } else {
        setIsApiKeyValid(false);
        setIndexes([]);
      }
    };

    checkApiKeyAndFetchIndexes();
  }, [settings.url, settings.apiKey]);

  useEffect(() => {
    const fetchEmbedders = async () => {
      if (settings.url && settings.apiKey && settings.index) {
        try {
          const response = await fetch(
            `${settings.url}/indexes/${settings.index}/settings/embedders`,
            {
              headers: {
                Authorization: `Bearer ${settings.apiKey}`,
              },
            }
          );
          if (response.ok) {
            const data = await response.json();
            setEmbedders(Object.keys(data));
          } else {
            setEmbedders([]);
          }
        } catch {
          setEmbedders([]);
        }
      } else {
        setEmbedders([]);
      }
    };

    fetchEmbedders();
  }, [settings.url, settings.apiKey, settings.index]);

  useEffect(() => {
    const fetchIndexStats = async () => {
      if (settings.url && settings.apiKey && settings.index) {
        try {
          const response = await fetch(
            `${settings.url}/indexes/${settings.index}/stats`,
            {
              headers: {
                Authorization: `Bearer ${settings.apiKey}`,
              },
            }
          );
          if (response.ok) {
            const data = await response.json();
            // Extract field names from fieldDistribution
            const fieldNames = Object.keys(data.fieldDistribution);
            setAttributes(fieldNames);
          } else {
            setAttributes([]);
          }
        } catch {
          setAttributes([]);
        }
      } else {
        setAttributes([]);
      }
    };

    fetchIndexStats();
  }, [settings.url, settings.apiKey, settings.index]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setSettings({ ...settings, [id]: value });
  };

  const handleSliderChange = (value: number[]) => {
    setSettings({ ...settings, hybridRatio: value[0] });
  };

  const handleIndexChange = (value: string) => {
    setSettings({ ...settings, index: value, embedder: "" });
  };

  const handleEmbedderChange = (value: string) => {
    setSettings({ ...settings, embedder: value });
  };

  const handleAttributeChange = (
    attr: keyof typeof settings,
    value: string
  ) => {
    setSettings({ ...settings, [attr]: value });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Search Configuration</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="url" className="text-right">
              URL
            </Label>
            <div className="col-span-3 flex items-center">
              <Input
                id="url"
                value={settings.url}
                onChange={handleInputChange}
                className="flex-grow"
              />
              {isUrlValid && <Check className="ml-2 h-5 w-5 text-green-500" />}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="apiKey" className="text-right">
              API Key
            </Label>
            <div className="col-span-3 flex items-center">
              <Input
                id="apiKey"
                type="password"
                value={settings.apiKey}
                onChange={handleInputChange}
                className="flex-grow"
              />
              {isApiKeyValid && (
                <Check className="ml-2 h-5 w-5 text-green-500" />
              )}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="index" className="text-right">
              Index
            </Label>
            <Select
              value={settings.index}
              onValueChange={handleIndexChange}
              disabled={!isApiKeyValid}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select an index" />
              </SelectTrigger>
              <SelectContent>
                {indexes.map((index) => (
                  <SelectItem key={index} value={index}>
                    {index}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {embedders.length > 0 && (
            <>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="embedder" className="text-right">
                  Embedder
                </Label>
                <Select
                  value={settings.embedder}
                  onValueChange={handleEmbedderChange}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select an embedder" />
                  </SelectTrigger>
                  <SelectContent>
                    {embedders.map((embedder) => (
                      <SelectItem key={embedder} value={embedder}>
                        {embedder}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="hybridRatio" className="text-right">
                  Hybrid Ratio
                </Label>
                <div className="col-span-3 flex items-center gap-2">
                  <Slider
                    id="hybridRatio"
                    min={0}
                    max={1}
                    step={0.1}
                    value={[settings.hybridRatio]}
                    onValueChange={handleSliderChange}
                    className="flex-grow"
                  />
                  <span className="w-12 text-center">
                    {settings.hybridRatio.toFixed(1)}
                  </span>
                </div>
              </div>
            </>
          )}
          {attributes && attributes.length > 0 && (
            <>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="titleAttr" className="text-right">
                  Title Attribute
                </Label>
                <Select
                  value={settings.titleAttr}
                  onValueChange={(value) =>
                    handleAttributeChange("titleAttr", value)
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select title attribute" />
                  </SelectTrigger>
                  <SelectContent>
                    {attributes.map((attr) => (
                      <SelectItem key={attr} value={attr}>
                        {attr}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="descAttr" className="text-right">
                  Description Attribute
                </Label>
                <Select
                  value={settings.descAttr}
                  onValueChange={(value) =>
                    handleAttributeChange("descAttr", value)
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select description attribute" />
                  </SelectTrigger>
                  <SelectContent>
                    {attributes.map((attr) => (
                      <SelectItem key={attr} value={attr}>
                        {attr}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="imageAttr" className="text-right">
                  Image Attribute
                </Label>
                <Select
                  value={settings.imageAttr}
                  onValueChange={(value) =>
                    handleAttributeChange("imageAttr", value)
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select image attribute" />
                  </SelectTrigger>
                  <SelectContent>
                    {attributes.map((attr) => (
                      <SelectItem key={attr} value={attr}>
                        {attr}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
