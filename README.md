# OrchardIntel: Apple Disease Detector with Planet Climate Risk Advisor

A **React + TypeScript** app for apple leaf disease prediction, dataset management, model training simulation, climate risk analysis with **Planet map viewer**, dynamic farm health scoring, and **Supabase Edge Functions** integration.

---

## Features ✨

### Disease Prediction
- Detect **6 classes** with confidence scores and treatment advice:
  - Healthy, Apple Scab, Apple Rust, Powdery Mildew, Fire Blight, Black Rot
- Client-side preprocessing + `enhancedClassifier` (mock) or `realClassifier` via Supabase Edge Function
- Display all class probabilities with the top prediction highlighted

### Dataset Management
- Drag-and-drop folder upload (subfolder-based classification: `healthy/`, `apple_scab/`, etc.)
- Support for **Train/Test/Validation** dataset types
- Class distribution charts and metadata capture

### Model Training
- Configurable parameters: epochs, batch size, learning rate, validation split, augmentation
- Real-time progress simulation via `TrainingProgress`
- Edge Function support: `train-model`

### 🎯 Climate Risk Predictor (Enhanced)

#### **Dynamic Farm Health Scoring**
- **Dual-factor calculation** combining climate parameters + disease risk assessment
- **Climate Score (0-50 points)**:
  - Penalizes non-optimal temperature (< 15°C or > 28°C)
  - High humidity (> 85%) - favors disease development
  - Excessive rainfall (> 30 mm)
  - Extended leaf wetness (> 12 hours)
  - Poor air circulation (< 2 km/h wind)
  - Standing water > 48 hours
  - Temperature jumps > 10°C
  - Drought followed by heavy rain events

- **Disease Risk Score (0-50 points)**:
  - High risk diseases: -15 points each
  - Medium risk diseases: -8 points each
  - Low risk diseases with no high risks: +5 bonus points

- **Total Score (0-100%)**:
  - ✅ **80-100%**: Excellent (Emerald) - Healthy farm
  - ⚠️ **60-79%**: Good (Yellow) - Monitor conditions
  - ⚡ **40-59%**: Fair (Orange) - Intervention recommended
  - 🚨 **0-39%**: Poor (Red) - Urgent action needed

- **Color-coded visual feedback** with animated progress bar

#### **Risk Scoring System**
- Rule-based engine for diseases/pests with **Standard** and **Meta** scoring modes
- **Standard Mode**: Rule-based scoring (±20 points per matched condition)
- **Meta Mode**: Range-based continuous scoring across climate parameter ranges
- Per-disease tie-breaker weights (~1.05–1.1)

#### **Advanced Options (Drill-down Panel)**
- **Collapsible section** below Canopy Humidity for cleaner UI
- **Condition Checkboxes**:
  - 💧 Standing water > 48 hours
  - 🌡️ Temperature jump > 10°C
  - 🌩️ Drought then heavy rain
- **Environment Selects**:
  - ✨ Dust Level (Unknown, Low, Medium, High)
  - 🌊 Drainage (Unknown, Good, Poor)

#### **Disease Prevention Tips**
- Diseases now display **actionable prevention strategies** instead of technical factors
- Each disease shows 2 main prevention tips with option to see more
- Prevention tips are tailored to specific disease conditions:
  - Apple Scab: Fungicide timing, leaf removal, canopy management
  - Powdery Mildew: Sulfur application, air circulation, fertilization control
  - Brown Rot: Fruit thinning, fungicide application, wound prevention
  - And 6+ more diseases with detailed prevention guides

#### **Auto-prediction on Live Data Load**
- When Planet map data is fetched (Point or AOI mode), risk analysis automatically runs
- Climate parameters auto-populate from satellite data
- Farm health score recalculates in real-time
- Loading indicator shows when data is being processed

#### **Planet WMTS Map Integration**
- Live Planet satellite imagery with 39 integrated layers:
  - **Vegetation Health**: NDVI, EVI, OSAVI, SAVI, MSAVI, GNDVI, NDRE, RENDVI
  - **Apple Disease**: PSRI (Fire Blight), ExG & VARI (Leaf Health), NDMI & LSWI (Scab/Moisture)
  - **Moisture & Stress**: NDWI, NDMI, LSWI, Soil Moisture Index
  - **Visual & Spectral**: True Color, False Color, Urban, SWIR
  - **Advanced Research**: MCARI, MTCI, TCARI, TSAVI, SIPI, WBI, VIGREEN
