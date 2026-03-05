<?php

use App\Http\Middleware\EnsureCompanyAccess;
use App\Http\Middleware\EnsureSuperAdmin;
use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\SetTenantContext;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Inertia\Inertia;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        $middleware->validateCsrfTokens(except: [
            'webhook/stripe/*',
        ]);

        $middleware->web(append: [
            HandleAppearance::class,
            SetTenantContext::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->alias([
            'super_admin' => EnsureSuperAdmin::class,
            'company_access' => EnsureCompanyAccess::class,
            'role' => \Spatie\Permission\Middleware\RoleMiddleware::class,
            'permission' => \Spatie\Permission\Middleware\PermissionMiddleware::class,
            'role_or_permission' => \Spatie\Permission\Middleware\RoleOrPermissionMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->render(function (NotFoundHttpException $e) {
            return Inertia::render('errors/404')
                ->toResponse(request())
                ->setStatusCode(404);
        });

        $exceptions->render(function (HttpException $e) {
            if ($e->getStatusCode() === 403) {
                return Inertia::render('errors/403')
                    ->toResponse(request())
                    ->setStatusCode(403);
            }

            if ($e->getStatusCode() === 500) {
                return Inertia::render('errors/500')
                    ->toResponse(request())
                    ->setStatusCode(500);
            }
        });
    })->create();
