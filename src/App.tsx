import { Provider } from "react-redux";
import MainPage from "./screen/MainPage";
import store from "./store";
import { NextUIProvider } from "@nextui-org/react";


function App() {
  return (
    // <div className="App">
    <Provider store={store}>
      <NextUIProvider>
        <MainPage />
      </NextUIProvider>
    </Provider>
    // </div>
  );
}

export default App;
