<?php

namespace App\Http\Controllers\Shop;

use App\Http\Controllers\Controller;
use App\Models\CustomerAddress;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CustomerAddressController extends Controller
{
    private function validationRules(): array
    {
        return [
            'label' => ['required', 'string', 'in:Home,Work,Other'],
            'recipient_name' => ['required', 'string', 'max:100'],
            'recipient_phone' => ['required', 'string', 'max:20'],
            'address_line' => ['required', 'string', 'max:255'],
            'city' => ['required', 'string', 'max:100'],
            'area' => ['required', 'string', 'max:100'],
            'postal_code' => ['required', 'string', 'max:20'],
        ];
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate($this->validationRules());

        $isFirst = $request->user()->customerAddresses()->doesntExist();

        if ($isFirst) {
            $validated['is_default'] = true;
        } else {
            $validated['is_default'] = false;
        }

        $request->user()->customerAddresses()->create($validated);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Address added.']);

        return back();
    }

    public function update(Request $request, CustomerAddress $customerAddress): RedirectResponse
    {
        abort_if($customerAddress->user_id !== $request->user()->id, 403);

        $validated = $request->validate($this->validationRules());

        $customerAddress->update($validated);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Address updated.']);

        return back();
    }

    public function destroy(Request $request, CustomerAddress $customerAddress): RedirectResponse
    {
        abort_if($customerAddress->user_id !== $request->user()->id, 403);

        if ($customerAddress->is_default) {
            $other = $request->user()->customerAddresses()
                ->where('id', '!=', $customerAddress->id)
                ->first();

            if ($other) {
                $other->update(['is_default' => true]);
            }
        }

        $customerAddress->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Address deleted.']);

        return back();
    }

    public function setDefault(Request $request, CustomerAddress $customerAddress): RedirectResponse
    {
        abort_if($customerAddress->user_id !== $request->user()->id, 403);

        $request->user()->customerAddresses()->update(['is_default' => false]);
        $customerAddress->update(['is_default' => true]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Default address updated.']);

        return back();
    }
}
