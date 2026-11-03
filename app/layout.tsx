import "./globals.css";
import Link from "next/link";
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="en"><body className="bg-slate-50 text-slate-800">
    <nav className="bg-sky-900 text-white px-6 py-3 flex gap-6"><b>COLDCHAIN SENTINEL</b>
      <Link href="/">Dashboard</Link><Link href="/alerts">Alerts &amp; Inspections</Link></nav>
    <main className="p-6 max-w-5xl mx-auto">{children}</main></body></html>);
}