- Grouped layer UI: Vegetation Health / Apple Disease / Moisture / Visual / Other
- Drill-down selectable layers with collapsible sections

#### **Drawing Tools & AOI Analysis**
- **Single Point Mode**: Click on map → fetch climate data for exact location
- **Boundary (AOI) Mode**: Draw polygon, line, or rectangle → fetch aggregated climate data
- **Live Button**: Triggers appropriate fetch based on selected mode
- **Climate Data Retrieved**:
  - Temperature, rainfall, humidity, wind speed, soil moisture, canopy humidity, leaf wetness
- **Risk Analysis Computed**:
  - Risk score (0-100) based on comprehensive climate metrics
  - Risk levels: Low, Medium, High, Critical
  - Matched factors displayed (rainfall patterns, wind conditions, etc.)
- **Auto-fill Form**: All climate data + risk analysis auto-populate parent form

#### **Boundary Management & Visualization**
- **Saved Boundaries List**: Display all drawn/saved boundaries with metadata
  - Inline hectare measurements for polygons (✓ calculated)
  - Climate data badges: 🌡️ Temperature, 🌧️ Rainfall, 💨 Wind Speed
  - Date stamps for each saved boundary
  - Rename functionality (✏️ button) for boundary identification
- **Boundary Selection**: Click saved boundary to load and highlight on map
  - Selected boundary highlighted in green
  - Climate data auto-loaded from database
- **99% Dark Mask Overlay**: When boundary selected:
  - Entire map darkened except selected boundary area
  - Creates focused view of target orchard/field
  - Improves visibility of selected area
  - Only visible in boundary selection mode
- **Area Calculations**: 
  - Polygons: Display square meters, hectares (ha), acres, square feet
  - Lines: Calculate length in meters, kilometers, feet, miles
  - Accurate spherical Earth calculations
- **Multi-geometry Support**: Handle points, lines, polygons, and rectangles
- **Data Mode Flexibility**:
  - Point mode: Single location climate fetch
  - Boundary mode: Aggregated area climate data

### **PlanetMapViewer Component**
- ✅ Multi-mode drawing (Point, Polygon, Rectangle, Line)
- ✅ Layer selection with grouping (Vegetation/Disease/Moisture/Visual/Other)
- ✅ Live button with auto-fill callback
- ✅ Date range picker for historical imagery
- ✅ "Locate" button for user coordinates
- ✅ "Live updates" toggle for real-time data
- ✅ Boundary-aware 99% dark mask overlay
- ✅ Area/distance measurements with multiple units
- ✅ Saved boundaries with climate metadata
- ✅ Rename boundaries for organization
- ✅ Inline measurement display (hectares for polygons)
- ✅ Climate data per-boundary storage

### Authentication
- Supabase email/password auth + guest mode
- Feature-gated UI flows

---

## Dataset Structure

```
your-dataset/
  healthy/           # image1.jpg, image2.png...
  apple_scab/
  apple_rust/
  powdery_mildew/
  fire_blight/
  black_rot/
```

> Uses `webkitRelativePath` for auto-classification (Chrome/Edge recommended).

---

## Quick Start

```bash
# Install dependencies & start dev server
npm install
npm run dev

# Build & preview
npm run build
npm run preview
```

Optional `.env` (frontend):

```bash
VITE_SUPABASE_URL=your_url
VITE_SUPABASE_ANON_KEY=your_key
```

> Planet API keys are configured in Supabase Edge Functions, **not the frontend**.

---

## Project Structure

```
src/
  components/
    ImageUpload.tsx
    PredictionResults.tsx
    DatasetManager.tsx
    TrainingProgress.tsx
    ClimateRiskPredictor.tsx        # NEW: Dynamic farm health scoring + auto-prediction
    PlanetMapViewer.tsx             # Enhanced: Point + AOI modes with auto-fill
    Auth.tsx
  services/
    datasetService.ts
    modelService.ts
    predictionService.ts
    planetService.ts                # fetchPlanetInsights (single point)
  utils/
    realClassifier.ts
    enhancedClassifier.ts
    climateRiskRules.ts             # NEW: Enhanced disease risk calculation
    imagePreprocessing.ts

supabase/functions/
  predict-disease/
  train-model/
  planet-proxy/                    # WMTS tiles
  planet-insights/                 # Climate data (single point)
  planet-aoi/                      # Climate + risk analysis (boundary AOI)
```

---

## Usage

