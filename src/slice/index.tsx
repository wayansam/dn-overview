import { CharacterReducer } from "./Character.reducer";
import { UIStateReducer } from "./UIState.reducer";

const allReducers = {
  UIState: UIStateReducer,
  Character: CharacterReducer,
};

export default allReducers;
