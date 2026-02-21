---
component_name: {{component_name}}
status: draft|ready|deprecated
created: {{date:YYYY-MM-DD}}
updated: {{date:YYYY-MM-DD}}
location: src/components/{{component_name}}/
type: ui|api|hook|util
---

# {{component_name}}

> Status: {{status}} | Created: {{created}}
> [[01-Architecture/00-Overview|← Components]]

---

## Overview

### What does this component do?
{{brief description}}

### When to use it?
{{usage context}}

---

## Props Interface

```typescript
interface {{component_name}}Props {
  // Required
  
  // Optional
  
}
```

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| | | | | |

---

## Usage Examples

### Basic Usage
```tsx
import { {{component_name}} } from '@/components/{{component_name}}';

export default function Example() {
  return (
    <{{component_name}} 
      
    />
  );
}
```

### Advanced Usage
```tsx
// With all props
```

---

## State Management

### Internal State
```typescript
const [state, setState] = useState(initialValue);
```

### Context Used
- [[i18n]] — LanguageContext
- [[ThemeContext]] — Dark/light mode

### External State
- URL params
- localStorage
- API calls

---

## Dependencies

### Required
- 

### Optional
- 

---

## i18n Keys

| Key | Description | Status |
|-----|-------------|--------|
| | | ✅ |

---

## Testing

### Test Checklist
- [ ] Renders without errors
- [ ] Props work correctly
- [ ] i18n switches language
- [ ] Dark mode compatible
- [ ] Mobile responsive
- [ ] Accessibility (a11y)

### Manual Testing Steps
1. 
2. 
3. 

---

## Related Components
- [[ComponentName]] — similar/related
- [[ParentComponent]] — uses this

---

## Changelog

### {{date:YYYY-MM-DD}} — Created
- Initial implementation

---

*Last updated: {{date:YYYY-MM-DD HH:mm}}*
