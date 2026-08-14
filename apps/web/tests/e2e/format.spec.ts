import { expect, test } from "@playwright/test";

import { formatCurrency, formatDateTime } from "../../lib/format";

test.describe("format helpers", () => {
    test("uses the requested locale for date and currency formatting", () => {
        const originalDateTimeFormat = Intl.DateTimeFormat;
        const originalNumberFormat = Intl.NumberFormat;
        const dateCalls: Array<{ locale: string | string[] | undefined }> = [];
        const numberCalls: Array<{ locale: string | string[] | undefined }> = [];

        class MockDateTimeFormat {
            locale: string | string[] | undefined;

            constructor(locale: string | string[] | undefined) {
                this.locale = locale;
                dateCalls.push({ locale });
            }

            format() {
                return "formatted date";
            }
        }

        class MockNumberFormat {
            locale: string | string[] | undefined;

            constructor(locale: string | string[] | undefined) {
                this.locale = locale;
                numberCalls.push({ locale });
            }

            format() {
                return "formatted currency";
            }
        }

        Object.defineProperty(Intl, "DateTimeFormat", {
            configurable: true,
            value: MockDateTimeFormat,
        });
        Object.defineProperty(Intl, "NumberFormat", {
            configurable: true,
            value: MockNumberFormat,
        });

        try {
            expect(formatDateTime("2026-08-14T01:02:03Z", "zh-CN")).toBe("formatted date");
            expect(formatCurrency(1234.5, "USD", "en-GB")).toBe("formatted currency");
            expect(dateCalls).toEqual([{ locale: "zh-CN" }]);
            expect(numberCalls).toEqual([{ locale: "en-GB" }]);
        } finally {
            Object.defineProperty(Intl, "DateTimeFormat", {
                configurable: true,
                value: originalDateTimeFormat,
            });
            Object.defineProperty(Intl, "NumberFormat", {
                configurable: true,
                value: originalNumberFormat,
            });
        }
    });

    test("falls back to the default locale when one is not provided", () => {
        const originalDateTimeFormat = Intl.DateTimeFormat;
        const originalNumberFormat = Intl.NumberFormat;
        const dateCalls: Array<{ locale: string | string[] | undefined }> = [];
        const numberCalls: Array<{ locale: string | string[] | undefined }> = [];

        class MockDateTimeFormat {
            constructor(locale: string | string[] | undefined) {
                dateCalls.push({ locale });
            }

            format() {
                return "formatted date";
            }
        }

        class MockNumberFormat {
            constructor(locale: string | string[] | undefined) {
                numberCalls.push({ locale });
            }

            format() {
                return "formatted currency";
            }
        }

        Object.defineProperty(Intl, "DateTimeFormat", {
            configurable: true,
            value: MockDateTimeFormat,
        });
        Object.defineProperty(Intl, "NumberFormat", {
            configurable: true,
            value: MockNumberFormat,
        });

        try {
            void formatDateTime("2026-08-14T01:02:03Z");
            void formatCurrency(1234.5, "USD");
            expect(dateCalls).toEqual([{ locale: "en-GB" }]);
            expect(numberCalls).toEqual([{ locale: "en-GB" }]);
        } finally {
            Object.defineProperty(Intl, "DateTimeFormat", {
                configurable: true,
                value: originalDateTimeFormat,
            });
            Object.defineProperty(Intl, "NumberFormat", {
                configurable: true,
                value: originalNumberFormat,
            });
        }
    });
});
