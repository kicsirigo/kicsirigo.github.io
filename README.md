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
  - 🔵 **Client PC (PC)**
  - 🗄️ **Rack Cabinet (RACK)** (A grey metal chassis cabinet for housing rackmountable hardware)
- **⚡ Device Port Customization**: Click on any placed device to open an interactive faceplate configuration. You can dynamically adjust the number of ports (from 1 to 128) and configure individual ports (Port Label, VLAN ID, Port Mode, Connection details, and Notes) with real-time visual status cues.
- **🏢 Rack Cabinets & Visual Mounting**: Placed **Rack Cabinets** act as scalable housing units. You can manually configure the width and height of a rack to match the floorplan room dimensions. When other devices are placed at the same location, they visually snap into a realistic rack-mounted layout scaling perfectly with the map zoom.
- **🧲 Snap to Grid**: Toggle a 20px visual grid overlay, adjust its offset manually by dragging with **Shift**, and automatically snap devices and cable joints to grid intersections for precise alignments.
- **🎨 Catppuccin Theme Palette**: Smooth, gorgeous light and dark mode styling with smooth transitions.
- 🌍 **Internationalization (i18n)**: Fully localized interface in English 🇬🇧 and Hungarian 🇭🇺.
- 📄 **PDF Export**: Save your annotated floorplan along with cables, devices, and measurements as a PDF document.
- ⚡ **Auto-save**: Automatically saves your current workspace in the browser's local storage so you never lose your progress.
- 📱 **Mobile & Touch Optimization**: Full support for native two-finger pinch-to-zoom / panning, and a custom vertical offset when dragging points so your finger doesn't block your view.

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
   - Select a device from the sidebar (Router, Switch, Patch Panel, AP, or PC).
   - Click anywhere on the map to place the device. Active device selection will show a visual pulse.
5. **Configure Device Ports**:
   - Click on any placed device to open its visual faceplate configuration.
   - Adjust the number of ports to customize the device configuration (e.g. create a 48-port switch, a 2-port patch panel, etc.).
   - Click on any port to assign its custom label, VLAN, mode (Access/Trunk/Uplink), connection destination, and notes.
6. **Manage & Refine**:
   - **Right-Click** (or long tap) on any device or point to rename or delete it.
   - Press `Ctrl + Z` or click **Undo** to roll back your last action.
   - Toggle **🧲 Grid** to overlay a positioning grid. Hold **Shift** and drag to manually align the grid lines with your floorplan's walls.
7. **Export**: Click **Export** to download your annotated floorplan as a PDF.

> [!TIP]
> **Navigation Controls**:
> - **Desktop**: Scroll the mouse wheel to zoom. Hold **Right-Click** (or the middle mouse button) and drag to pan the floorplan.
> - **Mobile**: Use a standard two-finger pinch gesture to zoom. Drag with two fingers to pan.
> - **Precise Moving (Mobile)**: Dragging any device or point on mobile offsets it slightly above your finger so it stays visible while placing.

---

## 🛠️ Built With

- **HTML5 Canvas** - High-performance drawing engine.
- **Vanilla CSS3** - Customized styling with CSS custom properties (variables) for theme management.
- **Vanilla JavaScript** - Clean, zero-framework logic.
- **PDF.js** - Client-side rendering of PDF documents.
- **jsPDF** - Client-side PDF generation.
