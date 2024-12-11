"use client"; // Mark this file as a Client Component
// app/auth/sign-in/page.tsx
import { SignIn, useAuth } from '@clerk/nextjs';
import { useEffect } from 'react';
import axios from 'axios';

export default function Page() {
  const { isSignedIn } = useAuth();

  useEffect(() => {
    if (isSignedIn ) {
      const user = useAuth();
      // Determine clerkId as email or phone number
      // const clerkId = user?.emailAddresses?.[0]?.emailAddress || user?.phoneNumbers?.[0]?.phoneNumber;

      // Save user settings on first sign-in
      axios.post('/api/user-settings', {
        // userId: clerkId, // Use the email or phone number as userId
        // email: user.emailAddresses[0]?.emailAddress,
        // phone: user.phoneNumbers[0]?.phoneNumber,
      });
    }
    
  }, [isSignedIn]);

  return <SignIn />;
}
