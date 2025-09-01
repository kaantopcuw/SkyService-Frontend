<script>
  import { apiService } from '../services/api.js';
  import { user } from '../stores/auth.js';

  export let navigate;

  let name = '';
  let email = '';
  let password = '';
  let loading = false;
  let error = '';

  async function handleRegister() {
    if (!name || !email || !password) {
      error = 'Tüm alanlar gerekli';
      return;
    }

    try {
      loading = true;
      error = '';
      const userData = await apiService.register(name, email, password);
      
      const loginData = await apiService.login(email, password);
      user.set(loginData);
      localStorage.setItem('skyservice_user', JSON.stringify(loginData));
      
      navigate('home');
    } catch (err) {
      error = 'Kayıt sırasında hata oluştu';
    } finally {
      loading = false;
    }
  }
</script>

<div class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
  <div class="max-w-md w-full space-y-8">
    <div class="text-center">
      <h2 class="text-3xl font-bold text-gray-900">Kayıt Ol</h2>
      <p class="mt-2 text-gray-600">Yeni hesap oluşturun</p>
    </div>
    
    <div class="bg-white rounded-xl shadow-lg p-8">
      {#if error}
        <div class="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <p class="text-red-700 text-sm">{error}</p>
        </div>
      {/if}

      <form on:submit|preventDefault={handleRegister} class="space-y-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Ad Soyad</label>
          <input 
            type="text" 
            class="input-field" 
            bind:value={name} 
            required 
            placeholder="Adınız ve soyadınız"
          />
        </div>

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
            placeholder="Güçlü bir şifre seçin"
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
              Kayıt yapılıyor...
            </div>
          {:else}
            Kayıt Ol
          {/if}
        </button>
      </form>

      <div class="text-center mt-6">
        <p class="text-gray-600 mb-3">Zaten hesabınız var mı?</p>
        <button 
          class="text-blue-600 hover:text-blue-700 font-medium"
          on:click={() => navigate('login')}
        >
          Giriş Yap
        </button>
      </div>
    </div>
  </div>
</div>