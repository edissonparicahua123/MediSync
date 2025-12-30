import { Skeleton } from '@/components/ui/skeleton'

interface CardSkeletonProps {
    showImage?: boolean
    lines?: number
}

export default function CardSkeleton({ showImage = false, lines = 3 }: CardSkeletonProps) {
    return (
        <div className="rounded-lg border bg-card p-6 space-y-4">
            {showImage && (
                <Skeleton className="h-32 w-full rounded-md" />
            )}
            <div className="space-y-2">
                <Skeleton className="h-5 w-3/4" />
                {Array(lines)
                    .fill(0)
                    .map((_, i) => (
                        <Skeleton
                            key={i}
                            className={`h-4 ${i === lines - 1 ? 'w-1/2' : 'w-full'}`}
                        />
                    ))}
            </div>
        </div>
    )
}
