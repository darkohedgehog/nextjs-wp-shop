const FeatureTitle = ({ children }: { children?: React.ReactNode }) => {
    return (
      <p className=" max-w-5xl mx-auto text-left tracking-tight text-2xl md:text-3xl md:leading-snug secondary-color">
        {children}
      </p>
    );
  };

export default FeatureTitle;