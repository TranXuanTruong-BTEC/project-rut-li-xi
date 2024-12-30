<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class TikTokService
{
    private $clientKey;
    private $clientSecret;
    private $redirectUri;

    public function __construct()
    {
        $this->clientKey = config('services.tiktok.client_key');
        $this->clientSecret = config('services.tiktok.client_secret');
        $this->redirectUri = config('services.tiktok.redirect_uri');
    }

    public function getAccessToken($code)
    {
        $response = Http::post('https://open-api.tiktok.com/oauth/access_token/', [
            'client_key' => $this->clientKey,
            'client_secret' => $this->clientSecret,
            'code' => $code,
            'grant_type' => 'authorization_code'
        ]);

        return $response->json();
    }

    public function getUserInfo($accessToken)
    {
        $response = Http::withToken($accessToken)
            ->get('https://open-api.tiktok.com/user/info/');

        return $response->json();
    }
} 