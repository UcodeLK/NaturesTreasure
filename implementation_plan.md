# Implementation Plan - Natures Treasure Website Development

Create a luxury, high-end, responsive website for **Natures Treasure** ("Pure By Nature"), specializing in Agarwood tree management (growing on behalf of clients using chemical-free eco-friendly Thailand Inoculation Technology) and sale of 100% Pure Organic Oud Oil.

## User Review Required

> [!IMPORTANT]
> - **Logo**: Using logo provided (`Natures (1).png` / `logo.png`) featuring Deep Forest Green (`#3F523E`), Warm Oud Wood Brown (`#6E4935`), and Soft Cream (`#F9F3EA`).
> - **Imagery**: Using curated high-resolution Unsplash images for Agarwood plantations, Thailand Inoculation Technology, and pure Oud oil artisanal bottles.

## Proposed Changes

### Brand Assets & Core Files

#### [NEW] [logo.png](file:///c:/Users/Umar/Documents/UCODE/NaturesNestIlham/logo.png)
Copy of `Natures (1).png` provided by user.

#### [NEW] [index.html](file:///c:/Users/Umar/Documents/UCODE/NaturesNestIlham/index.html)
Comprehensive single-page / multi-section luxury website containing:
1. **Header & Navigation**: Glassmorphism navbar with brand logo, nav items (Home, Plantation & Management, Thailand Tech, Oud Collection, ROI Calculator, Contact Us), and Cart/Inquire quick count.
2. **Hero Banner**: Atmospheric luxury hero section with tagline "Natures Treasure - Pure By Nature", compelling CTAs ("Explore Tree Packages", "Explore Oud Collection"), and key highlights badges.
3. **About & Philosophy**: Story of sustainable Agarwood cultivation, Asian heritage, and 100% organic commitment.
4. **Agarwood Plantation & Tree Management**:
   - Explanation of client ownership & managed growth services.
   - Interactive 4-step process (Selection -> Eco-Nurturing -> Resin Induction -> Harvest & Profit).
5. **Thailand Chemical-Free Inoculation Technology**:
   - Feature spotlight on eco-friendly Thailand Inoculation Technology from Thailand.
   - 0% harmful chemicals, ensuring pure organic growth & resin induction.
6. **Pure Oud Oil Shop & Artisanal Collection**:
   - Interactive product grid with filters (All, Pure Essence, Aged Reserve, Attar Blend).
   - High quality Unsplash product photography, price breakdown, origin info, and "Inquire / Order" modals.
7. **Interactive ROI & Tree Yield Estimator**:
   - Interactive sliders (Number of Trees, Growth Maturity Years 5-10).
   - Real-time calculated projections for estimated yields, estimated value in USD, and CO2 offset metrics.
8. **Plantation Visit & Contact Section**:
   - Booking form for plantation visits, tree ownership consultation, or custom Oud inquiries.
9. **Footer**: Brand links, certification badges, contact details, social links.

#### [NEW] [style.css](file:///c:/Users/Umar/Documents/UCODE/NaturesNestIlham/style.css)
- Custom CSS design system matching exact logo colors:
  - `--primary-green`: `#3F523E`
  - `--primary-green-dark`: `#273827`
  - `--earth-brown`: `#6E4935`
  - `--accent-gold`: `#D4A359`
  - `--cream-bg`: `#FAF5EE`
  - `--cream-card`: `#F3ECE2`
- Typography: Google Fonts (`Playfair Display` for serif headers, `Plus Jakarta Sans` for body).
- Glassmorphism, smooth animations, hover effects, modal styles, and mobile responsiveness.

#### [NEW] [script.js](file:///c:/Users/Umar/Documents/UCODE/NaturesNestIlham/script.js)
- Sticky nav behavior & mobile toggle menu.
- Interactive ROI Calculator logic with real-time slider updates.
- Product filter system and quick view / inquiry modal popups.
- Smooth scroll navigation and form validation.

## Verification Plan

### Automated / Syntax Check
- Verify HTML, CSS, and JS syntactical validity.

### Manual Verification
- Test interactive slider calculations (ROI calculator).
- Test product modal display and filter buttons.
- Verify responsive viewports on desktop, tablet, and mobile browsers.

