
import { Link } from "react-router-dom";
import {
  Search,
  CalendarCheck,
  CarFront,
  Map,
  Handshake,
  ArrowRight,
  UserRound,
  Users,
  BriefcaseBusiness,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

function Dashboard() {
  const { user } = useAuth();

  const features = [
    {
      title: "Find a Ride",
      description:
        "Discover available rides and travel with people going your way.",
      icon: Search,
      path: "/rides",
      color: "bg-blue-100 text-blue-600",
      available: true,
      action: "Explore rides",
    },
    {
      title: "My Bookings",
      description:
        "Track your booking requests, approvals and cancellations.",
      icon: CalendarCheck,
      path: "/my-bookings",
      color: "bg-emerald-100 text-emerald-600",
      available: true,
      action: "View bookings",
    },
    {
      title: "Offer a Ride",
      description:
        "Share your journey and help others travel more affordably.",
      icon: CarFront,
      path: "/rides",
      color: "bg-violet-100 text-violet-600",
      available: true,
      action: "Create a ride",
    },
    {
      title: "Plan a Trip",
      description:
        "Organize future journeys with your community.",
      icon: Map,
      path: null,
      color: "bg-amber-100 text-amber-600",
      available: false,
      action: "Coming soon",
    },
    {
      title: "Share a Cab",
      description:
        "Find people to share cab journeys and travel costs.",
      icon: Users,
      path: null,
      color: "bg-cyan-100 text-cyan-600",
      available: false,
      action: "Coming soon",
    },
    {
      title: "Barter Marketplace",
      description:
        "Exchange useful services and skills within your community.",
      icon: Handshake,
      path: "/marketplace",
      color: "bg-pink-100 text-pink-600",
      available: true,
      action: "Explore marketplace",
    },
    {
      title: "My Services",
      description:
        "View, edit and manage the services you offer to your community.",
      icon: BriefcaseBusiness,
      path: "/my-services",
      color: "bg-emerald-100 text-emerald-600",
      available: true,
      action: "Manage my services",
    },
    {
      title: "My Rides",
      description: "View, edit and manage the rides you have offered.",
      icon: CarFront,
      path: "/my-rides",
      color: "bg-violet-100 text-violet-600",
      available: true,
      action: "Manage my rides",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* Welcome Section */}
        <section className="mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-slate-950 to-emerald-900 p-6 text-white shadow-lg sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <p className="text-sm font-medium text-emerald-300">
                YOUR COMMUNITY MOBILITY HUB
              </p>

              <h1 className="mt-3 text-3xl font-extrabold sm:text-4xl">
                Welcome, {user?.name || "MoveMate User"}!
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
                Find your next ride, share your journey and connect
                with people in your community.
              </p>

              <Link
                to="/rides"
                className="mt-6 inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-5 py-3 font-semibold text-white transition hover:bg-emerald-600"
              >
                Explore Rides
                <ArrowRight size={18} />
              </Link>
            </div>

            <div className="hidden h-28 w-28 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-400/10 sm:flex">
              <CarFront size={58} className="text-emerald-300" />
            </div>
          </div>
        </section>

        {/* Quick Information */}
        <section className="mb-8 grid gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="rounded-xl bg-blue-100 p-3 text-blue-600">
              <UserRound size={25} />
            </div>

            <div>
              <p className="text-sm text-slate-500">
                Logged in as
              </p>
              <p className="font-bold text-slate-900">
                {user?.name || "MoveMate User"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="rounded-xl bg-emerald-100 p-3 text-emerald-600">
              <Handshake size={25} />
            </div>

            <div>
              <p className="text-sm text-slate-500">
                Community
              </p>
              <p className="font-bold text-slate-900">
                {user?.community || "Community member"}
              </p>
            </div>
          </div>
        </section>

        {/* Features Heading */}
        <section>
          <div className="mb-5">
            <h2 className="text-2xl font-bold text-slate-900">
              Explore MoveMate
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Choose what you'd like to do today.
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;

              const cardContent = (
                <div className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md">
                  <div className="flex items-center justify-between">
                    <div className={`rounded-xl p-3 ${feature.color}`}>
                      <Icon size={25} />
                    </div>

                    {!feature.available && (
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
                        Coming soon
                      </span>
                    )}
                  </div>

                  <h3 className="mt-5 text-lg font-bold text-slate-900">
                    {feature.title}
                  </h3>

                  <p className="mt-2 flex-1 text-sm leading-6 text-slate-500">
                    {feature.description}
                  </p>

                  <div className={`mt-5 flex items-center gap-2 text-sm font-semibold ${
                    feature.available
                      ? "text-emerald-600"
                      : "text-slate-400"
                  }`}>
                    {feature.action}

                    {feature.available && (
                      <ArrowRight size={17} />
                    )}
                  </div>
                </div>
              );

              return feature.available ? (
                <Link
                  key={feature.title}
                  to={feature.path}
                  className="block"
                >
                  {cardContent}
                </Link>
              ) : (
                <div key={feature.title}>
                  {cardContent}
                </div>
              );
            })}
          </div>
        </section>

        {/* Footer Message */}
        <footer className="mt-10 border-t border-slate-200 py-6 text-center">
          <p className="text-sm font-semibold text-slate-700">
            MoveMate — Travel Together. Share Smartly. Help Each Other.
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Building smarter mobility through community connections.
          </p>
        </footer>

      </div>
    </div>
  );
}

export default Dashboard;
