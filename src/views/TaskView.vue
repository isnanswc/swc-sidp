<template>
  <div class="space-y-6">
    <!-- Header & Action bar -->
    <div class="bg-white p-4 rounded-2xl border border-zinc-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
      <div>
        <h2 class="text-base font-black text-zinc-900">Manajemen Tugas & Verifikasi QR</h2>
        <p class="text-xs text-zinc-500 font-medium">Kelola penugasan operator, inspeksi QC rotogravure, dan validasi QR di lantai produksi</p>
      </div>

      <button
        @click="openAddTaskModal"
        class="px-4 py-2 rounded-xl text-sm font-bold bg-red-600 hover:bg-red-500 text-white shadow-md shadow-red-600/25 transition-all flex items-center gap-2"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        + Buat Tugas Baru
      </button>
    </div>

    <!-- Filters & Stats Bar -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <!-- Search & Filters -->
      <div class="md:col-span-3 bg-white p-4 rounded-2xl border border-zinc-200 shadow-xs flex flex-wrap items-center gap-3">
        <div class="flex-1 min-w-[200px]">
          <input
            v-model="taskStore.searchTerm"
            type="text"
            placeholder="Cari tugas, kode, assignee, atau QR..."
            class="w-full px-3 py-2 text-xs border border-zinc-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
          />
        </div>

        <select
          v-model="taskStore.filterStatus"
          class="px-3 py-2 text-xs border border-zinc-300 rounded-xl outline-none bg-white font-semibold"
        >
          <option value="ALL">Semua Status</option>
          <option value="In Progress">In Progress</option>
          <option value="Pending">Pending</option>
          <option value="Completed">Completed</option>
        </select>

        <select
          v-model="taskStore.filterPriority"
          class="px-3 py-2 text-xs border border-zinc-300 rounded-xl outline-none bg-white font-semibold"
        >
          <option value="ALL">Semua Prioritas</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
      </div>

      <!-- Quick Summary Stats -->
      <div class="bg-white p-4 rounded-2xl border border-zinc-200 shadow-xs flex items-center justify-around text-center">
        <div>
          <p class="text-[10px] uppercase font-bold text-zinc-400">Total</p>
          <p class="text-xl font-black text-zinc-900">{{ taskStore.totalTasks }}</p>
        </div>
        <div class="h-8 w-px bg-zinc-200"></div>
        <div>
          <p class="text-[10px] uppercase font-bold text-red-500">Aktif</p>
          <p class="text-xl font-black text-red-600">{{ taskStore.inProgressTasks }}</p>
        </div>
        <div class="h-8 w-px bg-zinc-200"></div>
        <div>
          <p class="text-[10px] uppercase font-bold text-emerald-600">Selesai</p>
          <p class="text-xl font-black text-emerald-600">{{ taskStore.completedTasks }}</p>
        </div>
      </div>
    </div>

    <!-- Task Cards Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="task in taskStore.filteredTasks"
        :key="task.id"
        class="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs hover:shadow-md hover:border-red-200 transition-all flex flex-col justify-between"
      >
        <div>
          <!-- Header Card -->
          <div class="flex items-center justify-between gap-2 mb-3">
            <span class="text-xs font-mono font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-lg border border-red-100">
              {{ task.taskCode }}
            </span>
            <div class="flex items-center gap-1.5">
              <span :class="[
                'text-[10px] font-bold px-2 py-0.5 rounded-full border',
                task.priority === 'High' ? 'bg-red-100 text-red-800 border-red-200' :
                task.priority === 'Medium' ? 'bg-amber-100 text-amber-800 border-amber-200' : 'bg-zinc-100 text-zinc-700 border-zinc-200'
              ]">
                {{ task.priority }}
              </span>
              <span :class="[
                'text-[10px] font-bold px-2 py-0.5 rounded-full border',
                task.status === 'Completed' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                task.status === 'In Progress' ? 'bg-red-100 text-red-800 border-red-300' : 'bg-zinc-100 text-zinc-700 border-zinc-300'
              ]">
                {{ task.status }}
              </span>
            </div>
          </div>

          <!-- Title & Description -->
          <h3 class="text-sm font-black text-zinc-900 leading-snug">{{ task.title }}</h3>
          <p class="text-xs text-red-600 font-bold mt-0.5">{{ task.category }}</p>
          <p class="text-xs text-zinc-500 mt-2 line-clamp-2">{{ task.description || 'Tidak ada deskripsi tambahan.' }}</p>
        </div>

        <!-- QR Payload & Footer -->
        <div class="mt-4 pt-3 border-t border-zinc-100 space-y-2.5">
          <div class="flex items-center justify-between text-xs text-zinc-500 font-medium">
            <span>PIC: <strong class="text-zinc-800">{{ task.assignee }}</strong></span>
            <span>Due: <strong class="text-zinc-800">{{ task.dueDate }}</strong></span>
          </div>

          <div class="p-2 bg-zinc-50 rounded-xl border border-zinc-200 flex items-center justify-between gap-2">
            <div class="overflow-hidden">
              <p class="text-[10px] font-bold text-zinc-400 uppercase">QR Verification</p>
              <p class="text-xs font-mono font-bold text-zinc-700 truncate">{{ task.qrPayload }}</p>
            </div>
            <button
              @click="openQRModal(task)"
              class="px-2.5 py-1 rounded-lg text-xs font-bold bg-zinc-900 text-white hover:bg-black transition-colors shrink-0"
              title="Lihat QR Code"
            >
              QR Code
            </button>
          </div>

          <div class="flex items-center justify-end gap-1.5 pt-1">
            <button
              v-if="task.status !== 'Completed'"
              @click="markCompleted(task.id)"
              class="px-3 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-600 hover:text-white transition-colors"
            >
              ✓ Selesai
            </button>
            <button
              @click="deleteTask(task.id)"
              class="p-1 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              title="Hapus Tugas"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div v-if="taskStore.filteredTasks.length === 0" class="col-span-full py-12 text-center text-zinc-400">
        <div class="text-3xl mb-2">📋</div>
        <p class="font-bold text-sm">Tidak ada data tugas ditemukan.</p>
      </div>
    </div>

    <!-- Modal Form Tambah Tugas -->
    <div v-if="showAddModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs">
      <div class="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6">
        <div class="flex items-center justify-between pb-3 border-b border-zinc-100">
          <h3 class="text-base font-black text-zinc-900">Buat Tugas Produksi & QC Baru</h3>
          <button @click="showAddModal = false" class="text-zinc-400 hover:text-zinc-600 font-bold text-xl">✕</button>
        </div>

        <form @submit.prevent="handleAddTask" class="mt-4 space-y-3.5 text-xs">
          <div>
            <label class="block font-bold text-zinc-700 mb-1">Judul Tugas</label>
            <input v-model="newTask.title" type="text" required placeholder="Contoh: Kalibrasi Roll Rewind #02" class="w-full px-3 py-2 border border-zinc-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-red-500" />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-zinc-700 mb-1">Kategori</label>
              <select v-model="newTask.category" class="w-full px-3 py-2 border border-zinc-300 rounded-xl text-xs outline-none bg-white font-medium">
                <option value="Maintenance">Maintenance</option>
                <option value="QC Inspection">QC Inspection</option>
                <option value="Setup Mesin">Setup Mesin</option>
                <option value="Slitting Prep">Slitting Prep</option>
              </select>
            </div>
            <div>
              <label class="block font-bold text-zinc-700 mb-1">Prioritas</label>
              <select v-model="newTask.priority" class="w-full px-3 py-2 border border-zinc-300 rounded-xl text-xs outline-none bg-white font-medium">
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-zinc-700 mb-1">Petugas (Assignee)</label>
              <input v-model="newTask.assignee" type="text" required placeholder="Nama Operator/QC" class="w-full px-3 py-2 border border-zinc-300 rounded-xl text-xs outline-none" />
            </div>
            <div>
              <label class="block font-bold text-zinc-700 mb-1">Tenggat Waktu (Due)</label>
              <input v-model="newTask.dueDate" type="date" required class="w-full px-3 py-2 border border-zinc-300 rounded-xl text-xs outline-none bg-white" />
            </div>
          </div>

          <div>
            <label class="block font-bold text-zinc-700 mb-1">QR Code Data String</label>
            <input v-model="newTask.qrPayload" type="text" required placeholder="Contoh: QR-MAINT-SLIT-01" class="w-full px-3 py-2 border border-zinc-300 rounded-xl text-xs outline-none font-mono" />
          </div>

          <div>
            <label class="block font-bold text-zinc-700 mb-1">Deskripsi Tambahan</label>
            <textarea v-model="newTask.description" rows="2" placeholder="Detail instruksi kerja..." class="w-full px-3 py-2 border border-zinc-300 rounded-xl text-xs outline-none"></textarea>
          </div>

          <div class="flex items-center justify-end gap-3 pt-3 border-t border-zinc-100">
            <button type="button" @click="showAddModal = false" class="px-4 py-2 rounded-xl text-xs font-bold bg-zinc-100 hover:bg-zinc-200 text-zinc-700">
              Batal
            </button>
            <button type="submit" class="px-5 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/25">
              Simpan Tugas
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Pratinjau QR Code -->
    <div v-if="showQRModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs">
      <div class="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center">
        <h3 class="text-base font-black text-zinc-900">{{ activeQRTask.title }}</h3>
        <p class="text-xs text-red-600 font-bold mb-4">{{ activeQRTask.taskCode }}</p>

        <div class="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl inline-block shadow-inner">
          <img
            :src="`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(activeQRTask.qrPayload)}`"
            alt="QR Code"
            class="w-44 h-44 mx-auto"
          />
        </div>

        <p class="font-mono text-xs text-zinc-600 font-bold mt-3 break-all bg-zinc-100 p-2 rounded-lg">
          {{ activeQRTask.qrPayload }}
        </p>

        <div class="mt-5">
          <button @click="showQRModal = false" class="w-full py-2 rounded-xl text-xs font-bold bg-zinc-900 hover:bg-black text-white">
            Tutup
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useTaskStore } from '@/stores/taskStore';

const taskStore = useTaskStore();

const showAddModal = ref(false);
const showQRModal = ref(false);
const activeQRTask = ref({});

const newTask = reactive({
  title: '',
  category: 'Maintenance',
  priority: 'Medium',
  assignee: '',
  dueDate: new Date().toISOString().slice(0, 10),
  qrPayload: '',
  description: ''
});

const openAddTaskModal = () => {
  newTask.title = '';
  newTask.category = 'Maintenance';
  newTask.priority = 'Medium';
  newTask.assignee = '';
  newTask.dueDate = new Date().toISOString().slice(0, 10);
  newTask.qrPayload = `QR-${Date.now().toString(36).toUpperCase()}`;
  newTask.description = '';
  showAddModal.value = true;
};

const handleAddTask = async () => {
  await taskStore.addTask({ ...newTask });
  showAddModal.value = false;
};

const markCompleted = async (id) => {
  await taskStore.updateTask(id, { status: 'Completed' });
};

const deleteTask = async (id) => {
  if (confirm('Hapus tugas ini?')) {
    await taskStore.deleteTask(id);
  }
};

const openQRModal = (task) => {
  activeQRTask.value = task;
  showQRModal.value = true;
};

onMounted(async () => {
  await taskStore.loadTasks();
});
</script>
