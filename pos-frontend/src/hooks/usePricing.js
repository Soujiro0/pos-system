import { useMutation } from "@tanstack/react-query";

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

export function useCalculateCart() {
    return useMutation({
        mutationFn: (data) =>
            fetchClient("/pricing/calculate", {
                method: "POST",
                body: JSON.stringify(data),
            }),
    });
}

export function useReserveItems() {
    return useMutation({
        mutationFn: (data) =>
            fetchClient("/pricing/reserve", {
                method: "POST",
                body: JSON.stringify(data),
            }),
    });
}
