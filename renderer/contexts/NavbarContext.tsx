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
 * Context type for the Navbar, providing a method to toggle the
 * navbar's open/closed state.
 *
 * @property toggleNavbar - Function to toggle the visibility of the navbar.
 */
export const useNavbar = () => {
  const context = useContext(NavbarContext);

  if (!context) {
    throw new Error("useNavbar must be used within a NavbarProvider");
  }

  return context;
};
