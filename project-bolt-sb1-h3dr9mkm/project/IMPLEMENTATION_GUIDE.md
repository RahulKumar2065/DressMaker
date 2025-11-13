# DressMaker Platform - Implementation Guide

## Overview

DressMaker is a comprehensive full-stack web platform connecting customers with tailors. The platform includes customer dashboards, tailor management, virtual try-on, real-time chat, payment processing, and order tracking.

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **React Router DOM** for navigation
- **Zustand** for state management
- **Three.js & React Three Fiber** for 3D visualization
- **Lucide React** for icons

### Backend
- **Supabase** for database and authentication
- **PostgreSQL** for data persistence
- **Row Level Security (RLS)** for access control
- **Supabase Realtime** for real-time features
- **Supabase Storage** for file uploads

### Third-Party Integrations
- **Razorpay** for payment processing
- **Google Maps API** for delivery tracking

## Project Structure

```
src/
├── components/
│   ├── Navbar.tsx
│   └── ProtectedRoute.tsx
├── pages/
│   ├── Landing.tsx
│   ├── Chat.tsx
│   ├── auth/
│   │   ├── Login.tsx
│   │   └── Register.tsx
│   ├── customer/
│   │   ├── Dashboard.tsx
│   │   ├── TailorDetail.tsx
│   │   ├── VirtualTryOn.tsx
│   │   ├── Measurements.tsx
│   │   └── OrderDetail.tsx
│   ├── tailor/
│   │   └── Dashboard.tsx
│   └── admin/
│       └── Dashboard.tsx
├── services/
│   ├── supabase.ts
│   ├── auth.ts
│   ├── payment.ts
│   ├── orders.ts
│   ├── chat.ts
│   ├── tracking.ts
│   └── disputes.ts
├── store/
│   └── auth.ts
├── types/
│   └── index.ts
├── App.tsx
└── main.tsx
```

## Database Schema

### Core Tables

1. **customer_profiles** - Customer information and preferences
2. **tailor_profiles** - Tailor professional details and ratings
3. **admin_profiles** - Admin user accounts
4. **measurements** - Virtual measurement records
5. **design_models** - 3D garment designs for virtual try-on
6. **design_inspirations** - Customer-saved design references
7. **orders** - Tailoring orders
8. **order_items** - Individual items in orders
9. **order_status_history** - Order status change audit trail
10. **conversations** - Chat conversations
11. **messages** - Individual chat messages
12. **payments** - Payment transactions
13. **refunds** - Refund records
14. **disputes** - Customer-tailor disputes
15. **dispute_messages** - Messages within dispute resolution
16. **delivery_tracking** - Real-time delivery location updates
17. **tailor_reviews** - Customer reviews for tailors
18. **order_reviews** - Order-specific feedback

All tables have Row Level Security (RLS) policies enabled.

## Key Features

### 1. Authentication
- Email/password registration and login
- Role-based access control (Customer, Tailor, Admin)
- Automatic profile creation upon signup
- Protected routes with role verification

### 2. Customer Features
- **Dashboard**: Browse featured tailors, view order summary
- **Tailor Discovery**: Search and filter tailors by location, rating, specialization
- **Virtual Try-On**: WebGL-based 3D garment visualization with webcam integration
- **Measurements**: Store multiple measurement profiles for personalized fitting
- **Order Management**: Place orders, track status, manage payments
- **Chat**: Real-time communication with tailors
- **Delivery Tracking**: Real-time GPS tracking with Google Maps integration

### 3. Tailor Features
- **Dashboard**: Order queue, earnings summary, customer management
- **Order Management**: Accept/reject orders, update status
- **Profile Management**: Edit business details, specializations, ratings
- **Finance Dashboard**: Track earnings and payment history
- **Chat**: Communicate with customers in real-time
- **Delivery Updates**: Update delivery location and status

### 4. Admin Features
- **Dashboard**: Platform analytics and system status
- **User Management**: View and manage all customers and tailors
- **Order Oversight**: Monitor all platform transactions
- **Dispute Resolution**: Manage and resolve customer-tailor conflicts
- **System Configuration**: Platform settings and permissions

## Setup Instructions

### Prerequisites
- Node.js 16+ and npm
- Supabase account
- Razorpay account (for payments)
- Google Maps API key

### 1. Install Dependencies
```bash
npm install
npm install --legacy-peer-deps  # If dependency conflicts occur
```

