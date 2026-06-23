# 📐 Measurer App

A beautiful, lightweight, and client-side web application designed to overlay network devices and measure cable runs directly on floorplans (supporting both image files and PDF documents).

Vibecoded with Gemini & refined using minimalist code design principles.

---

## ✨ Features

- **🌐 PDF & Image Support**: Load floorplans as standard images or directly render the first page of PDF files using PDF.js.
- **📏 Calibration & Scaling**: Calibrate the drawing canvas by selecting a line of known distance (e.g., a wall) and entering its real-world length.
- **🔌 Cable Estimation**: Draw multiple independent cable runs and get real-time length estimation based on your calibrated scale.
- **🖥️ Device Placement**: Drag-free click-to-place network components:
  - 🟣 **Router (RT)**
  - 🟢 **Switch (SW)**
  - 🌸 **Patch Panel (PP)**
  - 🟡 **Access Point (AP)**
- **🎨 Catppuccin Theme Palette**: Smooth, gorgeous light and dark mode styling with smooth transitions.
- **🌍 Internationalization (i18n)**: Fully localized interface in English 🇬🇧 and Hungarian 🇭🇺.
- **💾 PNG Export**: Save your annotated floorplan along with cables, devices, and measurements as a PNG image.

---

## 🚀 How to Use

1. **Upload**: Drag or choose an image or PDF file of your floorplan.
2. **Calibrate**:
   - Click the **Scale** button.
   - Click on the start and end point of a known distance (like a door width or wall line).
   - Adjust the points if needed, click **Confirm**, and enter the real-world distance in meters.
3. **Draft Cables**:
   - Click **Draw Cables** and tap/click along the floorplan to measure paths.
   - Use **New Cable** to start a separate segment with different colors.
4. **Place Devices**:
   - Select a device from the sidebar (Router, Switch, Patch Panel, or AP).
   - Click anywhere on the map to place the device.
5. **Manage & Refine**:
   - **Right-Click** (or long tap) on any device or point to rename or delete it.
   - Press `Ctrl + Z` or click **Undo** to roll back your last action.
6. **Export**: Click **Export** to download your annotated floorplan as an image.

---

## 🛠️ Built With

- **HTML5 Canvas** - High-performance drawing engine.
- **Vanilla CSS3** - Customized styling with CSS custom properties (variables) for theme management.
- **Vanilla JavaScript** - Clean, zero-framework logic.
- **PDF.js** - Client-side rendering of PDF documents.
