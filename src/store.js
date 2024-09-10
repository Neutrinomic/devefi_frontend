import { configureStore } from '@reduxjs/toolkit';
import accountReducer from './reducers/account';
import nodesReducer from './reducers/nodes';

const preloadedState = {}; //loadState();

export const store = configureStore({
  preloadedState,
  reducer: {
    account: accountReducer,
    nodes: nodesReducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
   devTools: true
});

// setInterval(() => {
//   saveState(store.getState());
// }, 5000);
