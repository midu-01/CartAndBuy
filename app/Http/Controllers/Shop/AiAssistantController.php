<?php

namespace App\Http\Controllers\Shop;

use App\Http\Controllers\Controller;
use App\Services\AiAssistant\AiAssistantService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AiAssistantController extends Controller
{
    public function __construct(
        private readonly AiAssistantService $assistant,
    ) {}

    public function chat(Request $request): JsonResponse
    {
        $request->validate([
            'message' => ['required', 'string', 'max:500'],
        ]);

        if (! config('ai.enabled', true)) {
            return response()->json([
                'message' => 'The AI assistant is currently unavailable.',
                'type' => 'error',
            ]);
        }

        $response = $this->assistant->handle($request, $request->string('message')->toString());

        return response()->json($response);
    }
}
