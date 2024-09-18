"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SettingsModal } from "@/components/SettingsModal";
import { useStore } from "@/store/useStore";

export function Navbar() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { searchText, setSearchText } = useStore();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
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
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </nav>
  );
}
