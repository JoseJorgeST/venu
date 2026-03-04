import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft, ShieldX, Lock } from 'lucide-react';

export default function Forbidden() {
    return (
        <>
            <Head title="Acceso Denegado" />
            <div className="min-h-screen bg-gradient-to-br from-background via-background to-destructive/5 flex items-center justify-center p-4">
                <div className="max-w-2xl w-full text-center">
                    {/* Animated 403 */}
                    <div className="relative mb-8">
                        <h1 className="text-[12rem] md:text-[16rem] font-black text-transparent bg-clip-text bg-gradient-to-r from-destructive/20 via-destructive/40 to-destructive/20 select-none leading-none">
                            403
                        </h1>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-destructive/10 to-destructive/5 backdrop-blur-sm border border-destructive/20 flex items-center justify-center">
                                <ShieldX className="w-12 h-12 md:w-16 md:h-16 text-destructive/60" />
                            </div>
                        </div>
                    </div>

                    {/* Message */}
                    <div className="space-y-4 mb-10">
                        <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                            Acceso Denegado
                        </h2>
                        <p className="text-muted-foreground text-lg max-w-md mx-auto">
                            No tienes permisos para acceder a esta página. 
                            Si crees que esto es un error, contacta al administrador.
                        </p>
                    </div>

                    {/* Lock icon animation */}
                    <div className="flex justify-center mb-10">
                        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-destructive/10 text-destructive">
                            <Lock className="h-4 w-4" />
                            <span className="text-sm font-medium">Recurso protegido</span>
                        </div>
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

                    {/* Decorative elements */}
                    <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10">
                        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-destructive/5 rounded-full blur-3xl" />
                        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-destructive/5 rounded-full blur-3xl" />
                    </div>
                </div>
            </div>
        </>
    );
}
