---
name: shadcn-nextjs-setup
description: Reference on properly scaffolding the specific UI/UX constraints on a Next.js Shadcn layout.
---

# Component Instantiation via Shadcn

When adding complex interface elements (like specialized buttons, scroll areas for history, or dialogs for equation management), leverage the existing `shadcn/ui` framework directly rather than rolling raw CSS-only components.

## Command Reference
Always execute the `npx` configuration inside the project root (`./`) if adding components over bash:
```bash
npx shadcn@latest add [component-name]
```

## Recommended Components for Calculator App
*   **Button**: For the large matrix of the virtual keypad.
*   **ScrollArea**: To contain the potentially infinite history stack entries and standard output logging.
*   **Tabs**: To allow the user to easily switch between "Algebraic Mode", "RPN Virtual Keypad", and "Notebook Context" screens.
*   **Card**: For elevating equation solver bounds and statistical plotting results off the page.

If integrating these features, ensure your Tailwind configuration is properly synced with Next.js App Router rules.
