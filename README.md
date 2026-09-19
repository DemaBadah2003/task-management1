# Shared Components

## Overview

This document provides a comprehensive summary of all reusable UI components identified across the Taskly application. By reviewing the application's screens—including authentication flows (`/login`, `/sign-up`), project management views (`/project`, `/project/add`, `/project/[id]/epics`), and dashboard statistics (`/statistics`)—these UI elements were structured into modular, reusable components to ensure visual consistency, maintainability, and streamlined development.

---

## Shared Components

| # | Component | Description | Used In | Screenshot |
|---|-----------|-------------|---------|------------|
| 1 | **Navbar** | Top application header with brand logo, active status badge, user profile avatar, and mobile menu trigger. | All authenticated pages (`/project`, `/statistics`, etc.) | ![Navbar](public/icons/iconstaskly.svg) |
| 2 | **Sidebar** | Primary left navigation sidebar supporting expanded/collapsed modes, project accordion, statistics link, and logout action. | All authenticated pages (`/project`, `/statistics`, etc.) | ![Sidebar](public/icons/project.svg) |
| 3 | **AuthenticatedLayout** | Main application wrapper shell combining Navbar, Sidebar, and Mobile Navigation. | All authenticated pages (`/project`, `/statistics`, etc.) | ![Layout Shell](public/icons/folder.svg) |
| 4 | **Button** | Standardized action button supporting primary blue gradient, secondary, icon, and loading states. | Login, Sign Up, Add Project, Edit Project, Empty State, Error State | ![Button Icon](public/icons/check.svg) |
| 5 | **Input** | Styled form text/email input field with uppercase labels, focus ring, helper text, and validation error messages. | Login, Sign Up, Add Project, Edit Project | ![Input Icon](public/icons/lamp.svg) |
| 6 | **PasswordInput** | Specialized password input component with integrated toggle icon (eye/eye-off) for visibility control. | Login, Sign Up | ![Password Toggle](public/icons/eye.svg) |
| 7 | **ProjectCard** | Interactive card component displaying project name, description, Epics/Tasks/Members badges, and formatted creation date (`DD MMM YYYY`). | Project Listing (`/project`) | ![Project Card Icon](public/icons/Epics.svg) |
| 8 | **AddProjectCard** | Dotted/outlined grid card with centered plus icon for creating a new project. | Project Listing (`/project`) | ![Add Card Icon](public/icons/circle.svg) |
| 9 | **AddProjectFab** | Mobile floating action button fixed at bottom-right for quick project creation on small screens. | Mobile view of Project Listing (`/project`) | ![Fab Icon](public/icons/circle.svg) |
| 10 | **ProjectsPagination** | Responsive pagination bar with left/right chevrons, numbered boxes, and ellipsis markers. | Project Listing (`/project`) | ![Pagination Chevron](public/icons/Collapse.svg) |
| 11 | **ProjectsEmptyState** | Illustrated empty state layout featuring compass, ruler, and layers graphics, explanatory text, and CTA button. | Project Listing (`/project`) | ![Empty Compass](public/icons/Compass.svg) |
| 12 | **ProjectsErrorState** | Centered error feedback component displaying error badge, descriptive failure message, and retry button. | Project Listing (`/project`), Epics, Tasks, Members | ![Error Icon](public/icons/error.svg) |
| 13 | **ProjectsLoadingSkeleton** | Animated pulse skeleton layout matching header button and project card grid structure during async fetching. | Project Listing (`/project`) | ![Loading Icon](public/icons/Layers.svg) |

---

## Component Details & Specifications

