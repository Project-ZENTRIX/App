import enGB_AppPages from "./locales/en-GB/app-pages.json";
import enGB_AppShell from "./locales/en-GB/app-shell.json";
import enGB_Common from "./locales/en-GB/common.json";
import enGB_AccountForms from "./locales/en-GB/account-forms.json";

import zhCN_AppPages from "./locales/zh-CN/app-pages.json";
import zhCN_AppShell from "./locales/zh-CN/app-shell.json";
import zhCN_Common from "./locales/zh-CN/common.json";
import zhCN_AccountForms from "./locales/zh-CN/account-forms.json";

export const resources = {
    "en-GB": {
        common: enGB_Common,
        "account-forms": enGB_AccountForms,
        "app-shell": enGB_AppShell,
        "app-pages": enGB_AppPages,
    },

    "zh-CN": {
        common: zhCN_Common,
        "account-forms": zhCN_AccountForms,
        "app-shell": zhCN_AppShell,
        "app-pages": zhCN_AppPages,
    },
} as const;
