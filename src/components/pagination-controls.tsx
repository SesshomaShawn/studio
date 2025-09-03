"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMemo } from "react";

type PaginationControlsProps = {
  itemCount: number;
  itemsPerPage: number;
  currentPage: number;
};

const getPaginationRange = (totalPages: number, currentPage: number, siblingCount = 1) => {
    const totalPageNumbers = siblingCount + 5;

    if (totalPageNumbers >= totalPages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 2;

    const firstPageIndex = 1;
    const lastPageIndex = totalPages;

    if (!shouldShowLeftDots && shouldShowRightDots) {
      let leftItemCount = 3 + 2 * siblingCount;
      let leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
      return [...leftRange, '...', totalPages];
    }

    if (shouldShowLeftDots && !shouldShowRightDots) {
      let rightItemCount = 3 + 2 * siblingCount;
      let rightRange = Array.from({ length: rightItemCount }, (_, i) => totalPages - rightItemCount + i + 1);
      return [firstPageIndex, '...', ...rightRange];
    }

    if (shouldShowLeftDots && shouldShowRightDots) {
      let middleRange = Array.from({ length: 2 * siblingCount + 1 }, (_, i) => leftSiblingIndex + i);
      return [firstPageIndex, '...', ...middleRange, '...', lastPageIndex];
    }

    return [];
};


export function PaginationControls({
  itemCount,
  itemsPerPage,
  currentPage,
}: PaginationControlsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const totalPages = Math.ceil(itemCount / itemsPerPage);

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.replace(`${pathname}?${params.toString()}`);
  };

  const handleLimitChange = (limit: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("limit", limit);
    params.set("page", "1"); // Reset to first page
    router.replace(`${pathname}?${params.toString()}`);
  }

  const paginationRange = useMemo(() => getPaginationRange(totalPages, currentPage), [totalPages, currentPage]);

  if (totalPages <= 1) {
    return null;
  }
  
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="text-sm text-muted-foreground">
        <strong>{(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, itemCount)}</strong>/{itemCount}
      </div>
      <Pagination className="mx-0 w-auto">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (currentPage > 1) handlePageChange(currentPage - 1);
              }}
              className={currentPage === 1 ? "pointer-events-none opacity-50" : undefined}
            />
          </PaginationItem>

          <div className="hidden sm:flex">
            {paginationRange.map((pageNumber, index) => {
              if (typeof pageNumber === 'string') {
                  return <PaginationEllipsis key={`${pageNumber}-${index}`} />;
              }
              return (
                  <PaginationItem key={pageNumber}>
                      <PaginationLink
                      href="#"
                      onClick={(e) => {
                          e.preventDefault();
                          handlePageChange(pageNumber);
                      }}
                      isActive={pageNumber === currentPage}
                      >
                      {pageNumber}
                      </PaginationLink>
                  </PaginationItem>
              )
            })}
          </div>


          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (currentPage < totalPages) handlePageChange(currentPage + 1);
              }}
              className={currentPage === totalPages ? "pointer-events-none opacity-50" : undefined}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
      <div className="hidden items-center gap-2 md:flex">
         <Select
            value={String(itemsPerPage)}
            onValueChange={handleLimitChange}
          >
            <SelectTrigger className="w-[80px]">
              <SelectValue placeholder={itemsPerPage} />
            </SelectTrigger>
            <SelectContent>
              {[8, 16, 24, 32].map((limit) => (
                <SelectItem key={limit} value={String(limit)}>
                  {limit}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
      </div>
    </div>
  );
}
