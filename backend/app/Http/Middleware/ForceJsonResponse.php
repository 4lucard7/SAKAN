<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ForceJsonResponse
{
    /**
     * Force toutes les requêtes API à accepter du JSON.
     * Cela empêche Laravel de rediriger vers une page "login"
     * quand l'utilisateur n'est pas authentifié.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $request->headers->set('Accept', 'application/json');

        return $next($request);
    }
}
