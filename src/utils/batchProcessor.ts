import { SupabaseClient } from "@supabase/supabase-js";

interface BatchProcessOptions<T> {
  items: T[];
  batchSize: number;
  onProgress?: (progress: number) => void;
  shouldRollback?: boolean;
}

export async function processBatchesWithRollback<T>({
  items,
  batchSize,
  onProgress,
  shouldRollback = true,
  supabase,
  tableName,
}: BatchProcessOptions<T> & {
  supabase: SupabaseClient;
  tableName: string;
}) {
  const batches = Math.ceil(items.length / batchSize);
  const processedBatches: { id: string; items: T[] }[] = [];

  try {
    for (let i = 0; i < batches; i++) {
      const batch = items.slice(i * batchSize, (i + 1) * batchSize);

      // Start transaction
      const { data: batchData, error: batchError } = await supabase.rpc(
        "start_batch",
        { batch_id: crypto.randomUUID() },
      );

      if (batchError) throw batchError;

      const { error } = await supabase.from(tableName).insert(batch);

      if (error) throw error;

      processedBatches.push({ id: batchData.batch_id, items: batch });
      onProgress?.(((i + 1) / batches) * 100);
    }

    // Commit all batches
    await supabase.rpc("commit_batches", {
      batch_ids: processedBatches.map((b) => b.id),
    });

    return { success: true };
  } catch (error) {
    if (shouldRollback) {
      // Rollback all processed batches
      await supabase.rpc("rollback_batches", {
        batch_ids: processedBatches.map((b) => b.id),
      });
    }
    throw error;
  }
}
