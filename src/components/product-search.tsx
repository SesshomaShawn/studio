"use client";

import { useState, useTransition, useCallback, useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2 } from "lucide-react";
import { getSearchSuggestions } from "@/ai/flows/dynamic-search-suggestions";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

function debounce<T extends (...args: any[]) => void>(func: T, wait: number) {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export function ProductSearch({ placeholder }: { placeholder: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [query, setQuery] = useState(searchParams.get("query") || "");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [isPopoverOpen, setPopoverOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = (newQuery: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newQuery) {
      params.set("query", newQuery);
    } else {
      params.delete("query");
    }
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
      setPopoverOpen(false);
    });
  };

  const fetchSuggestions = useCallback(
    debounce(async (searchText: string) => {
      if (searchText.length < 3) {
        setSuggestions([]);
        setPopoverOpen(false);
        return;
      }
      setIsLoadingSuggestions(true);
      try {
        const result = await getSearchSuggestions({ searchText });
        setSuggestions(result.suggestions);
        if (result.suggestions.length > 0) {
          setPopoverOpen(true);
        }
      } catch (error) {
        console.error("Failed to fetch suggestions:", error);
        setSuggestions([]);
      } finally {
        setIsLoadingSuggestions(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    fetchSuggestions(query);
  }, [query, fetchSuggestions]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSearch(query);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    handleSearch(suggestion);
  };

  return (
    <div className="relative w-full max-w-md">
      <form onSubmit={handleSubmit} className="relative">
        <Popover open={isPopoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger asChild>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </PopoverTrigger>
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              if (suggestions.length > 0) setPopoverOpen(true);
            }}
            placeholder={placeholder}
            className="pl-10 w-full"
            aria-label="Search products"
          />
        </Popover>

        {isPending || isLoadingSuggestions ? (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        ) : null}
      </form>
      {isPopoverOpen && suggestions.length > 0 && (
         <PopoverContent 
            className="w-[--radix-popover-trigger-width] p-0" 
            onOpenAutoFocus={(e) => e.preventDefault()}
            align="start"
          >
            <div className="flex flex-col gap-1 p-2">
              {suggestions.map((s, i) => (
                <Button
                  key={i}
                  variant="ghost"
                  className="justify-start"
                  onClick={() => handleSuggestionClick(s)}
                >
                  {s}
                </Button>
              ))}
            </div>
          </PopoverContent>
      )}
    </div>
  );
}
