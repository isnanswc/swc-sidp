import { defineStore } from 'pinia';
import { db, generateUUID, seedInitialTasksIfEmpty } from '@/db';

export const useTaskStore = defineStore('taskStore', {
  state: () => ({
    tasks: [],
    loading: false,
    filterStatus: 'ALL',
    filterPriority: 'ALL',
    searchTerm: ''
  }),

  getters: {
    totalTasks: (state) => state.tasks.length,
    pendingTasks: (state) => state.tasks.filter(t => t.status === 'Pending').length,
    inProgressTasks: (state) => state.tasks.filter(t => t.status === 'In Progress').length,
    completedTasks: (state) => state.tasks.filter(t => t.status === 'Completed').length,

    filteredTasks: (state) => {
      return state.tasks.filter(t => {
        const term = state.searchTerm.toLowerCase().trim();
        const matchesSearch = !term || 
          t.title.toLowerCase().includes(term) ||
          t.taskCode.toLowerCase().includes(term) ||
          (t.assignee && t.assignee.toLowerCase().includes(term)) ||
          (t.qrPayload && t.qrPayload.toLowerCase().includes(term));

        const matchesStatus = state.filterStatus === 'ALL' || t.status === state.filterStatus;
        const matchesPriority = state.filterPriority === 'ALL' || t.priority === state.filterPriority;

        return matchesSearch && matchesStatus && matchesPriority;
      });
    }
  },

  actions: {
    async loadTasks() {
      this.loading = true;
      try {
        this.tasks = await db.tasks.orderBy('id').reverse().toArray();
      } catch (err) {
        console.error('Failed to load tasks:', err);
      } finally {
        this.loading = false;
      }
    },

    async addTask(taskData) {
      this.loading = true;
      try {
        const newRecord = {
          ...taskData,
          uuid: generateUUID('TSK'),
          taskCode: `TSK-${1000 + this.tasks.length + 1}`,
          status: taskData.status || 'Pending',
          synced: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        const id = await db.tasks.add(newRecord);
        newRecord.id = id;
        this.tasks.unshift(newRecord);
        return newRecord;
      } catch (err) {
        console.error('Failed to add task:', err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async updateTaskStatus(id, newStatus) {
      try {
        await db.tasks.update(id, {
          status: newStatus,
          synced: 0,
          updatedAt: new Date().toISOString()
        });
        const task = this.tasks.find(t => t.id === id);
        if (task) task.status = newStatus;
      } catch (err) {
        console.error('Failed to update task status:', err);
      }
    },

    async deleteTask(id) {
      try {
        await db.tasks.delete(id);
        this.tasks = this.tasks.filter(t => t.id !== id);
      } catch (err) {
        console.error('Failed to delete task:', err);
      }
    }
  }
});
