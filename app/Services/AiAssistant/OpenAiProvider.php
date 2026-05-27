<?php

namespace App\Services\AiAssistant;

use Illuminate\Support\Facades\Http;

class OpenAiProvider implements AiProviderInterface
{
    public function __construct(
        private readonly string $apiKey,
        private readonly string $model,
    ) {}

    /**
     * @param  array<array{role: string, content: string}>  $messages
     */
    public function complete(array $messages): string
    {
        $response = Http::withToken($this->apiKey)
            ->timeout(30)
            ->post('https://api.openai.com/v1/chat/completions', [
                'model' => $this->model,
                'messages' => $messages,
                'max_tokens' => 500,
                'temperature' => 0.7,
            ]);

        if (! $response->successful()) {
            throw new \RuntimeException('AI provider error: '.$response->status());
        }

        return $response->json('choices.0.message.content', '');
    }

    public function isEnabled(): bool
    {
        return ! empty($this->apiKey);
    }
}
