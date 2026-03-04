import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft, Search, HelpCircle } from 'lucide-react';

export default function NotFound() {
    return (
        <>
            <Head title="Página no encontrada" />
            <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 flex items-center justify-center p-4">
                <div className="max-w-2xl w-full text-center">
                    {/* Animated 404 */}
                    <div className="relative mb-8">
                        <h1 className="text-[12rem] md:text-[16rem] font-black text-transparent bg-clip-text bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20 select-none leading-none">
                            404
                        </h1>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 backdrop-blur-sm border border-primary/20 flex items-center justify-center animate-pulse">
                                <Search className="w-12 h-12 md:w-16 md:h-16 text-primary/60" />
                            </div>
                        </div>
                    </div>

                    {/* Message */}
                    <div className="space-y-4 mb-10">
                        <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                            ¡Oops! Página no encontrada
                        </h2>
                        <p className="text-muted-foreground text-lg max-w-md mx-auto">
                            La página que buscas no existe, fue movida o quizás nunca existió. 
                            No te preocupes, te ayudamos a volver.
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Button 
                            variant="default" 
                            size="lg" 
                            asChild
                            className="min-w-[180px]"
                        >
                            <Link href="/">
                                <Home className="mr-2 h-5 w-5" />
                                Ir al Inicio
                            </Link>
                        </Button>
                        <Button 
                            variant="outline" 
                            size="lg" 
                            onClick={() => window.history.back()}
                            className="min-w-[180px]"
                        >
                            <ArrowLeft className="mr-2 h-5 w-5" />
                            Volver Atrás
                        </Button>
                    </div>

                    {/* Help section */}
                    <div className="mt-16 pt-8 border-t border-border/50">
                        <div className="flex items-center justify-center gap-2 text-muted-foreground mb-4">
                            <HelpCircle className="h-5 w-5" />
                            <span className="font-medium">¿Necesitas ayuda?</span>
                        </div>
                        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
                            <Link 
                                href="/restaurants" 
                                className="text-primary hover:underline underline-offset-4"
                            >
                                Ver Restaurantes
                            </Link>
                            <span className="text-border hidden sm:inline">•</span>
                            <Link 
                                href="/reservations" 
                                className="text-primary hover:underline underline-offset-4"
                            >
                                Mis Reservaciones
                            </Link>
                            <span className="text-border hidden sm:inline">•</span>
                            <a 
                                href="mailto:soporte@bevenut.com" 
                                className="text-primary hover:underline underline-offset-4"
                            >
                                Contactar Soporte
                            </a>
                        </div>
                    </div>

                    {/* Decorative elements */}
                    <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10">
                        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
                        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
                        <div className="absolute top-1/2 right-1/3 w-48 h-48 bg-primary/3 rounded-full blur-2xl" />
                    </div>
                </div>
            </div>
        </>
    );
}
