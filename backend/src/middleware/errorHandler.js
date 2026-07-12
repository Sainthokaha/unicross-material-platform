const errorHandler = (err, req, res, next) => {
  console.error('Error:', err)
  
  // Multer file size error
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: 'File size too large. Maximum size is 50MB.' })
  }
  
  // Multer file type error
  if (err.message && err.message.includes('Invalid file type')) {
    return res.status(400).json({ message: err.message })
  }
  
  // Default error
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  })
}

module.exports = errorHandler