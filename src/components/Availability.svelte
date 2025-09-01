<script>
  import { onMount } from 'svelte';
  import { apiService } from '../services/api.js';
  import { user, isLoggedIn } from '../stores/auth.js';

  export let searchParams;
  export let navigate;

  let flights = [];
  let loading = true;
  let error = '';
  let showAlarmModal = false;
  let alarmPrice = '';
  let expandedFlights = new Set();
  let alarmLoading = false;
  let alarmSuccess = false;
  let showLoginModal = false;
  let cheapest = 0;

  const airlineLogos = {
    'Bahamas Air': '/assets/logo_bahamasair.svg',
    'Sunrise Air': '/assets/logo-sunrise.svg',
    'Skyalps': '/assets/Skyalps-Logo.svg'
  };

  const airlineColors = {
    'Bahamas Air': 'bg-blue-50 border-blue-200',
    'Sunrise Air': 'bg-orange-50 border-orange-200',
    'Skyalps': 'bg-green-50 border-green-200'
  };

  onMount(async () => {
    try {
      flights = await apiService.searchFlights(searchParams);
      cheapest = getCheapestPrice();
    } catch (err) {
      error = 'Uçuşlar yüklenirken hata oluştu';
    } finally {
      loading = false;
    }
  });

  function formatTime(timeStr) {
    return timeStr.replace(' AM', '').replace(' PM', '');
  }

  function getCheapestPrice() {
    if (flights.length === 0) return 0;
    return Math.min(...flights.map(flight => flight.minFarePrice));
  }

  function toggleFlightExpansion(index) {
    if (expandedFlights.has(index)) {
      expandedFlights.delete(index);
    } else {
      expandedFlights.add(index);
    }
    expandedFlights = expandedFlights;
  }

  function openAlarmModal() {
    if (!$isLoggedIn) {
      showLoginModal = true;
      return;
    }
    
    alarmPrice = Math.max(cheapest - 50, 10).toString();
    showAlarmModal = true;
    alarmSuccess = false;
    alarmLoading = false;
  }

  async function createAlarm() {
    try {
      alarmLoading = true;
      const alarmData = {
        userId: $user.id,
        expectedPrice: parseFloat(alarmPrice),
        availabilityRequest: searchParams
      };

      await apiService.createAlarm(alarmData);
      alarmSuccess = true;
      
      // 2 saniye sonra modalı kapat
      setTimeout(() => {
        showAlarmModal = false;
        alarmSuccess = false;
      }, 2000);
    } catch (error) {
      console.error('Alarm creation error:', error);
    } finally {
      alarmLoading = false;
    }
  }

  function handleLoginRedirect() {
    showLoginModal = false;
    navigate('login');
  }
</script>

<!-- Search Summary Header -->
<section class="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-6">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-4">
        <button 
          class="flex items-center space-x-2 text-blue-100 hover:text-white transition-colors"
          on:click={() => navigate('home')}
          type="button"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
          <span>Search</span>
        </button>
        <div class="text-white">
          <h2 class="text-xl font-semibold">
            {searchParams.depPort} → {searchParams.arrPort}
          </h2>
          <p class="text-blue-100 text-sm">
            {searchParams.departureDate} | {searchParams.quantity} Adult | One Way
          </p>
        </div>
      </div>
      <div class="text-right">
        <p class="text-blue-100 text-sm">MIN PRICE</p>
        <p class="text-2xl font-bold">${cheapest} USD</p>
      </div>
    </div>
  </div>
</section>

