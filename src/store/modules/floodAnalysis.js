const floodAnalysis = {
  state: {
    selectedWaterLevelList: [],
  },

  mutations: {
    selectedWaterLevelList: (state, selectedWaterLevelList) => {
      state.selectedWaterLevelList = selectedWaterLevelList;
    },
  },

  actions: {
    setSelectedWaterLevelList({ commit }, selectedWaterLevelList) {
      commit("selectedWaterLevelList", selectedWaterLevelList);
    },
  },
};

export default floodAnalysis;