### 2. Environment Configuration
Create `.env` file with:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_RAZORPAY_KEY_ID=your_razorpay_key
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key
```

### 3. Database Setup
The database schema is created via migrations in Supabase. All migrations have been applied:
- `001_create_core_users_tables` - User profiles
- `002_create_measurements_designs_tables` - Measurements and designs
- `003_create_orders_table` - Orders and order management
- `004_create_chat_system_tables` - Real-time messaging
- `005_create_payments_transactions_tables` - Payment processing
- `006_create_disputes_and_tracking_tables` - Disputes and delivery tracking
- `007_create_ratings_and_reviews_tables` - Reviews and ratings

### 4. Start Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### 5. Build for Production
```bash
npm run build
```

## Usage Guide

### User Registration
1. Navigate to landing page
2. Click "Get Started" or "Register as Tailor"
3. Fill in the registration form with your role
4. Confirm registration via email
5. Redirect to role-specific dashboard

### Customer Workflow
1. **Browse Tailors**: Dashboard shows featured tailors
2. **Search & Filter**: Use search to find tailors by location or specialty
3. **View Tailor Profile**: See ratings, experience, specializations
4. **Add Measurements**: Create measurement profile for accurate fitting
5. **Try On Designs**: Use virtual try-on feature with webcam
6. **Place Order**: Select tailor, items, delivery address, make payment
7. **Track Status**: Monitor order progress from dashboard
8. **Chat with Tailor**: Real-time communication during production
9. **Track Delivery**: View live GPS location of order
10. **Leave Review**: Rate and review tailor after delivery

### Tailor Workflow
1. **View Orders**: Dashboard shows pending and active orders
2. **Accept/Reject**: Respond to customer orders with pricing
3. **Update Status**: Move order through production stages
4. **Chat with Customer**: Clarify requirements and updates
5. **Track Earnings**: Monitor payments and earnings dashboard
6. **Update Delivery**: Add location and status updates as order ships

### Admin Workflow
1. **Monitor Platform**: View system status and analytics
2. **User Management**: Manage accounts, verify tailors
3. **Oversee Orders**: Monitor transactions and order flow
4. **Resolve Disputes**: Review and resolve conflicts between parties

## Real-Time Features

### Chat System
- Real-time message delivery via Supabase Realtime
- Automatic subscription to new messages in a conversation
- Message read/unread status tracking
- File attachment support (images, documents)

### Delivery Tracking
- Real-time location updates from tailor
- GPS coordinates stored in database
- Live map view for customers
- Delivery status notifications

## Payment Processing

### Razorpay Integration
1. Initialize Razorpay SDK on page load
2. Create payment record in database
3. Open Razorpay checkout with order details
4. Handle payment callback
5. Update order status upon successful payment
6. Store payment ID for reconciliation

### Refund Processing
- Admin can initiate refunds from order details
- Razorpay API handles refund processing
- Refund status tracked in database
- Customer notified of refund

## Security Features

### Row Level Security (RLS)
- All tables protected with RLS policies
- Users can only access their own data
- Admins have elevated access
- Role-based access control enforced

### Authentication
- Supabase Auth handles user sessions
- JWT tokens for API requests
- Automatic session refresh
- Secure logout functionality

### Data Protection
- HTTPS encryption for all data in transit
- Sensitive data encrypted at rest
- File uploads secured with access policies
- PII protected according to GDPR standards

## Performance Optimization

### Frontend
- Code splitting with React Router
- Lazy loading of components
- Image optimization with CDN
- CSS minification with Tailwind

### Backend
- Database indexes on frequently queried columns
- Connection pooling via Supabase
- Query optimization with select() statements
- Pagination for large datasets

## Deployment

### Vercel (Recommended)
1. Connect GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy on push to main branch
4. Automatic CI/CD pipeline

### Manual Deployment
```bash
npm run build
# Deploy dist/ folder to hosting service
```

## API Endpoints

All API calls go through Supabase:
- Authentication: `supabase.auth.*`
- Database: `supabase.from(table).select().eq()`
- Real-time: `supabase.channel().on().subscribe()`
- Storage: `supabase.storage.from(bucket).download()`

## Troubleshooting

### Common Issues

1. **Authentication Error**: Verify Supabase credentials in .env
2. **Database Connection**: Check Supabase project is active
3. **Payment Failed**: Verify Razorpay keys are correct
4. **Map Not Loading**: Check Google Maps API key and quotas
5. **Real-time Not Working**: Verify Supabase Realtime is enabled

### Debugging
- Check browser console for errors
- Monitor Supabase dashboard for database errors
- Review payment logs in Razorpay dashboard
- Check Vercel deployment logs

## Future Enhancements

1. **Advanced 3D Visualization**: Full-body AR with pose detection
2. **AI Recommendations**: Smart tailor recommendations based on preferences
3. **Mobile App**: Native iOS/Android applications
4. **Inventory Management**: Fabric and material inventory for tailors
5. **Advanced Analytics**: Customer behavior and trend analysis
6. **Video Consultations**: Built-in video calling for consultations
7. **Multi-language Support**: Internationalization (i18n)
8. **Blockchain Integration**: Secure order verification and dispute resolution

## Support & Contact

For issues or questions:
- Review database migrations for schema details
- Check Supabase logs for errors
- Verify all environment variables are set
- Contact development team for assistance

## License

Proprietary - DressMaker Platform
