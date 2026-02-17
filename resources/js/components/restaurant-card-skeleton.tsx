import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

type RestaurantCardSkeletonProps = {
    className?: string;
};

export function RestaurantCardSkeleton({ className }: RestaurantCardSkeletonProps) {
    return (
        <Card className={cn('overflow-hidden', className)}>
            <Skeleton className="h-40 w-full rounded-none" />
            <CardHeader className="pb-1 pt-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="mt-2 h-4 w-1/2" />
            </CardHeader>
            <CardContent className="flex items-center gap-2 pt-0">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-8" />
            </CardContent>
        </Card>
    );
}
