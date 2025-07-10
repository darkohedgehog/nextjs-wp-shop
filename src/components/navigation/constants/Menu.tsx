export const Menu = ({
    setActive,
    children,
  }: {
    setActive: (item: string | null) => void;
    children: React.ReactNode;
  }) => {
    return (
      <nav
        onMouseLeave={() => setActive(null)} // resets the state
        className="relative flex justify-center space-x-4 rounded-full glass-primary px-4 py-3"
      >
        {children}
      </nav>
    );
  };