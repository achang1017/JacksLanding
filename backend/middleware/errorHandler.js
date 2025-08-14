// backend/middleware/errorHandler.js
export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Default error
  let status = err.status || 500;
  let message = err.message || 'Internal Server Error';
  let error = err.error || 'Server Error';

  // Supabase errors
  if (err.code === 'PGRST301') {
    status = 401;
    message = 'Authentication required';
    error = 'Unauthorized';
  } else if (err.code === '23505') {
    status = 409;
    message = 'This record already exists';
    error = 'Conflict';
  } else if (err.code === '23503') {
    status = 400;
    message = 'Invalid reference to related record';
    error = 'Bad Request';
  } else if (err.code === '22P02') {
    status = 400;
    message = 'Invalid input format';
    error = 'Bad Request';
  }

  // Stripe errors
  if (err.type === 'StripeCardError') {
    status = 400;
    message = err.message;
    error = 'Payment Error';
  } else if (err.type === 'StripeInvalidRequestError') {
    status = 400;
    message = 'Invalid payment request';
    error = 'Bad Request';
  } else if (err.type === 'StripeAPIError') {
    status = 500;
    message = 'Payment service error';
    error = 'Service Error';
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    status = 400;
    message = err.message;
    error = 'Validation Error';
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    status = 401;
    message = 'Invalid token';
    error = 'Unauthorized';
  } else if (err.name === 'TokenExpiredError') {
    status = 401;
    message = 'Token expired';
    error = 'Unauthorized';
  }

  res.status(status).json({
    error,
    message,
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      details: err 
    })
  });
};

// Async error wrapper
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};