### 1. Navbar
* **File Location**: [`src/components/layout/Navbar.tsx`](file:///d:/project/taskly-project/src/components/layout/Navbar.tsx)
* **Purpose & Reusability**: Provides top-level branding, contextual project info, user avatar profile display, and mobile menu toggling across all authenticated pages.
* **Used In**: `/project`, `/project/add`, `/project/[id]/epics`, `/project/tasks`, `/project/members`, `/project/details`, `/statistics`.
* **Variants**: Desktop view (integrated header), Mobile view (with menu toggle button).

### 2. Sidebar
* **File Location**: [`src/components/layout/Sidebar.tsx`](file:///d:/project/taskly-project/src/components/layout/Sidebar.tsx)
* **Purpose & Reusability**: Serves as the primary navigation column for switching between "Projects" and "My Statistics", as well as active project sub-navigation (Epics, Tasks, Members, Details). Supports collapsed (icon-only with floating popups) and expanded modes.
* **Used In**: All authenticated application screens.
* **Variants**: Expanded (`256px`), Collapsed (`72px`).

### 3. AuthenticatedLayout
* **File Location**: [`src/components/layout/AuthenticatedLayout.tsx`](file:///d:/project/taskly-project/src/components/layout/AuthenticatedLayout.tsx)
* **Purpose & Reusability**: Enforces a consistent screen layout grid structure, manages sidebar collapse state in React state, and wraps children with `Navbar`, `Sidebar`, and `MobileNavigation`.
* **Used In**: All protected routes under `/project` and `/statistics`.

### 4. Button
* **File Location**: [`src/components/ui/button.tsx`](file:///d:/project/taskly-project/src/components/ui/button.tsx)
* **Purpose & Reusability**: Standardized button component maintaining consistent padding, border radius (`2px` / `4px`), typography, hover states, and built-in loading spinner (`isLoading`).
* **Used In**: `/login`, `/sign-up`, `/project/add`, `/project/[id]/edit`, empty states, error states.
* **Variants**: Primary (`bg-btn-gradient`), Secondary, Outline, Loading State.

### 5. Input
* **File Location**: [`src/components/ui/input.tsx`](file:///d:/project/taskly-project/src/components/ui/input.tsx)
* **Purpose & Reusability**: Provides uniform input styling for text and email fields with uppercase field labels, focus outline styles (`#003D9B`), and red validation error message text.
* **Used In**: Authentication forms (`/login`, `/sign-up`) and Project form screens (`/project/add`, `/project/[id]/edit`).
* **Variants**: Default, Error State (`border-error`).

### 6. PasswordInput
* **File Location**: [`src/components/ui/password-input.tsx`](file:///d:/project/taskly-project/src/components/ui/password-input.tsx)
* **Purpose & Reusability**: Reuses input styling while embedding interactive show/hide password toggle logic and optional password strength validation checklists.
* **Used In**: `/login`, `/sign-up`.

### 7. ProjectCard
* **File Location**: [`src/components/projects/ProjectCard.tsx`](file:///d:/project/taskly-project/src/components/projects/ProjectCard.tsx)
* **Purpose & Reusability**: Encapsulates project card rendering, line clamping for title and description, metadata badges (Epics, Tasks, Members), date formatting (`DD MMM YYYY`), and dynamic link routing (`/project/[id]/epics`).
* **Used In**: `/project` (Project Listing).

### 8. AddProjectCard
* **File Location**: [`src/components/projects/AddProjectCard.tsx`](file:///d:/project/taskly-project/src/components/projects/AddProjectCard.tsx)
* **Purpose & Reusability**: Displays as an interactive card in the project grid on desktop viewports, encouraging users to create new projects.
* **Used In**: `/project` (Project Listing).

### 9. AddProjectFab
* **File Location**: [`src/components/projects/AddProjectFab.tsx`](file:///d:/project/taskly-project/src/components/projects/AddProjectFab.tsx)
* **Purpose & Reusability**: Floating Action Button (FAB) rendered on mobile viewports at the bottom-right corner for quick access to `/project/add`.
* **Used In**: Mobile view of `/project`.

### 10. ProjectsPagination
* **File Location**: [`src/components/projects/ProjectsPagination.tsx`](file:///d:/project/taskly-project/src/components/projects/ProjectsPagination.tsx)
* **Purpose & Reusability**: Provides standardized pagination UI controls with fixed height (`112px`) and padding (`32px` / `py-8`) matching Figma design system specifications.
* **Used In**: `/project` (Project Listing).

### 11. ProjectsEmptyState
* **File Location**: [`src/components/projects/ProjectsEmptyState.tsx`](file:///d:/project/taskly-project/src/components/projects/ProjectsEmptyState.tsx)
* **Purpose & Reusability**: Displays graphic illustration box with layered compass icons, "No Projects" heading, descriptive text, and a CTA button navigating to `/project/add`.
* **Used In**: `/project` when API returns zero projects.

### 12. ProjectsErrorState
* **File Location**: [`src/components/projects/ProjectsErrorState.tsx`](file:///d:/project/taskly-project/src/components/projects/ProjectsErrorState.tsx)
* **Purpose & Reusability**: Centered error feedback component displaying error badge icon, failure message, and interactive "Retry Connection" callback button.
* **Used In**: `/project`, `/project/epics`, `/project/tasks`, `/project/members` during API failures.

### 13. ProjectsLoadingSkeleton
* **File Location**: [`src/components/projects/ProjectsLoadingSkeleton.tsx`](file:///d:/project/taskly-project/src/components/projects/ProjectsLoadingSkeleton.tsx)
* **Purpose & Reusability**: Implements skeleton loading pattern to improve perceived performance while fetching project list data asynchronously.
* **Used In**: `/project` during initial data loading state.
