import type {MouseEventHandler, ReactNode} from "react";

interface TableCellProps {
    children?: ReactNode;
    className?: string;
    title?: string;
    onClick?: MouseEventHandler<HTMLDivElement>;
}

export default function TableCell({ children, className = "", title, onClick }: TableCellProps) {
    const isCol = className.includes("flex-col");

    return (
        <div
            className={`px-5 py-3.5 flex ${isCol ? "" : "items-center"} ${className}`}
            title={title}
            onClick={onClick}
        >
            {children}
        </div>
    );
}