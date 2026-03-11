## Packages
framer-motion | Page transitions and advanced micro-interactions
clsx | Utility for constructing className strings conditionally
tailwind-merge | Utility to merge tailwind classes without style conflicts
date-fns | Formatting dates for needs and donations

## Notes
Authentication uses JWT. Token is stored in localStorage and MUST be passed in `Authorization: Bearer <token>` header for all requests.
Custom `fetchWithAuth` utility is implemented to handle this transparently.
The `buildUrl` helper from shared/routes is used for URL parameter substitution.
