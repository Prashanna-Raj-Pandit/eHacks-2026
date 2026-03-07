import multer from 'multer'
import { v4 } from 'uuid'
import mime from 'mime'
import path from 'path'
import { existsSync, mkdirSync } from 'fs'
import HttpException from '../utils/http-exception.js'

export const MimeTypes = {
  PNG: 'image/png',
  JPG: 'image/jpg',
  JPEG: 'image/jpeg',
}

const rootDir = process.cwd()
const uploadDir = path.join(rootDir, 'public', 'uploads')

if (!existsSync(uploadDir)) {
  mkdirSync(uploadDir, { recursive: true })
}

export const multerFileFilterer = (file, callback, fileTypes) => {
  if (fileTypes.includes(file.mimetype)) return callback(null, true)
  return callback(
    new HttpException(422, `We only support ${fileTypes.join(', ')} file types. Found ${file.mimetype}`)
  )
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads')
  },
  filename: function (req, file, cb) {
    cb(null, `${v4()}.${mime.getExtension(file.mimetype)}`)
  },
})

const fileLimit = { fileSize: 2 * 1024 * 1024 }
const fileLimitVideo = { fileSize: 20 * 1024 * 1024 }

const UploadMiddleware = (limits = fileLimit, mimeTypes = Object.values(MimeTypes)) => {
  return multer({
    storage,
    limits,
    fileFilter: (req, file, cb) => multerFileFilterer(file, cb, mimeTypes),
  })
}

export const UploadVideoMiddleware = (limits = fileLimitVideo, mimeTypes = ['video/mp4']) => {
  return multer({
    storage,
    limits,
    fileFilter: (req, file, cb) => multerFileFilterer(file, cb, mimeTypes),
  })
}

export default UploadMiddleware