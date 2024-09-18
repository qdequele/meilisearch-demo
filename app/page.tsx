"use client";

import { useEffect, useState } from "react";
import { MeiliSearch } from "meilisearch";
import { useStore } from "@/store/useStore";
import Image from "next/image";

interface SearchResult {
  id: string;
  [key: string]: unknown;
}

interface SearchParams {
  limit: number;
  hybrid?: {
    semanticRatio: number;
    embedder: string;
  };
}

export default function Home() {
  const { searchText, settings } = useStore();
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [client, setClient] = useState<MeiliSearch | null>(null);

  useEffect(() => {
    if (settings.url && settings.apiKey) {
      const newClient = new MeiliSearch({
        host: settings.url,
        apiKey: settings.apiKey,
      });
      setClient(newClient);
    }
  }, [settings.url, settings.apiKey]);

  useEffect(() => {
    const performSearch = async () => {
      if (client && settings.index && searchText) {
        try {
          const searchParams: SearchParams = {
            limit: 10,
          };

          if (settings.embedder) {
            searchParams.hybrid = {
              semanticRatio: settings.hybridRatio,
              embedder: settings.embedder,
            };
          }

          const results = await client
            .index(settings.index)
            .search(searchText, searchParams);
          setSearchResults(results.hits as SearchResult[]);
        } catch (error) {
          console.error("Search error:", error);
          setSearchResults([]);
        }
      } else {
        setSearchResults([]);
      }
    };

    performSearch();
  }, [client, settings, searchText]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid gap-6">
        {searchResults.map((result) => (
          <div
            key={result.id}
            className="flex bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
          >
            {settings.imageAttr && result[settings.imageAttr] && (
              <div className="w-1/4 min-w-[100px] max-w-[200px]">
                <Image
                  src={result[settings.imageAttr] as string}
                  alt={
                    (result[settings.titleAttr] as string) ||
                    "Search result image"
                  }
                  width={200}
                  height={200}
                  className="object-cover w-full h-full"
                />
              </div>
            )}
            <div className="flex-1 p-4 flex flex-col">
              <h2 className="text-xl font-semibold mb-2 truncate">
                {(result[settings.titleAttr] as string) || "No title"}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 line-clamp-5">
                {(result[settings.descAttr] as string) || "No description"}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
