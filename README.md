# PixelPerfect Image Editor

A simple, web-based image editor built with React, TypeScript, and shadcn/ui. Allows users to upload images and perform basic editing tasks like background removal, cropping, and filter adjustments.

**(Optional: Add a screenshot or GIF of the application here)**
`[Screenshot/GIF of PixelPerfect in action]`

## ✨ Features

* **Image Upload:** Upload images via drag & drop or file selection (supports PNG, JPG, JPEG).
* **Background Removal:** Simple one-click removal of plain white backgrounds (makes them transparent).
* **Interactive Cropping:** Visually select and apply a crop area with resize handles.
* **Image Adjustments:** Fine-tune Brightness, Contrast, and Saturation using sliders.
* **Undo Functionality:** Step back through editing history.
* **Reset Options:** Reset adjustments to the original uploaded image or start fresh with a new image.
* **Download:** Save the edited image as a PNG file.
* **Theming:** Supports Light, Dark, and System themes.
* **Responsive Design:** Adapts to different screen sizes.

## 🚀 Tech Stack

* **Frontend Framework:** React
* **Language:** TypeScript
* **UI Components:** shadcn/ui (built on Radix UI & Tailwind CSS)
* **Styling:** Tailwind CSS
* **Icons:** Lucide React
* **State Management:** React Hooks (`useState`, `useRef`, `useEffect`, `useContext`)

## 📁 File Structure
```
.
└── src/
├── App.tsx             # Main application component
└── components/
├── GradientText.tsx    # Reusable component for gradient text style
├── ImageEditor.tsx     # Core image editing interface and logic
├── ImageUpload.tsx     # Initial image upload interface
├── mode-toggle.tsx     # Theme switching dropdown component
├── NavBar.tsx          # Top navigation bar
├── theme-provider.tsx  # Context provider for theme management
└── ui/                 # shadcn/ui components
├── button.tsx
├── card.tsx
├── dropdown-menu.tsx
├── label.tsx
├── slider.tsx
├── tabs.tsx
├── toast.tsx
└── toaster.tsx
```

## 🔧 Getting Started

### Prerequisites

* Node.js (v18 or later recommended)
* npm, yarn, or pnpm package manager

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd pixelperfect # or your project directory name
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    ```

### Running the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

---

Open your browser and navigate to http://localhost:5173
