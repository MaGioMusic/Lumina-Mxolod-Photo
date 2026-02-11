# Lumina Estate - AI Real Estate Platform

Lumina Estate is a modern real estate platform with AI-powered features including:
- **AI Photo Generation** (Fal.ai integration)
- **Virtual Staging** - Add furniture to empty rooms
- **Image Editing** - Enhance and upscale property photos
- **AI Voice Assistant** - Talk to search properties
- **CRM System** - Manage clients and properties
- **Multi-language Support** - Georgian, English, Russian

## 🚀 Quick Start (for Cursor IDE)

### 1. Clone Repository
```bash
git clone https://github.com/MaGioMusic/Lumina-Version-1.git
cd Lumina-Version-1
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables
Create `.env.local` file:
```env
# Database (Supabase)
DATABASE_URL="postgresql://postgres:UniversalMusic_123@db.kyzpryqtorofjodfncgh.supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:UniversalMusic_123@db.kyzpryqtorofjodfncgh.supabase.co:5432/postgres"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://kyzpryqtorofjodfncgh.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="AIzaSyAUsNF-QKfS0I5XnkawC4dqcZO4-67-Yh8"

# OpenAI (optional - for voice features)
OPENAI_API_KEY="your-openai-key"

# Gemini / GCP (for voice features)
GEMINI_API_KEY="AIzaSyBF0tlozRwbeY9dmGhiUnlwg7VdkytGwK4"
GCP_PROJECT_ID="gen-lang-client-0216641365"
GCP_REGION="us-central1"

# Fal.ai (for AI photo generation)
FAL_AI_API_KEY="da990ede-08ed-47b1-bf4d-73c452e8c11a:255a04e3b3894df174bddff32380e72a"
```

### 4. Run Development Server
```bash
npm run dev
```

Open http://localhost:3000

### 5. Database (if needed)
```bash
npx prisma db push
npx prisma generate
```

## 🎨 Features

### AI Photo Generation
- Generate property images from text prompts
- Virtual staging for empty rooms
- Image upscaling and enhancement
- Background removal

### Dashboard
- Agent CRM
- Property management
- Client management
- Analytics

### Public Site
- Property listings with filters
- Interactive maps
- Agent directory
- Favorites and compare

## 🛠️ Tech Stack

- **Framework:** Next.js 15 + React 19
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **UI Components:** shadcn/ui
- **Database:** PostgreSQL (Supabase)
- **ORM:** Prisma
- **Auth:** NextAuth.js
- **AI:** Fal.ai, OpenAI, Google Gemini

## 📦 API Routes

### Images (AI)
- `POST /api/images/generate` - Generate AI images
- `POST /api/images/edit` - Edit existing images
- `POST /api/images/upscale` - Upscale images
- `POST /api/images/virtual-staging` - Virtual staging

### Properties
- `GET /api/properties` - List properties
- `POST /api/properties` - Create property
- `GET /api/properties/[id]` - Get single property

### Auth
- `POST /api/auth/register` - Register new user
- Default NextAuth endpoints

## 🔧 Troubleshooting

### Build Errors
```bash
# Clear cache
rm -rf .next
rm -rf node_modules
npm install
npm run build
```

### Database Connection
- Check Supabase project is active
- Verify connection string is correct
- Check firewall rules allow your IP

### Type Errors
Project uses `strict: false` in tsconfig.json for faster development.

## 📝 Important Notes

1. **Database is already set up** - Schema pushed to Supabase
2. **Fal.ai key needed for AI features** - Get from https://fal.ai
3. **Type checking relaxed** - For development speed
4. **ESLint disabled during build** - To avoid blocking

## 🌐 Deployment (Vercel)

1. Push to GitHub
2. Connect repo to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

## 📞 Support

For issues or questions, check:
- Next.js docs: https://nextjs.org/docs
- Prisma docs: https://prisma.io/docs
- Supabase docs: https://supabase.com/docs
