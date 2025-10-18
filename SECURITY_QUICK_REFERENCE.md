# Security Quick Reference Guide

## 🛡️ Common Security Tasks

### Sanitizing User Input

```typescript
import { SecurityService } from '@/lib/security'

// Always sanitize before using
const clean = SecurityService.sanitizeInput(userInput)
```

### Using Secure Input Components

```typescript
import { SecureInput } from '@/components/SecureInput'

// Email validation
<SecureInput 
  validate="email"
  onValidChange={(value, isValid) => {
    if (isValid) {
      // Use validated email
    }
  }}
/>

// Username validation
<SecureInput 
  validate="username"
  maxLength={20}
/>

// General text with XSS protection
<SecureInput validate="text" />
```

### Validating Data

```typescript
import { SecurityService } from '@/lib/security'

// Email
if (!SecurityService.validateEmail(email)) {
  toast.error('Invalid email')
  return
}

// Username
if (!SecurityService.validateUsername(username)) {
  toast.error('Invalid username (3-20 chars, alphanumeric)')
  return
}

// URL
const safeUrl = SecurityService.sanitizeURL(userProvidedUrl)
```

### Checking User Permissions

```typescript
import { useAuth } from '@/hooks/use-auth'

const { permissions, canAccessStudentData } = useAuth()

// Check role permissions
if (!permissions?.canViewOtherStudents) {
  toast.error('Access denied')
  return
}

// Check specific data access
if (!canAccessStudentData(studentId, studentClasses)) {
  toast.error('Cannot access this student data')
  return
}
```

### Rate Limiting

```typescript
import { useAuth } from '@/hooks/use-auth'

const { checkRateLimit } = useAuth()

function handleAction() {
  if (!checkRateLimit()) {
    toast.error('Too many requests. Please wait.')
    return
  }
  
  // Proceed with action
}
```

### Encrypting Sensitive Data

```typescript
import { useEncryptedKV } from '@/hooks/use-encrypted-kv'

// Instead of useKV for sensitive data
const [sensitiveData, setSensitiveData] = useEncryptedKV(
  'sensitive-key',
  defaultValue,
  userId
)
```

### Session Protection

```typescript
import { SessionGuard } from '@/components/SessionGuard'

function App() {
  return (
    <SessionGuard>
      {/* Protected app content */}
    </SessionGuard>
  )
}
```

## ❌ Common Security Mistakes

### DON'T: Use raw input without sanitization
```typescript
// ❌ BAD
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// ✅ GOOD
const clean = SecurityService.sanitizeInput(userInput)
<div>{clean}</div>
```

### DON'T: Log sensitive data
```typescript
// ❌ BAD
console.log('User data:', userData)
console.log('Session token:', token)

// ✅ GOOD
// Don't log sensitive data at all in production
```

### DON'T: Put sensitive data in URLs
```typescript
// ❌ BAD
navigate(`/profile?userId=${userId}&token=${token}`)

// ✅ GOOD
// Use session-based routing, no sensitive params
navigate('/profile')
```

### DON'T: Use localStorage for sensitive data
```typescript
// ❌ BAD
localStorage.setItem('userToken', token)

// ✅ GOOD
// Use KV store (automatically scoped to user)
const [token, setToken] = useKV('user-token', null)
```

### DON'T: Skip input validation
```typescript
// ❌ BAD
const email = userInput
sendEmail(email)

// ✅ GOOD
const email = SecurityService.sanitizeInput(userInput)
if (SecurityService.validateEmail(email)) {
  sendEmail(email)
}
```

## 🔒 Security Checklist for New Features

- [ ] All user inputs use `SecureInput` or are sanitized
- [ ] Form fields have validation
- [ ] No `console.log()` with sensitive data
- [ ] No sensitive data in URLs
- [ ] Rate limiting checked for API-like operations
- [ ] Proper error messages (no stack traces)
- [ ] Session required for protected actions
- [ ] Role permissions checked where needed
- [ ] Data access validated before display
- [ ] Encryption used for sensitive storage

## 🚨 Security Testing Commands

```bash
# Search for console.log statements
grep -r "console.log" src/

# Search for dangerous innerHTML usage
grep -r "dangerouslySetInnerHTML" src/

# Search for localStorage usage
grep -r "localStorage" src/

# Search for potential XSS vectors
grep -r "<script" src/
```

## 📋 User Roles & Permissions

| Permission | Student | Teacher | Parent |
|------------|---------|---------|--------|
| View own data | ✅ | ✅ | ✅ |
| View other students | ❌ | ✅ (class-based) | ✅ (children only) |
| Edit settings | ✅ | ✅ | ❌ |
| Manage classes | ❌ | ✅ | ❌ |
| Export data | ✅ | ✅ | ✅ |

## 🔐 Encryption Use Cases

Use `useEncryptedKV` for:
- Financial data
- Personal information
- Assessment results
- Any PII (Personally Identifiable Information)

Use regular `useKV` for:
- Game scores (non-sensitive)
- UI preferences
- Public achievements
- Non-personal settings

## 📞 Security Issue Response

If you find a security issue:

1. **Document it**: Write down exact steps to reproduce
2. **Assess impact**: What data could be exposed?
3. **Fix immediately**: Apply patch following security guidelines
4. **Test thoroughly**: Ensure fix doesn't break functionality
5. **Update docs**: Add to security changelog

## 📚 Related Documentation

- Full security documentation: `SECURITY.md`
- Button/click handling: `BUTTON_CLICK_FIXES.md`
- Privacy compliance: See `PrivacySettings` component
- Authentication: See `use-auth` hook

## 🎯 Key Security Principles

1. **Never trust user input** - Always sanitize and validate
2. **Principle of least privilege** - Users only access what they need
3. **Defense in depth** - Multiple layers of security
4. **Secure by default** - Security built-in, not bolted-on
5. **Fail securely** - Errors should not expose data
6. **Keep it simple** - Complex systems are harder to secure
