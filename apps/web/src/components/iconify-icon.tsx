import { Icon } from "@iconify/react";

export function IconifyIcon({ icon, ...props }: { icon: string } & React.ComponentProps<typeof Icon>) {
    return <Icon icon={icon} {...props} />;
}
