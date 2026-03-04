import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useMemo } from "react";
import qs from "qs";

export function useQuery<T extends { [key: string]: any }>(): T & {
  patchQuery: (params: Partial<T>) => string;
} {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const query = useMemo(() => {
    const obj: { [key: string]: any } = {};
    searchParams?.forEach((value, key) => {
      obj[key] = value;
    });
    return obj as T;
  }, [searchParams]);

  const patchQuery = useCallback(
    (params: Partial<T>) => {
      const newSearch = qs.stringify(
        { ...query, ...params },
        { addQueryPrefix: true },
      );
      router.push(pathname + newSearch);
      return newSearch;
    },
    [query, router, pathname],
  );

  return { ...query, patchQuery };
}
