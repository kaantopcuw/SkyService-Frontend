<script>
  import { onMount } from 'svelte';
  import Home from './components/Home.svelte';
  import Login from './components/Login.svelte';
  import Register from './components/Register.svelte';
  import Availability from './components/Availability.svelte';
  import { user, isLoggedIn } from './stores/auth.js';

  let currentPage = 'home';
  let searchParams = {};

  function navigate(page, params = {}) {
    currentPage = page;
    searchParams = params;
  }

  onMount(() => {
    // Check if user is logged in from localStorage
    const storedUser = localStorage.getItem('skyservice_user');
    if (storedUser) {
      user.set(JSON.parse(storedUser));
    }
  });
</script>

<main class="min-h-screen bg-gray-50">
  <!-- Navigation -->
  <nav class="bg-white shadow-sm border-b border-gray-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <button 
          class="flex items-center space-x-2 text-xl font-bold text-blue-600 hover:text-blue-700 transition-colors"
          on:click={() => navigate('home')}
        >
          <img src="/plane.png" alt="Plane" class="w-8 h-8" />
          <span>SkyService</span>
        </button>
        
        <div class="flex items-center space-x-4">
          {#if $isLoggedIn}
            <span class="text-gray-700">Hoş geldin, {$user.name}</span>
            <button 
              class="btn-outline text-sm"
              on:click={() => {
                user.set(null);
                localStorage.removeItem('skyservice_user');
                navigate('home');
              }}
            >
              Çıkış
            </button>
          {:else}
            <button class="btn-outline text-sm" on:click={() => navigate('login')}>
              Giriş
            </button>
            <button class="btn-primary text-sm" on:click={() => navigate('register')}>
              Kayıt Ol
            </button>
          {/if}
        </div>
      </div>
    </div>
  </nav>

  <!-- Page Content -->
  <div class="w-full">
    {#if currentPage === 'home'}
      <Home {navigate} />
    {:else if currentPage === 'login'}
      <Login {navigate} />
    {:else if currentPage === 'register'}
      <Register {navigate} />
    {:else if currentPage === 'availability'}
      <Availability {searchParams} {navigate} />
    {/if}
  </div>
</main>