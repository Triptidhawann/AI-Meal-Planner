const authErrorMessages = {
  'auth/email-already-in-use': 'An account with this email already exists. Please log in.',
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/weak-password': 'Please choose a stronger password.',
  'auth/invalid-credential': 'Invalid email or password.',
  'auth/user-not-found': 'Invalid email or password.',
  'auth/wrong-password': 'Invalid email or password.',
  'auth/too-many-requests': 'Too many attempts. Please try again later.',
  'auth/network-request-failed': 'Unable to connect. Check your internet connection and try again.',
};

export function getAuthErrorMessage(error) {
  return authErrorMessages[error?.code] || 'Something went wrong. Please try again.';
}