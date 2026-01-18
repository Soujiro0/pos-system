import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const API_URL = "http://localhost:8000/api/v1/categories";

// Helper for fetch requests
async function fetchClient(url, options = {}) {
    const response = await fetch(url, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            ...options.headers,
        },
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
            errorData.message || "An error occurred while fetching data",
        );
    }

    if (response.status === 204) return null;

    return response.json();
}

export function useCategories() {
    return useQuery({
        queryKey: ["categories"],
        queryFn: () => fetchClient(API_URL),
    });
}

export function useCreateCategory() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (newCategory) => {
            return fetchClient(API_URL, {
                method: "POST",
                body: JSON.stringify(newCategory),
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["categories"] });
        },
    });
}

export function useUpdateCategory() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, ...updatedCategory }) => {
            return fetchClient(`${API_URL}/${id}`, {
                method: "PUT",
                body: JSON.stringify(updatedCategory),
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["categories"] });
        },
    });
}

export function useDeleteCategory() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id) => {
            return fetchClient(`${API_URL}/${id}`, {
                method: "DELETE",
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["categories"] });
        },
    });
}
