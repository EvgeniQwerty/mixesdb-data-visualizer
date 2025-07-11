import { motion } from 'framer-motion';

const Header = () => {
  return (
    <motion.header 
      className="mb-8 text-center"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-4xl font-bold mb-2 text-primary">MixesDB Label Visualizer</h1>
      <p className="text-lg text-text/80">
        Explore music labels and their appearances in DJ mixes
      </p>
    </motion.header>
  );
};

export default Header;