'use client';

import { memo } from 'react';

interface PropertiesGridHeaderProps {
  summaryText: string;
  pageText: string;
  uploadButtonLabel: string;
  loadingText: string;
  fetchError: string | null;
  isFetching: boolean;
  onUploadClick: () => void;
}

function PropertiesGridHeader({
  summaryText,
  pageText,
  uploadButtonLabel,
  loadingText,
  fetchError,
  isFetching,
  onUploadClick,
}: PropertiesGridHeaderProps) {
  return (
    <>
      <div className="flex justify-between items-center py-1">
        <p className="text-sm text-gray-600 dark:text-gray-300">{summaryText}</p>
        <div className="flex items-center gap-3">
          <p className="text-xs text-gray-500 dark:text-gray-400">{pageText}</p>
          <button
            type="button"
            onClick={onUploadClick}
            className="h-8 px-3 rounded-md text-xs font-semibold border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            {uploadButtonLabel}
          </button>
        </div>
      </div>
      {isFetching && <p className="text-xs text-orange-500 dark:text-orange-300">{loadingText}</p>}
      {fetchError && <p className="text-xs text-red-500 dark:text-red-400">{fetchError}</p>}
    </>
  );
}

PropertiesGridHeader.displayName = 'PropertiesGridHeader';

export default memo(PropertiesGridHeader);
