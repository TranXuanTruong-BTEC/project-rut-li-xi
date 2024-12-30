<?php

namespace App\Http\Controllers;

use App\Models\Draw;
use App\Services\MomoService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DrawController extends Controller
{
    private $momoService;

    public function __construct(MomoService $momoService)
    {
        $this->momoService = $momoService;
    }

    public function draw(Request $request)
    {
        // Kiểm tra số lần rút trong ngày
        $today_draws = Draw::where('user_id', Auth::id())
            ->whereDate('created_at', today())
            ->count();

        if ($today_draws >= 3) {
            return response()->json([
                'message' => 'Bạn đã hết lượt rút trong ngày'
            ], 403);
        }

        // Tạo lì xì mới
        $amounts = [5000, 10000, 15000, 20000];
        $amount = $amounts[array_rand($amounts)];

        $draw = Draw::create([
            'user_id' => Auth::id(),
            'amount' => $amount
        ]);

        // Tạo thanh toán MoMo
        $paymentResponse = $this->momoService->createPayment(
            $amount,
            'LX' . $draw->id
        );

        return response()->json([
            'draw' => $draw,
            'payment_url' => $paymentResponse['payUrl'] ?? null,
            'message' => 'Rút lì xì thành công'
        ]);
    }

    public function history()
    {
        $draws = Draw::where('user_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['draws' => $draws]);
    }

    public function stats()
    {
        $user = Auth::user();
        $today_draws = Draw::where('user_id', $user->id)
            ->whereDate('created_at', today())
            ->count();

        $total_amount = Draw::where('user_id', $user->id)
            ->where('is_paid', true)
            ->sum('amount');

        return response()->json([
            'today_draws' => $today_draws,
            'remaining_draws' => 3 - $today_draws,
            'total_amount' => $total_amount
        ]);
    }
} 