<script>
  export let alarms;
  export let onDelete;

  function formatDate(dateStr) {
    return dateStr;
  }
</script>

<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {#each alarms as alarm}
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div class="flex justify-between items-start mb-4">
        <h4 class="font-semibold text-gray-900">
          {alarm.availabilityRequest.depPort} → {alarm.availabilityRequest.arrPort}
        </h4>
        <button 
          class="text-red-500 hover:text-red-700 transition-colors"
          on:click={() => onDelete(alarm.id)}
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
          </svg>
        </button>
      </div>
      
      <div class="text-sm text-gray-600 mb-4">
        📅 {formatDate(alarm.availabilityRequest.departureDate)}
      </div>
      
      <div class="grid grid-cols-2 gap-4 mb-4">
        <div class="text-center">
          <div class="text-xs text-gray-500 mb-1">Hedef Fiyat</div>
          <div class="text-lg font-bold text-green-600">${alarm.expectedPrice}</div>
        </div>
        <div class="text-center">
          <div class="text-xs text-gray-500 mb-1">Son Fiyat</div>
          <div class="text-lg font-bold text-gray-900">${alarm.lastPrice}</div>
        </div>
      </div>
      
      {#if alarm.expectedPrice >= alarm.lastPrice}
        <div class="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
          <p class="text-green-700 text-sm font-medium">🎉 Hedefinize ulaştı!</p>
        </div>
      {:else}
        <div>
          <div class="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div 
              class="bg-blue-600 h-2 rounded-full transition-all duration-300" 
              style="width: {(alarm.expectedPrice / alarm.lastPrice) * 100}%"
            ></div>
          </div>
          <p class="text-xs text-gray-600 text-center">
            Hedef fiyata ${(alarm.lastPrice - alarm.expectedPrice).toFixed(2)} kaldı
          </p>
        </div>
      {/if}
    </div>
  {/each}
</div>