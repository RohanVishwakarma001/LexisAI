import { v2 as cloudinary } from 'cloudinary';
import { env } from '../config/env';
import fs from 'fs';

// Verify configurations
const isConfigured = !!(
  env.CLOUDINARY_CLOUD_NAME &&
  env.CLOUDINARY_API_KEY &&
  env.CLOUDINARY_API_SECRET
);

if (isConfigured) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
  });
  console.log('☁️ Cloudinary cloud storage driver initialized successfully.');
} else {
  console.warn(
    '⚠️ Cloudinary environment credentials missing or incomplete. Sandbox falling back to local uploads folder.'
  );
}

/**
 * Uploads a local file to Cloudinary cloud storage
 * @param filePath Local system file path
 * @param folder Cloudinary media folder namespace
 */
export const uploadToCloudinary = async (
  filePath: string,
  folder = 'lexisai'
): Promise<{ secure_url: string; public_id: string } | null> => {
  if (!isConfigured) {
    return null;
  }

  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      filePath,
      {
        folder,
        resource_type: 'auto',
      },
      (error, result) => {
        // ALWAYS unlink local file post-upload to avoid filling server storage space
        try {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        } catch (unlinkError) {
          console.error('Failed to unlink local temporary multer file:', unlinkError);
        }

        if (error) {
          return reject(error);
        }
        if (!result) {
          return reject(new Error('Cloudinary upload responded with empty data payload'));
        }

        resolve({
          secure_url: result.secure_url,
          public_id: result.public_id,
        });
      }
    );
  });
};

/**
 * Deletes an asset from Cloudinary by its public ID
 * @param publicId Cloudinary public asset ID
 */
export const deleteFromCloudinary = async (publicId: string): Promise<boolean> => {
  if (!isConfigured || !publicId) {
    return false;
  }

  return new Promise((resolve) => {
    cloudinary.uploader.destroy(publicId, (error, result) => {
      if (error) {
        console.error('❌ Failed to delete asset from Cloudinary:', error);
        return resolve(false);
      }
      resolve(result?.result === 'ok');
    });
  });
};

/**
 * Universal file purger that detects the file storage medium
 * (Cloudinary or local disk) and purges the asset permanently.
 * @param fileUrl The URL of the stored file
 * @param metadata The JSON metadata associated with the document
 */
export const purgeFile = async (fileUrl: string, metadata: any): Promise<void> => {
  // 1. Purge from Cloudinary if publicId exists in metadata
  if (metadata && typeof metadata === 'object' && metadata.publicId) {
    console.log(`🗑️ Initiating Cloudinary asset purge for Public ID: ${metadata.publicId}`);
    await deleteFromCloudinary(metadata.publicId);
  }

  // 2. Purge from local disk if it's stored in the local sandbox '/uploads/' directory
  if (fileUrl && fileUrl.startsWith('/uploads/')) {
    const fileName = fileUrl.replace('/uploads/', '');
    const path = require('path');
    const localPath = path.join(process.cwd(), 'uploads', fileName);
    try {
      if (fs.existsSync(localPath)) {
        fs.unlinkSync(localPath);
        console.log(`🗑️ Local file purged successfully from sandbox disk: ${localPath}`);
      }
    } catch (unlinkError) {
      console.error(`❌ Failed to delete local sandbox file: ${localPath}`, unlinkError);
    }
  }
};
