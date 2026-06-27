# 📐 Measurer App

A beautiful, lightweight, and client-side web application designed to overlay network devices and measure cable runs directly on floorplans (supporting image files).

Vibecoded with Gemini & refined using minimalist code design principles.

---

## ✨ Features

- **🌐 Image Support**: Load floorplans as standard image files.
- **📏 Calibration & Scaling**: Calibrate the drawing canvas by selecting a line of known distance (e.g., a wall) and entering its real-world length.
- **🔌 Cable Estimation & Types**: Draw multiple independent cable runs and get real-time length estimation. Choose from distinct **Cable Types** (Cat5e, Cat6, Cat6a, Fiber, Power) which are color-coded, and see your total lengths automatically aggregated by type!
- **🖱️ Drag Mode (Move & Resize)**: Disables accidental clicks while dragging. Activate **Drag** mode to:
  - Drag and move devices or cable points.
  - Dynamically resize **Rack Cabinets** from any border or corner with contextual cursors.
- **🏢 Intelligent Layering**: Placed rack cabinets act as background containers. Non-rack devices placed inside them are automatically layered on top, ensuring they remain easy to select, drag, or configure.
- **🗃️ Multi-Select & Batch Operations**: Select multiple devices at once using marquee box-selection. Move selected batches together, or delete them in a single action. Supports `Shift`/`Ctrl` clicks to fine-tune selections.
- **🖥️ Device Placement**: Drag-free click-to-place network components:
  - 🟣 **Router (RT)**
  - 🟢 **Switch (SW)**
  - 🌸 **Patch Panel (PP)**
  - 🟡 **Access Point (AP)**
  - 🔵 **Client PC (PC)**
  - 🗄️ **Rack Cabinet (RACK)** (A chassis cabinet for housing rackmountable hardware)
- **⚡ Device Port Customization**: Click on any placed device to open an interactive faceplate configuration. You can dynamically adjust the number of ports (from 1 to 128) and configure individual ports (Port Label, VLAN ID, Port Mode, Connection details, and Notes) with real-time visual status cues.
- **🧲 Snap to Grid**: Toggle a 20px visual grid overlay, adjust its offset manually by dragging with **Shift**, and automatically snap devices and cable joints to grid intersections for precise alignments.
- **🎨 Catppuccin Theme Palette**: Smooth, gorgeous light and dark mode styling with smooth transitions.
- 🌍 **Internationalization (i18n)**: Fully localized interface in English 🇬🇧 and Hungarian 🇭🇺.
- 💾 **Workspace Backup (.plan)**: Save your workspace state to a `.plan` file and load it later to continue working.
- 📄 **PDF Export**: Save your annotated floorplan along with cables, devices, and measurements as a PDF document.
- ⚡ **Auto-save**: Automatically saves your current workspace in the browser's local storage so you never lose your progress.
- 📱 **Mobile & Touch Optimization**: Full support for native two-finger pinch-to-zoom / panning, and a custom vertical offset when dragging points so your finger doesn't block your view.

---

## 🚀 How to Use

1. **Upload**: Drag or choose an image or PDF file of your floorplan.
2. **Calibrate**:
   - Click the **Scale** button (or press `S`).
   - Click on the start and end point of a known distance (like a door width or wall line).
   - Adjust the points if needed, click **Confirm**, and enter the real-world distance in meters.
3. **Draft Cables**:
   - Select your desired **Cable Type** (e.g., Cat6, Fiber) from the dropdown in the top toolbar.
   - Click **Draw Cables** (or press `M`) and tap/click along the floorplan to measure paths.
   - Use **New Cable** (or press `N`) to start a separate segment.
4. **Place Devices**:
   - Select a device from the sidebar (Router, Switch, Patch Panel, AP, or PC).
   - Click anywhere on the map to place the device. Active device selection will show a visual pulse.
5. **Configure Device Ports**:
   - Click on any placed device to open its visual faceplate configuration.
   - Adjust the number of ports to customize the device configuration (e.g. create a 48-port switch, a 2-port patch panel, etc.).
   - Click on any port to assign its custom label, VLAN, mode (Access/Trunk/Uplink), connection destination, and notes.
6. **Manage & Refine**:
   - **Right-Click** (or long tap) on any device or point to rename or delete it. Shortcut guidelines are displayed inside the menu.
   - Switch to **Select** mode (or press `V`) to draw a selection marquee box and perform batch actions (multi-drag and multi-delete).
   - Switch to **Drag** mode (or press `D`) to move devices and drag the edges or corners of rack cabinets to scale them.
7. **Export & Backup**: 
   - Click **Export PDF** to download your annotated floorplan as a PDF.
   - Click **Save .plan** to backup your workspace state, which you can load back by dragging the `.plan` file onto the app later.

> [!TIP]
> **Navigation Controls**:
> - **Desktop**: Scroll the mouse wheel to zoom. Hold **Right-Click** (or the middle mouse button) and drag to pan the floorplan.
> - **Mobile**: Use a standard two-finger pinch gesture to zoom. Drag with two fingers to pan.
> - **Precise Moving (Mobile)**: Dragging any device or point on mobile offsets it slightly above your finger so it stays visible while placing.

---

## ⌨️ Keyboard Shortcuts

Speed up your drafting workflow using these keyboard shortcuts:

| Shortcut | Action | Description |
| :--- | :--- | :--- |
| **`Ctrl + O`** | Open Plan | Opens the file picker to load a new floorplan or `.plan` workspace |
| **`Ctrl + Z`** | Undo | Rolls back the last action |
| **`Ctrl + Y`** | Redo | Re-applies a rolled-back action |
| **`F2`** | Rename | Renames the selected device or hovered device |
| **`Delete` / `Backspace`** | Delete Selection | Deletes all selected devices and their connected cables |
| **`Escape`** | Reset Mode | Cancels the active mode, clears selection, and returns to normal view |
| **`S`** | Scale Tool | Activates calibration and scaling mode |
| **`D`** | Drag Tool | Activates drag/moving and rack resizing mode |
| **`V`** | Select Tool | Activates multi-select marquee mode |
| **`M`** | Cables Tool | Activates draw cables mode |
| **`N`** | New Cable | Starts a new cable path segment |
| **`C`** | Connect Tool | Activates smart port connection mode |
| **`E`** | Delete Tool | Toggles single-element delete mode |

---

## 🛠️ Built With

- **HTML5 Canvas** - High-performance drawing engine.
- **Vanilla CSS3** - Customized styling with CSS custom properties (variables) for theme management.
- **Vanilla JavaScript** - Clean, zero-framework logic.
- **PDF.js** - Client-side rendering of PDF documents.
- **jsPDF** - Client-side PDF generation.
