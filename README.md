# Faculty Performance Evaluation System

A modern, production-ready web application for managing faculty performance evaluations at Zamboanga Peninsula Polytechnic State University.

## 🎯 Features

- **Role-Based Dashboards**: Separate interfaces for Zonal Admin, QCE Manager, Faculty, and Students
- **Evaluation Management**: Track and manage faculty evaluations with real-time progress
- **College Management**: Manage colleges, programs, and faculty members
- **Analytics & Reporting**: View statistics and generate evaluation reports
- **Responsive Design**: Fully responsive UI that works on desktop, tablet, and mobile devices
- **Modern UI/UX**: Clean, professional interface with maroon and white color scheme

## 🛠️ Tech Stack

- **Frontend Framework**: React 19.2.0
- **Build Tool**: Vite 7.2.4
- **Routing**: React Router DOM 6.x
- **Styling**: CSS Modules (Modular, scoped CSS)
- **Icons**: Lucide React
- **Utilities**: clsx for class name merging

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components (organized by component)
│   ├── Button/
│   │   ├── Button.jsx
│   │   └── Button.module.css
│   ├── Input/
│   ├── Card/
│   ├── StatCard/
│   ├── Badge/
│   ├── Table/
│   ├── Header/
│   ├── Sidebar/
│   ├── DashboardLayout/
│   └── ProgressBar/
│
├── pages/              # Page components (organized by page)
│   ├── LoginPage/
│   │   ├── LoginPage.jsx
│   │   └── LoginPage.module.css
│   ├── ZonalDashboardPage/
│   └── QCEDashboardPage/
│
├── styles/             # Global styles
│   ├── variables.css   # CSS custom properties (design system)
│   └── globals.css     # Global resets and base styles
│
├── utils/              # Utility functions
│   ├── cn.js          # Class name utility
│   ├── constants.js   # App constants
│   └── helpers.js     # Helper functions
│
├── App.jsx            # Main app component with routing
└── main.jsx           # Entry point
```

### Folder Structure Philosophy

**✅ Organized by Component/Page**: Each component and page has its own folder containing:
- 1 JSX file (component logic)
- 1 CSS Module file (scoped styles)

**Benefits**:
- Easy to find files (alphabetically sorted)
- Clear separation of concerns
- Scoped CSS prevents style conflicts
- Simple imports: `import { Button } from '@/components/Button/Button'`
- Scalable to 100+ components without complexity

## 🎨 Design System

### Color Palette

```css
--color-primary: #800000;           /* Maroon */
--color-accent: #D4AF37;            /* Gold */
--color-background: #F5F5F5;        /* Light Gray */
--color-success: #10B981;           /* Green */
--color-warning: #F59E0B;           /* Orange */
--color-error: #EF4444;             /* Red */
```

### Typography

- **Font Family**: Inter (Google Fonts)
- **Font Sizes**: 12px - 36px (using CSS custom properties)
- **Font Weights**: 300, 400, 500, 600, 700

### Spacing

- Uses consistent spacing scale: 4px, 8px, 16px, 24px, 32px, 48px, 64px
- Defined as CSS custom properties for consistency

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. **Clone the repository** (if applicable):
   ```bash
   git clone <repository-url>
   cd Faculty-Performance-Evaluation-System
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser**:
   Navigate to `http://localhost:3000`

### Build for Production

```bash
npm run build
```

The production-ready files will be in the `dist/` folder.

### Preview Production Build

```bash
npm run preview
```

## 📱 Responsive Breakpoints

- **Mobile**: 320px - 767px
- **Tablet**: 768px - 1023px
- **Desktop**: 1024px+

## 🧩 Component Usage

### Button

```jsx
import { Button } from '@/components/Button/Button';

<Button variant="primary" size="default">
  Click Me
</Button>
```

**Variants**: `primary`, `secondary`, `outline`, `ghost`, `danger`
**Sizes**: `small`, `default`, `large`

### Input

```jsx
import { Input } from '@/components/Input/Input';
import { User } from 'lucide-react';

<Input
  label="Username"
  placeholder="Enter username"
  icon={User}
  error="This field is required"
/>
```

### StatCard

```jsx
import { StatCard } from '@/components/StatCard/StatCard';
import { Users } from 'lucide-react';

<StatCard
  title="Total Users"
  value={1234}
  subtitle="Active users"
  trendValue="+12%"
  icon={Users}
/>
```

### Table

```jsx
import { Table } from '@/components/Table/Table';
import { Badge } from '@/components/Badge/Badge';

const columns = [
  { header: 'Name', accessor: 'name', width: '40%' },
  { 
    header: 'Status', 
    accessor: 'status',
    render: (value) => <Badge variant="success">{value}</Badge>
  },
];

const data = [
  { name: 'John Doe', status: 'Active' },
  { name: 'Jane Smith', status: 'Active' },
];

<Table columns={columns} data={data} />
```

## 🔐 Authentication

Currently uses mock authentication. To implement real authentication:

1. Update `LoginPage.jsx` to call your API
2. Store auth token in localStorage or context
3. Add protected route wrapper
4. Implement logout functionality

## 🗺️ Routes

- `/` - Redirects to login
- `/login` - Login page
- `/zonal/dashboard` - Zonal Admin dashboard
- `/qce/dashboard` - QCE Manager dashboard

## 🎯 User Roles

1. **Zonal Admin**: Manages colleges, QCE accounts, programs, and system settings
2. **QCE Manager**: Manages faculty, programs, and evaluations
3. **Faculty**: Views evaluations and reports
4. **Student**: Participates in faculty evaluations

## 📝 Development Guidelines

### Adding a New Component

1. Create a new folder in `src/components/ComponentName/`
2. Create `ComponentName.jsx` and `ComponentName.module.css`
3. Use CSS custom properties from `variables.css`
4. Export component from `ComponentName.jsx`

### Adding a New Page

1. Create a new folder in `src/pages/PageName/`
2. Create `PageName.jsx` and `PageName.module.css`
3. Add route in `App.jsx`
4. Use `DashboardLayout` if it's a dashboard page

### Styling Best Practices

- ✅ Use CSS Modules for component-specific styles
- ✅ Use CSS custom properties from `variables.css`
- ✅ Follow mobile-first responsive design
- ✅ Use semantic HTML elements
- ✅ Ensure accessibility (ARIA labels, keyboard navigation)

## 🐛 Troubleshooting

### Styles not applying

- Ensure CSS Module file is imported correctly
- Check that class names use camelCase in JSX
- Verify CSS custom properties are defined in `variables.css`

### Routes not working

- Check that React Router is properly configured in `App.jsx`
- Ensure `BrowserRouter` wraps all routes
- Verify route paths match navigation links

## 📄 License

© 2024 Zamboanga Peninsula Polytechnic State University

## 👥 Contributors

- Development Team

---

**Built with ❤️ using React + Vite + CSS Modules**
