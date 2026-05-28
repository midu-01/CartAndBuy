<?php

namespace App\Http\Controllers\Shop;

use App\Http\Controllers\Controller;
use App\Models\Address;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AddressController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('shop/addresses', [
            'addresses' => $request->user()->addresses()->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'type' => ['required', 'string', 'in:shipping,billing'],
            'first_name' => ['required', 'string', 'max:100'],
            'last_name' => ['nullable', 'string', 'max:100'],
            'phone' => ['required', 'string', 'max:20'],
            'address' => ['required', 'string'],
            'city' => ['required', 'string'],
            'state' => ['required', 'string'],
            'upazilla' => ['nullable', 'string'],
            'village' => ['nullable', 'string'],
            'zip' => ['nullable', 'string'],
            'country' => ['required', 'string'],
            'is_default' => ['boolean'],
        ]);

        if ($request->boolean('is_default')) {
            $request->user()->addresses()->update(['is_default' => false]);
        }

        $request->user()->addresses()->create($validated);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Address saved successfully.']);

        return back();
    }

    public function update(Request $request, Address $address): RedirectResponse
    {
        abort_if($address->user_id !== $request->user()->id, 403);

        $validated = $request->validate([
            'type' => ['required', 'string', 'in:shipping,billing'],
            'first_name' => ['required', 'string', 'max:100'],
            'last_name' => ['nullable', 'string', 'max:100'],
            'phone' => ['required', 'string', 'max:20'],
            'address' => ['required', 'string'],
            'city' => ['required', 'string'],
            'state' => ['required', 'string'],
            'upazilla' => ['nullable', 'string'],
            'village' => ['nullable', 'string'],
            'zip' => ['nullable', 'string'],
            'country' => ['required', 'string'],
            'is_default' => ['boolean'],
        ]);

        if ($request->boolean('is_default') && ! $address->is_default) {
            $request->user()->addresses()->where('id', '!=', $address->id)->update(['is_default' => false]);
        }

        $address->update($validated);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Address updated successfully.']);

        return back();
    }

    public function destroy(Request $request, Address $address): RedirectResponse
    {
        abort_if($address->user_id !== $request->user()->id, 403);

        $address->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Address deleted.']);

        return back();
    }
}
