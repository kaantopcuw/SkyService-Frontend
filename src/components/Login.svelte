<script>
  import { apiService } from '../services/api.js';
  import { user } from '../stores/auth.js';

  export let navigate;

  let email = 'test@example.com';
  let password = '1234';
  let loading = false;
  let error = '';

  async function handleLogin() {
    if (!email || !password) {
      error = 'Email ve şifre gerekli';
      return;
    }

    try {
      loading = true;
      error = '';
      const userData = await apiService.login(email, password);
      
      user.set(userData);
      localStorage.setItem('skyservice_user', JSON.stringify(userData));
      
      navigate('home');
    } catch (err) {
      error = 'Email veya şifre hatalı';
    } finally {
      loading = false;
    }
  }
</script>

<div class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
  <div class="max-w-md w-full space-y-8">
    <div class="text-center">
      <h2 class="text-3xl font-bold text-gray-900">Giriş Yap</h2>
      <p class="mt-2 text-gray-600">Hesabınıza giriş yapın</p>
    </div>
    
    <div class="bg-white rounded-xl shadow-lg p-8">
      {#if error}
        <div class="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <p class="text-red-700 text-sm">{error}</p>
        </div>
      {/if}

      <form on:submit|preventDefault={handleLogin} class="space-y-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <input 
            type="email" 
            class="input-field" 
            bind:value={email} 
            required 
            placeholder="email@example.com"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Şifre</label>
          <input 
            type="password" 
            class="input-field" 
            bind:value={password} 
            required 
            placeholder="Şifrenizi girin"
          />
        </div>

        <button 
          type="submit" 
          class="w-full btn-primary py-3 text-lg font-semibold" 
          disabled={loading}
        >
          {#if loading}
            <div class="flex items-center justify-center">
              <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Giriş yapılıyor...
            </div>
          {:else}
            Giriş Yap
          {/if}
        </button>
      </form>

      <div class="text-center mt-6">
        <p class="text-gray-600 mb-3">Hesabınız yok mu?</p>
        <button 
          class="text-blue-600 hover:text-blue-700 font-medium"
          on:click={() => navigate('register')}
        >
          Kayıt Ol
        </button>
      </div>

      <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
        <p class="text-blue-800 font-medium text-sm mb-1">Test hesabı:</p>
        <p class="text-blue-700 text-sm">Email: test@example.com</p>
        <p class="text-blue-700 text-sm">Şifre: 1234</p>
      </div>
    </div>
  </div>
</div>