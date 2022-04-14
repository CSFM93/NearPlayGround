import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'
import { extend, LocalStorage } from 'quasar'

export const useContractStore = defineStore({
  id: 'contract',
  state: () => ({
    contact: LocalStorage.getItem('user') || {}
  }),
  actions: {
    setContract(value) {
      LocalStorage.set('contract', value)
      this.contract = JSON.parse(JSON.stringify(value))  
    }
  }
})