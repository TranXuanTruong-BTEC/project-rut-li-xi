<?php

namespace App\Events;

use App\Models\Draw;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class PaymentSuccessful implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $draw;

    public function __construct(Draw $draw)
    {
        $this->draw = $draw;
    }

    public function broadcastOn()
    {
        return new PrivateChannel('user.' . $this->draw->user_id);
    }
} 