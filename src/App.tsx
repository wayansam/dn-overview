import { Provider } from "react-redux";
import "./App.css";
import MainPage from "./screen/MainPage";
import store from "./store";

function App() {
  return (
    // <div className="App">
    <Provider store={store}>
      <MainPage />
    </Provider>
    // </div>
  );
}

export default App;
