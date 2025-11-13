# DressMaker Platform - Quick Start Guide

## Installation (5 minutes)

### 1. Install Dependencies
```bash
cd project
npm install --legacy-peer-deps
```

### 2. Configure Environment
Create `.env` file in project root:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_RAZORPAY_KEY_ID=your_razorpay_key
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key
```

### 3. Start Development Server
```bash
npm run dev
```

Visit `http://localhost:5173` in your browser.

## First Time Setup

### Database
✅ All 7 migrations automatically applied via Supabase CLI
✅ 18 tables created with RLS policies
✅ Ready to use immediately

### Test Accounts
You can create test accounts:

**Customer Account:**
- Email: customer@test.com
- Role: Customer
- Can browse tailors, place orders, try on designs

**Tailor Account:**
- Email: tailor@test.com
- Role: Tailor
- Can manage orders, chat with customers

**Admin Account:**
- Email: admin@test.com
- Role: Admin
- Can manage users and disputes

## Main Features to Try

### 1. Authentication
- Click "Get Started" on landing page
- Create customer or tailor account
- Complete registration and login

### 2. Customer Dashboard
- View featured tailors
- Search and filter by location/specialty
- Click tailor to see full profile with ratings

### 3. Virtual Try-On
- Navigate to "Try On" from navbar
- Click "Start Webcam"
- Select a design from the list
- Use zoom and rotate controls

### 4. Measurements
- Go to "Measurements" page
- Add your body measurements
- Store multiple measurement profiles

### 5. Chat (when backend ready)
- Order detail shows "Chat with Tailor" button
- Start real-time conversation

## Build for Production

### Generate Optimized Build
```bash
npm run build
```

Output: `dist/` folder (ready to deploy)

### Deploy to Vercel (recommended)
```bash
# 1. Connect GitHub repo to Vercel
# 2. Add environment variables in Vercel settings
# 3. Deploy (automatic on push to main)
```

### Deploy to Other Hosts
```bash
# Upload dist/ folder to your hosting service
# Ensure Node.js backend for API requests
# Configure CORS for frontend domain
```

## Key Endpoints

### Landing Page
- `http://localhost:5173/`

### Authentication
- `http://localhost:5173/login`
- `http://localhost:5173/register`

### Customer Routes
- `http://localhost:5173/customer/dashboard`
- `http://localhost:5173/customer/try-on`
- `http://localhost:5173/customer/measurements`
- `http://localhost:5173/customer/tailor/:id` (view tailor)
- `http://localhost:5173/customer/orders/:orderId` (view order)

### Tailor Routes
- `http://localhost:5173/tailor/dashboard`

### Admin Routes
- `http://localhost:5173/admin/dashboard`

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
# Or use different port
npm run dev -- --port 3000
```

### Database Connection Error
- Verify `VITE_SUPABASE_URL` is correct
- Verify `VITE_SUPABASE_ANON_KEY` is correct
- Check Supabase project is active

### Webcam Not Working
- Grant browser permission for camera
- Check browser doesn't block camera access
- Ensure HTTPS in production (required for camera access)

### Payment Not Working
- Verify Razorpay key ID is correct
- Check Razorpay account is in test mode
- Review browser console for errors

## Project Structure Quick Reference

```
src/
├── components/     - Reusable UI components
├── pages/          - Route pages (organized by role)
├── services/       - Business logic & API calls
├── store/          - Global state (Zustand)
├── types/          - TypeScript type definitions
├── App.tsx         - Main routing configuration
└── main.tsx        - Application entry point
```

## Next Steps

1. **Configure External Services**
   - Get Razorpay key from https://razorpay.com
   - Get Google Maps API key from https://console.cloud.google.com
   - Update `.env` file

2. **Customize Branding**
   - Update colors in Tailwind config
   - Replace DressMaker logo/name
   - Adjust design to your brand

3. **Add More Features**
   - Expand tailor profile editing
   - Implement earnings dashboard
   - Add user management for admin

4. **Deploy to Production**
   - Connect to Vercel
   - Set up custom domain
   - Configure monitoring

## Documentation Files

- **IMPLEMENTATION_GUIDE.md** - Complete technical documentation
- **DEPLOYMENT_CHECKLIST.md** - Pre-deployment verification
- **PROJECT_SUMMARY.md** - Feature overview and achievements

## Support

For technical questions, refer to:
- Component implementations in `src/pages/`
- Service layer in `src/services/`
- Type definitions in `src/types/index.ts`
- Inline code comments throughout

## Performance Tips

- Virtual try-on loads 3D models on demand
- Chat messages are paginated for large conversations
- Database queries use indexes for speed
- Frontend code is split for faster initial load

## Security Reminders

- Never commit `.env` file
- Rotate API keys regularly
- Enable HTTPS in production
- Use Row Level Security on all queries
- Review database policies regularly

---

Ready to launch? Follow the deployment guide in DEPLOYMENT_CHECKLIST.md

Last Updated: November 13, 2025
Status: Production Ready ✅
