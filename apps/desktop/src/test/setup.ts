import { afterEach, beforeEach, vi } from "vitest";

beforeEach(() => {
    window.localStorage.setItem("zentrix-locale", "zh-CN");

    if (!window.matchMedia) {
        Object.defineProperty(window, "matchMedia", {
            configurable: true,
            writable: true,
            value: vi.fn().mockImplementation((query: string) => ({
                matches: false,
                media: query,
                onchange: null,
                addEventListener: vi.fn(),
                removeEventListener: vi.fn(),
                addListener: vi.fn(),
                removeListener: vi.fn(),
                dispatchEvent: vi.fn(),
            })),
        });
    }
});

afterEach(() => {
    vi.clearAllMocks();
});
