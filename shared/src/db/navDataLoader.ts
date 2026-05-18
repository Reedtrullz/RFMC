import { getNavDb, AirportRecord, RunwayRecord, WaypointRecord, ProcedureRecord, NavDBSchema } from './navDb';

interface NavDataJson {
  metadata: {
    isPopulated: boolean;
    airacCycle: string;
    version: number;
  };
  airports: AirportRecord[];
  runways: RunwayRecord[];
  waypoints: WaypointRecord[];
  procedures?: ProcedureRecord[];
}

export async function populateNavDb(
  jsonUrl: string,
  onProgress?: (progress: number) => void
): Promise<void> {
  try {
    const response = await fetch(jsonUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch navdata from ${jsonUrl}: ${response.statusText}`);
    }

    const data = (await response.json()) as NavDataJson;
    const db = await getNavDb();

    const existingMetadata = await db.get('metadata', 'navdata_status');
    if (
      existingMetadata &&
      'isPopulated' in existingMetadata.value &&
      existingMetadata.value.isPopulated &&
      existingMetadata.value.airacCycle === data.metadata.airacCycle &&
      existingMetadata.value.version === data.metadata.version
    ) {
      if (onProgress) onProgress(100);
      return;
    }

    const totalItems =
      (data.airports?.length ?? 0) +
      (data.runways?.length ?? 0) +
      (data.waypoints?.length ?? 0) +
      (data.procedures?.length ?? 0);
      
    let processedItems = 0;

    const checkpointKey = 'navdata_load_checkpoint';
    const checkpoint = await db.get('metadata', checkpointKey);
    
    type NavStoreName = 'airports' | 'runways' | 'waypoints' | 'procedures';
    let resumeStoreName: NavStoreName = 'airports';
    let resumeIndex = 0;
    let resumeProcessedItems = 0;
    
    const isResumeValid = checkpoint && 
      checkpoint.value &&
      'storeName' in checkpoint.value &&
      checkpoint.value.airacCycle === data.metadata.airacCycle &&
      checkpoint.value.version === data.metadata.version;
      
    if (isResumeValid && checkpoint && 'storeName' in checkpoint.value) {
      resumeStoreName = checkpoint.value.storeName as NavStoreName;
      resumeIndex = checkpoint.value.batchIndex;
      resumeProcessedItems = checkpoint.value.processedItems;
      processedItems = resumeProcessedItems;
    } else {
      await db.delete('metadata', checkpointKey);
      const clearTx = db.transaction(['airports', 'runways', 'waypoints', 'procedures'], 'readwrite');
      await clearTx.objectStore('airports').clear();
      await clearTx.objectStore('runways').clear();
      await clearTx.objectStore('waypoints').clear();
      await clearTx.objectStore('procedures').clear();
      await clearTx.done;
    }

    const BATCH_SIZE = 1000;

    async function processBatch<K extends NavStoreName>(
      storeName: K, 
      items: NavDBSchema[K]['value'][]
    ) {
      if (!items || items.length === 0) return;

      const storeOrder: NavStoreName[] = ['airports', 'runways', 'waypoints', 'procedures'];
      const targetOrderIndex = storeOrder.indexOf(storeName);
      const resumeOrderIndex = storeOrder.indexOf(resumeStoreName);

      if (targetOrderIndex < resumeOrderIndex) {
        processedItems += items.length;
        return;
      }

      const startIndex = targetOrderIndex === resumeOrderIndex ? resumeIndex : 0;

      for (let i = startIndex; i < items.length; i += BATCH_SIZE) {
        const batch = items.slice(i, i + BATCH_SIZE);
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);

        for (const item of batch) {
          store.put(item as NavDBSchema[K]['value']);
        }
        await tx.done;

        processedItems += batch.length;
        if (onProgress && totalItems > 0) {
          onProgress(Math.round((processedItems / totalItems) * 100));
        }

        const nextBatchIndex = i + BATCH_SIZE;
        let nextStoreName: NavStoreName = storeName;
        let finalBatchIndex = nextBatchIndex;
        if (nextBatchIndex >= items.length) {
          const nextIndex = targetOrderIndex + 1;
          if (nextIndex < storeOrder.length) {
            nextStoreName = storeOrder[nextIndex] as NavStoreName;
            finalBatchIndex = 0;
          }
        }
        
        const currentProcessed = processedItems;

        setTimeout(() => {
          getNavDb().then(async (database) => {
            try {
              const metaTx = database.transaction('metadata', 'readwrite');
              await metaTx.objectStore('metadata').put({
                key: checkpointKey,
                value: {
                  airacCycle: data.metadata.airacCycle,
                  version: data.metadata.version,
                  storeName: nextStoreName,
                  batchIndex: finalBatchIndex,
                  processedItems: currentProcessed
                }
              });
              await metaTx.done;
            } catch (e) {
              console.error('Error writing checkpoint', e);
            }
          });
        }, 0);

        await new Promise((resolve) => setTimeout(resolve, 0));
      }
    }

    await processBatch('airports', data.airports);
    await processBatch('runways', data.runways);
    await processBatch('waypoints', data.waypoints);
    if (data.procedures) {
      await processBatch('procedures', data.procedures);
    }

    const metaTx = db.transaction('metadata', 'readwrite');
    await metaTx.objectStore('metadata').put({
      key: 'navdata_status',
      value: {
        isPopulated: true,
        airacCycle: data.metadata.airacCycle,
        version: data.metadata.version,
      },
    });
    await metaTx.objectStore('metadata').delete(checkpointKey);
    await metaTx.done;

    if (onProgress) onProgress(100);
  } catch (error) {
    console.error('Error populating NavDB:', error);
    throw error;
  }
}
