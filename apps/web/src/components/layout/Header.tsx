import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { animate, stagger } from 'animejs';
import {
  COMPANY,
  COMPANY_PAGES,
  HARD_SERVICES,
  SOFT_SERVICES,
  INDUSTRIES,
  PACKAGES_PAGE,
  type NavItem,
} from '@atlas-south/shared';
import { Icon, useAnimationScope, DURATION, EASE, STAGGER_GAP } from '@atlas-south/design-system';

interface DropdownProps {
  label: string;
  items: NavItem[];
}

/** One dropdown per docs/build/02-ANIMATION-SYSTEM.md "Header nav dropdown" row. */
function NavDropdown({ label, items }: DropdownProps) {
  const [open, setOpen] = useState(false);

  const root = useAnimationScope((self) => {
    self?.add('open', () => {
      animate('.dropdown-panel', {
        opacity: [0, 1],
        translateY: [-8, 0],
        duration: DURATION.base,
        ease: EASE.standard,
      });
      animate('.dropdown-item', {
        opacity: [0, 1],
        translateY: [8, 0],
        delay: stagger(STAGGER_GAP),
        duration: DURATION.base,
        ease: EASE.standard,
      });
    });
  }, []);

  return (
    <div
      ref={root}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        className="flex min-h-[44px] items-center gap-1 px-3 text-sm font-semibold uppercase tracking-wide text-navy hover:text-accent-blue"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((v) => !v)}
      >
        {label}
        <Icon name="chevron-down" size={16} />
      </button>
      {open && (
        <nav
          aria-label={`${label} submenu`}
          className="dropdown-panel absolute left-0 top-full z-20 min-w-[260px] rounded-md border border-border bg-canvas p-2 shadow-lg"
        >
          {items.map((item) => (
            <Link
              key={item.id}
              to={item.path}
              className="dropdown-item flex min-h-[44px] items-center gap-3 rounded px-3 py-2 text-sm text-slate hover:bg-canvas-tint hover:text-accent-blue"
            >
              <Icon name={item.icon} size={18} />
              {item.label}
              {item.placeholder && (
                <span className="ml-auto rounded-full bg-canvas-tint px-2 py-0.5 text-[10px] uppercase text-slate">
                  Coming soon
                </span>
              )}
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const mobileRoot = useAnimationScope((self) => {
    self?.add('openDrawer', () => {
      animate('.mobile-drawer', {
        translateX: ['100%', '0%'],
        duration: DURATION.base,
        ease: EASE.emphasis,
      });
      animate('.mobile-drawer-item', {
        opacity: [0, 1],
        translateY: [8, 0],
        delay: stagger(STAGGER_GAP),
        duration: DURATION.base,
      });
    });
  }, []);

  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <header className="sticky top-0 z-30 border-b border-border bg-canvas/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <img
              src="/atlas-south-logo.jpg"
              alt="Atlas South Technical Services"
              className="h-9 w-auto"
            />
          </Link>

          <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
            <NavDropdown label="Company" items={COMPANY_PAGES} />
            <NavDropdown label="Hard Services" items={HARD_SERVICES} />
            <NavDropdown label="Soft Services" items={SOFT_SERVICES} />
            <NavDropdown label="Industries" items={INDUSTRIES} />
            <NavLink
              to={PACKAGES_PAGE.path}
              className="flex min-h-[44px] items-center px-3 text-sm font-semibold uppercase tracking-wide text-navy hover:text-accent-blue"
            >
              {PACKAGES_PAGE.label}
            </NavLink>
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            <a
              href={`tel:${COMPANY.phone.tel}`}
              className="flex min-h-[44px] items-center gap-2 rounded px-3 text-sm font-semibold text-navy hover:text-accent-blue"
            >
              <Icon name="phone" size={18} />
              Call Us
            </a>
            <Link
              to="/company/contact"
              className="flex min-h-[44px] items-center rounded bg-accent-blue px-4 text-sm font-semibold uppercase tracking-wide text-white hover:bg-navy"
            >
              Contact Us
            </Link>
          </div>

          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center lg:hidden"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
          >
            <Icon name={mobileOpen ? 'x' : 'menu'} size={24} />
          </button>
        </div>
      </header>

      {mobileOpen && (
        <div ref={mobileRoot} className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-navy/60"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <nav
            aria-label="Mobile"
            className="mobile-drawer absolute right-0 top-0 h-full w-80 max-w-full overflow-y-auto bg-canvas p-6"
          >
            {[...COMPANY_PAGES, ...HARD_SERVICES, ...SOFT_SERVICES, ...INDUSTRIES, PACKAGES_PAGE].map(
              (item) => (
                <Link
                  key={item.id}
                  to={item.path}
                  className="mobile-drawer-item flex min-h-[44px] items-center gap-3 border-b border-border py-3 text-navy"
                  onClick={() => setMobileOpen(false)}
                >
                  <Icon name={item.icon} size={18} />
                  {item.label}
                </Link>
              ),
            )}
            <a
              href={`tel:${COMPANY.phone.tel}`}
              className="mobile-drawer-item mt-4 flex min-h-[44px] items-center justify-center gap-2 rounded bg-accent-blue font-semibold text-white"
            >
              <Icon name="phone" size={18} />
              Call {COMPANY.phone.display}
            </a>
          </nav>
        </div>
      )}
    </>
  );
}
