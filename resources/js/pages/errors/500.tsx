import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Home, RefreshCw, ServerCrash, AlertTriangle } from 'lucide-react';

export default function ServerError() {
    return (
        <>
            <Head title="Error del Servidor" />
            <div className="min-h-screen bg-gradient-to-br from-background via-background to-orange-500/5 flex items-center justify-center p-4">
                <div className="max-w-2xl w-full text-center">
                    {/* Animated 500 */}
                    <div className="relative mb-8">
                        <h1 className="text-[12rem] md:text-[16rem] font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-500/20 via-orange-500/40 to-orange-500/20 select-none leading-none">
                            500
                        </h1>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-orange-500/10 to-orange-500/5 backdrop-blur-sm border border-orange-500/20 flex items-center justify-center animate-pulse">
                                <ServerCrash className="w-12 h-12 md:w-16 md:h-16 text-orange-500/60" />
                            </div>
                        </div>
                    </div>

                    {/* Message */}
                    <div className="space-y-4 mb-10">
                        <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                            ¡Algo salió mal!
                        </h2>
                        <p className="text-muted-foreground text-lg max-w-md mx-auto">
                            Nuestro servidor tuvo un problema inesperado. 
                            Estamos trabajando para solucionarlo lo antes posible.
                        </p>
                    </div>

                    {/* Warning badge */}
                    <div className="flex justify-center mb-10">
                        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400">
                            <AlertTriangle className="h-4 w-4" />
                            <span className="text-sm font-medium">Error interno del servidor</span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Button 
                            variant="default" 
                            size="lg" 
                            onClick={() => window.location.reload()}
                            className="min-w-[180px]"
                        >
                            <RefreshCw className="mr-2 h-5 w-5" />
                            Reintentar
                        </Button>
                        <Button 
                            variant="outline" 
                            size="lg" 
                            asChild
                            className="min-w-[180px]"
                        >
                            <Link href="/">
                                <Home className="mr-2 h-5 w-5" />
                                Ir al Inicio
                            </Link>
                        </Button>
                    </div>

                    {/* Help text */}
                    <div className="mt-12 text-sm text-muted-foreground">
                        <p>Si el problema persiste, contacta a soporte:</p>
                        <a 
                            href="mailto:soporte@bevenut.com" 
                            className="text-primary hover:underline underline-offset-4"
                        >
                            soporte@bevenut.com
                        </a>
                    </div>

                    {/* Decorative elements */}
                    <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10">
                        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl" />
                        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl" />
                    </div>
                </div>
            </div>
        </>
    );
}
