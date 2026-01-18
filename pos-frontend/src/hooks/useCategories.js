import { useQuery } from "@tanstack/react-query";

const API_URL = "http://localhost:8000/api/v1/categories";

async function fetchCategories() {
    const response = await fetch(API_URL);
    if (!response.ok) {
        throw new Error("Failed to fetch categories");
    }
    return response.json();
}

export function useCategories() {
    return useQuery({
        queryKey: ["categories"],
        queryFn: fetchCategories,
        staleTime: 1000 * 60 * 60, // 1 hour
    });
}