### 1. Disease Prediction
```
Upload -> Preprocess -> Classify (mock/Edge) -> Display Results + Treatment
```

### 2. Dataset Management
```
DatasetManager -> Select type -> Drag folder -> Auto-classify
```

### 3. Training
```
Configure parameters -> Start -> Live metrics (loss/accuracy)
```

### 4. Climate Risk Prediction (NEW WORKFLOW)

#### **Step-by-Step Guide**

1. **Select Risk Type**: Choose between 🌿 Diseases or 🐛 Pests
2. **Configure Climate Parameters**:
   - Enter basic metrics: Temperature, Humidity, Rainfall, Wind Speed, etc.
   - Expand "Advanced Options" for Standing Water, Temp Jumps, Drought conditions, Dust Level, Drainage
3. **Use Planet Live Data** (Recommended):
   - Select layers on Planet map (Vegetation Health, Apple Disease, Moisture, etc.)
   - **Point Mode**: Click on map location → Live button fetches exact point data
   - **AOI Mode**: Draw polygon/rectangle on map → Live button fetches area data
4. **Auto-predictions Trigger**:
   - Climate data auto-populates form
   - Risk analysis runs automatically
   - Top 3 disease/pest risks displayed with scores and matched factors
5. **View Farm Health Score**:
   - Located below action buttons
   - Shows overall farm condition based on climate + disease risk
   - Color-coded status: ✅ Excellent / ⚠️ Good / ⚡ Fair / 🚨 Poor
6. **Make Decisions**:
   - Review risk summary (High/Medium/Low counts)
   - Check matched risk factors
   - Plan interventions based on farm health score

---

## Climate Risk Engine

### **Scoring Methodology (0–100)**

#### Standard Mode (Rule-based)
```
+20 points per matched condition
Max: 100 points
```

#### Meta Mode (Range-based)
```
Continuous scoring across climate parameter ranges:
- Temperature: 15-25°C optimal
- Humidity: 85%+ high risk
- Leaf Wetness: 12+ hours critical
- Soil Moisture: 50-80% optimal
- Rainfall: 20+ mm increases risk
```

#### Farm Health Score (NEW)
```
Climate Score (0-50) + Disease Score (0-50) = Total (0-100)
Average of both factors = Final Health Score %
```

### **Risk Levels**

| Range    | Level      | Status          |
|----------|-----------|-----------------|
| 0–30     | Low       | ✅ Safe         |
| 31–70    | Medium    | ⚠️ Monitor      |
| 71–90    | High      | ⚡ Act Now      |
| 90+      | Critical  | 🚨 Emergency    |

- **Tie-breaker**: `diseaseWeights` in `climateRiskRules.ts` (~1.05–1.1 multipliers)

---

## Supabase Setup

```bash
supabase functions deploy predict-disease train-model planet-proxy planet-insights planet-aoi
```

**Function ENV variables:**

