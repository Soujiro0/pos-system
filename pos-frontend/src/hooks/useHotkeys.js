import { useEffect } from "react";

export function useHotkeys(keyMap) {
    useEffect(() => {
        const handleKeyDown = (event) => {
            const key = event.key.toLowerCase();
            const combo = [];

            if (event.ctrlKey) combo.push("ctrl");
            if (event.shiftKey) combo.push("shift");
            if (event.altKey) combo.push("alt");
            if (event.metaKey) combo.push("meta");

            // Handle F-keys and regular keys
            if (key.startsWith("f") && key.length > 1) {
                combo.push(key);
            } else if (!["control", "shift", "alt", "meta"].includes(key)) {
                combo.push(key);
            }

            const comboString = combo.join("+");

            if (keyMap[comboString]) {
                event.preventDefault();
                keyMap[comboString](event);
                return;
            }

            // Fallback for simple keys if no modifier (e.g. 'f1')
            if (keyMap[key]) {
                event.preventDefault();
                keyMap[key](event);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [keyMap]);
}
