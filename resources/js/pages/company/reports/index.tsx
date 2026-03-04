import { Head, router } from '@inertiajs/react';
import CompanyLayout from '@/layouts/company-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { DollarSign, ShoppingCart, TrendingUp, XCircle, Package, Store } from 'lucide-react';

interface Company {
    id: number;
    name: string;
}

interface Branch {
    id: number;
    name: string;
}

interface SalesData {
    date: string;
    total: number;
    count: number;
}

interface BranchSales {
    restaurant_id: number;
    total_sales: number;
    total_orders: number;
    restaurant: {
        name: string;
        branch?: {
            name: string;
        };
    };
}

interface TopProduct {
    name: string;
    quantity: number;
    total: number;
}

interface Summary {
    total_revenue: number;
    total_orders: number;
    completed_orders: number;
    average_order_value: number;
    cancelled_orders: number;
}

interface Props {
    company: Company;
    branch: Branch | null;
    salesOverTime: SalesData[];
    salesByBranch: BranchSales[];
    topProducts: TopProduct[];
    summary: Summary;
    period: string;
    startDate: string;
    endDate: string;
}

export default function ReportsIndex({
    company,
    branch,
    salesOverTime,
    salesByBranch,
    topProducts,
    summary,
    period,
    startDate,
    endDate,
}: Props) {
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'USD',
        }).format(value);
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short',
        });
    };

    const handlePeriodChange = (newPeriod: string) => {
        router.get('/company/reports', { period: newPeriod }, { preserveState: true });
    };

    const periodLabels: Record<string, string> = {
        week: 'Última semana',
        month: 'Último mes',
        quarter: 'Último trimestre',
        year: 'Último año',
    };

    const maxSales = Math.max(...salesOverTime.map(d => d.total), 1);

    return (
        <CompanyLayout>
            <Head title="Reportes" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Reportes</h1>
                        <p className="text-muted-foreground">
                            {branch ? `Estadísticas de ${branch.name}` : `Estadísticas de ${company.name}`}
                        </p>
                    </div>
                    <Select value={period} onValueChange={handlePeriodChange}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="week">Última semana</SelectItem>
                            <SelectItem value="month">Último mes</SelectItem>
                            <SelectItem value="quarter">Último trimestre</SelectItem>
                            <SelectItem value="year">Último año</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(summary.total_revenue)}</div>
                            <p className="text-xs text-muted-foreground">
                                {periodLabels[period]}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pedidos Totales</CardTitle>
                            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{summary.total_orders}</div>
                            <p className="text-xs text-muted-foreground">
                                {summary.completed_orders} completados
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Ticket Promedio</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(summary.average_order_value)}</div>
                            <p className="text-xs text-muted-foreground">
                                Por pedido completado
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Cancelados</CardTitle>
                            <XCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{summary.cancelled_orders}</div>
                            <p className="text-xs text-muted-foreground">
                                {summary.total_orders > 0 
                                    ? `${((summary.cancelled_orders / summary.total_orders) * 100).toFixed(1)}% del total`
                                    : '0% del total'}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Ventas por Día</CardTitle>
                            <CardDescription>
                                {formatDate(startDate)} - {formatDate(endDate)}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {salesOverTime.length > 0 ? (
                                <div className="space-y-2">
                                    {salesOverTime.slice(-14).map((day) => (
                                        <div key={day.date} className="flex items-center gap-3">
                                            <span className="w-16 text-sm text-muted-foreground">
                                                {formatDate(day.date)}
                                            </span>
                                            <div className="flex-1">
                                                <div 
                                                    className="h-6 rounded bg-primary/80"
                                                    style={{ width: `${(day.total / maxSales) * 100}%`, minWidth: '4px' }}
                                                />
                                            </div>
                                            <span className="w-24 text-right text-sm font-medium">
                                                {formatCurrency(day.total)}
                                            </span>
                                            <span className="w-12 text-right text-xs text-muted-foreground">
                                                {day.count} ord.
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-8 text-center">
                                    <ShoppingCart className="h-12 w-12 text-muted-foreground/50" />
                                    <p className="mt-2 text-muted-foreground">
                                        No hay ventas en este período
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Package className="h-5 w-5" />
                                Productos Más Vendidos
                            </CardTitle>
                            <CardDescription>Top 10 del período</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {topProducts.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Producto</TableHead>
                                            <TableHead className="text-right">Cantidad</TableHead>
                                            <TableHead className="text-right">Total</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {topProducts.map((product, index) => (
                                            <TableRow key={index}>
                                                <TableCell className="font-medium">{product.name}</TableCell>
                                                <TableCell className="text-right">{product.quantity}</TableCell>
                                                <TableCell className="text-right">{formatCurrency(product.total)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-8 text-center">
                                    <Package className="h-12 w-12 text-muted-foreground/50" />
                                    <p className="mt-2 text-muted-foreground">
                                        No hay productos vendidos
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {salesByBranch.length > 1 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Store className="h-5 w-5" />
                                Ventas por Sucursal
                            </CardTitle>
                            <CardDescription>Comparativa de sucursales</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Sucursal</TableHead>
                                        <TableHead className="text-right">Pedidos</TableHead>
                                        <TableHead className="text-right">Ventas</TableHead>
                                        <TableHead className="text-right">Promedio</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {salesByBranch.map((branchData) => (
                                        <TableRow key={branchData.restaurant_id}>
                                            <TableCell className="font-medium">
                                                {branchData.restaurant?.branch?.name || branchData.restaurant?.name || 'Sin nombre'}
                                            </TableCell>
                                            <TableCell className="text-right">{branchData.total_orders}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(branchData.total_sales)}</TableCell>
                                            <TableCell className="text-right">
                                                {formatCurrency(branchData.total_orders > 0 ? branchData.total_sales / branchData.total_orders : 0)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}
            </div>
        </CompanyLayout>
    );
}
