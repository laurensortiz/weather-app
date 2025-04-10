'use client';

import { AppBar, Toolbar, Typography, Box } from '@mui/material';
import { Inter } from 'next/font/google';
import './globals.css';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [userName, setUserName] = useState<string>('');

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (!response.ok) {
          router.push('/login');
          return;
        }
        const data = await response.json();
        setUserName(data.name || data.email);
      } catch (error) {
        router.push('/login');
      }
    };

    checkAuth();
  }, []);

  return (
    <html lang="en">
      <body className={inter.className}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Weather Outfit App
            </Typography>
            {userName && (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="body1" sx={{ mr: 2 }}>
                  Welcome, {userName}
                </Typography>
              </Box>
            )}
          </Toolbar>
        </AppBar>
        {children}
      </body>
    </html>
  );
}
