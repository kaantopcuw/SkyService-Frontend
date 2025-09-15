<script>
  import { onMount } from 'svelte';
  import { apiService } from '../services/api.js';

  export let navigate;

  let portGroups = {};
  let destinationPorts = {};
  let loading = false;
  let loadingDestinations = false;
  let hasLoadedPorts = false;
  let retryCount = 0;
  let retryInterval;

  // Form data
  let fromPort = '';
  let toPort = '';
  let departureDate = '';
  let passengerCount = 1;
  let isModalOpen = false;

  // Get tomorrow's date as default
  let tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  departureDate = tomorrow.toISOString().split('T')[0];

  // Load saved search from localStorage
  function loadSavedSearch() {
    try {
      const savedSearch = localStorage.getItem('skyservice_last_search');
      if (savedSearch) {
        const searchData = JSON.parse(savedSearch);
        fromPort = searchData.fromPort || '';
        toPort = searchData.toPort || '';
        departureDate = searchData.departureDate || departureDate;
        passengerCount = searchData.passengerCount || 1;
        
        // If fromPort is loaded, load destinations
        if (fromPort) {
          onFromPortChange();
        }
      }
    } catch (error) {
      console.error('Error loading saved search:', error);
    }
  }

  // Save search to localStorage
  function saveSearch() {
    try {
      const searchData = {
        fromPort,
        toPort,
        departureDate,
        passengerCount
      };
      localStorage.setItem('skyservice_last_search', JSON.stringify(searchData));
    } catch (error) {
      console.error('Error saving search:', error);
    }
  }

  async function loadPortGroups() {
    try {
      loading = true;
      hasLoadedPorts = false;
      portGroups = await apiService.getPortGroups();
      hasLoadedPorts = true;

      loadSavedSearch();

      if (retryInterval) {
        clearInterval(retryInterval);
        retryInterval = null;
      }
      retryCount = 0;
    } catch (error) {
      console.error('Error loading ports:', error);
      hasLoadedPorts = false;
      retryCount++;
      
      // 10 saniye sonra yeniden dene
      if (!retryInterval) {
        retryInterval = setInterval(() => {
          loadPortGroups();
        }, 10000);
      }
    } finally {
      loading = false;
    }
  }

  onMount(() => {
    loadPortGroups();
  });

  import { onDestroy } from 'svelte';
  
  onDestroy(() => {
    if (retryInterval) {
      clearInterval(retryInterval);
    }
  });

  async function onFromPortChange() {
    if (!fromPort) {
      destinationPorts = {};
      toPort = '';
      return;
    }

    try {
      loadingDestinations = true;
      destinationPorts = await apiService.getPortsByCountry(fromPort);
      
      // Don't clear toPort if we're loading from saved search
      const savedSearch = localStorage.getItem('skyservice_last_search');
      if (!savedSearch || !JSON.parse(savedSearch).toPort) {
        toPort = '';
      }
    } catch (error) {
      console.error('Error loading destinations:', error);
    } finally {
      loadingDestinations = false;
    }
  }

  function handleSearch() {
    if (!fromPort || !toPort || !departureDate) {
      isModalOpen = true;
      return;
    }

    // Save search before navigating
    saveSearch();

    const searchData = {
      tripType: "ONE_WAY",
      depPort: fromPort,
      arrPort: toPort,
      departureDate: formatDateForAPI(departureDate),
      passengerType: "ADULT",
      quantity: parseInt(passengerCount),
      currency: "USD",
      cabinClass: "ALL",
      lang: "EN"
    };

    navigate('availability', searchData);
  }

  function formatDateForAPI(dateStr) {
    const date = new Date(dateStr);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  }

  function getPortDisplayName(port) {
    return `${port.cityName} (${port.code})`;
  }
</script>

