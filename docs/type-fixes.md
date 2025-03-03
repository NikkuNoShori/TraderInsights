# Type Fixes for useTrades.ts

## Current Issues

The `useTrades.ts` file has type mismatches between the `BaseTrade` interface and the actual implementation. The main issues are:

1. Missing required fields in mock trades:
   - `timestamp`
   - `entry_time`
   - `entry_timestamp`

2. Type mismatch in `RawTradeData` interface:
   - Has `direction` property which should be handled by `createTrade` helper

## Required Changes

### 1. Update Mock Trades

Mock trades need to include all required fields from `BaseTrade`:

```typescript
const MOCK_TRADES: Trade[] = [
  createTrade({
    id: "dev-trade-1",
    user_id: "dev-123",
    broker_id: "mock-broker",
    // Date fields
    date: new Date().toISOString().split("T")[0],
    time: new Date().toISOString().split("T")[1].split(".")[0],
    timestamp: new Date().toISOString(),
    // Entry fields
    entry_date: new Date().toISOString().split("T")[0],
    entry_time: new Date().toISOString().split("T")[1].split(".")[0],
    entry_timestamp: new Date().toISOString(),
    // ... other fields
  }),
  // Second mock trade follows same pattern
];
```

### 2. Update Trade Mapping

The trade mapping logic needs to ensure all required fields are present:

```typescript
return data.map((rawTrade: RawTradeData) => {
  const baseTradeData = {
    ...rawTrade,
    // Required date fields
    timestamp: rawTrade.timestamp || rawTrade.date,
    entry_time: rawTrade.entry_time || rawTrade.time,
    entry_timestamp: rawTrade.entry_timestamp || rawTrade.timestamp,
    // ... other fields
  };

  return createTrade(baseTradeData);
});
```

### 3. Type Definitions

Ensure type definitions match between interfaces:

```typescript
// In types/trade.ts
export interface BaseTrade {
  timestamp: string;
  entry_time: string;
  entry_timestamp: string;
  // ... other fields
}

// In useTrades.ts
interface RawTradeData {
  timestamp: string;
  entry_time: string;
  entry_timestamp: string;
  // ... other fields
}
```

## Implementation Steps

1. First update the `RawTradeData` interface to match `BaseTrade`
2. Then update the mock trades with all required fields
3. Finally, update the trade mapping logic

## Notes

- The `createTrade` helper handles the `direction` property automatically
- All date/time fields should be properly formatted ISO strings
- Numeric fields should be properly typed using `Number()`
- Optional fields should maintain their optional status with `?`

## Related Files

- `src/hooks/useTrades.ts`
- `src/types/trade.ts`
- Any components using the `Trade` type

## Testing

After implementing these changes:

1. Verify mock trades work in development mode
2. Test trade fetching from Supabase
3. Ensure all components using trade data still work
4. Check that trade filtering and sorting still function correctly 