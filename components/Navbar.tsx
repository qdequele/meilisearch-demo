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
    <div className="border-b">
      <div className="flex items-center justify-between mx-6 my-3">
        <div className="flex items-center">
          <Image
            src="/meilisearch.svg"
            alt="Meilisearch Logo"
            width={40}
            height={40}
          />
          <h1 className="pl-6 font-bold text-lg">Meilisearch Demo</h1>
        </div>
        <div className="flex-grow mx-4">
          <Input
            type="text"
            placeholder="Search..."
            value={searchText}
            onChange={handleSearchChange}
            className="w-full"
          />
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsSettingsOpen(true)}
        >
          <Settings className="h-5 w-5" />
          <span className="sr-only">Settings</span>
        </Button>
      </div>
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}
