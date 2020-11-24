import { createSlice } from '@reduxjs/toolkit';
import { WebMercatorViewport } from '@deck.gl/core';
import { debounce } from '../utils';

/**
  *
  * A function that accepts an initialState, setup the state and creates 
  * the CARTO reducers that support CARTO for React achitecture.
  * 
  *  export const initialState = {
  *    viewState: {
  *      latitude: 31.802892,
  *      longitude: -103.007813,
  *      zoom: 2,
  *      pitch: 0,
  *      bearing: 0,
  *      dragRotate: false,
  *    },
  *    basemap: POSITRON,
  *    credentials: {
  *      username: 'public',
  *      apiKey: 'default_public',
  *      serverUrlTemplate: 'https://{user}.carto.com',
  *    },
  *    googleApiKey: '', // only required when using a Google Basemap
  *  }
  * @param  {object} initialState - the initial state of the state
  */
export const createCartoSlice = (initialState) => {
  const slice = createSlice({
    name: 'carto',
    initialState: {
      viewState: {
        ...initialState.viewState,
        latitude: 0,
        longitude: 0,
        zoom: 0,
      },
      viewport: undefined,
      geocoderResult: null,
      error: null,
      baseMap: 'positron',
      layers: {
        // Auto import layers
      },
      dataSources: {
        // Auto import dataSources
      },
      ...initialState,
    },
    reducers: {
      addSource: (state, action) => {
        state.dataSources[action.payload.id] = {
          credentials: state.credentials,
          ...action.payload,
        };
      },
      removeSource: (state, action) => {
        delete state.dataSources[action.payload];
      },
      addLayer: (state, action) => {
        state.layers[action.payload.id] = action.payload;
      },
      removeLayer: (state, action) => {
        delete state.layers[action.payload];
      },
      setBaseMap: (state, action) => {
        state.baseMap = action.payload;
      },
      setViewState: (state, action) => {
        const viewState = action.payload;
        state.viewState = { ...state.viewState, ...viewState };
      },
      setViewPort: (state) => {
        state.viewport = new WebMercatorViewport(state.viewState).getBounds();
      },
      addFilter: (state, action) => {
        const { id, column, type, values, owner } = action.payload;
        const source = state.dataSources[id];

        if (source) {
          if (!source.filters) {
            source.filters = {};
          }

          if (!source.filters[column]) {
            source.filters[column] = {};
          }

          source.filters[column][type] = { values, owner };
        }
      },
      removeFilter: (state, action) => {
        const { id, column } = action.payload;
        const source = state.dataSources[id];

        if (source && source.filters && source.filters[column]) {
          delete source.filters[column];
        }
      },
      setGeocoderResult: (state, action) => {
        state.geocoderResult = action.payload;
      },
    },
  });

  return slice.reducer;
};
/**
 * Action to add a source to the store  
 * 
 * @param {string} id - unique id for the source
 * @param {string} data - data definition for the source. Query for SQL dataset or the name of the tileset for BigQuery Tileset
 * @param {string} type - type of source. Posible values are sql or bq
 * @param {Object} credentials - (optional) Custom credentials to be used in the source
 */
export const addSource = ({id, data, type, credentials}) => ({ type: 'carto/addSource', payload: {id, data, type, credentials}});

/**
 * Action to remove a source from the store
 * @param {string} sourceId - id of the source to remove 
 */
export const removeSource = (sourceId) => ({ type: 'carto/removeSource', payload: sourceId});

/**
 * Action to add a Layer to the store
 * @param {string} id - unique id for the layer
 * @param {string} source - id of the source of the layer
 */
export const addLayer = ({id, source}) => ({ type: 'carto/addLayer', payload: {id, source} });

/**
 * Action to remove a layer from the store
 * @param {string} layerId - id of the layer to remove 
 */
export const removeLayer = (layerId) => ({ type: 'carto/removeLayer', payload: layerId});

/**
 * Action to set a basemap
 * @param {String} basemap - the new basemap to add 
 */
export const setBaseMap = (basemap) => ({ type: 'carto/setBaseMap', payload: basemap });

/**
 * Action to add a filter on a given source and column
 * @param {string} id - sourceId of the source to apply the filter
 * @param {string} column - column to filter at the source
 * @param {FilterType} type - FilterTypes.IN and FilterTypes.BETWEEN
 */
export const addFilter = ({id, column, type, values, owner}) => ({ type: 'carto/addFilter', payload: {id, column, type, values, owner} });

/**
 * Action to remove a filter from the store
 * @param {id} - sourceId of the filter to remove
 * @param {column} - column of the filter to remove
 */
export const removeFilter = ({id, column}) => ({ type: 'carto/removeFilter', payload: {id, column}});

const _setViewState = (payload) => ({ type: 'carto/setViewState', payload });
const _setViewPort = (payload) => ({ type: 'carto/setViewPort', payload });
/**
 * Redux selector to get a source by ID
 */
export const selectSourceById = (state, id) => state.carto.dataSources[id];

const debouncedSetViewPort = debounce((dispatch, setViewPort) => {
  dispatch(setViewPort());
}, 200);

/**
 * Action to set the current ViewState
 * @param {Object} viewState 
 */
export const setViewState = (viewState) => {
  return (dispatch) => {
    dispatch(_setViewState(viewState));
    debouncedSetViewPort(dispatch, _setViewPort);
  };
};
