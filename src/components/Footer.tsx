

const Footer = () => {
  return (
    <footer className="border-t border-border py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <h3 className="text-2xl font-bold gradient-text mb-2">Rumpi</h3>
            <p className="text-sm text-muted-foreground">
              Free unlimited AI platform for everyone
            </p>
          </div>
          

        </div>
        
        <div className="mt-8 pt-8 border-t border-border text-center">
          <p className="text-sm text-muted-foreground">
            © 2025 Rumpi Entertainment
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
