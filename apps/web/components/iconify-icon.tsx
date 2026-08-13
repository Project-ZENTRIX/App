import React from "react";
import { Icon, IconProps } from "@iconify/react";

export interface IconifyIconProps extends Omit<IconProps, "icon"> {
    /** Icon name in the format "collection:name", e.g. "emojione-v1:maple-leaf" */
    icon: string;
    /** Optional width (number or string with unit) */
    width?: string | number;
    /** Optional height (number or string with unit) */
    height?: string | number;
    /** Additional CSS class name */
    className?: string;
    /** Inline styles */
    style?: React.CSSProperties;
}

/**
 * Generic Iconify icon component.
 * Pass any Iconify icon name (e.g. "emojione-v1:maple-leaf") via the `icon` prop.
 */
export const IconifyIcon: React.FC<IconifyIconProps> = ({ icon, width = "1em", height = "1em", className, style, ...rest }) => {
    return <Icon icon={icon} width={width} height={height} className={className} style={style} {...rest} />;
};
