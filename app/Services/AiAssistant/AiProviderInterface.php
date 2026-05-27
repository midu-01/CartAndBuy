<?php

namespace App\Services\AiAssistant;

interface AiProviderInterface
{
    /**
     * @param  array<array{role: string, content: string}>  $messages
     */
    public function complete(array $messages): string;

    public function isEnabled(): bool;
}
