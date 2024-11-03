'use client';

import React from 'react';
import { ChevronDownIcon, MenuIcon } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuContent,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';


type NavmenuItem = {
  text: string;
  // Atleast one of href or subGroups must be provided, im not enforcing it because types become hard to read
  href?: string;
  subGroups?: SubmenuGroup[];
};

type SubmenuGroup = {
  // For desktop nav, if title is absent then the title element will be omitted.
  // The title will **not** be omitted if this is an empty string.
  // For the mobile nav, if title is absent or empty then the items will not be put into a collapsible.
  title?: string;
  items: SubmenuItem[];
  // (Default 150) Group width in px for when rendering on desktop
  width?: number;
};

type SubmenuItem = {
  text: string;
  subText?: string;
  href: string;
  hideOnMobile?: boolean;
  hideOnDesktop?: boolean;
};

const navmenuItems: NavmenuItem[] = [
  { text: 'Home', href: '/' },
  {
    text: 'Services',
    href: '/services',
    subGroups: [
      { 
        width: 250,
        items: [
          { text: 'Generate Masked Aadhaar', href: '/learn_masked_aadhaar' },
          { text: 'Authenticate using VID', href: '/learn_auth_vid' },
        ],
      },
    ],
  },
  { text: 'Signup', href: '/signup' },
  { text: 'Login', href: '/login' },
  { text: 'Logout', href: '/logout' },
];

function onNavChange() {
  setTimeout(() => {
    const triggers = document.querySelectorAll(
      ".submenu-trigger[data-state='open']"
    );
    const dropdowns = document.querySelectorAll(
      ".nav-viewport[data-state='open']"
    );

    if (!triggers.length || !dropdowns.length) return;

    const { offsetLeft, offsetWidth } = triggers[0] as HTMLElement;
    let menuLeftPosition =
      offsetLeft + offsetWidth / 2 - triggers[0].clientWidth / 2;

    document.documentElement.style.setProperty(
      '--menu-left-position',
      `${menuLeftPosition}px`
    );
  }, 0);
}

