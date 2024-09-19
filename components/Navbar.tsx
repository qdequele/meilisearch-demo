"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Settings, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SettingsModal } from "@/components/SettingsModal";
import { useStore } from "@/store/useStore";
import { useRouter, useSearchParams } from "next/navigation";

export function Navbar() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { searchText, setSearchText, settings, setSettings } = useStore();
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check if settings are loaded from local storage
    const storedSettings = localStorage.getItem("searchSettings");
    if (storedSettings) {
      setSettingsLoaded(true);
    }

    // Check for config in URL and load it
    const config = searchParams.get("config");
    if (config) {
      try {
        const decodedSettings = JSON.parse(atob(config));
        setSettings(decodedSettings);
        // Remove the query parameter from the URL
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
      } catch (error) {
        console.error("Failed to parse config:", error);
      }
    }
  }, [setSettings, searchParams]);

  useEffect(() => {
    if (
      settingsLoaded &&
      (!settings.url || !settings.apiKey || !settings.index)
    ) {
      setIsSettingsOpen(true);
    }
  }, [settings, settingsLoaded]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  const handleShare = () => {
    const encodedSettings = btoa(JSON.stringify(settings));
    const shareUrl = `${window.location.origin}?config=${encodedSettings}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      alert("Share URL copied to clipboard!");
    });
  };

  return (
    <nav className="bg-primary text-primary-foreground shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Image
              src="/meilisearch.svg"
              alt="Meilisearch Logo"
              width={40}
              height={40}
            />
            <h1 className="text-xl font-bold">Meilisearch Demo</h1>
          </div>
          <div className="flex-grow mx-4 max-w-2xl">
            <Input
              type="text"
              placeholder="Search..."
              value={searchText}
              onChange={handleSearchChange}
              className="w-full bg-secondary text-secondary-foreground placeholder-secondary-foreground/50"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleShare}
              className="text-primary-foreground hover:bg-secondary/50"
            >
              <Share2 className="h-5 w-5" />
              <span className="sr-only">Share</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSettingsOpen(true)}
              className="text-primary-foreground hover:bg-secondary/50"
            >
              <Settings className="h-5 w-5" />
              <span className="sr-only">Settings</span>
            </Button>
          </div>
        </div>
      </div>
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </nav>
  );
}
