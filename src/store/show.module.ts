import { ShowService } from "@/api/showService";
import { SearchResult, Show, ShowObject } from "@/types/show.types";
import { ActionTree, GetterTree, Module, MutationTree } from "vuex";

export enum ShowStore {
  // Mutations
  SET_LOADING = "SET_LOADING",
  SET_SHOWS = "SET_SHOWS",
  SET_SHOWS_OBJECT = "SET_SHOWS_OBJECT",
  SET_GENRES = "SET_GENRES",
  SET_SEARCH_RESULT = "SET_SEARCH_RESULT",
  SET_SHOW_DETAILS = "SET_SHOW_DETAILS",

  // Getters
  GET_GENRES = "GET_GENRES",
  GET_SHOWS = "GET_SHOWS",
  GET_SEARCH_RESULTS = "GET_SEARCH_RESULTS",
  GET_SHOW_DETAILS = "GET_SHOW_DETAILS",
  GET_LOADING = "GET_LOADING",

  //Actions
  LOAD_SHOWS = "LOAD_SHOWS",
  COMPUTE_SHOW_DATA = "COMPUTE_SHOW_DATA",
  SEARCH_SHOW = "SEARCH_SHOW",
  LOAD_SHOW_DETAILS = "LOAD_SHOW_DETAILS",
}

export interface ShowStoreModel {
  showDetail: Show | null;
  genres: string[];
  shows: Show[];
  showsObject: ShowObject;
  loading: boolean;
  searchResults: SearchResult[];
}

const initialState = {
  genres: [],
  shows: [],
  loading: false,
  showsObject: {},
  searchResults: [],
  showDetail: null,
};

export const state = { ...initialState };
export const mutations: MutationTree<ShowStoreModel> = {
  [ShowStore.SET_LOADING](state: ShowStoreModel, status: boolean) {
    state.loading = status;
  },
  [ShowStore.SET_SHOWS](state: ShowStoreModel, payload: Show[]) {
    state.shows = payload;
  },
  [ShowStore.SET_SHOWS_OBJECT](state: ShowStoreModel, payload: ShowObject) {
    state.showsObject = payload;
  },
  [ShowStore.SET_GENRES](state: ShowStoreModel, payload: string[]) {
    state.genres = payload;
  },
  [ShowStore.SET_SEARCH_RESULT](
    state: ShowStoreModel,
    payload: SearchResult[]
  ) {
    state.searchResults = payload;
  },
  [ShowStore.SET_SHOW_DETAILS](state, payload) {
    state.showDetail = payload;
  },
};
export const getters: GetterTree<ShowStoreModel, unknown> = {
  [ShowStore.GET_GENRES](state) {
    return state.genres.sort();
  },
  [ShowStore.GET_SHOWS](state) {
    return state.showsObject;
  },
  [ShowStore.GET_SEARCH_RESULTS](state) {
    return state.searchResults;
  },
  [ShowStore.GET_SHOW_DETAILS](state) {
    return state.showDetail;
  },
  [ShowStore.GET_LOADING](state) {
    return state.loading;
  },
};
export const actions: ActionTree<ShowStoreModel, unknown> = {
  async [ShowStore.LOAD_SHOWS]({ state, commit, dispatch }) {
    if (state.shows.length > 0) {
      /// I dont want to load everytime
      return;
    } else {
      commit(ShowStore.SET_LOADING, true);
      const response = await ShowService.getShows();
      if (response?.data && response.data.length > 0) {
        commit(ShowStore.SET_SHOWS, response.data);
        dispatch(ShowStore.COMPUTE_SHOW_DATA, response.data);
      }
    }
  },

  [ShowStore.COMPUTE_SHOW_DATA]({ commit }, data: Show[]) {
    const genres = new Set();
    const showsObject: ShowObject = {};
    data
      .sort((a, b) => (b.rating.average || 0) - (a.rating.average || 0))
      .forEach((show) => {
        show.genres.forEach((genre) => {
          genres.add(genre);
          if (showsObject[genre]) {
            showsObject[genre].push(show);
          } else {
            showsObject[genre] = [show];
          }
        });
      });
    commit(ShowStore.SET_SHOWS_OBJECT, showsObject);
    commit(ShowStore.SET_GENRES, [...genres]);
    commit(ShowStore.SET_LOADING, false);
  },

  async [ShowStore.SEARCH_SHOW]({ commit }, searchTerm: string) {
    if (searchTerm === "") {
      commit(ShowStore.SET_SEARCH_RESULT, []);
      return;
    }
    commit(ShowStore.SET_LOADING, true);
    const response = await ShowService.getSearchResults(searchTerm);
    if (response?.data) {
      commit(ShowStore.SET_SEARCH_RESULT, response.data);
    }
    commit(ShowStore.SET_LOADING, false);
  },

  async [ShowStore.LOAD_SHOW_DETAILS]({ commit }, id) {
    commit(ShowStore.SET_LOADING, true);
    const response = await ShowService.getShowDetail(id);
    if (response?.data) {
      commit(ShowStore.SET_SHOW_DETAILS, response.data);
    }
    commit(ShowStore.SET_LOADING, false);
  },
};

const showModule: Module<ShowStoreModel, unknown> = {
  state: state,
  getters: getters,
  actions: actions,
  mutations: mutations,
};
export default showModule;
