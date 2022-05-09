import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'
import {  LocalStorage } from 'quasar'

export const useContractStore = defineStore({
  id: 'contract',
  state: () => ({
    contract: useStorage('contract', {})
  }),
  actions: {
    setContract(value) {
      this.contract = JSON.parse(JSON.stringify(value))  
      console.log('setting contract: ',LocalStorage.getItem('contract'))
    }
  }
})