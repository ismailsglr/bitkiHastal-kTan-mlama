# AI-Powered Plant Disease Detection

A modern Next.js 14+ web application for detecting plant diseases using AI technology. Upload a photo of a plant leaf and get instant diagnosis with treatment recommendations.

## Features

- 🍃 **AI-Powered Analysis**: Upload plant leaf images for instant disease detection
- 📊 **Detailed Results**: Get disease name, confidence score, treatment recommendations, and preventive advice
- 📝 **Analysis History**: Save and view your analysis history (requires Supabase authentication)
- 🎨 **Modern UI**: Clean, green-themed design with Tailwind CSS
- 📱 **Responsive**: Mobile-first design that works on all devices

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Backend**: n8n Webhooks
- **Database & Auth**: Supabase

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase project (for authentication and history)
- An n8n webhook URL (optional - mock data will be used if not provided)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd bitkiHastalıklarıTanıma
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` and add your configuration:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_N8N_WEBHOOK_URL=your_n8n_webhook_url
```

4. Set up Supabase:

**Important:** For development, you may want to disable email confirmation in Supabase:
- Go to your Supabase project dashboard
- Navigate to Authentication > Settings
- Under "Email Auth", disable "Enable email confirmations" (for development only)

Create a table named `analyses` in your Supabase project with the following schema:

```sql
CREATE TABLE analyses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  image_url TEXT,
  disease_name TEXT NOT NULL,
  confidence_score DECIMAL NOT NULL,
  treatment_recommendations TEXT[] NOT NULL,
  preventive_advice TEXT[] NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Landing page
│   ├── history/
│   │   └── page.tsx        # History page
│   └── globals.css         # Global styles
├── components/
│   ├── Navbar.tsx          # Navigation bar
│   ├── Footer.tsx          # Footer component
│   ├── ImageUpload.tsx     # Image upload component
│   └── AnalysisResult.tsx  # Analysis results display
├── lib/
│   ├── supabase/
│   │   ├── client.ts       # Supabase client
│   │   └── analyses.ts     # Analysis database functions
│   └── api/
│       └── analysis.ts     # n8n webhook integration
├── types/
│   └── index.ts            # TypeScript types
└── package.json
```

## Usage

1. **Upload an Image**: Drag and drop or click to upload a plant leaf image
2. **Analyze**: Click the "Analyze Plant Disease" button
3. **View Results**: See the disease diagnosis, confidence score, and recommendations
4. **View History**: Check your analysis history (requires authentication)

## Mock Data

If the `NEXT_PUBLIC_N8N_WEBHOOK_URL` environment variable is not set, the application will use mock data for testing purposes. This allows you to develop and test the UI without a live n8n webhook.

## Environment Variables

- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `NEXT_PUBLIC_N8N_WEBHOOK_URL`: Your n8n webhook URL (optional)

## License

MIT

