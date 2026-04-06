"use client";

import { redirect, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check for tokens on client side
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    const userStr = localStorage.getItem('user');
    
    // Parse user data if exists
    let user = null;
    if (userStr) {
      try {
        user = JSON.parse(userStr);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }

    // Check if tokens exist and are not expired
    if (accessToken && refreshToken && user) {
      console.log('Tokens found:', { accessToken, refreshToken, user });
      
      // Parse JWT token to get expiry
      try {
        const tokenPayload = JSON.parse(atob(accessToken.split('.')[1]));
        const tokenExpiry = tokenPayload.exp * 1000; // Convert to milliseconds
        const now = Date.now();
        
        console.log('Token expiry check:', { 
          tokenExpiry: new Date(tokenExpiry), 
          now: new Date(now), 
          isValid: now < tokenExpiry 
        });
        
        if (now < tokenExpiry) {
          // Token is valid, redirect to dashboard
          router.push('/dashboard');
        } else {
          // Token is expired, redirect to login
          console.log('Token expired, redirecting to login');
          router.push('/auth/login');
        }
      } catch (error) {
        console.error('Error parsing JWT token:', error);
        // If we can't parse the token, redirect to login
        router.push('/auth/login');
      }
    } else {
      // No tokens found, redirect to login
      console.log('No tokens found, redirecting to login');
      router.push('/auth/login');
    }
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </main>
    </div>
  );
}
