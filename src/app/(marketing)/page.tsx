import { HydrationBoundary, dehydrate, QueryClient } from "@tanstack/react-query";
import { fetchCategories, fetchWorkshopLevels, fetchWorkshops } from "@/lib/api/services";
import HomePageClient from "./_HomePageClient";

export default async function HomePage() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { staleTime: 5 * 60 * 1000 },
    },
  });

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: ["public-categories"],
      queryFn: fetchCategories,
    }),
    queryClient.prefetchQuery({
      queryKey: ["public-levels"],
      queryFn: fetchWorkshopLevels,
    }),
    queryClient.prefetchQuery({
      queryKey: ["public-featured-workshops"],
      queryFn: () => fetchWorkshops({ limit: 100 }),
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <HomePageClient />
    </HydrationBoundary>
  );
}
