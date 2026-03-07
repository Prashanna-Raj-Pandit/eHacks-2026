const BASE_URL = import.meta.env.VITE_API_URL

export const getFileUrl = (filename: string) => `${BASE_URL}/public/uploads/${filename}`