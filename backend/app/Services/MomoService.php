<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class MomoService
{
    private $endpoint;
    private $partnerCode;
    private $accessKey;
    private $secretKey;

    public function __construct()
    {
        $this->endpoint = config('services.momo.endpoint');
        $this->partnerCode = config('services.momo.partner_code');
        $this->accessKey = config('services.momo.access_key');
        $this->secretKey = config('services.momo.secret_key');
    }

    public function createPayment($amount, $orderId)
    {
        $requestId = time() . "";
        $rawHash = "accessKey=" . $this->accessKey .
            "&amount=" . $amount .
            "&extraData=" .
            "&ipnUrl=" . route('momo.notify') .
            "&orderId=" . $orderId .
            "&orderInfo=Li xi may man" .
            "&partnerCode=" . $this->partnerCode .
            "&redirectUrl=" . route('momo.return') .
            "&requestId=" . $requestId .
            "&requestType=captureWallet";

        $signature = hash_hmac('sha256', $rawHash, $this->secretKey);

        $data = [
            'partnerCode' => $this->partnerCode,
            'accessKey' => $this->accessKey,
            'requestId' => $requestId,
            'amount' => $amount,
            'orderId' => $orderId,
            'orderInfo' => 'Li xi may man',
            'redirectUrl' => route('momo.return'),
            'ipnUrl' => route('momo.notify'),
            'requestType' => 'captureWallet',
            'extraData' => '',
            'signature' => $signature
        ];

        $response = Http::post($this->endpoint, $data);
        return $response->json();
    }

    public function verifySignature($data, $signature)
    {
        ksort($data);
        $rawHash = '';
        foreach ($data as $key => $value) {
            if ($key !== 'signature') {
                $rawHash .= "&$key=$value";
            }
        }
        $rawHash = ltrim($rawHash, '&');
        
        $checkSignature = hash_hmac('sha256', $rawHash, $this->secretKey);
        return $signature === $checkSignature;
    }
} 