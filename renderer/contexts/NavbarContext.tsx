import { createContext, type PropsWithChildren, useContext } from "react";

type NavbarContextType = {
  toggleNavbar: () => void; // Is this the best type?
};

type NavbarProvideProps = NavbarContextType & PropsWithChildren;

const NavbarContext = createContext<NavbarContextType | undefined>(undefined);

export const NavbarProvider = ({
  children,
  toggleNavbar,
}: NavbarProvideProps) => {
  return (
    <NavbarContext.Provider value={{ toggleNavbar }}>
      {children}
    </NavbarContext.Provider>
  );
};

export const useNavbar = () => {
  const context = useContext(NavbarContext);

  if (!context) {
    throw new Error("useNavbar must be used within a NavbarProvider");
  }

  return context;
};
