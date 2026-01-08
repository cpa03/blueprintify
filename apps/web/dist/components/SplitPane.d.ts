import { ReactNode } from "react";
interface SplitPaneProps {
    left: ReactNode;
    right?: ReactNode;
    showRight: boolean;
    leftWidth?: string;
    rightWidth?: string;
    onToggleRight?: () => void;
    className?: string;
}
/**
 * SplitPane component - A reusable split-pane layout
 * Left panel is always visible, right panel can be toggled
 */
export declare function SplitPane({ left, right, showRight, leftWidth, rightWidth, onToggleRight, className, }: SplitPaneProps): import("react/jsx-runtime").JSX.Element;
export {};
