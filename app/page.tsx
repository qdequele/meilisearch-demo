"use client";

import { useEffect, useState } from "react";
import { MeiliSearch } from "meilisearch";
import { useStore } from "@/store/useStore";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

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
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (settings.url && settings.apiKey) {
      const newClient = new MeiliSearch({
        host: settings.url,
        apiKey: settings.apiKey,
      });
      setClient(newClient);
    }
  }, [settings.url, settings.apiKey]);

  // New useEffect for initial search
  useEffect(() => {
    const performInitialSearch = async () => {
      if (client && settings.index) {
        setIsLoading(true);
        try {
          const results = await client
            .index(settings.index)
            .search("", { limit: 10 });
          setSearchResults(results.hits as SearchResult[]);
        } catch (error) {
          console.error("Initial search error:", error);
          setSearchResults([]);
        } finally {
          setIsLoading(false);
        }
      }
    };

    performInitialSearch();
  }, [client, settings.index]);

  useEffect(() => {
    const performSearch = async () => {
      if (client && settings.index) {
        setIsLoading(true);
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
        } finally {
          setIsLoading(false);
        }
      } else {
        setSearchResults([]);
      }
    };

    if (searchText) {
      performSearch();
    }
  }, [client, settings, searchText]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-foreground">
        {searchText ? "Search Results" : "All Documents"}
      </h1>
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, index) => (
            <Card key={index} className="overflow-hidden bg-card">
              <CardContent className="p-0">
                <div className="flex items-center space-x-4 p-6">
                  <Skeleton className="h-12 w-12 rounded-full bg-muted" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px] bg-muted" />
                    <Skeleton className="h-4 w-[200px] bg-muted" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-6">
          {searchResults.map((result) => (
            <Card
              key={result.id}
              className="overflow-hidden hover:bg-accent transition-colors duration-300 bg-card"
            >
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  {settings.imageAttr &&
                    typeof result[settings.imageAttr] === "string" && (
                      <div className="flex-shrink-0">
                        <Image
                          src={result[settings.imageAttr] as string}
                          alt={
                            (typeof result[settings.titleAttr] === "string"
                              ? result[settings.titleAttr]
                              : "No title") as string
                          }
                          width={80}
                          height={80}
                          className="rounded-lg object-cover"
                        />
                      </div>
                    )}
                  <div className="flex-grow">
                    <h2 className="text-xl font-semibold mb-2 line-clamp-1 text-card-foreground">
                      {settings.titleAttr &&
                      typeof result[settings.titleAttr] === "string"
                        ? (result[settings.titleAttr] as string)
                        : "No title"}
                    </h2>
                    <p className="text-muted-foreground line-clamp-3">
                      {settings.descAttr &&
                      typeof result[settings.descAttr] === "string"
                        ? (result[settings.descAttr] as string)
                        : "No description"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
