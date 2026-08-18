import { Construction } from "lucide-react";

interface FeaturePlaceholderProps {
  name: string;
  description: string;
}

export function FeaturePlaceholder({ name, description }: FeaturePlaceholderProps) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 p-10 text-center dark:border-gray-700">
      <Construction className="h-10 w-10 text-gray-400" />
      <h1 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">{name}</h1>
      <p className="mt-2 max-w-md text-sm text-gray-500 dark:text-gray-400">{description}</p>
      <span className="mt-4 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-300">
        Akan diimplementasikan di sprint fitur berikutnya
      </span>
    </div>
  );
}