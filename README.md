# ⚛️ Periodic Table 3D

A stunning, interactive 3D Periodic Table of Elements built with **Astro**, **React**, and **React Three Fiber**. This project combines scientific data with modern web aesthetics to provide an immersive educational experience.

![Periodic Table Hero](https://github.com/prime351585/periodic_table/blob/main/public/PeriodicTable.png)

## ✨ Features

- **🌐 Immersive 3D Visualization**: Experience the periodic table in a 3D space with smooth orbit controls and zoom.
- **📊 Dynamic Property Trends**: Visualize chemical trends (Atomic Mass, Density, Electronegativity, etc.) using vibrant color gradients across the entire table.
- **📱 Responsive Design**: Fully optimized for both Desktop and Mobile devices with tailored controls and layouts.
- **🔍 Detailed Inspections**: Click or tap any element to see comprehensive data, including its summary, physical properties, and electron configurations.
- **🎨 Premium Aesthetics**: Glass-morphic UI, glowing element blocks, and fluid animations powered by Framer Motion.
- **⚙️ Data Driven**: Entirely rendered from a single JSON source for easy updates and scalability.

## 🚀 Tech Stack

- **Framework**: [Astro](https://astro.build/)
- **UI Library**: [React](https://reactjs.org/)
- **3D Engine**: [React Three Fiber](https://r3f.docs.pmnd.rs/) & [Three.js](https://threejs.org/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Data Source**: Custom Elements JSON

## 🛠️ Getting Started

### Prerequisites

- Node.js (Latest LTS recommended)
- npm or pnpm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/periodic-table.git
   cd periodic-table
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

## 📂 Data Source

The project uses a high-quality dataset for all elemental properties. You can find the data configuration at:

- **JSON Source**: [View PeriodicTableJSON.json](https://github.com/Bowserinator/Periodic-Table-JSON)

Each element in the dataset includes properties like `atomic_mass`, `density`, `melt`, `boil`, `electronegativity_pauling`, and more.

## 🎨 Controls

- **Desktop**:
  - `Left Click + Drag`: Pan/Rotate view
  - `Scroll`: Zoom in/out
  - `Left Click`: Inspect Element
- **Mobile**:
  - `One Finger Drag`: Pan view
  - `Pinch`: Zoom in/out
  - `Tap`: Inspect Element

## 👤 Developer

Developed by **Harsh Maurya**. Connect with me:

- [GitHub](https://github.com/prime351585)
- [Twitter](https://x.com/HarshMaurya1585)
- [Peerlist](https://peerlist.io/prime351585)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
