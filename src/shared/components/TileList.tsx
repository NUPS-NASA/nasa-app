interface TileListProps<T> {
  items: T[];
  gapX?: number;
  gapY?: number;
  columns?: number;
  renderItem: (item: T, index: number) => React.ReactNode;
}

export function TileList<T>({
  items,
  gapX = 10,
  gapY = 8,
  columns = 1,
  renderItem,
}: TileListProps<T>) {
  return (
    <div
      className="grid"
      style={{
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        columnGap: gapX,
        rowGap: gapY,
      }}
    >
      {items.map((item, idx) => renderItem(item, idx))}
    </div>
  );
}
