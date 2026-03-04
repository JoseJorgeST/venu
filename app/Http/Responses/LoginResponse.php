<?php

namespace App\Http\Responses;

use Illuminate\Http\JsonResponse;
use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;
use Symfony\Component\HttpFoundation\Response;

class LoginResponse implements LoginResponseContract
{
    public function toResponse($request): Response
    {
        $user = $request->user();

        if ($request->wantsJson()) {
            return new JsonResponse('', 204);
        }

        if ($user->hasRole('super_admin')) {
            return redirect()->intended('/admin');
        }

        if ($user->hasRole('admin')) {
            return redirect()->intended('/company');
        }

        return redirect()->intended('/dashboard');
    }
}
