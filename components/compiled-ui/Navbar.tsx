import { cn } from "@/lib/utils";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "../ui/navigation-menu";

type NavbarConfigProps = {
  title: string;
  href: string;
  description?: string;
  reverted?: boolean;
};

const navbarConfig: NavbarConfigProps[] = [
  {
    title: "Timer",
    href: "/timer",
  },
  {
    title: "Tasks",
    href: "/tasks",
  },
  {
    title: "Sign in",
    href: "/login",
  },
  {
    title: "Sign up",
    href: "/register",
    reverted: true,
  },
];

export default function Navbar() {
  return (
    <div className="flex sticky top-0 w-full p-4">
      <NavigationMenu className="mx-auto h-max bg-foreground rounded-lg text-background p-2">
        <NavigationMenuList>
          {navbarConfig.map((item, index) => {
            return (
              <NavigationMenuItem key={index}>
                <NavigationMenuLink
                  className={cn(
                    "font-semibold",
                    item.reverted &&
                      "hover:bg-foreground bg-background hover:text-background text-foreground",
                  )}
                  href={item.href}
                >
                  {item.title}
                </NavigationMenuLink>
              </NavigationMenuItem>
            );
          })}
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  );
}
