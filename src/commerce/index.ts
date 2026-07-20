// A4ui commerce components — storefront/cart building blocks, kept in their own
// entry (`@a4ui/core/commerce`) so the base package stays lean. Import styles the
// same way as the core (`@a4ui/core/styles.css` or the Tailwind preset).
export { PriceTag, type PriceTagProps } from './PriceTag'
export { QuantityStepper, type QuantityStepperProps } from './QuantityStepper'
export { ProductCard, type ProductCardProps, type ProductBadgeTone } from './ProductCard'
export { ProductGrid, type ProductGridProps } from './ProductGrid'
export { CartLine, type CartLineProps } from './CartLine'
export { CartSummary, type CartSummaryProps, type CartSummaryItem } from './CartSummary'
export { FilterGroup, type FilterGroupProps, type FacetOption } from './FilterGroup'
export { FacetSidebar, type FacetSidebarProps, type FacetSection, type FacetPrice } from './FacetSidebar'
export {
  PriceBlock,
  type PriceBlockProps,
  type PriceBlockCoupon,
  type PriceBlockFinancing,
  type PriceBlockSize,
} from './PriceBlock'
export { ConditionScale, type ConditionScaleProps, type ConditionTier } from './ConditionScale'
export { createCart, type Cart, type CartProduct, type CartEntry } from './createCart'
