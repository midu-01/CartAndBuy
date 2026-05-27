<?php

namespace App\Http\Controllers\Shop;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class SupportController extends Controller
{
    public function helpCenter(): Response
    {
        return Inertia::render('shop/help-center');
    }

    public function contact(): Response
    {
        return Inertia::render('shop/contact');
    }

    public function returns(): Response
    {
        return Inertia::render('shop/returns');
    }
}
