# Third-Party Integration Guide

---

## Firebase Auth

### Server-Side (Admin SDK)

**Init:**
```typescript
// server/src/config/firebase.ts
import admin from 'firebase-admin';

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }),
});

export const firebaseAuth = admin.auth();
```

**Verify Token Middleware:**
```typescript
// server/src/middlewares/auth.ts
export const verifyFirebaseToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) throw new AppError('No token provided', 401);

    const decoded = await firebaseAuth.verifyIdToken(token);
    const user = await User.findOne({ firebaseUid: decoded.uid });
    if (!user) throw new AppError('User not found', 404);

    req.user = user;
    next();
  } catch (error) {
    if (error.code === 'auth/id-token-expired') {
      throw new AppError('Token expired', 401, 'TOKEN_EXPIRED');
    }
    throw new AppError('Invalid token', 401, 'INVALID_TOKEN');
  }
};
```

**Error Codes:**
| Code | Meaning | Action |
|---|---|---|
| `auth/id-token-expired` | Token expired | Client should refresh |
| `auth/id-token-revoked` | Token revoked | Force re-login |
| `auth/user-disabled` | Account disabled | Show error message |
| `auth/user-not-found` | Firebase user doesn't exist | Create new user |

### Client-Side (Firebase SDK)

```typescript
// client/src/lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword } from 'firebase/auth';

const app = initializeApp({
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
});

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Google Sign-In
export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);

// Get ID Token (for API calls)
export const getIdToken = () => auth.currentUser?.getIdToken();
```

---

## PayOS

### Create Payment Link
```typescript
// server/src/services/PaymentService.ts
import PayOS from '@payos/node';

const payos = new PayOS(
  process.env.PAYOS_CLIENT_ID,
  process.env.PAYOS_API_KEY,
  process.env.PAYOS_CHECKSUM_KEY
);

export const createPaymentLink = async (order: IOrder, course: ICourse) => {
  const paymentData = {
    orderCode: Number(order._id.toString().slice(-8)),  // Unique numeric code
    amount: order.amount,
    description: `Mua khoa hoc: ${course.title}`.slice(0, 25),
    returnUrl: process.env.PAYOS_RETURN_URL,
    cancelUrl: process.env.PAYOS_CANCEL_URL,
    items: [{
      name: course.title.slice(0, 25),
      quantity: 1,
      price: order.amount,
    }],
  };

  const paymentLink = await payos.createPaymentLink(paymentData);
  return paymentLink.checkoutUrl;
};
```

### Webhook Handler
```typescript
// server/src/controllers/PaymentController.ts
export const handleWebhook = async (req, res) => {
  const webhookData = payos.verifyPaymentWebhookData(req.body);

  // Idempotency check
  const order = await Order.findOne({ payosOrderId: webhookData.orderCode });
  if (!order || order.status === 'completed') {
    return res.json({ success: true }); // Already processed
  }

  if (webhookData.code === '00') { // Success
    order.status = 'completed';
    order.payosTransactionId = webhookData.transactionId;
    await order.save();

    // Unlock course
    await User.findByIdAndUpdate(order.userId, {
      $addToSet: { purchasedCourses: order.courseId }
    });

    // Send confirmation email
    await EmailService.sendPurchaseConfirmation(order);
  } else {
    order.status = 'failed';
    await order.save();
  }

  res.json({ success: true });
};
```

**Test Mode:** Use PayOS sandbox credentials. Test card: see PayOS docs.

---

## Resend (Email)

### Setup
```typescript
// server/src/services/EmailService.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export class EmailService {
  static async sendWelcomeEmail(user: IUser) {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL,
      to: user.email,
      subject: 'Chào mừng bạn đến với Sudemy!',
      html: welcomeEmailTemplate(user),
    });
  }

  static async sendPurchaseConfirmation(order: IOrder) {
    const user = await User.findById(order.userId);
    const course = await Course.findById(order.courseId);
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL,
      to: user.email,
      subject: `Xác nhận thanh toán - ${course.title}`,
      html: purchaseEmailTemplate(user, course, order),
    });
  }
}
```

**Error Handling:** Wrap in try/catch, log failures, never block the main flow.

**Free Tier Limits:** 3,000 emails/month, 100/day. Use `onboarding@resend.dev` for testing.

---

## YouTube Embed

### URL Parsing
```typescript
// server/src/utils/youtube.ts
export const extractYoutubeId = (url: string): string | null => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};
```

### Embed Component
```tsx
// client/src/components/shared/VideoPlayer.tsx
export const VideoPlayer = ({ youtubeUrl }: { youtubeUrl: string }) => {
  const videoId = extractYoutubeId(youtubeUrl);
  return (
    <div className="aspect-video w-full rounded-lg overflow-hidden">
      <iframe
        src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="w-full h-full"
      />
    </div>
  );
};
```

---

## Google Analytics 4

### Init Script
```typescript
// client/src/lib/analytics.ts
export const initGA = () => {
  const script = document.createElement('script');
  script.src = `https://www.googletagmanager.com/gtag/js?id=${import.meta.env.VITE_GA_MEASUREMENT_ID}`;
  script.async = true;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function() { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', import.meta.env.VITE_GA_MEASUREMENT_ID);
};
```

### Custom Events
```typescript
export const trackEvent = (name: string, params?: Record<string, any>) => {
  window.gtag?.('event', name, params);
};

// Usage examples:
trackEvent('course_purchase', { courseId, amount, couponUsed: !!couponCode });
trackEvent('prompt_copy', { promptId, promptTitle });
trackEvent('lesson_complete', { courseId, lessonId, quizScore });
trackEvent('registration', { method: 'google' | 'email' });
```