<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  <!-- From Port -->
  <div>
    <label class="block text-sm font-medium text-gray-700 mb-2">Nereden</label>
    <select 
      class="input-field" 
      bind:value={fromPort} 
      on:change={onFromPortChange} 
      disabled={!hasLoadedPorts}
    >
      <option value="">Kalkış yeri seçin</option>
      {#if hasLoadedPorts}
        {#each Object.entries(portGroups) as [country, ports]}
          <optgroup label={country}>
            {#each ports as port}
              <option value={port.code}>{getPortDisplayName(port)}</option>
            {/each}
          </optgroup>
        {/each}
      {/if}
    </select>
    {#if loading && !hasLoadedPorts && retryCount > 0}
      <div class="flex items-center mt-2">
        <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
        <p class="text-sm text-blue-600">Kalkış yerleri yükleniyor... (Deneme {retryCount})</p>
      </div>
    {:else if loading && !hasLoadedPorts}
      <div class="flex items-center mt-2">
        <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
        <p class="text-sm text-blue-600">Kalkış yerleri yükleniyor...</p>
      </div>
    {:else if hasLoadedPorts}
      <p class="text-xs text-gray-500 mt-1">Örnek: Nassau (NAS)</p>
    {:else if !loading && !hasLoadedPorts}
      <div class="flex items-center mt-2">
        <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-2"></div>
        <p class="text-sm text-red-600">Kalkış yerleri yüklenemiyor, yeniden deneniyor...</p>
      </div>
    {/if}
  </div>

  <!-- To Port -->
  <div>
    <label class="block text-sm font-medium text-gray-700 mb-2">Nereye</label>
    <select 
      class="input-field" 
      bind:value={toPort} 
      disabled={!hasLoadedPorts || !fromPort || loadingDestinations}
    >
      <option value="">Varış yeri seçin</option>
      {#if !loadingDestinations && Object.keys(destinationPorts).length > 0}
        {#each Object.entries(destinationPorts) as [country, ports]}
          <optgroup label={country}>
            {#each ports as port}
              <option value={port.code}>{getPortDisplayName(port)}</option>
            {/each}
          </optgroup>
        {/each}
      {/if}
    </select>
    {#if loadingDestinations}
      <p class="text-sm text-gray-600 mt-1">Destinasyonlar yükleniyor...</p>
    {:else}
      <p class="text-xs text-gray-500 mt-1">Örnek: Cap Haitien (CAP)</p>
    {/if}
  </div>

  <!-- Departure Date -->
  <div>
    <label class="block text-sm font-medium text-gray-700 mb-2">Tarih</label>
    <input 
      type="date" 
      class="date-input" 
      bind:value={departureDate} 
      min={new Date().toISOString().split('T')[0]} 
    />
    <p class="text-xs text-gray-500 mt-1">Örnek: 30.09.2025</p>
  </div>

  <!-- Passenger Count -->
  <div>
    <label class="block text-sm font-medium text-gray-700 mb-2">Yolcu Sayısı</label>
    <select class="input-field" bind:value={passengerCount}>
      {#each Array(9) as _, i}
        <option value={i + 1}>{i + 1} Yolcu</option>
      {/each}
    </select>
  </div>
</div>

<!-- Search Button -->
<div class="text-center mt-8">
  <button 
    class="btn-primary px-8 py-3 text-lg font-semibold"
    on:click={handleSearch}
  >
    <span class="mr-2">🔍</span>
    Uçuş Ara
  </button>
</div>

<!-- Validation Modal -->
{#if isModalOpen}
<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
  <div class="bg-white p-8 rounded-lg shadow-xl max-w-md w-full text-center">
    <h3 class="text-xl font-bold text-gray-800 mb-4">Eksik Bilgi</h3>
    <p class="text-gray-600 mb-6">Uçuş aramak için lütfen tüm zorunlu alanları (Nereden, Nereye ve Tarih) doldurduğunuzdan emin olun.</p>
    <button 
      class="btn-primary px-6 py-2"
      on:click={() => isModalOpen = false}
    >
      Anladım
    </button>
  </div>
</div>
{/if}