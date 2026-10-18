// Order and visibility of a fixed set of items (table columns, widgets),
// saved in localStorage.
export interface OrderSetting {
  order: string[];
  visible: string[];
}

const toKnownKeys = (value: unknown, keys: string[]) =>
  Array.isArray(value) ? keys.filter((key) => value.includes(key)) : keys;

// Never throws: unknown keys from old / hand-edited storage are dropped and
// keys missing from the saved order are appended at the end. A plain array
// is the older format that only stored the visible keys.
export const loadOrderSetting = (
  storageKey: string,
  keys: string[],
): OrderSetting => {
  const fallback = { order: keys, visible: keys };
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return fallback;
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return { order: keys, visible: toKnownKeys(parsed, keys) };
    }
    if (typeof parsed !== "object" || parsed === null) return fallback;
    const { order, visible } = parsed as Record<string, unknown>;
    const savedOrder = Array.isArray(order)
      ? order.filter(
          (key, index): key is string =>
            keys.includes(key) && order.indexOf(key) === index,
        )
      : [];
    return {
      order: [...savedOrder, ...keys.filter((key) => !savedOrder.includes(key))],
      visible: toKnownKeys(visible, keys),
    };
  } catch {
    return fallback;
  }
};

export const saveOrderSetting = (storageKey: string, setting: OrderSetting) =>
  localStorage.setItem(storageKey, JSON.stringify(setting));
