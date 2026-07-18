# A4ui Component Roadmap

Gap analysis for the A4ui SolidJS component library, benchmarked against MUI,
Chakra UI, Mantine, Ant Design, shadcn/ui, Radix, Bootstrap, and Headless UI.
Only components/pages A4ui does **not** already ship are listed as missing.

## Missing components

| Component                       | Have it in (libs)                      | Priority | One-line description                                                       |
| ------------------------------- | -------------------------------------- | -------- | -------------------------------------------------------------------------- |
| Stepper / Wizard                | MUI, Mantine, Ant Design, Chakra       | 🔥 high  | Multi-step progress indicator for guided flows and forms.                  |
| Data Grid (sortable/filterable) | MUI, Ant Design, Mantine               | 🔥 high  | Advanced table with sorting, filtering, pagination, and resizable columns. |
| Carousel                        | Mantine, Chakra, Bootstrap, Ant Design | 🔥 high  | Sliding gallery/slideshow with autoplay and swipe support.                 |
| Command palette (exported)      | shadcn/ui, Mantine (Spotlight)         | 🔥 high  | Keyboard-driven ⌘K launcher for navigation and actions.                    |
| Rating                          | MUI, Ant Design, Mantine, Chakra       | 🔥 high  | Star/icon rating input and read-only display.                              |
| Empty State                     | Ant Design, Chakra, Mantine            | 🔥 high  | Placeholder for no-data views with illustration and CTA.                   |
| Calendar                        | Mantine, MUI, Ant Design               | 🔥 high  | Month/date calendar view for browsing and selecting dates.                 |
| Timeline                        | MUI, Ant Design, Mantine               | 🔥 high  | Vertical/horizontal sequence of chronological events.                      |
| Tag Input / Chips               | MUI, Mantine, Ant Design               | 🔥 high  | Multi-value text entry rendered as removable tags.                         |
| Tree View                       | MUI, Ant Design, Mantine               | 🔥 high  | Hierarchical, expandable/collapsible node tree.                            |
| Splitter / Resizable panels     | Ant Design, shadcn/ui                  | 🔥 high  | Draggable dividers to resize adjacent panes.                               |
| Avatar Group                    | MUI, Chakra, Ant Design                | 🔥 high  | Overlapping stack of avatars with overflow count.                          |
| Color Picker (exported)         | Mantine, Ant Design, Chakra            | 🔥 high  | Standalone color selection with swatches and input formats.                |
| Notification Center             | Ant Design, Mantine                    | med      | Aggregated, dismissible notification feed/panel.                           |
| KBD                             | Chakra, Mantine, shadcn/ui             | med      | Styled inline keyboard-key indicator.                                      |
| Descriptions / Data List        | Ant Design, Chakra                     | med      | Key/value detail layout for read-only records.                             |
| Result Page                     | Ant Design                             | med      | Full-status result screen (success/error/403/404/500).                     |
| Anchor / Table of Contents      | Ant Design, Mantine                    | med      | Scroll-spy navigation linking to page sections.                            |
| Affix / Sticky                  | Ant Design                             | med      | Pins an element to the viewport while scrolling.                           |
| Back to Top                     | Ant Design                             | med      | Floating button that scrolls the page to the top.                          |
| Transfer List                   | Ant Design, MUI                        | med      | Dual-list picker to move items between columns.                            |
| List                            | Ant Design, Chakra, Mantine            | med      | Structured list with items, meta, and actions.                             |
| Image (zoom/lightbox)           | Ant Design, Mantine, MUI               | med      | Responsive image with preview/lightbox and fallback.                       |
| Collapse                        | Ant Design, Bootstrap, Chakra          | med      | Toggle to expand/collapse a single content region.                         |
| Floating Action Button          | MUI, Mantine                           | med      | Prominent circular primary-action button.                                  |
| Speed Dial                      | MUI                                    | med      | FAB that fans out into multiple quick actions.                             |
| Bottom Navigation               | MUI, Chakra                            | med      | Mobile bottom bar for top-level navigation.                                |
| Tree Select                     | Ant Design, Mantine                    | med      | Select input backed by a hierarchical tree.                                |
| Cascader                        | Ant Design                             | med      | Cascading multi-level dropdown selection.                                  |
| Mentions                        | Ant Design                             | med      | Textarea with @mention autocomplete suggestions.                           |
| Tour / Onboarding coachmarks    | Ant Design, Mantine (Spotlight)        | med      | Guided step-through highlighting UI features.                              |
| Statistic Countdown             | Ant Design                             | med      | Live countdown timer to a target date/time.                                |
| Comment                         | Ant Design (legacy)                    | low      | Threaded comment layout with author and actions.                           |
| Calendar Heatmap                | (contribution-style)                   | low      | Grid heatmap of activity over a date range.                                |
| Highlight / Mark                | Mantine, Chakra                        | low      | Highlights matched substrings within text.                                 |
| Portal                          | Chakra, Mantine, Radix                 | low      | Renders children into a detached DOM node.                                 |
| Ring Progress                   | Mantine, Ant Design                    | low      | Circular percentage progress ring.                                         |
| Timeline/Steps mini (dots)      | Ant Design                             | low      | Compact dot-based step indicator.                                          |

## Example/template pages

Legend: ✅ already built · ⬜ missing.

- ✅ Login (auth)
- ⬜ Signup / Register (auth)
- ⬜ Forgot password (auth)
- ⬜ Reset password (auth)
- ⬜ Two-factor / OTP verification (auth)
- ✅ Dashboard (app)
- ⬜ Analytics (app)
- ✅ Settings (app)
- ✅ Profile (app)
- ⬜ Inbox / Email (app)
- ⬜ Chat / Messaging (app)
- ⬜ Kanban board (app)
- ⬜ Calendar / Scheduler (app)
- ⬜ File manager (app)
- ⬜ Team / Members (app)
- ⬜ Notifications feed (app)
- ⬜ Landing page (marketing)
- ✅ Pricing (marketing)
- ⬜ Features (marketing)
- ⬜ About (marketing)
- ⬜ Contact (marketing)
- ⬜ Blog list (marketing)
- ⬜ Blog post (marketing)
- ⬜ Product detail (commerce)
- ⬜ Product list / Catalog (commerce)
- ⬜ Cart (commerce)
- ⬜ Checkout (commerce)
- ⬜ Order confirmation (commerce)
- ⬜ 404 Not Found (utility)
- ⬜ 500 Server Error (utility)
- ⬜ Maintenance (utility)
- ⬜ Empty state (utility)
- ⬜ Onboarding (utility)
- ⬜ Welcome (utility)

## Animation ideas

Legend: ✅ already in A4ui · ⬜ to add.

- ✅ Count-up numbers (via Stat)
- ✅ Page cross-fade transitions
- ✅ Calm / reduced-motion mode
- ✅ Cursor glow
- ✅ Magnetic buttons
- ⬜ Scroll-reveal (fade/slide in on scroll into view)
- ⬜ List stagger (sequential item entrance)
- ⬜ Page-level shared-element / layout transitions
- ⬜ Parallax backgrounds and layers
- ⬜ Skeleton shimmer sweep
- ⬜ Button/click ripple effect
- ⬜ Hover tilt / 3D card lift
- ⬜ Animated route/tab underline (shared indicator)
- ⬜ Toast/notification slide-and-stack choreography
- ⬜ Accordion/collapse height auto-animate
- ⬜ Confetti / success burst on completion
- ⬜ Marquee / infinite logo scroller
