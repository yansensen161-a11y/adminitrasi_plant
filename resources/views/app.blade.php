<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">
        <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
        <meta http-equiv="Pragma" content="no-cache">
        <meta http-equiv="Expires" content="0">

        <title inertia>{{ config('app.name', 'Laravel') }}</title>

        <!-- Dynamic Favicon -->
        @php
            $favPath = \Illuminate\Support\Facades\Schema::hasTable('settings')
                ? \App\Models\Setting::where('key', 'app_favicon')->value('value')
                : null;
            $favUrl = $favPath 
                ? (str_starts_with($favPath, '/') || str_starts_with($favPath, 'http') ? $favPath : asset('storage/' . $favPath))
                : '/images/favicon.png';
        @endphp
        <link rel="icon" href="{{ $favUrl }}" id="app-favicon">
        <link rel="apple-touch-icon" href="{{ $favUrl }}" id="app-touch-icon">

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        <script>
            if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                // To default to white regardless of system preference when there's no saved theme:
                // If you want it always white first, uncomment the below line and comment the matchMedia line above.
                // But typically you respect system or just default light.
                // Let's force default light if no theme is set, as requested by "outih semua dlu"
            }
            if (localStorage.theme === 'dark') {
                document.documentElement.classList.add('dark');
                document.documentElement.style.colorScheme = 'dark';
            } else {
                document.documentElement.classList.remove('dark');
                document.documentElement.style.colorScheme = 'light';
            }
        </script>
        @vite(['resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
