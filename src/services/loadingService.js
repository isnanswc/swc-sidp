import { ref, computed } from 'vue';

const isLoading = ref(false);
const loadingMessage = ref('Memuat data...');
const elapsedSeconds = ref(0);
const isLongRunning = ref(false); // True if > 2 seconds without response

let timerInterval = null;
let delayTimeout = null;
let activeTasksCount = 0;

export function useGlobalLoading() {
  const startLoading = (msg = 'Memuat data...', options = { delay: 400 }) => {
    activeTasksCount++;
    loadingMessage.value = msg;

    if (activeTasksCount === 1) {
      elapsedSeconds.value = 0;
      isLongRunning.value = false;

      // Only show overlay if operation exceeds threshold (default 400ms) to prevent flicker on instant tasks
      clearTimeout(delayTimeout);
      delayTimeout = setTimeout(() => {
        if (activeTasksCount > 0) {
          isLoading.value = true;
          
          // Count elapsed seconds and trigger long-running notice at 2 seconds
          clearInterval(timerInterval);
          timerInterval = setInterval(() => {
            elapsedSeconds.value++;
            if (elapsedSeconds.value >= 2) {
              isLongRunning.value = true;
            }
          }, 1000);
        }
      }, options?.delay ?? 400);
    }
  };

  const stopLoading = () => {
    activeTasksCount = Math.max(0, activeTasksCount - 1);
    if (activeTasksCount === 0) {
      clearTimeout(delayTimeout);
      clearInterval(timerInterval);
      isLoading.value = false;
      isLongRunning.value = false;
      elapsedSeconds.value = 0;
    }
  };

  const forceResetLoading = () => {
    activeTasksCount = 0;
    clearTimeout(delayTimeout);
    clearInterval(timerInterval);
    isLoading.value = false;
    isLongRunning.value = false;
    elapsedSeconds.value = 0;
  };

  return {
    isLoading: computed(() => isLoading.value),
    loadingMessage: computed(() => loadingMessage.value),
    elapsedSeconds: computed(() => elapsedSeconds.value),
    isLongRunning: computed(() => isLongRunning.value),
    startLoading,
    stopLoading,
    forceResetLoading
  };
}
