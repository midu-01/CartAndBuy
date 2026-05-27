<?php

return [
    'provider' => env('AI_PROVIDER', 'openai'),
    'api_key' => env('AI_API_KEY', ''),
    'model' => env('AI_MODEL', 'gpt-4o-mini'),
    'enabled' => env('AI_ASSISTANT_ENABLED', true),
    'max_history' => 10,
];
