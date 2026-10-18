import { useEffect } from "react";
import { useAppDispatch } from "../hooks";
import { applyWeeklyReset } from "../slice/Task.reducer";

const CHECK_EVERY_MS = 60 * 1000;

// Clears weekly tasks done before the latest reset (Saturday 09:00 server
// time), on start and then every minute so an open page resets on time.
const useWeeklyReset = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(applyWeeklyReset());
    const timer = setInterval(
      () => dispatch(applyWeeklyReset()),
      CHECK_EVERY_MS,
    );
    return () => clearInterval(timer);
  }, [dispatch]);
};

export default useWeeklyReset;
