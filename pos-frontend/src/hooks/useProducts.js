import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const API_URL = "http://localhost:8000/api/v1/products";

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
            errorData.message || "An error occurred while fetching data"
        );
    }

    // Return null for 204 No Content
    if (response.status === 204) return null;

    return response.json();
}

// Hooks
export function useProducts(searchTerm = "", category = "") {
    return useQuery({
        queryKey: ["products", searchTerm, category],
        queryFn: () => {
            const params = new URLSearchParams();
            if (searchTerm) params.append("q", searchTerm);
            if (category) params.append("category", category);
            return fetchClient(`${API_URL}?${params.toString()}`);
        },
    });
}

export function useProduct(id) {
    return useQuery({
        queryKey: ["products", id],
        queryFn: () => fetchClient(`${API_URL}/${id}`),
        enabled: !!id,
    });
}

export function useCreateProduct() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (newProduct) => {
            return fetchClient(API_URL, {
                method: "POST",
                body: JSON.stringify(newProduct),
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["products"] });
        },
    });
}

export function useUpdateProduct() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, ...updatedProduct }) => {
            return fetchClient(`${API_URL}/${id}`, {
                method: "PUT",
                body: JSON.stringify(updatedProduct),
            });
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["products"] });
            queryClient.invalidateQueries({
                queryKey: ["products", variables.id],
            });
        },
    });
}

export function useDeleteProduct() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id) => {
            return fetchClient(`${API_URL}/${id}`, {
                method: "DELETE",
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["products"] });
        },
    });
}
