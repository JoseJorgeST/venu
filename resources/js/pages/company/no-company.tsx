import { Head, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Building2, Mail, MessageCircle } from 'lucide-react';

export default function NoCompany() {
    const handleLogout = () => {
        router.post('/logout');
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center p-4">
            <Head title="Empresa no registrada" />

            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                        <Building2 className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">Tu empresa aún no está registrada</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-center text-muted-foreground">
                        Contáctanos para registrar tu empresa en la plataforma.
                    </p>

                    <div className="flex flex-col gap-3">
                        <Button variant="outline" className="w-full" asChild>
                            <a href="mailto:soporte@bevenut.com">
                                <Mail className="mr-2 h-4 w-4" />
                                soporte@bevenut.com
                            </a>
                        </Button>
                        <Button variant="default" className="w-full" asChild>
                            <a href="https://wa.me/13234234285" target="_blank" rel="noopener noreferrer">
                                <MessageCircle className="mr-2 h-4 w-4" />
                                +1 (323) 423-4285
                            </a>
                        </Button>
                    </div>

                    <div className="pt-4">
                        <Button type="button" variant="ghost" className="w-full" onClick={handleLogout}>
                            Cerrar sesión
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
