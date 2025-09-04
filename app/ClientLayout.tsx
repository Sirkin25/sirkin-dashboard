"use client"

import type React from "react"
import { Suspense } from "react"
import "./globals.css"

export function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="he" dir="rtl" className="antialiased">
      <body className="font-sans bg-gray-50">
        <Suspense fallback={
          <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        }>
          {children}
        </Suspense>
      </body>
    </html>
  )
}
