import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const API_URL = "http://localhost:8000/api/v1";

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
            errorData.message ||
                errorData.error ||
                "An error occurred while fetching data"
        );
    }

    if (response.status === 204) return null;

    return response.json();
}

export function useInventory(productId) {
    return useQuery({
        queryKey: ["inventory", productId],
        queryFn: async () => {
            return fetchClient(`${API_URL}/products/${productId}/inventory`);
        },
        enabled: !!productId,
    });
}

export function useInventoryAction(productId) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ action, quantity, reason }) => {
            const endpoint = `${API_URL}/products/${productId}/inventory/${action}`; // add, remove, adjust
            return fetchClient(endpoint, {
                method: "POST",
                body: JSON.stringify({ quantity, reason }),
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["inventory", productId],
            });
            queryClient.invalidateQueries({ queryKey: ["products"] }); // Update main list if we show stock there
        },
    });
}
