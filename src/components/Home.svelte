<script>
  import { onMount } from 'svelte';
  import { user, isLoggedIn } from '../stores/auth.js';
  import { apiService } from '../services/api.js';
  import FlightSearch from './FlightSearch.svelte';
  import AlarmsList from './AlarmsList.svelte';

  export let navigate;

  let userAlarms = [];
  let loadingAlarm = false;

  $: if ($isLoggedIn && $user?.id) {
    loadUserAlarms();
  }


  async function loadUserAlarms() {
    if (loadingAlarm || !$user?.id) return; // Prevent multiple simultaneous requests and run only if user id exists
    try {
        loadingAlarm = true;
      userAlarms = await apiService.getUserAlarms($user.id);
    } catch (error) {
      console.error('Error loading alarms:', error);
      userAlarms = []; // Ensure empty array on error
    } finally {
        loadingAlarm = false;
    }
  }

  async function deleteAlarm(alarmId) {
    try {
      await apiService.deleteAlarm(alarmId);
      userAlarms = userAlarms.filter(alarm => alarm.id !== alarmId);
    } catch (error) {
      console.error('Error deleting alarm:', error);
    }
  }
</script>

<!-- Hero Section -->
<section class="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-12">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="text-center">
      <h1 class="text-4xl md:text-6xl font-bold mb-4 flex items-center justify-center gap-4">
        <img src="/plane-white.png" alt="Plane" class="w-12 h-12 md:h-16 md:w-16" />
        SkyService
      </h1>
      <p class="text-xl md:text-2xl mb-6 text-blue-100">En uygun uçak biletlerini bulun ve fiyat alarmları oluşturun</p>
      <p class="text-lg text-blue-200">3 farklı havayolundan en iyi fiyatları karşılaştırın</p>
      <p class="text-lg text-blue-200">Bahamas Air, Sunrise Airways ve SkyAlps</p>
    </div>
  </div>
</section>

<!-- Search Section -->
<section class="py-12 -mt-8 relative z-10">
  <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="bg-white rounded-2xl shadow-xl p-8">
      <h3 class="text-2xl font-bold text-gray-900 text-center mb-8">Uçuş Ara</h3>
      <FlightSearch {navigate} />
    </div>
  </div>
</section>

<!-- User Alarms Section -->
{#if $isLoggedIn}
  <section class="py-5 bg-gray-100">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h3 class="text-2xl font-bold text-gray-900 mb-8">Fiyat Alarmlarım</h3>
      {#if loadingAlarm}
        <div class="flex justify-center">
          <div class="text-center py-8">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
            <p class="text-gray-600">Alarmlar yükleniyor...</p>
          </div>
        </div>
      {:else if userAlarms.length > 0}
        <AlarmsList alarms={userAlarms} onDelete={deleteAlarm} />
      {:else}
        <div class="text-center">
          <div class="mb-6">
            <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 17h5l-5 5-5-5h5v-6h5v6zM9 7H4l5-5 5 5H9v6H4V7z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 2v20"/>
            </svg>
          </div>
          <h4 class="text-xl font-semibold text-gray-900 mb-3">Henüz Fiyat Alarmınız Yok</h4>
          <p class="text-gray-600 mb-2 max-w-md mx-auto">Favori rotalarınız için fiyat takibi yapın ve en uygun fiyatlarda bildirim alın.</p>
          <p class="text-sm text-gray-500 mb-6">Uçuş arayın ve istediğiniz fiyat seviyesi için alarm kurun!</p>

        </div>
      {/if}
    </div>
  </section>
{:else}
  <section class="py-12 bg-gray-100">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <h4 class="text-2xl font-bold text-gray-900 mb-4">Fiyat Alarmları Kurmak İçin</h4>
      <p class="text-gray-600 mb-6">Üye olun ve favori rotalarınız için fiyat takibi yapın</p>
      <div class="space-x-4">
        <button class="btn-primary" on:click={() => navigate('login')}>
          Giriş Yap
        </button>
        <button class="btn-outline" on:click={() => navigate('register')}>
          Kayıt Ol
        </button>
      </div>
      <div class="mt-4">
        <p class="text-sm text-gray-500">
          Test için: test@example.com / 1234 kullanabilirsiniz
        </p>
      </div>
    </div>
  </section>
{/if}