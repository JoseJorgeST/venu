import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/style.css';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import type { BreadcrumbItem } from '@/types';

type Restaurant = {
    id: number;
    name: string;
    slug: string;
};

type Props = {
    restaurant: Restaurant | null;
};

const TIME_SLOTS: string[] = [];
for (let h = 12; h <= 22; h++) {
    for (let m = 0; m < 60; m += 30) {
        if (h === 22 && m > 0) break;
        TIME_SLOTS.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
    }
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Reservas', href: '/reservations' },
    { title: 'Nueva reserva', href: '/reservations/create' },
];

export default function ReservationCreate({ restaurant }: Props) {
    const [date, setDate] = useState<Date | undefined>(undefined);
    const [time, setTime] = useState<string>('');
    const [partySize, setPartySize] = useState<string>('2');
    const [specialRequests, setSpecialRequests] = useState<string>('');
    const [processing, setProcessing] = useState(false);

    const restaurantId = restaurant?.id ?? null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!date || !time || !restaurantId) return;

        const data = {
            restaurant_id: restaurantId,
            date: date.toISOString().slice(0, 10),
            time: time.length === 5 ? `${time}:00` : time,
            party_size: parseInt(partySize, 10) || 1,
            special_requests: specialRequests || null,
        };

        setProcessing(true);
        router.post('/reservations', data, {
            onFinish: () => setProcessing(false),
        });
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nueva reserva" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <h1 className="text-2xl font-semibold">Nueva reserva</h1>

                {restaurant && (
                    <p className="text-muted-foreground">
                        Restaurante: <span className="font-medium text-foreground">{restaurant.name}</span>
                    </p>
                )}

                {!restaurant && (
                    <p className="text-sm text-[#b8860b]">
                        Selecciona un restaurante desde su página y pulsa &quot;Hacer reserva&quot;.
                    </p>
                )}

                <form onSubmit={handleSubmit} className="flex max-w-xl flex-col gap-6">
                    <input type="hidden" name="restaurant_id" value={restaurantId ?? ''} />

                    <div>
                        <Label className="mb-2 block">Fecha</Label>
                        <DayPicker
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            disabled={{ before: today }}
                            className="rounded-lg border p-4"
                        />
                    </div>

                    <div>
                        <Label className="mb-2 block">Hora</Label>
                        <div className="flex flex-wrap gap-2">
                            {TIME_SLOTS.map((slot) => (
                                <Button
                                    key={slot}
                                    type="button"
                                    variant={time === slot ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setTime(slot)}
                                >
                                    {slot}
                                </Button>
                            ))}
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="party_size">Número de comensales</Label>
                        <Input
                            id="party_size"
                            type="number"
                            min={1}
                            max={20}
                            value={partySize}
                            onChange={(e) => setPartySize(e.target.value)}
                            required
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="special_requests">Peticiones especiales (opcional)</Label>
                        <textarea
                            id="special_requests"
                            className={cn(
                                'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
                            )}
                            value={specialRequests}
                            onChange={(e) => setSpecialRequests(e.target.value)}
                            maxLength={500}
                            placeholder="Alergias, celebración..."
                        />
                    </div>

                    <Button type="submit" disabled={!date || !time || !restaurantId || processing}>
                        Confirmar reserva
                    </Button>
                </form>
            </div>
        </AppLayout>
    );
}
