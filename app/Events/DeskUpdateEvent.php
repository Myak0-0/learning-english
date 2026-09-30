<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class DeskUpdateEvent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $topicId;
    public $userId;
    public $snapshot;

    public function __construct($topicId, int $userId, array $snapshot)
    {
        $this->topicId = $topicId;
        $this->userId = $userId;
        $this->snapshot = $snapshot;
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('topic-board.' . $this->topicId),
        ];
    }

    public function broadcastAs(): string
    {
        return 'board.updated';
    }
}
