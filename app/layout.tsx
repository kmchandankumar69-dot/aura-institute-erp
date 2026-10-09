import './globals.css'
import type { ReactNode } from 'react'

export const metadata={title:'Aura Institute of Technology',description:'Future-ready education, admissions, placements and academics.'}
export default function RootLayout({children}:{children:ReactNode}){return <html lang="en"><body>{children}</body></html>}
