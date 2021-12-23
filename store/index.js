import { RATE_TO_LAND } from "../secret";

export const state = () => ({
    userInfo: {
        userAddress: "",
        name: "",
        email: "",
        balance: 0,
        lands: []
    }
});

export const getters = {
    getUser: state => {
        return state.userAdress;
    },
    getUserBalance: state => {
        return state.balance;
    }
};

export const mutations = {
    UPDATE_ADRESS(state, data) {
        state.userInfo.userAddress = data;
    },
    LOGIN(state, data) {
        state.userInfo.userAddress = data.userAddress;
        state.userInfo.name = data.name;
        state.userInfo.email = data.email;
        state.userInfo.balance = data.balance;
    },
    UPDATE_USERINFO(state, data) {
        state.userInfo.userAddress = data.userAddress;
        state.userInfo.balance = data.balance;
        state.userInfo.lands = data.lands;
    }
};

export const actions = {
    async nuxtServerInit({ dispatch, commit }, ctx) {}
};