function Header() {
  return (
    <header className="flex flex-col w-full h-fit bg-black">
      <div className="flex flex-row lg:flex-row items-center justify-start border-b border-dwd-secondary1 relative h-16 lg:h-24">
        <Link href="/" className="block h-full">
          {/* Big screen image */}
          <Image
            src="/brand/logo_3.png"
            width={427}
            height={95}
            sizes="100%"
            style={{ height: '100%', width: 'auto' }}
            alt="HashGuard Logo"
            className="block lg:hidden xl:block mr-auto"
            priority
          />
          {/* Medium screen logo */}
          <Image
            src="/brand/logo-square-light.png"
            width={0}
            height={0}
            sizes="100%"
            style={{ height: '100%', width: 'auto' }}
            alt="IIIT Dharwad Logo"
            className="hidden lg:block xl:hidden mr-auto"
            priority
          />
        </Link>

        {/* Mobile navbar */}
        <Sheet>
          <SheetTrigger asChild>
            <div className="ml-auto mr-4 lg:hidden">
              <MenuIcon size="2rem" />
            </div>
          </SheetTrigger>
          <SheetContent side="left">
            <div className="flex flex-col gap-2 mt-4 -mr-2 ">
              {navmenuItems.map((item) => {
                const dropdownTrigger = item.href ? (
                  <SheetClose key={item.text} asChild>
                    <Link
                      key={item.text}
                      className="hover:underline text-2xl"
                      href={item.href}
                    >
                      {item.text}
                    </Link>
                  </SheetClose>
                ) : (
                  <div>{item.text}</div>
                );

                if (!item?.subGroups?.length) return dropdownTrigger;

                return (
                  <details key={item.text} className="group text-lg">
                    <summary className="flex items-center justify-between focus:outline-none">
                      {dropdownTrigger}
                      <ChevronDownIcon
                        size="1rem"
                        className="rotate-0 group-open:rotate-180 transition-transform duration-300"
                      />
                    </summary>
                    <div className="mt-2 ml-2 pl-6 flex flex-col gap-2 border-l border-l-gray-200">
                      {item.subGroups.map((group) =>
                        !group.title ? (
                          group.items
                            .filter((gItem) => !gItem.hideOnMobile)
                            .map((gItem) => (
                              <SheetClose key={gItem.text} asChild>
                                <Link
                                  key={gItem.text}
                                  href={gItem.href}
                                  className="hover:underline"
                                >
                                  {gItem.text}
                                </Link>
                              </SheetClose>
                            ))
                        ) : (
                          <details key={group.title} className="group/sub">
                            <summary className="flex items-center justify-between focus:outline-none">
                              {group.title}
                              <ChevronDownIcon
                                size="1rem"
                                className="rotate-0 group-open/sub:rotate-180 transition-transform duration-300"
                              />
                            </summary>
                            <div className="mt-2 ml-2 pl-6 flex flex-col gap-2 border-l border-l-gray-200">
                              {group.items
                                .filter((gItem) => !gItem.hideOnMobile)
                                .map((gItem) => (
                                  <SheetClose key={gItem.text} asChild>
                                    <Link
                                      key={gItem.text}
                                      href={gItem.href}
                                      className="hover:underline"
                                    >
                                      {gItem.text}
                                    </Link>
                                  </SheetClose>
                                ))}
                            </div>
                          </details>
                        )
                      )}
                    </div>
                  </details>
                );
              })}
            </div>
          </SheetContent>
        </Sheet>

        {/* Desktop navbar */}
        <NavigationMenu
          onValueChange={onNavChange}
          className="ml-auto hidden lg:flex items-center justify-center mr-4 gap-8"
        >
          <NavigationMenuList>
            {navmenuItems.map((item) => {
              if (!item?.subGroups?.length)
                return (
                  <NavigationMenuItem key={item.text}>
                    <NavigationMenuLink
                      asChild
                      className={navigationMenuTriggerStyle()}
                    >
                      <Link href={item.href!}>
                        <div className="hover:bg-accent p-2 rounded-md w-full">
                          {item.text}
                        </div>
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                );

              let groupWidthSum = 0;
              for (let i = 0; i < item.subGroups.length; i++) {
                groupWidthSum += item.subGroups[i].width || 150;
              }

              return (
                <NavigationMenuItem key={item.text}>
                  <NavigationMenuTrigger className="submenu-trigger">
                    {!item.href ? (
                      item.text
                    ) : (
                      <NavigationMenuLink asChild>
                        <Link href={item.href!}>
                          <div>{item.text}</div>
                        </Link>
                      </NavigationMenuLink>
                    )}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul
                      className="flex gap-4 p-4 text-sm"
                      style={{ width: `${groupWidthSum}px` }}
                    >
                      {item.subGroups.map((group, i) => (
                        <div
                          key={i}
                          className="flex flex-col"
                          style={{ width: `${group.width || 150}px` }}
                        >
                          {group.title !== undefined && (
                            <h3
                              className={
                                'font-bold underline p-2 text-sm ' +
                                (group.title ? '' : 'invisible')
                              }
                            >
                              {group.title || '_'}
                            </h3>
                          )}
                          {group.items
                            .filter((gItem) => !gItem.hideOnDesktop)
                            .map((gItem) => (
                              <NavigationMenuLink
                                key={gItem.text}
                                href={gItem.href}
                              >
                                <div className="flex flex-col hover:bg-accent p-2 rounded-md w-full">
                                  {gItem.text}
                                  {gItem.subText && (
                                    <div className="text-dwd-secondary2 text-xs">
                                      {gItem.subText}
                                    </div>
                                  )}
                                </div>
                              </NavigationMenuLink>
                            ))}
                        </div>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              );
            })}
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </header>
  );
}

export default Header;
