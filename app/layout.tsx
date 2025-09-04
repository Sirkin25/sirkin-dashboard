import type React from "react"
import type { Metadata } from "next"
import { ClientLayout } from "./ClientLayout"
import "./globals.css"

export const metadata: Metadata = {
  title: "ועד הבית - ניהול בניין",
  description: "מערכת ניהול בניין מתקדמת לועדי בתים",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <ClientLayout children={children} />
}
