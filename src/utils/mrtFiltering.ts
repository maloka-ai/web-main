
import { FilterFn, SortingFn } from 'material-react-table';

// Define a custom type to extend the row with our scoring property
interface MRT_Row_With_Score<T extends Record<string, any>> extends Record<string, any> {
  _mrt_filterMatchScore?: number;
  original: T;
}

/**
 * Custom global filter function for MaterialReactTable that performs a token-based search.
 * It scores rows based on the number of search tokens found within their string values.
 * The score is attached to the row object as `_mrt_filterMatchScore`.
 * @param row The MRT row object.
 * @param columnId The ID of the column (not directly used for global filter but part of signature).
 * @param filterValue The current global filter input string.
 * @returns true if the row matches at least one token, false otherwise.
 */
export const tokenMatchFilterFn: FilterFn<any> = (
  row: MRT_Row_With_Score<any>,
  columnId: string, // Although not directly used for global filter, it's part of the signature
  filterValue: string | undefined
): boolean => {
  if (!row) { // Defensive check for undefined/null row
    return false;
  }
  const searchTokens = (filterValue ?? '').toLowerCase().split(/\s+/).filter(Boolean);

  if (!searchTokens.length) {
    row._mrt_filterMatchScore = 0; // Reset score if no filter
    return true; // No filter value, show all rows
  }

  let matchCount = 0;
  const rowOriginal = row.original;

  // Extract all string values from the row's original data
  const rowValues: string[] = Object.values(rowOriginal)
    .filter((value) => typeof value === 'string' || typeof value === 'number') // Include numbers as strings for search
    .map((value) => String(value).toLowerCase());

  for (const token of searchTokens) {
    for (const rowValue of rowValues) {
      if (rowValue.includes(token)) {
        matchCount++;
        break; // Move to the next search token once found in any row value
      }
    }
  }

  row._mrt_filterMatchScore = matchCount;
  return matchCount > 0; // Only show rows that have at least one token match
};

/**
 * Custom sorting function for MaterialReactTable that sorts by the `_mrt_filterMatchScore`.
 * It should be applied when the global filter is active to order results by relevance.
 * Higher scores (more matched tokens) come first.
 * @param rowA First row for comparison.
 * @param rowB Second row for comparison.
 * @param columnId The ID of the column being sorted (not used for this specific relevance sort).
 * @returns A number indicating the sort order (-1, 0, or 1).
 */
export const tokenMatchSortingFn: SortingFn<any> = (
  rowA: MRT_Row_With_Score<any>,
  rowB: MRT_Row_With_Score<any>,
  columnId: string // The column that was clicked for sorting, but we are overriding
): number => {
  const scoreA = rowA._mrt_filterMatchScore ?? 0;
  const scoreB = rowB._mrt_filterMatchScore ?? 0;

  // Sort in descending order of score (higher score first)
  if (scoreA !== scoreB) {
    return scoreB - scoreA;
  }

  // If scores are equal, fall back to default string comparison on the actual column data
  // This part might need adjustment based on how you want to break ties.
  // For now, let's compare the actual column values if available, otherwise just return 0.
  const valueA = String(rowA.original[columnId] || '').toLowerCase();
  const valueB = String(rowB.original[columnId] || '').toLowerCase();

  return valueA.localeCompare(valueB);
};
