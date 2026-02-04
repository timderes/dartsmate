import { createContext, type PropsWithChildren, useContext } from "react";

type NavbarContextType = {
  toggleNavbar: () => void; // Is this the best type?
};

type NavbarProviderProps = NavbarContextType & PropsWithChildren;

const NavbarContext = createContext<NavbarContextType | undefined>(undefined);

/**
 * Provides the Navbar context to its children, allowing them to access the
 * `toggleNavbar` function.
 */
export const NavbarProvider = ({
  children,
  toggleNavbar,
}: NavbarProviderProps) => {
  return (
    <NavbarContext.Provider value={{ toggleNavbar }}>
      {children}
    </NavbarContext.Provider>
  );
};

/**
 * Hook to access the Navbar context.
 *
 * Must be used within a {@link NavbarProvider}. Returns the Navbar context
 * value, including the {@link NavbarContextType.toggleNavbar} function.
 */
export const useNavbar = () => {
  const context = useContext(NavbarContext);

  if (!context) {
    throw new Error("useNavbar must be used within a NavbarProvider");
  }

  return context;
};
