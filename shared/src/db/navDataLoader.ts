import { getNavDb, AirportRecord, RunwayRecord, WaypointRecord } from './navDb';

interface NavDataJson {
  metadata: {
    isPopulated: boolean;
    airacCycle: string;
    version: number;
  };
  airports: AirportRecord[];
  runways: RunwayRecord[];
  waypoints: WaypointRecord[];
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
      existingMetadata.value.isPopulated &&
      existingMetadata.value.airacCycle === data.metadata.airacCycle &&
      existingMetadata.value.version === data.metadata.version
    ) {
      if (onProgress) onProgress(100);
      return;
    }

    const clearTx = db.transaction(['airports', 'runways', 'waypoints'], 'readwrite');
    await clearTx.objectStore('airports').clear();
    await clearTx.objectStore('runways').clear();
    await clearTx.objectStore('waypoints').clear();
    await clearTx.done;

    const totalItems =
      (data.airports?.length ?? 0) +
      (data.runways?.length ?? 0) +
      (data.waypoints?.length ?? 0);
      
    let processedItems = 0;

    const BATCH_SIZE = 1000;

    async function processBatch<T>(storeName: 'airports' | 'runways' | 'waypoints', items: T[]) {
      if (!items || items.length === 0) return;

      for (let i = 0; i < items.length; i += BATCH_SIZE) {
        const batch = items.slice(i, i + BATCH_SIZE);
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);

        for (const item of batch) {
          store.put(item as any);
        }
        await tx.done;

        processedItems += batch.length;
        if (onProgress && totalItems > 0) {
          onProgress(Math.round((processedItems / totalItems) * 100));
        }

        await new Promise((resolve) => setTimeout(resolve, 0));
      }
    }

    await processBatch('airports', data.airports);
    await processBatch('runways', data.runways);
    await processBatch('waypoints', data.waypoints);

    const metaTx = db.transaction('metadata', 'readwrite');
    await metaTx.objectStore('metadata').put({
      key: 'navdata_status',
      value: {
        isPopulated: true,
        airacCycle: data.metadata.airacCycle,
        version: data.metadata.version,
      },
    });
    await metaTx.done;

    if (onProgress) onProgress(100);
  } catch (error) {
    console.error('Error populating NavDB:', error);
    throw error;
  }
}
