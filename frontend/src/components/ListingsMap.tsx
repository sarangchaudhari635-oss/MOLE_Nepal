"use client";

import React, { useEffect, useRef } from 'react';
import { Listing } from '@/lib/db';
import { getTranslation } from '@/lib/translations';
import { useApp } from '@/context/AppContext';
import { useRouter } from 'next/navigation';
import 'leaflet/dist/leaflet.css';

interface ListingsMapProps {
  listings: Listing[];
  highlightedListingId: string | null;
}

export default function ListingsMap({ listings, highlightedListingId }: ListingsMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<Record<string, any>>({});
  const { language } = useApp();
  const router = useRouter();

  useEffect(() => {
    // Dynamic import Leaflet to run strictly in the browser
    import('leaflet').then((L) => {
      if (!mapContainerRef.current) return;

      // Initialize Map if not already created
      if (!mapInstanceRef.current) {
        mapInstanceRef.current = L.map(mapContainerRef.current, {
          zoomControl: false // Custom zoom control position
        }).setView([27.7172, 85.3240], 12); // Centered on Kathmandu

        // OpenStreetMap tiles (premium light theme representation)
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: 'abcd',
          maxZoom: 20
        }).addTo(mapInstanceRef.current);

        // Zoom control position
        L.control.zoom({
          position: 'bottomright'
        }).addTo(mapInstanceRef.current);
      }

      const map = mapInstanceRef.current;

      // Clear existing markers
      Object.values(markersRef.current).forEach((marker) => {
        map.removeLayer(marker);
      });
      markersRef.current = {};

      // Add pins for listings
      listings.forEach((listing) => {
        const isHighlighted = highlightedListingId === listing.id;

        // Custom div-based icon (resolves default Leaflet icon path issues in Next.js + adds premium UI)
        const customIcon = L.divIcon({
          className: 'custom-map-pin',
          html: `
            <div class="relative group cursor-pointer">
              <div class="absolute -top-1 -left-1 w-8 h-8 rounded-full bg-primary/20 scale-120 animate-ping ${isHighlighted ? 'opacity-100' : 'opacity-0'}"></div>
              <div class="w-6 h-6 flex items-center justify-center rounded-full border-2 border-white shadow-md transition-all duration-200 ${
                isHighlighted 
                  ? 'bg-primary scale-125 ring-4 ring-primary/25' 
                  : 'bg-primary/95 hover:bg-primary hover:scale-110'
              }">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        // Add Marker
        const marker = L.marker([listing.lat, listing.lng], { icon: customIcon }).addTo(map);

        // Popup Content
        const popupContent = document.createElement('div');
        popupContent.className = 'p-2 font-sans text-xs text-[#191c1e] w-48';
        popupContent.innerHTML = `
          <div class="font-bold text-sm mb-1 text-on-surface">${listing.title}</div>
          <div class="flex items-center justify-between text-on-surface-variant mb-2">
            <span>${getTranslation(language, 'quantity')}: <strong>${listing.quantity_kg} kg</strong></span>
            <span class="capitalize font-semibold">${listing.neighborhood.split(' ')[0]}</span>
          </div>
          <div class="flex justify-between items-center border-t border-outline-variant/30 pt-2 mt-1.5">
            <span class="text-primary font-bold">Rs. ${listing.price_npr_min}-${listing.price_npr_max}/kg</span>
            <button class="bg-primary text-on-primary px-2.5 py-1 rounded text-[10px] font-bold hover:opacity-90 transition-all cursor-pointer view-details-btn">
              ${language === 'en' ? 'Details' : 'विवरण'}
            </button>
          </div>
        `;

        // Click handler inside popup
        popupContent.querySelector('.view-details-btn')?.addEventListener('click', (e) => {
          e.preventDefault();
          router.push(`/listings/${listing.id}`);
        });

        marker.bindPopup(popupContent);
        markersRef.current[listing.id] = marker;

        // Click marker centers map
        marker.on('click', () => {
          map.panTo([listing.lat, listing.lng]);
        });
      });

      // Pan to highlighted listing
      if (highlightedListingId && markersRef.current[highlightedListingId]) {
        const marker = markersRef.current[highlightedListingId];
        const listing = listings.find(l => l.id === highlightedListingId);
        if (listing) {
          map.setView([listing.lat, listing.lng], 14);
          marker.openPopup();
        }
      }
    });
  }, [listings, highlightedListingId, language, router]);

  return (
    <div className="relative w-full h-full min-h-[400px] bg-surface-container rounded-2xl border border-outline-variant/30 overflow-hidden card-shadow">
      <div ref={mapContainerRef} className="w-full h-full" style={{ height: '100%', minHeight: '400px' }} />
    </div>
  );
}
