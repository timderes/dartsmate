import Resizer from "react-image-file-resizer";
import { DEFAULT_AVATAR_HEIGHT, DEFAULT_AVATAR_WIDTH } from "./constants";

type AvatarOutputFormat = "JPEG" | "PNG" | "WEBP";

type ResizeImageProps = {
  file: Blob;
  height?: number;
  outputFormat?: AvatarOutputFormat;
  quality?: number;
  rotation?: number;
  width?: number;
};
/**
 * Resizes an avatar image to the specified dimensions.
 */
const resizeAvatarImage = ({
  file,
  height,
  outputFormat = "WEBP",
  quality = 70,
  rotation = 0,
  width,
}: ResizeImageProps): Promise<string> => {
  return new Promise((resolve, reject) => {
    Resizer.imageFileResizer(
      file,
      height || DEFAULT_AVATAR_HEIGHT, // New height
      width || DEFAULT_AVATAR_WIDTH, // New width
      outputFormat,
      quality,
      rotation,
      (uri) => {
        if (typeof uri === "string") {
          resolve(uri);
        } else {
          reject(new Error("Failed to resize image"));
        }
      },
      "base64",
    );
  });
};

export default resizeAvatarImage;
