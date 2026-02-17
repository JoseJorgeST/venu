import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';
import { Sparkles } from 'lucide-react';

export type AnnouncementModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: ReactNode;
    /** Texto del botón de cierre. Por defecto: "Entendido" */
    confirmLabel?: string;
    /** Icono personalizado. Por defecto: Sparkles */
    icon?: ReactNode;
    /** Clase extra para el contenido del modal */
    className?: string;
};

export function AnnouncementModal({
    open,
    onOpenChange,
    title,
    description,
    confirmLabel = 'Entendido',
    icon,
    className,
}: AnnouncementModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className={cn(
                    'max-w-[calc(100%-2rem)] border-amber-500/20 bg-zinc-900/95 p-0 shadow-2xl backdrop-blur-sm sm:max-w-md',
                    'overflow-hidden rounded-2xl',
                    className
                )}
            >
                {/* Línea de acento superior */}
                <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-amber-500/60 to-transparent" />

                <div className="flex flex-col items-center gap-6 px-8 pb-8 pt-10 text-center">
                    <div className="flex size-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20">
                        {icon ?? <Sparkles className="size-7" strokeWidth={1.5} />}
                    </div>

                    <DialogHeader className="gap-2 p-0">
                        <DialogTitle className="text-xl font-semibold tracking-tight text-white">
                            {title}
                        </DialogTitle>
                        <DialogDescription className="text-base leading-relaxed text-zinc-400">
                            {description}
                        </DialogDescription>
                    </DialogHeader>

                    <Button
                        variant="default"
                        className="min-w-[140px] bg-amber-500 text-black hover:bg-amber-400"
                        onClick={() => onOpenChange(false)}
                    >
                        {confirmLabel}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
