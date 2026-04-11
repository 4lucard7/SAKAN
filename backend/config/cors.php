<?php

return [

    /*
    |--------------------------------------------------------------------------
    | SAKAN — CORS Configuration
    |--------------------------------------------------------------------------
    |
    | Autorise le frontend React/Vite (localhost:5173) à appeler l'API Laravel.
    | En production, remplacer 'allowed_origins' par l'URL réelle du frontend.
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        env('FRONTEND_URL', 'http://localhost:5173'),
    ],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    /*
     | Doit être true pour que Sanctum puisse lire le cookie de session
     | (authentification "stateful"). Utilisez false si vous utilisez
     | uniquement des tokens Bearer (stateless).
     */
    'supports_credentials' => true,

];