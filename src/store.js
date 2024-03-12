import { configureStore } from '@reduxjs/toolkit';
import accountReducer from './reducers/account';

const preloadedState = {}; //loadState();

export const store = configureStore({
  preloadedState,
  reducer: {
    account: accountReducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
  // devTools: false
});

// setInterval(() => {
//   saveState(store.getState());
// }, 5000);
