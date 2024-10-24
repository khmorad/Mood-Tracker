declare module 'react-typer' {
    const Typer: React.FC<{
      words: string[];
      charDelay?: number;
      wordDelay?: number;
      repeat?: boolean;
      eraseDelay?: number;
    }>;
    export default Typer;
  }
  