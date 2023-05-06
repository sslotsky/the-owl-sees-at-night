import ImageKit from "imagekit";
import type { FileObject } from "imagekit/dist/libs/interfaces";

// HACK
export const env = {
  ...import.meta.env,
  ...process.env,
};

const imageKitId = env.VITE_IMAGE_KIT_ID;
const publicKey = env.VITE_IMAGE_KIT_PUBLIC_KEY;
const privateKey = env.VITE_IMAGE_KIT_PRIVATE_KEY;

export interface MasonryPhoto extends FileObject {
  originalUrl: string;
  masonryUrl: string;
  fullSizeUrl: string;
  fullSizeBlurUrl: string;
}

function mapFile(imageKit: ImageKit) {
  return function (f: FileObject): MasonryPhoto {
    return {
      ...f,
      originalUrl: imageKit.url({
        path: f.filePath,
        signed: true,
      }),
      masonryUrl: imageKit.url({
        path: f.filePath,
        signed: true,
        transformation: [
          {
            named: "masonry",
          },
        ],
      }),
      fullSizeUrl: imageKit.url({
        path: f.filePath,
        signed: true,
        transformation: [
          {
            named: "full_size",
          },
        ],
      }),
      fullSizeBlurUrl: imageKit.url({
        path: f.filePath,
        signed: true,
        transformation: [
          {
            named: "full_size_blur",
          },
        ],
      }),
    };
  };
}

export async function getPhotos() {
  const imageKit = new ImageKit({
    publicKey,
    privateKey,
    urlEndpoint: `https://ik.imagekit.io/${imageKitId}/`,
  });

  const files = await imageKit.listFiles({
    limit: 100,
    sort: "DESC_UPDATED",
  });

  return files.map(mapFile(imageKit));
}
