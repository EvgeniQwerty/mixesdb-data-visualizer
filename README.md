# MixesDB Label Data Visualizer

An interactive single-page web application built with Next.js that visualizes music label data from MixesDB. The application features a bubble chart visualization and a list view, allowing users to explore label popularity and the mixes where they appear.

![MixesDB Label Visualizer](https://via.placeholder.com/800x400?text=MixesDB+Label+Visualizer)

## Features

- **Interactive Bubble Chart Visualization** using D3.js
  - Dynamic bubble sizing based on label popularity
  - Zoom and pan functionality for exploring the visualization
  - Hover effects with tooltips showing label information
  - Click interactions to view detailed information about each label

- **Virtualized List View** for efficient rendering of large datasets
  - Expandable rows showing mixes where each label appears
  - Sorting by label popularity
  - Smooth animations for enhanced user experience

- **Advanced Filtering Options**
  - Minimum appearance threshold adjustment
  - Search functionality for both labels and mixes
  - Toggle between chart and list views

- **Responsive Design**
  - Works on desktop and mobile devices
  - Adapts to different screen sizes

## Installation

### Prerequisites

- Node.js (v14 or later)
- npm or yarn

### Setup

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/mixesdb-data-visualizer.git
   cd mixesdb-data-visualizer
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   yarn install
   ```

3. Run the development server
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. **Exploring the Bubble Chart**
   - Each bubble represents a music label
   - Bubble size indicates the number of appearances in mixes
   - Hover over bubbles to see label names and appearance counts
   - Click on a bubble to see detailed information and associated mixes
   - Use mouse wheel or pinch gestures to zoom in/out
   - Click and drag to pan around the visualization

2. **Using the List View**
   - Click the "List" button to switch to list view
   - Labels are sorted by popularity (number of appearances)
   - Click on a label to expand and see associated mixes
   - Use the search box to find specific labels or mixes

3. **Filtering Data**
   - Adjust the "Minimum appearances" slider to filter labels by popularity
   - Use the search box to filter by label name or mix name
   - The total number of displayed labels is shown in the filter controls

## Data Format

The application expects a JSON file with the following structure:

```json
{
  "labels_count": {
    "Label Name": {
      "count": 42,
      "mixes": ["mix1", "mix2", "..."]
    },
    "Another Label": {
      "count": 27,
      "mixes": ["mix3", "mix4", "..."]
    }
  }
}
```

## Technologies Used

- **Next.js** - React framework for server-rendered applications
- **React** - UI library
- **D3.js** - Data visualization library
- **Framer Motion** - Animation library
- **React Virtuoso** - Virtualized list component
- **TailwindCSS** - Utility-first CSS framework
- **TypeScript** - Type-safe JavaScript

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.