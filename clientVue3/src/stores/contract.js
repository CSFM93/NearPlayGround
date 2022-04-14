import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'

export const useContractStore = defineStore({
  id: 'contract',
  state: () => ({
    contact: useStorage('contract', {})
  }),
  actions: {
    setContract(value) {
      this.contract = JSON.parse(JSON.stringify(value))
      console.log('contract set',value)
    }
  }
})