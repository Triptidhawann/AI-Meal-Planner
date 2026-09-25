export function notFoundHandler(_request, response) {
  response.status(404).json({ success: false, error: 'Route not found.' });
}

export function errorHandler(error, _request, response, _next) {
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return response.status(400).json({ success: false, error: 'Request body must be valid JSON.' });
  }
  console.error('[API] Unexpected error:', error.message);
  const statusCode = error.statusCode || 500;
  const message = statusCode === 400 ? error.message : statusCode === 404 ? 'Resource not found.' : statusCode === 409 ? 'The request conflicts with existing data.' : 'Unable to process the request.';
  return response.status(statusCode).json({ success: false, error: message });
}