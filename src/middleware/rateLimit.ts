import rateLimit from 'express-rate-limit';

export const importRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 imports per windowMs
  message: 'Too many imports from this IP, please try again after 15 minutes'
}); 