import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary';

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: 'library-resources',
    allowed_formats: ['jpg', 'png', 'webp'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }],
  }),
});

const upload = multer({ storage });

export default upload;
