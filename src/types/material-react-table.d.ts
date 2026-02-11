import { FilterFn as TanStackFilterFn, SortingFn as TanStackSortingFn, Row, AnyData } from '@tanstack/react-table';

declare module 'material-react-table' {
  export type FilterFn<TData extends AnyData = AnyData> = TanStackFilterFn<TData>;
  export type SortingFn<TData extends AnyData = AnyData> = TanStackSortingFn<TData>;
}
