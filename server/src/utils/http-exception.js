class HttpException extends Error {
  constructor(status, message, description = null) {
    super()
    this.message = message
    this.status = status
    this.description = description
  }
}

export default HttpException