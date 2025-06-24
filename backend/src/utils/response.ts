export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
  timestamp: string
}

export const createResponse = <T = any>(
  success: boolean,
  message: string,
  data?: T
): ApiResponse<T> => {
  return {
    success,
    message,
    data,
    timestamp: new Date().toISOString()
  }
}
