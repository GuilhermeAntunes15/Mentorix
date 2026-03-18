export function groupBy<TItem, TKey extends string | number>(
  items: TItem[],
  getKey: (item: TItem) => TKey
) {
  return items.reduce<Record<string, TItem[]>>((accumulator, item) => {
    const key = String(getKey(item));
    accumulator[key] ??= [];
    accumulator[key].push(item);
    return accumulator;
  }, {});
}
