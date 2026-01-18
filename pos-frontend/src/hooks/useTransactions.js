import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const API_URL = "http://localhost:8000/api/v1/transactions";

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

export function useCheckout() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (transactionData) => {
            return fetchClient(`${API_URL}/checkout`, {
                method: "POST",
                body: JSON.stringify(transactionData),
            });
        },
        onSuccess: () => {
            // Invalidate products to refresh stock
            queryClient.invalidateQueries({ queryKey: ["products"] });
            // Invalidate logs if needed
            queryClient.invalidateQueries({ queryKey: ["pricing-logs"] });
        },
    });
}

export function useTransaction(id) {
    return useQuery({
        queryKey: ["transactions", id],
        queryFn: () => fetchClient(`${API_URL}/${id}`),
        enabled: !!id,
    });
}
