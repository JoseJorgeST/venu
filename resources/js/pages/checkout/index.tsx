import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect, useRef, FormEvent } from 'react';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import {
    Elements,
    CardElement,
    useStripe,
    useElements,
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import AppLayout from '@/layouts/app-layout';
import { useCart } from '@/contexts/cart-context';
import { cn } from '@/lib/utils';
import type { BreadcrumbItem } from '@/types';
import { Loader2, CreditCard, CheckCircle, AlertCircle, ShoppingBag } from 'lucide-react';

const COMMISSION_RATE = 0.1;
const POINTS_PER_EUR = 100;

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Carrito', href: '/cart' },
    { title: 'Checkout', href: '/checkout' },
];

function formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR',
    }).format(value);
}

type Props = {
    wallet_points: number;
};

type PaymentFormProps = {
    onSuccess: () => void;
    onError: (message: string) => void;
};

function PaymentForm({ onSuccess, onError, clientSecret }: PaymentFormProps & { clientSecret: string }) {
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        const cardElement = elements.getElement(CardElement);
        if (!cardElement) {
            onError('Error al cargar el formulario de pago');
            return;
        }

        setIsProcessing(true);

        const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
                card: cardElement,
            },
        });

        if (error) {
            console.error('Stripe error:', error);
            onError(error.message || 'Error al procesar el pago');
            setIsProcessing(false);
        } else if (paymentIntent && paymentIntent.status === 'succeeded') {
            fetch('/checkout/confirm-payment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    payment_intent_id: paymentIntent.id,
                }),
            })
                .then((res) => res.json())
                .then((data) => {
                    if (data.success) {
                        onSuccess();
                    } else {
                        onError(data.error || 'Error al confirmar el pedido');
                    }
                })
                .catch(() => {
                    onError('Error al confirmar el pedido');
                })
                .finally(() => {
                    setIsProcessing(false);
                });
        } else {
            onError('El pago no se completó correctamente');
            setIsProcessing(false);
        }
    };

    const cardStyle = {
        style: {
            base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                    color: '#aab7c4',
                },
            },
            invalid: {
                color: '#9e2146',
            },
        },
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="rounded-md border p-4">
                <CardElement options={cardStyle} />
            </div>
            <p className="text-xs text-muted-foreground">
                Tarjeta de prueba: 4242 4242 4242 4242 | Fecha: cualquier fecha futura | CVC: cualquier 3 dígitos
            </p>
            <Button
                type="submit"
                disabled={!stripe || isProcessing}
                className="w-full"
                size="lg"
            >
                {isProcessing ? (
                    <>
                        <Loader2 className="mr-2 size-4 animate-spin" />
                        Procesando...
                    </>
                ) : (
                    <>
                        <CreditCard className="mr-2 size-4" />
                        Pagar ahora
                    </>
                )}
            </Button>
        </form>
    );
}

