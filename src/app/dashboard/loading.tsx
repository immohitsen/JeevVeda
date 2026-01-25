import { Loader2 } from "lucide-react";

export default function Loading() {
    return (
        <div className="h-full w-full flex items-center justify-center bg-gray-50/50 dark:bg-neutral-900/50">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
                <p className="text-sm font-medium text-gray-500 animate-pulse">Loading...</p>
            </div>
        </div>
    );
}
