import React from 'react';
import { GameIcon, NAV_ICONS } from '@/lib/icons';

export default function StyleguideBoard() {
  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto" style={{ background: 'var(--void-bg-primary)' }}>
      {/* ══════════════════════════════════════════════════════════════
          HEADER SECTION
          ══════════════════════════════════════════════════════════════ */}
      <div className="border rounded-3xl p-8" style={{ borderColor: 'rgba(0,243,255,0.2)', background: 'rgba(0,243,255,0.03)' }}>
        <h1 className="font-display text-4xl font-bold tracking-widest mb-2 neon-cyan">
          NEO-SKEUOMORPHIC TACTILE SYSTEM
        </h1>
        <p className="font-game text-sm tracking-widest" style={{ color: 'var(--void-text-secondary)' }}>
          STYLEGUIDE BOARD
        </p>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          FOUNDATIONS SECTION
          ══════════════════════════════════════════════════════════════ */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Surface Tokens */}
        <div>
          <h2 className="font-display text-xl font-bold tracking-widest mb-4" style={{ color: 'var(--void-text-primary)' }}>
            FOUNDATIONS
          </h2>
          <h3 className="font-game text-xs tracking-wider mb-4" style={{ color: 'var(--void-text-secondary)' }}>
            SURFACE TOKENS
          </h3>
          <div className="space-y-3">
            {[
              { name: 'Base', desc: 'Scaled 4, Offset Mar 4, Color #1d2b37' },
              { name: 'Raised', desc: 'Scaled 8, Offset Mar 8, Color #2a3d4f' },
              { name: 'Inset', desc: 'Scaled 1/2, Mar 4, Color #0d1a24' },
              { name: 'Pressed', desc: 'Scaled 2, Offset Mar 8, Color #1a2d37' },
            ].map((token, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-12 h-12 rounded-lg flex-shrink-0" style={{
                  background: ['#2a3d4f', '#3d4f5f', '#1a2d37', '#1d2b37'][i],
                  border: '1px solid rgba(0,243,255,0.1)',
                }} />
                <div>
                  <p className="font-game text-xs font-bold" style={{ color: 'var(--void-text-primary)' }}>{token.name}</p>
                  <p className="font-game text-xs mt-1" style={{ color: 'var(--void-text-muted)' }}>{token.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div>
          <h2 className="font-display text-xl font-bold tracking-widest mb-4" style={{ color: 'var(--void-text-primary)' }}>
            CONTROLS
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-game text-xs tracking-wider mb-3" style={{ color: 'var(--void-text-secondary)' }}>
                BUTTONS
              </h3>
              <div className="space-y-2">
                <button className="w-full py-3 px-4 rounded-2xl font-game text-xs font-bold tracking-wider" style={{
                  background: 'linear-gradient(135deg, #c96a36, #a85a2a)',
                  color: '#fff',
                  border: '1px solid rgba(255,165,0,0.3)',
                }}>
                  Submit
                </button>
                <button className="w-full py-3 px-4 rounded-2xl font-game text-xs font-bold tracking-wider" style={{
                  background: 'linear-gradient(135deg, #c96a36, #a85a2a)',
                  color: '#fff',
                  opacity: 0.7,
                  border: '1px solid rgba(255,165,0,0.3)',
                }}>
                  Pressed
                </button>
                <button className="w-full py-3 px-4 rounded-2xl font-game text-xs font-bold tracking-wider" style={{
                  background: 'rgba(100,100,100,0.4)',
                  color: 'rgba(255,255,255,0.4)',
                  border: '1px solid rgba(100,100,100,0.3)',
                  cursor: 'not-allowed',
                }}>
                  Disabled
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          ELEVATION & STYLING
          ══════════════════════════════════════════════════════════════ */}
      <div className="grid md:grid-cols-3 gap-8">
        {/* Elevation Levels */}
        <div>
          <h3 className="font-game text-xs tracking-wider mb-4 font-bold" style={{ color: 'var(--void-text-secondary)' }}>
            ELEVATION LEVELS
          </h3>
          <div className="space-y-2 text-xs font-game" style={{ color: 'var(--void-text-muted)' }}>
            <p>Level 1: Subtle Lift</p>
            <p>Level 2: Card Stack</p>
            <p>Level 3: Model Pop-up</p>
            <p>Level 4: Overlay</p>
            <p>Level 5: Highest Priority</p>
          </div>
        </div>

        {/* Border Thickness */}
        <div>
          <h3 className="font-game text-xs tracking-wider mb-4 font-bold" style={{ color: 'var(--void-text-secondary)' }}>
            BORDER THICKNESS
          </h3>
          <div className="space-y-3">
            {[
              { name: 'Thin (1px)', size: 1 },
              { name: 'Medium (2px)', size: 2 },
              { name: 'Thick (3px)', size: 3 },
            ].map((border, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="flex-1 h-12" style={{
                  borderTop: `${border.size}px solid rgba(0,243,255,0.5)`,
                }} />
                <p className="text-xs font-game" style={{ color: 'var(--void-text-muted)' }}>{border.name}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Radius Scale */}
        <div>
          <h3 className="font-game text-xs tracking-wider mb-4 font-bold" style={{ color: 'var(--void-text-secondary)' }}>
            RADIUS SCALE
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { name: 'Small (4px)', size: '4px' },
              { name: 'Medium (8px)', size: '8px' },
              { name: 'Large (16px)', size: '16px' },
              { name: 'Full (32px)', size: '32px' },
            ].map((rad, i) => (
              <div key={i} className="text-center">
                <div
                  className="h-12 mb-2 border"
                  style={{
                    borderRadius: rad.size,
                    borderColor: 'rgba(0,243,255,0.3)',
                    background: 'rgba(0,243,255,0.05)',
                  }}
                />
                <p className="text-xs font-game" style={{ color: 'var(--void-text-muted)' }}>{rad.name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          FORM ELEMENTS
          ══════════════════════════════════════════════════════════════ */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Text Field */}
        <div>
          <h3 className="font-game text-xs tracking-wider mb-4 font-bold" style={{ color: 'var(--void-text-secondary)' }}>
            TEXT FIELD
          </h3>
          <input
            type="email"
            placeholder="Enter your email"
            className="w-full px-4 py-3 rounded-lg border font-game text-sm"
            style={{
              background: 'rgba(13,31,60,0.5)',
              borderColor: 'rgba(0,243,255,0.3)',
              color: 'var(--void-text-primary)',
            }}
          />
          <p className="text-xs font-game mt-2" style={{ color: 'var(--void-text-muted)' }}>We'll never share your email</p>
          <p className="text-xs font-game mt-1" style={{ color: 'rgba(239,68,68,0.7)' }}>Invalid email address</p>
        </div>

        {/* Checkbox, Radio, Switch */}
        <div>
          <h3 className="font-game text-xs tracking-wider mb-4 font-bold" style={{ color: 'var(--void-text-secondary)' }}>
            CHECKBOX, RADIO, SWITCH
          </h3>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-5 h-5 rounded" />
              <span className="text-xs font-game" style={{ color: 'var(--void-text-primary)' }}>Remember me</span>
            </label>
            <div className="w-10 h-6 rounded-full bg-amber-700 relative ml-auto">
              <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-amber-500" />
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          SLIDER & INDICATORS
          ══════════════════════════════════════════════════════════════ */}
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h3 className="font-game text-xs tracking-wider mb-4 font-bold" style={{ color: 'var(--void-text-secondary)' }}>
            SLIDER
          </h3>
          <div className="space-y-2">
            <input type="range" min="0" max="100" defaultValue="75" className="w-full" />
            <p className="text-xs font-game" style={{ color: 'var(--void-text-muted)' }}>Volume: 75%</p>
          </div>
        </div>

        <div>
          <h3 className="font-game text-xs tracking-wider mb-4 font-bold" style={{ color: 'var(--void-text-secondary)' }}>
            ICONOGRAPHY
          </h3>
          <div className="grid grid-cols-5 gap-3">
            {['search', 'settings', 'user', 'heart', 'check'].map((icon, i) => (
              <div key={i} className="flex items-center justify-center h-12 border rounded" style={{
                borderColor: 'rgba(0,243,255,0.2)',
                background: 'rgba(0,243,255,0.05)',
              }}>
                <span style={{ color: 'rgba(201,106,54,0.7)' }}>◉</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          NAVIGATION
          ══════════════════════════════════════════════════════════════ */}
      <div>
        <h2 className="font-display text-xl font-bold tracking-widest mb-4" style={{ color: 'var(--void-text-primary)' }}>
          NAVIGATION
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          {/* Tabs */}
          <div>
            <h3 className="font-game text-xs tracking-wider mb-3 font-bold" style={{ color: 'var(--void-text-secondary)' }}>
              TABS
            </h3>
            <div className="flex border-b" style={{ borderColor: 'rgba(0,243,255,0.1)' }}>
              {['Dashboard', 'Projects', 'Settings'].map((tab, i) => (
                <button key={i} className="px-4 py-2 font-game text-xs font-bold tracking-wider" style={{
                  color: i === 0 ? 'rgba(201,106,54,0.8)' : 'var(--void-text-secondary)',
                  borderBottom: i === 0 ? '2px solid rgba(201,106,54,0.8)' : 'none',
                }}>
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Breadcrumbs */}
          <div>
            <h3 className="font-game text-xs tracking-wider mb-3 font-bold" style={{ color: 'var(--void-text-secondary)' }}>
              BREADCRUMBS
            </h3>
            <div className="flex items-center gap-2 text-xs font-game" style={{ color: 'var(--void-text-muted)' }}>
              <span>Home</span>
              <span>›</span>
              <span>Category</span>
              <span>›</span>
              <span>Sub-category</span>
              <span>›</span>
              <span style={{ color: 'var(--void-text-primary)' }}>Current Page</span>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          PAGINATION
          ══════════════════════════════════════════════════════════════ */}
      <div>
        <h3 className="font-game text-xs tracking-wider mb-4 font-bold" style={{ color: 'var(--void-text-secondary)' }}>
          PAGINATION
        </h3>
        <div className="flex items-center gap-2 justify-center">
          <button className="px-3 py-2 rounded border font-game text-xs" style={{
            borderColor: 'rgba(0,243,255,0.2)',
            color: 'var(--void-text-secondary)',
          }}>
            Previous
          </button>
          {[1, 2, 3].map((n, i) => (
            <button
              key={i}
              className="w-8 h-8 rounded border font-game text-xs font-bold"
              style={{
                background: i === 1 ? 'rgba(201,106,54,0.8)' : 'transparent',
                borderColor: 'rgba(0,243,255,0.2)',
                color: i === 1 ? '#fff' : 'var(--void-text-secondary)',
              }}
            >
              {n}
            </button>
          ))}
          <button className="px-3 py-2 rounded border font-game text-xs" style={{
            borderColor: 'rgba(0,243,255,0.2)',
            color: 'var(--void-text-secondary)',
          }}>
            Next
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          DATA DISPLAY & FEEDBACK
          ══════════════════════════════════════════════════════════════ */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* List Items & Badges */}
        <div>
          <h3 className="font-game text-xs tracking-wider mb-4 font-bold" style={{ color: 'var(--void-text-secondary)' }}>
            LIST ITEMS
          </h3>
          <div className="space-y-2">
            {['List Item', 'List Item', 'List Item'].map((item, i) => (
              <div key={i} className="px-4 py-3 border rounded flex justify-between items-center" style={{
                borderColor: 'rgba(0,243,255,0.15)',
                background: 'rgba(0,243,255,0.03)',
              }}>
                <span className="font-game text-xs" style={{ color: 'var(--void-text-primary)' }}>{item}</span>
                <span className="text-xs">›</span>
              </div>
            ))}
          </div>
        </div>

        {/* Badges */}
        <div>
          <h3 className="font-game text-xs tracking-wider mb-4 font-bold" style={{ color: 'var(--void-text-secondary)' }}>
            BADGES
          </h3>
          <div className="flex gap-2 flex-wrap">
            {[
              { label: 'New', color: 'rgba(239,68,68,0.8)' },
              { label: 'Sale', color: 'rgba(201,106,54,0.8)' },
              { label: 'Popular', color: 'rgba(34,197,94,0.8)' },
            ].map((badge, i) => (
              <span key={i} className="px-2 py-1 rounded-full text-xs font-game font-bold text-white" style={{
                background: badge.color,
              }}>
                {badge.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          FEEDBACK COMPONENTS
          ══════════════════════════════════════════════════════════════ */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Modal */}
        <div>
          <h3 className="font-game text-xs tracking-wider mb-4 font-bold" style={{ color: 'var(--void-text-secondary)' }}>
            MODAL CONFIRMATION
          </h3>
          <div className="border rounded-2xl p-4" style={{
            borderColor: 'rgba(0,243,255,0.15)',
            background: 'rgba(0,0,0,0.3)',
          }}>
            <p className="font-game text-xs font-bold mb-3" style={{ color: 'var(--void-text-primary)' }}>Delete Account?</p>
            <p className="font-game text-xs mb-4" style={{ color: 'var(--void-text-muted)' }}>This action cannot be undone.</p>
            <div className="flex gap-2">
              <button className="flex-1 py-2 px-3 rounded border font-game text-xs" style={{
                borderColor: 'rgba(0,243,255,0.2)',
                color: 'var(--void-text-primary)',
              }}>
                Cancel
              </button>
              <button className="flex-1 py-2 px-3 rounded border font-game text-xs font-bold text-white" style={{
                background: 'rgba(239,68,68,0.7)',
                borderColor: 'rgba(239,68,68,0.3)',
              }}>
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* Toast & Alert */}
        <div className="space-y-4">
          <div>
            <h3 className="font-game text-xs tracking-wider mb-2 font-bold" style={{ color: 'var(--void-text-secondary)' }}>
              TOAST STACK
            </h3>
            {['File Saved', 'Upload Complete', 'New Message'].map((toast, i) => (
              <div key={i} className="flex items-center justify-between px-3 py-2 rounded border mb-2" style={{
                borderColor: 'rgba(0,243,255,0.15)',
                background: 'rgba(0,0,0,0.4)',
              }}>
                <p className="font-game text-xs" style={{ color: 'var(--void-text-primary)' }}>{toast}</p>
                <span className="text-xs">✕</span>
              </div>
            ))}
          </div>
          <div>
            <h3 className="font-game text-xs tracking-wider mb-2 font-bold" style={{ color: 'var(--void-text-secondary)' }}>
              ALERT BANNER
            </h3>
            <div className="px-3 py-2 rounded border flex gap-2" style={{
              borderColor: 'rgba(255,165,0,0.3)',
              background: 'rgba(255,165,0,0.1)',
            }}>
              <span>⚠</span>
              <p className="font-game text-xs" style={{ color: 'var(--void-text-primary)' }}>System maintenance scheduled</p>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          EMPTY STATE & LOADING
          ══════════════════════════════════════════════════════════════ */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Empty State */}
        <div>
          <h3 className="font-game text-xs tracking-wider mb-4 font-bold" style={{ color: 'var(--void-text-secondary)' }}>
            EMPTY STATE
          </h3>
          <div className="border rounded-2xl p-8 text-center" style={{
            borderColor: 'rgba(0,243,255,0.15)',
            background: 'rgba(0,243,255,0.03)',
          }}>
            <p className="text-4xl mb-2">⊗</p>
            <p className="font-game text-xs mb-3" style={{ color: 'var(--void-text-primary)' }}>No Items Found</p>
            <button className="px-3 py-1 text-xs rounded font-game" style={{
              background: 'rgba(0,243,255,0.1)',
              color: 'var(--void-text-secondary)',
              border: '1px solid rgba(0,243,255,0.2)',
            }}>
              Add New Item
            </button>
          </div>
        </div>

        {/* Loading Skeleton */}
        <div>
          <h3 className="font-game text-xs tracking-wider mb-4 font-bold" style={{ color: 'var(--void-text-secondary)' }}>
            SKELETON ROWS
          </h3>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-4 rounded bg-gradient-to-r from-transparent via-gray-600 to-transparent opacity-40" />
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          PROGRESS & MISC
          ══════════════════════════════════════════════════════════════ */}
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h3 className="font-game text-xs tracking-wider mb-4 font-bold" style={{ color: 'var(--void-text-secondary)' }}>
            LINEAR PROGRESS
          </h3>
          <div className="space-y-2">
            <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(0,243,255,0.1)' }}>
              <div className="h-full w-2/3 rounded-full" style={{
                background: 'linear-gradient(90deg, rgba(201,106,54,0.8), rgba(255,165,0,0.6))',
              }} />
            </div>
            <p className="text-xs font-game" style={{ color: 'var(--void-text-muted)' }}>Updating... 65%</p>
          </div>
        </div>

        <div>
          <h3 className="font-game text-xs tracking-wider mb-4 font-bold" style={{ color: 'var(--void-text-secondary)' }}>
            SPINNER
          </h3>
          <div className="flex items-center justify-center h-12">
            <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{
              borderColor: 'rgba(0,243,255,0.2)',
              borderTopColor: 'rgba(201,106,54,0.8)',
            }} />
          </div>
        </div>
      </div>

      {/* Bottom padding */}
      <div style={{ height: 100 }} />
    </div>
  );
}
