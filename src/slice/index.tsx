import { CharacterReducer } from "./Character.reducer";
import { TaskReducer } from "./Task.reducer";
import { UIStateReducer } from "./UIState.reducer";

const allReducers = {
  UIState: UIStateReducer,
  Character: CharacterReducer,
  Task: TaskReducer,
};

export default allReducers;
