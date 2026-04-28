# Fake LinkedIn Post Machine

A parody LinkedIn post generator built with React and TypeScript, integrated into the portfolio site.

## Features

- **Minimal input**: Provide basic info and get maximally exaggerated LinkedIn posts
- **Legendary mode**: "obviously fake and intentionally funny" tone option
- **Live generation**: Posts are generated in real-time using DeepSeek LLM API
- **One-click presets**: Quick-start buttons for various absurd personas

## Access

The generator is available at:
- **URL**: `https://runling.online/linkedin-post`
- **Local dev**: `http://localhost:5173/linkedin-post`

## Setup

### 1. Environment Variables

Create a `.env` file in the project root with your DeepSeek API key:

```env
VITE_DEEPSEEK_API_KEY=your_api_key_here
```

An `.env.example` file is provided as a template. **Never commit `.env` to git** — it's already in `.gitignore`.

### 2. Installation & Running

```bash
npm install
npm run dev
```

Then navigate to `http://localhost:5173/linkedin-post` in your browser.

## Architecture

### Components

- **LinkedInPostGenerator.tsx** - Main React component with form logic and API integration
- **linkedin-post.css** - Standalone styles with responsive design
- **Router.tsx** - Simple client-side router for multi-page support

### Styling

The component uses CSS custom properties (variables) for consistent theming:
- Color palette: Blues (#1762d1), Greens (#15926f), Gold accents (#ffc957)
- Spacing system: 1.2rem - 2rem base units
- Responsive breakpoints: 1024px, 768px, 480px

### Key Improvements

✅ **Fixed layout** - Changed from cramped to spacious padding (40px panels, 32px gaps)  
✅ **Symmetric design** - Balanced 1fr 1fr grid with centered container  
✅ **Better spacing** - Consistent gap system and breathing room between elements  
✅ **API security** - API key moved to environment variables, never in source code  
✅ **Responsive** - Works beautifully on mobile, tablet, and desktop  
✅ **Playful interactions** - Smooth transitions and hover effects throughout

## Development

### Add More Presets

Edit the `PRESETS` object in `LinkedInPostGenerator.tsx`:

```tsx
const PRESETS = {
  yourName: {
    name: "Name",
    career: "Dream Title",
    stage: "student",
    tone: "legendary",
    interest: "vague topic",
  },
  // ...
};
```

Then add a button in the JSX to call `applyPreset('yourName')`.

### Customize Styling

All theme variables are in the `:root` scope of `linkedin-post.css`. Modify them to match your brand:

```css
.linkedin-generator {
  --blue: #your-color;
  --green: #your-color;
  /* ... */
}
```

## API Integration

The generator uses DeepSeek's API for text generation:
- **Endpoint**: `https://api.deepseek.com/chat/completions`
- **Model**: `deepseek-chat`
- **Temperature**: 1.25 (creative/playful)
- **Max tokens**: 900

Ensure your `.env` key has sufficient quota for testing.

## Git Workflow

Only `.env.example` should be committed, never `.env`:

```bash
git add .env.example
git add src/LinkedInPostGenerator.tsx src/linkedin-post.css src/Router.tsx
# .env is automatically ignored
```

## Mobile Notes

The component is fully responsive and tested at:
- 480px (mobile)
- 768px (tablet)
- 1024px (medium desktop)
- 1280px+ (large desktop)

On mobile, the form and results stack vertically for better readability.