<!-- Flight Results -->
<section class="py-8 bg-gray-50 min-h-screen">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    {#if loading}
      <div class="flex flex-col items-center justify-center py-16">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p class="text-gray-600">Uçuşlar aranıyor...</p>
      </div>
    {:else if error}
      <div class="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        {error}
      </div>
    {:else if flights.length === 0}
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
        <p class="text-blue-700">Bu rota için uygun uçuş bulunamadı.</p>
      </div>
    {:else}
      <!-- Header -->
      <div class="flex justify-between items-center mb-6">
        <div>
          <h3 class="text-xl font-semibold text-gray-900">
            Departing Flight: {searchParams.depPort} - {searchParams.arrPort}
          </h3>
          <p class="text-gray-600">Number of flights: {flights.length}</p>
        </div>
        <div class="flex items-center space-x-4">
          <button class="btn-success text-sm" on:click={openAlarmModal}>
            🔔 Fiyat Alarmı Kur
          </button>
        </div>
      </div>

      <!-- Flight Cards -->
      <div class="space-y-4">
        {#each flights as flight, index}
          <div class="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
            <!-- Main Flight Info -->
            <div class="p-6 cursor-pointer" on:click={() => toggleFlightExpansion(index)}>
              <div class="flex items-center justify-between">
                <!-- Time and Route -->
                <div class="flex items-center space-x-8 flex-1">
                  <!-- Departure -->
                  <div class="text-center">
                    <div class="text-2xl font-bold text-gray-900">{formatTime(flight.departureTime)}</div>
                    <div class="text-sm text-gray-600">{flight.departurePort}</div>
                    <div class="text-xs text-gray-500">{flight.departureDate}</div>
                  </div>
                  
                  <!-- Flight Path -->
                  <div class="flex-1 text-center">
                    <div class="text-sm text-gray-600 mb-1">{flight.duration}</div>
                    <div class="flex items-center justify-center space-x-2">
                      <div class="w-3 h-3 rounded-full bg-orange-400"></div>
                      <div class="flex-1 h-0.5 bg-gray-300 relative">
                        <svg class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-5 h-5 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"/>
                        </svg>
                      </div>
                      <div class="w-3 h-3 rounded-full bg-orange-400"></div>
                    </div>
                    <div class="text-xs text-gray-500 mt-1">{flight.totalStop}</div>
                    <div class="text-xs font-medium text-gray-700">{flight.flightNumber}</div>
                  </div>
                  
                  <!-- Arrival -->
                  <div class="text-center">
                    <div class="text-2xl font-bold text-gray-900">{formatTime(flight.arrivalTime)}</div>
                    <div class="text-sm text-gray-600">{flight.arrivalPort}</div>
                    <div class="text-xs text-gray-500">{flight.arrivalDate}</div>
                  </div>
                </div>
                
                <!-- Price and Airline -->
                <div class="text-right ml-8">
                  {#if index === 0}
                    <span class="inline-block bg-green-500 text-white text-xs font-medium px-2 py-1 rounded mb-2">
                      BEST OFFER
                    </span>
                  {/if}
                  <div class="text-xs text-gray-500 mb-1">From</div>
                  <div class="text-2xl font-bold text-gray-900">${flight.minFarePrice}</div>
                  <div class="flex items-center justify-end mt-2 space-x-2">
                    <img 
                      src={airlineLogos[flight.provider]} 
                      alt={flight.provider} 
                      class="w-8 h-8 object-contain"
                    />
                    <div class="text-xs text-gray-600">{flight.provider}</div>
                  </div>
                  <div class="text-xs text-gray-500 mt-2">
                    {expandedFlights.has(index) ? '▲ Hide' : '▼ Flight Info'}
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Expandable Fares Section -->
            {#if expandedFlights.has(index)}
              <div class="border-t border-gray-200 bg-gray-50 p-6">
                <h4 class="font-semibold text-gray-900 mb-4">Available Fares:</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {#each flight.fares as fare}
                    <div class="bg-white rounded-lg border border-gray-200 p-4">
                      <div class="flex justify-between items-center mb-3">
                        <h5 class="font-medium text-gray-900">{fare.fareType}</h5>
                        <span class="text-xl font-bold text-blue-600">${fare.price}</span>
                      </div>
                      <ul class="space-y-1 mb-4">
                        {#each fare.details as detail}
                          <li class="text-sm text-gray-600 flex items-start">
                            <svg class="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                            </svg>
                            {detail}
                          </li>
                        {/each}
                      </ul>
    
                    </div>
                  {/each}
                </div>
              </div>
            {/if}
          </div>
        {/each}
      </div>
    {/if}
  </div>
</section>

<!-- Alarm Modal -->
{#if showAlarmModal}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-xl p-6 w-full max-w-md mx-4">
      {#if alarmSuccess}
        <!-- Success State -->
        <div class="text-center py-8">
          <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Alarm Oluşturuldu!</h3>
          <p class="text-gray-600">Fiyat alarmınız başarıyla oluşturuldu. Hedef fiyata ulaştığında size bildirim göndereceğiz.</p>
        </div>
      {:else}
        <!-- Form State -->
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold text-gray-900">Fiyat Alarmı Oluştur</h3>
          <button 
            class="text-gray-400 hover:text-gray-600"
            on:click={() => showAlarmModal = false}
            disabled={alarmLoading}
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <div class="mb-4">
          <p class="text-gray-600 mb-3">Bu rota için fiyat alarmı kurmak istediğiniz tutarı belirtin:</p>
          <div class="bg-gray-50 rounded-lg p-3 text-sm text-gray-600 mb-4">
            <p>Rota: {searchParams.depPort} → {searchParams.arrPort}</p>
            <p>Tarih: {searchParams.departureDate}</p>
            <p>Şu anki en düşük fiyat: ${getCheapestPrice()}</p>
          </div>
          
          <label class="block text-sm font-medium text-gray-700 mb-2">Hedef Fiyat ($)</label>
          <input 
            type="number" 
            class="input-field" 
            bind:value={alarmPrice} 
            min="1" 
            step="0.01" 
            placeholder="Hedef fiyat girin"
            disabled={alarmLoading}
          />
          <p class="text-xs text-gray-500 mt-1">Fiyat bu seviyeye düştüğünde size email göndereceğiz</p>
        </div>
        
        <div class="flex space-x-3">
          <button 
            class="flex-1 btn-secondary"
            on:click={() => showAlarmModal = false}
            disabled={alarmLoading}
          >
            İptal
          </button>
          <button 
            class="flex-1 btn-primary"
            on:click={createAlarm} 
            disabled={!alarmPrice || alarmLoading}
          >
            {#if alarmLoading}
              <div class="flex items-center justify-center">
                <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Oluşturuluyor...
              </div>
            {:else}
              Alarm Oluştur
            {/if}
          </button>
        </div>
      {/if}
    </div>
  </div>
{/if}

<!-- Login Required Modal -->
{#if showLoginModal}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-xl p-6 w-full max-w-md mx-4">
      <div class="text-center py-4">
        <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">Giriş Yapmanız Gerekiyor</h3>
        <p class="text-gray-600 mb-6">Fiyat alarmı oluşturmak için önce hesabınıza giriş yapmalısınız.</p>
        
        <div class="flex space-x-3">
          <button 
            class="flex-1 btn-secondary"
            on:click={() => showLoginModal = false}
          >
            İptal
          </button>
          <button 
            class="flex-1 btn-primary"
            on:click={handleLoginRedirect}
          >
            Giriş Yap
          </button>
        </div>
        
        <div class="mt-4 pt-4 border-t border-gray-200">
          <p class="text-sm text-gray-500 mb-2">Hesabınız yok mu?</p>
          <button 
            class="text-blue-600 hover:text-blue-700 font-medium text-sm"
            on:click={() => {
              showLoginModal = false;
              navigate('register');
            }}
          >
            Hemen Kayıt Olun
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}