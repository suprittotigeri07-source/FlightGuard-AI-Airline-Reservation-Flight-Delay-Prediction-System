import React from 'react';
import { Link } from 'react-router-dom';
import { Plane } from 'lucide-react';
import { footerColumns } from '../../features/landing/data';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#1a2e38] text-gray-300" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12 py-14 lg:py-16">
          {/* Brand Column */}
          <div className="col-span-2 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 bg-brand rounded-lg flex items-center justify-center" aria-hidden="true">
                <Plane className="w-4 h-4 text-white" />
              </div>
              <span className="font-serif text-xl text-white">FlightGuard AI</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              Smarter Flights. Safer Journeys.
            </p>
            <p className="text-xs text-gray-500 leading-relaxed">
              Intelligent airline reservation system with machine learning delay prediction and real-time aviation intelligence.
            </p>
          </div>

          {/* Link Columns */}
          {footerColumns.map((column) => (
            <div key={column.title}>
              <h4 className="text-white font-semibold text-xs mb-4 uppercase tracking-wider">
                {column.title}
              </h4>
              <ul className="space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    {link.href.startsWith('/') ? (
                      <Link
                        to={link.href}
                        className="text-sm text-gray-400 hover:text-white transition-colors"
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <a
                        href={link.href}
                        className="text-sm text-gray-400 hover:text-white transition-colors"
                      >
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} FlightGuard AI. All rights reserved.
          </p>
          <p className="text-xs text-gray-500">
            Built with precision for smarter aviation ✈
          </p>
        </div>
      </div>
    </footer>
  );
};
