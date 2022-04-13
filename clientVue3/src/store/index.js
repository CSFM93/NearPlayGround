
import Vuex from 'vuex'
import Vue from 'vue'
import createPersistedState from "vuex-persistedstate";


Vue.use(Vuex)


export const store = new Vuex.Store({
    state: {
        isAuth: true,
        account: {},
        contract: {},
        contracts: []
    },
    mutations: {
        setAuthenticated(state, value) {
            state.isAuth = value
        },
        setMainScript(state, value) {
            console.log('mutating text: ',value)
            state.mainScript = value
        },
        setContract(state, value) {
            //   console.log('triggered')
            state.contract = JSON.parse(JSON.stringify(value))
        },
        setContracts(state, value) {
            state.contracts = JSON.parse(JSON.stringify(value))
        },
        setAccount(state, value) {
            if (value === {}) {
                state.account = JSON.parse(JSON.stringify({}))
            } else {
                var seen = [];
                state.account = JSON.parse(JSON.stringify(value, function (key, val) {
                    if (val != null && typeof val == "object") {
                        if (seen.indexOf(val) >= 0) {
                            return;
                        }
                        seen.push(val);
                    }
                    return val;
                }))
            }
        },
    },
    plugins: [createPersistedState({
        storage: window.sessionStorage,
    },
    )],
})
