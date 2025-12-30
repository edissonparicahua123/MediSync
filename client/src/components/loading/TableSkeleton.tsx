import { Skeleton } from '@/components/ui/skeleton'

interface TableSkeletonProps {
    rows?: number
    columns?: number
    showHeader?: boolean
}

export default function TableSkeleton({
    rows = 5,
    columns = 5,
    showHeader = true,
}: TableSkeletonProps) {
    return (
        <div className="w-full space-y-3">
            {/* Header */}
            {showHeader && (
                <div className="flex gap-4 pb-2 border-b">
                    {Array(columns)
                        .fill(0)
                        .map((_, i) => (
                            <Skeleton key={`header-${i}`} className="h-4 flex-1" />
                        ))}
                </div>
            )}

            {/* Rows */}
            {Array(rows)
                .fill(0)
                .map((_, rowIndex) => (
                    <div key={`row-${rowIndex}`} className="flex gap-4 py-2">
                        {Array(columns)
                            .fill(0)
                            .map((_, colIndex) => (
                                <Skeleton
                                    key={`cell-${rowIndex}-${colIndex}`}
                                    className={`h-5 flex-1 ${colIndex === 0 ? 'max-w-[150px]' : ''
                                        }`}
                                />
                            ))}
                    </div>
                ))}
        </div>
    )
}
