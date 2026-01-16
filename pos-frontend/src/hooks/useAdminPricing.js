import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const API_URL = "http://localhost:8000/api/v1";

const fetchClient = async (endpoint, options = {}) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
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
            errorData.message || `Request failed with status ${response.status}`
        );
    }

    return response.json();
};

export function useTaxes() {
    return useQuery({
        queryKey: ["taxes"],
        queryFn: () => fetchClient("/pricing/taxes"),
    });
}

export function useCreateTax() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) =>
            fetchClient("/pricing/taxes", {
                method: "POST",
                body: JSON.stringify(data),
            }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["taxes"] }),
    });
}

export function useDiscounts() {
    return useQuery({
        queryKey: ["discounts"],
        queryFn: () => fetchClient("/pricing/discounts"),
    });
}

export function useCreateDiscount() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) =>
            fetchClient("/pricing/discounts", {
                method: "POST",
                body: JSON.stringify(data),
            }),
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: ["discounts"] }),
    });
}

export function usePriceLogs(page = 1) {
    return useQuery({
        queryKey: ["price_logs", page],
        queryFn: () => fetchClient(`/pricing/logs?page=${page}`),
    });
}
