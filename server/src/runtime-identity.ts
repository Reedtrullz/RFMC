export interface RuntimeIdentity {
  version: string;
  commit: string;
  imageId: string;
  imageRef: string;
}

export function getRuntimeIdentity(): RuntimeIdentity {
  return {
    version: process.env.APP_VERSION || 'unknown',
    commit: process.env.COMMIT_SHA || 'unknown',
    imageId: process.env.IMAGE_ID || 'unknown',
    imageRef: process.env.IMAGE_REF || 'unknown',
  };
}
