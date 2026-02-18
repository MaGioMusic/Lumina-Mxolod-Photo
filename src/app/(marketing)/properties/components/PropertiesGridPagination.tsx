'use client';

import { memo } from 'react';

interface PropertiesGridPaginationProps {
  currentPage: number;
  totalPages: number;
  pageNumbers: number[];
  previousLabel: string;
  nextLabel: string;
  goToPageLabel: string;
  onGoToPage: (page: number) => void;
  onGoToPrevious: () => void;
  onGoToNext: () => void;
}

function PropertiesGridPagination({
  currentPage,
  totalPages,
  pageNumbers,
  previousLabel,
  nextLabel,
  goToPageLabel,
  onGoToPage,
  onGoToPrevious,
  onGoToNext,
}: PropertiesGridPaginationProps) {
  return (
    <>
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-1 mt-6">
          <button
            onClick={onGoToPrevious}
            disabled={currentPage === 1}
            className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
              currentPage === 1
                ? 'bg-gray-50 dark:bg-gray-800 text-gray-300 dark:text-gray-600 cursor-not-allowed border-gray-200 dark:border-gray-700'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
            }`}
          >
            {previousLabel}
          </button>

          {pageNumbers.map((pageNumber) => (
            <button
              key={pageNumber}
              onClick={() => onGoToPage(pageNumber)}
              className={`w-8 h-8 text-sm rounded-md border transition-all ${
                currentPage === pageNumber
                  ? 'bg-[#F08336] text-white border-[#F08336] font-medium'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
              }`}
            >
              {pageNumber}
            </button>
          ))}

          {totalPages > 5 && currentPage < totalPages - 2 && (
            <span className="px-1 text-gray-400 dark:text-gray-500 text-sm">...</span>
          )}

          {totalPages > 5 && currentPage < totalPages - 2 && (
            <button
              onClick={() => onGoToPage(totalPages)}
              className="w-8 h-8 text-sm rounded-md border bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
            >
              {totalPages}
            </button>
          )}

          <button
            onClick={onGoToNext}
            disabled={currentPage === totalPages}
            className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
              currentPage === totalPages
                ? 'bg-gray-50 dark:bg-gray-800 text-gray-300 dark:text-gray-600 cursor-not-allowed border-gray-200 dark:border-gray-700'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
            }`}
          >
            {nextLabel}
          </button>
        </div>
      )}

      {totalPages > 10 && (
        <div className="flex justify-center items-center space-x-2 mt-4">
          <span className="text-sm text-gray-600 dark:text-gray-300">{goToPageLabel}:</span>
          <input
            type="number"
            min="1"
            max={totalPages.toString()}
            value={currentPage.toString()}
            onChange={(event) => {
              const page = Number.parseInt(event.target.value, 10);
              if (page >= 1 && page <= totalPages) {
                onGoToPage(page);
              }
            }}
            className="w-16 px-2 py-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded text-center text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-400"
          />
          <span className="text-sm text-gray-600 dark:text-gray-300">/ {totalPages}</span>
        </div>
      )}
    </>
  );
}

PropertiesGridPagination.displayName = 'PropertiesGridPagination';

export default memo(PropertiesGridPagination);