```bash
PLANET_API_KEY=your_planet_api_key
PLANET_CONFIG_ID_JK=your_planet_config_id
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

- Database schema: `supabase/migrations/20251222061318_odd_trail.sql` (with RLS & buckets)

---

## Disease Classes

| Disease            | Severity | Description                     | Risk Factor |
|-------------------|----------|--------------------------------|------------|
| Healthy            | Low      | Normal leaves                  | 0-20%      |
| Apple Scab         | High     | Dark fungal lesions            | 70-100%    |
| Apple Rust         | Medium   | Orange cedar rust spots        | 40-70%     |
| Powdery Mildew     | Medium   | White powdery coating          | 45-75%     |
| Fire Blight        | High     | Bacterial burn                 | 65-95%     |
| Black Rot          | High     | Brown spots + purple halo      | 60-90%     |

---

## UI/UX Enhancements

### **ClimateRiskPredictor Component**
- ✅ Organized left panel with climate parameters
- ✅ Drill-down advanced options to reduce clutter
- ✅ Dynamic farm health score card below buttons
- ✅ Color-coded risk summary (High/Medium/Low)
- ✅ Single-button toggle for Climate Mode:
  - 🤖 **Automatic Mode** (Green): Full-width map, auto-fill from Planet data
  - ✏️ **Manual Mode** (Blue): Side-by-side form + map for manual input
- ✅ Disease prevention tips (replaces technical factors)
- ✅ Removed warning from Standard (rule-based) model selector
- ✅ Auto-loading indicator during Planet data fetch
- ✅ Responsive 2-column layout (parameters + map)

### **PlanetMapViewer Component**
- ✅ Multi-mode drawing (Point, Polygon, Rectangle, Line)
- ✅ Layer selection with grouping
- ✅ Live button with auto-fill callback
- ✅ Date range picker
- ✅ "Locate" button for user coordinates
- ✅ "Live updates" toggle for real-time data

---

## Troubleshooting

| Issue                     | Solution                                        |
|---------------------------|------------------------------------------------|
| Planet 400 error          | Ensure `PLANET_API_KEY` set in Edge Functions |
| Folder upload fails       | Use Chrome/Edge, select folder with subfolders|
| No climate data           | Mock fallback active; check Open-Meteo API    |
| AOI fetch fails           | Verify `planet-aoi` function deployed         |
| Farm health score at 85%  | Default; run "Predict Risk" to calculate real |
| Advanced options hidden   | Click "🔧 Advanced Options" to expand         |
| Auto-prediction not work  | Ensure Planet map data is loaded first        |

---

## Recent Changes (Latest Commit)

### **Climate Risk UI Refinements**
- ✨ Single-button toggle for Climate Mode (Automatic/Manual)
  - Cleaner interface replacing two-button switch
  - Full-width button showing current mode with emoji indicator
  - 🤖 Automatic (Green): Map-focused, auto-filled from Planet API
  - ✏️ Manual (Blue): Form-focused, manual climate parameter entry

### **Disease Prevention Guide Integration**
- ✨ Replaced technical "matched factors" display with actionable prevention tips
- ✨ Added comprehensive prevention database for 9+ apple diseases:
  - Apple Scab, Apple Leaf Blotch, Powdery Mildew, Brown Rot
  - Bull's-eye Rot, Sooty Blotch, Flyspeck, Collar/Root Rot, Fireblight
- ✨ Each disease shows 2 main prevention strategies with count of additional tips
- ✨ Prevention tips include: fungicide timing, cultural practices, environmental management
- ✨ Removed ⚠️ warning popup from Standard (rule-based) model selector

### **Previous Phase: Dynamic Farm Health Scoring**
- ✨ Added climate-based health score calculation (0-100%)
- ✨ Integrated disease risk assessment into farm health metrics
- ✨ Implemented auto-prediction when Planet map data is loaded
- ✨ Added drill-down advanced options panel
- ✨ Improved UI with color-coded health status badges
- ✨ Added progress bar visualization for farm health trends
- ✨ Moved farm health score below action buttons for better UX

---

## Contributing

```bash
git checkout -b feature/your-feature-name
# Add enhancements, fix bugs, or improve documentation
git push origin feature/your-feature-name && create PR
```

### Development Guidelines
- Follow TypeScript strict mode
- Use Tailwind CSS for styling
- Test Planet API integration thoroughly
- Update README for new features
- Commit messages: `feat:`, `fix:`, `docs:`, `refactor:`

---

## License

MIT License – Issues and contributions welcome.

---

## Author

**Za.i.14**

### Contact
For more information, please contact Zai14 through his Socials:
 [![Instagram](https://img.shields.io/badge/Instagram-%23E4405F.svg?logo=Instagram&logoColor=white)](https://instagram.com/Za.i.14)  [![LinkedIn](https://img.shields.io/badge/LinkedIn-%230077B5.svg?logo=linkedin&logoColor=white)](https://linkedin.com/in/zai14)  [![X](https://img.shields.io/badge/X-black.svg?logo=X&logoColor=white)](https://x.com/Za_i14)  [![YouTube](https://img.shields.io/badge/YouTube-%23FF0000.svg?logo=YouTube&logoColor=white)](https://youtube.com/@Za.i.14)  [![email](https://img.shields.io/badge/Email-D14836?logo=gmail&logoColor=white)](mailto:ZaidShabir67@gmail.com)

*Built with ❤️ for the Crop Community using React + TypeScript + Tailwind + Supabase + Planet APIs.*

---

## 🗺️ Roadmap

### 🚧 Phase 2 (Upcoming)
- [ ] Historical trend analysis dashboard
- [ ] Multi-field farm management
- [ ] Mobile app (React Native)
- [ ] Notification / alert system for critical risks
- [ ] Integrated treatment recommendation engine
- [ ] Weather forecast integration (7-day ahead)
- [ ] Export reports (PDF / CSV)

### 🔮 Phase 3 (Future)
- [ ] Farmer community forum
- [ ] Marketplace for treatments
- [ ] Integration with smart farm equipment
- [ ] Blockchain-based supply chain tracking