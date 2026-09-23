export function notFoundHandler(_request, response) {
  response.status(404).json({ success: false, error: 'Route not found.' });
}

export function errorHandler(error, _request, response, _next) {
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return response.status(400).json({ success: false, error: 'Request body must be valid JSON.' });
  }
  console.error('[API] Unexpected error:', error.message);
  return response.status(error.statusCode || 500).json({ success: false, error: 'Unable to generate meal recommendations.' });
}