<?php

namespace App\Http\Controllers;

use App\Models\OtpCode;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class OtpController extends Controller
{
    /**
     * Send OTP code to the given phone number.
     */
    public function send(Request $request)
    {
        $validated = Validator::make($request->all(), [
            'phone' => ['required', 'string', 'max:255'],
        ])->validate();

        $phone = $validated['phone'];

        // Invalidar códigos anteriores para este teléfono
        OtpCode::where('phone', $phone)->delete();

        $code = (string) random_int(100000, 999999);

        OtpCode::create([
            'phone' => $phone,
            'code' => $code,
            'expires_at' => now()->addMinutes(5),
        ]);

        // TODO: enviar código por SMS (Twilio, etc.)

        return redirect()->route('verify-otp', ['phone' => $phone])
            ->with('status', 'Código enviado. Válido por 5 minutos.');
    }

    /**
     * Verify the OTP code for the given phone number.
     * Si es correcto, loguea al usuario y elimina el código.
     */
    public function verify(Request $request)
    {
        $validated = Validator::make($request->all(), [
            'phone' => ['required', 'string', 'max:255'],
            'code' => ['required', 'string', 'size:6'],
        ])->validate();

        $otp = OtpCode::where('phone', $validated['phone'])
            ->where('code', $validated['code'])
            ->first();

        if (! $otp) {
            return redirect()->back()->withErrors(['code' => 'Código inválido o no encontrado.']);
        }

        if ($otp->isExpired()) {
            $otp->delete();

            return redirect()->back()->withErrors(['code' => 'El código ha expirado. Solicita uno nuevo.']);
        }

        $user = User::where('phone', $validated['phone'])->first();

        if (! $user) {
            return redirect()->back()->withErrors(['code' => 'No existe un usuario con este teléfono.']);
        }

        Auth::login($user);
        $otp->delete();

        return redirect()->intended(route('dashboard'));
    }
}
