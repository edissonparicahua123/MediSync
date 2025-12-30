import { ReactNode } from 'react'
import { Button } from '@/components/ui/button'

interface EmptyStateProps {
    icon: ReactNode
    title: string
    description?: string
    action?: ReactNode
    className?: string
}

export default function EmptyState({
    icon,
    title,
    description,
    action,
    className = '',
}: EmptyStateProps) {
    return (
        <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}>
            <div className="mb-4 text-gray-300">
                {icon}
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {title}
            </h3>
            {description && (
                <p className="text-gray-500 max-w-sm mb-4">
                    {description}
                </p>
            )}
            {action && (
                <div className="mt-2">
                    {action}
                </div>
            )}
        </div>
    )
}
