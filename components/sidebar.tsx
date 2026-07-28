"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

type SidebarProps = {
  activePage?: string;
};

const navItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Jobs", href: "/jobs" },
  { label: "Work Reports", href: "/reports" },
  { label: "Create EWR", href: "/create-ewr" },
  { label: "Rate Guide", href: "/rate-guide" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex min-h-screen w-64 flex-col border-r-4 border-park-green bg-white">
      <div className="flex justify-center px-5 py-5">
        <Image
          src="/images/ppl-logo.png"
          alt="Park Paving"
          width={160}
          height={90}
          priority
        />
      </div>
      <nav className="flex  flex-col ">
        {navItems.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === item.href
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
    group relative overflow-hidden px-6 py-6 text-center text-2xl font-bold
    transition-colors duration-400
    ${
      isActive ? "bg-park-green text-white" : "text-park-green hover:text-white"
    }
  `}
            >
              {!isActive && (
                <span
                  className="
        absolute inset-0 -translate-x-full bg-park-green
        transition-transform duration-400 ease-out
        group-hover:translate-x-0
      "
                />
              )}

              <span className="relative z-10">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto px-4 pb-5">
        <div className="flex flex-col items-center">
          <div className="mb-1 flex h-10 w-10 items-end justify-center">
            <div className="relative">
              <a href="/profile">
                <div className="mx-auto h-4 w-4 rounded-full bg-park-green" />
                <div className="mt-1 h-5 w-8 rounded-t-full bg-park-green" />
              </a>
            </div>
          </div>

          <div className="text-center text-lg font-bold">
            <span>Shafin Rezwan</span>
            <span className="mx-1 text-gray-500">|</span>
            <a href="/logout">
              <button type="button" className="text-red-600 hover:underline">
                Logout
              </button>
            </a>
          </div>
        </div>
      </div>
    </aside>
  );
}