export default function CheckoutIndex({ wallet_points }: Props) {
    const { items, subtotal, restaurantId, restaurantName, clearCart } = useCart();
    const [usePoints, setUsePoints] = useState(false);
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const paymentInitRef = useRef(false);

    const commission = subtotal * COMMISSION_RATE;
    const totalBeforePoints = subtotal + commission;
    const maxPointsToUse = Math.min(
        wallet_points,
        Math.floor(totalBeforePoints * POINTS_PER_EUR)
    );
    const pointsDiscountEur = usePoints ? maxPointsToUse / POINTS_PER_EUR : 0;
    const finalTotal = Math.max(0, totalBeforePoints - pointsDiscountEur);

    useEffect(() => {
        if (items.length === 0 || !restaurantId || paymentInitRef.current || clientSecret) {
            return;
        }

        paymentInitRef.current = true;
        setIsLoading(true);
        setError(null);

        const payload = {
            restaurant_id: restaurantId,
            items: items.map((item) => ({
                menuItemId: item.menuItemId,
                quantity: item.quantity,
                price: item.price,
            })),
            use_points: usePoints,
        };

        fetch('/checkout/create-payment-intent', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
            },
            body: JSON.stringify(payload),
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.error) {
                    setError(data.error);
                    paymentInitRef.current = false;
                } else {
                    setClientSecret(data.clientSecret);
                    setStripePromise(loadStripe(data.publishableKey));
                }
            })
            .catch((err) => {
                console.error('Fetch error:', err);
                setError('Error al inicializar el pago');
                paymentInitRef.current = false;
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [items, restaurantId, clientSecret]);

    const handlePaymentSuccess = () => {
        setPaymentSuccess(true);
        clearCart();
        setTimeout(() => {
            router.visit('/orders/confirmation?points_earned=2');
        }, 2000);
    };

    if (paymentSuccess) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Pago exitoso" />
                <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
                    <div className="flex size-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                        <CheckCircle className="size-10 text-green-600 dark:text-green-400" />
                    </div>
                    <h1 className="text-2xl font-semibold">¡Pago completado!</h1>
                    <p className="text-muted-foreground">Redirigiendo a la confirmación...</p>
                </div>
            </AppLayout>
        );
    }

    if (items.length === 0) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Checkout" />
                <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
                    <div className="flex size-20 items-center justify-center rounded-full bg-muted">
                        <ShoppingBag className="size-10 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground">Tu carrito está vacío.</p>
                    <Button asChild>
                        <Link href="/restaurants">Ver restaurantes</Link>
                    </Button>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Checkout" />
            <div className="flex flex-1 flex-col gap-6 p-4 pb-24 md:p-6 md:pb-24">
                <div>
                    <h1 className="text-2xl font-semibold">Checkout</h1>
                    {restaurantName && (
                        <p className="text-muted-foreground">
                            Pedido de <span className="font-medium text-foreground">{restaurantName}</span>
                        </p>
                    )}
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    <div className={cn('rounded-lg border bg-card p-4')}>
                        <h2 className="mb-4 text-lg font-semibold">Resumen del pedido</h2>
                        
                        <ul className="mb-4 divide-y">
                            {items.map((item) => (
                                <li key={item.menuItemId} className="flex justify-between py-2">
                                    <span>
                                        {item.quantity}x {item.name}
                                    </span>
                                    <span className="font-medium tabular-nums">
                                        {formatCurrency(item.price * item.quantity)}
                                    </span>
                                </li>
                            ))}
                        </ul>

                        <dl className="space-y-2 border-t pt-4 text-sm">
                            <div className="flex justify-between">
                                <dt className="text-muted-foreground">Subtotal</dt>
                                <dd className="font-medium tabular-nums">
                                    {formatCurrency(subtotal)}
                                </dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-muted-foreground">
                                    Comisión ({(COMMISSION_RATE * 100).toFixed(0)}%)
                                </dt>
                                <dd className="font-medium tabular-nums">
                                    {formatCurrency(commission)}
                                </dd>
                            </div>

                            {wallet_points > 0 && (
                                <div className="flex items-center gap-2 border-t pt-3">
                                    <Checkbox
                                        id="use-points"
                                        checked={usePoints}
                                        onCheckedChange={(checked) =>
                                            setUsePoints(checked === true)
                                        }
                                    />
                                    <label
                                        htmlFor="use-points"
                                        className="cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                        Usar puntos ({wallet_points} pts disponibles, 100 pts = 1€)
                                    </label>
                                </div>
                            )}

                            {usePoints && maxPointsToUse > 0 && (
                                <div className="flex justify-between text-green-600 dark:text-green-400">
                                    <dt>Descuento por puntos</dt>
                                    <dd className="font-medium tabular-nums">
                                        -{formatCurrency(pointsDiscountEur)} (-{maxPointsToUse} pts)
                                    </dd>
                                </div>
                            )}

                            <div className="flex justify-between border-t pt-2 text-base">
                                <dt className="font-semibold">Total</dt>
                                <dd className="font-semibold tabular-nums">
                                    {formatCurrency(finalTotal)}
                                </dd>
                            </div>
                        </dl>
                    </div>

                    <div className={cn('rounded-lg border bg-card p-4')}>
                        <h2 className="mb-4 text-lg font-semibold">Método de pago</h2>

                        {error && (
                            <Alert variant="destructive" className="mb-4">
                                <AlertCircle className="size-4" />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        {isLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="size-8 animate-spin text-muted-foreground" />
                            </div>
                        ) : clientSecret && stripePromise ? (
                            <Elements
                                stripe={stripePromise}
                                options={{
                                    clientSecret,
                                    appearance: {
                                        theme: 'stripe',
                                        variables: {
                                            colorPrimary: '#0f172a',
                                        },
                                    },
                                    locale: 'es',
                                }}
                            >
                                <PaymentForm
                                    onSuccess={handlePaymentSuccess}
                                    onError={setError}
                                    clientSecret={clientSecret}
                                />
                            </Elements>
                        ) : !error ? (
                            <div className="py-8 text-center text-muted-foreground">
                                <p>Cargando método de pago...</p>
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
