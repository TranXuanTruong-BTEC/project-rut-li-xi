<?php

namespace App\Http\Controllers;

use App\Models\Draw;
use App\Events\PaymentSuccessful;
use App\Services\MomoService;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    private $momoService;

    public function __construct(MomoService $momoService)
    {
        $this->momoService = $momoService;
    }

    public function notify(Request $request)
    {
        $signature = $request->signature;
        $rawData = $request->except('signature');
        
        // Verify signature
        if (!$this->momoService->verifySignature($rawData, $signature)) {
            return response()->json(['message' => 'Invalid signature'], 400);
        }

        $orderId = str_replace('LX', '', $request->orderId);
        $draw = Draw::find($orderId);

        if (!$draw) {
            return response()->json(['message' => 'Draw not found'], 404);
        }

        if ($request->resultCode == 0) {
            $draw->update([
                'is_paid' => true,
                'paid_at' => now()
            ]);

            event(new PaymentSuccessful($draw));
        }

        return response()->json(['message' => 'OK']);
    }

    public function return(Request $request)
    {
        return redirect(config('app.frontend_url') . '/payment/status?' . $request->getQueryString());
    }
} 