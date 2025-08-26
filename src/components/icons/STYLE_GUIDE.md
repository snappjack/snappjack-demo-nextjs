# Icon Generation Style Guide

This style guide defines the requirements for creating consistent, high-quality SVG icons for the Snappjack Demo project.

## **Icon Generation Requirements**

**Objective:** Generate a React/TSX component for an SVG icon based on a user's prompt.

## **1. Style & Vector Specifications**

The generated SVG path data must conform to these rules:

### **Canvas & Resolution**
* **Canvas:** High-resolution `96x96` viewBox for crisp rendering at all sizes
* **Stroke Width:** `6` (scaled 4x from standard 1.5 for higher resolution)
* **Padding:** Exactly 3 units from viewBox edge to accommodate stroke width and prevent clipping

### **Path Requirements**
* **Type:** Outline style only. All vector shapes must be consolidated into a single `<path>` element
* **Fill:** The `fill` attribute must be `"none"`
* **Stroke:**
    * `stroke`: `"currentColor"`
    * `strokeWidth`: `6`
    * `strokeLinecap`: `"round"`
    * `strokeLinejoin`: `"round"`

### **Design Principles**
* **Visual Style:** Simple, geometric, and clear
* **Proportions:** Maximize canvas usage with exactly 3 units padding on all sides
* **Details:** Scale appropriately for the 96x96 resolution (e.g., small elements like dots should have radius of 3 units minimum)

## **2. Output Format Specification**

The final output must be a single React component in TSX format following this exact template:

* Replace `[IconName]` with the PascalCase version of the icon concept (e.g., "cute robot" becomes `CuteRobotIcon`)
* Replace `[SVG_PATH_DATA]` with the generated vector path string for the `d` attribute

### **Template:**

```tsx
export function [IconName]({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 96 96"
      strokeWidth={6}
      stroke="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="[SVG_PATH_DATA]"
      />
    </svg>
  );
}
```

## **3. Reference Examples**

### **Good Examples:**
* `ChatbotIcon` - Chat bubble with smiley face, proper padding and proportions
* `DiceIcon` - Square die with rounded corners and appropriately sized dots

### **Key Measurements:**
* **Main shapes:** Must span exactly from coordinate 3 to 93 (with exactly 3-unit padding)
* **Border radius:** 8-12 units for rounded rectangles
* **Small details:** Minimum 3-unit radius for dots/circles
* **Text/feature positioning:** Center elements properly within the available space

## **4. Quality Checklist**

Before finalizing an icon, verify:
- [ ] Uses 96x96 viewBox with strokeWidth of 6
- [ ] Has exactly 3 units padding from edges (shapes span coordinates 3-93)
- [ ] Single `<path>` element with all shapes consolidated
- [ ] Follows the exact template format
- [ ] Visual elements are properly scaled and proportioned
- [ ] Icon takes up maximum possible canvas space while respecting padding
- [ ] Icon is recognizable and clear at various sizes