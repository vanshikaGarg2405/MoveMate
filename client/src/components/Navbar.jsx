
import { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  CarFront,
  LayoutDashboard,
  Search,
  CalendarCheck,
  LogOut,
  UserCircle,
  UserRound,
  Car,
  Handshake,
  Inbox,
  BriefcaseBusiness,
  Bell,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { getUnreadNotificationCount } from "../services/notificationService";
import { getSocket } from "../services/socketService";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [imageError, setImageError] = useState(false);

  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const fetchUnreadCount = async () => {
      try {
        const response = await getUnreadNotificationCount();

        if (isMounted && response.success) {
          setUnreadCount(response.unreadCount ?? response.count ?? 0);
        }
      } catch (error) {
        console.error("Unable to fetch unread notification count:", error);
      }
    };

    fetchUnreadCount();

    const intervalId = setInterval(fetchUnreadCount, 30000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  // Reset image error when profile photo changes.
  useEffect(() => {
    setImageError(false);
  }, [user?.profilePhoto]);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate("/login", { replace: true });
  };

  const navLinks = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Find a Ride",
      path: "/rides",
      icon: Search,
    },
    {
      name: "My Bookings",
      path: "/my-bookings",
      icon: CalendarCheck,
    },
    {
      name: "My Rides",
      path: "/my-rides",
      icon: Car,
    },
    {
      name: "My Exchanges",
      path: "/my-exchange-requests",
      icon: Handshake,
    },
    {
      name: "Received Requests",
      path: "/received-exchange-requests",
      icon: Inbox,
    },
    {
      name: "My Profile",
      path: "/profile",
      icon: UserRound,
    },
    {
      name: "My Services",
      path: "/my-services",
      icon: BriefcaseBusiness,
    },
  ];

  const linkClass = ({ isActive }) =>
    `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
      isActive
        ? "bg-emerald-50 text-emerald-700"
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
    }`;

  // Reusable profile image
  const ProfileAvatar = ({ size = "h-9 w-9" }) => (
    <div
      className={`${size} flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-100`}
    >
      {user?.profilePhoto && !imageError ? (
        <img
          src={user.profilePhoto}
          alt="Profile"
          className="h-full w-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <UserCircle className="text-slate-500" size={22} />
      )}
    </div>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white shadow-sm">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">

        {/* Brand */}
        <Link
          to="/dashboard"
          className="flex items-center gap-2"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white">
            <CarFront size={24} />
          </div>

          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
              Move<span className="text-emerald-600">Mate</span>
            </h1>

            <p className="text-[10px] font-medium text-slate-500">
              Travel together. Share smartly.
            </p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-2 md:flex">
          {navLinks.map((link) => {
            const Icon = link.icon;

            return (
              <NavLink
                key={link.path}
                to={link.path}
                className={linkClass}
              >
                <Icon size={17} />
                {link.name}
              </NavLink>
            );
          })}
        </div>

        {/* Desktop Notifications */}
        <NavLink
          to="/notifications"
          aria-label={`Notifications, ${unreadCount} unread`}
          title="Notifications"
          className={({ isActive }) =>
            `relative flex h-10 w-10 items-center justify-center rounded-lg transition ${
              isActive
                ? "bg-emerald-50 text-emerald-700"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`
          }
        >
          <Bell size={21} />

          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </NavLink>

        {/* Desktop User and Logout */}
        <div className="hidden items-center gap-3 md:flex">
          <div className="flex items-center gap-2">
            <ProfileAvatar size="h-9 w-9" />

            <div className="max-w-36">
              <p className="truncate text-sm font-semibold text-slate-800">
                {user?.name || "MoveMate User"}
              </p>

              <p className="text-xs text-slate-500">
                Community member
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>

        {/* Mobile Profile Avatar and Menu Button */}
        <div className="flex items-center gap-3 md:hidden">
          {/* Mobile Notifications */}
          <NavLink
            to="/notifications"
            onClick={() => setMobileMenuOpen(false)}
            aria-label={`Notifications, ${unreadCount} unread`}
            title="Notifications"
            className={({ isActive }) =>
              `relative flex h-10 w-10 items-center justify-center rounded-lg transition ${
                isActive
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-slate-600 hover:bg-slate-100"
              }`
            }
          >
            <Bell size={21} />

            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </NavLink>

          {/* Profile Photo */}
          <ProfileAvatar size="h-9 w-9" />

          {/* Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-slate-700 hover:bg-slate-100"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <X size={24} />
            ) : (
              <Menu size={24} />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="border-t border-slate-200 bg-white px-4 py-4 md:hidden">

          {/* Mobile User Information */}
          <div className="mb-4 flex items-center gap-3 border-b border-slate-200 pb-4">
            <ProfileAvatar size="h-12 w-12" />

            <div>
              <p className="text-sm font-semibold text-slate-800">
                {user?.name || "MoveMate User"}
              </p>

              <p className="text-xs text-slate-500">
                Community member
              </p>
            </div>
          </div>

          {/* Mobile Links */}
          <div className="space-y-2">
            {navLinks.map((link) => {
              const Icon = link.icon;

              return (
                <NavLink
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={linkClass}
                >
                  <Icon size={18} />
                  {link.name}
                </NavLink>
              );
            })}
          </div>

          {/* Mobile Logout */}
          <div className="mt-4 border-t border-slate-200 pt-4">
            <button
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-100"
            >
              <LogOut size={17} />
              Logout
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;
