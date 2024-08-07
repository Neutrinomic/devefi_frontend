import { ColorModeScript, ChakraBaseProvider } from '@chakra-ui/react';
import React, { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';
import * as serviceWorker from './serviceWorker';
import { HashRouter } from 'react-router-dom';
import { store } from './store';
import { Provider } from 'react-redux';
import theme from "./theme";
import "./reducers/timers";

const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);

window.localStorage.setItem("chakra-ui-color-mode", "dark");
root.render(
  <StrictMode>
    <ChakraBaseProvider theme={theme}>
    <Provider store={store}>
    <HashRouter>
    <ColorModeScript initialColorMode={theme.config.initialColorMode} />
    <App />
    </HashRouter>
    </Provider>
    </ChakraBaseProvider>
  </StrictMode>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorker.unregister();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
