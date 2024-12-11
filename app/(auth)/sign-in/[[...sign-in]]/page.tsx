"use client"; // Mark this file as a Client Component
// app/auth/sign-in/page.tsx
import { SignIn, useAuth } from '@clerk/nextjs';
import { useEffect } from 'react';
import axios from 'axios';
import { currentUser } from "@clerk/nextjs";

export default function Page() {
  const { isSignedIn, userId } = useAuth();

  useEffect(() => {
    if (isSignedIn ) {
      // Save user settings on first sign-in
      axios.post('/api/user-settings', {
      });
    }
  }, [isSignedIn, userId]);

  return <SignIn />;
}
