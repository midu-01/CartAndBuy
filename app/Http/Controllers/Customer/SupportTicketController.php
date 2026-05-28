<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\SupportTicket;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SupportTicketController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('customer/support/index', [
            'tickets' => $request->user()
                ->supportTickets()
                ->withCount('messages')
                ->latest()
                ->paginate(10),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'subject' => ['required', 'string', 'max:200'],
            'message' => ['required', 'string', 'max:5000'],
            'priority' => ['required', 'in:low,normal,high'],
        ]);

        $ticket = $request->user()->supportTickets()->create([
            'subject' => $validated['subject'],
            'status' => 'open',
            'priority' => $validated['priority'],
        ]);

        $ticket->messages()->create([
            'user_id' => $request->user()->id,
            'message' => $validated['message'],
            'is_admin_reply' => false,
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Ticket created successfully.']);

        return to_route('account.support.show', $ticket);
    }

    public function show(Request $request, SupportTicket $ticket): Response
    {
        abort_if($ticket->user_id !== $request->user()->id, 403);

        $ticket->load(['messages.user']);

        return Inertia::render('customer/support/show', [
            'ticket' => $ticket,
        ]);
    }

    public function reply(Request $request, SupportTicket $ticket): RedirectResponse
    {
        abort_if($ticket->user_id !== $request->user()->id, 403);
        abort_if($ticket->status === 'closed', 422, 'Cannot reply to a closed ticket.');

        $validated = $request->validate([
            'message' => ['required', 'string', 'max:5000'],
        ]);

        $ticket->messages()->create([
            'user_id' => $request->user()->id,
            'message' => $validated['message'],
            'is_admin_reply' => false,
        ]);

        if ($ticket->status === 'resolved') {
            $ticket->update(['status' => 'open']);
        }

        return back();
    }

    public function close(Request $request, SupportTicket $ticket): RedirectResponse
    {
        abort_if($ticket->user_id !== $request->user()->id, 403);

        $ticket->update(['status' => 'closed']);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Ticket closed.']);

        return to_route('account.support.index');
    }
}
